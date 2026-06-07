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
import { AlbumService } from './album.service';
import {
  CreateTradeDto,
  QuerySectionDto,
  QueryTradesDto,
} from './dto/album.dto';
import { TradeStatus } from './entities/trade-offer.entity';

@ApiTags('Álbum e Intercambios')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller()
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  // ─── Álbum propio ─────────────────────────────────────────────────────────

  @Get('album/me')
  @ApiOperation({
    summary: 'Resumen del álbum propio',
    description:
      'Vista general del álbum del usuario autenticado: porcentaje global de completitud, ' +
      'desglose por área con cantidad de figuritas poseídas vs totales, y cuántas áreas ' +
      'están completas al 100%.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        sections: [
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
        totalStickers: 200,
        ownedStickers: 87,
        percentage: 44,
        completedAreas: 1,
      },
    },
  })
  getMyAlbum(@Request() req) {
    return this.albumService.getAlbumSummary(req.user.id);
  }

  @Get('album/me/section')
  @ApiOperation({
    summary: 'Detalle de una sección del álbum',
    description:
      'Devuelve todas las figuritas de un área con su estado: si el usuario la tiene ' +
      '(`owned`), cuántas tiene (`quantity`) y si está repetida (`isDuplicate`). ' +
      'Sin parámetro `area` devuelve todas las secciones.',
  })
  @ApiQuery({
    name: 'area',
    required: false,
    example: 'Marketing',
    description: 'Nombre del área (parcial)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        {
          area: 'Marketing',
          ownedCount: 5,
          totalCount: 22,
          percentage: 23,
          stickers: [
            {
              sticker: {
                id: 17,
                nickname: 'Luci',
                stickerNumber: 17,
                area: 'Marketing',
              },
              owned: true,
              quantity: 2,
              isDuplicate: true,
            },
            {
              sticker: {
                id: 18,
                nickname: 'Sofi',
                stickerNumber: 18,
                area: 'Marketing',
              },
              owned: false,
              quantity: 0,
              isDuplicate: false,
            },
          ],
        },
      ],
    },
  })
  getSection(@Request() req, @Query() query: QuerySectionDto) {
    return this.albumService.getSectionDetail(req.user.id, query);
  }

  @Get('album/me/missing')
  @ApiOperation({
    summary: 'Figuritas que me faltan',
    description:
      'Lista todas las figuritas que el usuario **no tiene** todavía, ' +
      'agrupadas por área. Útil para buscar compañeros que las tengan repetidas ' +
      'y proponerles un intercambio.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        {
          area: 'Marketing',
          missing: [
            {
              id: 18,
              nickname: 'Sofi',
              stickerNumber: 18,
              area: 'Marketing',
              position: 'Diseñadora',
            },
          ],
        },
      ],
    },
  })
  getMyMissing(@Request() req) {
    return this.albumService.getMissingStickers(req.user.id);
  }

  // ─── Álbum de otro usuario ────────────────────────────────────────────────

  @Get('album/:userId')
  @ApiOperation({
    summary: 'Resumen del álbum de otro usuario',
    description:
      'Ver el progreso del álbum de un compañero. ' +
      'Útil para saber si le conviene un intercambio antes de proponerlo.',
  })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Resumen del álbum del usuario solicitado',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  getOtherAlbum(@Param('userId', ParseIntPipe) userId: number) {
    return this.albumService.getAlbumSummary(userId);
  }

  @Get('album/:userId/missing')
  @ApiOperation({
    summary: 'Figuritas que le faltan a otro usuario',
    description:
      'Ver qué le falta a un compañero. ' +
      'Combinado con `GET /packs/collection/me?duplicatesOnly=true` permite ' +
      'encontrar coincidencias para intercambios.',
  })
  @ApiParam({ name: 'userId', type: Number })
  getOtherMissing(@Param('userId', ParseIntPipe) userId: number) {
    return this.albumService.getMissingStickers(userId);
  }

  // ─── Intercambios ─────────────────────────────────────────────────────────

  @Get('trades/me')
  @ApiOperation({
    summary: 'Mis intercambios',
    description:
      'Lista todos los intercambios del usuario autenticado, ' +
      'separados en `sent` (propuestas enviadas) y `received` (recibidas). ' +
      'Cada oferta incluye los datos completos de ambas figuritas para que ' +
      'el usuario pueda evaluar antes de aceptar.',
  })
  @ApiQuery({ name: 'status', required: false, enum: TradeStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        sent: [
          {
            id: 5,
            status: 'pending',
            offeredUserSticker: {
              stickerId: 17,
              quantity: 2,
              sticker: { nickname: 'Luci', area: 'Marketing' },
            },
            requestedUserSticker: {
              stickerId: 42,
              sticker: { nickname: 'Carlos', area: 'Comercial' },
            },
            toUser: { id: 7, fullName: 'Pablo García' },
            message: '¿Hacemos el cambio?',
            expiresAt: '2026-06-14T10:00:00-03:00',
          },
        ],
        received: [],
        total: 1,
      },
    },
  })
  getMyTrades(@Request() req, @Query() query: QueryTradesDto) {
    return this.albumService.getMyTrades(req.user.id, query);
  }

  @Get('trades/:id')
  @ApiOperation({
    summary: 'Detalle de un intercambio',
    description:
      'Devuelve el detalle completo de una oferta de intercambio con ambas figuritas ' +
      'y los perfiles de los usuarios involucrados. ' +
      'Solo accesible para el emisor o el receptor.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Detalle del intercambio' })
  @ApiResponse({ status: 403, description: 'No sos parte de este intercambio' })
  @ApiResponse({ status: 404, description: 'Intercambio no encontrado' })
  getTradeDetail(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.albumService.getTradeDetail(id, req.user.id);
  }

  @Post('trades')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Proponer un intercambio',
    description:
      'Crea una nueva oferta de canje entre el usuario autenticado y otro usuario.\n\n' +
      '**Requisitos:**\n' +
      '- `offeredUserStickerId`: ID del **UserSticker** que ofrecés (debe ser tuyo y tener `quantity > 1`).\n' +
      '- `toUserId`: ID del usuario al que le proponés el canje.\n' +
      '- `requestedUserStickerId`: ID del **UserSticker** que querés recibir (debe pertenecer a `toUserId`).\n\n' +
      'La oferta vence automáticamente a las **72 horas** si no recibe respuesta.\n\n' +
      '**Flujo recomendado en la UI:**\n' +
      '1. Ver las figuritas repetidas propias: `GET /packs/collection/me?duplicatesOnly=true`\n' +
      '2. Ver las faltantes del compañero: `GET /album/:userId/missing`\n' +
      '3. Si hay coincidencia → proponer el intercambio con este endpoint.',
  })
  @ApiResponse({
    status: 201,
    description: 'Oferta creada',
    schema: {
      example: {
        id: 5,
        fromUserId: 1,
        toUserId: 7,
        offeredUserStickerId: 12,
        requestedUserStickerId: 28,
        status: 'pending',
        message: '¿Hacemos el cambio?',
        expiresAt: '2026-06-14T10:00:00-03:00',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Figurita no repetida, no existe, o ya hay oferta pendiente',
  })
  @ApiResponse({ status: 404, description: 'Figurita o usuario no encontrado' })
  createTrade(@Request() req, @Body() dto: CreateTradeDto) {
    return this.albumService.createTrade(req.user.id, dto);
  }

  @Patch('trades/:id/accept')
  @ApiOperation({
    summary: 'Aceptar un intercambio',
    description:
      'El **receptor** acepta la oferta. El swap se realiza de forma atómica:\n\n' +
      '1. La figurita ofrecida pasa a la colección del receptor.\n' +
      '2. La figurita pedida pasa a la colección del emisor.\n' +
      '3. Se descuenta 1 de `quantity` en cada colección original.\n' +
      '4. Si `quantity` llega a 0, el UserSticker se elimina.\n\n' +
      'Si alguna figurita ya no está disponible (fue canjeada en otra oferta), ' +
      'se lanza un error 400.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Intercambio realizado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Figurita ya no disponible, oferta vencida o estado inválido',
  })
  @ApiResponse({ status: 403, description: 'Solo el receptor puede aceptar' })
  acceptTrade(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.albumService.acceptTrade(id, req.user.id);
  }

  @Patch('trades/:id/reject')
  @ApiOperation({
    summary: 'Rechazar un intercambio',
    description:
      'El **receptor** rechaza la oferta. No se realizan cambios en las colecciones.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Oferta rechazada' })
  @ApiResponse({ status: 403, description: 'Solo el receptor puede rechazar' })
  rejectTrade(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.albumService.rejectTrade(id, req.user.id);
  }

  @Patch('trades/:id/cancel')
  @ApiOperation({
    summary: 'Cancelar un intercambio',
    description:
      'El **emisor** cancela su propia oferta mientras sigue en estado PENDING.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Oferta cancelada' })
  @ApiResponse({ status: 403, description: 'Solo el emisor puede cancelar' })
  cancelTrade(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.albumService.cancelTrade(id, req.user.id);
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  @Get('admin/trades')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '[ADMIN] Ver todos los intercambios',
    description:
      'Listado global de intercambios con filtros por estado. Útil para moderar.',
  })
  @ApiQuery({ name: 'status', required: false, enum: TradeStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getAllTrades(@Query() query: QueryTradesDto) {
    // Reutilizamos getMyTrades con userId=0 (admin ve todos)
    // En producción convendría un método dedicado en el service
    return this.albumService.getMyTrades(0, query);
  }
}
