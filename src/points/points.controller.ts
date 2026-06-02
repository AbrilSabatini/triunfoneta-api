import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PointsService } from './points.service';

@ApiTags('Puntos')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Saldo de puntos del usuario autenticado' })
  @ApiResponse({ status: 200, schema: { example: { points: 150 } } })
  getBalance(@Request() req) {
    return this.pointsService.getBalance(req.user.id);
  }

  @Get('me/history')
  @ApiOperation({
    summary: 'Historial de transacciones de puntos',
    description:
      'Devuelve cada suma o resta de puntos con su motivo (PRODE_EXACT, TRIVIA, STICKER_CREATED, etc.) paginado.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Lista paginada de transacciones' })
  getHistory(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.pointsService.getHistory(req.user.id, +page, +limit);
  }
}
