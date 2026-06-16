import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProdePick } from '../prode/entities/prode-pick.entity';
import { UserSticker } from '../packs/entities/user-sticker.entity';
import { Sticker } from '../users/entities/sticker.entity';
import { TriviaAttempt } from '../trivia/entities/trivia-attempt.entity';

@Injectable()
export class RankingsService {
  constructor(
    @InjectRepository(ProdePick)
    private readonly prodePickRepo: Repository<ProdePick>,
    @InjectRepository(UserSticker)
    private readonly userStickerRepo: Repository<UserSticker>,
    @InjectRepository(Sticker)
    private readonly stickerRepo: Repository<Sticker>,
    @InjectRepository(TriviaAttempt)
    private readonly triviaAttemptRepo: Repository<TriviaAttempt>,
  ) {}

  async getProdeRanking(limit = 20) {
    return this.prodePickRepo
      .createQueryBuilder('p')
      .innerJoin('p.user', 'u')
      .select('u.id', 'id')
      .addSelect('u."fullName"', 'fullName')
      .addSelect('SUM(p."pointsEarned")', 'totalPoints')
      .groupBy('u.id')
      .addGroupBy('u."fullName"')
      .having('SUM(p."pointsEarned") > 0')
      .orderBy('"totalPoints"', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getStickersRanking(limit = 20) {
    const totalStickers = await this.stickerRepo.count();

    return this.userStickerRepo
      .createQueryBuilder('us')
      .innerJoin('us.owner', 'u')
      .select('u.id', 'id')
      .addSelect('u."fullName"', 'fullName')
      .addSelect('COUNT(us.id)', 'stickersCollected')
      .addSelect(
        `ROUND((COUNT(us.id) * 100.0 / ${totalStickers})::numeric, 2)`,
        'percentage',
      )
      .groupBy('u.id')
      .addGroupBy('u."fullName"')
      .orderBy('"stickersCollected"', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getTriviaRanking(limit = 20) {
    return this.triviaAttemptRepo
      .createQueryBuilder('t')
      .innerJoin('t.user', 'u')
      .select('u.id', 'id')
      .addSelect('u."fullName"', 'fullName')
      .addSelect('COUNT(t.id)', 'correctAnswers')
      .where('t."usedLife" = false')
      .groupBy('u.id')
      .addGroupBy('u."fullName"')
      .orderBy('"correctAnswers"', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
