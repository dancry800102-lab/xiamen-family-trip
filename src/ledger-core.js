export const members = [
  {name:'李浚瑋',english:'LEE,CHUN-WEI'},{name:'陸羽橙',english:'LU,YU-CHENG'},{name:'李知芮',english:'LI,ZHI-RUI',age:3},{name:'陸文庭',english:'LU,WEN-TING'},
  {name:'蘇惠燕',english:'SU,HUI-YEN'},{name:'林中立',english:'LIN,CHUNG-LI'},{name:'蘇紀菱',english:'SU,CHI-LING'},{name:'陸筠洣',english:'LU,YUN-MI'},{name:'林新恩',english:'LIN,HSIN-EN',age:4}
];
export const label = m => m.name;
export function shares(cents,participants){
  const ordered=members.map(m=>m.name).filter(n=>participants.includes(n));
  if(!ordered.length) return [];
  return ordered.map((name,i)=>({name,cents:Math.floor(cents/ordered.length)+(i<cents%ordered.length?1:0)}));
}
export function summarize(expenses,currency='TWD'){
  const rows=members.map(m=>({...m,paid:0,share:0,net:0}));
  for(const e of expenses.filter(e=>!e.settled&&(e.currency??'TWD')===currency)){rows.find(r=>r.name===e.payer).paid+=e.cents;for(const s of shares(e.cents,e.participants))rows.find(r=>r.name===s.name).share+=s.cents;}
  return rows.map(r=>({...r,net:r.paid-r.share}));
}
