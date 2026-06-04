import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsModule } from '../points/points.module';
import { User } from '../users/entities/user.entity';
import { Match } from './entities/match.entity';
import { ProdePick } from './entities/prode-pick.entity';
import { ProdeController } from './prode.controller';
import { ProdeService } from './prode.service';

@Module({
  imports: [TypeOrmModule.forFeature([Match, ProdePick, User]), PointsModule],
  controllers: [ProdeController],
  providers: [ProdeService],
  exports: [ProdeService],
})
export class ProdeModule {}
