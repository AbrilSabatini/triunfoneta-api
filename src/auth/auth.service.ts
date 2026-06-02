import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import 'reflect-metadata';
import { In, Repository } from 'typeorm';

import { AreasService } from '../areas/areas.service';
import { generateTemporaryPassword } from '../common/utils/password.util';
import { MailService } from '../mail/mail.service';
import { BulkRegisterDto, LoginDto, RegisterDto } from '../users/dto/users.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

// ─── Tipos de respuesta ───────────────────────────────────────────────────────

export interface RegisterResult {
  accessToken: string;
  user: Omit<User, 'password'>;
}

export interface BulkRegisterResult {
  /** Usuarios nuevos persistidos en DB */
  created: number;
  /** Emails que ya existían en DB y fueron omitidos */
  skipped: number;
  /** Emails enviados con éxito en este request */
  emailsSent: number;
  /** Emails que fallaron y quedaron encolados para reintento automático */
  emailsQueued: number;
  /** Lista de emails omitidos por ya existir */
  skippedEmails: string[];
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,

    private areasService: AreasService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // ─── Registro individual ──────────────────────────────────────────────────

  /**
   * El usuario se registra con su propia contraseña.
   * El @BeforeInsert del entity se encarga del hash — no tocamos la contraseña acá.
   * Se envía un email de bienvenida sin mostrar credenciales
   * (el usuario ya conoce su contraseña).
   */
  async register(dto: RegisterDto): Promise<RegisterResult> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Ya existe una cuenta con ese email');
    }

    const user = this.usersRepo.create({
      email: dto.email,
      password: dto.password, // se hashea en @beforeInsert del entity
      fullName: dto.fullName,
      area: await this.areasService.findOne(dto.areaId),
      role: UserRole.USER,
    });
    const saved = await this.usersRepo.save(user);

    // Email de bienvenida sin bloque de credenciales
    // (temporaryPassword vacío → el template muestra solo el email)
    this.mailService
      .enqueueWelcome({
        fullName: saved.fullName,
        email: saved.email,
        temporaryPassword: '',
      })
      .catch((err) =>
        this.logger.error(
          `[AUTH] Error encolando bienvenida para ${saved.email}: ${err.message}`,
        ),
      );

    const { password: _, ...safeUser } = saved as any;
    return { accessToken: this.signToken(saved), user: safeUser };
  }

  // ─── Registro masivo ──────────────────────────────────────────────────────

  /**
   * Crea múltiples usuarios y les envía una contraseña temporal por email.
   *
   * Flujo:
   * 1. Fail-fast si hay emails duplicados dentro del mismo payload.
   * 2. Filtrar emails que ya existen en DB (se omiten, no se lanza error).
   * 3. Generar plain+hash por usuario en un solo paso (evita la desincronización
   *    que ocurre si se generan en pasos separados).
   * 4. Persistir con QueryBuilder directo, saltando @BeforeInsert para que el
   *    hash ya generado no sea hasheado una segunda vez.
   * 5. Encolar emails de bienvenida con la contraseña en texto plano.
   * 6. Devolver resumen.
   */
  async bulkRegister(dto: BulkRegisterDto): Promise<BulkRegisterResult> {
    // 1 ── Duplicados dentro del mismo payload ─────────────────────────────
    const emailsLower = dto.users.map((u) => u.email.toLowerCase());
    const uniqueSet = new Set(emailsLower);

    if (uniqueSet.size !== emailsLower.length) {
      const dupes = emailsLower.filter((e, i) => emailsLower.indexOf(e) !== i);
      throw new ConflictException(
        `El payload contiene emails duplicados: ${[...new Set(dupes)].join(', ')}`,
      );
    }

    // 2 ── Filtrar emails que ya existen en DB ─────────────────────────────
    const existingRows = await this.usersRepo.find({
      where: { email: In([...uniqueSet]) },
      select: ['email'],
    });
    const existingSet = new Set(existingRows.map((u) => u.email.toLowerCase()));
    const toCreate = dto.users.filter(
      (u) => !existingSet.has(u.email.toLowerCase()),
    );
    const skippedEmails = dto.users
      .filter((u) => existingSet.has(u.email.toLowerCase()))
      .map((u) => u.email);

    if (toCreate.length === 0) {
      this.logger.warn('[BULK] Todos los emails ya estaban registrados.');
      return {
        created: 0,
        skipped: skippedEmails.length,
        emailsSent: 0,
        emailsQueued: 0,
        skippedEmails,
      };
    }

    // 3 ── Generar plain + hash en un solo paso por usuario ────────────────
    //
    // IMPORTANTE: plain y hash se generan juntos en el mismo objeto
    // para garantizar que corresponden al mismo valor.
    // Si se generan en pasos separados (como ocurría antes), hay riesgo de
    // que el hash no corresponda al plain que se envía por email.
    //
    const prepared = await Promise.all(
      toCreate.map(async (u) => {
        const plainPassword = generateTemporaryPassword();
        return {
          user: u,
          plainPassword,
          hashedPassword: await bcrypt.hash(plainPassword, 10),
        };
      }),
    );

    // 4 ── INSERT directo, saltando @BeforeInsert ──────────────────────────
    //
    // usersRepo.save() dispara @BeforeInsert → bcrypt.hash() nuevamente,
    // lo que hashearía el hash ya generado y rompería el login del usuario.
    // QueryBuilder hace un INSERT raw que omite el lifecycle hook.
    //
    await this.usersRepo
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(
        prepared.map(({ user: u, hashedPassword }) => ({
          email: u.email,
          fullName: u.fullName,
          areaId: u.areaId,
          password: hashedPassword,
          role: UserRole.USER,
          isActive: true,
          stickerCreated: false,
          points: 0,
        })),
      )
      .orIgnore() // safety net contra race conditions
      .execute();

    // Recuperar los registros recién creados para tener sus IDs completos
    const created = await this.usersRepo.find({
      where: { email: In(prepared.map((p) => p.user.email)) },
    });
    this.logger.log(`[BULK] ${created.length} usuarios creados.`);

    // 5 ── Encolar emails con la contraseña en texto plano ─────────────────
    const { sent: emailsSent, queued: emailsQueued } =
      await this.mailService.enqueueWelcomeBatch(
        prepared.map(({ user: u, plainPassword }) => ({
          fullName: u.fullName,
          email: u.email,
          temporaryPassword: plainPassword,
        })),
      );

    return {
      created: created.length,
      skipped: skippedEmails.length,
      emailsSent,
      emailsQueued,
      skippedEmails,
    };
  }

  // ─── Login ────────────────────────────────────────────────────────────────

  /**
   * findByEmail usa addSelect('user.password') para traer el campo
   * que está excluido por defecto con select: false.
   */
  async login(dto: LoginDto): Promise<RegisterResult> {
    const user = await this.usersService.findByEmail(dto.email);

    // Mismo mensaje para "no encontrado" y "contraseña incorrecta"
    // para evitar user enumeration
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valid = await user.validatePassword(dto.password);
    if (!valid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password: _, ...safeUser } = user as any;
    return { accessToken: this.signToken(user), user: safeUser };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private signToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
