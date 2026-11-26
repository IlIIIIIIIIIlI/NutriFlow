import {createClient} from './off-client.js';import {toFood,productUrl} from './off-data.js';
const client=createClient();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>n===null?'—':n.toLocaleString('pt-BR',{maximumFractionDigits:1});
export function openOnline(dialog,onAdd,hasFood){
 let page=1,activeQuery='',brazil=true,controller;
 dialog.innerHTML=`<h2>Buscar alimentos online</h2><p>Consulte o Open Food Facts sem baixar a base inteira.</p><form id="off-search-form"><label>Nome, marca ou código de barras<input name="query" id="off-query" required minlength="2" maxlength="100" placeholder="Ex.: aveia ou código de barras"></label><label><input id="off-brazil" type="checkbox" checked> Produtos vendidos no Brasil (busca por nome)</label><button class="primary" id="off-search" type="submit">Buscar</button></form><p class="muted">A busca e as fotos usam internet. Apenas o termo pesquisado é enviado ao serviço; seus planos e metas permanecem no dispositivo.</p><p id="off-status" role="status"></p><div id="off-results"></div><div class="actions"><button id="off-prev" type="button" disabled>Anterior</button><button id="off-next" type="button" disabled>Próxima</button><button id="off-close" type="button">Fechar</button></div><footer>Dados: colaboradores do <a href="https://world.openfoodfacts.org" target="_blank" rel="noopener">Open Food Facts</a> · <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noopener">ODbL</a> / DbCL. Fotos: colaboradores do Open Food Facts, <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener">CC BY-SA 3.0</a>. Verifique o rótulo da sua marca.</footer>`;
 const q=s=>dialog.querySelector(s),status=q('#off-status'),results=q('#off-results'),form=q('#off-search-form'),prev=q('#off-prev'),next=q('#off-next'),search=q('#off-search');
 dialog.showModal();dialog.addEventListener('close',()=>controller?.abort(),{once:true});q('#off-close').onclick=()=>dialog.close();
 async function run(requestedPage){
  controller?.abort();controller=new AbortController();const current=controller;
  search.disabled=true;prev.disabled=true;next.disabled=true;results.innerHTML='';status.textContent='Buscando…';
  try{
   const data=await client.search(activeQuery,requestedPage,brazil,current.signal);if(!dialog.open||current.signal.aborted)return;
   page=requestedPage;status.textContent=data.products.length?`${data.count.toLocaleString('pt-BR')} resultados informados pelo serviço · página ${page}`:'Nenhum produto encontrado. Tente outro nome ou código de barras.';
   results.innerHTML=data.products.map(p=>`<article class="line"><div class="food"><img src="${esc(p.image||'./assets/food.svg')}" alt="${p.image?'Foto da embalagem':'Ilustração genérica'}" loading="lazy" referrerpolicy="no-referrer"><div class="desc"><h3>${esc(p.name)}</h3><small>${esc(p.brand)} · ${p.code}${p.brazil?' · Brasil':''}</small></div></div><p>Por 100 g ou 100 ml, conforme rótulo: ${fmt(p.kcal)} kcal · P ${fmt(p.p)} · C ${fmt(p.c)} · G ${fmt(p.f)}</p><p class="muted">${p.lactoseLabel?'Cadastro com selo sem lactose; confirme no rótulo.':'Ausência de lactose não confirmada.'}</p>${p.reasons.length?`<p class="notice">${p.reasons.map(esc).join(' ')}</p>`:''}<div class="actions"><button type="button" data-off-add="${p.code}" ${hasFood('off-'+p.code)||p.reasons.length?'disabled':''}>${hasFood('off-'+p.code)?'Já adicionado':'Revisar e adicionar'}</button><a href="${productUrl(p.code)}" target="_blank" rel="noopener">Ver fonte e foto</a></div></article>`).join('');
   results.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.src='./assets/food.svg';img.alt='Imagem indisponível; ilustração genérica';},{once:true}));
   results.onclick=e=>{const button=e.target.closest('[data-off-add]');if(!button||button.disabled)return;const product=data.products.find(p=>p.code===button.dataset.offAdd);dialog.close();onAdd(toFood(product));};
   prev.disabled=page===1;next.disabled=!data.hasNext;
  }catch(error){if(error.name!=='AbortError'&&dialog.open)status.textContent=error.message;}
  finally{if(dialog.open&&!current.signal.aborted)search.disabled=false;}
 }
 form.onsubmit=e=>{e.preventDefault();e.stopPropagation();activeQuery=q('#off-query').value.trim();brazil=q('#off-brazil').checked;run(1);};
 prev.onclick=()=>run(page-1);next.onclick=()=>run(page+1);
}
