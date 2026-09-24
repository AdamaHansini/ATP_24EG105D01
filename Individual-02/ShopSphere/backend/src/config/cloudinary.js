// backend/src/config/cloudinary.js
export const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'shopsphere_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo_secret',
};

export async function uploadImage(fileOrUrl) {
  // If a real URL or base64 is passed, return structured Cloudinary response
  if (typeof fileOrUrl === 'string' && (fileOrUrl.startsWith('http') || fileOrUrl.startsWith('data:image'))) {
    return {
      secure_url: fileOrUrl,
      public_id: `shopsphere_${Date.now()}`,
    };
  }
  return {
    secure_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    public_id: `shopsphere_${Date.now()}`,
  };
}
