import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TriviaQuestion } from './trivia-question.entity';

/**
 * Opción de respuesta para una pregunta de trivia.
 * Cada pregunta tiene entre 2 y 4 opciones; exactamente una tiene isCorrect=true.
 *
 * Las opciones se almacenan en tabla separada (no como array JSON) para:
 * - Facilitar queries de estadísticas (cuál opción eligen más los usuarios)
 * - Mantener integridad referencial
 * - Permitir agregar/editar opciones individualmente
 */
@Entity('trivia_options')
export class TriviaOption {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TriviaQuestion, { onDelete: 'CASCADE' })
  @JoinColumn()
  question: TriviaQuestion;

  @ApiProperty({ example: 1 })
  @Column()
  questionId: number;

  @ApiProperty({ example: '1978' })
  @Column({ type: 'text' })
  text: string;

  @ApiProperty({
    example: false,
    description: 'Solo una opción por pregunta puede ser true',
  })
  @Column({ default: false })
  isCorrect: boolean;

  /**
   * Orden de presentación (0-3).
   * Se mezclan en el frontend para evitar que siempre la correcta
   * quede en la misma posición.
   */
  @ApiProperty({ example: 0 })
  @Column({ type: 'int', default: 0 })
  order: number;
}
