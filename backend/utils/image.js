const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

const log = require('../utils/logger');

const POST_IMG_DIR = path.join(__dirname, '/../img/post_img/');
const PROFILE_IMG_DIR = path.join(__dirname, '/../img/profile_img/');

if (!fs.existsSync(POST_IMG_DIR)) {
  fs.mkdirSync(POST_IMG_DIR);
  log.info(`Created new directory for images at ${POST_IMG_DIR}`);
} else {
  log.info(`Directory for images already exists at ${POST_IMG_DIR}.`);
}

if (!fs.existsSync(PROFILE_IMG_DIR)) {
  fs.mkdirSync(PROFILE_IMG_DIR);
  log.info(`Created new directory for images at ${PROFILE_IMG_DIR}`);
} else {
  log.info(`Directory for images already exists at ${PROFILE_IMG_DIR}.`);
}

const deleteImage = (filepath) => {
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
};

/**
 * Removes the image associated with a user.
 * @param {string} username The username of the user whose image should be removed.
 */
const deleteUserImage = (username) => deleteImage(`${PROFILE_IMG_DIR}${username}.png`);

/**
 * Removes the image associated with a post.
 * @param {string} postId The ID of the post whose image should be removed.
 */
const deletePostImage = (postId) => deleteImage(`${POST_IMG_DIR}${postId}.png`);

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

module.exports = { writePostImage, POST_IMG_DIR, deleteUserImage, deletePostImage };
