import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { MailService } from './mail.service';

@ApiTags('Mail (Admin)')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  /**
   * GET /admin/mail/failed
   * Lista los emails fallidos o agotados para revisión manual.
   */
  @Get('failed')
  @ApiOperation({
    summary: '[ADMIN] Ver emails fallidos',
    description:
      'Lista los emails que fallaron (FAILED) o que agotaron sus reintentos (EXHAUSTED). Usar el ID para forzar reenvío.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de emails fallidos',
  })
  findFailed(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.mailService.findFailed(+page, +limit);
  }

  /**
   * POST /admin/mail/:id/retry
   * Fuerza el reenvío inmediato de un email fallido.
   * Útil cuando el SMTP estaba caído y ahora está disponible.
   */
  @Post(':id/retry')
  @ApiOperation({
    summary: '[ADMIN] Forzar reenvío de un email',
    description:
      'Resetea el estado a PENDING y dispara el envío inmediatamente, independientemente del backoff. El cron seguirá reintentando si vuelve a fallar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email reenviado (o re-encolado si falla)',
  })
  @ApiResponse({ status: 404, description: 'Email no encontrado en la cola' })
  retryOne(@Param('id', ParseIntPipe) id: number) {
    return this.mailService.retryOne(id);
  }
}
