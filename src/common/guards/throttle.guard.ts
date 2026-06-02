import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';

interface ThrottleWindow {
  count: number;
  windowStart: number;
}

export const THROTTLE_KEY = 'throttle_config';

export interface ThrottleConfig {
  /** Máximo de requests en la ventana */
  limit: number;
  /** Duración de la ventana en milisegundos */
  windowMs: number;
}

export const Throttle =
  (config: ThrottleConfig) =>
  (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(THROTTLE_KEY, config, descriptor.value);
    return descriptor;
  };

/**
 * Rate limiter en memoria por IP + endpoint.
 * Para producción con múltiples instancias reemplazar el Map por Redis
 * usando ioredis (ver comentario al final del archivo).
 *
 * Aplica la config definida con el decorador @Throttle() en el handler,
 * o los defaults del entorno si no hay decorador.
 */
@Injectable()
export class ThrottleGuard implements CanActivate {
  private readonly logger = new Logger(ThrottleGuard.name);
  private readonly store = new Map<string, ThrottleWindow>();

  // Limpieza periódica para evitar memory leak (cada 5 min)
  constructor() {
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private readonly defaultLimit = Number(
    process.env.THROTTLE_DEFAULT_LIMIT ?? 60,
  );
  private readonly defaultWindowMs = Number(
    process.env.THROTTLE_DEFAULT_WINDOW_MS ?? 60_000,
  );

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const res = ctx.switchToHttp().getResponse();
    const handler = ctx.getHandler();

    const config: ThrottleConfig = Reflect.getMetadata(
      THROTTLE_KEY,
      handler,
    ) ?? {
      limit: this.defaultLimit,
      windowMs: this.defaultWindowMs,
    };

    const ip = req.ip ?? req.connection?.remoteAddress ?? 'unknown';
    const key = `${ip}::${handler.name}`;
    const now = Date.now();

    const window = this.store.get(key);

    if (!window || now - window.windowStart > config.windowMs) {
      // Ventana nueva
      this.store.set(key, { count: 1, windowStart: now });
    } else {
      window.count++;
      if (window.count > config.limit) {
        const retryAfterSec = Math.ceil(
          (config.windowMs - (now - window.windowStart)) / 1000,
        );
        res.setHeader('Retry-After', retryAfterSec);
        this.logger.warn(
          `[THROTTLE] IP ${ip} bloqueada en ${handler.name}. ` +
            `Reintentar en ${retryAfterSec}s`,
        );
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: `Demasiadas solicitudes. Esperá ${retryAfterSec} segundos antes de reintentar.`,
            retryAfterSeconds: retryAfterSec,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    return true;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, window] of this.store.entries()) {
      if (now - window.windowStart > this.defaultWindowMs * 2) {
        this.store.delete(key);
      }
    }
    this.logger.debug(
      `[THROTTLE] Cleanup: ${this.store.size} entradas restantes`,
    );
  }
}

/*
 * ─── Migración a Redis (producción multi-instancia) ──────────────────────────
 *
 * Reemplazar el Map interno por:
 *
 *   import Redis from 'ioredis';
 *   const redis = new Redis(process.env.REDIS_URL);
 *
 *   // En canActivate:
 *   const current = await redis.incr(key);
 *   if (current === 1) await redis.pexpire(key, config.windowMs);
 *   if (current > config.limit) throw ...;
 *
 * De esta forma todos los pods comparten el mismo contador.
 */
