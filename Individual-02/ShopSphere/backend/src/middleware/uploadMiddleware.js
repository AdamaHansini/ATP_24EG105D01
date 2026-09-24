// backend/src/middleware/uploadMiddleware.js
import { uploadImage } from '../config/cloudinary.js';

export async function handleImageUpload(req, res, next) {
  if (req.body && req.body.imageUrl) {
    try {
      const uploadResult = await uploadImage(req.body.imageUrl);
      req.uploadedImageUrl = uploadResult.secure_url;
    } catch (e) {
      console.warn('Image upload processing failed:', e.message);
    }
  }
  next();
}
