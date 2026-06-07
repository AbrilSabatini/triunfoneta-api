import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PointReason } from '../points/entities/point-transaction.entity';
import { PointsService } from '../points/points.service';
import {
  AnswerQuestionDto,
  BulkCreateQuestionsDto,
  CreateQuestionDto,
  QueryQuestionsDto,
  UpdateQuestionDto,
} from './dto/trivia.dto';
import { TriviaAttempt } from './entities/trivia-attempt.entity';
import { TriviaOption } from './entities/trivia-option.entity';
import {
  TriviaCategory,
  TriviaQuestion,
} from './entities/trivia-question.entity';

// ─── Tipo de estado de vidas ──────────────────────────────────────────────────

export interface LivesStatus {
  /** Vidas actuales disponibles */
  current: number;
  /** Máximo de vidas posibles (TRIVIA_MAX_LIVES) */
  max: number;
  /** Minutos hasta que se regenera la próxima vida (null si está al máximo) */
  nextRegenInMs: number | null;
  /** Timestamp exacto de la próxima regeneración */
  nextRegenAt: Date | null;
}

@Injectable()
export class TriviaService {
  private readonly logger = new Logger(TriviaService.name);

  constructor(
    @InjectRepository(TriviaQuestion)
    private questionRepo: Repository<TriviaQuestion>,

    @InjectRepository(TriviaOption)
    private optionRepo: Repository<TriviaOption>,

    @InjectRepository(TriviaAttempt)
    private attemptRepo: Repository<TriviaAttempt>,

    private pointsService: PointsService,
    private config: ConfigService,
    private dataSource: DataSource,
  ) {}

  // ─── Sistema de vidas ─────────────────────────────────────────────────────

  /**
   * Calcula las vidas actuales del usuario.
   *
   * Algoritmo:
   * 1. Traer todos los intentos donde usedLife=true, ordenados por fecha asc.
   * 2. Cada vida perdida se regenera después de TRIVIA_LIFE_REGEN_MINUTES.
   * 3. Contar cuántas de esas vidas YA se regeneraron → vidas gastadas activas.
   * 4. currentLives = maxLives - vidasGastadasAún activas.
   *
   * No se necesita ninguna tabla extra — todo se calcula desde trivia_attempts.
   */
  async getLivesStatus(userId: number): Promise<LivesStatus> {
    const maxLives = Number(this.config.get('TRIVIA_MAX_LIVES', 5));
    const regenMs =
      Number(this.config.get('TRIVIA_LIFE_REGEN_MINUTES', 60)) * 60 * 1000;
    const now = new Date();

    console.log('Milesegundos', regenMs);
    // Intentos que gastaron una vida, del más antiguo al más reciente
    const usedLives = await this.attemptRepo.find({
      where: { userId, usedLife: true },
      order: { answeredAt: 'ASC' },
      select: ['id', 'answeredAt'],
    });

    // Filtrar solo los que aún NO se regeneraron
    const activelyConsumed = usedLives.filter((a) => {
      const regenAt = new Date(a.answeredAt.getTime() + regenMs);
      return regenAt > now;
    });

    const current = maxLives - activelyConsumed.length;

    // Próxima regeneración: el más antiguo de los activos (se regenera primero)
    let nextRegenAt: Date | null = null;
    let nextRegenInMs: number | null = null;

    if (activelyConsumed.length > 0 && current < maxLives) {
      nextRegenAt = new Date(
        activelyConsumed[0].answeredAt.getTime() + regenMs,
      );
      nextRegenInMs = Math.max(0, nextRegenAt.getTime() - now.getTime());
    }

    return { current, max: maxLives, nextRegenInMs, nextRegenAt };
  }

  // ─── Preguntas para el usuario ────────────────────────────────────────────

  /**
   * Devuelve una pregunta aleatoria que el usuario no respondió aún.
   * Incluye el estado de vidas para que el frontend pueda mostrarlo.
   * Las opciones vienen SIN indicar cuál es la correcta.
   */
  async getQuestion(
    userId: number,
    category?: TriviaCategory,
  ): Promise<{
    question: TriviaQuestion;
    options: Array<Pick<TriviaOption, 'id' | 'questionId' | 'text' | 'order'>>;
    lives: LivesStatus;
  }> {
    const lives = await this.getLivesStatus(userId);

    if (lives.current <= 0) {
      const mins = lives.nextRegenInMs
        ? Math.ceil(lives.nextRegenInMs / 60000)
        : null;
      throw new BadRequestException(
        mins
          ? `Sin vidas disponibles. La próxima vida se regenera en ${mins} minuto${mins !== 1 ? 's' : ''}.`
          : 'Sin vidas disponibles.',
      );
    }

    // IDs ya respondidos (para no repetir)
    const answered = await this.attemptRepo.find({
      where: { userId },
      select: ['questionId'],
    });
    const answeredIds = answered.map((a) => a.questionId);

    const qb = this.questionRepo
      .createQueryBuilder('q')
      .where('q.isActive = true');

    if (answeredIds.length > 0) {
      qb.andWhere('q.id NOT IN (:...answered)', { answered: answeredIds });
    }
    if (category) {
      qb.andWhere('q.category = :category', { category });
    }

    qb.orderBy('RANDOM()').limit(1);

    const question = await qb.getOne();

    if (!question) {
      throw new BadRequestException(
        'Ya respondiste todas las preguntas disponibles. ¡Pronto habrá nuevas!',
      );
    }

    // Opciones SIN isCorrect
    const options = await this.optionRepo.find({
      where: { questionId: question.id },
      order: { order: 'ASC' },
      select: ['id', 'questionId', 'text', 'order'],
    });

    return { question, options, lives };
  }

  /**
   * Registra la respuesta del usuario.
   *
   * - Correcta → acredita puntos. No gasta vida.
   * - Incorrecta → gasta 1 vida. No acredita puntos.
   * - Sin vidas → rechaza la respuesta.
   */
  async answerQuestion(
    userId: number,
    questionId: number,
    dto: AnswerQuestionDto,
  ): Promise<{
    isCorrect: boolean;
    correctOption: TriviaOption;
    pointsEarned: number;
    lives: LivesStatus;
  }> {
    const lives = await this.getLivesStatus(userId);

    if (lives.current <= 0) {
      throw new BadRequestException(
        'No tenés vidas disponibles para responder.',
      );
    }

    const question = await this.questionRepo.findOne({
      where: { id: questionId, isActive: true },
    });
    if (!question) {
      throw new NotFoundException(
        `Pregunta #${questionId} no encontrada o inactiva.`,
      );
    }

    // No permitir responder la misma pregunta dos veces
    const alreadyAnswered = await this.attemptRepo.findOne({
      where: { userId, questionId },
    });
    if (alreadyAnswered) {
      throw new BadRequestException(
        'Ya respondiste esta pregunta anteriormente.',
      );
    }

    // Validar que la opción pertenece a la pregunta
    const selectedOption = await this.optionRepo.findOne({
      where: { id: dto.selectedOptionId, questionId },
    });
    if (!selectedOption) {
      throw new BadRequestException(
        `La opción #${dto.selectedOptionId} no pertenece a esta pregunta.`,
      );
    }

    const correctOption = await this.optionRepo.findOne({
      where: { questionId, isCorrect: true },
    });

    if (!correctOption) {
      throw new BadRequestException(
        'No se encontró una respuesta correcta para este pregunta.',
      );
    }

    const isCorrect = selectedOption.isCorrect;
    const pointsEarned = isCorrect ? question.points : 0;

    // Guardar intento y acreditar puntos (si aplica) en transacción
    await this.dataSource.transaction(async (manager) => {
      await manager.save(
        TriviaAttempt,
        manager.create(TriviaAttempt, {
          userId,
          questionId,
          selectedOptionId: dto.selectedOptionId,
          isCorrect,
          pointsEarned,
          usedLife: !isCorrect, // ← gasta vida solo si falla
        }),
      );

      if (isCorrect) {
        await this.pointsService.award(
          userId,
          pointsEarned,
          PointReason.TRIVIA,
          questionId,
        );
      }
    });

    // Recalcular vidas después de la respuesta
    const livesAfter = await this.getLivesStatus(userId);

    this.logger.log(
      `[TRIVIA] user=${userId} q=${questionId} ` +
        `correct=${isCorrect} pts=${pointsEarned} lives=${livesAfter.current}/${livesAfter.max}`,
    );

    return { isCorrect, correctOption, pointsEarned, lives: livesAfter };
  }

  /** Historial del usuario con paginación */
  async getMyHistory(
    userId: number,
    page = 1,
    limit = 20,
  ): Promise<{ data: TriviaAttempt[]; total: number }> {
    const [data, total] = await this.attemptRepo.findAndCount({
      where: { userId },
      order: { answeredAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  /** Stats del usuario */
  async getMyStats(userId: number): Promise<{
    total: number;
    correct: number;
    accuracy: number;
    totalPoints: number;
    livesLost: number;
    byCategory: Record<string, { total: number; correct: number }>;
  }> {
    const attempts = await this.attemptRepo.find({
      where: { userId },
      relations: ['question'],
    });

    const total = attempts.length;
    const correct = attempts.filter((a) => a.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const totalPoints = attempts.reduce((s, a) => s + a.pointsEarned, 0);
    const livesLost = attempts.filter((a) => a.usedLife).length;

    const byCategory: Record<string, { total: number; correct: number }> = {};
    for (const a of attempts) {
      const cat = a.question?.category ?? 'Sin categoría';
      if (!byCategory[cat]) byCategory[cat] = { total: 0, correct: 0 };
      byCategory[cat].total++;
      if (a.isCorrect) byCategory[cat].correct++;
    }

    return { total, correct, accuracy, totalPoints, livesLost, byCategory };
  }

  // ─── Admin: gestión de preguntas ──────────────────────────────────────────

  async findAll(query: QueryQuestionsDto): Promise<{
    data: Array<TriviaQuestion & { options: TriviaOption[] }>;
    total: number;
  }> {
    const { category, isActive, page = 1, limit = 20 } = query;

    const qb = this.questionRepo.createQueryBuilder('q');
    if (category) qb.andWhere('q.category = :category', { category });
    if (isActive !== undefined)
      qb.andWhere('q.isActive = :isActive', { isActive });

    qb.orderBy('q.category', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [questions, total] = await qb.getManyAndCount();

    const ids = questions.map((q) => q.id);
    const options = ids.length
      ? await this.optionRepo.find({
          where: ids.map((id) => ({ questionId: id })),
          order: { questionId: 'ASC', order: 'ASC' },
        })
      : [];

    const optionsByQ = new Map<number, TriviaOption[]>();
    for (const opt of options) {
      if (!optionsByQ.has(opt.questionId)) optionsByQ.set(opt.questionId, []);
      optionsByQ.get(opt.questionId)!.push(opt);
    }

    return {
      data: questions.map((q) => ({
        ...q,
        options: optionsByQ.get(q.id) ?? [],
      })),
      total,
    };
  }

  async findOne(
    id: number,
  ): Promise<TriviaQuestion & { options: TriviaOption[] }> {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question)
      throw new NotFoundException(`Pregunta #${id} no encontrada.`);
    const options = await this.optionRepo.find({
      where: { questionId: id },
      order: { order: 'ASC' },
    });
    return { ...question, options };
  }

  async createOne(
    dto: CreateQuestionDto,
  ): Promise<TriviaQuestion & { options: TriviaOption[] }> {
    this.validateOptions(dto.options, dto.question);
    const points = dto.points ?? 10;
    return this.dataSource.transaction(async (manager) => {
      const question = await manager.save(
        TriviaQuestion,
        manager.create(TriviaQuestion, {
          question: dto.question,
          category: dto.category,
          points,
        }),
      );
      const options = await this.saveOptions(manager, question.id, dto.options);
      return { ...question, options };
    });
  }

  async bulkCreate(dto: BulkCreateQuestionsDto): Promise<{
    created: number;
    questions: Array<{ id: number; question: string; category: string }>;
  }> {
    // Validar todo antes de abrir la transacción
    for (let i = 0; i < dto.questions.length; i++) {
      const q = dto.questions[i];
      this.validateOptions(q.options, `Pregunta ${i + 1}: "${q.question}"`);
    }

    const results = await this.dataSource.transaction(async (manager) => {
      const created: Array<{ id: number; question: string; category: string }> =
        [];
      for (const q of dto.questions) {
        const question = await manager.save(
          TriviaQuestion,
          manager.create(TriviaQuestion, {
            question: q.question,
            category: q.category,
            points: q.points ?? 10,
          }),
        );
        await this.saveOptions(manager, question.id, q.options);
        created.push({
          id: question.id,
          question: q.question,
          category: q.category,
        });
      }
      return created;
    });

    this.logger.log(`[TRIVIA] Bulk: ${results.length} preguntas cargadas.`);
    return { created: results.length, questions: results };
  }

  async update(
    id: number,
    dto: UpdateQuestionDto,
  ): Promise<TriviaQuestion & { options: TriviaOption[] }> {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question)
      throw new NotFoundException(`Pregunta #${id} no encontrada.`);

    if (dto.options)
      this.validateOptions(dto.options, dto.question ?? question.question);

    return this.dataSource.transaction(async (manager) => {
      Object.assign(question, {
        question: dto.question ?? question.question,
        category: dto.category ?? question.category,
        points: dto.points ?? question.points,
        isActive: question.isActive,
      });
      const saved = await manager.save(TriviaQuestion, question);

      let options: TriviaOption[];
      if (dto.options) {
        await manager.delete(TriviaOption, { questionId: id });
        options = await this.saveOptions(manager, id, dto.options);
      } else {
        options = await this.optionRepo.find({
          where: { questionId: id },
          order: { order: 'ASC' },
        });
      }
      return { ...saved, options };
    });
  }

  async remove(id: number): Promise<void> {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question)
      throw new NotFoundException(`Pregunta #${id} no encontrada.`);
    await this.questionRepo.remove(question);
  }

  // ─── Admin: stats globales ────────────────────────────────────────────────

  async getAdminStats(): Promise<{
    totalQuestions: number;
    activeQuestions: number;
    totalAttempts: number;
    correctAttempts: number;
    globalAccuracy: number;
    byCategory: Record<string, number>;
    hardestQuestions: Array<{ id: number; question: string; accuracy: number }>;
  }> {
    const [totalQuestions, activeQuestions] = await Promise.all([
      this.questionRepo.count(),
      this.questionRepo.count({ where: { isActive: true } }),
    ]);
    const [totalAttempts, correctAttempts] = await Promise.all([
      this.attemptRepo.count(),
      this.attemptRepo.count({ where: { isCorrect: true } }),
    ]);

    const globalAccuracy =
      totalAttempts > 0
        ? Math.round((correctAttempts / totalAttempts) * 100)
        : 0;

    const rawByCategory = await this.questionRepo
      .createQueryBuilder('q')
      .select('q.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('q.category')
      .getRawMany();

    const byCategory = rawByCategory.reduce(
      (acc, r) => {
        acc[r.category] = Number(r.count);
        return acc;
      },
      {} as Record<string, number>,
    );

    const hardestRaw = await this.attemptRepo
      .createQueryBuilder('a')
      .select('a.questionId', 'questionId')
      .addSelect('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN a.isCorrect THEN 1 ELSE 0 END)', 'correct')
      .groupBy('a.questionId')
      .having('COUNT(*) >= 5')
      .orderBy(
        'SUM(CASE WHEN a.isCorrect THEN 1 ELSE 0 END)::float / COUNT(*)',
        'ASC',
      )
      .limit(5)
      .getRawMany();

    const hardestQuestions = await Promise.all(
      hardestRaw.map(async (r) => {
        const q = await this.questionRepo.findOne({
          where: { id: r.questionId },
        });
        return {
          id: r.questionId,
          question: q?.question ?? '—',
          accuracy: Math.round((Number(r.correct) / Number(r.total)) * 100),
        };
      }),
    );

    return {
      totalQuestions,
      activeQuestions,
      totalAttempts,
      correctAttempts,
      globalAccuracy,
      byCategory,
      hardestQuestions,
    };
  }

  // ─── Helpers privados ─────────────────────────────────────────────────────

  private validateOptions(
    options: { isCorrect: boolean }[],
    context: string,
  ): void {
    const count = options.filter((o) => o.isCorrect).length;
    if (count !== 1) {
      throw new BadRequestException(
        `${context}: debe haber exactamente 1 opción correcta (encontradas: ${count}).`,
      );
    }
  }

  private async saveOptions(
    manager: any,
    questionId: number,
    options: Array<{ text: string; isCorrect: boolean; order?: number }>,
  ): Promise<TriviaOption[]> {
    const saved: TriviaOption[] = [];
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      saved.push(
        await manager.save(
          TriviaOption,
          manager.create(TriviaOption, {
            questionId,
            text: opt.text,
            isCorrect: opt.isCorrect,
            order: opt.order ?? i,
          }),
        ),
      );
    }
    return saved;
  }
}
