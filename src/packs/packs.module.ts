import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointTransaction } from '../points/entities/point-transaction.entity';
import { PointsModule } from '../points/points.module';
import { Sticker } from '../users/entities/sticker.entity';
import { User } from '../users/entities/user.entity';
import { Pack } from './entities/pack.entity';
import { UserSticker } from './entities/user-sticker.entity';
import { PacksController } from './packs.controller';
import { PacksService } from './packs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pack,
      UserSticker,
      Sticker,
      User,
      PointTransaction,
    ]),
    PointsModule,
  ],
  controllers: [PacksController],
  providers: [PacksService],
  exports: [PacksService, TypeOrmModule], // exportar TypeOrmModule para que AlbumModule use UserSticker
})
export class PacksModule {}
