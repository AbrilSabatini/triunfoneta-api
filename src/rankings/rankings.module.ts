import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdePick } from '../prode/entities/prode-pick.entity';
import { UserSticker } from '../packs/entities/user-sticker.entity';
import { Sticker } from '../users/entities/sticker.entity';
import { TriviaAttempt } from '../trivia/entities/trivia-attempt.entity';
import { User } from '../users/entities/user.entity';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProdePick,
      UserSticker,
      Sticker,
      TriviaAttempt,
      User,
    ]),
  ],
  controllers: [RankingsController],
  providers: [RankingsService],
})
export class RankingsModule {}
