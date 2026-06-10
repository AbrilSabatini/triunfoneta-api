import { Repository } from 'typeorm';
import { Area } from '../../areas/entities/area.entity';

const AREAS_DATA = [
  {
    id: 1,
    name: 'Administración y Finanzas',
    color: '#534078',
  },
  {
    id: 2,
    name: 'Atencion al cliente',
    color: '#0e7449',
  },
  {
    id: 3,
    name: 'Cerrito',
    color: '#EC624E',
  },
  {
    id: 4,
    name: 'Cobranza y Seguimiento',
    color: '#FBBB21',
  },
  {
    id: 5,
    name: 'Comercial',
    color: '#d7df23',
  },
  {
    id: 6,
    name: 'Contabilidad',
    color: '#534078',
  },
  {
    id: 7,
    name: 'Desarrollo Web',
    color: '#0e7449',
  },
  {
    id: 8,
    name: 'Emision Autos',
    color: '#EC624E',
  },
  {
    id: 9,
    name: 'Emision OR',
    color: '#FBBB21',
  },
  {
    id: 10,
    name: 'Equipo GAUS',
    color: '#d7df23',
  },
  {
    id: 11,
    name: 'Estrategia y Marketing',
    color: '#534078',
  },
  {
    id: 12,
    name: 'Filial Bahía Blanca',
    color: '#0e7449',
  },
  {
    id: 13,
    name: 'Filial chaco y Posadas',
    color: '#EC624E',
  },
  {
    id: 14,
    name: 'Filial Lujan y Carrodilla',
    color: '#FBBB21',
  },
  {
    id: 15,
    name: 'Filial Neuquen',
    color: '#d7df23',
  },
  {
    id: 16,
    name: 'Filial Rosario',
    color: '#534078',
  },
  {
    id: 17,
    name: 'Filiales Catamarca y Santiago del Estero',
    color: '#0e7449',
  },
  {
    id: 18,
    name: 'Filiales Cordoba',
    color: '#EC624E',
  },
  {
    id: 19,
    name: 'Filiales Jujuy, Salta y Tucumán',
    color: '#ec624e',
  },
  {
    id: 20,
    name: 'Filiales Mar del Plata, Tandil y Santa Rosa',
    color: '#FBBB21',
  },
  {
    id: 21,
    name: 'Filiales Metropolitanas',
    color: '#d7df23',
  },
  {
    id: 22,
    name: 'Filiales San Juan',
    color: '#d7df23',
  },
  {
    id: 23,
    name: 'Filiales San Luis',
    color: '#534078',
  },
  {
    id: 24,
    name: 'Filiales San Martín y Valle de Uco',
    color: '#EC624E',
  },
  {
    id: 25,
    name: 'Filiales Santa Fe',
    color: '#534078',
  },
  {
    id: 26,
    name: 'Filiales Sur',
    color: '#FBBB21',
  },
  {
    id: 27,
    name: 'Filiales Sur de Mendoza',
    color: '#0e7449',
  },
  {
    id: 28,
    name: 'Gerencia General y Directorio',
    color: '#EC624E',
  },
  {
    id: 29,
    name: 'Infraestructura y MDA',
    color: '#FBBB21',
  },
  {
    id: 30,
    name: 'Innovación y proyectos',
    color: '#d7df23',
  },
  {
    id: 31,
    name: 'Legales',
    color: '#534078',
  },
  {
    id: 32,
    name: 'Oficina Paraguay',
    color: '#0e7449',
  },
  {
    id: 33,
    name: 'Operaciones y Supervision Filiales',
    color: '#EC624E',
  },
  {
    id: 34,
    name: 'Recursos Humanos',
    color: '#FBBB21',
  },
  {
    id: 35,
    name: 'Siniestros',
    color: '#d7df23',
  },
  {
    id: 36,
    name: 'Técnica y Reaseguros',
    color: '#534078',
  },
  {
    id: 37,
    name: 'Técnica, Jurídica y Costos',
    color: '#0e7449',
  },
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
