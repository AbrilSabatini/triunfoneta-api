import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Area } from '../../areas/entities/area.entity';
import { User, UserRole } from '../../users/entities/user.entity';

// Contraseña fija para DEV. En producción cada usuario recibe la suya por email.
const DEV_PASSWORD = process.env.USER_ADMIN_PASSWORD || 'triunfo123';

const SEED_USERS = [
  // ─── Admin ────────────────────────────────────────────────────────────────
  {
    email: 'admin@triunfo.com',
    fullName: 'Admin Triunfoneta',
    areaName: 'Innovación y proyectos',
    role: UserRole.ADMIN,
  },
];

export async function seedUsers(
  repo: Repository<User>,
  areas: Area[],
): Promise<User[]> {
  const areaMap = new Map(areas.map((a) => [a.name, a]));
  const result: User[] = [];
  const hashedPassword = await bcrypt.hash(DEV_PASSWORD, 10);

  for (const data of SEED_USERS) {
    let user = await repo.findOne({ where: { email: data.email } });

    if (!user) {
      const area = areaMap.get(data.areaName);
      if (!area) {
        console.warn(
          `Área "${data.areaName}" no encontrada, saltando ${data.email}`,
        );
        continue;
      }

      user = repo.create({
        email: data.email,
        fullName: data.fullName,
        password: hashedPassword,
        area,
        role: data.role ?? UserRole.USER,
        isActive: true,
      });

      // Saltear el @BeforeInsert que volvería a hashear
      await repo
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          email: user.email,
          fullName: user.fullName,
          password: hashedPassword,
          area,
          role: user.role,
          isActive: true,
          stickerCreated: false,
          points: 0,
        })
        .orIgnore()
        .execute();

      user = await repo.findOne({ where: { email: data.email } });
      console.log(
        `   Usuario creado: ${data.fullName} (${data.role ?? 'user'})`,
      );
    } else {
      console.log(`    Usuario ya existe: ${data.email}`);
    }

    result.push(user as User);
  }

  return result;
}
