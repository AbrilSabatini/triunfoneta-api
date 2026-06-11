import { Repository } from 'typeorm';
import { UserSticker } from '../../packs/entities/user-sticker.entity';
import { Sticker } from '../../users/entities/sticker.entity';

export interface AlbumSection {
  area: string;
  totalStickers: number;
  ownedStickers: number;
  percentage: number;
  isComplete: boolean;
}

export async function getAlbumSections(
  userId: number,
  stickerRepo: Repository<Sticker>,
  userStickerRepo: Repository<UserSticker>,
): Promise<AlbumSection[]> {
  const totals = await stickerRepo
    .createQueryBuilder('s')
    .select('s.area', 'area')
    .addSelect('COUNT(*)', 'total')
    .groupBy('s.area')
    .orderBy('s.area', 'ASC')
    .getRawMany();

  const owned = await userStickerRepo
    .createQueryBuilder('us')
    .innerJoin('us.sticker', 's')
    .select('s.area', 'area')
    .addSelect('COUNT(DISTINCT us.stickerId)', 'owned')
    .where('us.ownerId = :userId', { userId })
    .groupBy('s.area')
    .getRawMany();

  const ownedMap = new Map<string, number>(
    owned.map((r) => [r.area, Number(r.owned)]),
  );

  return totals.map((r) => {
    const total = Number(r.total);
    const have = ownedMap.get(r.area) ?? 0;
    const percentage = total > 0 ? Math.round((have / total) * 100) : 0;
    return {
      area: r.area ?? 'General',
      totalStickers: total,
      ownedStickers: have,
      percentage,
      isComplete: have === total && total > 0,
    };
  });
}
