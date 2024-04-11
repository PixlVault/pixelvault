const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

const log = require('../utils/logger');

const POST_IMG_DIR = path.join(__dirname, '/../img/post_img/');

if (!fs.existsSync(POST_IMG_DIR)) {
  fs.mkdirSync(POST_IMG_DIR);
  log.info(`Created new directory for images at ${POST_IMG_DIR}`);
} else {
  log.info(`Directory for images already exists at ${POST_IMG_DIR}.`);
}

/**
 * Write raw post image data to disk as a PNG.
 * @param {string} postId The The ID of the post being published.
 * @param {Buffer} imgData The raw image data - an array of bytes.
 * @param {number} width The width of the image.
 * @param {number} height The height of the image.
 */
const writePostImage = (postId, imgData, width, height) => {
  const png = new PNG({ width, height });
  png.data = imgData;
  png.pack().pipe(fs.createWriteStream(path.join(POST_IMG_DIR, `${postId}.png`)));
};

module.exports = { writePostImage, POST_IMG_DIR };
