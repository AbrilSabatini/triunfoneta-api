import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsModule } from '../points/points.module';
import { Sticker } from './entities/sticker.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Sticker]),
    MulterModule.register({ dest: './uploads' }),
    PointsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  // Exportamos UsersService para que AuthModule pueda usarlo
  exports: [UsersService],
})
export class UsersModule {}
