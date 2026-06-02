import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Marketing' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    example: '#e63946',
    description: 'Color HEX para UI del álbum',
  })
  @Column({ nullable: true })
  color: string;

  @ApiProperty({ default: true })
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
