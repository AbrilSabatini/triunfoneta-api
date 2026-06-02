import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * canActivate extrae el token y delega a Passport.
   * Lo sobreescribimos solo para poder llamar a super y manejar
   * cualquier excepción síncrona antes de que llegue a handleRequest.
   */
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  /**
   * handleRequest es el hook que Passport llama con el resultado de validate().
   * El guard base lanza un error genérico de Express; acá lo convertimos
   * en excepciones NestJS con mensajes claros en español.
   *
   * @param err   - error lanzado por Passport internamente
   * @param user  - resultado de JwtStrategy.validate() (o false si falló)
   * @param info  - objeto JsonWebTokenError con el motivo del fallo
   */
  handleRequest(err: any, user: any, info: any) {
    // 1. Token expirado
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException(
        'Tu sesión expiró. Iniciá sesión nuevamente.',
      );
    }

    // 2. Token malformado, firma inválida u otro error de JWT
    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException(
        'Token inválido. Iniciá sesión nuevamente.',
      );
    }

    // 3. No se envió el header Authorization / Bearer
    if (info?.message === 'No auth token') {
      throw new UnauthorizedException(
        'Se requiere autenticación. Incluí el header Authorization: Bearer <token>.',
      );
    }

    // 4. Error proveniente de JwtStrategy.validate() (cuenta inactiva, etc.)
    if (err) {
      throw err instanceof UnauthorizedException
        ? err
        : new UnauthorizedException(err.message ?? 'Error de autenticación.');
    }

    // 5. validate() devolvió null/false (usuario no encontrado)
    if (!user) {
      throw new UnauthorizedException('No autenticado.');
    }

    return user;
  }
}
