import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('stickers')
export class Sticker {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  // Nombre visible en la figurita (puede diferir del nombre real)
  @Column()
  nickname: string;

  // URL de la foto de perfil en la figurita
  @Column({ nullable: true })
  photoUrl: string;

  // Si true, usa un avatar generado en lugar de foto
  @Column({ default: false })
  useAvatar: boolean;

  // Dato curioso / descripción corta del empleado
  @Column({ type: 'text', nullable: true })
  funFact: string;

  // Años en la empresa
  @Column({ nullable: true })
  yearsInCompany: number;

  // Posición / cargo
  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  area: string;

  // Número de figurita (asignado automáticamente al crearse)
  @Column({ unique: true, nullable: true })
  stickerNumber: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
