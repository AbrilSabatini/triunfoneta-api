import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { getAlbumSections } from '../common/utils/album-progress.util';
import { ConfigsService } from '../configs/configs.service';
import { ConfigType } from '../configs/entities/config.entity';
import { PointReason } from '../points/entities/point-transaction.entity';
import { PointsService } from '../points/points.service';
import { Sticker, StickerRarity } from '../users/entities/sticker.entity';
import { User } from '../users/entities/user.entity';
import { QueryCollectionDto, QueryPackHistoryDto } from './dto/packs.dto';
import { AreaCompletion } from './entities/area-completion.entity';
import { Pack } from './entities/pack.entity';
import { UserSticker } from './entities/user-sticker.entity';

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

    @InjectRepository(AreaCompletion)
    private areaCompletionRepo: Repository<AreaCompletion>,

    private pointsService: PointsService,
    private configsService: ConfigsService,
    private dataSource: DataSource,
  ) {}

  async openPack(userId: number): Promise<OpenPackResult> {
    const packCost = await this.configsService.getNumber(
      ConfigType.PACK_COST_POINTS,
    );
    const stickersPerPack = await this.configsService.getNumber(
      ConfigType.PACK_STICKERS_PER_PACK,
    );
    const areaBonus = await this.configsService.getNumber(
      ConfigType.AREA_COMPLETION_POINTS,
    );

    const user = await this.userRepo.findOneOrFail({ where: { id: userId } });
    if (user.points < packCost) {
      throw new BadRequestException(
        `Puntos insuficientes. Tenés ${user.points} y el sobre cuesta ${packCost} pts.`,
      );
    }

    const drawn = await this.drawStickers(stickersPerPack);
    if (drawn.length === 0) {
      throw new BadRequestException(
        'No hay figuritas disponibles todavía. ' +
          'Esperá a que tus compañeros completen sus perfiles.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      await this.pointsService.spend(
        userId,
        packCost,
        PointReason.PACK_PURCHASE,
        undefined,
        manager,
      );

      const { newStickers, duplicates } = await this.batchUpsertStickers(
        manager, userId, drawn,
      );

      const pack = await manager.save(
        Pack,
        manager.create(Pack, {
          openedById: userId,
          stickerIds: drawn.map((s) => s.id),
          pointsCost: packCost,
        }),
      );

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

  async getAlbumProgress(userId: number): Promise<
    Array<{
      area: string;
      totalStickers: number;
      ownedStickers: number;
      percentage: number;
      isComplete: boolean;
    }>
  > {
    return getAlbumSections(userId, this.stickerRepo, this.userStickerRepo);
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
   * Sortea N figuritas con probabilidad ponderada por rareza.
   *
   * Optimización: carga solo IDs por rareza (2 queries livianas),
   * hace el shuffle en memoria sobre los arrays de IDs, y finalmente
   * carga solo las figuritas seleccionadas (1 query).
   *
   * Antes: cargaba TODAS las figuritas completas en memoria con find().
   */
  private async drawStickers(count: number): Promise<Sticker[]> {
    const legendChance = await this.configsService.getNumber(
      ConfigType.PACK_LEGEND_CHANCE,
    );

    const [legendIds, commonIds] = await Promise.all([
      this.stickerRepo
        .find({ where: { rarity: StickerRarity.LEGEND }, select: ['id'] })
        .then((rows) => rows.map((s) => s.id)),
      this.stickerRepo
        .find({ where: { rarity: StickerRarity.COMMON }, select: ['id'] })
        .then((rows) => rows.map((s) => s.id)),
    ]);

    if (legendIds.length === 0 && commonIds.length === 0) return [];

    this.shuffleArray(legendIds);
    this.shuffleArray(commonIds);

    const drawnIds: number[] = [];
    let lIdx = 0;
    let cIdx = 0;

    for (let i = 0; i < count; i++) {
      const roll = Math.random();
      let selectedId: number | null = null;

      if (roll < legendChance && lIdx < legendIds.length) {
        selectedId = legendIds[lIdx++];
      } else if (cIdx < commonIds.length) {
        selectedId = commonIds[cIdx++];
      } else if (lIdx < legendIds.length) {
        selectedId = legendIds[lIdx++];
      }

      if (selectedId !== null) {
        drawnIds.push(selectedId);
      }
    }

    if (drawnIds.length === 0) return [];

    return this.stickerRepo.findBy({ id: In(drawnIds) });
  }

  private shuffleArray<T>(arr: T[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  /**
   * Batch upsert de figuritas: reemplaza el loop N+1 anterior con
   * 1 query de búsqueda + 1 batch save.
   */
  private async batchUpsertStickers(
    manager: any,
    userId: number,
    drawn: Sticker[],
  ): Promise<{ newStickers: number; duplicates: number }> {
    const stickerIds = drawn.map((s) => s.id);
    const existing: UserSticker[] = await manager.find(UserSticker, {
      where: { ownerId: userId, stickerId: In(stickerIds) },
    });
    const existingMap = new Map(existing.map((e) => [e.stickerId, e]));

    let newStickers = 0;
    let duplicates = 0;
    const toSave: UserSticker[] = [];

    for (const sticker of drawn) {
      const record = existingMap.get(sticker.id);
      if (record) {
        record.quantity++;
        toSave.push(record);
        duplicates++;
      } else {
        toSave.push(
          manager.create(UserSticker, {
            ownerId: userId,
            stickerId: sticker.id,
          }),
        );
        newStickers++;
      }
    }

    if (toSave.length > 0) {
      await manager.save(UserSticker, toSave);
    }

    return { newStickers, duplicates };
  }

  /**
   * Wrapper público para verificar áreas completadas después de actualizar
   * la colección (intercambios, etc.). Obtiene el bonus de la config
   * internamente.
   */
  async checkAreaCompletionsForUser(
    userId: number,
    manager: any,
  ): Promise<Array<{ area: string; points: number }>> {
    const areaBonus = await this.configsService.getNumber(
      ConfigType.AREA_COMPLETION_POINTS,
    );
    return this.checkAreaCompletions(userId, manager, areaBonus);
  }

  /**
   * Verifica áreas completadas usando la tabla area_completions.
   * Reemplaza el hack de CRC-16 en referenceId de PointTransaction.
   */
  private async checkAreaCompletions(
    userId: number,
    manager: any,
    bonusPoints: number,
  ): Promise<Array<{ area: string; points: number }>> {
    const bonuses: Array<{ area: string; points: number }> = [];
    const progress = await getAlbumSections(
      userId,
      this.stickerRepo,
      this.userStickerRepo,
    );

    const completedAreas = progress
      .filter((s) => s.isComplete)
      .map((s) => s.area);

    if (completedAreas.length === 0) return bonuses;

    const alreadyBonused = await manager
      .createQueryBuilder()
      .select('ac.areaName')
      .from(AreaCompletion, 'ac')
      .where('ac.userId = :userId', { userId })
      .andWhere('ac.areaName IN (:...areas)', { areas: completedAreas })
      .getRawMany()
      .then((rows) => new Set(rows.map((r) => r.ac_areaName)));

    for (const area of completedAreas) {
      if (alreadyBonused.has(area)) continue;

      await this.pointsService.award(
        userId,
        bonusPoints,
        PointReason.AREA_COMPLETED,
        undefined,
        manager,
      );
      await manager.save(
        AreaCompletion,
        manager.create(AreaCompletion, { userId, areaName: area }),
      );
      bonuses.push({ area, points: bonusPoints });
      this.logger.log(
        `[PACKS] Área completada: "${area}" por user ${userId} → +${bonusPoints} pts`,
      );
    }

    return bonuses;
  }
}
