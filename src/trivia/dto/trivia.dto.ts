import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { TriviaCategory } from '../entities/trivia-question.entity';

// ─── Option DTOs ──────────────────────────────────────────────────────────────

export class CreateOptionDto {
  @ApiProperty({ example: '1978' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    example: false,
    description: 'Solo una opción por pregunta puede ser true',
  })
  @IsBoolean()
  isCorrect: boolean;

  @ApiPropertyOptional({
    example: 0,
    description: 'Orden de presentación (0-3)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  order?: number;
}

// ─── Question DTOs ────────────────────────────────────────────────────────────

export class CreateQuestionDto {
  @ApiProperty({ example: '¿En qué año Argentina ganó su primer Mundial?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ enum: TriviaCategory, example: TriviaCategory.MUNDIAL })
  @IsEnum(TriviaCategory)
  category: TriviaCategory;

  @ApiPropertyOptional({
    example: 10,
    description: 'Puntos al responder correctamente. Default: 10.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  points?: number;

  @ApiProperty({
    type: [CreateOptionDto],
    description:
      'Entre 2 y 4 opciones. Exactamente una debe tener isCorrect=true.',
  })
  @IsArray()
  @ArrayMinSize(2, { message: 'La pregunta debe tener al menos 2 opciones' })
  @ArrayMaxSize(4, { message: 'La pregunta puede tener máximo 4 opciones' })
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options: CreateOptionDto[];
}

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {}

export class BulkCreateQuestionsDto {
  @ApiProperty({
    type: [CreateQuestionDto],
    description:
      'Máximo 50 preguntas por solicitud. Cada una con 2-4 opciones y exactamente 1 correcta.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50, { message: 'Máximo 50 preguntas por solicitud' })
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}

// ─── Query DTOs ───────────────────────────────────────────────────────────────

export class QueryQuestionsDto {
  @ApiPropertyOptional({ enum: TriviaCategory })
  @IsOptional()
  @IsEnum(TriviaCategory)
  category?: TriviaCategory;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

// ─── Answer DTO ───────────────────────────────────────────────────────────────

export class AnswerQuestionDto {
  @ApiProperty({ example: 3, description: 'ID de la opción seleccionada' })
  @IsInt()
  @Type(() => Number)
  selectedOptionId: number;
}
