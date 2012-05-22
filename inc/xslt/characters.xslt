<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE xsl:stylesheet [
  <!ENTITY nbsp "&#160;">
]>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">


  <xsl:template match="history">
	<html>
	  <body>
		<xsl:apply-templates />
	  </body>
	</html>
  </xsl:template>

  <xsl:template match="char">
	<div>
	  <h4>
		<a>
		  <xsl:attribute name="name">
			<xsl:value-of select="@name" />
		  </xsl:attribute>
		  <xsl:value-of select="first" />
		  <xsl:text> </xsl:text>
		  <xsl:value-of select="last" />
		</a>
	  </h4>
	  <xsl:if test="active != ''">
	  <img>
		<xsl:attribute name="src">
		  <xsl:text>media/thumbs/characters/</xsl:text>
		  <xsl:value-of select="@name" />
		  <xsl:value-of select="active" />
		  <xsl:text>.jpg</xsl:text>
		</xsl:attribute>
	  </img>
	  </xsl:if>
	</div>
  </xsl:template>

</xsl:stylesheet>