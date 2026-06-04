import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import {
  CreateMatchDto,
  QueryMatchesDto,
  QueryPicksDto,
  SetResultDto,
  UpdateMatchDto,
  UpsertPickDto,
} from './dto/prode.dto';
import { MatchStage } from './entities/match.entity';
import { ProdeService } from './prode.service';

@ApiTags('Prode')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('prode')
export class ProdeController {
  constructor(private readonly prodeService: ProdeService) {}

  // ─── Partidos (usuarios) ──────────────────────────────────────────────────

  @Get('matches')
  @ApiOperation({
    summary: 'Listar partidos',
    description:
      'Devuelve todos los partidos del torneo con sus fechas, equipos y resultado ' +
      '(si ya jugaron). Usar `upcoming=true` para ver solo los que todavía aceptan predicciones.',
  })
  @ApiQuery({
    name: 'upcoming',
    required: false,
    type: Boolean,
    description: 'Solo partidos con predicciones abiertas',
  })
  @ApiQuery({
    name: 'stage',
    required: false,
    enum: MatchStage,
    description: 'Filtrar por fase del torneo',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Lista de partidos',
    schema: {
      example: {
        data: [
          {
            id: 1,
            homeTeam: 'Argentina',
            awayTeam: 'España',
            matchDate: '2026-06-11T18:00:00-03:00',
            picksCloseAt: '2026-06-10T23:59:00-03:00',
            stage: 'Fase de grupos',
            group: 'A',
            scoreHome: null,
            scoreAway: null,
            isFinished: false,
          },
        ],
        total: 64,
      },
    },
  })
  findMatches(@Query() query: QueryMatchesDto) {
    return this.prodeService.findMatches(query);
  }

  @Get('matches/:id')
  @ApiOperation({
    summary: 'Detalle de un partido',
    description:
      'Devuelve el detalle completo de un partido incluyendo resultado si está disponible.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del partido' })
  @ApiResponse({ status: 200, description: 'Datos del partido' })
  @ApiResponse({ status: 404, description: 'Partido no encontrado' })
  findMatch(@Param('id', ParseIntPipe) id: number) {
    return this.prodeService.findMatchById(id);
  }

  // ─── Predicciones del usuario ─────────────────────────────────────────────

  @Post('matches/:id/pick')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Crear o actualizar predicción',
    description:
      'Envía o modifica la predicción del usuario autenticado para un partido. ' +
      '**Solo se puede predecir hasta `picksCloseAt`** (por defecto, el día anterior al partido). ' +
      'Si ya existe una predicción para ese partido, se reemplaza. ' +
      'Un mismo usuario no puede tener dos predicciones para el mismo partido.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del partido a predecir',
  })
  @ApiResponse({
    status: 200,
    description: 'Predicción guardada',
    schema: {
      example: {
        id: 42,
        userId: 1,
        matchId: 1,
        predictedHome: 2,
        predictedAway: 1,
        pointsEarned: null,
        createdAt: '2026-06-10T15:30:00.000Z',
        updatedAt: '2026-06-10T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Plazo vencido o partido ya finalizado',
  })
  @ApiResponse({ status: 404, description: 'Partido no encontrado' })
  upsertPick(
    @Request() req,
    @Param('id', ParseIntPipe) matchId: number,
    @Body() dto: UpsertPickDto,
  ) {
    return this.prodeService.upsertPick(req.user.id, matchId, dto);
  }

  @Get('picks/me')
  @ApiOperation({
    summary: 'Mis predicciones',
    description:
      'Devuelve todas las predicciones del usuario autenticado con el resultado de cada una. ' +
      '`pointsEarned = null` significa que el partido aún no terminó. ' +
      '`pointsEarned = 0` significa que no acertó.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: [
          {
            id: 42,
            matchId: 1,
            predictedHome: 2,
            predictedAway: 1,
            pointsEarned: 10,
            match: {
              homeTeam: 'Argentina',
              awayTeam: 'España',
              scoreHome: 2,
              scoreAway: 1,
            },
          },
        ],
        total: 8,
      },
    },
  })
  getMyPicks(@Request() req, @Query() query: QueryPicksDto) {
    return this.prodeService.getMyPicks(req.user.id, query);
  }

  @Get('picks/me/match/:matchId')
  @ApiOperation({
    summary: 'Mi predicción para un partido específico',
    description:
      'Útil para pre-cargar el formulario de predicción con el valor guardado. ' +
      'Devuelve `null` si todavía no predijo ese partido.',
  })
  @ApiParam({ name: 'matchId', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Predicción del usuario para ese partido (o null)',
  })
  getPickForMatch(
    @Request() req,
    @Param('matchId', ParseIntPipe) matchId: number,
  ) {
    return this.prodeService.getPickForMatch(req.user.id, matchId);
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  @Post('admin/matches')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '[ADMIN] Crear partido',
    description:
      'Carga un nuevo partido al sistema. ' +
      'Si no se envía `picksCloseAt`, se calcula automáticamente como **24 horas antes** del partido. ' +
      'Los usuarios solo podrán predecir hasta ese momento.',
  })
  @ApiResponse({
    status: 201,
    description: 'Partido creado',
    schema: {
      example: {
        id: 1,
        homeTeam: 'Argentina',
        awayTeam: 'España',
        matchDate: '2026-06-11T18:00:00-03:00',
        picksCloseAt: '2026-06-10T18:00:00-03:00',
        stage: 'Fase de grupos',
        group: 'A',
        isFinished: false,
        pointsProcessed: false,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'picksCloseAt debe ser anterior al partido',
  })
  createMatch(@Body() dto: CreateMatchDto) {
    return this.prodeService.createMatch(dto);
  }

  @Patch('admin/matches/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '[ADMIN] Editar partido',
    description:
      'Modifica datos de un partido (equipos, fecha, fase, grupo). ' +
      '**No se puede editar un partido ya finalizado** — para corregir el resultado ' +
      'usar `PATCH /prode/admin/matches/:id/result`.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Partido actualizado' })
  @ApiResponse({ status: 400, description: 'El partido ya finalizó' })
  @ApiResponse({ status: 404, description: 'Partido no encontrado' })
  updateMatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMatchDto,
  ) {
    return this.prodeService.updateMatch(id, dto);
  }

  @Patch('admin/matches/:id/result')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '[ADMIN] Cargar resultado y distribuir puntos',
    description:
      'Registra el resultado final del partido y **acredita automáticamente los puntos** ' +
      'a todos los usuarios que predijeron correctamente:\n\n' +
      '- Resultado exacto → `PRODE_EXACT_POINTS` (default: **10 pts**)\n' +
      '- Ganador / empate correcto → `PRODE_WINNER_POINTS` (default: **5 pts**)\n\n' +
      'La operación es idempotente: si se vuelve a llamar (ej. corrección de resultado), ' +
      'solo re-procesa los picks que aún no tienen puntos asignados. ' +
      'Los puntos ya acreditados **no se revierten** (consideración de diseño).',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del partido' })
  @ApiResponse({
    status: 200,
    description: 'Resultado cargado y puntos distribuidos',
    schema: {
      example: {
        match: {
          id: 1,
          homeTeam: 'Argentina',
          awayTeam: 'España',
          scoreHome: 2,
          scoreAway: 1,
          isFinished: true,
        },
        processed: 87,
        pointsAwarded: 520,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Partido no encontrado' })
  setResult(@Param('id', ParseIntPipe) id: number, @Body() dto: SetResultDto) {
    return this.prodeService.setResult(id, dto);
  }
}
