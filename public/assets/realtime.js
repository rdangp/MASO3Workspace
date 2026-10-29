/* MASO3 Blob edition: polling in the main app remains enabled.
   Intercept original file upload endpoint to use signed client-side uploads. */
(()=>{'use strict';
 const original=window.fetch.bind(window);
 window.fetch=async (input,init)=>{
  const path=typeof input==='string'?input:input?.url||'';
  if(new URL(path,location.href).pathname==='/api/files/upload'&&init?.method==='POST'){
   const file=init.body;
   if(!(file instanceof Blob))return original(input,init);
   try{
    const meta=JSON.parse(decodeURIComponent(new Headers(init.headers).get('X-File-Meta')||''));
    const id=crypto.randomUUID();
    const {upload}=await import('https://esm.sh/@vercel/blob@2.3.0/client');
    await upload('maso3-files/'+id,file,{access:'private',handleUploadUrl:'/api/files/upload-token',clientPayload:JSON.stringify({...meta,size:file.size,type:file.type||'application/octet-stream'}),contentType:file.type||'application/octet-stream',multipart:true});
    return original('/api/files/upload-finish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
   }catch(e){return new Response(JSON.stringify({error:e.message||'File upload failed.'}),{status:502,headers:{'Content-Type':'application/json'}});}
  }
  return original(input,init);
 };
})();
