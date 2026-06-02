import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Throttle, ThrottleGuard } from '../common/guards/throttle.guard';
import { BulkRegisterDto, LoginDto, RegisterDto } from '../users/dto/users.dto';
import { UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottleGuard)
  @Throttle({ limit: 10, windowMs: 60_000 })
  @ApiOperation({
    summary: 'Registro individual',
    description:
      'El usuario se registra con su propia contraseña. Rate limit: 10 req/min por IP.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado, devuelve accessToken',
  })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @ApiResponse({ status: 429, description: 'Demasiadas solicitudes' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('register/bulk')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottleGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ limit: 3, windowMs: 10 * 60_000 })
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: '[ADMIN] Registro masivo de empleados',
    description:
      'Crea hasta 100 usuarios por request. El sistema genera una contraseña temporal por usuario ' +
      'y la envía por email. Los emails que ya existen se omiten (ver `skippedEmails` en la respuesta). ' +
      'Rate limit estricto: **3 llamadas / 10 minutos** por IP.',
  })
  @ApiResponse({
    status: 201,
    description: 'Resumen de la operación',
    schema: {
      example: {
        created: 15,
        skipped: 2,
        emailsSent: 14,
        queued: 1,
        skippedEmails: ['yaexiste@triunfo.com', 'otro@triunfo.com'],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Emails duplicados dentro del payload',
  })
  @ApiResponse({ status: 409, description: 'Todos los usuarios ya existen' })
  @ApiResponse({ status: 429, description: 'Demasiadas solicitudes' })
  bulkRegister(@Body() dto: BulkRegisterDto) {
    return this.authService.bulkRegister(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottleGuard)
  @Throttle({ limit: 20, windowMs: 60_000 })
  @ApiOperation({
    summary: 'Login',
    description:
      'Devuelve un JWT Bearer token con expiración de 7 días. Rate limit: 20 intentos/min por IP.',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas o cuenta inactiva',
  })
  @ApiResponse({ status: 429, description: 'Demasiados intentos' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Usuario autenticado',
    description: 'Devuelve el perfil completo con puntos actualizados.',
  })
  @ApiResponse({ status: 200, description: 'Perfil del usuario' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  getMe(@Request() req) {
    return this.usersService.getMe(req.user.id);
  }
}
