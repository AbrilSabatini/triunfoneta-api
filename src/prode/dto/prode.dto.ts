import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { MatchGroup, MatchStage } from '../entities/match.entity';

// ─── Match DTOs ───────────────────────────────────────────────────────────────

export class CreateMatchDto {
  @ApiProperty({ example: 'Argentina', description: 'Nombre del equipo local' })
  @IsString()
  @IsNotEmpty()
  homeTeam: string;

  @ApiProperty({
    example: 'España',
    description: 'Nombre del equipo visitante',
  })
  @IsString()
  @IsNotEmpty()
  awayTeam: string;

  @ApiProperty({
    example: '2026-06-11T18:00:00-03:00',
    description: 'Fecha y hora del partido en formato ISO 8601 con timezone',
  })
  @IsDateString()
  matchDate: string;

  @ApiPropertyOptional({
    example: '2026-06-10T23:59:00-03:00',
    description:
      'Cierre de predicciones. Si no se envía, se calcula automáticamente ' +
      'como 24 horas antes del partido.',
  })
  @IsOptional()
  @IsDateString()
  picksCloseAt?: string;

  @ApiProperty({ enum: MatchStage, example: MatchStage.GROUP })
  @IsEnum(MatchStage)
  stage: MatchStage;

  @ApiPropertyOptional({
    enum: MatchGroup,
    example: MatchGroup.A,
    description: 'Grupo (solo aplica en fase de grupos)',
  })
  @IsOptional()
  @IsEnum(MatchGroup)
  group?: MatchGroup;
}

export class UpdateMatchDto extends PartialType(CreateMatchDto) {}

export class SetResultDto {
  @ApiProperty({ example: 2, description: 'Goles del equipo local' })
  @IsInt()
  @Min(0)
  @Max(99)
  @Type(() => Number)
  scoreHome: number;

  @ApiProperty({ example: 1, description: 'Goles del equipo visitante' })
  @IsInt()
  @Min(0)
  @Max(99)
  @Type(() => Number)
  scoreAway: number;
}

export class QueryMatchesDto {
  @ApiPropertyOptional({
    description: 'Traer solo partidos futuros o con predicciones abiertas',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  upcoming?: boolean;

  @ApiPropertyOptional({
    enum: MatchStage,
    description: 'Filtrar por fase del torneo',
  })
  @IsOptional()
  @IsEnum(MatchStage)
  stage?: MatchStage;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

// ─── Pick DTOs ────────────────────────────────────────────────────────────────

export class UpsertPickDto {
  @ApiProperty({
    example: 2,
    description: 'Goles predichos para el equipo local. Mínimo 0.',
  })
  @IsInt({ message: 'predictedHome debe ser un número entero' })
  @Min(0, { message: 'No puede haber goles negativos' })
  @Max(30, { message: 'Valor de goles fuera de rango' })
  @Type(() => Number)
  predictedHome: number;

  @ApiProperty({
    example: 1,
    description: 'Goles predichos para el equipo visitante. Mínimo 0.',
  })
  @IsInt({ message: 'predictedAway debe ser un número entero' })
  @Min(0, { message: 'No puede haber goles negativos' })
  @Max(30, { message: 'Valor de goles fuera de rango' })
  @Type(() => Number)
  predictedAway: number;
}

export class QueryPicksDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
