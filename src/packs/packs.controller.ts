import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
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
import { QueryCollectionDto, QueryPackHistoryDto } from './dto/packs.dto';
import { PacksService } from './packs.service';

@ApiTags('Sobres y Colección')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('packs')
export class PacksController {
  constructor(private readonly packsService: PacksService) {}

  // ─── Abrir sobre ──────────────────────────────────────────────────────────

  @Post('open')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Abrir un sobre',
    description:
      `Canjea **PACK_COST_POINTS** pts (default: 150) y otorga **PACK_STICKERS_PER_PACK** ` +
      `figuritas al azar (default: 5).\n\n` +
      `**Algoritmo de sorteo:** se garantiza variedad mezclando todas las figuritas ` +
      `del pool con Fisher-Yates y limitando a máx. 2 por área por sobre.\n\n` +
      `Si alguna figurita obtenida ya estaba en la colección, ` +
      `se incrementa su \`quantity\` (repetida → disponible para intercambio).\n\n` +
      `**Bonus de área:** si al abrir este sobre el usuario completa el 100% de un área, ` +
      `recibe automáticamente **AREA_COMPLETION_POINTS** pts adicionales (default: 100). ` +
      `El bonus se acredita una sola vez por área por usuario.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Sobre abierto exitosamente',
    schema: {
      example: {
        pack: {
          id: 14,
          openedById: 1,
          stickerIds: [4, 17, 23, 5, 9],
          pointsCost: 150,
          openedAt: '2026-06-10T15:30:00.000Z',
        },
        stickers: [
          {
            id: 4,
            nickname: 'Pabli',
            area: 'Comercial',
            stickerNumber: 4,
            useAvatar: true,
          },
          {
            id: 17,
            nickname: 'Luci',
            area: 'Marketing',
            stickerNumber: 17,
            photoUrl: '/uploads/stickers/abc.jpg',
          },
        ],
        newStickers: 4,
        duplicates: 1,
        areaCompletionBonus: [{ area: 'Legal', points: 100 }],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Puntos insuficientes o no hay figuritas disponibles',
    schema: {
      example: {
        statusCode: 400,
        message: 'Puntos insuficientes. Tenés 80 y el sobre cuesta 150 pts.',
      },
    },
  })
  openPack(@Request() req) {
    return this.packsService.openPack(req.user.id);
  }

  // ─── Colección ────────────────────────────────────────────────────────────

  @Get('collection/me')
  @ApiOperation({
    summary: 'Mi colección de figuritas',
    description:
      'Devuelve todas las figuritas del usuario con su cantidad. ' +
      'Usar `duplicatesOnly=true` para ver solo las repetidas (disponibles para canje). ' +
      'Filtrar por `area` para buscar figuritas de un sector específico.',
  })
  @ApiQuery({ name: 'duplicatesOnly', required: false, type: Boolean })
  @ApiQuery({
    name: 'area',
    required: false,
    type: String,
    example: 'Marketing',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: [
          {
            id: 1,
            stickerId: 4,
            quantity: 1,
            sticker: {
              id: 4,
              nickname: 'Pabli',
              area: 'Comercial',
              stickerNumber: 4,
            },
          },
          {
            id: 2,
            stickerId: 17,
            quantity: 2,
            sticker: {
              id: 17,
              nickname: 'Luci',
              area: 'Marketing',
              stickerNumber: 17,
            },
          },
        ],
        total: 23,
      },
    },
  })
  getCollection(@Request() req, @Query() query: QueryCollectionDto) {
    return this.packsService.getCollection(req.user.id, query);
  }

  @Get('collection/me/duplicates')
  @ApiOperation({
    summary: 'Mis figuritas repetidas',
    description:
      'Atajo para ver solo las figuritas con `quantity > 1`. ' +
      'Útil en la zona de intercambios para saber qué tenés disponible para ofrecer.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        {
          id: 2,
          stickerId: 17,
          quantity: 2,
          sticker: { nickname: 'Luci', area: 'Marketing', stickerNumber: 17 },
        },
      ],
    },
  })
  getDuplicates(@Request() req) {
    return this.packsService.getDuplicates(req.user.id);
  }

  @Get('album/me')
  @ApiOperation({
    summary: 'Progreso del álbum por área',
    description:
      'Muestra el avance del álbum agrupado por área. ' +
      'Cada entrada indica cuántas figuritas existen en el sistema para esa área, ' +
      'cuántas tiene el usuario y el porcentaje de completitud. ' +
      'Cuando `isComplete: true` el usuario ya cobró (o cobrará en el próximo sobre) ' +
      'el **bonus de área**.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        {
          area: 'Comercial',
          totalStickers: 30,
          ownedStickers: 18,
          percentage: 60,
          isComplete: false,
        },
        {
          area: 'Legal',
          totalStickers: 8,
          ownedStickers: 8,
          percentage: 100,
          isComplete: true,
        },
        {
          area: 'Marketing',
          totalStickers: 22,
          ownedStickers: 5,
          percentage: 23,
          isComplete: false,
        },
      ],
    },
  })
  getAlbumProgress(@Request() req) {
    return this.packsService.getAlbumProgress(req.user.id);
  }

  // ─── Colección de otro usuario (para intercambios) ────────────────────────

  @Get('collection/:userId')
  @ApiOperation({
    summary: 'Colección de otro usuario',
    description:
      'Devuelve la colección de un compañero. ' +
      'Usado en la zona de intercambios para ver qué tiene el otro y qué le falta, ' +
      'antes de proponer un canje.',
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    description: 'ID del usuario a consultar',
  })
  @ApiQuery({ name: 'duplicatesOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'area', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Colección del compañero' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  getOtherCollection(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: QueryCollectionDto,
  ) {
    return this.packsService.getCollection(userId, query);
  }

  @Get('album/:userId')
  @ApiOperation({
    summary: 'Progreso del álbum de otro usuario',
    description: 'Ver el avance por área de un compañero.',
  })
  @ApiParam({ name: 'userId', type: Number })
  getOtherAlbumProgress(@Param('userId', ParseIntPipe) userId: number) {
    return this.packsService.getAlbumProgress(userId);
  }

  // ─── Historial de sobres ──────────────────────────────────────────────────

  @Get('history/me')
  @ApiOperation({
    summary: 'Historial de sobres abiertos',
    description:
      'Lista todos los sobres que abrió el usuario ordenados por fecha descendente. ' +
      'Cada registro incluye los IDs de las figuritas obtenidas y el costo en puntos.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: [
          {
            id: 14,
            stickerIds: [4, 17, 23, 5, 9],
            pointsCost: 150,
            openedAt: '2026-06-10T15:30:00.000Z',
          },
        ],
        total: 3,
      },
    },
  })
  getHistory(@Request() req, @Query() query: QueryPackHistoryDto) {
    return this.packsService.getPackHistory(req.user.id, query);
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '[ADMIN] Estadísticas de sobres',
    description:
      'Métricas generales del sistema de sobres: total de sobres abiertos, ' +
      'figuritas distribuidas, usuarios coleccionistas y top 10 abrores.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        totalPacksOpened: 142,
        totalStickersDistributed: 710,
        uniqueCollectors: 87,
        topOpeners: [{ userId: 5, fullName: 'Pablo García', packs: 12 }],
      },
    },
  })
  getAdminStats() {
    return this.packsService.getAdminStats();
  }
}
