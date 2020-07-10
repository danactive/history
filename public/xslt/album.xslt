<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"/>

  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-us">
      <head>
        <title>History - Photo Album</title>
        <style type="text/css"></style>
      </head>
      <body>
        <xsl:for-each select="album/item">
          <xsl:sort select="@id" data-type="number" />
          <div>
            <xsl:value-of select="photo_city" />
            - (
            <xsl:value-of select="filename" />
            )
          </div>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
