function instagram() {
  $.ajax({
    url: '/api/instagram',
    success: (response) => {
      const html = [];
      response.forEach((photo) => {
        html.push(`<img src="${photo.images.thumbnail.url}" width="${photo.images.thumbnail.width}" height="${photo.images.thumbnail.height}">`);
      });
      $('body').append(html.join(''));
    },
  });
}

// If Node.js then export as public
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    instagram,
  };
}
