import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateConfigDto } from './dto/config.dto';
import { Config, ConfigType } from './entities/config.entity';

@Injectable()
export class ConfigsService {
  constructor(
    @InjectRepository(Config)
    private readonly repository: Repository<Config>,
  ) {}

  async findAll(): Promise<Config[]> {
    return this.repository.find();
  }

  async findByType(type: ConfigType): Promise<Config> {
    const config = await this.repository.findOne({
      where: { type },
    });

    if (!config) {
      throw new NotFoundException(
        `Configuración del tipo ${type} no encontada`,
      );
    }

    return config;
  }

  async update(type: ConfigType, dto: UpdateConfigDto): Promise<Config> {
    const config = await this.findByType(type);

    config.value = dto.value;

    return this.repository.save(config);
  }

  async getNumber(type: ConfigType): Promise<number> {
    const config = await this.findByType(type);

    return Number(config.value);
  }
}
