history
=======

For the privacy-minded users: it's your personal history as a photo/video gallery for static inexpensive web hosting (ie portable USB flash drive or localhost)

Photo album XML schemas
-------
### Current schema (1.7)

Example

    <album>
      <album_meta>
    		<album_name>sample</album_name> <!--Filename is album_sample.xml-->
    		<album_version>1.7</album_version> <!--Reference schema version-->
    		<geo>
    			<google_zoom>11</google_zoom> <!-- Initial zoom level when viewing Google map via Mapstraction -->
    		</geo>
    	</album_meta>
    	<photo id="1"> <!-- id attribute must be unique for this album; used by JavaScript -->
    		<filename>2001-03-21-01.jpg</filename> <!-- must start with YYYY year; originals, photos, and thumbs must be places in this folder too -->
    		<geo> <!-- geocode -->
    			<lat>49.25</lat> <!-- latitude -->
    			<lon>-123.1</lon> <!-- longitude -->
    		</geo>
    		<photo_city>Vancouver, BC</photo_city> <!-- Political location name often City, Province/State -->
    		<photo_loc>Granville Island</photo_loc> <!-- General location name often neighourhood or building -->
    		<thumb_caption>Lunch</thumb_caption> <!-- Less than three words to descibe the thumbnail in gallery view -->
    	</photo>
    </album>