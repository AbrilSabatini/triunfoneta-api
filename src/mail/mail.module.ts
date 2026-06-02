import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailQueue } from './entities/mail-queue.entity';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([MailQueue]), ScheduleModule.forRoot()],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
