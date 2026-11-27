export const mealTypes=[
 {id:'breakfast',name:'Café da manhã',kind:'breakfast',weight:20},
 {id:'lunch',name:'Almoço',kind:'lunch',weight:30},
 {id:'afternoon',name:'Café da tarde',kind:'afternoon',weight:15},
 {id:'preworkout',name:'Pré treino',kind:'preworkout',weight:10},
 {id:'dinner',name:'Janta',kind:'dinner',weight:20},
 {id:'supper',name:'Ceia',kind:'supper',weight:5}
];
export const MAX_MEALS=12;
export function defaultMeals(){return {mealConfig:structuredClone(mealTypes),meals:mealTypes.map(()=>[])};}
export function mealShares(config){const sum=config.reduce((s,m)=>s+m.weight,0);return config.map(m=>sum>0?m.weight/sum:1/config.length);}
export function prepIndices(plan){return plan.mealConfig.flatMap((m,i)=>['lunch','dinner'].includes(m.kind)?[i]:[]);}
export function migrateLegacyState(data){
 const result=structuredClone(data);if(result.version===2)return result;
 if(result.version!==1)throw Error('Versão de backup não suportada.');
 for(const plan of [result.current,...result.plans]){const old=plan.meals;Object.assign(plan,defaultMeals());[0,1,2,4].forEach((destination,i)=>{plan.meals[destination]=old[i];});}
 result.version=2;return result;
}
export function addMeal(plan,name,kind='afternoon',id=crypto.randomUUID()){
 if(plan.meals.length>=MAX_MEALS)throw Error('Você pode ter até 12 refeições por plano.');
 name=name.trim();if(!name||name.length>60||!mealTypes.some(m=>m.kind===kind))throw Error('Informe um nome e uma ilustração válidos.');
 if(plan.mealConfig.some(m=>m.id===id))throw Error('Identificador de refeição repetido.');
 const total=plan.mealConfig.reduce((s,m)=>s+m.weight,0);
 plan.mealConfig.push({id,name,kind,weight:total/plan.meals.length});plan.meals.push([]);return plan.meals.length-1;
}
export function removeMeal(plan,index){
 if(plan.meals.length<=1)throw Error('Mantenha pelo menos uma refeição no plano.');
 if(!Number.isInteger(index)||!plan.meals[index])throw Error('Refeição não encontrada.');
 const item={config:plan.mealConfig.splice(index,1)[0],rows:plan.meals.splice(index,1)[0],index};return item;
}
export function restoreMeal(plan,item){
 if(plan.meals.length>=MAX_MEALS)throw Error('Remova outra refeição antes de desfazer.');
 if(plan.mealConfig.some(m=>m.id===item.config.id))throw Error('Esta refeição já foi restaurada.');
 const index=Math.min(item.index,plan.meals.length);plan.mealConfig.splice(index,0,item.config);plan.meals.splice(index,0,item.rows);return index;
}
