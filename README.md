history
=======

Your personal history as a photo/video gallery which is viewable on portable USB flash drive or file system.

[Demo site 0.9.0](http://history.staticloud.com/)

Technologies
------
####Viewing
* XML databases for photo/video galleries
* XSLT to transform XML to HTML/CSS/JavaScript/jQuery
* JavaScript/jQuery for the pagination & lightbox

####Administration
* Node.js to support AJAX & image manipulation
* AJAX to read the XML gallery data

Changelog
------
####0.9.0 - 2012-May-21 - Support multiple galleries (Major update)
* This structure change makes it easier to seperate the history application from the personal content
* Demo gallery moved to the gallery-demo folder
* Album XML schema updated (1.8) to reflect folder name

####0.8.0 - 2012-May-20 - New admin page: Image manipulation to produce thumbnails 185x45 and move images to photos folder

####0.7.0 - 2012-May-07 - New admin page: edit existing albums (XML generation)

####0.6.0 - 2012-May-06 - added ability for viewing of HTML5 videos

####0.5.0 - 2012-May-06 - added Node.js for admin section
* (Fix) Character association 
* (Add) Node.js modules Express & GraphicsMagick
* (Add) Admin: Get getcode from map

####0.4.0 - 2012-May-03 - viewing of photos
* Sample album with three Vancouver markers on map
* jQuery v1.7.2
* Mapstraction Build 2.0.18 - pre-release using Google Maps v3
* ColorBox v1.3.19

Dependancies
------
Included in this project
* [jQuery](http://jquery.com/) v1.7.2
* [ColorBox (jQuery plugin)](http://www.jacklmoore.com/colorbox) v1.3.19
* [Mapstraction (mapping)](http://mapstraction.com/) build 2.0.18
* [Google Maps (map provider)](https://developers.google.com/maps/) v3
* [Twitter Bootstrap (admin)](http://twitter.github.com/bootstrap/) v2.0.3
* [Fluid 960 Grid System (admin)](http://www.designinfluences.com/fluid960gs/)

To use the administration tools
* [Node.js](http://nodejs.org/)
* [Express (node plugin)](http://expressjs.com/)
* [GraphicsMagick (node plugin)](https://github.com/aheckmann/gm) release 1.3.0

Photo/video album XML schemas
-------
### Current schema (1.8)

Example

    <album gallery="demo"> <!-- gallery directory name excluding 'gallery-'; new in schema 1.8 -->
    	<album_meta>
    		<album_name>sample</album_name> <!--Filename is album_sample.xml-->
    		<album_version>1.8</album_version> <!--Reference schema version-->
    		<geo>
    			<google_zoom>11</google_zoom> <!-- Initial zoom level when viewing Google map via Mapstraction -->
    		</geo>
    	</album_meta>
    	<photo id="1"> <!-- id attribute must be unique for this album; used by JavaScript & for character association -->
    		<filename>2001-03-21-01.jpg</filename> <!-- must start with YYYY year; photos and thumbs must be places in this folder too -->
    		<geo> <!-- geocode -->
    			<lat>49.25</lat> <!-- latitude -->
    			<lon>-123.1</lon> <!-- longitude -->
    		</geo>
    		<photo_city>Vancouver, BC</photo_city> <!-- Political location name often City, Province/State -->
    		<photo_loc>Granville Island</photo_loc> <!-- General location name often neighourhood or building -->
			<photo_desc>An oversized avocado</photo_desc> <!-- The photo description only viewable in the lightbox view -->
    		<thumb_caption>Lunch</thumb_caption> <!-- Less than three words to descibe the thumbnail in gallery view -->
    	</photo>
		<video id="4">
			<filename>2012-fireplace.mp4</filename> <!-- History supports both HTML5 video formats for best browser support; must start with YYYY year; photos and thumbs must be places in this folder too -->
			<filename>2012-fireplace.webm</filename>
			<photo_city>Vancouver, BC</photo_city>
			<photo_loc>Home</photo_loc>
			<thumb_caption>Video: Fireplace</thumb_caption>
			<photo_desc>A sample HTML5 video in both MP4 and WebM formats</photo_desc>
			<size><w>1280</w><h>720</h></size> <!-- Dimensions for opening the popup window and enlarging the HTML5 video -->
			<geo>
				<lat>49.25</lat>
				<lon>-123.1</lon>
			</geo>
		</video>
    </album>
    
License
-------
History is open-source and released under the [BSD License.](http://www.opensource.org/licenses/bsd-license.php)

Versioning
-------
http://semver.org/
