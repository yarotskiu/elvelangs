/* Elvelangs 2026 — offline support.
   Tiles and app shell are served from the Cache API so the map keeps
   working when the mobile network gives up along the river. */

var TILES = "elv-tiles-v1";
var APP = "elv-app-v1";

var APP_URLS = [
  "./",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(APP)
      .then(function(c){ return Promise.all(APP_URLS.map(function(u){ return c.add(u).catch(function(){}); })); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== TILES && k !== APP) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

function isTile(u){
  return u.host === "services.arcgisonline.com" || u.host === "tile.openstreetmap.org";
}
function isAsset(u){
  return u.origin === self.location.origin
      || u.host === "cdnjs.cloudflare.com"
      || u.host === "fonts.googleapis.com"
      || u.host === "fonts.gstatic.com";
}

self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;

  var u;
  try { u = new URL(e.request.url); } catch(err){ return; }

  // The page itself: network first, so a republished version is picked up,
  // with the cached copy as the fallback when offline.
  if(e.request.mode === "navigate"){
    e.respondWith(
      fetch(e.request).then(function(r){
        if(r && r.status === 200){
          var copy = r.clone();
          caches.open(APP).then(function(c){ c.put("./", copy); });
        }
        return r;
      }).catch(function(){
        return caches.open(APP).then(function(c){ return c.match("./"); });
      })
    );
    return;
  }

  // Map tiles: cache first — that is the whole point of the offline download.
  if(isTile(u)){
    e.respondWith(
      caches.open(TILES).then(function(c){
        return c.match(e.request, {ignoreVary:true}).then(function(hit){
          if(hit) return hit;
          return fetch(e.request).then(function(r){
            if(r && r.status === 200 && r.type !== "opaque") c.put(e.request, r.clone());
            return r;
          });
        });
      })
    );
    return;
  }

  // Scripts, styles, fonts: cache first, refreshed in the background.
  if(isAsset(u)){
    e.respondWith(
      caches.open(APP).then(function(c){
        return c.match(e.request, {ignoreVary:true}).then(function(hit){
          var net = fetch(e.request).then(function(r){
            if(r && r.status === 200 && r.type !== "opaque") c.put(e.request, r.clone());
            return r;
          }).catch(function(){ return hit; });
          return hit || net;
        });
      })
    );
  }
});
