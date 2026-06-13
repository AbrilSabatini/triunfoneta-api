import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigsModule } from '../configs/configs.module';
import { PointsModule } from '../points/points.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { Sticker } from './entities/sticker.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Sticker]),
    SupabaseModule,
    PointsModule,
    ConfigsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
