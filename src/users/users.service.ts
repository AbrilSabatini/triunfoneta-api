import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { PointReason } from '../points/entities/point-transaction.entity';
import { PointsService } from '../points/points.service';
import {
  ChangePasswordDto,
  CreateStickerDto,
  QueryUsersDto,
  UpdateStickerDto,
  UpdateUserAdminDto,
  UpdateUserDto,
} from './dto/users.dto';
import { Sticker } from './entities/sticker.entity';
import { User, UserRole } from './entities/user.entity';

const STICKER_CREATION_POINTS = Number(
  process.env.STICKER_CREATION_POINTS ?? 50,
);

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(Sticker)
    private stickersRepo: Repository<Sticker>,

    private pointsService: PointsService,
  ) {}

  // ─── Búsqueda interna (usada por AuthService) ─────────────────────────────

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  // ─── Perfil propio ────────────────────────────────────────────────────────

  async getMe(userId: number): Promise<User> {
    return this.findById(userId);
  }

  async updateMe(userId: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(userId);
    Object.assign(user, dto);
    return this.usersRepo.save(user);
  }

  async updateAvatar(userId: number, avatarUrl: string): Promise<User> {
    const user = await this.findById(userId);
    user.avatarUrl = avatarUrl;
    return this.usersRepo.save(user);
  }

  // ─── Figurita propia ──────────────────────────────────────────────────────

  async createSticker(userId: number, dto: CreateStickerDto): Promise<Sticker> {
    const user = await this.findById(userId);

    if (user.stickerCreated) {
      throw new ConflictException(
        'Ya creaste tu figurita. Podés editarla pero no crearla de nuevo.',
      );
    }

    // Asignar número de figurita autoincremental
    const lastSticker = await this.stickersRepo.findOne({
      where: {},
      order: { stickerNumber: 'DESC' },
    });
    const stickerNumber = (lastSticker?.stickerNumber ?? 0) + 1;

    const sticker = this.stickersRepo.create({
      ...dto,
      user,
      area: user.area.name,
      stickerNumber,
    });

    const saved = await this.stickersRepo.save(sticker);

    // Marcar usuario y sumar puntos en paralelo
    await Promise.all([
      this.usersRepo.update(userId, { stickerCreated: true }),
      this.pointsService.award(
        userId,
        STICKER_CREATION_POINTS,
        PointReason.STICKER_CREATED,
        saved.id,
      ),
    ]);

    return saved;
  }

  async getMySticker(userId: number): Promise<Sticker> {
    const sticker = await this.stickersRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!sticker) {
      throw new NotFoundException(
        'Todavía no creaste tu figurita. ¡Completá tu perfil primero!',
      );
    }
    return sticker;
  }

  async updateMySticker(
    userId: number,
    dto: UpdateStickerDto,
  ): Promise<Sticker> {
    const sticker = await this.getMySticker(userId);
    Object.assign(sticker, dto);
    return this.stickersRepo.save(sticker);
  }

  async updateStickerPhoto(userId: number, photoUrl: string): Promise<Sticker> {
    const sticker = await this.getMySticker(userId);
    sticker.photoUrl = photoUrl;
    sticker.useAvatar = false;
    return this.stickersRepo.save(sticker);
  }

  // ─── Búsqueda pública de usuarios (para intercambios) ────────────────────

  async findPublicProfile(targetUserId: number): Promise<{
    user: UserResponseDto;
    sticker: Sticker | null;
  }> {
    const user = await this.findById(targetUserId);
    const sticker = await this.stickersRepo.findOne({
      where: { user: { id: targetUserId } },
    });
    return {
      user: plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      }),
      sticker,
    };
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  async findAll(
    query: QueryUsersDto,
  ): Promise<{ data: User[]; total: number }> {
    const { search, areaId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const qb = this.usersRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.area', 'area')
      .where('user.role = :role', { role: UserRole.USER })
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (areaId) qb.andWhere('user.areaId = :areaId', { areaId });
    if (search)
      qb.andWhere('user.fullName ILIKE :search', { search: `%${search}%` });

    const [users, total] = await qb.getManyAndCount();

    const data = plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });
    return { data, total };
  }

  async updateByAdmin(
    userId: number,
    dto: UpdateUserAdminDto,
    requestingUser: User,
  ): Promise<User> {
    if (requestingUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No tenés permisos para esta acción');
    }
    const user = await this.findById(userId);
    Object.assign(user, dto);
    return this.usersRepo.save(user);
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    // Traer la contraseña (campo select:false)
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const valid = await user.validatePassword(dto.currentPassword);
    if (!valid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta.');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'La nueva contraseña no puede ser igual a la actual.',
      );
    }

    // Hashear manualmente (no usar save() para evitar que @BeforeUpdate
    // hashee el hash si otros campos cambian al mismo tiempo)
    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepo.update(userId, { password: hashed });
  }

  async getStats(): Promise<{
    total: number;
    withSticker: number;
    byArea: Record<string, number>;
  }> {
    const total = await this.usersRepo.count();
    const withSticker = await this.usersRepo.count({
      where: { stickerCreated: true },
    });

    const rawByArea = await this.usersRepo
      .createQueryBuilder('user')
      .select('user.area', 'area')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.area')
      .getRawMany();

    const byArea = rawByArea.reduce(
      (acc, r) => {
        acc[r.area ?? 'Sin área'] = Number(r.count);
        return acc;
      },
      {} as Record<string, number>,
    );

    return { total, withSticker, byArea };
  }
}
