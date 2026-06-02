import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum PointReason {
  STICKER_CREATED = 'STICKER_CREATED',
  PRODE_EXACT = 'PRODE_EXACT',
  PRODE_WINNER = 'PRODE_WINNER',
  TRIVIA = 'TRIVIA',
  AREA_COMPLETED = 'AREA_COMPLETED',
  TASK = 'TASK',
  PACK_PURCHASE = 'PACK_PURCHASE', // valor negativo
}

@Entity('point_transactions')
export class PointTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  // Puede ser negativo (ej: compra de sobre)
  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'enum', enum: PointReason })
  reason: PointReason;

  // ID de la entidad relacionada (sticker, partido, pregunta, etc.)
  @Column({ nullable: true })
  referenceId: number;

  // Saldo resultante después de la transacción (para auditoría)
  @Column({ type: 'int' })
  balanceAfter: number;

  @CreateDateColumn()
  createdAt: Date;
}
