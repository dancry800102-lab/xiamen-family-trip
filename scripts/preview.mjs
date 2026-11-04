import http from 'node:http';
import worker from '../dist/server/index.js';
import {database} from './sqlite-adapter.mjs';
const env={DB:database('.preview.sqlite')};
http.createServer(async(req,res)=>{try{const chunks=[];for await(const c of req)chunks.push(c);const response=await worker.fetch(new Request('http://127.0.0.1:4178'+req.url,{method:req.method,headers:req.headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)}),env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch(error){res.writeHead(500);res.end(String(error));}}).listen(4178,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4178'));
