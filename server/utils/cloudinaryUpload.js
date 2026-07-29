const { PassThrough } = require('stream');
const cloudinary = require('../config/cloudinary');

const uploadBuffer = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    const pass = new PassThrough();
    pass.end(buffer);
    pass.pipe(uploadStream);
  });
};

const destroy = (publicId) => cloudinary.uploader.destroy(publicId);

module.exports = { uploadBuffer, destroy };
