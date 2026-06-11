import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MailStatus {
  PENDING = 'pending', // en espera de envío inicial
  SENT = 'sent', // enviado correctamente
  FAILED = 'failed', // falló, esperando reintento
  EXHAUSTED = 'exhausted', // superó el máximo de reintentos
}

export enum MailType {
  WELCOME = 'welcome',
  RESET_PASSWORD = 'reset_password',
}

@Entity('mail_queue')
export class MailQueue {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ enum: MailType })
  @Column({ type: 'enum', enum: MailType })
  type: MailType;

  @ApiProperty({ example: 'ana@triunfo.com' })
  @Column()
  toEmail: string;

  // Payload serializado en JSON: lo que necesita el template
  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @ApiProperty({ enum: MailStatus, default: MailStatus.PENDING })
  @Column({ type: 'enum', enum: MailStatus, default: MailStatus.PENDING })
  status: MailStatus;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  attempts: number;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  lastError: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  sentAt: Date;

  // Siguiente intento no antes de esta fecha (backoff exponencial)
  @Column({ type: 'timestamptz', nullable: true })
  retryAfter: Date;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
