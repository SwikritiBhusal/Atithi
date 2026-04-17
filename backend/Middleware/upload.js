import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../Config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'atithi/homestays/';
    let transformation = [{ quality: 'auto' }];

    if (
      file.fieldname === 'citizenshipFiles' || 
      file.fieldname === 'tourismRegistration'
    ) {
      folder += 'documents';
    } else if (file.fieldname === 'homestayPhotos') {
  folder += 'photos';
  transformation = [ ];
    }else if (file.fieldname === 'ownerPhoto') { 
      folder += 'owners';
      transformation = [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ];
    }

    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      resource_type: 'auto',
      access_mode: 'public',
      type: 'upload', 
      transformation
    };
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 11 * 1024 * 1024 } // 11MB
});

export default upload;