import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
dotenv.config();

import { Area } from '../../areas/entities/area.entity';
import { User } from '../../users/entities/user.entity';

import { Config } from '../../configs/entities/config.entity';
import { Match } from '../../prode/entities/match.entity';
import { TriviaOption } from '../../trivia/entities/trivia-option.entity';
import { TriviaQuestion } from '../../trivia/entities/trivia-question.entity';
import { seedMatches } from '../matches.seed';
import { seedAreas } from './areas.seed';
import { seedConfigs } from './configs.seed';
import { seedTrivia } from './trivia.seed';
import { seedUsers } from './users.seed';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Area, User, TriviaQuestion, TriviaOption, Match, Config],
  synchronize: true,
  logging: false,
});

async function run() {
  console.log(' Iniciando seed...\n');

  const dataSource = await AppDataSource.initialize();
  console.log(' Conexión a DB establecida\n');

  const areaRepo = AppDataSource.getRepository(Area);
  const userRepo = AppDataSource.getRepository(User);
  const questionRepo = AppDataSource.getRepository(TriviaQuestion);
  const optionRepo = AppDataSource.getRepository(TriviaOption);
  const configRepo = AppDataSource.getRepository(Config);
  const matchRepo = AppDataSource.getRepository(Match);

  const areas = await seedAreas(areaRepo);
  console.log(` Áreas: ${areas.length} registros\n`);

  const users = await seedUsers(userRepo, areas);
  console.log(` Usuarios: ${users.length} registros\n`);

  await seedTrivia(questionRepo, optionRepo, dataSource);

  const configs = await seedConfigs(configRepo);
  console.log(` Configs: ${configs.length} registros\n`);

  const matches = await seedMatches(matchRepo);
  console.log(` Partidos: ${matches.length} registros\n`);

  await AppDataSource.destroy();
  console.log(' Seed completado exitosamente.');
}

run().catch((err) => {
  console.error(' Error en seed:', err);
  process.exit(1);
});
