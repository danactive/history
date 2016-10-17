history
=======

Your personal **history** storyboarded with photo and video albums.  Associate photos with their meta data including geocode, caption, friends (characters)... in XML albums.
* Plot thumbnails on a map
* Code runs on static web hosts
* Includes administration tools for XML generation
* Free & open source (dependent on other open source projects see individual licenses)

Installation
------
1. Node.js
1. `npm run dev`
1. View address in browser

Technologies
------
####Viewing
* XML databases for photo/video galleries
* XSLT to transform XML to HTML/CSS/JavaScript/jQuery
* JavaScript/jQuery for the pagination & lightbox

####Administration
* Node.js to support AJAX & image manipulation
* AJAX to read the XML gallery data


Dependencies
------
Included in this project
* [jQuery](http://jquery.com/) via bower
* [ColorBox (jQuery plugin)](http://www.jacklmoore.com/colorbox) via bower
* [Mapstraction (mapping)](http://mapstraction.com/) build 2.0.18
* [Google Maps (map provider)](https://developers.google.com/maps/) v3
* [Twitter Bootstrap (admin)](http://twitter.github.com/bootstrap/) v2.0.3
* [Fluid 960 Grid System (admin)](http://www.designinfluences.com/fluid960gs/)

To use the administration tools
* [node.js](http://nodejs.org/)
* [hapi.js](http://hapijs.org/)
* [GraphicsMagick](https://www.npmjs.com/package/gm) Install GraphicsMagick before npm
* [bower](http://bower.io/) via npm
	* npm install -g bower

Folder structures
-------
* admin/ - administration files for generating XML.  Copy and paste the XML structure into the albums
* gallery-demo/ - demonstration of a gallery with the sample album inside
* node_modules/ - Backup of installed modules for Node.js
* .gitignore - blacklist files/folders for GitHub
* README.md - this file
* index.htm - Home page when avoiding Node.js
* video.htm - Reads a query string and generates the HTML5 video tags
* app.js - Node.js code for creating a web server
* webserver_node START.bat - (Windows) Executes the Node.js web server for localhost viewing and administration image manipulation
* webserver_node VIEW.url - (Windows) Opens http://localhost in default browser

Photo/video album XML schemas
-------
### Current schema (2.0)

Example

	<album>
		<meta>
			<gallery>demo</gallery> <!-- gallery directory name excluding 'gallery-'; new in schema 2.0 -->
			<id>sample</id> <!--Filename is album_sample.xml; new in schema 2.0-->
			<version>1.8</version> <!--Reference schema version; new in schema 2.0-->
		</meta>
		<item><!-- photo -->
			<id>1</id> <!-- id attribute must be unique for this album; used by JavaScript & for character association -->
			<filename>2001-03-21-01.jpg</filename> <!-- must start with YYYY year; photos and thumbs must be places in this folder too -->
			<geo> <!-- geocode -->
				<lat>49.25</lat> <!-- latitude -->
				<lon>-123.1</lon> <!-- longitude -->
			</geo>
			<photo_city>Vancouver, BC</photo_city> <!-- Political location name often City, Province/State -->
			<photo_loc>Granville Island</photo_loc> <!-- General location name often neighourhood or building -->
			<photo_desc>An oversized avocado</photo_desc> <!-- The photo description only viewable in the lightbox view -->
			<thumb_caption>Lunch</thumb_caption> <!-- Less than three words to descibe the thumbnail in gallery view -->
		</item>
		<item><!-- video -->
			<type>video</type>
			<id>1</id> <!-- id attribute must be unique for this album; used by JavaScript & for character association -->
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
		</item>
	</album>
