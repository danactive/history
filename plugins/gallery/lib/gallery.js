const fs = require('fs');
const path = require('path');

function galleryFolders() {
  return new Promise((resolve, reject) => {
    const repoRoot = path.join(__dirname, '../../../', 'public/galleries');
    fs.readdir(repoRoot, (error, files) => {
      if (error) {
        reject(error);
        return;
      }

      const galleries = [];
      files.forEach((filename) => {
        if (filename.startsWith('gallery-')) {
          galleries.push(filename.substr(8));
        }
      });

      resolve(galleries);
    });
  });
}

const getGalleries = () => new Promise((resolve, reject) => {
  galleryFolders()
    .then(galleries => resolve(galleries))
    .catch(error => reject(error));
});

module.exports = {
  getGalleries
};
