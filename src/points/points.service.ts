import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
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
   *
   * Si se pasa un `manager` (EntityManager) reutiliza la transacción
   * padre en lugar de crear una nueva (evita savepoints anidados).
   */
  async award(
    userId: number,
    amount: number,
    reason: PointReason,
    referenceId?: number,
    manager?: EntityManager,
  ): Promise<PointTransaction> {
    const work = async (mgr: EntityManager) => {
      const user = await mgr.findOneOrFail(User, {
        where: { id: userId },
      });

      user.points = Number(user.points) + amount;
      await mgr.save(user);

      const tx = mgr.create(PointTransaction, {
        user,
        amount,
        reason,
        referenceId,
        balanceAfter: user.points,
      });

      const saved = await mgr.save(tx);
      this.logger.log(
        `[POINTS] +${amount} → user=${userId} reason=${reason} balance=${user.points}`,
      );
      return saved;
    };

    return manager ? work(manager) : this.dataSource.transaction(work);
  }

  /**
   * Descuenta puntos (ej: compra de sobre).
   * Lanza BadRequestException si el saldo es insuficiente.
   *
   * Si se pasa un `manager` (EntityManager) reutiliza la transacción
   * padre en lugar de crear una nueva.
   */
  async spend(
    userId: number,
    amount: number,
    reason: PointReason,
    referenceId?: number,
    manager?: EntityManager,
  ): Promise<PointTransaction> {
    const work = async (mgr: EntityManager) => {
      const user = await mgr.findOneOrFail(User, {
        where: { id: Number(userId) },
      });

      user.points = Number(user.points);

      if (user.points < amount) {
        throw new BadRequestException(
          `Puntos insuficientes. Tenés ${user.points} y necesitás ${amount}.`,
        );
      }

      user.points -= amount;
      await mgr.save(user);

      const tx = mgr.create(PointTransaction, {
        user,
        amount: -amount,
        reason,
        referenceId,
        balanceAfter: user.points,
      });

      return mgr.save(tx);
    };

    return manager ? work(manager) : this.dataSource.transaction(work);
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
