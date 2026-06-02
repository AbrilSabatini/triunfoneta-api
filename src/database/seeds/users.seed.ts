import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Area } from '../../areas/entities/area.entity';
import { User, UserRole } from '../../users/entities/user.entity';

// Contraseña fija para DEV. En producción cada usuario recibe la suya por email.
const DEV_PASSWORD = 'Triunfo2025!';

const SEED_USERS = [
  // ─── Admin ────────────────────────────────────────────────────────────────
  {
    email: 'admin@triunfo.com',
    fullName: 'Admin Triunfoneta',
    areaName: 'Tecnología',
    role: UserRole.ADMIN,
  },
  // ─── Empleados por área ───────────────────────────────────────────────────
  {
    email: 'pablo.garcia@triunfo.com',
    fullName: 'Pablo García',
    areaName: 'Comercial',
  },
  {
    email: 'lucia.fernandez@triunfo.com',
    fullName: 'Lucía Fernández',
    areaName: 'Comercial',
  },
  {
    email: 'martin.lopez@triunfo.com',
    fullName: 'Martín López',
    areaName: 'Estrategia',
  },
  {
    email: 'ana.martinez@triunfo.com',
    fullName: 'Ana Martínez',
    areaName: 'Marketing',
  },
  {
    email: 'sofia.rodriguez@triunfo.com',
    fullName: 'Sofía Rodríguez',
    areaName: 'Marketing',
  },
  {
    email: 'diego.sanchez@triunfo.com',
    fullName: 'Diego Sánchez',
    areaName: 'Siniestros',
  },
  {
    email: 'valeria.gomez@triunfo.com',
    fullName: 'Valeria Gómez',
    areaName: 'Siniestros',
  },
  {
    email: 'nicolas.perez@triunfo.com',
    fullName: 'Nicolás Pérez',
    areaName: 'RRHH',
  },
  {
    email: 'camila.diaz@triunfo.com',
    fullName: 'Camila Díaz',
    areaName: 'RRHH',
  },
  {
    email: 'juan.torres@triunfo.com',
    fullName: 'Juan Torres',
    areaName: 'Tecnología',
  },
  {
    email: 'florencia.ruiz@triunfo.com',
    fullName: 'Florencia Ruiz',
    areaName: 'Tecnología',
  },
  {
    email: 'ignacio.vargas@triunfo.com',
    fullName: 'Ignacio Vargas',
    areaName: 'Finanzas',
  },
  {
    email: 'natalia.molina@triunfo.com',
    fullName: 'Natalia Molina',
    areaName: 'Finanzas',
  },
  {
    email: 'rodrigo.ortiz@triunfo.com',
    fullName: 'Rodrigo Ortiz',
    areaName: 'Legal',
  },
  {
    email: 'mariela.silva@triunfo.com',
    fullName: 'Mariela Silva',
    areaName: 'Legal',
  },
  {
    email: 'andres.herrera@triunfo.com',
    fullName: 'Andrés Herrera',
    areaName: 'Operaciones',
  },
  {
    email: 'carolina.mora@triunfo.com',
    fullName: 'Carolina Mora',
    areaName: 'Operaciones',
  },
  {
    email: 'matias.reyes@triunfo.com',
    fullName: 'Matías Reyes',
    areaName: 'Estrategia',
  },
  {
    email: 'paola.castro@triunfo.com',
    fullName: 'Paola Castro',
    areaName: 'Otra',
  },
  {
    email: 'emilio.rojas@triunfo.com',
    fullName: 'Emilio Rojas',
    areaName: 'Otra',
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
        .orIgnore() // no falla si el email ya existe (race condition)
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

  console.log(
    `\n   Contraseña de desarrollo: "${DEV_PASSWORD}" (todos los usuarios)`,
  );
  return result;
}
