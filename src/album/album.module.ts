import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSticker } from '../packs/entities/user-sticker.entity';
import { Sticker } from '../users/entities/sticker.entity';
import { User } from '../users/entities/user.entity';
import { AlbumController } from './album.controller';
import { AlbumService } from './album.service';
import { TradeOffer } from './entities/trade-offer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TradeOffer, UserSticker, Sticker, User])],
  controllers: [AlbumController],
  providers: [AlbumService],
  exports: [AlbumService],
})
export class AlbumModule {}
