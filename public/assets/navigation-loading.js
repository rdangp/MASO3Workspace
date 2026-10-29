(()=>{'use strict';
const fromTimeline=()=>{try{return sessionStorage.getItem('maso:return-workspace')==='1'}catch{return false}};
if(location.pathname==='/'||location.pathname==='/index.html'){
  if(fromTimeline())document.documentElement.classList.add('maso-restoring-workspace');
  function hide(){document.documentElement.classList.remove('maso-restoring-workspace');try{sessionStorage.removeItem('maso:return-workspace')}catch{}}
  // Only hide when an authenticated workspace appears, not while login is still shown.
  function inspect(){const root=document.getElementById('root');if(!root)return;const sidebar=root.querySelector('.sidebar');if(sidebar&&sidebar.querySelector('nav'))hide();}
  new MutationObserver(inspect).observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inspect);else inspect();
  // Fail open on connectivity problems, leaving login or error UI accessible.
  setTimeout(hide,12000);
}
const timeline=location.pathname==='/timeline.html';
if(timeline){document.addEventListener('click',e=>{const link=e.target.closest('a[href]');if(!link)return;const url=new URL(link.href,location.href);if(url.origin===location.origin&&(url.pathname==='/'||url.pathname==='/index.html')){try{sessionStorage.setItem('maso:return-workspace','1')}catch{}}});}
// A subtle progress bar for slow API requests. Avoid showing for frequent polling under 350ms.
let pending=0,shown=false,delay=null;
const show=()=>{if(!pending||shown)return;shown=true;document.documentElement.classList.add('maso-api-busy')};
const begin=()=>{pending++;if(pending===1)delay=setTimeout(show,350)};
const end=()=>{pending=Math.max(0,pending-1);if(!pending){clearTimeout(delay);shown=false;document.documentElement.classList.remove('maso-api-busy')}};
const originalFetch=window.fetch;
window.fetch=function(input,init){let url='';try{url=new URL(typeof input==='string'?input:input.url,location.href);url=url.pathname}catch{}if(!url.startsWith('/api/'))return originalFetch.apply(this,arguments);begin();try{return Promise.resolve(originalFetch.apply(this,arguments)).finally(end)}catch(e){end();throw e}};
})();