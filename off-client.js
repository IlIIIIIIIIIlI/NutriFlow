import {searchUrl,normalizeProduct} from './off-data.js';
export function createClient({fetcher=globalThis.fetch,now=()=>Date.now(),identify=()=>`NutriFlow/1.2 (${globalThis.location?.origin||'local'})`}={}){
 const cache=new Map();let last=-Infinity,blockedUntil=0;
 return {async search(query,page=1,brazil=true,signal){
  const url=searchUrl(query,page,brazil),time=now(),hit=cache.get(url);if(hit&&time-hit.time<300000)return hit.result;
  const wait=Math.max(blockedUntil-time,6500-(time-last));if(wait>0)throw Error(`Aguarde ${Math.ceil(wait/1000)} segundos antes de consultar novamente.`);
  last=time;const controller=new AbortController(),abort=()=>controller.abort();
  if(signal?.aborted)throw new DOMException('Cancelado','AbortError');signal?.addEventListener('abort',abort,{once:true});
  const timer=setTimeout(()=>controller.abort(),15000);
  try{
   const response=await fetcher(url,{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer',headers:{'X-User-Agent':identify()}});
   if(response.status===429){blockedUntil=now()+60000;throw Error('Limite de consultas atingido. Aguarde um minuto.');}
   if(!response.ok)throw Error('O Open Food Facts está indisponível. Tente novamente mais tarde.');
   const data=await response.json();let products,count;
   if(/^\d{8,14}$/.test(query.trim())){products=data.status===1&&data.product?[data.product]:[];count=products.length;}
   else{if(!Array.isArray(data.products))throw Error('Resposta inesperada do Open Food Facts.');products=data.products.slice(0,12);count=Number.isFinite(Number(data.count))?Number(data.count):0;}
   const result={products:products.map(normalizeProduct).filter(Boolean),count,hasNext:!/^\d{8,14}$/.test(query.trim())&&(page*12<count)};
   cache.set(url,{time:now(),result});if(cache.size>20)cache.delete(cache.keys().next().value);return result;
  }catch(error){if(error.name==='AbortError'){if(signal?.aborted)throw error;throw Error('A consulta demorou demais. Tente novamente.');}if(error instanceof TypeError)throw Error('Não foi possível conectar. Verifique a internet; o serviço também pode estar indisponível ou bloqueando a conexão.');throw error;}
  finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
 }};
}
