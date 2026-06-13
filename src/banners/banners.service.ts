import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import {
  BannerForUserDto,
  BannerResponseDto,
  CreateBannerDto,
} from './dto/banners.dto';
import { BannerRead } from './entities/banner-read.entity';
import { Banner } from './entities/banner.entity';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private bannersRepo: Repository<Banner>,

    @InjectRepository(BannerRead)
    private bannerReadsRepo: Repository<BannerRead>,
  ) {}

  async create(dto: CreateBannerDto): Promise<BannerResponseDto> {
    const banner = this.bannersRepo.create(dto);
    const saved = await this.bannersRepo.save(banner);
    return plainToInstance(BannerResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(): Promise<BannerResponseDto[]> {
    const banners = await this.bannersRepo.find({
      order: { createdAt: 'DESC' },
    });
    return plainToInstance(BannerResponseDto, banners, {
      excludeExtraneousValues: true,
    });
  }

  async findForUser(user: User): Promise<BannerForUserDto[]> {
    const now = new Date();

    const qb = this.bannersRepo
      .createQueryBuilder('banner')
      .leftJoinAndSelect('banner.reads', 'read', 'read.userId = :userId', {
        userId: user.id,
      })
      .where('banner.isActive = true')
      .andWhere('(banner.closeDate IS NULL OR banner.closeDate > :now)', { now })
      .andWhere(
        '(banner.isSingleView = false OR read.id IS NULL)',
      );

    if (!user.isLegend) {
      qb.andWhere('banner.isLegendOnly = false');
    }

    const banners = await qb
      .orderBy('banner.createdAt', 'DESC')
      .getMany();

    return plainToInstance(BannerForUserDto, banners, {
      excludeExtraneousValues: true,
    });
  }

  async markAsRead(bannerId: number, userId: number): Promise<void> {
    const banner = await this.bannersRepo.findOne({ where: { id: bannerId } });
    if (!banner) {
      throw new NotFoundException('Banner no encontrado');
    }

    if (!banner.isSingleView) {
      throw new ConflictException(
        'Este banner no requiere marcarse como leído',
      );
    }

    const existing = await this.bannerReadsRepo.findOne({
      where: { bannerId, userId },
    });
    if (existing) {
      throw new ConflictException('Ya marcaste este banner como leído');
    }

    await this.bannerReadsRepo.save(
      this.bannerReadsRepo.create({ bannerId, userId }),
    );
  }
}
