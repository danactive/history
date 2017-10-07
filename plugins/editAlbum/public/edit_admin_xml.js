/* global $, SaveToJson, schema, util, window */

function getFilename(rawFilename) {
  if (rawFilename instanceof Array) {
    const [filename] = rawFilename;
    return `${filename.substr(0, filename.lastIndexOf('.'))}.jpg`;
  }

  return rawFilename;
}

const album = {
  form: {
    schema: { // HTML element ID, XML node name
      Init: () => { // loop thru fields and get jQuery elements
        const ids = [];
        $.each(schema, (elementId) => {
          if (ids.length !== 0) {
            ids.push(',');
          }
          ids.push('#', elementId);
        });
        ids.push(); // remove trailing comma delimiter
        album.form.schema.dom = $(ids.join(''));
      },
      GetDom: () => {
        if (!album.form.schema.dom) {
          album.form.schema.Init();
        }

        return album.form.schema.dom;
      }
    },
    Clear: () => {
      album.form.schema.GetDom()
        .val('')
        .siblings('.suggestions')
        .html('')
        .siblings('input[type=checkbox]')
        .prop('checked', false)
        .siblings('input[type=text]')
        .prop('disabled', false)
        .siblings('label')
        .find('select')
        .prop('disabled', false); // reference <select>
      $('#filename').prop('checked', true); // keep filename disabled
    },
    PopulateFromPhoto: (_data) => {
      const data = $.extend({}, _data);
      const seen = {};
      data.filename = (data.filename instanceof Array) ? data.filename[0] : data.filename;

      function clickField($e) { // click on .suggestion <div>
        const txt = $(this).text();
        const originDom = $(this).data('origin');
        if (originDom) {
          originDom.val(txt); // move clicked txt to input val
        }
        $(this).remove(); // remove suggestion
        $e.preventDefault();
      }

      function eachField() {
        // remove duplicates
        const txt = $(this).text();
        if (seen[txt]) {
          $(this).remove();
        } else {
          seen[txt] = true;
        }
      }

      const UpdateFieldOrDiv = ($field, mergeDatum) => {
        const noSuggestions = $field.siblings('.suggestions').length === 0 || $field.siblings('.suggestions').html().length === 0;
        const emptyOrSameVal = $field.val() === '' || $field.val() === mergeDatum;
        if ((noSuggestions && emptyOrSameVal) || $field.prop('disabled')) { // update form field based on thumb selection
          $field.val(mergeDatum.replace(/&amp;/gi, '&')); // XML format to normal
        } else { // build suggestion
          const wasVal = $field.val();
          let suggestion1 = '';
          let suggestion2 = '';
          if (wasVal !== '') {
            suggestion1 = $('<a class="a">').text(wasVal).data('origin', $field);
          }

          if (mergeDatum !== '') {
            suggestion2 = $('<a class="a">').text(mergeDatum).data('origin', $field);
          }

          $field
            .val('')
            .siblings('.suggestions')
            .append(suggestion1, ' ', suggestion2)
            .find('a')
            .click(clickField)
            .each(eachField);
        }
      };

      $.each(schema, (elementId, xmlName) => { // loop thru all form fields to display XML data
        let fieldValue;
        if (xmlName.indexOf('.') === -1) {
          fieldValue = data[xmlName];
        } else { // dot syntax found
          const xmlNameArray = xmlName.split('.');
          if (data[xmlNameArray[0]]) {
            fieldValue = data[xmlNameArray[0]][xmlNameArray[1]];
          }
        }
        if (!fieldValue) {
          return true; // continue
        }
        UpdateFieldOrDiv($(`#${elementId}`), fieldValue);
        return true;
      });

      album.photo.Preview(data.filename);
    },
    SplitGeoOnPaste: function SplitGeoOnPaste() {
      if (this.value.indexOf(',') !== -1) {
        const geocode = this.value.split(',');
        $('#geo_lat').val(geocode[0].trim());
        $('#geo_lon').val(geocode[1].trim());
      }
    }
  },
  photo: {
    recentIndex: 0, // for selecting a photo range & keyboard nav
    GetData: () => {
      const divs = $('#listPhotos > div');
      if (divs.length > 0) {
        return divs.eq(album.photo.recentIndex).data('photo');
      }

      return false;
    },
    Invoke: function invokePhoto(e) { // click on photo
      if (e.ctrlKey) { // allow multiples
        album.photo.recentIndex = $(this).toggleClass('selected').index();
        album.form.PopulateFromPhoto($(this).data('photo'));
      } else if (e.shiftKey) { // select range
        const clickedPhotoIndex = $(this).index();
        let sm = (clickedPhotoIndex < album.photo.recentIndex) ? clickedPhotoIndex : album.photo.recentIndex;
        const lg = (clickedPhotoIndex < album.photo.recentIndex) ? album.photo.recentIndex : clickedPhotoIndex;
        const divs = $('#listPhotos > div');
        for (sm; sm <= lg; sm += 1) {
          album.form.PopulateFromPhoto(divs.eq(sm).addClass('selected').data('photo'));
        }
      } else { // only select one
        album.form.Clear();
        /* change .select class */
        album.photo.recentIndex = $(this).siblings().removeClass('selected').end()
          .addClass('selected')
          .index();
        album.form.PopulateFromPhoto($(this).data('photo'));
      }
    },
    Preview: (_filename) => {
      const filename = `${_filename.substr(0, _filename.lastIndexOf('.'))}.jpg`;
      const photoPath = [
        '../static/gallery-',
        $('#editGalleries').val(),
        '/media/photos/',
        filename.substr(0, filename.indexOf('-')),
        '/',
        filename
      ].join('');
      $('#photoPreview').css('background-image', `url(${photoPath})`);
    },
    Sort: function sortPhoto() {
      $('#listPhotos span').remove(); // clear previous sort labels
      const AlphaSort = (_x, _y, xmlNode) => {
        let x = $(_x).data('photo')[xmlNode];
        x = (x === null) ? '' : x;
        let y = $(_y).data('photo')[xmlNode];
        y = (y === null) ? '' : y;
        const xLarger = (x > y) ? 1 : -1;
        return (x === y) ? 0 : xLarger;
      };
      const SortByCity = (x, y) => AlphaSort(x, y, schema.city);
      const SortByLocation = (x, y) => AlphaSort(x, y, schema.location);
      const SortByDate = (x, y) => AlphaSort(x, y, schema.filename);
      const SortByXml = (_x, _y) => {
        const x = $(_x).data('photo').id;
        const y = $(_y).data('photo').id;
        return parseInt(x, 10) - parseInt(y, 10);
      };
      let sortBy; // alias for (above) sort function
      const sortVal = $(this).val().toLowerCase();

      switch (sortVal) {
        case 'city': sortBy = SortByCity; break;
        case 'location': sortBy = SortByLocation; break;
        case 'filename': sortBy = SortByDate; break;
        default: sortBy = SortByXml; break;
      }

      $.each($('#listPhotos > div').get().sort(sortBy), (i, newDiv) => { // reposition based on sort
        const xmlNode = schema[sortVal];
        const sortLabel = $(newDiv).data('photo')[xmlNode];
        if (sortLabel === undefined) {
          $('#listPhotos').append(newDiv);
        } else {
          $('#listPhotos').append(newDiv).append(`<span>${sortLabel}</span>`);
        }
      });
    }
  },
  json: {}, // current album data
  Generate: () => { // output album.xml
    const galleryName = $('#editGalleries').val();

    $('#listPhotos').html(''); // clear previous gallery
    $.each(album.json.album.item, (i, item) => {
      const filename = getFilename(item.filename);
      const year = filename.substr(0, filename.indexOf('-'));

      $('<div>')
        .click(album.photo.Invoke)
        .data('photo', item)
        .html(['<img src="../static/gallery-', galleryName, '/media/thumbs/', year, '/', filename, '"/>'].join(''))
        .appendTo('#listPhotos');
    });
  }
};
const ConvertXmlToJson = (xmlData) => {
  album.json = $.parseJSON(util.xml.convertToJsonString(xmlData, ''));
  $('#rawAlbumJson').val(JSON.stringify(album.json)); // display in textarea
  album.Generate();
};
const GetAlbumXml = () => { // both <select> and btn call this function
  let isAlbumChangable = ($('#listPhotos').html() === ''); // rule1 must be empty
  if (!isAlbumChangable) {
    // otherwise confirm before clearing
    isAlbumChangable = window.confirm('Change photo album?'); // eslint-disable-line no-alert
  }
  if (isAlbumChangable) {
    $.get(`../static/gallery-${$('#editGalleries').val()}/xml/album_${$('#editAlbums').val()}.xml`)
      .success(ConvertXmlToJson);

    $('#sortGallery')[0].selectedIndex = 0; // reset sort dropdown
  }
};
const PopulateAlbums = (xmlData) => { // complete gallery xml
  const options = [];
  $('album', xmlData).each((i, gallery) => {
    options.push('<option>', $('album_name', gallery).text(), '</option>');
  });

  $('#editAlbums').append(options.join(''));
};
const GetGalleryNames = () => { // both <select> and btn call this function
  let isGalleryChangable = $('#listPhotos').html() === ''; // rule1 must be empty
  if (!isGalleryChangable) {
    // otherwise confirm before clearing
    isGalleryChangable = window.confirm('Change photo gallery?'); // eslint-disable-line no-alert
  }
  if (isGalleryChangable) {
    $.get(`../static/gallery-${$('#editGalleries').val()}/xml/gallery.xml`)
      .success(PopulateAlbums);

    $('#editAlbums').get(0).length = 0; // clear albums dropdown
    $('#editAlbums').html('<option value="">Edit these album photos</option>');
    $('#sortGallery')[0].selectedIndex = 0; // reset sort dropdown
    $('#listPhotos').html(''); // clear previous gallery
  }
};

function ToggleDisable() {
  $(this)
    .parent()
    .find('input[type=text], select')
    .prop('disabled', $(this).prop('checked')); // disable text field if checkbox is checked
}

$(window).ready(() => {
  $('#changeGallery').click(GetGalleryNames);
  $('#changeAlbum').click(GetAlbumXml);
  $('#editAlbums').change(GetAlbumXml);
  $('#sortGallery').change(album.photo.Sort);
  $('#changeSort').click(album.photo.Sort);
  $('#saveToJson').click(SaveToJson);
  $('input[type=checkbox]').click(ToggleDisable);
  $('#geo_lat').change(album.form.SplitGeoOnPaste);

  album.form.schema.GetDom().add('textarea#rawAlbumJsonToXml').keydown(($e) => {
    $e.stopPropagation(); // allow text selction, not photo pagination
  });

  $(window.document).keydown(($e) => {
    let math;
    const arrow = {
      left: 37,
      up: 38,
      right: 39,
      down: 40
    };
    if ($e.which === arrow.left) {
      math = -1;
    } else if ($e.which === arrow.up) {
      math = -4;
    } else if ($e.which === arrow.right) {
      math = +1;
    } else if ($e.which === arrow.down) {
      math = +4;
    }

    if (math !== undefined) {
      album.form.Clear();
      album.photo.recentIndex = $('#listPhotos div').eq(album.photo.recentIndex).removeClass('selected')
        .end()
        .eq(album.photo.recentIndex + math)
        .addClass('selected')
        .index(); // change selection

      if (album.photo.recentIndex !== -1) {
        album.form.PopulateFromPhoto(album.photo.GetData());
      }
    }
  });
});
