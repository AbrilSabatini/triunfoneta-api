import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('area_completions')
@Unique(['userId', 'areaName'])
export class AreaCompletion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  areaName: string;

  @CreateDateColumn()
  completedAt: Date;
}
