import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

// ─── DTOs de respuesta ────────────────────────────────────────────────────────

/**
 * Subconjunto del área que se expone en las respuestas de usuario.
 * Oculta color, emoji, isActive y timestamps que no son relevantes para el cliente.
 */
export class AreaSummaryDto {
  @ApiProperty({ example: 8 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Legal' })
  @Expose()
  name: string;
}

@Exclude()
export class UserResponseDto {
  @ApiProperty({ example: 23 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'ana@triunfo.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'Ana García' })
  @Expose()
  fullName: string;

  @ApiProperty({ type: () => AreaSummaryDto, nullable: true })
  @Expose()
  @Type(() => AreaSummaryDto)
  area: AreaSummaryDto | null;

  @ApiProperty({ example: null, nullable: true })
  @Expose()
  avatarUrl: string | null;

  @ApiProperty({ example: 50 })
  @Expose()
  points: number;

  @ApiProperty({ example: true })
  @Expose()
  isActive: boolean;
}

@Exclude()
export class UserProfileDto extends UserResponseDto {
  @ApiProperty({ example: false, description: 'Si ya creó su figurita' })
  @Expose()
  stickerCreated: boolean;

  @ApiProperty({ example: 'user' })
  @Expose()
  role: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}

// ─── Auth DTOs ───────────────────────────────────────────────────────────────

export class RegisterDto {
  @ApiProperty({ example: 'ana@triunfo.com' })
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @ApiProperty({ example: 'MiPassword123', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiProperty({ example: 'Ana García' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 1, description: 'ID del área (ver GET /api/areas)' })
  @IsInt({ message: 'areaId debe ser un número entero' })
  @Type(() => Number)
  areaId: number;
}

export class BulkRegisterItemDto {
  @ApiProperty({ example: 'ana@triunfo.com' })
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @ApiProperty({ example: 'Ana García' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 1, description: 'ID del área (ver GET /api/areas)' })
  @IsInt({ message: 'areaId debe ser un número entero' })
  @Type(() => Number)
  areaId: number;
}

export class BulkRegisterDto {
  @ApiProperty({
    type: [BulkRegisterItemDto],
    description: 'Máximo 100 usuarios por solicitud',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un usuario' })
  @ArrayMaxSize(100, {
    message: 'No se pueden crear más de 100 usuarios por solicitud',
  })
  @ValidateNested({ each: true })
  @Type(() => BulkRegisterItemDto)
  users: BulkRegisterItemDto[];
}

export class LoginDto {
  @ApiProperty({ example: 'ana@triunfo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MiPassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

// ─── User DTOs de entrada ─────────────────────────────────────────────────────

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Ana M. García' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  areaId?: number;
}

// ─── Sticker DTOs ────────────────────────────────────────────────────────────

export class CreateStickerDto {
  @ApiProperty({ example: 'Anita', maxLength: 30 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nickname: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  useAvatar?: boolean;

  @ApiPropertyOptional({ example: 'Campeona del metegol', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  funFact?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  yearsInCompany?: number;

  @ApiPropertyOptional({ example: 'Marketing Lead' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  position?: string;
}

export class UpdateStickerDto extends PartialType(CreateStickerDto) {}

// ─── Admin DTOs ──────────────────────────────────────────────────────────────

export class UpdateUserAdminDto extends PartialType(UpdateUserDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryUsersDto {
  @ApiPropertyOptional({ description: 'Buscar por nombre' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por área ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  areaId?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

// ─── Password change ──────────────────────────────────────────────────────────

export class ChangePasswordDto {
  @ApiProperty({ example: 'MiPasswordActual123' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  currentPassword: string;

  @ApiProperty({ example: 'NuevaPassword456!', minLength: 8 })
  @IsString()
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  newPassword: string;
}
