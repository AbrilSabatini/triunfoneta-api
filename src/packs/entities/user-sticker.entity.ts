import { ApiProperty } from '@nestjs/swagger';
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
import { Sticker } from '../../users/entities/sticker.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Representa una figurita en la colección de un usuario.
 * quantity > 1 = repetida → disponible para intercambio.
 *
 * Constraint único (ownerId, stickerId): un usuario nunca tiene
 * dos filas para la misma figurita; quantity maneja las repetidas.
 */
@Entity('user_stickers')
@Unique(['ownerId', 'stickerId'])
export class UserSticker {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  owner: User;

  @ApiProperty({ example: 5 })
  @Column()
  ownerId: number;

  @ManyToOne(() => Sticker, { onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  sticker: Sticker;

  @ApiProperty({ example: 12 })
  @Column()
  stickerId: number;

  @ApiProperty({ example: 2, description: '1 = única, >1 = repetida' })
  @Column({ default: 1 })
  quantity: number;

  @ApiProperty()
  @CreateDateColumn()
  obtainedAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
