function findUniqueFiles() {

}

/**
Generate renamed files

@method calculateFutureFilenames
@param {string[]} sourceFilenames List of filenames to rename
@param {string} prefix Root of filename with increment added before extension
@param {string} [xmlStartPhotoId] initial position
@return {json}
**/
function calculateFutureFilenames(sourceFilenames, prefix, xmlStartPhotoId = 100) {
  const files = [];
  const filenames = [];
  let xml = '';
  const spread = [];

  const photosInDay = findUniqueFiles(sourceFilenames);

  function determineSpread() {
    const FIRST_PHOTO_NUMBER = 10; // 1-9 are reserved for future photo additions
    const LAST_PHOTO_NUMBER = 90; // 91-99 are reserved for future photo additions

    const maxRange = (LAST_PHOTO_NUMBER - FIRST_PHOTO_NUMBER) + 1; //  +1 to include both #s in the range
    const increment = maxRange / photosInDay;
    const incrementInt = parseInt(increment, 10);
    const incrementFloat = increment - incrementInt;

    for (let i = 1, photoIncrement = 0, prevBuildUp = 0; i <= photosInDay; i += 1) {
      const buildUp = parseInt(incrementFloat * i, 10);
      if (i === 1 && i === photosInDay) { // only ONE photo
        photoIncrement = 50;
      } else if (i === 1) {
        photoIncrement = FIRST_PHOTO_NUMBER + incrementInt + buildUp;
      } else if (i === photosInDay) {
        const possibleLast = (photoIncrement + incrementInt + buildUp) - prevBuildUp;
        photoIncrement = (possibleLast < LAST_PHOTO_NUMBER) ? possibleLast : LAST_PHOTO_NUMBER;
      } else {
        photoIncrement += (incrementInt + buildUp) - prevBuildUp;
      }

      prevBuildUp = buildUp;
      spread.push(photoIncrement);
    }
  }

  function generateXml(filename, id) {
    return `<item id="${id}"><filename>${filename}</filename></item>`;
  }

  determineSpread();
  const startCount = parseInt(xmlStartPhotoId, 10);
  for (let i = 0, idLoop = startCount, len = spread.length, file, filename; i < len; i += 1) {
    const formattedSpread = (spread[i] < 10) ? `0${spread[i]}` : spread[i];
    file = `${prefix}-${formattedSpread}`;
    files.push(file);
    filename = `${file}.jpg`;
    filenames.push(filename);
    xml += generateXml(filename, idLoop);
    idLoop += 1;
  }

  return { filenames, files, xml };
}

module.exports.calculateFutureFilenames = calculateFutureFilenames;
