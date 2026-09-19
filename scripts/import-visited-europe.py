"""Prepare ready-made Türkiye provinces and Italy regions (no geometry conversion).

Usage: python3 scripts/import-visited-europe.py natural-earth.geojson italy-regions.geojson
Source URLs and licenses: public/maps/visited/README.md.
Then run node scripts/generate-visited-labels.mjs.
"""
import json
import sys
from pathlib import Path

natural_earth = json.loads(Path(sys.argv[1]).read_text())
italy = json.loads(Path(sys.argv[2]).read_text())
features = []
for feature in natural_earth['features']:
    props = feature['properties']
    if props['adm0_a3'] != 'TUR':
        continue
    aliases = [props.get(key) for key in ['name', 'name_en', 'postal', 'iso_3166_2']]
    aliases += (props.get('name_alt') or '').split('|')
    features.append({'type': 'Feature', 'geometry': feature['geometry'], 'properties': {
        'id': props['iso_3166_2'], 'name': props.get('name_en') or props['name'],
        'aliases': list(dict.fromkeys(alias for alias in aliases if alias)),
    }})
assert len(features) == 81
Path('public/maps/visited/turkiye.geojson').write_text(json.dumps(
    {'type': 'FeatureCollection', 'features': features}, ensure_ascii=False, separators=(',', ':')) + '\n')

# ISTAT region code -> ISO region code and English display name. Keep source names as aliases.
regions = {
    1: ('21', 'Piedmont'), 2: ('23', 'Aosta Valley'), 3: ('25', 'Lombardy'),
    4: ('32', 'Trentino-Alto Adige'), 5: ('34', 'Veneto'), 6: ('36', 'Friuli-Venezia Giulia'),
    7: ('42', 'Liguria'), 8: ('45', 'Emilia-Romagna'), 9: ('52', 'Tuscany'), 10: ('55', 'Umbria'),
    11: ('57', 'Marche'), 12: ('62', 'Lazio'), 13: ('65', 'Abruzzo'), 14: ('67', 'Molise'),
    15: ('72', 'Campania'), 16: ('75', 'Apulia'), 17: ('77', 'Basilicata'), 18: ('78', 'Calabria'),
    19: ('82', 'Sicily'), 20: ('88', 'Sardinia'),
}
features = []
for feature in italy['features']:
    props = feature['properties']
    code, name = regions[props['reg_istat_code_num']]
    aliases = [props['reg_name'], *props['reg_name'].split('/'), name, f'IT-{code}']
    features.append({'type': 'Feature', 'geometry': feature['geometry'], 'properties': {
        'id': f'IT-{code}', 'name': name, 'aliases': list(dict.fromkeys(aliases)),
    }})
assert len(features) == 20
Path('public/maps/visited/italy.geojson').write_text(json.dumps(
    {'type': 'FeatureCollection', 'features': features}, ensure_ascii=False, separators=(',', ':')) + '\n')
