import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import 'reflect-metadata';

import { AreasModule } from './areas/areas.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { PointsModule } from './points/points.module';
import { UsersModule } from './users/users.module';

import { Area } from './areas/entities/area.entity';
import { MailQueue } from './mail/entities/mail-queue.entity';
import { PointTransaction } from './points/entities/point-transaction.entity';
import { Match } from './prode/entities/match.entity';
import { ProdePick } from './prode/entities/prode-pick.entity';
import { ProdeModule } from './prode/prode.module';
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
      ],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      extra: {
        timezone: 'America/Argentina/Buenos_Aires',
      },
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
  ],
})
export class AppModule {}
