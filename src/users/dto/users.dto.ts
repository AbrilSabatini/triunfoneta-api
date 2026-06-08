import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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

  @ApiProperty({ example: '3', description: 'ID del área (ver GET /areas)' })
  @IsInt()
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

  @ApiProperty({ example: '3', description: 'ID del área (ver GET /areas)' })
  @IsInt()
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

// ─── User DTOs ───────────────────────────────────────────────────────────────

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Ana M. García' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '2' })
  @IsOptional()
  @IsInt()
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
  areaId?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
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
