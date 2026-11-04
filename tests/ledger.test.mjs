import {test} from 'node:test';import assert from 'node:assert/strict';
import {handleApi} from '../worker/api.js';import {members,shares,summarize} from '../src/ledger-core.js';import {database} from '../scripts/sqlite-adapter.mjs';
test('shared records, split modes, validation, retry and deletion',async()=>{
 const DB=database();const call=(method,body)=>handleApi(new Request('https://example.com/api/expenses',{method,headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined}),{DB});
 const base={title:'測試晚餐',cents:10000,payer:'李浚瑋',mode:'all',requestId:'11111111-1111-4111-8111-111111111111'};
 assert.equal((await call('POST',base)).status,201);assert.equal((await call('POST',base)).status,201);
 let rows=await (await call('GET')).json();assert.equal(rows.length,1);assert.equal(rows[0].participants.length,9);
 assert.equal(shares(10000,rows[0].participants).reduce((a,s)=>a+s.cents,0),10000);assert.equal(summarize(rows).reduce((a,r)=>a+r.net,0),0);
 const adults={...base,mode:'adults',requestId:'22222222-2222-4222-8222-222222222222'};await call('POST',adults);rows=await(await call('GET')).json();assert.equal(rows[0].participants.length,7);assert.ok(!rows[0].participants.includes('李知芮'));assert.ok(!rows[0].participants.includes('林新恩'));
 const single={...base,mode:'custom',participants:['林新恩'],requestId:'33333333-3333-4333-8333-333333333333'};await call('POST',single);rows=await(await call('GET')).json();assert.equal(summarize([rows[0]]).find(r=>r.name==='林新恩').share,10000);
 assert.equal((await call('POST',{...single,participants:[]})).status,400);assert.equal((await call('POST',{...single,participants:['陌生人']})).status,400);assert.equal((await call('POST',{...base,cents:1.5})).status,400);assert.equal((await call('POST',{...base,cents:-1})).status,400);assert.equal((await call('POST',{...base,title:'不同資料'})).status,409);
 assert.equal((await call('DELETE',{id:rows[0].id})).status,200);assert.equal((await(await call('GET')).json()).length,2);assert.equal(DB.raw.prepare('SELECT COUNT(*) AS n FROM expenses').get().n,3);
 assert.equal(members.filter(m=>m.age).length,2);DB.raw.close();
});
