import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { BannerRead } from './entities/banner-read.entity';
import { Banner } from './entities/banner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Banner, BannerRead])],
  controllers: [BannersController],
  providers: [BannersService],
})
export class BannersModule {}
