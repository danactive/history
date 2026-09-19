# Visited region boundaries

Public-domain Natural Earth Admin 1 states and provinces, version 5.1.2:
https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_10m_admin_1_states_provinces.geojson

https://www.naturalearthdata.com/about/terms-of-use/

The original Natural Earth files contain the features whose `adm0_a3` is JPN, USA, CAN, or MEX (47 Japanese
prefectures, 50 US states plus DC, 13 Canadian provinces/territories, and 31 Mexican states plus Mexico City).
Geometry is unchanged. Properties retain `iso_3166_2` as `id`, `name_en` (falling
back to `name`) as `name`, and the unique nonempty values of `name`, `name_en`,
`name_ja`, `postal`, `iso_3166_2`, and pipe-separated `name_alt` as `aliases`.
Files are compact JSON. All six datasets are loaded together and remain mounted during navigation.
DC uses `District of Columbia` as its canonical name, since the source's English
name `Washington` collides with Washington state.

Label properties are generated offline with `rtk node scripts/generate-visited-labels.mjs`:
`label` is an interior visual-center anchor in the largest polygon, `labelRadius`
is its available longitudinal radius, and `abbreviation` is a postal subdivision
code (USA/Canada) or ISO subdivision code (Japan). The generator uses best-first
subdivision with longitude scaled for latitude. Geometry is never changed.
Largest-polygon selection keeps Alaska on its mainland and island prefectures on
their main island; containment and these cases are checked by the boundary tests.

Mexico excludes the unnamed `MX-X01~` source feature. The legacy `MX-DIF`
feature is named Mexico City and uses `MX-CMX`, preserving DF/MX-DIF aliases
and adding CDMX/Ciudad de México. State of Mexico remains separate, with
Estado de México/Mexico State aliases. Mexican label abbreviations use the
three-letter ISO subdivision suffix to avoid neighboring postal-code collisions.


## Italy and Türkiye

Türkiye uses the same Natural Earth 5.1.2 source above, filtered to `adm0_a3=TUR`
(81 provinces). Geometry is unchanged. Province suffixes, dotted/dotless Turkish
I variants, and accented names are normalized for matching. Turkey/Turkiye/Türkiye
country names select the same dataset.

Italy uses ready-made regional GeoJSON from ISTAT, distributed by
[guglielmo/geojson-italy, release 2026.1](https://github.com/guglielmo/geojson-italy/tree/2026.1):
https://raw.githubusercontent.com/guglielmo/geojson-italy/2026.1/geojson/limits_IT_regions.geojson

© ISTAT, CC BY; see the [source license](https://github.com/guglielmo/geojson-italy/blob/2026.1/LICENSE).
Geometry is unchanged. Properties are adapted to the common local schema:
ISTAT region codes map to ISO region IDs, English names are display names, and
original Italian/bilingual names remain aliases. Attribution appears on the map
in both online and vector-only modes. No province merging or geometry library is used.

To reproduce these two assets, download the pinned sources and run
`python3 scripts/import-visited-europe.py natural-earth.geojson italy-regions.geojson`,
then `node scripts/generate-visited-labels.mjs`. Both scripts use only built-in
libraries. Italy and Türkiye abbreviations use full ISO IDs to avoid ambiguous
numeric labels alongside Japan. All six datasets share the same runtime pipeline.
