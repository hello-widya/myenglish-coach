/* English Coach service worker: app shell cached for offline use.
   Bump VERSION when you deploy a new index.html so phones refresh. */
const VERSION="v1";
const CACHE="english-coach-"+VERSION;
const SHELL=["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("english-coach-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);
  // never touch AI provider calls or other cross-origin APIs, except Google Fonts files
  if(url.origin!==location.origin){
    if(url.hostname==="fonts.googleapis.com"||url.hostname==="fonts.gstatic.com"){
      e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(hit=>hit||fetch(req).then(r=>{if(r&&(r.ok||r.type==="opaque"))c.put(req,r.clone());return r}).catch(()=>hit))));
    }
    return;
  }
  // pages: network first (so updates arrive), cache as fallback when offline
  if(req.mode==="navigate"){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put("index.html",cp));return r}).catch(()=>caches.match("index.html").then(h=>h||caches.match("./"))));
    return;
  }
  // other same-origin files: cache first
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r})));
});
