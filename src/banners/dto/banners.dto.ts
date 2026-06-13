import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { BannerType } from '../entities/banner.entity';

// ─── Create ───────────────────────────────────────────────────────────────────

export class CreateBannerDto {
  @ApiProperty({ example: 'Mantenimiento programado' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'El sistema estará fuera de línea el sábado...' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ enum: BannerType, default: BannerType.INFO })
  @IsEnum(BannerType)
  type: BannerType;

  @ApiPropertyOptional({ example: '2026-07-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  closeDate?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isLegendOnly?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isSingleView?: boolean;
}

// ─── Response ─────────────────────────────────────────────────────────────────

export class BannerResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  title: string;

  @Expose()
  @ApiProperty()
  message: string;

  @Expose()
  @ApiProperty({ enum: BannerType })
  type: BannerType;

  @Expose()
  @ApiProperty({ nullable: true })
  closeDate: Date | null;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiProperty()
  isLegendOnly: boolean;

  @Expose()
  @ApiProperty()
  isSingleView: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}

export class BannerForUserDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  title: string;

  @Expose()
  @ApiProperty()
  message: string;

  @Expose()
  @ApiProperty({ enum: BannerType })
  type: BannerType;

  @Expose()
  @ApiProperty({ nullable: true })
  closeDate: Date | null;

  @Expose()
  @ApiProperty()
  isSingleView: boolean;
}
