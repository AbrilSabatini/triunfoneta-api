import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BannerRead } from './banner-read.entity';

export enum BannerType {
  ALERT = 'alert',
  INFO = 'info',
  ERROR = 'error',
  WARNING = 'warning',
  SUCCESS = 'success',
}

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Mantenimiento programado' })
  @Column()
  title: string;

  @ApiProperty({ example: 'El sistema estará fuera de línea el sábado...' })
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({ enum: BannerType, default: BannerType.INFO })
  @Column({ type: 'enum', enum: BannerType, default: BannerType.INFO })
  type: BannerType;

  @ApiProperty({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  closeDate: Date | null;

  @ApiProperty({ default: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ default: false })
  @Column({ default: false })
  isLegendOnly: boolean;

  @ApiProperty({ default: false })
  @Column({ default: false })
  isSingleView: boolean;

  @ApiHideProperty()
  @OneToMany(() => BannerRead, (br) => br.banner)
  reads: BannerRead[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
