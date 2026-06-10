import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { ConfigsService } from '../configs/configs.service';
import { ConfigType } from '../configs/entities/config.entity';
import { PointReason } from '../points/entities/point-transaction.entity';
import { PointsService } from '../points/points.service';
import { User } from '../users/entities/user.entity';
import {
  BulkCreateMatchesDto,
  CreateMatchDto,
  QueryMatchesDto,
  QueryPicksDto,
  SetResultDto,
  UpdateMatchDto,
  UpsertPickDto,
} from './dto/prode.dto';
import { Match, MatchGroup } from './entities/match.entity';
import { ProdePick } from './entities/prode-pick.entity';

@Injectable()
export class ProdeService {
  private readonly logger = new Logger(ProdeService.name);

  constructor(
    @InjectRepository(Match)
    private matchRepo: Repository<Match>,

    @InjectRepository(ProdePick)
    private pickRepo: Repository<ProdePick>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    private pointsService: PointsService,
    private configsService: ConfigsService,
    private dataSource: DataSource,
  ) {}

  // ─── Partidos (público + admin) ───────────────────────────────────────────

  async findMatches(
    query: QueryMatchesDto,
  ): Promise<{ data: Match[]; total: number }> {
    const { upcoming, stage, page = 1, limit = 20 } = query;
    const qb = this.matchRepo.createQueryBuilder('match');

    if (upcoming) {
      qb.where('match.picksCloseAt > :now', { now: new Date() });
    }
    if (stage) {
      qb.andWhere('match.stage = :stage', { stage });
    }

    qb.orderBy('match.matchDate', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findMatchById(id: number): Promise<Match> {
    const match = await this.matchRepo.findOne({ where: { id } });
    if (!match) throw new NotFoundException(`Partido #${id} no encontrado`);
    return match;
  }

  // ─── Predicciones del usuario ─────────────────────────────────────────────

  /**
   * Crea o actualiza la predicción de un usuario para un partido.
   * Reglas:
   * - No se puede predecir después de picksCloseAt.
   * - No se puede cambiar si el partido ya terminó.
   * - Si ya existe una predicción, se actualiza (upsert lógico).
   */
  async upsertPick(
    userId: number,
    matchId: number,
    dto: UpsertPickDto,
  ): Promise<ProdePick> {
    const match = await this.findMatchById(matchId);

    if (match.isFinished) {
      throw new BadRequestException(
        'El partido ya terminó. No podés modificar tu predicción.',
      );
    }

    if (new Date() > match.picksCloseAt) {
      throw new BadRequestException(
        `El plazo para predecir este partido venció el ` +
          `${match.picksCloseAt.toLocaleString('es-AR')}`,
      );
    }

    const existing = await this.pickRepo.findOne({
      where: { userId, matchId },
    });

    if (existing) {
      existing.predictedHome = dto.predictedHome;
      existing.predictedAway = dto.predictedAway;
      return this.pickRepo.save(existing);
    }

    const pick = this.pickRepo.create({
      userId,
      matchId,
      predictedHome: dto.predictedHome,
      predictedAway: dto.predictedAway,
    });
    return this.pickRepo.save(pick);
  }

  async getMyPicks(
    userId: number,
    query: QueryPicksDto,
  ): Promise<{ data: ProdePick[]; total: number }> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.pickRepo.findAndCount({
      where: { userId },
      relations: ['match'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async getPickForMatch(
    userId: number,
    matchId: number,
  ): Promise<ProdePick | null> {
    return this.pickRepo.findOne({
      where: { userId, matchId },
      relations: ['match'],
    });
  }

  // ─── Admin: crear / editar partidos ──────────────────────────────────────

  /**
   * Carga el fixture completo en una sola operación.
   * Todos se crean en una transacción: si falla uno, no se guarda ninguno.
   * Los partidos duplicados (mismo homeTeam+awayTeam+matchDate) se omiten.
   */
  async bulkCreateMatches(dto: BulkCreateMatchesDto): Promise<{
    created: number;
    skipped: number;
    matches: Array<{
      id: number;
      homeTeam: string;
      awayTeam: string;
      matchDate: Date;
    }>;
  }> {
    return this.dataSource.transaction(async (manager) => {
      const created: Match[] = [];
      let skipped = 0;

      for (const m of dto.matches) {
        const matchDate = new Date(m.matchDate);
        const picksClose = new Date(matchDate.getTime() - 1 * 60 * 1000); // -24h default

        if (picksClose >= matchDate) {
          throw new BadRequestException(
            `Partido ${m.homeTeam} vs ${m.awayTeam}: picksCloseAt debe ser anterior al partido.`,
          );
        }

        // Omitir duplicados
        const existing = await manager.findOne(Match, {
          where: { homeTeam: m.homeTeam, awayTeam: m.awayTeam, matchDate },
        });
        if (existing) {
          skipped++;
          continue;
        }

        const match = manager.create(Match, {
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          matchDate,
          picksCloseAt: picksClose,
          stage: m.stage,
          group: m.group ?? MatchGroup.NONE,
        });
        created.push(await manager.save(Match, match));
      }

      this.logger.log(
        `[PRODE] Bulk: ${created.length} partidos creados, ${skipped} omitidos.`,
      );

      return {
        created: created.length,
        skipped,
        matches: created.map((m) => ({
          id: m.id,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          matchDate: m.matchDate,
          picksCloseAt: m.picksCloseAt,
        })),
      };
    });
  }

  async createMatch(dto: CreateMatchDto): Promise<Match> {
    const matchDate = new Date(dto.matchDate);
    const picksClose = new Date(matchDate.getTime() - 1 * 60 * 1000); // -24h default

    if (picksClose >= matchDate) {
      throw new BadRequestException(
        'picksCloseAt debe ser anterior a la fecha del partido',
      );
    }

    const match = this.matchRepo.create({
      ...dto,
      matchDate,
      picksCloseAt: picksClose,
    });
    return this.matchRepo.save(match);
  }

  async updateMatch(id: number, dto: UpdateMatchDto): Promise<Match> {
    const match = await this.findMatchById(id);

    if (match.isFinished) {
      throw new BadRequestException(
        'No se pueden editar datos de un partido ya finalizado. ' +
          'Usar PATCH /result para corregir el resultado.',
      );
    }

    if (dto.matchDate) {
      match.matchDate = new Date(dto.matchDate);
    }

    Object.assign(match, {
      homeTeam: dto.homeTeam ?? match.homeTeam,
      awayTeam: dto.awayTeam ?? match.awayTeam,
      stage: dto.stage ?? match.stage,
      group: dto.group ?? match.group,
    });

    return this.matchRepo.save(match);
  }

  // ─── Admin: cargar resultado y procesar puntos ────────────────────────────

  /**
   * Carga el resultado de un partido y distribuye los puntos a todos los
   * participantes. Operación idempotente: si ya se procesó, re-procesa
   * solo los picks sin puntos (útil ante correcciones de resultado).
   *
   * Puntos según config:
   * - Resultado exacto  → PRODE_EXACT_POINTS  (default 10)
   * - Ganador correcto  → PRODE_WINNER_POINTS (default 5)
   * - Sin acierto       → 0
   */
  async setResult(
    id: number,
    dto: SetResultDto,
  ): Promise<{
    match: Match;
    processed: number;
    pointsAwarded: number;
  }> {
    const match = await this.findMatchById(id);

    // Actualizar resultado en la misma transacción que los puntos
    return this.dataSource.transaction(async (manager) => {
      match.scoreHome = dto.scoreHome;
      match.scoreAway = dto.scoreAway;
      match.isFinished = true;
      match.pointsProcessed = false; // se marcará al final
      await manager.save(Match, match);

      const picks = await manager.find(ProdePick, {
        where: { matchId: id },
      });

      const exactPoints = await this.configsService.getNumber(
        ConfigType.PRODE_EXACT_POINTS,
      );
      const winnerPoints = await this.configsService.getNumber(
        ConfigType.PRODE_WINNER_POINTS,
      );

      const actualWinner = this.getWinner(dto.scoreHome, dto.scoreAway);

      let processed = 0;
      let pointsAwarded = 0;

      for (const pick of picks) {
        const earned = this.calcPoints(
          pick.predictedHome,
          pick.predictedAway,
          dto.scoreHome,
          dto.scoreAway,
          exactPoints,
          winnerPoints,
          actualWinner,
        );

        pick.pointsEarned = earned;
        await manager.save(ProdePick, pick);

        if (earned > 0) {
          await this.pointsService.award(
            pick.userId,
            earned,
            earned === exactPoints
              ? PointReason.PRODE_EXACT
              : PointReason.PRODE_WINNER,
            pick.id,
          );
          pointsAwarded += earned;
        }
        processed++;
      }

      match.pointsProcessed = true;
      await manager.save(Match, match);

      this.logger.log(
        `[PRODE] Resultado cargado: ${match.homeTeam} ${dto.scoreHome}-${dto.scoreAway} ` +
          `${match.awayTeam}. Picks procesados: ${processed}, puntos otorgados: ${pointsAwarded}`,
      );

      return { match, processed, pointsAwarded };
    });
  }

  // ─── Cron: cierre automático de predicciones ──────────────────────────────

  /**
   * Corre cada minuto y verifica si hay partidos cuyo picksCloseAt ya pasó
   * pero que aún no están marcados como cerrados en ningún campo.
   * En la práctica los picks son rechazados por la validación de fecha,
   * pero este cron sirve para logging y alertas futuras.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async checkClosedPicks() {
    const now = new Date();
    const closing = await this.matchRepo
      .createQueryBuilder('match')
      .where('match.picksCloseAt <= :now', { now })
      .andWhere('match.isFinished = false')
      .getCount();

    if (closing > 0) {
      this.logger.debug(
        `[PRODE:CRON] ${closing} partido(s) con predicciones cerradas esperando resultado.`,
      );
    }
  }

  // ─── Helpers privados ─────────────────────────────────────────────────────

  private getWinner(home: number, away: number): 'home' | 'away' | 'draw' {
    if (home > away) return 'home';
    if (away > home) return 'away';
    return 'draw';
  }

  private calcPoints(
    predHome: number,
    predAway: number,
    realHome: number,
    realAway: number,
    exactPts: number,
    winnerPts: number,
    actualWinner: 'home' | 'away' | 'draw',
  ): number {
    // Resultado exacto
    if (predHome === realHome && predAway === realAway) {
      return exactPts;
    }
    // Acertó ganador / empate
    const predWinner = this.getWinner(predHome, predAway);
    if (predWinner === actualWinner) {
      return winnerPts;
    }
    return 0;
  }
}
