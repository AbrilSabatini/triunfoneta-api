import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import { In, LessThanOrEqual, Repository } from 'typeorm';
import { MailQueue, MailStatus, MailType } from './entities/mail-queue.entity';
import { welcomeTemplate } from './templates/welcome.template';

export interface WelcomeEmailData {
  fullName: string;
  email: string;
  temporaryPassword: string;
}

const MAX_ATTEMPTS = Number(process.env.MAIL_MAX_ATTEMPTS ?? 5);
const BATCH_SIZE = Number(process.env.MAIL_BATCH_SIZE ?? 10);
const BATCH_DELAY = Number(process.env.MAIL_BATCH_DELAY_MS ?? 2000);

/** Backoff exponencial: intento 1→2min, 2→4min, 3→8min, 4→16min, 5→32min */
function backoffMs(attempt: number): number {
  return Math.pow(2, attempt) * 60 * 1000;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(MailQueue)
    private queueRepo: Repository<MailQueue>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT ?? 587),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  // ─── API pública ──────────────────────────────────────────────────────────

  /**
   * Encola un email de bienvenida.
   * El envío ocurre inmediatamente; si falla queda en cola para reintentos.
   */
  async enqueueWelcome(data: WelcomeEmailData): Promise<MailQueue> {
    const entry = this.queueRepo.create({
      type: MailType.WELCOME,
      toEmail: data.email,
      payload: data,
      status: MailStatus.PENDING,
    });
    const saved = await this.queueRepo.save(entry);
    // Intentar envío inmediato (no bloquea el registro)
    this.dispatchOne(saved).catch(() => {});
    return saved;
  }

  /**
   * Encola varios emails y los envía en lotes.
   * Devuelve un resumen con enviados / fallidos (en cola para reintento).
   */
  async enqueueWelcomeBatch(
    users: WelcomeEmailData[],
  ): Promise<{ sent: number; queued: number }> {
    // Persistir todos en un solo insert
    const entries = users.map((u) =>
      this.queueRepo.create({
        type: MailType.WELCOME,
        toEmail: u.email,
        payload: u,
        status: MailStatus.PENDING,
      }),
    );
    const saved = await this.queueRepo.save(entries);

    let sent = 0;
    let queued = 0;

    for (let i = 0; i < saved.length; i += BATCH_SIZE) {
      const batch = saved.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((entry) => this.dispatchOne(entry)),
      );
      for (const r of results) {
        r.status === 'fulfilled' ? sent++ : queued++;
      }
      this.logger.log(
        `[MAIL] Lote ${Math.floor(i / BATCH_SIZE) + 1} — enviados: ${sent}, en cola: ${queued}`,
      );
      if (i + BATCH_SIZE < saved.length) {
        await new Promise((r) => setTimeout(r, BATCH_DELAY));
      }
    }

    return { sent, queued };
  }

  /** [ADMIN] Forzar reenvío de un mail específico por ID */
  async retryOne(id: number): Promise<MailQueue> {
    const entry = await this.queueRepo.findOneOrFail({ where: { id } });
    entry.status = MailStatus.PENDING;
    entry.retryAfter = null as unknown as Date;
    await this.queueRepo.save(entry);
    await this.dispatchOne(entry);
    return this.queueRepo.findOneOrFail({ where: { id } });
  }

  /** [ADMIN] Listar emails en cola fallidos o agotados */
  async findFailed(page = 1, limit = 20) {
    const [data, total] = await this.queueRepo.findAndCount({
      where: { status: In([MailStatus.FAILED, MailStatus.EXHAUSTED]) },
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  // ─── Cron de reintentos (cada 5 minutos) ──────────────────────────────────

  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryFailed() {
    const now = new Date();
    const pending = await this.queueRepo.find({
      where: {
        status: In([MailStatus.PENDING, MailStatus.FAILED]),
        retryAfter: LessThanOrEqual(now),
      },
      take: 50, // procesar hasta 50 por ciclo
    });

    if (!pending.length) return;
    this.logger.log(`[MAIL:CRON] Reintentando ${pending.length} emails...`);

    for (const entry of pending) {
      await this.dispatchOne(entry).catch(() => {});
    }
  }

  // ─── Lógica interna de envío ──────────────────────────────────────────────

  private async dispatchOne(entry: MailQueue): Promise<void> {
    try {
      const html = this.buildHtml(entry);
      await this.transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME ?? 'Triunfoneta'}" <${process.env.MAIL_FROM_ADDRESS}>`,
        replyTo: 'no-reply@triunfoneta.com',
        to: entry.toEmail,
        subject: this.buildSubject(entry),
        html,
      });

      entry.status = MailStatus.SENT;
      entry.sentAt = new Date();
      await this.queueRepo.save(entry);
      this.logger.log(`[MAIL] ✓ ${entry.type} → ${entry.toEmail}`);
    } catch (err) {
      entry.attempts++;
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : JSON.stringify(err, Object.getOwnPropertyNames(err)) ||
              'Unknown error';
      entry.lastError = errorMessage.substring(0, 500);

      if (entry.attempts >= MAX_ATTEMPTS) {
        entry.status = MailStatus.EXHAUSTED;
        this.logger.error(
          `[MAIL] ✗ AGOTADO tras ${entry.attempts} intentos → ${entry.toEmail}: ${entry.lastError}`,
        );
      } else {
        entry.status = MailStatus.FAILED;
        entry.retryAfter = new Date(Date.now() + backoffMs(entry.attempts));
        this.logger.warn(
          `[MAIL] ✗ Intento ${entry.attempts}/${MAX_ATTEMPTS} → ${entry.toEmail}. ` +
            `Reintento en ~${Math.round(backoffMs(entry.attempts) / 60000)}min`,
        );
      }

      await this.queueRepo.save(entry);
      throw err; // re-throw para que el caller sepa que falló
    }
  }

  private buildHtml(entry: MailQueue): string {
    switch (entry.type) {
      case MailType.WELCOME:
        return welcomeTemplate(entry.payload as WelcomeEmailData);
      default:
        throw new Error(`Tipo de mail sin template: ${entry.type}`);
    }
  }

  private buildSubject(entry: MailQueue): string {
    switch (entry.type) {
      case MailType.WELCOME:
        return '¡Bienvenido/a a Triunfoneta!';
      default:
        return 'Triunfoneta';
    }
  }
}
