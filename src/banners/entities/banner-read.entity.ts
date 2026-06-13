import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Banner } from './banner.entity';

@Entity('banner_reads')
@Unique(['banner', 'user'])
export class BannerRead {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Banner, (banner) => banner.reads, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bannerId' })
  banner: Banner;

  @Column()
  bannerId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  readAt: Date;
}
