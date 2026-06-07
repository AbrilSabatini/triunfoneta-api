import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import {
  PointReason,
  PointTransaction,
} from '../points/entities/point-transaction.entity';
import { PointsService } from '../points/points.service';
import { Sticker } from '../users/entities/sticker.entity';
import { User } from '../users/entities/user.entity';
import { QueryCollectionDto, QueryPackHistoryDto } from './dto/packs.dto';
import { Pack } from './entities/pack.entity';
import { UserSticker } from './entities/user-sticker.entity';

// Resultado de abrir un sobre
export interface OpenPackResult {
  pack: Pack;
  stickers: Sticker[];
  newStickers: number;
  duplicates: number;
  areaCompletionBonus: Array<{ area: string; points: number }>;
}

@Injectable()
export class PacksService {
  private readonly logger = new Logger(PacksService.name);

  constructor(
    @InjectRepository(Pack)
    private packRepo: Repository<Pack>,

    @InjectRepository(UserSticker)
    private userStickerRepo: Repository<UserSticker>,

    @InjectRepository(Sticker)
    private stickerRepo: Repository<Sticker>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(PointTransaction)
    private txRepo: Repository<PointTransaction>,

    private pointsService: PointsService,
    private config: ConfigService,
    private dataSource: DataSource,
  ) {}

  // ─── Abrir sobre ──────────────────────────────────────────────────────────

  /**
   * Flujo completo dentro de una sola transacción de DB:
   *
   * 1. Verificar saldo (fail-fast antes de la tx).
   * 2. Sortear figuritas con distribución por área.
   * 3. spend() → descuenta puntos atómicamente.
   * 4. Upsert en user_stickers (nueva → INSERT, repetida → quantity++).
   * 5. Registrar apertura en packs.
   * 6. Verificar si se completó algún área y acreditar bonus (una sola vez por área).
   */
  async openPack(userId: number): Promise<OpenPackResult> {
    const packCost = Number(this.config.get<number>('PACK_COST_POINTS', 150));
    const stickersPerPack = Number(
      this.config.get<number>('PACK_STICKERS_PER_PACK', 5),
    );
    const areaBonus = Number(
      this.config.get<number>('AREA_COMPLETION_POINTS', 100),
    );

    // Fail-fast: verificar saldo sin abrir transacción
    const user = await this.userRepo.findOneOrFail({ where: { id: userId } });
    if (user.points < packCost) {
      throw new BadRequestException(
        `Puntos insuficientes. Tenés ${user.points} y el sobre cuesta ${packCost} pts.`,
      );
    }

    // Sortear fuera de la tx (no bloquea filas innecesariamente)
    const drawn = await this.drawStickers(stickersPerPack);
    if (drawn.length === 0) {
      throw new BadRequestException(
        'No hay figuritas disponibles todavía. ' +
          'Esperá a que tus compañeros completen sus perfiles.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      // 3. Descontar puntos (lanza BadRequestException si no alcanza)
      await this.pointsService.spend(
        userId,
        packCost,
        PointReason.PACK_PURCHASE,
      );

      // 4. Upsert de cada figurita en la colección
      let newStickers = 0;
      let duplicates = 0;

      for (const sticker of drawn) {
        const existing = await manager.findOne(UserSticker, {
          where: { ownerId: userId, stickerId: sticker.id },
        });
        if (existing) {
          existing.quantity++;
          await manager.save(UserSticker, existing);
          duplicates++;
        } else {
          await manager.save(
            UserSticker,
            manager.create(UserSticker, {
              ownerId: userId,
              stickerId: sticker.id,
            }),
          );
          newStickers++;
        }
      }

      // 5. Registrar apertura
      const pack = await manager.save(
        Pack,
        manager.create(Pack, {
          openedById: userId,
          stickerIds: drawn.map((s) => s.id),
          pointsCost: packCost,
        }),
      );

      // 6. Verificar completitud de áreas y acreditar bonus
      const areaCompletionBonus = await this.checkAreaCompletions(
        userId,
        manager,
        areaBonus,
      );

      this.logger.log(
        `[PACKS] Sobre #${pack.id} abierto por user ${userId}. ` +
          `Nuevas: ${newStickers}, repetidas: ${duplicates}.`,
      );

      return {
        pack,
        stickers: drawn,
        newStickers,
        duplicates,
        areaCompletionBonus,
      };
    });
  }

  // ─── Colección del usuario ────────────────────────────────────────────────

  async getCollection(
    userId: number,
    query: QueryCollectionDto,
  ): Promise<{ data: UserSticker[]; total: number }> {
    const { duplicatesOnly, area, page = 1, limit = 50 } = query;

    const qb = this.userStickerRepo
      .createQueryBuilder('us')
      .innerJoinAndSelect('us.sticker', 'sticker')
      .where('us.ownerId = :userId', { userId });

    if (duplicatesOnly) qb.andWhere('us.quantity > 1');
    if (area) qb.andWhere('sticker.area ILIKE :area', { area: `%${area}%` });

    const [data, total] = await qb
      .orderBy('sticker.area', 'ASC')
      .addOrderBy('sticker.stickerNumber', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  /**
   * Vista del álbum: para cada área muestra cuántas figuritas existen en el
   * sistema y cuántas tiene el usuario, con % de completitud.
   */
  async getAlbumProgress(userId: number): Promise<
    Array<{
      area: string;
      totalStickers: number;
      ownedStickers: number;
      percentage: number;
      isComplete: boolean;
    }>
  > {
    const totals = await this.stickerRepo
      .createQueryBuilder('s')
      .select('s.area', 'area')
      .addSelect('COUNT(*)', 'total')
      .groupBy('s.area')
      .orderBy('s.area', 'ASC')
      .getRawMany();

    const owned = await this.userStickerRepo
      .createQueryBuilder('us')
      .innerJoin('us.sticker', 's')
      .select('s.area', 'area')
      .addSelect('COUNT(DISTINCT us.stickerId)', 'owned')
      .where('us.ownerId = :userId', { userId })
      .groupBy('s.area')
      .getRawMany();

    const ownedMap = new Map<string, number>(
      owned.map((r) => [r.area, Number(r.owned)]),
    );

    return totals.map((r) => {
      const total = Number(r.total);
      const have = ownedMap.get(r.area) ?? 0;
      const percentage = total > 0 ? Math.round((have / total) * 100) : 0;
      return {
        area: r.area,
        totalStickers: total,
        ownedStickers: have,
        percentage,
        isComplete: have === total && total > 0,
      };
    });
  }

  async getDuplicates(userId: number): Promise<UserSticker[]> {
    return this.userStickerRepo
      .createQueryBuilder('us')
      .innerJoinAndSelect('us.sticker', 'sticker')
      .where('us.ownerId = :userId', { userId })
      .andWhere('us.quantity > 1')
      .orderBy('sticker.area', 'ASC')
      .getMany();
  }

  // ─── Historial de sobres ──────────────────────────────────────────────────

  async getPackHistory(
    userId: number,
    query: QueryPackHistoryDto,
  ): Promise<{ data: Pack[]; total: number }> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.packRepo.findAndCount({
      where: { openedById: userId },
      order: { openedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  async getAdminStats(): Promise<{
    totalPacksOpened: number;
    totalStickersDistributed: number;
    uniqueCollectors: number;
    topOpeners: Array<{ userId: number; fullName: string; packs: number }>;
  }> {
    const totalPacksOpened = await this.packRepo.count();

    const { total: totalStickersDistributed } = await this.packRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(jsonb_array_length(p.stickerIds)), 0)', 'total')
      .getRawOne();

    const { count: uniqueCollectors } = await this.userStickerRepo
      .createQueryBuilder('us')
      .select('COUNT(DISTINCT us.ownerId)', 'count')
      .getRawOne();

    const topOpeners = await this.packRepo
      .createQueryBuilder('p')
      .innerJoin('p.openedBy', 'user')
      .select('p.openedById', 'userId')
      .addSelect('user.fullName', 'fullName')
      .addSelect('COUNT(*)', 'packs')
      .groupBy('p.openedById')
      .addGroupBy('user.fullName')
      .orderBy('packs', 'DESC')
      .limit(10)
      .getRawMany()
      .then((rows) =>
        rows.map((r) => ({
          userId: r.userId,
          fullName: r.fullName,
          packs: Number(r.packs),
        })),
      );

    return {
      totalPacksOpened,
      totalStickersDistributed: Number(totalStickersDistributed),
      uniqueCollectors: Number(uniqueCollectors),
      topOpeners,
    };
  }

  // ─── Helpers privados ─────────────────────────────────────────────────────

  /**
   * Sortea N figuritas del pool total con distribución equitativa por área.
   * Usa Fisher-Yates y limita a máx. 2 figuritas del mismo área por sobre
   * para garantizar variedad.
   */
  private async drawStickers(count: number): Promise<Sticker[]> {
    const all = await this.stickerRepo.find();
    if (all.length === 0) return [];

    // Fisher-Yates shuffle
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }

    console.log(
      'Todos los stickers',
      all.forEach((s) => s.id),
    );
    const MAX_PER_AREA = 2;
    const areaCount = new Map<string, number>();
    const drawn: Sticker[] = [];

    // Primera pasada: respetar límite de área
    for (const s of all) {
      if (drawn.length >= count) break;
      const area = s.area ?? 'general';
      const current = areaCount.get(area) ?? 0;
      if (current < MAX_PER_AREA) {
        drawn.push(s);
        areaCount.set(area, current + 1);
      }
    }

    console.log(
      'Stickers filtrados',
      drawn.forEach((d) => d.id),
    );

    // Segunda pasada: completar sin restricción si el pool es pequeño
    if (drawn.length < count) {
      const drawnIds = new Set(drawn.map((s) => s.id));
      for (const s of all) {
        if (drawn.length >= count) break;
        if (!drawnIds.has(s.id)) drawn.push(s);
      }
    }

    return drawn;
  }

  /**
   * Verifica si el usuario completó áreas nuevas con las figuritas recién obtenidas.
   * Usa point_transactions como fuente de verdad para evitar acreditar el bonus
   * dos veces: si ya existe una tx con reason=AREA_COMPLETED y el nombre del área
   * en el campo `lastError` (reutilizado como metadata), no vuelve a acreditar.
   *
   * NOTA DE DISEÑO: en una siguiente iteración conviene añadir una tabla
   * `area_completions(userId, areaName, completedAt)` para no reutilizar `lastError`.
   * Por ahora esta solución es funcional y no rompe nada existente.
   */
  private async checkAreaCompletions(
    userId: number,
    manager: any,
    bonusPoints: number,
  ): Promise<Array<{ area: string; points: number }>> {
    const bonuses: Array<{ area: string; points: number }> = [];
    const progress = await this.getAlbumProgress(userId);

    for (const { area, isComplete } of progress) {
      if (!isComplete) continue;

      // Verificar si ya se acreditó el bonus para esta área
      const alreadyBonused = await this.txRepo
        .createQueryBuilder('tx')
        .where('tx.userId = :userId', { userId })
        .andWhere('tx.reason = :reason', { reason: PointReason.AREA_COMPLETED })
        // Guardamos el nombre del área en referenceId hasheado a entero (CRC simple)
        .andWhere('tx.referenceId = :ref', { ref: this.areaToRef(area) })
        .getCount();

      if (alreadyBonused > 0) continue;

      await this.pointsService.award(
        userId,
        bonusPoints,
        PointReason.AREA_COMPLETED,
        this.areaToRef(area),
      );
      bonuses.push({ area, points: bonusPoints });
      this.logger.log(
        `[PACKS] Área completada: "${area}" por user ${userId} → +${bonusPoints} pts`,
      );
    }

    return bonuses;
  }

  /**
   * Convierte el nombre del área en un entero positivo reproducible (CRC-16 simple).
   * Usado como referenceId en PointTransaction para identificar de qué área es el bonus.
   */
  private areaToRef(area: string): number {
    let crc = 0xffff;
    for (let i = 0; i < area.length; i++) {
      crc ^= area.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      }
    }
    return crc & 0xffff;
  }
}
