<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" doctype-system="about:legacy-compat" />
	<xsl:variable name="galleryDir" select="/album/meta/gallery" />
	<xsl:variable name="charAssPath" select="concat('../gallery-', $galleryDir, '/xml/character_ass.xml')" />
	<xsl:variable name="charsPath" select="concat('../gallery-', $galleryDir, '/xml/characters.xml')" />
	<xsl:variable name="char_ass" select="document($charAssPath)/character_association"/>
	<xsl:variable name="chars" select="document($charsPath)/characters"/>
	<xsl:variable name="photo__album_id">
    <xsl:if test="/album/meta/album_name">
      <xsl:value-of select="/album/meta/album_name"/>
    </xsl:if>
    <xsl:if test="/album/meta/id">
		  <xsl:value-of select="/album/meta/id"/>
    </xsl:if>
	</xsl:variable>
	<xsl:template match="/">
		<html>
			<head>
				<meta charset="utf-8" />
				<title>History - Photo Album</title>
				<base href="../"/>
				<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.css" />
				<!--[if lte IE 8]>
				    <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.ie.css" />
				<![endif]-->
				<style>
					<![CDATA[
					body { margin: 0; padding: 0; }
					#albumBox, #divMapBubble, #divToolbox { font-family:verdana; font-size:11px; font-weight:bold; }
					#albumBox, #divToolbox { float: left; }
					#albumBox { background-color: #323232; width: 100%; }
					#albumBox > ul { list-style: none; padding-left: 2px; }
					#albumBox .liAlbumPhoto {
						float: left;
						margin: 6px;
						background-color: #545454;
						padding-bottom: 6px;
						width: 195px; /* wrap friend characters */
						height: 110px;
					}
					#albumBox a { display: block; }
					#albumBox img { border-color: #545454; border-style: solid; border-width: 5px 5px 20px; }
					#albumBox .albumBoxPhotoImg a:hover img {
						border: 5px solid orange;
						border-width: 5px 5px 20px;
					}
					#albumBox .albumBoxPhotoCaption, #albumBox .albumBoxPhotoChar {
						margin: 0px 5px;
					}
					#albumBox .albumBoxPhotoCaption { color: silver; }
					#albumBox .albumBoxPhotoChar { color: gray; }

					#albumBox .liAlbumPhoto.imgViewed img {
						border: 5px solid white;
						border-width: 5px 5px 20px;
					}
					#cboxOverlay { background-image: none; /* allows colortheif */ width: 100%; }
					.splitMode #cboxOverlay { width: 75%; }
					.splitMode #mapBox { position: fixed; float: right; height: 100%; left: 75%; width: 25%; }
					.splitMode #albumBox { width: 75%; }
					#mapBox.subtle { opacity: 0.35; }
					]]>
				</style>
			</head>

			<body>
        <div id="albumBox">
					<xsl:attribute name="data-album">
						<xsl:value-of select="$photo__album_id" />
					</xsl:attribute>
					<xsl:attribute name="data-gallery">
						<xsl:value-of select="$galleryDir"/>
					</xsl:attribute>
					<ul>
						<xsl:for-each select="album/item">
							<!-- ___________ Characters ________________ -->
							<!-- remember variable scope inside for loop -->
							<xsl:variable name="photo__photo_sort">
								<xsl:value-of select="sort"/>
							</xsl:variable>

							<xsl:variable name="characters">
								<xsl:for-each select="$char_ass/c_a[a = $photo__album_id][p = $photo__photo_sort]">
									<xsl:variable name="char_ass__char_id">
										<xsl:value-of select="c"/>
									</xsl:variable>

									<xsl:choose>
										<xsl:when test="$chars//char[@id=$char_ass__char_id]/nick != ''">
											<xsl:value-of select="$chars//char[@id=$char_ass__char_id]/nick"/>
										</xsl:when>
										<xsl:otherwise>
											<xsl:value-of select="$chars//char[@id=$char_ass__char_id]/first"/>
										</xsl:otherwise>
									</xsl:choose>
									<xsl:text> </xsl:text>
								</xsl:for-each>
							</xsl:variable>
							<!-- _____________Media path _______________ -->
							<xsl:variable name="media_path">
								<xsl:value-of select="substring-before(filename,'-')"/>
								<xsl:text>/</xsl:text>
								<xsl:value-of select="substring-before(filename,'.')"/>
								<xsl:text>.jpg</xsl:text><!-- don't use video extention -->
							</xsl:variable>

							<li class="liAlbumPhoto">
								<xsl:attribute name="id">
									<xsl:text>photo</xsl:text>
									<xsl:choose>
										<xsl:when test="photo_id != ''">
											<xsl:value-of select="photo_id" />
										</xsl:when>
										<xsl:otherwise>
											<xsl:value-of select="sort" />
										</xsl:otherwise>
									</xsl:choose>
								</xsl:attribute>
								<div class="albumBoxPhotoImg">
									<a rel="set">
										<xsl:attribute name="href">
											<xsl:text>media/photos/</xsl:text>
											<xsl:value-of select="$media_path"/>
										</xsl:attribute>
										<!-- jQuery lightbox uses as photo caption -->
										<xsl:attribute name="data-caption">
											<xsl:choose>
												<xsl:when test="photo_loc != '' and photo_city != '' and photo_desc != ''">
													<xsl:value-of select="photo_loc"/> (<xsl:value-of select="photo_city"/>): <xsl:value-of select="photo_desc"/>
												</xsl:when>
												<xsl:when test="photo_loc != '' and photo_city != '' and photo_desc = ''">
													<xsl:value-of select="photo_loc"/> (<xsl:value-of select="photo_city"/>)
												</xsl:when>
												<xsl:when test="photo_loc != '' and photo_city = '' and photo_desc != ''">
													<xsl:value-of select="photo_loc"/>: <xsl:value-of select="photo_desc"/>
												</xsl:when>
												<xsl:when test="photo_loc = '' and photo_city != '' and photo_desc != ''">
													<xsl:value-of select="photo_city"/>: <xsl:value-of select="photo_desc"/>
												</xsl:when>
												<xsl:when test="photo_loc != ''">
													<xsl:value-of select="photo_loc"/>
												</xsl:when>
												<xsl:when test="photo_city != ''">
													<xsl:value-of select="photo_city"/>
												</xsl:when>
												<xsl:when test="photo_desc != ''">
													<xsl:value-of select="photo_desc"/>
												</xsl:when>
											</xsl:choose>
											<xsl:if test="$characters != ''">
												<xsl:text> with </xsl:text>
												<xsl:value-of select="$characters"/>
											</xsl:if>
											<xsl:if test="ref != ''">
												&lt;div class="meta"&gt;
													<xsl:choose>
														<xsl:when test="ref/source = 'facebook'">
															&lt;a href="javascript:;" onclick="fOpenWin('https://www.facebook.com/<xsl:value-of select="ref/name"/>',1000,900);"&gt;More: <xsl:value-of select="ref/name"/>&lt;/a&gt;
														</xsl:when>
														<xsl:when test="ref/source = 'google'">
															&lt;a href="javascript:;" onclick="fOpenWin('http://www.google.com/search?q=<xsl:value-of select="ref/name"/>',1000,900);"&gt;More: <xsl:value-of select="ref/name"/>&lt;/a&gt;
														</xsl:when>
														<xsl:when test="ref/source = 'wikipedia'">
															&lt;a href="javascript:;" onclick="fOpenWin('http://en.wikipedia.org/wiki/<xsl:value-of select="ref/name"/>',1000,900);"&gt;More: <xsl:value-of select="ref/name"/>&lt;/a&gt;
														</xsl:when>
													</xsl:choose>
												&lt;/div&gt;
											</xsl:if>
											<xsl:if test="type = 'video'">
												&lt;div class="meta"&gt;
													&lt;a href="javascript:;" onclick="fOpenWin('/watch-video?videos=<xsl:value-of select="filename[1]"/>,<xsl:value-of select="filename[2]"/>&amp;w=<xsl:value-of select="size/w"/>&amp;h=<xsl:value-of select="size/h"/>&amp;gallery=<xsl:value-of select="$galleryDir"/>',<xsl:value-of select="size/w + 20"/>,<xsl:value-of select="size/h + 20"/>);"&gt;Watch Video&lt;/a&gt;
												&lt;/div&gt;
											</xsl:if>
											<xsl:if test="geo/lat != '' and geo/lon != ''">
												&lt;div class="meta"&gt;
													&lt;a href="javascript:;" onclick="fOpenWin('/flickr-gallery?lat=<xsl:value-of select="geo/lat"/>&amp;lon=<xsl:value-of select="geo/lon"/>',800,600);"&gt;Search Flickr&lt;/a&gt;
												&lt;/div&gt;
											</xsl:if>
										</xsl:attribute>
										<img>
											<xsl:attribute name="src">
												<xsl:text>media/thumbs/</xsl:text>
												<xsl:value-of select="$media_path"/>
											</xsl:attribute>
											<!--
											<xsl:attribute name="title">
												<xsl:choose>
													<xsl:when test="photo_id != ''">
														<xsl:value-of select="photo_id" />
													</xsl:when>
													<xsl:otherwise>
														<xsl:value-of select="sort" />
													</xsl:otherwise>
												</xsl:choose>
											</xsl:attribute>
											-->
										</img>
									</a>
								</div>
								<div class="albumBoxPhotoCaption">
									<xsl:if test="type = 'video'">Video: </xsl:if>
									<xsl:value-of select="thumb_caption"/>
								</div>
								<div class="albumBoxPhotoChar">
									<xsl:value-of select="$characters"/>
								</div>
							</li>
						</xsl:for-each>
					</ul>
				</div>
				<!-- Photo -->
				<script src="../lib/color-thief.js"></script>
				<!-- Attach Leaflet & Mapstraction -->
				<script src="http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.js"></script>
				<script src="../lib/mxn-3.0.0-RC5/mxn.js"></script>
				<script src="../lib/mxn-3.0.0-RC5/mxn.core.js"></script>
				<script src="../lib/mxn-3.0.0-RC5/mxn.leaflet.core.js"></script>
				<!-- Attach XML and JSON converter library -->
				<script src="../lib/json_to_xml.js"></script>
				<!-- Attach global utilities -->
				<script src="../js/global.js"></script>
				<!-- Attach slippy map -->
				<script src="../js/map.js"></script>
				<!-- Attach XML utilities -->
				<script src="../js/xml.js"></script>
				<!-- Attach album -->
				<script src="../js/album.js"></script>
			</body>
		</html>
	</xsl:template>

</xsl:stylesheet>
