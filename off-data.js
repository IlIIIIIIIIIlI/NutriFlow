export const OFF_FIELDS='code,product_name,product_name_pt,brands,nutriments,nutrition_data_per,quantity,product_quantity_unit,serving_size,labels_tags,countries_tags,image_front_small_url';
export function safeImage(value){try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='images.openfoodfacts.org'&&u.pathname.startsWith('/images/products/')&&!u.username&&!u.password?u.href:'';}catch{return '';}}
export const productUrl=code=>`https://world.openfoodfacts.org/product/${code}`;
export function validOffMeta(off){return off&&/^\d{8,14}$/.test(off.code)&&typeof off.importedAt==='string'&&Number.isFinite(Date.parse(off.importedAt))&&typeof off.image==='string'&&(!off.image||safeImage(off.image)===off.image);}
export function searchUrl(query,page=1,brazil=true){
 const clean=query.trim();if(clean.length<2||clean.length>100)throw Error('Digite de 2 a 100 caracteres.');
 if(/^\d{8,14}$/.test(clean))return `https://world.openfoodfacts.org/api/v2/product/${clean}.json?fields=${encodeURIComponent(OFF_FIELDS)}`;
 const url=new URL('https://world.openfoodfacts.org/cgi/search.pl');
 for(const [key,value] of Object.entries({search_terms:clean,search_simple:1,action:'process',json:1,page_size:12,page:Math.max(1,Math.min(100,page)),fields:OFF_FIELDS,lc:'pt',...(brazil?{tagtype_0:'countries',tag_contains_0:'contains',tag_0:'brazil'}:{})}))url.searchParams.set(key,String(value));return url.href;
}
function number(value,max){return typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=max?value:null;}
export function normalizeProduct(product){
 const code=String(product.code||'');if(!/^\d{8,14}$/.test(code))return null;
 const n=product.nutriments||{},name=String(product.product_name_pt||product.product_name||'Produto sem nome').slice(0,200),brand=String(product.brands||'').slice(0,100);
 let kcal=number(n['energy-kcal_100g'],1000);if(kcal===null){const kj=number(n['energy-kj_100g'],4184);if(kj!==null)kcal=kj/4.184;}
 const macros={kcal,p:number(n.proteins_100g,100),c:number(n.carbohydrates_100g,100),f:number(n.fat_100g,100)};
 const reasons=[];if(Object.values(macros).some(v=>v===null))reasons.push('Informação de calorias ou macros ausente/inválida.');
 const volume=/\b(ml|cl|dl|l|liters?|litres?|litros?)\b/i.test([product.product_quantity_unit,product.quantity,product.serving_size,product.nutrition_data_per].filter(Boolean).join(' ').replace(/(\d)([a-z])/gi,'$1 $2'));
 const massBasis=/^100\s*g$/i.test(product.nutrition_data_per||'')||(/serving/i.test(product.nutrition_data_per||'')&&/\d\s*g\b/i.test(product.serving_size||''));
 if(volume)reasons.push('Base em volume: não converter 100 ml para 100 g sem densidade.');
 else if(!massBasis)reasons.push('Base por massa não confirmada no cadastro.');
 const lactose=number(n.lactose_100g,100),label=Array.isArray(product.labels_tags)&&product.labels_tags.includes('en:lactose-free');
 if(lactose!==null&&lactose>0)reasons.push('O cadastro informa lactose acima de zero.');
 const countries=Array.isArray(product.countries_tags)?product.countries_tags:[];
 return {code,name,brand,...macros,image:safeImage(product.image_front_small_url),reasons,lactoseLabel:label,lactose,brazil:countries.includes('en:brazil')};
}
export function toFood(p,now=new Date().toISOString()){
 if(p.reasons.length)throw Error('Revise o cadastro: este produto não pode ser adicionado automaticamente.');
 const group=['p','c','f'].reduce((best,k)=>p[k]*(k==='f'?9:4)>p[best]*(best==='f'?9:4)?k:best,'p');
 return {id:'off-'+p.code,name:(p.name+(p.brand?' · '+p.brand:'')).slice(0,100),group,...Object.fromEntries(['kcal','p','c','f'].map(k=>[k,Math.round(p[k]*100)/100])),max:group==='f'?60:300,basis:'Como vendido, por 100 g — conferir rótulo; não converter para cru',source:`Open Food Facts · ${p.code} · ODbL/DbCL · ${productUrl(p.code)}`,off:{code:p.code,image:p.image,importedAt:now}};
}
