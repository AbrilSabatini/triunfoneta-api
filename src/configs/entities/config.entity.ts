import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ConfigType {
  STICKER_CREATION_POINTS = 'STICKER_CREATION_POINTS',
  STICKER_REUPLOAD_POINTS = 'STICKER_REUPLOAD_POINTS',
  PRODE_EXACT_POINTS = 'PRODE_EXACT_POINTS',
  PRODE_WINNER_POINTS = 'PRODE_WINNER_POINTS',
  AREA_COMPLETION_POINTS = 'AREA_COMPLETION_POINTS',

  PACK_COST_POINTS = 'PACK_COST_POINTS',
  PACK_STICKERS_PER_PACK = 'PACK_STICKERS_PER_PACK',

  PACK_LEGEND_CHANCE = 'PACK_LEGEND_CHANCE',
}

@Entity('configs')
export class Config {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ConfigType,
    unique: true,
  })
  type: ConfigType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  value: number;

  @Column({
    nullable: true,
  })
  description?: string;
}
