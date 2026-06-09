import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Area } from '../../areas/entities/area.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @ApiHideProperty()
  @Column({ select: false })
  password: string;

  @ApiProperty({ example: 'Ana García' })
  @Column()
  fullName: string;

  // Relación ManyToOne con Area (nullable para no romper registros legacy)
  @ApiProperty({ type: () => Area, nullable: true })
  @ManyToOne(() => Area, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'areaId' })
  area: Area;

  @Column({ nullable: true })
  areaId: number;

  @ApiProperty({ enum: UserRole, default: UserRole.USER })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  avatarUrl: string;

  @ApiProperty({ default: 0 })
  @Column({ type: 'int', default: 0 })
  points: number;

  @ApiProperty({ default: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ default: false })
  @Column({ default: false })
  stickerCreated: boolean;

  /**
   * Si true, este empleado es un gerente — su figurita es de tipo LEGEND
   * (difícil de conseguir en sobres). Solo el admin puede setearlo.
   */
  @ApiProperty({
    default: false,
    description: 'Gerente — su figurita es legendaria',
  })
  @Column({ default: false })
  isLegend: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.password);
  }
}
