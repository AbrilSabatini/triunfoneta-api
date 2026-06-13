import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

const ALLOWED_TYPES = /image\/(jpeg|jpg|png|webp)/;
const MAX_SIZE_MB = 5;

export const multerImageConfig = {
  limits: {
    fileSize: MAX_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    if (!ALLOWED_TYPES.test(file.mimetype)) {
      return cb(
        new BadRequestException('Solo se permiten imágenes JPG, PNG o WebP'),
        false,
      );
    }
    cb(null, true);
  },
};

export const multerSupabaseConfig = {
  ...multerImageConfig,
  storage: memoryStorage(),
};

export function generateFileName(originalName: string): string {
  const ext = extname(originalName).toLowerCase();
  return `stickers/${uuid()}${ext}`;
}
