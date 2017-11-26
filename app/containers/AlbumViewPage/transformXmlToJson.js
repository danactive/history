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
  return {
    id: item.getAttribute('id'),
    filename: parseNode('filename'),
    city: parseNode('photo_city'),
    location: parseNode('photo_loc'),
    description: parseNode('photo_desc'),
    geo: [parseFloat(parseNode('lon')), parseFloat(parseNode('lat'))],
    caption: parseNode('thumb_caption'),
    link: null, // Dropbox hosted url
  };
}

export function getItemNodes(dom) {
  return Array.from(dom.getElementsByTagName('item'));
}
