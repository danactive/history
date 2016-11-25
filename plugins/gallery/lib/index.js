const fs = require('fs');
const path = require('path');

/*
 *      #####                   #####
 *     #     # ###### #####    #     #   ##   #      #      ###### #####  #   #
 *     #       #        #      #        #  #  #      #      #      #    #  # #
 *     #  #### #####    #      #  #### #    # #      #      #####  #    #   #
 *     #     # #        #      #     # ###### #      #      #      #####    #
 *     #     # #        #      #     # #    # #      #      #      #   #    #
 *      #####  ######   #       #####  #    # ###### ###### ###### #    #   #
 *
 */
module.exports.getGalleries = () => new Promise((resolve, reject) => {
  const repoRoot = path.join(__dirname, '../../../');
  fs.readdir(repoRoot, (error, files) => {
    if (error) {
      return reject(error);
    }

    const galleries = [];
    files.forEach((filename) => {
      if (filename.startsWith('gallery-')) {
        galleries.push(filename.substr(8));
      }
    });

    return resolve(galleries);
  });
});
