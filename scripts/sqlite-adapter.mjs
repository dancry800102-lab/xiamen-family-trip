import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
export function database(path=':memory:'){
 const db=new DatabaseSync(path);
 if(!db.prepare("SELECT name FROM sqlite_master WHERE name='expenses'").get())db.exec(readFileSync(new URL('../drizzle/0000_expenses.sql',import.meta.url),'utf8'));
 if(!db.prepare('PRAGMA table_info(expenses)').all().some(c=>c.name==='currency'))db.exec(readFileSync(new URL('../drizzle/0001_currency.sql',import.meta.url),'utf8'));
 return {raw:db,prepare(sql){let values=[];return {bind(...args){values=args;return this;},async all(){return {results:db.prepare(sql).all(...values)};},async first(){return db.prepare(sql).get(...values)||null;},async run(){const r=db.prepare(sql).run(...values);return {meta:{last_row_id:Number(r.lastInsertRowid),changes:r.changes}};}};}};
}
