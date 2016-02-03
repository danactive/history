'use strict';
/**
Generate renamed files

@method getFutureFilenames
@param {string} [prefix] Root of filename with increment added before extension
@param {integer} [photosInDay] Total photos distributed over one day (max 80)
@param {integer} xmlStartPhotoId initial position
@return {json}
**/
function getFutureFilenames(prefix, photosInDay, xmlStartPhotoId) {
  const idStart = parseInt(xmlStartPhotoId, 10) || 1;
  const firstPhotoNum = 10; // 1-9 are reserved for future photo additions
  const lastPhotoNum = 90; // 91-99 are reserved for future photo additions
  const maxRange = lastPhotoNum - firstPhotoNum + 1; //  +1 to include both #s in the range
  const spread = [];
  const increment = maxRange / photosInDay;
  const incrementInt = parseInt(increment, 10);
  const incrementFloat = increment - incrementInt;
  const files = [];
  const filenames = [];
  let xml = '';

  for (let i = 1, photoIncrement, possibleLast, prevBuildUp; i <= photosInDay; i += 1) {
    const buildUp = parseInt(incrementFloat * i, 10);
    if (i === 1 && i === photosInDay) { // only ONE photo
      photoIncrement = 50;
    } else if (i === 1) {
      photoIncrement = firstPhotoNum + incrementInt + buildUp;
    } else if (i === photosInDay) {
      possibleLast = photoIncrement + incrementInt + buildUp - prevBuildUp;
      photoIncrement = (possibleLast < lastPhotoNum) ? possibleLast : lastPhotoNum;
    } else {
      photoIncrement += incrementInt + buildUp - prevBuildUp;
    }
    prevBuildUp = buildUp;
    spread.push(photoIncrement);
  }
  for (let i = 0, idLoop = idStart, len = spread.length, file, filename; i < len; i += 1) {
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
