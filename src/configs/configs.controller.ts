import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
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
import { ConfigsService } from './configs.service';
import { UpdateConfigDto } from './dto/config.dto';
import { Config, ConfigType } from './entities/config.entity';

@ApiTags('Configuraciones')
@Controller('configs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class ConfigsController {
  constructor(private readonly configsService: ConfigsService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las configuraciones',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de configuraciones',
    type: [Config],
  })
  findAll() {
    return this.configsService.findAll();
  }

  @Get(':type')
  @ApiOperation({
    summary: 'Obtener configuración por tipo',
  })
  @ApiParam({
    name: 'type',
    enum: ConfigType,
    example: ConfigType.PACK_COST_POINTS,
  })
  @ApiResponse({
    status: 200,
    type: Config,
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración no encontrada',
  })
  findByType(@Param('type') type: ConfigType) {
    return this.configsService.findByType(type);
  }

  @Patch(':type')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '[ADMIN] Actualizar configuración',
  })
  @ApiParam({
    name: 'type',
    enum: ConfigType,
    example: ConfigType.PACK_COST_POINTS,
  })
  @ApiResponse({
    status: 200,
    type: Config,
  })
  @ApiResponse({
    status: 403,
    description: 'Solo administradores',
  })
  update(@Param('type') type: ConfigType, @Body() dto: UpdateConfigDto) {
    return this.configsService.update(type, dto);
  }
}
