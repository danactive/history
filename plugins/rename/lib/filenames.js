/**
Generate renamed files

@method getFutureFilenames
@param {string} [prefix] Root of filename with increment added before extension
@param {integer} [photosInDay] Total photos distributed over one day (max 80)
@param {string} xmlStartPhotoId initial position
@return {json}
**/
function getFutureFilenames(prefix, photosInDay, xmlStartPhotoId) {
  const DEFAULT_START_COUNT = 100;
  const FIRST_PHOTO_NUMBER = 10; // 1-9 are reserved for future photo additions
  const LAST_PHOTO_NUMBER = 90; // 91-99 are reserved for future photo additions

  const maxRange = (LAST_PHOTO_NUMBER - FIRST_PHOTO_NUMBER) + 1; //  +1 to include both #s in the range
  const increment = maxRange / photosInDay;
  const incrementInt = parseInt(increment, 10);
  const incrementFloat = increment - incrementInt;
  const spread = [];
  const files = [];
  const filenames = [];
  let xml = '';

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

  const startCount = parseInt(xmlStartPhotoId, 10) || DEFAULT_START_COUNT;
  for (let i = 0, idLoop = startCount, len = spread.length, file, filename; i < len; i += 1) {
    file = `${prefix}-${((spread[i] < 10) ? `0${spread[i]}` : spread[i]).toString()}`;
    files.push(file);
    filename = `${file}.jpg`;
    filenames.push(filename);
    xml += `<photo id="${idLoop}"><filename>${filename}</filename></photo>`;
    idLoop += 1;
  }

  return { filenames, files, xml };
}

exports.getFutureFilenames = getFutureFilenames;
