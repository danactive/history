<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"/>

  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-us">
      <head>
        <title>History - Photo Album Galleries</title>
        <style type="text/css">
          .album { float: left; width: 185px; height: 170px; padding: 10px; }
          .even { background-color: peachpuff; }
          .odd { background-color: linen; }
          h1 { font-size: 16px; font-family: "Trebuchet MS"; }
          h1 a { color: black; text-decoration:none; border-bottom: 1px dotted #666; }
          h2 { font-size: 12px; color: #8B7765; font-family: Verdana; }
          h3 { font-size: 14px; font-family: "Trebuchet MS"; color: #8B5A2B; margin: 0px; }
        </style>
      </head>
      <body>
        <xsl:for-each select="gallery/album">
          <xsl:sort select="sort" data-type="number" />
          <div>
            <xsl:attribute name="class">
              <xsl:text>album </xsl:text>
              <xsl:choose>
                <xsl:when test="position() mod 2">
                  <xsl:text>odd</xsl:text>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:text>even</xsl:text>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:attribute>
            <div class="album_img">
              <a>
                <xsl:attribute name="href">
                  <xsl:text>/view/album?album_stem=</xsl:text>
                  <xsl:value-of select="album_name"/>
                  <xsl:text>&amp;gallery=</xsl:text>
                  <xsl:value-of select="/gallery/@name"/>
                </xsl:attribute>
                <img>
                  <xsl:attribute name="src">
                    <xsl:text>../media/thumbs/</xsl:text>
                    <xsl:value-of select="substring-before(filename,'-')"/>
                    <xsl:text>/</xsl:text>
                    <xsl:value-of select="filename"/>
                  </xsl:attribute>
                </img>
              </a>
            </div>
            <h1>
              <a>
                <xsl:attribute name="href">
                  <xsl:text>/view/album?album_stem=</xsl:text>
                  <xsl:value-of select="album_name"/>
                  <xsl:text>&amp;gallery=</xsl:text>
                  <xsl:value-of select="/gallery/@name"/>
                </xsl:attribute>
                <xsl:value-of select="album_h1"/>
              </a>
            </h1>
            <h2>
              <xsl:value-of select="album_h2"/>
            </h2>
            <xsl:if test="year != 'none'">
              <h3>
                <xsl:value-of select="year" />

                <xsl:if test="album_version &gt;= 1.5">
                  <xsl:text> (Map)</xsl:text>
                </xsl:if>
              </h3>
            </xsl:if>
          </div>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
