import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserSticker } from '../../packs/entities/user-sticker.entity';
import { User } from '../../users/entities/user.entity';

export enum TradeStatus {
  PENDING = 'pending', // esperando que el receptor acepte
  ACCEPTED = 'accepted', // intercambio realizado
  REJECTED = 'rejected', // receptor rechazó
  CANCELLED = 'cancelled', // emisor canceló
  EXPIRED = 'expired', // venció sin respuesta
}

/**
 * Representa una oferta de intercambio entre dos usuarios.
 *
 * Reglas de negocio:
 * - El emisor ofrece una figurita REPETIDA suya (quantity > 1).
 * - El emisor pide una figurita específica del receptor.
 * - Ambos usuarios deben poder ver las figuritas involucradas antes de confirmar.
 * - Al aceptarse, se hace el swap atómico: quantity-- en ambos lados,
 *   y si quantity llega a 0 se elimina el UserSticker.
 * - Solo el receptor puede aceptar o rechazar.
 * - Solo el emisor puede cancelar mientras está PENDING.
 */
@Entity('trade_offers')
export class TradeOffer {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  // ─── Emisor ───────────────────────────────────────────────────────────────

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fromUserId' })
  fromUser: User;

  @ApiProperty({
    example: 3,
    description: 'ID del usuario que propone el intercambio',
  })
  @Column()
  fromUserId: number;

  /**
   * UserSticker que ofrece el emisor.
   * Se valida que quantity > 1 al crear la oferta.
   */
  @ManyToOne(() => UserSticker, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'offeredUserStickerId' })
  offeredUserSticker: UserSticker;

  @ApiProperty({
    example: 12,
    description: 'ID del UserSticker ofrecido (debe ser repetida)',
  })
  @Column()
  offeredUserStickerId: number;

  // ─── Receptor ─────────────────────────────────────────────────────────────

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toUserId' })
  toUser: User;

  @ApiProperty({
    example: 7,
    description: 'ID del usuario que recibe la propuesta',
  })
  @Column()
  toUserId: number;

  /**
   * UserSticker que pide el emisor al receptor.
   * Se valida que el receptor lo posea al crear la oferta.
   */
  @ManyToOne(() => UserSticker, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'requestedUserStickerId' })
  requestedUserSticker: UserSticker;

  @ApiProperty({
    example: 28,
    description: 'ID del UserSticker que se pide al receptor',
  })
  @Column()
  requestedUserStickerId: number;

  // ─── Estado ───────────────────────────────────────────────────────────────

  @ApiProperty({ enum: TradeStatus, example: TradeStatus.PENDING })
  @Column({ type: 'enum', enum: TradeStatus, default: TradeStatus.PENDING })
  status: TradeStatus;

  @ApiPropertyOptional({ example: '¡Necesito tu figurita de Marketing!' })
  @Column({ type: 'text', nullable: true })
  message: string | null;

  @ApiPropertyOptional({
    description: 'Fecha límite para responder (72hs por defecto)',
  })
  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
