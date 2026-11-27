import {validOffMeta} from './off-data.js';
import {mealTypes,mealShares,MAX_MEALS,migrateLegacyState} from './meals.js';
export const keys=['kcal','p','c','f'];
export const defaults={kcal:2400,p:130,c:308,f:72};
export const mealNames=mealTypes.map(m=>m.name);
export const shares=mealShares(mealTypes);
export const zero=()=>({kcal:0,p:0,c:0,f:0});
export function total(rows,foods){return rows.reduce((sum,r)=>{const f=foods.find(f=>f.id===r.id);if(!f)throw Error('Alimento não encontrado');for(const k of keys)sum[k]+=f[k]*r.g/100;return sum;},zero());}
export function target(goals,indices,config=mealTypes){const portions=mealShares(config);let s=indices.reduce((a,i)=>a+(portions[i]||0),0);return Object.fromEntries(keys.map(k=>[k,goals[k]*s]));}
export function equivalent(food,kind){const [k,n]=kind==='fruit'?['c',20]:kind==='p'?['p',25]:kind==='c'?['c',30]:['f',10];return food[k]>0?n*100/food[k]:null;}
export function solve(rows,foods,goal,hybrid=false){
 const result=structuredClone(rows), scales=keys.map(k=>Math.max(goal[k],k==='kcal'?100:10));
 const a=result.map(r=>{const f=foods.find(f=>f.id===r.id);return keys.map((k,j)=>f[k]/100/scales[j]);});
 const b=keys.map((k,j)=>goal[k]/scales[j]);
 result.forEach(r=>{if(!(hybrid&&r.fixed))r.g=Math.max(0,Math.min(r.max,r.g));});
 let residual=b.map((v,j)=>result.reduce((s,r,i)=>s+a[i][j]*r.g,-v));
 let converged=false;
 for(let iter=0;iter<12000;iter++){
  let movement=0;
  result.forEach((r,i)=>{if(hybrid&&r.fixed)return;const norm=a[i].reduce((s,v)=>s+v*v,0);if(!norm){r.g=0;return;}
   const gradient=a[i].reduce((s,v,j)=>s+v*residual[j],0);const next=Math.max(0,Math.min(r.max,r.g-gradient/norm)),delta=next-r.g;r.g=next;movement=Math.max(movement,Math.abs(delta));residual=residual.map((v,j)=>v+a[i][j]*delta);
  });if(movement<1e-7){converged=true;break;}
 }
 result.forEach(r=>{if(!(hybrid&&r.fixed))r.g=Math.round(r.g*10)/10;});
 const values=total(result,foods), deviations=Object.fromEntries(keys.map(k=>[k,values[k]-goal[k]]));
 return {rows:result,values,deviations,converged,within:keys.every(k=>Math.abs(deviations[k])<=Math.max(goal[k]*.05,.5))};
}
export function validate(data){
 const fail=()=>{throw Error('Arquivo inválido: confira a versão, alimentos, metas e quantidades.');};
 const num=(v,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max;
 if(!data||![1,2].includes(data.version)||!Array.isArray(data.foods)||data.foods.length<1||data.foods.length>300||!Array.isArray(data.plans)||data.plans.length>100)fail();
 const ids=new Set();for(const f of data.foods){if(typeof f.id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(f.id)||ids.has(f.id)||typeof f.name!=='string'||!f.name.trim()||f.name.length>100||!['p','c','f','fruit'].includes(f.group)||!keys.every(k=>num(f[k],k==='kcal'?1000:100))||!num(f.max,2000)||f.max===0||typeof f.basis!=='string'||f.basis.length>200||typeof f.source!=='string'||f.source.length>500)fail();if(f.off!==undefined&&!validOffMeta(f.off))fail();ids.add(f.id);}
 const plan=p=>{if(!p||typeof p.id!=='string'||p.id.length>80||typeof p.name!=='string'||!p.name.trim()||p.name.length>100||!p.goals||!keys.every(k=>num(p.goals[k],k==='kcal'?20000:2000))||!Array.isArray(p.meals)||(data.version===1?p.meals.length!==4:(p.meals.length<1||p.meals.length>MAX_MEALS)))fail();if(data.version===2){if(!Array.isArray(p.mealConfig)||p.mealConfig.length!==p.meals.length||new Set(p.mealConfig.map(m=>m?.id)).size!==p.meals.length)fail();for(const m of p.mealConfig){if(!m||typeof m.id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(m.id)||typeof m.name!=='string'||!m.name.trim()||m.name.length>60||!mealTypes.some(t=>t.kind===m.kind)||!num(m.weight,1000))fail();}}for(const meal of p.meals){if(!Array.isArray(meal)||meal.length>300)fail();const seen=new Set();for(const r of meal){if(!r||!ids.has(r.id)||seen.has(r.id)||!num(r.g,2000)||!num(r.max,2000)||r.max===0||typeof r.fixed!=='boolean')fail();seen.add(r.id);}}};
 plan(data.current);data.plans.forEach(plan);if(new Set(data.plans.map(p=>p.id)).size!==data.plans.length)fail();return data;
}

export function upgradeState(data){validate(data);const migrated=migrateLegacyState(data);return validate(migrated);}
