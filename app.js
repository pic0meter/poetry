let poems=[];let selected=null;const list=document.querySelector('#list'),content=document.querySelector('#content'),search=document.querySelector('#search'),count=document.querySelector('#count'),sub=document.querySelector('#sub'),empty=document.querySelector('#empty'),reader=document.querySelector('#reader');
function date(s){let d=new Date(s);return isNaN(d)?s:d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}function esc(s){return s.replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))}
function parse(md,file){let m=md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);let meta={};let body=md;if(m){m[1].split('\n').forEach(x=>{let i=x.indexOf(':');if(i>-1)meta[x.slice(0,i).trim()]=x.slice(i+1).trim()});body=m[2]}return{id:file,title:meta.title||file.replace(/\.md$/,'').replace(/[-_]/g,' '),date:meta.date||'',body:body.trim()}}

async function load(){
  // Construct absolute URL based on site base path
  let basePath = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
  let indexUrl = location.origin + basePath + 'poems/index.json';
  
  let r = await fetch(indexUrl, {cache:'no-store'});
  if(!r.ok) throw Error('No poem index');
  let files = await r.json();
  
  poems = await Promise.all(files.map(async f => {
    let poemUrl = location.origin + basePath + 'poems/' + f;
    let res = await fetch(poemUrl, {cache:'no-store'});
    if(!res.ok) throw Error('Failed to fetch ' + f);
    return parse(await res.text(), f);
  }));
  
  poems.sort((a,b) => new Date(b.date) - new Date(a.date));
  
  // Auto-open if URL has hash (e.g. #poem1.md)
  let hash = location.hash.replace('#','');
  if(hash) selected = hash;
  
  render();
  if(selected) open(selected);
}

function render(){let q=search.value.toLowerCase().trim();let arr=poems.filter(p=>(p.title+' '+p.body).toLowerCase().includes(q));count.textContent=arr.length;sub.textContent=arr.length+' '+(arr.length===1?'poem':'poems');list.innerHTML=arr.map(p=>`<div class="note ${selected===p.id?'selected':''}" data-id="${esc(p.id)}"><div class="title">${esc(p.title)}</div><div class="preview">${esc(p.body.replace(/\s+/g,' ').slice(0,150))}</div><div class="date">${esc(date(p.date))}</div></div>`).join('');empty.classList.toggle('hidden',arr.length>0);document.querySelectorAll('.note').forEach(n=>n.onclick=()=>open(n.dataset.id))}

function open(id){
  selected=id;
  location.hash = id;
  let p=poems.find(x=>x.id===id);
  if(!p)return;
  content.innerHTML=`<h1>${esc(p.title)}</h1><div class="meta">${esc(date(p.date))}</div><div class="poem">${esc(p.body)}</div><section class="comments"><h2>Thoughts</h2><p>Leave a thought about this poem.</p><div class="giscus"></div></section>`;
  reader.classList.add('open');
  render();
  
  if(window.GISCUS_REPO_ID&&window.GISCUS_CATEGORY_ID){
    let s=document.createElement('script');
    s.src='https://giscus.app/client.js';
    s.async=true;
    s.crossOrigin='anonymous';
    s.setAttribute('data-repo',window.GISCUS_REPO);
    s.setAttribute('data-repo-id',window.GISCUS_REPO_ID);
    s.setAttribute('data-category',window.GISCUS_CATEGORY);
    s.setAttribute('data-category-id',window.GISCUS_CATEGORY_ID);
    s.setAttribute('data-mapping','specific');
    s.setAttribute('data-term',location.origin+location.pathname+'#'+id);
    s.setAttribute('data-strict','0');
    s.setAttribute('data-reactions-enabled','1');
    s.setAttribute('data-emit-metadata','0');
    s.setAttribute('data-input-position','bottom');
    s.setAttribute('data-theme','light');
    s.setAttribute('data-lang','en');
    content.querySelector('.giscus').appendChild(s)
  }
}

document.querySelector('#back').onclick=()=>{
  reader.classList.remove('open');
  selected=null;
  history.replaceState(null, null, ' ');
  render();
};

search.oninput=render;
document.querySelector('#menu').onclick=()=>document.querySelector('#drawer').classList.add('open');
document.querySelector('#close').onclick=()=>document.querySelector('#drawer').classList.remove('open');

window.GISCUS_REPO='YOUR_GITHUB_USERNAME/YOUR_REPO';
window.GISCUS_REPO_ID='';
window.GISCUS_CATEGORY='Comments';
window.GISCUS_CATEGORY_ID='';

load().catch((err)=>{
  console.error(err);
  list.innerHTML='<div class="empty"><h2>Poems could not be loaded</h2><p>Check console for errors.</p></div>';
});
