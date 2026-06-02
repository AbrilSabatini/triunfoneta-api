import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import {
  PointReason,
  PointTransaction,
} from './entities/point-transaction.entity';

@Injectable()
export class PointsService {
  private readonly logger = new Logger(PointsService.name);

  constructor(
    @InjectRepository(PointTransaction)
    private txRepo: Repository<PointTransaction>,

    @InjectRepository(User)
    private usersRepo: Repository<User>,

    private dataSource: DataSource,
  ) {}

  /**
   * Otorga puntos a un usuario. Único punto de entrada para sumar puntos.
   * Usa una transacción de DB para garantizar consistencia entre
   * user.points y el registro en point_transactions.
   */
  async award(
    userId: number,
    amount: number,
    reason: PointReason,
    referenceId?: number,
  ): Promise<PointTransaction> {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOneOrFail(User, { where: { id: userId } });

      user.points += amount;
      await manager.save(user);

      const tx = manager.create(PointTransaction, {
        userId,
        amount,
        reason,
        referenceId,
        balanceAfter: user.points,
      });

      const saved = await manager.save(tx);
      this.logger.log(
        `[POINTS] +${amount} → user=${userId} reason=${reason} balance=${user.points}`,
      );
      return saved;
    });
  }

  /**
   * Descuenta puntos (ej: compra de sobre).
   * Lanza BadRequestException si el saldo es insuficiente.
   */
  async spend(
    userId: number,
    amount: number,
    reason: PointReason,
    referenceId?: number,
  ): Promise<PointTransaction> {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOneOrFail(User, { where: { id: userId } });

      if (user.points < amount) {
        throw new BadRequestException(
          `Puntos insuficientes. Tenés ${user.points} y necesitás ${amount}.`,
        );
      }

      user.points -= amount;
      await manager.save(user);

      const tx = manager.create(PointTransaction, {
        userId,
        amount: -amount,
        reason,
        referenceId,
        balanceAfter: user.points,
      });

      return manager.save(tx);
    });
  }

  async getHistory(
    userId: number,
    page = 1,
    limit = 20,
  ): Promise<{ data: PointTransaction[]; total: number }> {
    const [data, total] = await this.txRepo.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async getBalance(userId: number): Promise<{ points: number }> {
    const user = await this.usersRepo.findOneOrFail({ where: { id: userId } });
    return { points: user.points };
  }
}
