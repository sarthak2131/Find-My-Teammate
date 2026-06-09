const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const hasCloudinaryConfig =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const profileStorage = hasCloudinaryConfig
  ? new CloudinaryStorage({
      cloudinary,
      params: async () => ({
        folder: "find-my-teammate",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      }),
    })
  : multer.memoryStorage();

const posterStorage = hasCloudinaryConfig
  ? new CloudinaryStorage({
      cloudinary,
      params: async (req, file) => ({
        folder: "find-my-teammate/posters",
        resource_type: file.mimetype.startsWith("video/") ? "video" : "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "webm", "mov"],
      }),
    })
  : multer.memoryStorage();

const uploadLimits = { fileSize: 10 * 1024 * 1024 };

const upload = multer({ storage: profileStorage, limits: uploadLimits });
const posterUpload = multer({ storage: posterStorage, limits: uploadLimits });

module.exports = { cloudinary, upload, posterUpload, hasCloudinaryConfig };

