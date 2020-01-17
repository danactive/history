function parseFromNode(ascendant) {
  return (descendant) => {
    const tags = ascendant.getElementsByTagName(descendant);
    if (tags.length > 0) {
      return tags[0].innerHTML;
    }

    return '';
  };
}

export function parseItemNode(item) {
  const parseNode = parseFromNode(item);
  const coordinateAccuracy = Number(parseNode('accuracy'));
  const referenceName = parseNode('name');
  const referenceSource = parseNode('source');

  const object = {
    id: item.getAttribute('id'),
    filename: parseNode('filename'),
    city: parseNode('photo_city'),
    location: parseNode('photo_loc'),
    description: parseNode('photo_desc'),
    coordinates: [parseFloat(parseNode('lon')), parseFloat(parseNode('lat'))],
    caption: parseNode('thumb_caption'),
    photoLink: null, // Dropbox hosted url,
    thumbLink: null, // Dropbox hosted url
  };

  if (coordinateAccuracy !== 0 && !Number.isNaN(coordinateAccuracy)) {
    object.coordinateAccuracy = coordinateAccuracy;
  }

  if (referenceName && referenceSource) {
    object.reference = [referenceSource, referenceName];
  }

  return object;
}

export function getItemNodes(dom) {
  return Array.from(dom.getElementsByTagName('item'));
}
