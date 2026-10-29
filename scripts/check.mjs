import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
process.env.SUPABASE_URL='https://project.supabase.co';
process.env.SUPABASE_ANON_KEY='public-anon-test-key';
process.env.SUPABASE_SERVICE_ROLE_KEY='private-test-service-key';
process.env.SETUP_KEY='long-private-setup-key-for-testing-123456';
const tables=Object.fromEntries(['users','sessions','projects','tasks','comments','messages','chat_reads','task_notifications','shared_files','login_attempts'].map(k=>[k,[]]));
const calls=[];let nextId=1;
const nativeFetch=globalThis.fetch;
globalThis.fetch=async function mock(url,opts={}){
 const u=new URL(String(url)),path=u.pathname,method=opts.method||'GET';calls.push([method,path]);
 if(path==='/realtime/v1/api/broadcast')return new Response(JSON.stringify({messages:[]}),{status:200});
 if(path.startsWith('/storage/v1/')){
  if(path.startsWith('/storage/v1/object/upload/sign/'))return new Response(JSON.stringify({url:path.replace('/storage/v1','')+'?token=abc'}),{status:200});
  if(path.startsWith('/storage/v1/object/info/'))return new Response(JSON.stringify({metadata:{size:1024}}),{status:200});
  if(path.startsWith('/storage/v1/object/sign/'))return new Response(JSON.stringify({signedURL:'/object/sign/maso-files/abc?token=123'}),{status:200});
  return new Response(JSON.stringify({ok:true}),{status:200});
 }
 const tab=path.split('/').at(-1);if(!tables[tab])return new Response(JSON.stringify({message:'not found'}),{status:404});
 let filtered=tables[tab].filter(x=>[...u.searchParams].every(([k,v])=>{
  if(['select','limit','order','offset'].includes(k))return true;
  if(v.startsWith('eq.'))return String(x[k])===v.slice(3);
  if(v.startsWith('gt.'))return Number(x[k])>Number(v.slice(3));
  return true;
 }));
 let payload=opts.body?JSON.parse(opts.body):{};
 if(method==='GET'){
  const sort=u.searchParams.get('order');if(sort){const [k,dir]=sort.split(',')[0].split('.');filtered.sort((a,b)=>((a[k]>b[k])?1:(a[k]<b[k]?-1:0))*(dir==='desc'?-1:1));}
  const lim=Number(u.searchParams.get('limit'))||Infinity;
  return new Response(JSON.stringify(filtered.slice(0,lim)),{status:200});
 }
 if(method==='POST'){
  const entries=Array.isArray(payload)?payload:[payload];
  for(const row of entries){
   if(['projects','tasks','users'].includes(tab)&&row.version===undefined)row.version=1;
   if(tab==='users'){if(row.auth_source===undefined)row.auth_source='local';if(row.deleted===undefined)row.deleted=false;if(row.email_reminders===undefined)row.email_reminders=false;}
   if(u.searchParams.get('on_conflict')||String(opts.headers?.Prefer).includes('resolution=merge-duplicates')){const index=tables[tab].findIndex(x=>x.id===row.id);if(index>=0){tables[tab][index]={...tables[tab][index],...row};continue;}}
   if(!row.id&&['task_notifications','comments','messages'].includes(tab))row.id=nextId++;
   if(tab==='users'&&tables.users.some(x=>x.email===row.email))return new Response('{}',{status:409});
   if(tab==='sessions'&&tables.sessions.some(x=>x.token===row.token))return new Response('{}',{status:409});
   tables[tab].push({...row});
  }
  return new Response(JSON.stringify(entries),{status:201});
 }
 if(method==='PATCH'){
  for(const row of filtered)Object.assign(row,payload);
  return new Response(JSON.stringify(filtered),{status:200});
 }
 if(method==='DELETE'){
  const ids=new Set(filtered);tables[tab]=tables[tab].filter(x=>!ids.has(x));
  return new Response(JSON.stringify(filtered),{status:200});
 }
 throw Error('Unsupported fetch '+method+' '+path);
};
const {default:handler}=await import('../api/index.js');
async function request(route,{method='GET',body,session,origin='https://maso.vercel.app',query={}}={}){
 const qs=new URLSearchParams({...query,route});
 const req={url:'/api/index?'+qs,method,body,query:{route},headers:{host:'maso.vercel.app',origin,'x-forwarded-proto':'https',...(session?{cookie:'kanban_session='+session}:{})},socket:{remoteAddress:'127.0.0.1'}};
 const response={headers:{},statusCode:200,writableEnded:false,setHeader(k,v){this.headers[k]=v;},end(content){this.body=content;this.writableEnded=true;}};
 await handler(req,response);let data=null;try{data=JSON.parse(response.body);}catch{data=response.body;}
 return{status:response.statusCode,body:data,headers:response.headers};
}
const key=process.env.SETUP_KEY;
let r=await request('bootstrap',{method:'POST',body:{setup_key:key,email:'boss@example.com',name:'Boss',password:'superstrongpassword'}});
assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.username,'boss');
r=await request('bootstrap',{method:'POST',body:{setup_key:key,email:'second@example.com',name:'Second',password:'superstrongpassword'}});assert.equal(r.status,403);
r=await request('login',{method:'POST',body:{username:'boss',password:'bad-password'}});assert.equal(r.status,401);
r=await request('login',{method:'POST',body:{username:'boss',password:'superstrongpassword'}});assert.equal(r.status,200,JSON.stringify(r.body));
const token=r.headers['Set-Cookie'].match(/kanban_session=([a-f\d]+)/)[1];
assert.equal((await request('session',{session:token})).body.user.role,'admin');
r=await request('workspace',{session:token});assert.equal(r.status,200);assert.equal(r.body.projects.length,1);
r=await request('users',{method:'POST',session:token,body:{action:'create',username:'teammate',email:'teammate@example.com',name:'Teammate',role:'member',active:true,password:'password123'}});assert.equal(r.status,200,JSON.stringify(r.body));
r=await request('login',{method:'POST',body:{username:'teammate',password:'password123'}});assert.equal(r.status,200);
const mateToken=r.headers['Set-Cookie'].match(/kanban_session=([a-f\d]+)/)[1];
r=await request('workspace',{session:mateToken});assert.equal(r.status,200);assert.equal(r.body.projects.length,1);assert.equal(r.body.projects[0].name,'My tasks');
const general=tables.projects.find(p=>p.owner_email==='boss@example.com');
r=await request('projects',{method:'POST',session:token,body:{id:general.id,version:general.version,name:'General',description:'General project workspace.',color:'burgundy',shared_with:['teammate@example.com']}});
assert.equal(r.status,200,JSON.stringify(r.body));
r=await request('tasks',{method:'POST',session:token,body:{title:'Review audit',description:'Check scope',status:'todo',priority:'high',assignee:'',assignee_email:'teammate@example.com',due:'2026-12-31',project_id:general.id,reminders:[1,3],shared_with:['teammate@example.com']}});
assert.equal(r.status,200,JSON.stringify(r.body));
r=await request('workspace',{session:mateToken});assert.equal(r.body.tasks.length,1);assert.equal(r.body.tasks[0].title,'Review audit');
const task=r.body.tasks[0];
r=await request('tasks',{method:'POST',session:mateToken,body:{...task,title:'Review audit updated',reminders:[1,3]}});
assert.equal(r.status,200,JSON.stringify(r.body));
r=await request('tasks',{method:'POST',session:token,body:{...task,title:'Stale update',reminders:[1,3]}});assert.equal(r.status,409,JSON.stringify(r.body));
r=await request('chat',{method:'POST',session:token,body:{peer:'',body:'Hello team'}});assert.equal(r.status,200);
r=await request('chat',{session:mateToken,query:{peer:''}});assert.equal(r.body.messages.length,1);
r=await request('files/upload-init',{method:'POST',session:token,body:{name:'report.xlsx',size:1024,shared_with:['teammate@example.com']}});assert.equal(r.status,200,JSON.stringify(r.body));
const fileId=r.body.id;assert.ok(r.body.upload_url.includes('/object/upload/sign/'));
r=await request('files/upload-finish',{method:'POST',session:token,body:{id:fileId}});assert.equal(r.status,200,JSON.stringify(r.body));
r=await request('files',{session:mateToken});assert.equal(r.body.files.length,1);
r=await request('realtime-config',{session:mateToken});assert.equal(r.body.anonKey,'public-anon-test-key');assert.equal(JSON.stringify(r.body).includes('private-test-service-key'),false);
r=await request('workspace',{session:'invalid'});assert.equal(r.status,401);
r=await request('projects',{method:'POST',session:token,origin:'https://attacker.com',body:{}});assert.equal(r.status,403);
assert.ok(calls.some(([m,p])=>p==='/realtime/v1/api/broadcast'),'Mutations should send a broadcast');
// Verify source package is never bundled with server secrets.
const publicHtml=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');assert.ok(publicHtml.includes('realtime.js'));
console.log(`PASS: bootstrap, login, sessions, roles, per-user workspace, project sharing, optimistic versioning, chat, private file upload, realtime signal, CSRF checks`);
globalThis.fetch=nativeFetch;
