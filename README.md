# Leiligheter — kart

Map of the apartments on our shortlist, with Oslo T-bane lines and stations.
Live at https://yarotskiu.github.io/elvelangs/ (GitHub Pages, `main` branch, repo root).

## Files

- `index.html` — the page (Leaflet 1.9.4 from cdnjs, Esri World Light Gray basemap — same tile service the old Elvelangs map used; CARTO now needs an API key). Loads the two JSON files below.
- `data/apartments.json` — `apartments[]` (one object per listing) and `places[]` (reference points: Bjerke, Construction City).
- `data/metro.json` — T-bane lines as Google-encoded polylines (precision 1e-5) and stations `[name, lat, lng, lines]`.
  Built from OpenStreetMap route relations 2890636, 6099199, 2636244, 2635251, 6104597, 2826133, 2640903, 453461
  via `https://api.openstreetmap.org/api/0.6/relation/<id>/full.json`. Only regenerate if the network changes.

## Data source

Shortlist spreadsheet (Google Sheets):
https://docs.google.com/spreadsheets/d/18yx2Eu65xw_Br2obkJDMG6qkZgElMfuYNk6qDi0hm6Y/edit?gid=0#gid=0

`row` in `apartments.json` is the row number in that sheet, so map numbers match the sheet.

Apartment fields: `row, addr, area, lat, lng, pris (prisantydning), fg (fellesgjeld), omk (omkostninger),
felles (felleskostnader per month), m2, parking, url (listing), imgs (all listing photo URLs, cover first)`.
Totalpris is computed in the page as `pris + fg + omk`.

Only numbers that are published in the listings go into this repo — it is public.
Personal finance figures (own capital, thresholds) stay in the spreadsheet.

## Adding an apartment

1. Take prisantydning, fellesgjeld, omkostninger, felleskost, m² from the listing.
2. Photos: all gallery images of the listing, cover (`og:image`) first. hjem.no: open the gallery, then collect `image.hjem.no/property-resized/<hash>/<date>/large/<id>.webp` for the listing's hash. nordvikbolig.no: `d1j4wdkidt72cf.cloudfront.net/estates/<ESTATE>/<n>-large.jpg`. krogsveen.no: the cdn.sanity.io hashes in the page's data script from the og:image onwards, as `...-<WxH>.jpg?w=1200&auto=format`.
3. Coordinates: search the address on Google Maps; the URL contains `!3d<lat>!4d<lng>`.
4. Add an object to `data/apartments.json`, commit to `main`, push.
