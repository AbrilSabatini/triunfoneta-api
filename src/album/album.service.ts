import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PacksService } from '../packs/packs.service';
import { UserSticker } from '../packs/entities/user-sticker.entity';
import { getAlbumSections } from '../common/utils/album-progress.util';
import { Sticker } from '../users/entities/sticker.entity';
import { User } from '../users/entities/user.entity';
import {
  CreateTradeDto,
  QuerySectionDto,
  QueryTradesDto,
} from './dto/album.dto';
import { TradeOffer, TradeStatus } from './entities/trade-offer.entity';

const TRADE_EXPIRY_HOURS = 72;

// ─── Tipos de respuesta ───────────────────────────────────────────────────────

export interface AlbumSection {
  area: string;
  totalStickers: number;
  ownedStickers: number;
  percentage: number;
  isComplete: boolean;
}

export interface SectionDetail {
  area: string;
  stickers: Array<{
    sticker: Sticker;
    owned: boolean;
    quantity: number;
    isDuplicate: boolean;
  }>;
  ownedCount: number;
  totalCount: number;
  percentage: number;
}

@Injectable()
export class AlbumService {
  private readonly logger = new Logger(AlbumService.name);

  constructor(
    @InjectRepository(TradeOffer)
    private tradeRepo: Repository<TradeOffer>,

    @InjectRepository(UserSticker)
    private userStickerRepo: Repository<UserSticker>,

    @InjectRepository(Sticker)
    private stickerRepo: Repository<Sticker>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    private dataSource: DataSource,

    private packsService: PacksService,
  ) {}

  // ─── Álbum: progreso global ───────────────────────────────────────────────

  /**
   * Resumen del álbum por áreas para un usuario dado.
   * Si no se pasa userId, devuelve el del usuario autenticado.
   */
  async getAlbumSummary(userId: number): Promise<{
    sections: AlbumSection[];
    totalStickers: number;
    ownedStickers: number;
    percentage: number;
    completedAreas: number;
  }> {
    const sections = await this.getSections(userId);
    const totalStickers = sections.reduce((s, a) => s + a.totalStickers, 0);
    const ownedStickers = sections.reduce((s, a) => s + a.ownedStickers, 0);
    const percentage =
      totalStickers > 0 ? Math.round((ownedStickers / totalStickers) * 100) : 0;
    const completedAreas = sections.filter((a) => a.isComplete).length;

    return {
      sections,
      totalStickers,
      ownedStickers,
      percentage,
      completedAreas,
    };
  }

  /**
   * Detalle de una sección (área) específica: todas las figuritas que existen
   * en esa área, marcando cuáles tiene el usuario y cuáles le faltan.
   * Si no se especifica área, devuelve todas las figuritas paginadas.
   */
  async getSectionDetail(
    userId: number,
    query: QuerySectionDto,
  ): Promise<SectionDetail[]> {
    const { area, page = 1, limit = 50 } = query;

    // Todas las figuritas del sistema (filtradas por área si se especifica)
    const stickerQb = this.stickerRepo.createQueryBuilder('s');
    if (area) stickerQb.where('s.area ILIKE :area', { area: `%${area}%` });
    stickerQb.orderBy('s.area', 'ASC').addOrderBy('s.stickerNumber', 'ASC');

    const allStickers = await stickerQb.getMany();

    // Colección del usuario
    const owned = await this.userStickerRepo.find({
      where: { ownerId: userId },
      select: ['stickerId', 'quantity'],
    });
    const ownedMap = new Map(owned.map((us) => [us.stickerId, us.quantity]));

    // Agrupar por área
    const byArea = new Map<string, Sticker[]>();
    for (const s of allStickers) {
      const key = s.area ?? 'General';
      if (!byArea.has(key)) byArea.set(key, []);
      byArea.get(key)!.push(s);
    }

    return Array.from(byArea.entries()).map(([areaName, stickers]) => {
      const enriched = stickers.map((s) => {
        const qty = ownedMap.get(s.id) ?? 0;
        return {
          sticker: s,
          owned: qty > 0,
          quantity: qty,
          isDuplicate: qty > 1,
        };
      });
      const ownedCount = enriched.filter((e) => e.owned).length;
      return {
        area: areaName,
        stickers: enriched,
        ownedCount,
        totalCount: stickers.length,
        percentage:
          stickers.length > 0
            ? Math.round((ownedCount / stickers.length) * 100)
            : 0,
      };
    });
  }

  /** Figuritas que le faltan al usuario para completar el álbum */
  async getMissingStickers(userId: number): Promise<
    {
      area: string;
      missing: Sticker[];
    }[]
  > {
    const allStickers = await this.stickerRepo.find({
      order: { area: 'ASC', stickerNumber: 'ASC' },
    });
    const owned = await this.userStickerRepo.find({
      where: { ownerId: userId },
      select: ['stickerId'],
    });
    const ownedIds = new Set(owned.map((us) => us.stickerId));

    const missing = allStickers.filter((s) => !ownedIds.has(s.id));

    // Agrupar por área
    const byArea = new Map<string, Sticker[]>();
    for (const s of missing) {
      const key = s.area ?? 'General';
      if (!byArea.has(key)) byArea.set(key, []);
      byArea.get(key)!.push(s);
    }

    return Array.from(byArea.entries()).map(([area, stickers]) => ({
      area,
      missing: stickers,
    }));
  }

  // ─── Intercambios ─────────────────────────────────────────────────────────

  /**
   * Crea una oferta de intercambio entre dos usuarios.
   *
   * Validaciones:
   * 1. El emisor no puede intercambiar consigo mismo.
   * 2. La figurita ofrecida debe pertenecer al emisor y ser repetida (qty > 1).
   * 3. La figurita pedida debe pertenecer al receptor.
   * 4. No puede haber otra oferta PENDING para el mismo par (emisor, receptor, figus).
   */
  async createTrade(
    fromUserId: number,
    dto: CreateTradeDto,
  ): Promise<TradeOffer> {
    if (fromUserId === dto.toUserId) {
      throw new BadRequestException(
        'No podés intercambiar figuritas con vos mismo.',
      );
    }

    // Validar figurita ofrecida
    const offered = await this.userStickerRepo.findOne({
      where: { id: dto.offeredUserStickerId, ownerId: fromUserId },
      relations: ['sticker'],
    });
    if (!offered) {
      throw new NotFoundException(
        `No tenés la figurita UserSticker #${dto.offeredUserStickerId} en tu colección.`,
      );
    }
    if (offered.quantity < 2) {
      throw new BadRequestException(
        `La figurita "${offered.sticker.nickname}" no está repetida. ` +
          `Solo podés ofrecer figuritas que tengas en cantidad > 1.`,
      );
    }

    // Validar figurita pedida
    const requested = await this.userStickerRepo.findOne({
      where: { id: dto.requestedUserStickerId, ownerId: dto.toUserId },
      relations: ['sticker'],
    });
    if (!requested) {
      throw new NotFoundException(
        `El usuario destino no tiene la figurita UserSticker #${dto.requestedUserStickerId}.`,
      );
    }

    // Verificar receptor existe
    const toUser = await this.userRepo.findOne({ where: { id: dto.toUserId } });
    if (!toUser || !toUser.isActive) {
      throw new NotFoundException('Usuario receptor no encontrado o inactivo.');
    }

    // Verificar que no exista ya una oferta pendiente idéntica
    const existing = await this.tradeRepo.findOne({
      where: {
        fromUserId,
        toUserId: dto.toUserId,
        offeredUserStickerId: dto.offeredUserStickerId,
        requestedUserStickerId: dto.requestedUserStickerId,
        status: TradeStatus.PENDING,
      },
    });
    if (existing) {
      throw new BadRequestException(
        'Ya existe una oferta pendiente para este mismo intercambio.',
      );
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TRADE_EXPIRY_HOURS);

    const trade = this.tradeRepo.create({
      fromUserId,
      toUserId: dto.toUserId,
      offeredUserStickerId: dto.offeredUserStickerId,
      requestedUserStickerId: dto.requestedUserStickerId,
      message: dto.message ?? null,
      expiresAt,
    });

    return this.tradeRepo.save(trade);
  }

  /**
   * Acepta un intercambio. Debe ser llamado por el receptor (toUserId).
   *
   * El swap es atómico (transacción):
   * 1. Verificar que ambas figuritas siguen disponibles.
   * 2. Decrementar quantity en ambas colecciones.
   * 3. Si quantity llega a 0, eliminar el UserSticker.
   * 4. Agregar la figurita recibida a cada colección (upsert).
   * 5. Marcar la oferta como ACCEPTED.
   */
  async acceptTrade(tradeId: number, userId: number): Promise<TradeOffer> {
    const trade = await this.findTradeById(tradeId);

    if (trade.toUserId !== userId) {
      throw new ForbiddenException(
        'Solo el receptor puede aceptar esta oferta.',
      );
    }
    if (trade.status !== TradeStatus.PENDING) {
      throw new BadRequestException(
        `No se puede aceptar un intercambio en estado "${trade.status}".`,
      );
    }
    if (trade.expiresAt && new Date() > trade.expiresAt) {
      throw new BadRequestException('Esta oferta ya venció.');
    }

    return this.dataSource.transaction(async (manager) => {
      // Lock con QueryBuilder SIN joins para evitar el error de PostgreSQL:
      // "FOR UPDATE cannot be applied to the nullable side of an outer join".
      // UserSticker tiene eager:true en la relación sticker (LEFT JOIN),
      // lo que hace que manager.findOne con lock genere un SELECT...FOR UPDATE
      // sobre el LEFT JOIN, que Postgres rechaza.
      // Solución: lockear solo la tabla user_stickers, luego cargar stickerId
      // directamente del resultado (no necesitamos la relación entera para el swap).
      const offered = await manager
        .createQueryBuilder(UserSticker, 'us')
        .where('us.id = :id', { id: trade.offeredUserStickerId })
        .setLock('pessimistic_write')
        .getOne();

      const requested = await manager
        .createQueryBuilder(UserSticker, 'us')
        .where('us.id = :id', { id: trade.requestedUserStickerId })
        .setLock('pessimistic_write')
        .getOne();

      if (!offered || offered.quantity < 2) {
        throw new BadRequestException(
          'La figurita ofrecida ya no está disponible para intercambio ' +
            '(fue usada en otro canje o la cantidad cambió).',
        );
      }
      if (!requested || requested.quantity < 1) {
        throw new BadRequestException(
          'Ya no tenés la figurita que se quería obtener.',
        );
      }

      // Decrementar figurita ofrecida (del emisor)
      offered.quantity--;
      if (offered.quantity === 0) {
        await manager.remove(UserSticker, offered);
      } else {
        await manager.save(UserSticker, offered);
      }

      // Decrementar figurita pedida (del receptor)
      requested.quantity--;
      if (requested.quantity === 0) {
        await manager.remove(UserSticker, requested);
      } else {
        await manager.save(UserSticker, requested);
      }

      // Dar la figurita ofrecida al receptor (upsert)
      await this.upsertUserSticker(manager, trade.toUserId, offered.stickerId);

      // Dar la figurita pedida al emisor (upsert)
      await this.upsertUserSticker(
        manager,
        trade.fromUserId,
        requested.stickerId,
      );

      // Verificar áreas completadas para ambos usuarios tras el swap
      const fromCompletions = await this.packsService.checkAreaCompletionsForUser(
        trade.fromUserId,
        manager,
      );
      const toCompletions = await this.packsService.checkAreaCompletionsForUser(
        trade.toUserId,
        manager,
      );

      if (fromCompletions.length > 0 || toCompletions.length > 0) {
        this.logger.log(
          `[TRADE] #${trade.id} áreas completadas: ` +
            `emisor [${fromCompletions.map((c) => c.area).join(', ')}] ` +
            `receptor [${toCompletions.map((c) => c.area).join(', ')}]`,
        );
      }

      trade.status = TradeStatus.ACCEPTED;
      const saved = await manager.save(TradeOffer, trade);

      this.logger.log(
        `[TRADE] #${trade.id} aceptado: user ${trade.fromUserId} ↔ user ${trade.toUserId}`,
      );
      return saved;
    });
  }

  async rejectTrade(tradeId: number, userId: number): Promise<TradeOffer> {
    const trade = await this.findTradeById(tradeId);
    if (trade.toUserId !== userId) {
      throw new ForbiddenException(
        'Solo el receptor puede rechazar esta oferta.',
      );
    }
    if (trade.status !== TradeStatus.PENDING) {
      throw new BadRequestException(
        `No se puede rechazar un intercambio en estado "${trade.status}".`,
      );
    }
    trade.status = TradeStatus.REJECTED;
    return this.tradeRepo.save(trade);
  }

  async cancelTrade(tradeId: number, userId: number): Promise<TradeOffer> {
    const trade = await this.findTradeById(tradeId);
    if (trade.fromUserId !== userId) {
      throw new ForbiddenException(
        'Solo el emisor puede cancelar esta oferta.',
      );
    }
    if (trade.status !== TradeStatus.PENDING) {
      throw new BadRequestException(
        `No se puede cancelar un intercambio en estado "${trade.status}".`,
      );
    }
    trade.status = TradeStatus.CANCELLED;
    return this.tradeRepo.save(trade);
  }

  /** Listado de intercambios del usuario (enviados + recibidos) */
  async getMyTrades(
    userId: number,
    query: QueryTradesDto,
  ): Promise<{
    sent: TradeOffer[];
    received: TradeOffer[];
    total: number;
  }> {
    const { status, page = 1, limit = 20 } = query;

    const baseWhere: any = {};
    if (status) baseWhere.status = status;

    const [sent, received] = await Promise.all([
      this.tradeRepo.find({
        where: { fromUserId: userId, ...baseWhere },
        relations: [
          'offeredUserSticker',
          'requestedUserSticker',
          'offeredUserSticker.sticker',
          'requestedUserSticker.sticker',
          'toUser',
        ],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.tradeRepo.find({
        where: { toUserId: userId, ...baseWhere },
        relations: [
          'offeredUserSticker',
          'requestedUserSticker',
          'offeredUserSticker.sticker',
          'requestedUserSticker.sticker',
          'fromUser',
        ],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { sent, received, total: sent.length + received.length };
  }

  async getTradeDetail(tradeId: number, userId: number): Promise<TradeOffer> {
    const trade = await this.findTradeById(tradeId, true);
    if (trade.fromUserId !== userId && trade.toUserId !== userId) {
      throw new ForbiddenException('No tenés acceso a este intercambio.');
    }
    return trade;
  }

  // ─── Cron: expirar ofertas vencidas ──────────────────────────────────────

  @Cron(CronExpression.EVERY_HOUR)
  async expireOldTrades() {
    const result = await this.tradeRepo
      .createQueryBuilder()
      .update(TradeOffer)
      .set({ status: TradeStatus.EXPIRED })
      .where('status = :pending', { pending: TradeStatus.PENDING })
      .andWhere('expiresAt IS NOT NULL')
      .andWhere('expiresAt < :now', { now: new Date() })
      .execute();

    if ((result.affected ?? 0) > 0) {
      this.logger.log(
        `[TRADE:CRON] ${result.affected ?? 0} ofertas vencidas marcadas como EXPIRED`,
      );
    }
  }

  // ─── Helpers privados ─────────────────────────────────────────────────────

  private async findTradeById(
    id: number,
    withRelations = false,
  ): Promise<TradeOffer> {
    const relations = withRelations
      ? [
          'offeredUserSticker',
          'requestedUserSticker',
          'offeredUserSticker.sticker',
          'requestedUserSticker.sticker',
          'fromUser',
          'toUser',
        ]
      : [];

    const trade = await this.tradeRepo.findOne({ where: { id }, relations });
    if (!trade)
      throw new NotFoundException(`Intercambio #${id} no encontrado.`);
    return trade;
  }

  private async getSections(userId: number): Promise<AlbumSection[]> {
    return getAlbumSections(userId, this.stickerRepo, this.userStickerRepo);
  }

  /** Upsert de una figurita en la colección de un usuario */
  private async upsertUserSticker(
    manager: any,
    ownerId: number,
    stickerId: number,
  ): Promise<void> {
    const existing = await manager.findOne(UserSticker, {
      where: { ownerId, stickerId },
    });
    if (existing) {
      existing.quantity++;
      await manager.save(UserSticker, existing);
    } else {
      await manager.save(
        UserSticker,
        manager.create(UserSticker, { ownerId, stickerId, quantity: 1 }),
      );
    }
  }
}
