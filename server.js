import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json','.json':'application/json'};
http.createServer(async(req,res)=>{try{let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(path.startsWith('/NutriFlow/'))path=path.slice(10);if(path.endsWith('/'))path+='index.html';const file=resolve(root,'.'+path);if(!file.startsWith(resolve(root)+sep))throw Error();const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'text/plain','Cache-Control':'no-cache'});res.end(bytes);}catch{res.writeHead(404);res.end('Não encontrado');}}).listen(4173,'127.0.0.1',()=>console.log('NutriFlow: http://localhost:4173/NutriFlow/'));
