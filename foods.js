// Valores por 100 g. TACO 4ª edição (2011); traços tratados como zero.
const rows=[
 ['rice','Arroz branco','c',358,7.2,78.8,.3,180,'Cru / seco','TACO #4'],
 ['brownrice','Arroz integral','c',360,7.3,77.5,1.9,180,'Cru / seco','TACO #2'],
 ['oats','Aveia em flocos','c',394,13.9,66.6,8.5,120,'Crua / seca','TACO #7'],
 ['chicken','Peito de frango','p',119,21.5,0,3,300,'Cru, sem pele e sem osso','TACO #409'],
 ['beans','Feijão carioca','c',329,20,61.2,1.3,140,'Cru / seco','TACO #562'],
 ['chickpeas','Grão-de-bico','c',355,21.2,57.9,5.4,140,'Cru / seco','TACO #575'],
 ['banana','Banana nanica','fruit',92,1.4,23.8,.1,300,'Crua, sem casca','TACO #179'],
 ['pineapple','Abacaxi','fruit',48,.9,12.3,.1,350,'Cru, parte comestível','TACO #164'],
 ['avocado','Abacate','f',96,1.2,6,8.4,250,'Cru, sem casca e caroço','TACO #163'],
 ['peanuts','Amendoim','f',544,27.2,20.3,43.9,60,'Grão cru, sem casca','TACO #557'],
 ['egg','Ovo inteiro','p',143,13,1.6,8.9,200,'Cru, pesado sem casca','TACO #489'],
 ['oil','Azeite de oliva','f',884,0,0,100,35,'Como vendido, pesar em gramas','TACO #260'],
 ['plantprotein','Proteína vegetal em pó','p',380,75,10,4.4,60,'Pó seco; confirmar rótulo sem lactose','Exemplo de rótulo: editar antes de usar']
];
export const foods=rows.map(([id,name,group,kcal,p,c,f,max,basis,source])=>({id,name,group,kcal,p,c,f,max,basis,source}));

