import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('packs')
export class Pack {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  openedBy: User;

  @ApiProperty({ example: 3 })
  @Column()
  openedById: number;

  /**
   * IDs de las figuritas obtenidas al abrir este sobre.
   */
  @ApiProperty({
    type: [Number],
    example: [4, 17, 23, 5, 9],
    description: 'IDs de Sticker obtenidos en este sobre',
  })
  @Column({ type: 'jsonb' })
  stickerIds: number[];

  /** Costo en puntos al momento de la apertura (para auditoría) */
  @ApiProperty({ example: 150 })
  @Column()
  pointsCost: number;

  @ApiProperty()
  @CreateDateColumn()
  openedAt: Date;
}
