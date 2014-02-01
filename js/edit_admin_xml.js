/*global $, window, ajaxError*/
var album = {
	"form": {
		"schema": { // HTML element ID, XML node name
			"fields": {
				"filename": "filename",
				"city": "photo_city",
				"location": "photo_loc",
				"caption": "thumb_caption",
				"description": "photo_desc",
				"ref_name": "ref.name",
				"ref_src": "ref.source",
				"geo_lat": "geo.lat",
				"geo_lon": "geo.lon"
			},
			"Init": function() { // loop thru fields and get jQuery elements
				var ids = [];
				$.each(album.form.schema.fields, function(elementId) {
					ids.push('#',elementId,',');
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
						each(function(i,a) {
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
			
			$.each(album.form.schema.fields, function(elementId, xmlName) { // loop thru all form fields to display XML data
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
		"SaveToJson": function() {
			$('#listPhotos .selected').each(function(i, photo) {
				var $field,
					fieldValue,
					jsonPhoto = $(photo).data('photo') || {},
					xmlNameArray;
				$.each(album.form.schema.fields, function(elementId, xmlName) {
					$field = $('#'+elementId);
					if ($field.prop('disabled')) { // do NOT generate if field disabled
						return true; // continue to next selected thumb
					}
					fieldValue = $field.val();
					fieldValue = fieldValue.replace(/&/g, "&amp;"); // XML safe
					if (fieldValue === "") {
						fieldValue = undefined;
					}
					
					if (xmlName.indexOf('.') === -1) {
						jsonPhoto[xmlName] = fieldValue;
					} else { // dot syntax found
						xmlNameArray = xmlName.split('.');
						if (!jsonPhoto[xmlNameArray[0]]) { // create object if missing from JSON
							jsonPhoto[xmlNameArray[0]] = {};
						}
						jsonPhoto[xmlNameArray[0]][xmlNameArray[1]] = fieldValue;
						if (fieldValue === undefined) {
							delete jsonPhoto[xmlNameArray[0]][xmlNameArray[1]];
						}
						if (JSON.stringify(jsonPhoto[xmlNameArray[0]]) === JSON.stringify({})) {
							delete jsonPhoto[xmlNameArray[0]];
						}
					}
				});
			});
			
			$('#rawAlbumJson').val(JSON.stringify(album.json)); // display in textarea
			$('#rawAlbumJsonToXml').val(fncFormatXml(json2xml(album.json, "")));
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
			$('#mapOrPhoto > img').attr('src',['../gallery-', $('#editGalleries').val(), '/media/photos/', filename.substr(0,filename.indexOf('-')), '/', filename].join(''));
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
				return AlphaSort(x,y,album.form.schema.fields.city);
			},
			SortByLocation = function (x,y) {
				return AlphaSort(x,y,album.form.schema.fields.location);
			},
			SortByDate = function (x,y) {
				return AlphaSort(x,y,album.form.schema.fields.filename);
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
				var xmlNode = album.form.schema.fields[sortVal];
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
		$.each(album.json.album.photo, function(i, photo) {
			if (photo.filename instanceof Array) {
				filename = photo.filename[0];
				filename = filename.substr(0, filename.lastIndexOf(".")) + ".jpg";
			} else {
				filename = photo.filename;
			}
			year = filename.substr(0,filename.indexOf('-'));
			$('<div>').
				click(album.photo.Invoke).
				data('photo',photo).
				html(['<img src="../gallery-', galleryName, '/media/thumbs/', year, '/', filename, '"/>'].join('')).
				appendTo('#listPhotos');
		});
	}
},
ConvertXmlToJson = function(xmlData) {
	album.json = jQuery.parseJSON(xml2json(xmlData,''));
	$('#rawAlbumJson').val(JSON.stringify(album.json)); // display in textarea
	album.Generate();
},
GetAlbumXml = function() { // both <select> and btn call this function
	var isAlbumChangable = ($('#listPhotos').html() === ''); // rule1 must be empty
	if (!isAlbumChangable) {
		isAlbumChangable = confirm('Change photo album?'); // otherwise confirm before clearing
	}
	if (isAlbumChangable) {
		$.get('../gallery-' + $('#editGalleries').val() + '/album_' + $('#editAlbums').val() + '.xml').
			error(ajaxError).
			success(ConvertXmlToJson);
			
		$("#sortGallery")[0].selectedIndex = 0; // reset sort dropdown
	}
},
GetGalleryNames = function() { // both <select> and btn call this function
	var isGalleryChangable = $('#listPhotos').html() === ''; // rule1 must be empty
	if (!isGalleryChangable) {
		isGalleryChangable = confirm('Change photo gallery?'); // otherwise confirm before clearing
	}
	if (isGalleryChangable) {
		$.get('../gallery-' + $('#editGalleries').val() + '/gallery.xml').
			error(ajaxError).
			success(PopulateAlbums);
			
		$("#editAlbums").get(0).length = 0; // clear albums dropdown
		$("#editAlbums").html('<option value="">Edit these album photos</option>');
		$("#sortGallery")[0].selectedIndex = 0; // reset sort dropdown
		$('#listPhotos').html(''); // clear previous gallery
	}
},
PopulateGalleries = function(jsonData) { // list of gallery names
	var options = [];
	$.each(jsonData.galleries, function(i, gallery) {
		options.push( '<option>', gallery, '</option>');
	});
	$('#editGalleries').
		change(GetGalleryNames).
		append( options.join('') );
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
	$.get('../getGalleries/').
		error(ajaxError).
		success(PopulateGalleries);
		
	$('#changeGallery').click(GetGalleryNames);
	$('#changeAlbum').click(GetAlbumXml);
	$('#editAlbums').change(GetAlbumXml);
	$('#sortGallery').change(album.photo.Sort);
	$('#changeSort').click(album.photo.Sort);
	$('#saveToJson').click(album.form.SaveToJson);
	$('input[type=checkbox]').click(ToggleDisable);
	$('#geo_lat').change(album.form.SplitGeoOnPaste);
	
	album.form.schema.GetDom().add('textarea#rawAlbumJsonToXml').keydown(function($e) {
		$e.stopPropagation(); // allow text selction, not photo pagination
	});
		
	$(document).keydown(function($e) {
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