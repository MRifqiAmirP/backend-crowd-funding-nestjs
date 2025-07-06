import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

export const multerGalleryOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const path = './uploads/thumbails-project';
      if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
      cb(null, path);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `gallery-${unique}${ext}`);
    },
  }),
};