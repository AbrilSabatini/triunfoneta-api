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
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  CreateStickerDto,
  QueryUsersDto,
  UpdateStickerDto,
  UpdateUserDto,
} from './dto/users.dto';
import { UserRole } from './entities/user.entity';
import { multerAvatarConfig, multerStickerConfig } from './multer.config';
import { UsersService } from './users.service';

@ApiTags('Usuario')
@ApiBearerAuth('jwt')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── Perfil propio ────────────────────────────────────────────────────────

  @Get('users/me')
  @ApiOperation({
    summary: 'Perfil del usuario autenticado',
    description:
      'Devuelve el perfil completo del usuario autenticado junto con su saldo actual de puntos.',
  })
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req) {
    return this.usersService.getMe(req.user.id);
  }

  @Patch('users/me')
  @ApiOperation({
    summary: 'Actualizar perfil propio',
    description: 'Permite modificar los datos básicos del usuario autenticado.',
  })
  @UseGuards(JwtAuthGuard)
  updateMe(@Request() req, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(req.user.id, dto);
  }

  @Post('users/me/avatar')
  @ApiOperation({
    summary: 'Subir avatar',
    description: 'Sube o reemplaza la foto de perfil del usuario.',
  })
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerAvatarConfig))
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(req.user.id, avatarUrl);
  }

  @Get('users/me/sticker')
  @ApiOperation({
    summary: 'Mi figurita',
    description: 'Devuelve la figurita asociada al usuario autenticado.',
  })
  @UseGuards(JwtAuthGuard)
  getMySticker(@Request() req) {
    return this.usersService.getMySticker(req.user.id);
  }

  @Post('users/me/sticker')
  @ApiOperation({
    summary: 'Crear figurita',
    description:
      'Crea la figurita del usuario. Solo puede ejecutarse una vez y otorga los puntos de bienvenida configurados.',
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createSticker(@Request() req, @Body() dto: CreateStickerDto) {
    return this.usersService.createSticker(req.user.id, dto);
  }

  @Patch('users/me/sticker')
  @ApiOperation({
    summary: 'Actualizar figurita',
    description:
      'Actualiza los datos de la figurita del usuario sin otorgar puntos adicionales.',
  })
  @UseGuards(JwtAuthGuard)
  updateMySticker(@Request() req, @Body() dto: UpdateStickerDto) {
    return this.usersService.updateMySticker(req.user.id, dto);
  }

  @Post('users/me/sticker/photo')
  @ApiOperation({
    summary: 'Subir foto de figurita',
    description:
      'Sube o reemplaza la foto de la figurita. Si useAvatar=true, se cambia automáticamente a false.',
  })
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerStickerConfig))
  async uploadStickerPhoto(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const photoUrl = `/uploads/stickers/${file.filename}`;
    return this.usersService.updateStickerPhoto(req.user.id, photoUrl);
  }

  // ─── Perfil público (para zona de intercambios) ───────────────────────────

  @Get('users/:id/profile')
  @ApiOperation({
    summary: 'Perfil público',
    description:
      'Devuelve la información pública de un usuario junto con su figurita para la zona de intercambios.',
  })
  @UseGuards(JwtAuthGuard)
  getPublicProfile(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findPublicProfile(id);
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  @Get('admin/users')
  @ApiOperation({
    summary: '[ADMIN] Listar usuarios',
    description:
      'Lista usuarios con filtros opcionales de búsqueda, área y paginación.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get('admin/users/stats')
  @ApiOperation({
    summary: '[ADMIN] Estadísticas de usuarios',
    description:
      'Devuelve métricas generales del sistema y distribución por áreas.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.usersService.getStats();
  }
}
