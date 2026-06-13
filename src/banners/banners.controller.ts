import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { BannersService } from './banners.service';
import {
  BannerForUserDto,
  BannerResponseDto,
  CreateBannerDto,
} from './dto/banners.dto';

@ApiTags('Banners')
@ApiBearerAuth('jwt')
@Controller()
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  // ─── Admin ────────────────────────────────────────────────────────────────

  @Post('admin/banners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[ADMIN] Crear banner' })
  @ApiResponse({
    status: 201,
    description: 'Banner creado',
    type: BannerResponseDto,
  })
  create(@Body() dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  @Get('admin/banners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Listar todos los banners' })
  @ApiResponse({
    status: 200,
    description: 'Lista de banners',
    type: [BannerResponseDto],
  })
  findAll() {
    return this.bannersService.findAll();
  }

  // ─── Usuario autenticado ──────────────────────────────────────────────────

  @Get('banners')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener banners activos para el usuario',
    description:
      'Devuelve los banners vigentes que el usuario aún no ha leído ' +
      '(si son de una sola visualización) o que siguen activos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Banners para el usuario',
    type: [BannerForUserDto],
  })
  findForUser(@Request() req) {
    return this.bannersService.findForUser(req.user);
  }

  @Post('banners/:id/read')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Marcar banner como leído',
    description:
      'Marca un banner de una sola visualización como leído por el usuario autenticado. ' +
      'Solo aplica para banners con isSingleView=true.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del banner' })
  @ApiResponse({ status: 204, description: 'Marcado como leído' })
  @ApiResponse({ status: 409, description: 'Ya fue marcado como leído' })
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.bannersService.markAsRead(id, req.user.id);
  }
}
