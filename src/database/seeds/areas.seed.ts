import { Repository } from 'typeorm';
import { Area } from '../../areas/entities/area.entity';

const AREAS_DATA = [
  { name: 'Comercial', color: '#2563eb' },
  { name: 'Estrategia', color: '#7c3aed' },
  { name: 'Marketing', color: '#e63946' },
  { name: 'Siniestros', color: '#d97706' },
  { name: 'RRHH', color: '#059669' },
  { name: 'Tecnología', color: '#0891b2' },
  { name: 'Finanzas', color: '#65a30d' },
  { name: 'Legal', color: '#9f1239' },
  { name: 'Operaciones', color: '#ea580c' },
  { name: 'Otra', color: '#6b7280' },
];

export async function seedAreas(repo: Repository<Area>): Promise<Area[]> {
  const result: Area[] = [];

  for (const data of AREAS_DATA) {
    let area = await repo.findOne({ where: { name: data.name } });

    if (!area) {
      area = repo.create(data);
      area = await repo.save(area);
      console.log(`   Área creada: ${data.name}`);
    } else {
      console.log(`    Área ya existe: ${data.name}`);
    }

    result.push(area);
  }

  return result;
}
