import multer from 'multer';
<<<<<<< HEAD
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.config.js';

// Configuración de almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'comprobantes',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `comprobante-${uniqueSuffix}`;
    }
  }
});

export const uploadComprobante = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

=======
import path from 'path';
import fs from 'fs';

// Configuración de almacenamiento local
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Definir carpeta de destino
    const dir = 'public/uploads/comprobantes';
    
    // Crear carpeta si no existe
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Nombre único: comprobante-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `comprobante-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpg, png, webp)'), false);
  }
};

export const uploadComprobante = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});
>>>>>>> bb0a2ea29ef31bb2002d5c6db9d452633f6775c5
