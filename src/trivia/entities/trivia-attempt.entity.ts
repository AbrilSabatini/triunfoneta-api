import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TriviaOption } from './trivia-option.entity';
import { TriviaQuestion } from './trivia-question.entity';

@Entity('trivia_attempts')
export class TriviaAttempt {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ApiProperty({ example: 3 })
  @Column()
  userId: number;

  @ManyToOne(() => TriviaQuestion, { onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  question: TriviaQuestion;

  @ApiProperty({ example: 7 })
  @Column()
  questionId: number;

  @ManyToOne(() => TriviaOption, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  selectedOption: TriviaOption | null;

  @ApiPropertyOptional({ example: 2 })
  @Column({ nullable: true })
  selectedOptionId: number | null;

  @ApiProperty({ example: true })
  @Column()
  isCorrect: boolean;

  @ApiProperty({
    example: 10,
    description: 'Puntos ganados (0 si fue incorrecta)',
  })
  @Column({ type: 'int' })
  pointsEarned: number;

  /**
   * Si la respuesta fue incorrecta, este campo registra que se consumió
   * 1 vida en este intento. Se usa para calcular cuántas vidas le quedan
   * al usuario y cuándo se regenera la próxima.
   *
   * true  → se gastó 1 vida (respuesta incorrecta)
   * false → no se gastó vida (respuesta correcta)
   */
  @ApiProperty({ example: false })
  @Column({ default: false })
  usedLife: boolean;

  @ApiProperty()
  @CreateDateColumn()
  answeredAt: Date;
}
