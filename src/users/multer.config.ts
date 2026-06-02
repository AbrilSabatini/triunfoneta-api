import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

const ALLOWED_TYPES = /image\/(jpeg|jpg|png|webp)/;
const MAX_SIZE_MB = 5;

export const multerAvatarConfig = {
  storage: diskStorage({
    destination: './uploads/avatars',
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `${uuid()}${ext}`);
    },
  }),
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

export const multerStickerConfig = {
  ...multerAvatarConfig,
  storage: diskStorage({
    destination: './uploads/stickers',
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `${uuid()}${ext}`);
    },
  }),
};
