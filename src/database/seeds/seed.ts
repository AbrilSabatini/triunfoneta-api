import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
dotenv.config();

import { Area } from '../../areas/entities/area.entity';
import { MailQueue } from '../../mail/entities/mail-queue.entity';
import { PointTransaction } from '../../points/entities/point-transaction.entity';
import { Sticker } from '../../users/entities/sticker.entity';
import { User } from '../../users/entities/user.entity';

import { seedAreas } from './areas.seed';
import { seedStickers } from './stickers.seed';
import { seedUsers } from './users.seed';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Area, User, Sticker, PointTransaction, MailQueue],
  synchronize: true,
  logging: false,
});

async function run() {
  console.log(' Iniciando seed...\n');

  await AppDataSource.initialize();
  console.log(' Conexión a DB establecida\n');

  const areaRepo = AppDataSource.getRepository(Area);
  const userRepo = AppDataSource.getRepository(User);
  const stickerRepo = AppDataSource.getRepository(Sticker);

  const areas = await seedAreas(areaRepo);
  console.log(` Áreas: ${areas.length} registros\n`);

  const users = await seedUsers(userRepo, areas);
  console.log(` Usuarios: ${users.length} registros\n`);

  await seedStickers(stickerRepo, users);
  console.log(` Figuritas creadas\n`);

  await AppDataSource.destroy();
  console.log(' Seed completado exitosamente.');
}

run().catch((err) => {
  console.error(' Error en seed:', err);
  process.exit(1);
});
