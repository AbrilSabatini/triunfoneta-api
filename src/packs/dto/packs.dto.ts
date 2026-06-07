import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class QueryCollectionDto {
  @ApiPropertyOptional({
    description: 'true = solo figuritas repetidas (quantity > 1)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  duplicatesOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por área (nombre exacto del área)',
    example: 'Marketing',
  })
  @IsOptional()
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

export class QueryPackHistoryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
