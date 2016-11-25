/*global $, ajaxError, window*/
var album = {
	"form": {
		"schema": { // HTML element ID, XML node name
			"Init": function() { // loop thru fields and get jQuery elements
				var ids = [];
				$.each(schema, function(elementId) {
					if (ids.length !== 0) {
						ids.push(',');
					}
					ids.push('#',elementId);
				});
				ids.push(); // remove trailing comma delimiter
				album.form.schema.dom = $(ids.join(''));
			},
			"GetDom": function() {
				if (!album.form.schema.dom) {
					album.form.schema.Init();
				}
				return album.form.schema.dom;
			}
		},
		"Clear": function() {
			album.form.schema.GetDom().
				val('').
				siblings('.suggestions').html('').
				siblings('input[type=checkbox]').prop('checked',false).
				siblings('input[type=text]').prop('disabled',false).
				siblings('label').find('select').prop('disabled',false); // reference <select>
			$('#filename').prop('checked',true); // keep filename disabled
		},
		"PopulateFromPhoto": function(data) {
			if (typeof data.filename === "object") {
				data.filename = data.filename[0];
			}
			var UpdateFieldOrDiv = function($field,mergeDatum) {
				var noSuggestions = $field.siblings('.suggestions').length === 0 || $field.siblings('.suggestions').html().length === 0;
				var emptyOrSameVal = $field.val() === "" || $field.val() === mergeDatum;
				if ((noSuggestions && emptyOrSameVal) || $field.prop('disabled')) { // update form field based on thumb selection
					mergeDatum = mergeDatum.replace(/&amp;/gi, "&"); // XML format to normal
					$field.val( mergeDatum );
				} else { // build suggestion
					var wasVal = $field.val();
					var seen = {};
					var suggestion1 = '', suggestion2 = '';
					if (wasVal !== '') {
						suggestion1 = $('<a class="a">').text(wasVal).data('origin',$field);
					}
					if (mergeDatum !== '') {
						suggestion2 = $('<a class="a">').text(mergeDatum).data('origin',$field);
					}
					$field.
						val("").
						siblings('.suggestions').
						append(suggestion1,' ',suggestion2).
						find('a').
						click(function($e) { // click on .suggestion <div>
							var txt = $(this).text();
							var originDom = $(this).data('origin');
							if (originDom) {
								originDom.val(txt); // move clicked txt to input val
							}
							$(this).remove(); // remove suggestion
							$e.preventDefault();
						}).
						each(function() {
							// remove duplicates
							var txt = $(this).text();
							if (seen[txt]) {
								$(this).remove();
							} else {
								seen[txt] = true;
							}
						});
				}
			};

			$.each(schema, function(elementId, xmlName) { // loop thru all form fields to display XML data
				var fieldValue;
				if (xmlName.indexOf('.') === -1) {
					fieldValue = data[xmlName];
				} else { // dot syntax found
					var xmlNameArray = xmlName.split('.');
					if (data[xmlNameArray[0]]) {
						fieldValue = data[xmlNameArray[0]][xmlNameArray[1]];
					}
				}
				if (!fieldValue) {
					return true; // continue
				}
				UpdateFieldOrDiv($('#'+elementId), fieldValue);
			});

			album.photo.Preview(data.filename);
		},
		"SplitGeoOnPaste": function () {
			var geocode = [];
			if (this.value.indexOf(",") !== -1) {
				geocode = this.value.split(",");
				$('#geo_lat').val(geocode[0].trim());
				$('#geo_lon').val(geocode[1].trim());
			}
		}
	},
	"photo": {
		"recentIndex": 0, // for selecting a photo range & keyboard nav
		"GetData": function() {
			var divs = $('#listPhotos > div');
			if (divs.length > 0) {
				return divs.eq(album.photo.recentIndex).data("photo");
			}
			return false;
		},
		"Invoke": function(e){ // click on photo
			if (e.ctrlKey) { // allow multiples
				album.photo.recentIndex = $(this).toggleClass('selected').index();
				album.form.PopulateFromPhoto($(this).data('photo'));
			} else if (e.shiftKey) { // select range
				var clickedPhotoIndex = $(this).index(),
					sm = (clickedPhotoIndex < album.photo.recentIndex) ? clickedPhotoIndex : album.photo.recentIndex,
					lg = (clickedPhotoIndex < album.photo.recentIndex) ? album.photo.recentIndex : clickedPhotoIndex,
					divs = $('#listPhotos > div');
				for(sm; sm<=lg; sm+=1) {
					album.form.PopulateFromPhoto(divs.eq(sm).addClass('selected').data('photo'));
				}
			} else { // only select one
				album.form.Clear();
				/*change .select class*/
				album.photo.recentIndex = $(this).siblings().removeClass('selected').end().addClass('selected').index();
				album.form.PopulateFromPhoto($(this).data('photo'));
			}
		},
		"Preview": function(filename) {
			filename = filename.substr(0, filename.lastIndexOf(".")) + ".jpg";
			var photoPath = ['../static/gallery-', $('#editGalleries').val(), '/media/photos/', filename.substr(0,filename.indexOf('-')), '/', filename].join('');
			$('#photoPreview').css('background-image', "url(" + photoPath + ")");
		},
		"Sort": function() {
			$('#listPhotos span').remove(); // clear previous sort labels
			var AlphaSort = function(x,y, xmlNode) {
				x = $(x).data('photo')[xmlNode];
				x = (x === null) ? "" : x;
				y = $(y).data('photo')[xmlNode];
				y = (y === null) ? "" : y;
				return ((x === y) ? 0 : ((x > y) ? 1 : -1 ));
			},
			SortByCity = function (x,y) {
				return AlphaSort(x,y,schema.city);
			},
			SortByLocation = function (x,y) {
				return AlphaSort(x,y,schema.location);
			},
			SortByDate = function (x,y) {
				return AlphaSort(x,y,schema.filename);
			},
			SortByXml = function (x,y) {
				x = $(x).data('photo').id;
				y = $(y).data('photo').id;
				return parseInt(x, 10) - parseInt(y, 10);
			},
			sortBy, // alias for (above) sort function
			sortVal = $(this).val().toLowerCase();
			switch (sortVal) {
				case "city": sortBy = SortByCity; break;
				case "location": sortBy = SortByLocation; break;
				case "filename": sortBy = SortByDate; break;
				default: sortBy = SortByXml; break;
			}
			$.each($('#listPhotos > div').get().sort(sortBy), function(i, newDiv) { // reposition based on sort
				var xmlNode = schema[sortVal];
				var sortLabel = $(newDiv).data("photo")[xmlNode];
				if (sortLabel === undefined) {
					$('#listPhotos').append(newDiv);
				} else {
					$('#listPhotos').append(newDiv).append('<span>' + sortLabel + '</span>');
				}
			});
		}
	},
	"json":{}, //current album data
	"Generate": function() { // output album.xml
		var galleryName = $('#editGalleries').val(),
			filename,
			year;
		$('#listPhotos').html(''); // clear previous gallery
		$.each(album.json.album.item, function(i, item) {
			if (item.filename instanceof Array) {
				filename = item.filename[0];
				filename = filename.substr(0, filename.lastIndexOf(".")) + ".jpg";
			} else {
				filename = item.filename;
			}
			year = filename.substr(0,filename.indexOf('-'));
			$('<div>').
				click(album.photo.Invoke).
				data('photo',item).
				html(['<img src="../static/gallery-', galleryName, '/media/thumbs/', year, '/', filename, '"/>'].join('')).
				appendTo('#listPhotos');
		});
	}
},
ConvertXmlToJson = function(xmlData) {
	album.json = $.parseJSON(util.xml.convertToJsonString(xmlData,''));
	$('#rawAlbumJson').val(JSON.stringify(album.json)); // display in textarea
	album.Generate();
},
GetAlbumXml = function() { // both <select> and btn call this function
	var isAlbumChangable = ($('#listPhotos').html() === ''); // rule1 must be empty
	if (!isAlbumChangable) {
		isAlbumChangable = window.confirm('Change photo album?'); // otherwise confirm before clearing
	}
	if (isAlbumChangable) {
		$.get('../static/gallery-' + $('#editGalleries').val() + '/xml/album_' + $('#editAlbums').val() + '.xml').
			error(ajaxError).
			success(ConvertXmlToJson);

		$("#sortGallery")[0].selectedIndex = 0; // reset sort dropdown
	}
},
GetGalleryNames = function() { // both <select> and btn call this function
	var isGalleryChangable = $('#listPhotos').html() === ''; // rule1 must be empty
	if (!isGalleryChangable) {
		isGalleryChangable = window.confirm('Change photo gallery?'); // otherwise confirm before clearing
	}
	if (isGalleryChangable) {
		$.get('../static/gallery-' + $('#editGalleries').val() + '/xml/gallery.xml').
			error(ajaxError).
			success(PopulateAlbums);

		$("#editAlbums").get(0).length = 0; // clear albums dropdown
		$("#editAlbums").html('<option value="">Edit these album photos</option>');
		$("#sortGallery")[0].selectedIndex = 0; // reset sort dropdown
		$('#listPhotos').html(''); // clear previous gallery
	}
},
PopulateGalleries = (response) => { // list of gallery names
  const inner = response.galleries.join('</option><option>');
  $('#editGalleries').
    change(GetGalleryNames).
    append(`<option>${inner}</option>`);
},
PopulateAlbums = function(xmlData) { // complete gallery xml
	var options = [];
	$('album', xmlData).each(function(i, gallery) {
		options.push( '<option>', $('album_name',gallery).text(), '</option>');
	});

	$('#editAlbums').
		append( options.join('') );
},
ToggleDisable = function() {
	$(this).
		parent().
		find('input[type=text], select').
		prop('disabled',$(this).prop('checked')); // disable text field if checkbox is checked
};
$(window).ready(function() {
	$.get('/edit/album?raw=true').
		success(PopulateGalleries);

	$('#changeGallery').click(GetGalleryNames);
	$('#changeAlbum').click(GetAlbumXml);
	$('#editAlbums').change(GetAlbumXml);
	$('#sortGallery').change(album.photo.Sort);
	$('#changeSort').click(album.photo.Sort);
	$('#saveToJson').click(SaveToJson);
	$('input[type=checkbox]').click(ToggleDisable);
	$('#geo_lat').change(album.form.SplitGeoOnPaste);

	album.form.schema.GetDom().add('textarea#rawAlbumJsonToXml').keydown(function($e) {
		$e.stopPropagation(); // allow text selction, not photo pagination
	});

	$(window.document).keydown(function($e) {
		var math;
		switch ($e.which) {
			case 37: // left arrow
				math = -1;
				break;
			case 38: // up arrow
				math = -4;
				break;
			case 39: // right arrow
				math = +1;
				break;
			case 40: // down arrow
				math = +4;
				break;
		}

		if (math !== undefined) {
			album.form.Clear();
			album.photo.recentIndex = $('#listPhotos div').eq(album.photo.recentIndex).removeClass('selected').end().eq(album.photo.recentIndex+math).addClass('selected').index(); // change selection
			if (album.photo.recentIndex !== -1) {
				album.form.PopulateFromPhoto(album.photo.GetData());
			}
		}
	});
});
