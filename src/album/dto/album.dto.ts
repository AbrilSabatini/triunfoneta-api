import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { TradeStatus } from '../entities/trade-offer.entity';

// ─── Trade DTOs ───────────────────────────────────────────────────────────────

export class CreateTradeDto {
  @ApiProperty({
    example: 12,
    description:
      'ID del **UserSticker** que el emisor ofrece. Debe pertenecer al usuario ' +
      'autenticado y tener quantity > 1 (figurita repetida).',
  })
  @IsInt()
  @Type(() => Number)
  offeredUserStickerId: number;

  @ApiProperty({
    example: 7,
    description: 'ID del usuario al que se le propone el intercambio.',
  })
  @IsInt()
  @Type(() => Number)
  toUserId: number;

  @ApiProperty({
    example: 28,
    description:
      'ID del **UserSticker** que el emisor quiere recibir. ' +
      'Debe pertenecer al usuario receptor (toUserId).',
  })
  @IsInt()
  @Type(() => Number)
  requestedUserStickerId: number;

  @ApiPropertyOptional({
    example: '¡Necesito tu figurita de Marketing!',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  message?: string;
}

export class QueryTradesDto {
  @ApiPropertyOptional({
    enum: TradeStatus,
    description: 'Filtrar por estado del intercambio',
  })
  @IsOptional()
  status?: TradeStatus;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

// ─── Album DTOs ───────────────────────────────────────────────────────────────

export class QueryAlbumDto {
  @ApiPropertyOptional({
    description:
      'ID del usuario a consultar. Sin este param devuelve el álbum del usuario autenticado.',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  userId?: number;
}

export class QuerySectionDto {
  @ApiPropertyOptional({
    example: 'Marketing',
    description: 'Nombre del área / sección del álbum',
  })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
