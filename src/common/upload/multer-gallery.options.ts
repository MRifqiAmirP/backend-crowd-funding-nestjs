import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

export const multerGalleryOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      let path = './uploads';
      if (file.fieldname === 'thumbnail') {
        path += '/thumbnails';
      } else if (file.fieldname === 'galleries') {
        path += '/gallery';
      }

      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }

      cb(null, path);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${unique}${ext}`);
    },
  }),
};
