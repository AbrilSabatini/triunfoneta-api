import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TriviaCategory {
  MUNDIAL = 'Mundialistas',
  FUTBOL = 'Fútbol', // películas y leyendas del fútbol
  TRIUNFO = 'Triunfo Seguros',
  GERENTES = 'Gerentes de Triunfo',
  SEGUROS = 'Rubro: Seguros',
  ESUELDOS = 'E-Sueldos',
  CAMISETAS = 'Camisetas de fútbol',
  PRODUCTOS = 'Productos de Triunfo Seguros',
  CULTURA_GENERAL = 'Cultura general',
}

@Entity('trivia_questions')
export class TriviaQuestion {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '¿En qué año Argentina ganó su primer Mundial?' })
  @Column({ type: 'text' })
  question: string;

  @ApiProperty({ enum: TriviaCategory, example: TriviaCategory.MUNDIAL })
  @Column({
    type: 'enum',
    enum: TriviaCategory,
    default: TriviaCategory.MUNDIAL,
  })
  category: TriviaCategory;

  /**
   * Puntos que otorga responder correctamente.
   * Configurable por pregunta — el admin puede darle más peso a las difíciles.
   */
  @ApiProperty({
    example: 10,
    description: 'Puntos al responder correctamente',
  })
  @Column({ type: 'int', default: 10 })
  points: number;

  @ApiProperty({ default: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
