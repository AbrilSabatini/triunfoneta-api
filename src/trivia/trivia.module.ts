import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsModule } from '../points/points.module';
import { TriviaAttempt } from './entities/trivia-attempt.entity';
import { TriviaOption } from './entities/trivia-option.entity';
import { TriviaQuestion } from './entities/trivia-question.entity';
import { TriviaController } from './trivia.controller';
import { TriviaService } from './trivia.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TriviaQuestion, TriviaOption, TriviaAttempt]),
    PointsModule,
  ],
  controllers: [TriviaController],
  providers: [TriviaService],
  exports: [TriviaService],
})
export class TriviaModule {}
