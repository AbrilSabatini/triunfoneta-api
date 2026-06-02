import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAreaDto, UpdateAreaDto } from './dto/area.dto';
import { Area } from './entities/area.entity';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private areasRepo: Repository<Area>,
  ) {}

  async findAll(onlyActive = false): Promise<Area[]> {
    const where = onlyActive ? { isActive: true } : {};
    return this.areasRepo.find({ where, order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Area> {
    const area = await this.areasRepo.findOne({ where: { id } });
    if (!area) throw new NotFoundException(`Área con id "${id}" no encontrada`);
    return area;
  }

  async findByName(name: string): Promise<Area | null> {
    return this.areasRepo.findOne({ where: { name } });
  }

  async create(dto: CreateAreaDto): Promise<Area> {
    const existing = await this.findByName(dto.name);
    if (existing)
      throw new ConflictException(`Ya existe un área llamada "${dto.name}"`);
    const area = this.areasRepo.create(dto);
    return this.areasRepo.save(area);
  }

  async update(id: number, dto: UpdateAreaDto): Promise<Area> {
    const area = await this.findOne(id);
    if (dto.name && dto.name !== area.name) {
      const existing = await this.findByName(dto.name);
      if (existing)
        throw new ConflictException(`Ya existe un área llamada "${dto.name}"`);
    }
    Object.assign(area, dto);
    return this.areasRepo.save(area);
  }

  async remove(id: number): Promise<void> {
    const area = await this.findOne(id);
    await this.areasRepo.remove(area);
  }
}
