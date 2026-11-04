export const members = [
  {name:'李浚瑋'},{name:'陸羽橙'},{name:'李知芮',age:3},{name:'陸文庭'},
  {name:'蘇惠燕'},{name:'林中立'},{name:'蘇紀菱'},{name:'陸筠洣'},{name:'林新恩',age:4}
];
export const label = m => m.name+(m.age?`（${m.age}歲）`:'');
export function shares(cents,participants){
  const ordered=members.map(m=>m.name).filter(n=>participants.includes(n));
  if(!ordered.length) return [];
  return ordered.map((name,i)=>({name,cents:Math.floor(cents/ordered.length)+(i<cents%ordered.length?1:0)}));
}
export function summarize(expenses){
  const rows=members.map(m=>({...m,paid:0,share:0,net:0}));
  for(const e of expenses){rows.find(r=>r.name===e.payer).paid+=e.cents;for(const s of shares(e.cents,e.participants))rows.find(r=>r.name===s.name).share+=s.cents;}
  return rows.map(r=>({...r,net:r.paid-r.share}));
}
