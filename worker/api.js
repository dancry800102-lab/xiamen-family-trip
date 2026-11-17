import {members} from '../src/ledger-core.js';
const names=members.map(m=>m.name);
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
async function handleApiInternal(request,env){
  if(new URL(request.url).pathname!=='/api/expenses')return json({error:'找不到此功能。'},404);
  if(request.method==='GET'){
    const {results}=await env.DB.prepare('SELECT id,title,cents,payer,mode,participants,currency,settled,created_at AS createdAt FROM expenses WHERE deleted_at IS NULL ORDER BY id DESC').all();
    return json(results.map(r=>({...r,participants:JSON.parse(r.participants)})));
  }
  if(!['POST','DELETE','PATCH'].includes(request.method))return json({error:'不支援此操作。'},405);
  const origin=request.headers.get('Origin');
  if(origin&&origin!==new URL(request.url).origin&&origin!=='https://dancry800102-lab.github.io')return json({error:'請從旅遊網站操作。'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'資料格式不正確。'},415);
  let body;try{body=await request.json();}catch{return json({error:'資料格式不正確。'},400);}
  if(!body||typeof body!=='object')return json({error:'資料格式不正確。'},400);
  if(request.method==='PATCH'){
    if(!Number.isSafeInteger(body.id)||body.id<=0||typeof body.settled!=='boolean')return json({error:'狀態不正確。'},400);
    const result=await env.DB.prepare('UPDATE expenses SET settled = ? WHERE id = ? AND deleted_at IS NULL').bind(body.settled?1:0,body.id).run();
    if(!result.meta.changes)return json({error:'帳目不存在。'},404);
    return json({ok:true});
  }
  if(request.method==='DELETE'){
    if(!Number.isSafeInteger(body.id)||body.id<=0)return json({error:'帳目編號不正確。'},400);
    await env.DB.prepare('UPDATE expenses SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL').bind(body.id).run();
    return json({ok:true});
  }
  const {title,cents,payer,mode,requestId}=body;
  const currency=body.currency??'TWD';
  if(!['TWD','CNY'].includes(currency))return json({error:'請選擇新台幣或人民幣。'},400);
  if(typeof title!=='string'||!title.trim()||title.trim().length>80||!Number.isSafeInteger(cents)||cents<=0||cents>1000000000||!names.includes(payer)||!['all','adults','custom'].includes(mode)||typeof requestId!=='string'||!/^[a-zA-Z0-9-]{16,64}$/.test(requestId))return json({error:'請填寫有效的項目、金額及付款人。'},400);
  let participants=mode==='all'?names:mode==='adults'?members.filter(m=>!m.age).map(m=>m.name):body.participants;
  if(!Array.isArray(participants)||!participants.length||participants.some(n=>!names.includes(n)))return json({error:'請至少選擇一位有效的分攤成員。'},400);
  participants=names.filter(n=>participants.includes(n));
  const values=[title.trim(),cents,payer,mode,JSON.stringify(participants),currency];
  await env.DB.prepare('INSERT INTO expenses (title,cents,payer,mode,participants,currency,request_id) VALUES (?,?,?,?,?,?,?) ON CONFLICT(request_id) DO NOTHING').bind(...values,requestId).run();
  const row=await env.DB.prepare('SELECT id,title,cents,payer,mode,participants,currency FROM expenses WHERE request_id = ?').bind(requestId).first();
  if([row.title,row.cents,row.payer,row.mode,row.participants,row.currency].some((v,i)=>v!==values[i]))return json({error:'重送的帳目內容不一致，請重新整理。'},409);
  return json({id:row.id},201);
}
export async function handleApi(request,env){
  const origin=request.headers.get('Origin');
  const allowed=origin==='https://dancry800102-lab.github.io';
  if(request.method==='OPTIONS'){
    if(!allowed)return json({error:'不支援此來源。'},403);
    return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, POST, PATCH, DELETE, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600','Vary':'Origin'}});
  }
  const response=await handleApiInternal(request,env);
  if(allowed){response.headers.set('Access-Control-Allow-Origin',origin);response.headers.set('Vary','Origin');}
  return response;
}
