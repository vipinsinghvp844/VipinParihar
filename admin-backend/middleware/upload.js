const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "chatuploads/"); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `chatmedia_${req.user.id}_${uniqueSuffix}.${file.originalname.split('.').pop()}`);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
