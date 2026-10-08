Optional: a photo pack that ships with the site.

Parents can already add their own photos in the Grown-ups area (Settings → Photos). Those stay on their device.
If you also want built-in photos for everyone, you can add a pack here:

1. Make a folder named after the theme: vehicles, animals, space, dinos or colours.
2. Add one square-ish JPEG per picture, named after the English picture name in lower case with dashes:
     vehicles/train.jpg  vehicles/bus.jpg  vehicles/car.jpg  vehicles/bike.jpg
     vehicles/helicopter.jpg  vehicles/tractor.jpg  vehicles/boat.jpg  vehicles/fire-engine.jpg
   Keep each under about 60 KB (around 400 x 400 pixels).
3. In js/config.js add:   photoPacks: ["vehicles"],
4. Bump VERSION in sw.js and redeploy.

Licences: use only photos you took yourself, or ones marked CC0 / Public Domain (no attribution needed).
Good places to search with a CC0 / public-domain filter:
  - Wikimedia Commons: https://commons.wikimedia.org  (check each file's "Licensing" section)
  - Openverse: https://openverse.org  (set the licence filter to CC0 and Public Domain Mark)
If you use CC BY photos instead, you must credit the photographer: list them on the accessibility or terms page.
Avoid photos showing people's faces, brand logos or number plates.
