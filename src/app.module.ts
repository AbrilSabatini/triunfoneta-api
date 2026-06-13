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
import { BannersModule } from './banners/banners.module';
import { MailModule } from './mail/mail.module';
import { PacksModule } from './packs/packs.module';
import { PointsModule } from './points/points.module';
import { UsersModule } from './users/users.module';

import { TradeOffer } from './album/entities/trade-offer.entity';
import { Area } from './areas/entities/area.entity';
import { ConfigsModule } from './configs/configs.module';
import { Config } from './configs/entities/config.entity';
import { MailQueue } from './mail/entities/mail-queue.entity';
import { AreaCompletion } from './packs/entities/area-completion.entity';
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
import { BannerRead } from './banners/entities/banner-read.entity';
import { Banner } from './banners/entities/banner.entity';
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
        AreaCompletion,
        TradeOffer,
        TriviaQuestion,
        TriviaOption,
        TriviaAttempt,
        Config,
        Banner,
        BannerRead,
      ],
      synchronize: true,
      logging: process.env.NODE_ENV === 'development',
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    AreasModule,
    AuthModule,
    BannersModule,
    UsersModule,
    PointsModule,
    MailModule,
    ProdeModule,
    PacksModule,
    AlbumModule,
    TriviaModule,
    ConfigsModule,
  ],
})
export class AppModule {}
