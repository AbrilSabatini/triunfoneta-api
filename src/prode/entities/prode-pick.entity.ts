import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Match } from './match.entity';

/**
 * Constraint único: un usuario solo puede tener una predicción por partido.
 * La DB es la última línea de defensa ante race conditions o bugs en el service.
 */
@Entity('prode_picks')
@Unique(['userId', 'matchId'])
export class ProdePick {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ApiProperty({ example: 1 })
  @Column()
  userId: number;

  @ManyToOne(() => Match, { onDelete: 'CASCADE' })
  @JoinColumn()
  match: Match;

  @ApiProperty({ example: 3 })
  @Column()
  matchId: number;

  @ApiProperty({
    example: 2,
    description: 'Goles predichos para el equipo local',
  })
  @Column({ type: 'int' })
  predictedHome: number;

  @ApiProperty({
    example: 1,
    description: 'Goles predichos para el equipo visitante',
  })
  @Column({ type: 'int' })
  predictedAway: number;

  /**
   * null mientras el partido no terminó.
   * 0 = no acertó nada.
   * PRODE_WINNER_POINTS si acertó el ganador/empate.
   * PRODE_EXACT_POINTS si acertó el resultado exacto.
   */
  @ApiPropertyOptional({ example: 10, nullable: true })
  @Column({ type: 'int', nullable: true })
  pointsEarned: number | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
