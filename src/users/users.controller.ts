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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  ChangePasswordDto,
  CreateStickerDto,
  QueryUsersDto,
  UpdateStickerDto,
  UpdateUserAdminDto,
  UpdateUserDto,
} from './dto/users.dto';
import { UserRole } from './entities/user.entity';
import { multerStickerConfig } from './multer.config';
import { UsersService } from './users.service';

@ApiTags('Usuario')
@ApiBearerAuth('jwt')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── Listado público (visible para todos los empleados) ─────────────────────

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Listar empleados (público)',
    description:
      'Lista todos los empleados activos con sus datos básicos ' +
      'Visible para cualquier usuario autenticado. ' +
      'Útil para buscar compañeros en la zona de intercambios.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar por nombre',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: [
          {
            id: 2,
            fullName: 'Pablo García',
            area: { id: 1, name: 'Comercial' },
          },
        ],
        total: 87,
      },
    },
  })
  @ApiQuery({
    name: 'areaId',
    required: false,
    type: Number,
    description: 'Filtrar por área',
  })
  listPublicUsers(
    @Query('search') search?: string,
    @Query('areaId') areaId?: number,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.usersService.listPublicUsers(
      search,
      areaId ? +areaId : undefined,
      +page,
      +limit,
    );
  }

  // ─── Perfil propio ────────────────────────────────────────────────────────

  @Get('users/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Perfil del usuario autenticado',
    description:
      'Devuelve el perfil completo del usuario autenticado junto con su saldo actual de puntos ' +
      'y la relación con su área.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    schema: {
      example: {
        id: 1,
        email: 'ana@triunfo.com',
        fullName: 'Ana García',
        role: 'user',
        points: 150,
        stickerCreated: true,
        isActive: true,
        area: { id: 3, name: 'Marketing', color: '#e63946', emoji: '🎯' },
        createdAt: '2025-06-01T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  getMe(@Request() req) {
    return this.usersService.getMe(req.user.id);
  }

  @Patch('users/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Actualizar perfil propio',
    description:
      'Permite modificar el nombre y/o el área del usuario autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Perfil actualizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  updateMe(@Request() req, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(req.user.id, dto);
  }

  // ─── Figurita propia ──────────────────────────────────────────────────────

  @Get('users/me/sticker')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Ver mi figurita',
    description:
      'Devuelve la figurita del usuario autenticado. ' +
      'Si aún no fue creada, responde con 404 y un mensaje orientativo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Figurita del usuario',
    schema: {
      example: {
        id: 12,
        userId: 1,
        nickname: 'Anita',
        photoUrl: '/uploads/stickers/xyz.jpg',
        useAvatar: false,
        avatarColor: '#e63946',
        funFact: 'Campeona del metegol de la oficina.',
        yearsInCompany: 3,
        position: 'Marketing Lead',
        area: 'Marketing',
        stickerNumber: 42,
        createdAt: '2025-06-01T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'El usuario todavía no creó su figurita',
  })
  getMySticker(@Request() req) {
    return this.usersService.getMySticker(req.user.id);
  }

  @Post('users/me/sticker')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear figurita (una sola vez)',
    description:
      'Crea la figurita del usuario. **Solo puede ejecutarse una vez por cuenta.** ' +
      `Al crearse otorga los puntos configurados en STICKER_CREATION_POINTS (default: 50pts). ` +
      'Si el usuario no quiere subir foto puede usar useAvatar=true con un color HEX.',
  })
  @ApiResponse({
    status: 201,
    description: 'Figurita creada y puntos acreditados',
    schema: {
      example: {
        id: 12,
        nickname: 'Anita',
        stickerNumber: 42,
        area: 'Marketing',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'La figurita ya fue creada para este usuario',
  })
  createSticker(@Request() req, @Body() dto: CreateStickerDto) {
    return this.usersService.createSticker(req.user.id, dto);
  }

  @Patch('users/me/sticker')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Editar figurita',
    description:
      'Actualiza los datos editables de la figurita (nickname, funFact, yearsInCompany, position, avatar). ' +
      'No otorga puntos adicionales. ' +
      'Para reemplazar la foto usar el endpoint POST users/me/sticker/photo.',
  })
  @ApiResponse({ status: 200, description: 'Figurita actualizada' })
  @ApiResponse({
    status: 404,
    description: 'El usuario todavía no creó su figurita',
  })
  updateMySticker(@Request() req, @Body() dto: UpdateStickerDto) {
    return this.usersService.updateMySticker(req.user.id, dto);
  }

  @Post('users/me/sticker/photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerStickerConfig))
  @ApiOperation({
    summary: 'Subir foto de figurita',
    description:
      'Sube o reemplaza la foto que aparece en la figurita del álbum. ' +
      'Si el usuario tenía `useAvatar=true`, se cambia automáticamente a `false`. ' +
      'Para volver al avatar, usar PATCH users/me/sticker con useAvatar=true.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagen JPG, PNG o WebP (máx. 5MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Foto de figurita actualizada' })
  @ApiResponse({
    status: 404,
    description: 'El usuario todavía no creó su figurita',
  })
  async uploadStickerPhoto(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateStickerPhoto(
      req.user.id,
      `/uploads/stickers/${file.filename}`,
    );
  }

  @Post('users/me/change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cambiar contraseña',
    description:
      'Cambia la contraseña del usuario autenticado. ' +
      'Requiere la contraseña actual para confirmar la identidad. ' +
      'La nueva contraseña debe ser distinta a la actual y tener al menos 8 caracteres.',
  })
  @ApiResponse({ status: 204, description: 'Contraseña cambiada exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Nueva contraseña igual a la actual',
  })
  @ApiResponse({ status: 401, description: 'Contraseña actual incorrecta' })
  changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, dto);
  }

  // ─── Perfil público (para zona de intercambios) ───────────────────────────

  @Get('users/:id/profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Perfil público de un compañero',
    description:
      'Devuelve el nombre, área y figurita de otro usuario. ' +
      'Usado en la zona de intercambios para que ambas partes puedan ver ' +
      'las figuritas involucradas antes de confirmar el canje.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del usuario a consultar',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil público + figurita',
    schema: {
      example: {
        user: {
          id: 2,
          fullName: 'Pablo García',
          area: { name: 'Comercial' },
        },
        sticker: { id: 7, nickname: 'Pabli', stickerNumber: 7, funFact: '...' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  getPublicProfile(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findPublicProfile(id);
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '[ADMIN] Listar usuarios',
    description:
      'Lista todos los usuarios con filtros opcionales. ' +
      'Permite buscar por nombre parcial, filtrar por área y paginar.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Búsqueda por nombre (parcial)',
  })
  @ApiQuery({
    name: 'areaId',
    required: false,
    type: Number,
    description: 'Filtrar por ID de área',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de usuarios',
    schema: {
      example: {
        data: [
          {
            id: 1,
            fullName: 'Ana García',
            email: 'ana@triunfo.com',
            points: 150,
          },
        ],
        total: 42,
      },
    },
  })
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get('admin/users/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '[ADMIN] Estadísticas de usuarios',
    description:
      'Devuelve métricas generales: total de usuarios, cuántos ya crearon su figurita ' +
      'y distribución por área. Útil para el dashboard del panel de administración.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        total: 120,
        withSticker: 87,
        byArea: { Marketing: 15, Comercial: 30, Tecnología: 12 },
      },
    },
  })
  getStats() {
    return this.usersService.getStats();
  }

  @Get('admin/users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '[ADMIN] Ver detalle de un usuario',
    description:
      'Devuelve el perfil completo de cualquier usuario, incluyendo puntos y estado de cuenta.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Perfil completo del usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Patch('admin/users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '[ADMIN] Editar usuario',
    description:
      'Permite modificar cualquier dato de un usuario, incluyendo `isActive` para ' +
      'activar o desactivar la cuenta. Una cuenta inactiva no puede iniciar sesión ' +
      'aunque su token aún no haya expirado.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  updateByAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserAdminDto,
    @Request() req,
  ) {
    return this.usersService.updateByAdmin(id, dto, req.user);
  }

  @Post('admin/users/:userId/sticker/photo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', multerStickerConfig))
  @ApiOperation({
    summary: '[ADMIN] Subir foto de figurita de un usuario',
    description:
      'Permite al admin subir o reemplazar la foto de la figurita de cualquier usuario. ' +
      'Especialmente útil para las figuritas **leyenda** (gerentes), ' +
      'donde RRHH sube la foto oficial del gerente. ' +
      'Acepta JPG, PNG o WebP, máx. 5MB.',
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    description: 'ID del usuario dueño del sticker',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagen JPG, PNG o WebP (máx. 5MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Foto subida y figurita actualizada',
  })
  @ApiResponse({ status: 404, description: 'Usuario sin figurita todavía' })
  async uploadStickerPhotoByAdmin(
    @Param('userId', ParseIntPipe) userId: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.usersService.uploadStickerPhotoByAdmin(
      userId,
      `/uploads/stickers/${file.filename}`,
    );
  }
}
