<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" doctype-system="about:legacy-compat" />
	<xsl:variable name="galleryDir" select="/album/@gallery" />
	<xsl:variable name="charAssPath" select="concat('/gallery-', $galleryDir, '/character_ass.xml')" />
	<xsl:variable name="charsPath" select="concat('/gallery-', $galleryDir, '/characters.xml')" />
	<xsl:variable name="char_ass" select="document($charAssPath)/character_association"/>
	<xsl:variable name="chars" select="document($charsPath)/characters"/>
	<xsl:variable name="photo__album_name">
		<xsl:value-of select="/album/album_meta/album_name"/>
	</xsl:variable>
	<xsl:template match="/">
		<html>
			<head>
				<meta charset="utf-8" />
				<title>History - Photo Album</title>
				<script src="../inc/js/jquery-1.7.2.min.js"></script>
				<!-- Photo -->
				<script src="../inc/js/jquery.colorbox-min.js"></script>
				<link  href="../inc/css/colorbox.css" rel="stylesheet" media="screen" />
				<!-- Map -->
				<script src="http://maps.google.com/maps/api/js?sensor=false"></script>
				<script>strMapEngine = 'googlev3';</script>
				<script src="../inc/js/mxn-min.js"></script>
				<script src="../inc/js/mxn.core-min.js"></script>
				<script src="../inc/js/mxn.googlev3.core-min.js"></script>
				<!--script src="../inc/js/mapstraction.js"></script-->
				<script src="../inc/js/global.js"></script>
				<script src="../inc/js/album.js"></script>

				<style>
					<![CDATA[
					#divAlbum, #divMapBubble, #divToolbox { float: left; font-family:verdana; font-size:11px; font-weight:bold; }
					#divAlbum {
						background-color: #323232;
						width: 100%;
					}
					#divAlbum > ul { list-style: none; padding-left: 1em; }
					#divAlbum .liAlbumPhoto {
						float: left;
						margin: 6px;
						background-color: #545454;
						padding-bottom: 6px;
						width: 195px; /* wrap friend characters */
						height: 110px;
					}
					#divAlbum a { display: block; }
					#divAlbum img { border-color: #545454; border-style: solid; border-width: 5px 5px 20px; }
					#divAlbum .divAlbumPhotoImg a:hover img {
						border: 5px solid orange;
						border-width: 5px 5px 20px;
					}
					#divAlbum .divAlbumPhotoCaption, #divAlbum .divAlbumPhotoChar {
						margin: 0px 5px;
					}
					#divAlbum .divAlbumPhotoCaption { color: silver; }
					#divAlbum .divAlbumPhotoChar { color: gray; }
					
					#divAlbum .liAlbumPhoto.imgViewed img {
						border: 5px solid white;
						border-width: 5px 5px 20px;
					}
					]]>
				</style>
			</head>

			<body>
				<!-- XML schema 1.5 thru 2.0 had geo tag in this format -->
				<xsl:if test="number(/album/album_meta/album_version) &gt;= '1.5' and number(/album/album_meta/album_version) &lt; '2'">
					<div id="divToolbox">
						<a href="javascript:;" id="linkMap">
							<xsl:attribute name="onclick">
								<xsl:text>fMap('</xsl:text>
								<xsl:value-of select="$photo__album_name" />
								<xsl:text>');</xsl:text>
							</xsl:attribute>
							Map this album
						</a>
					</div>
				</xsl:if>
				<div style="clear: left;"></div>

				<div id="divAlbum">
					<ul>
						<xsl:for-each select="album/photo|album/video">
							<!-- ___________ Characters ________________ -->
							<!-- remember variable scope inside for loop -->
							<xsl:variable name="photo__photo_id">
								<xsl:value-of select="@id"/>
							</xsl:variable>
							
							<xsl:variable name="characters">
								<xsl:for-each select="$char_ass/c_a[a = $photo__album_name][p = $photo__photo_id]">
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
											<xsl:value-of select="@id" />
										</xsl:otherwise>
									</xsl:choose>
								</xsl:attribute>
								<div class="divAlbumPhotoImg">
									<a rel="set">
										<xsl:attribute name="href">
											<xsl:text>media/photos/</xsl:text>
											<xsl:value-of select="$media_path"/>
										</xsl:attribute>
										<!-- jQuery lightbox uses as photo caption -->
										<xsl:attribute name="title">
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
											<xsl:choose>
												<xsl:when test="ref != ''">
													&lt;div class="meta"&gt;
														<xsl:choose>
															<xsl:when test="ref/source = 'wikipedia'">
																&lt;a href="javascript:;" onclick="fOpenWin('http://en.wikipedia.org/wiki/<xsl:value-of select="ref/name"/>',1000,900);"&gt;More: <xsl:value-of select="ref/name"/>&lt;/a&gt;
															</xsl:when>
														</xsl:choose>
													&lt;/div&gt;
												</xsl:when>
												<xsl:when test="name(.) = 'video'">
													&lt;div class="meta"&gt;
														&lt;a href="javascript:;" onclick="fOpenWin('../video.htm?videos=<xsl:value-of select="filename[1]"/>,<xsl:value-of select="filename[2]"/>&amp;w=<xsl:value-of select="size/w"/>&amp;h=<xsl:value-of select="size/h"/>&amp;gallery=<xsl:value-of select="$galleryDir"/>',<xsl:value-of select="size/w"/>,<xsl:value-of select="size/h"/>);"&gt;Watch Video&lt;/a&gt;
													&lt;/div&gt;
												</xsl:when>
											</xsl:choose>
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
														<xsl:value-of select="@id" />
													</xsl:otherwise>
												</xsl:choose>
											</xsl:attribute>
											-->
										</img>
									</a>
								</div>
								<div class="divAlbumPhotoCaption">
									<xsl:value-of select="thumb_caption"/>
								</div>
								<div class="divAlbumPhotoChar">
									<xsl:value-of select="$characters"/>
								</div>
							</li>
						</xsl:for-each>
					</ul>
				</div>
			</body>
		</html>
	</xsl:template>

</xsl:stylesheet>