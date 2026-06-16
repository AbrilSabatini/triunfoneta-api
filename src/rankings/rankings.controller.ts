import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RankingsService } from './rankings.service';

@ApiTags('Rankings')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get('prode')
  @ApiOperation({
    summary: 'Top usuarios por puntos en el prode',
    description:
      'Ranking de usuarios con más puntos acumulados en el prode ' +
      '(resultados exactos y ganadores acertados). Solo muestra usuarios con puntos > 0.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
    description: 'Cantidad de posiciones (default: 20)',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        { id: 1, fullName: 'Ana García', totalPoints: 85 },
        { id: 2, fullName: 'Carlos Pérez', totalPoints: 72 },
      ],
    },
  })
  getProdeRanking(@Query('limit') limit?: number) {
    return this.rankingsService.getProdeRanking(limit ?? 20);
  }

  @Get('stickers')
  @ApiOperation({
    summary: 'Top usuarios por figuritas coleccionadas',
    description:
      'Ranking de usuarios con más figuritas distintas en su colección ' +
      'junto con el porcentaje de completitud del álbum.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        { id: 1, fullName: 'Ana García', stickersCollected: 42, percentage: 58.33 },
        { id: 2, fullName: 'Carlos Pérez', stickersCollected: 38, percentage: 52.78 },
      ],
    },
  })
  getStickersRanking(@Query('limit') limit?: number) {
    return this.rankingsService.getStickersRanking(limit ?? 20);
  }

  @Get('trivia')
  @ApiOperation({
    summary: 'Top usuarios por preguntas de trivia acertadas',
    description:
      'Ranking de usuarios con más respuestas correctas en la trivia ' +
      '(sin contar las que usaron vida).',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        { id: 1, fullName: 'Ana García', correctAnswers: 15 },
        { id: 2, fullName: 'Carlos Pérez', correctAnswers: 12 },
      ],
    },
  })
  getTriviaRanking(@Query('limit') limit?: number) {
    return this.rankingsService.getTriviaRanking(limit ?? 20);
  }
}
