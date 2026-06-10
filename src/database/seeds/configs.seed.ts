import { Repository } from 'typeorm';
import { Config, ConfigType } from '../../configs/entities/config.entity';

const CONFIGS_DATA = [
  {
    type: ConfigType.STICKER_CREATION_POINTS,
    value: 50,
    description: 'Puntos otorgados al usuario por crear una figurita',
  },
  {
    type: ConfigType.PRODE_EXACT_POINTS,
    value: 10,
    description:
      'Puntos otorgados por acertar el resultado exacto de un partido',
  },
  {
    type: ConfigType.PRODE_WINNER_POINTS,
    value: 5,
    description: 'Puntos otorgados por acertar el ganador o empate del partido',
  },
  {
    type: ConfigType.AREA_COMPLETION_POINTS,
    value: 100,
    description: 'Puntos otorgados al completar todas las figuritas de un área',
  },
  {
    type: ConfigType.PACK_COST_POINTS,
    value: 100,
    description:
      'Cantidad de puntos necesarios para comprar un paquete de figuritas',
  },
  {
    type: ConfigType.PACK_STICKERS_PER_PACK,
    value: 5,
    description: 'Cantidad de figuritas entregadas al abrir un paquete',
  },
  {
    type: ConfigType.PACK_LEGEND_CHANCE,
    value: 0.2,
    description:
      'Probabilidad de obtener una figurita legendaria en un paquete (20%)',
  },
];

export async function seedConfigs(repo: Repository<Config>): Promise<Config[]> {
  const result: Config[] = [];

  for (const data of CONFIGS_DATA) {
    let config = await repo.findOne({
      where: {
        type: data.type,
      },
    });

    if (!config) {
      config = repo.create(data);
      config = await repo.save(config);

      console.log(`   Config creada: ${data.type}`);
    } else {
      console.log(`   Config ya existe: ${data.type}`);
    }

    result.push(config);
  }

  return result;
}
