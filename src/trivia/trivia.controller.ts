import {
  Body,
  Controller,
  Delete,
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
  AnswerQuestionDto,
  BulkCreateQuestionsDto,
  CreateQuestionDto,
  QueryQuestionsDto,
  UpdateQuestionDto,
} from './dto/trivia.dto';
import { TriviaCategory } from './entities/trivia-question.entity';
import { TriviaService } from './trivia.service';

@ApiTags('Trivia')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('trivia')
export class TriviaController {
  constructor(private readonly triviaService: TriviaService) {}

  // ─── Estado de vidas ──────────────────────────────────────────────────────

  @Get('lives')
  @ApiOperation({
    summary: 'Estado de vidas del usuario',
    description:
      'Devuelve las vidas actuales del usuario y cuándo se regenera la próxima.\n\n' +
      '**Sistema de vidas:**\n' +
      '- Empezás con `TRIVIA_MAX_LIVES` vidas (default: 5).\n' +
      '- Cada respuesta **incorrecta** consume 1 vida.\n' +
      '- Las respuestas correctas **no** consumen vidas.\n' +
      '- Cada vida se regenera después de `TRIVIA_LIFE_REGEN_MINUTES` minutos (default: 360 = 6h).\n' +
      '- Sin vidas no podés responder hasta que se regenere al menos 1.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        current: 3,
        max: 5,
        nextRegenInMs: 7320000,
        nextRegenAt: '2026-06-11T08:00:00-03:00',
      },
    },
  })
  getLives(@Request() req) {
    return this.triviaService.getLivesStatus(req.user.id);
  }

  // ─── Flujo de juego ───────────────────────────────────────────────────────

  @Get('question')
  @ApiOperation({
    summary: 'Obtener una pregunta para responder',
    description:
      'Devuelve una pregunta aleatoria que el usuario **no respondió aún**.\n\n' +
      'Si no quedan vidas disponibles responde 400 con el tiempo restante para la próxima regeneración.\n\n' +
      '**Las opciones no incluyen cuál es la correcta** (`isCorrect` no se expone). ' +
      'La respuesta incluye el estado de vidas actualizado para sincronizar el frontend.',
  })
  @ApiQuery({ name: 'category', required: false, enum: TriviaCategory })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        question: {
          id: 7,
          question: '¿En qué año Argentina ganó su primer Mundial?',
          category: 'Mundial',
          points: 10,
        },
        options: [
          { id: 1, questionId: 7, text: '1930', order: 0 },
          { id: 2, questionId: 7, text: '1978', order: 1 },
          { id: 3, questionId: 7, text: '1986', order: 2 },
          { id: 4, questionId: 7, text: '1966', order: 3 },
        ],
        lives: { current: 4, max: 5, nextRegenInMs: null, nextRegenAt: null },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Sin vidas disponibles',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Sin vidas disponibles. La próxima vida se regenera en 122 minutos.',
      },
    },
  })
  getQuestion(@Request() req, @Query('category') category?: TriviaCategory) {
    return this.triviaService.getQuestion(req.user.id, category);
  }

  @Post('question/:id/answer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Responder una pregunta',
    description:
      'Registra la respuesta y devuelve el resultado.\n\n' +
      '**Respuesta correcta:** se acreditan los puntos de la pregunta. No se gasta vida.\n\n' +
      '**Respuesta incorrecta:** se gasta 1 vida. No se acreditan puntos. ' +
      'La vida gastada se regenera automáticamente después de `TRIVIA_LIFE_REGEN_MINUTES`.\n\n' +
      'La respuesta siempre incluye `correctOption` (para mostrar la opción correcta en el UI) ' +
      'y el estado de vidas actualizado.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la pregunta' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        isCorrect: false,
        correctOption: { id: 2, text: '1978', isCorrect: true },
        pointsEarned: 0,
        lives: {
          current: 3,
          max: 5,
          nextRegenInMs: 21600000,
          nextRegenAt: '2026-06-11T14:00:00-03:00',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Sin vidas, pregunta ya respondida, u opción inválida',
  })
  @ApiResponse({ status: 404, description: 'Pregunta no encontrada' })
  answerQuestion(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AnswerQuestionDto,
  ) {
    return this.triviaService.answerQuestion(req.user.id, id, dto);
  }

  // ─── Historial y stats ────────────────────────────────────────────────────

  @Get('history/me')
  @ApiOperation({
    summary: 'Mi historial de respuestas',
    description:
      'Lista todos los intentos del usuario con el resultado y si consumió una vida.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: [
          {
            id: 1,
            questionId: 7,
            isCorrect: false,
            pointsEarned: 0,
            usedLife: true,
            answeredAt: '2026-06-10T15:30:00-03:00',
            question: {
              question: '¿En qué año Argentina ganó su primer Mundial?',
              category: 'Mundial',
            },
          },
        ],
        total: 5,
      },
    },
  })
  getHistory(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.triviaService.getMyHistory(req.user.id, +page, +limit);
  }

  @Get('stats/me')
  @ApiOperation({
    summary: 'Mis estadísticas de trivia',
    description:
      'Resumen de desempeño: tasa de acierto, puntos ganados, vidas perdidas y desglose por categoría.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        total: 15,
        correct: 9,
        accuracy: 60,
        totalPoints: 75,
        livesLost: 6,
        byCategory: {
          Mundial: { total: 8, correct: 5 },
          'Triunfo Seguros': { total: 4, correct: 3 },
          'Cultura general': { total: 3, correct: 1 },
        },
      },
    },
  })
  getMyStats(@Request() req) {
    return this.triviaService.getMyStats(req.user.id);
  }

  // ─── Admin: gestión ───────────────────────────────────────────────────────

  @Get('admin/questions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '[ADMIN] Listar preguntas',
    description:
      'Lista todas las preguntas con sus opciones. Filtrable por categoría y estado.',
  })
  @ApiQuery({ name: 'category', required: false, enum: TriviaCategory })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() query: QueryQuestionsDto) {
    return this.triviaService.findAll(query);
  }

  @Get('admin/questions/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Detalle de una pregunta con opciones' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.triviaService.findOne(id);
  }

  @Post('admin/questions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '[ADMIN] Crear una pregunta',
    description:
      'Crea pregunta + opciones en una operación. ' +
      'Entre 2 y 4 opciones, exactamente 1 con `isCorrect: true`.',
  })
  @ApiResponse({ status: 201, description: 'Pregunta creada' })
  @ApiResponse({
    status: 400,
    description: 'Error de validación en las opciones',
  })
  createOne(@Body() dto: CreateQuestionDto) {
    return this.triviaService.createOne(dto);
  }

  @Post('admin/questions/bulk')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '[ADMIN] Cargar preguntas en bulk',
    description:
      'Hasta **50 preguntas** en una sola transacción. ' +
      'Si alguna tiene error de validación, **ninguna** se guarda.',
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        created: 10,
        questions: [
          { id: 1, question: '¿En qué año...?', category: 'Mundial' },
        ],
      },
    },
  })
  bulkCreate(@Body() dto: BulkCreateQuestionsDto) {
    return this.triviaService.bulkCreate(dto);
  }

  @Patch('admin/questions/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '[ADMIN] Editar una pregunta',
    description:
      'Si se envía `options`, reemplaza todas las opciones existentes.',
  })
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.triviaService.update(id, dto);
  }

  @Delete('admin/questions/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '[ADMIN] Eliminar una pregunta',
    description:
      'Elimina en cascada opciones e intentos. Preferir `isActive: false` si hay estadísticas.',
  })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.triviaService.remove(id);
  }

  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Estadísticas globales de trivia' })
  getAdminStats() {
    return this.triviaService.getAdminStats();
  }
}
