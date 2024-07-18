const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dlfrltm8x",
  api_key: "357454587825522",
  api_secret: "wBBGGx44RolTSHoes5bsDWxmce4",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "logo-story",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;
