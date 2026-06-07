import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import 'reflect-metadata';

import { AlbumModule } from './album/album.module';
import { AreasModule } from './areas/areas.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { PacksModule } from './packs/packs.module';
import { PointsModule } from './points/points.module';
import { UsersModule } from './users/users.module';

import { TradeOffer } from './album/entities/trade-offer.entity';
import { Area } from './areas/entities/area.entity';
import { MailQueue } from './mail/entities/mail-queue.entity';
import { Pack } from './packs/entities/pack.entity';
import { UserSticker } from './packs/entities/user-sticker.entity';
import { PointTransaction } from './points/entities/point-transaction.entity';
import { Match } from './prode/entities/match.entity';
import { ProdePick } from './prode/entities/prode-pick.entity';
import { ProdeModule } from './prode/prode.module';
import { TriviaAttempt } from './trivia/entities/trivia-attempt.entity';
import { TriviaOption } from './trivia/entities/trivia-option.entity';
import { TriviaQuestion } from './trivia/entities/trivia-question.entity';
import { TriviaModule } from './trivia/trivia.module';
import { Sticker } from './users/entities/sticker.entity';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        User,
        Sticker,
        PointTransaction,
        Area,
        MailQueue,
        Match,
        ProdePick,
        Pack,
        UserSticker,
        TradeOffer,
        TriviaQuestion,
        TriviaOption,
        TriviaAttempt,
      ],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    AreasModule,
    AuthModule,
    UsersModule,
    PointsModule,
    MailModule,
    ProdeModule,
    PacksModule,
    AlbumModule,
    TriviaModule,
  ],
})
export class AppModule {}
