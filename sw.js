const PREFIX='nutriflow-'+self.registration.scope;
const CACHE=PREFIX+'v1';
const FILES=['./','./index.html','./style.css','./app.js','./core.js','./foods.js','./manifest.webmanifest',...['icon.svg','icon-192.png','icon-512.png','food.svg','rice.svg','brownrice.svg','oats.svg','chicken.svg','beans.svg','chickpeas.svg','banana.svg','pineapple.svg','avocado.svg','peanuts.svg','egg.svg','oil.svg','plantprotein.svg'].map(f=>'./assets/'+f)];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(names=>Promise.all(names.filter(n=>n.startsWith(PREFIX)&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(event.request.method!=='GET'||!u.href.startsWith(self.registration.scope))return;event.respondWith(caches.open(CACHE).then(async cache=>{const saved=await cache.match(event.request);if(saved)return saved;try{return await fetch(event.request);}catch(error){if(event.request.mode==='navigate')return cache.match('./index.html');throw error;}}));});
