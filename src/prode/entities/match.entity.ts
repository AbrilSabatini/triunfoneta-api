import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MatchStage {
  GROUP = 'Fase de grupos',
  ROUND_OF_32 = 'Dieciseisavos de final',
  ROUND_OF_16 = 'Octavos de final',
  QUARTER = 'Cuartos de final',
  SEMI = 'Semifinal',
  THIRD_PLACE = 'Tercer puesto',
  FINAL = 'Final',
}

export enum MatchGroup {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
  I = 'I',
  J = 'J',
  K = 'K',
  L = 'L',
  NONE = '-', // fases eliminatorias
}

@Entity('matches')
export class Match {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Argentina' })
  @Column()
  homeTeam: string;

  @ApiProperty({ example: 'España' })
  @Column()
  awayTeam: string;

  /** Fecha y hora local del partido (con timezone) */
  @ApiProperty({ example: '2026-06-11T18:00:00-03:00' })
  @Column({ type: 'timestamptz' })
  matchDate: Date;

  /**
   * Cierre de predicciones. Default: un día antes del partido.
   * El admin puede ajustarlo (ej: partido nocturno → cierre al mediodía anterior).
   */
  @ApiProperty({ example: '2026-06-10T23:59:00-03:00' })
  @Column({ type: 'timestamptz' })
  picksCloseAt: Date;

  @ApiProperty({ enum: MatchStage, example: MatchStage.GROUP })
  @Column({ type: 'enum', enum: MatchStage, default: MatchStage.GROUP })
  stage: MatchStage;

  @ApiPropertyOptional({ enum: MatchGroup, example: MatchGroup.A })
  @Column({ type: 'enum', enum: MatchGroup, default: MatchGroup.NONE })
  group: MatchGroup;

  @ApiPropertyOptional({ example: 2, nullable: true })
  @Column({ type: 'int', nullable: true })
  scoreHome: number | null;

  @ApiPropertyOptional({ example: 1, nullable: true })
  @Column({ type: 'int', nullable: true })
  scoreAway: number | null;

  @ApiProperty({ default: false })
  @Column({ default: false })
  isFinished: boolean;

  /** Indica si ya se procesaron y acreditaron los puntos del prode */
  @ApiProperty({ default: false })
  @Column({ default: false })
  pointsProcessed: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
