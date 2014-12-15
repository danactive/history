/*global $, ajaxError, doT, util, window */
(function () {
	var qs = util.queryObj(),
		parent = window.walkPath.setParentFolderLink({"querystring": qs});
	function loadImages(response) {
		var arg = {},
			columns,
			html = [],
			sortArgs = { "connectWith": '.ui-sortable', "items": "> li[data-type=image]" };
		function generateThumbs(folder) {
			$.ajax({
				"url": '/admin/preview-generator',
				"method": 'post',
				"data": {
					"folder": folder
				},
				"success": function (response) {
					$(".directory-thumb-wait").each(function (i) {
						this.src = "../../" + decodeURIComponent(qs.folder) + "/" + response.thumbnails[i];
						this.className = "directory-thumb";
					});
				},
				"error": ajaxError
			});
		}
		function distributeIntoColumns(items) {
			var columns = [[], [], [], [], [], []],
				i = 0,
				len = items.length;
			for (i; i < len; i++) {
				columns[Math.floor(i * columns.length / items.length)].push(items[i]);
			}
			return columns;
		}
		arg.qs = qs;
		columns = distributeIntoColumns(response.items);

		// Build HTML
		$.each(columns, function (i, column) {
			html.push("");
			$.each(column, function (j, item) {
				html[i] += doT["directory-list-item"](item, arg);
			});
		});
		
		//Push HTML to DOM
		$.each(html, function (i, htm) {
			$('.js-directory-list')
				.eq(i)
				.html(htm)
				.sortable(sortArgs);
		});

		if (qs.preview === "true") {
			generateThumbs(qs.folder);
		}
	}
	function bindEvents() {
		$("#btnRename, #btnResize").click(function ($event) {
			var $datepicker,
				isMoveToResize = (this.id === "btnResize"),
				generateFilenames,
				xmlOutput = "";
			$event.preventDefault();
		
			$datepicker = $('<div id="vacationDate"></div>')
				.insertAfter(this)
				.datepicker({
					"changeMonth": true,
					"changeYear": true,
					"dateFormat": 'yy-mm-dd',
					"onSelect": function (formattedDate) {
						$datepicker.datepicker( "destroy" );

						$.ajax({
							"url": '/admin/rename-photos',
							"method": 'post',
							"data": {
								"mediaType": "image",
								"moveToResize": isMoveToResize,
								"assets": generateFilenames(formattedDate)
							},
							"success": function (response) {
								var deleteTempThumb = function () {
										$.ajax({
											"url": '/admin/delete-path',
											"method": 'post',
											"data": {
												"tempThumbFolder": qs.folder
											},
											"error": ajaxError
										});
									},
									output = "",
									resizeImage = function (postData) {
										$.ajax({
											"url": '/admin/resize-photo',
											"method": 'post',
											"data": postData,
											"error": ajaxError
										});
									};

								if (isMoveToResize === true) {
									$.each(response.files, function (x, file) {
										resizeImage(file);
									});
									deleteTempThumb();
									output = xmlOutput;
								} else {
									output = "Rename successfull";
								}
								
								$("<textarea/>")
									.val(output)
									.appendTo("#controls");
							},
							"error": ajaxError
						});
					}
				}); // datepicker

			generateFilenames = function (datePrefix) {
				var generated,
					out = {
						"sort": []
					},
					photoCount = $(".js-directory-list").children('li[data-type=image]').length,
					photoIndex = -1,
					targetFolder = datePrefix.substring(0, 4);

				generated = window.walkPath.getRenamedFiles({
					"filePrefix": datePrefix,
					"photosInDay": photoCount,
					"xmlStartPhotoId": (isMoveToResize === true) ? window.prompt("Starting XML photo ID?", 1) : 1
				});

				xmlOutput = generated.xml;

				// list of ordered filenames
				$('.js-directory-list').each(function (x, dom) {
					var $element = $(dom),
						filenames = [], // sortable image filenames
						id;
					if ($element.children().length <= 0) {
						return true; // continue
					}
					filenames = $element.sortable( "toArray", {"attribute": 'data-filename'});
					$.each(filenames, function (i) {
						photoIndex++;
						id = generated.files[photoIndex];
						out.sort.push(id);
						out[id] = {
							"files": [
								{
									"moved": targetFolder + "/" + generated.filenames[photoIndex],
									"raw": qs.folder + filenames[i],
									"renamed": qs.folder + generated.filenames[photoIndex]
								}
							]
						};
					});
				});
				return out;
			};
		}); // click
	}
	function loadNav() {
		if (parent.text === "") {
			$("#btnParentFolder").addClass("hide");
		} else {
			$("#btnParentFolder")
				.removeClass("hide")
				.attr("href", parent.href)
				.find("#parentFolderName")
				.text(parent.text);
		}
	}
	$.ajax({
		"url": '/api/walk-path' + window.location.search,
		"success": loadImages,
		"error": ajaxError
	});
	loadNav();
	bindEvents();
})();