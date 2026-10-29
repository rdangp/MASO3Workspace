import{readFileSync,existsSync}from'node:fs';
for(const f of ['public/index.html','public/assets/app.js','public/assets/realtime.js','public/assets/style.css','api/index.js']){if(!existsSync(f))throw Error('Missing required file: '+f);}
if(!readFileSync('public/index.html','utf8').includes('/assets/realtime.js'))throw Error('Realtime script not loaded');
console.log('MASO-3 Vercel package verified. Static assets are already built.');
