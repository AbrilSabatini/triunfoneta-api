import { Expose } from 'class-transformer';
import { IsDecimal } from 'class-validator';
import { ConfigType } from '../entities/config.entity';

export class UpdateConfigDto {
  @IsDecimal()
  value: number;
}

export class ConfigDto {
  @Expose()
  id: number;

  @Expose()
  type: ConfigType;

  @Expose()
  value: number;

  @Expose()
  description?: string;
}
