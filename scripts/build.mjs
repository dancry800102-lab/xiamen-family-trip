import {readFileSync,writeFileSync,mkdirSync,cpSync} from 'node:fs';
const files={'/':['index.html','text/html; charset=utf-8'],'/style.css':['style.css','text/css; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/ledger.js':['ledger.js','text/javascript; charset=utf-8'],'/ledger-core.js':['ledger-core.js','text/javascript; charset=utf-8']};
const assets=Object.fromEntries(Object.entries(files).map(([url,[file,type]])=>[url,{body:readFileSync('src/'+file,'utf8'),type}]));
const core=readFileSync('src/ledger-core.js','utf8').replaceAll('export ','');
const api=readFileSync('worker/api.js','utf8').replace(/import .*?;\r?\n/,'').replace('export async function','async function');
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
writeFileSync('dist/server/index.js',core+'\n'+api+'\nconst assets='+JSON.stringify(assets)+`;\nexport default {async fetch(request,env){try{const path=new URL(request.url).pathname;if(path.startsWith('/api/'))return await handleApi(request,env);const asset=assets[path];if(!asset)return new Response('Not found',{status:404});if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});return new Response(request.method==='HEAD'?null:asset.body,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});}catch(error){console.error('Request failed',error);return Response.json({error:'暫時無法讀寫帳目，請稍後重試。'},{status:503,headers:{'Cache-Control':'no-store'}});}}};\n`);
cpSync('.openai/hosting.json','dist/.openai/hosting.json');cpSync('drizzle','dist/.openai/drizzle',{recursive:true});
console.log('Built Worker with embedded site assets and D1 migration.');
