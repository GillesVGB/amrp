/* Browser-local administration preview. No account or server settings are changed. */
(()=>{'use strict';
 const KEY='amrp-admin-preview-v1',names=['standard','halloween','christmas','easter'];
 const defaults={theme:{name:'standard',effects:true,motion:true,forceMotion:false},announcement:{override:false,enabled:true,text:'Amsterdam Roleplay wordt vernieuwd. Volg onze Discord voor de laatste updates.'},maintenance:{enabled:false,message:'We werken aan de stad. Binnenkort zijn we er weer. Volg onze Discord voor updates.'},links:{discord:'https://discord.gg/tGqZBUYmZu',join:'https://cfx.re/join/8emey4v'},content:{updates:[],vacancies:[]}};
 const clone=value=>JSON.parse(JSON.stringify(value));
 function validate(value){
  if(!value||typeof value!=='object')throw Error('Ongeldige instellingen.');
  const next=clone(defaults);
  if(value.theme){if(!names.includes(value.theme.name))throw Error('Kies een geldig thema.');next.theme={name:value.theme.name,effects:value.theme.effects!==false,motion:value.theme.motion!==false,forceMotion:value.theme.forceMotion===true};}
  if(value.announcement){next.announcement={override:value.announcement.override===true,enabled:value.announcement.enabled===true,text:String(value.announcement.text||'').trim()};if(next.announcement.text.length>500)throw Error('De mededeling mag maximaal 500 tekens bevatten.');if(next.announcement.enabled&&next.announcement.override&&!next.announcement.text)throw Error('Vul een mededeling in.');}
  if(value.maintenance){next.maintenance={enabled:value.maintenance.enabled===true,message:String(value.maintenance.message||'').trim()};if(next.maintenance.message.length>600)throw Error('Het onderhoudsbericht mag maximaal 600 tekens bevatten.');if(next.maintenance.enabled&&!next.maintenance.message)throw Error('Vul een onderhoudsbericht in.');}
  if(value.links){for(const field of ['discord','join']){let url;try{url=new URL(value.links[field]);}catch{throw Error('Vul een geldige '+field+'-link in.');}if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw Error('Gebruik een HTTPS-uitnodigingslink.');const valid=field==='discord'?((url.hostname==='discord.gg'&&/^\/[\w-]+\/?$/.test(url.pathname))||(url.hostname==='discord.com'&&/^\/invite\/[\w-]+\/?$/.test(url.pathname))):(url.hostname==='cfx.re'&&/^\/join\/[a-zA-Z0-9]+\/?$/.test(url.pathname));if(!valid)throw Error(field==='discord'?'Gebruik een Discord-uitnodigingslink.':'Gebruik een cfx.re/join-link.');next.links[field]=url.href;}}
  if(value.content)next.content=window.AMRP_CONTENT.validate(value.content);
  next.updatedAt=typeof value.updatedAt==='string'?value.updatedAt:null;
  return next;
 }
 let settings=clone(defaults),hasSaved=false;
 function read(){try{const raw=localStorage.getItem(KEY);hasSaved=!!raw;settings=raw?validate(JSON.parse(raw)):clone(defaults);}catch{hasSaved=false;settings=clone(defaults);}return clone(settings);}
 const listeners=new Set();
 function notify(){apply();listeners.forEach(fn=>fn(clone(settings)));}
 function save(value){const next=validate(value);next.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(next));settings=next;hasSaved=true;notify();return clone(next);}
 function reset(){localStorage.removeItem(KEY);settings=clone(defaults);hasSaved=false;notify();return clone(settings);}
 read();window.AMRP_PREVIEW={read:()=>clone(settings),save,reset,defaults:()=>clone(defaults),subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}};
 const admin=document.body.classList.contains('amrp-admin');
 const parameters=new URLSearchParams(location.search);
 const themeOverride=names.includes(parameters.get('previewTheme'))?parameters.get('previewTheme'):null;
 let decorations=null,maintenance=null,announcement=null,announcementOriginal=null,applying=false,lastTheme='';
 const originalLinks=new Map();
 const svg=(content,box='0 0 160 140')=>'<svg viewBox="'+box+'" fill="none" xmlns="http://www.w3.org/2000/svg">'+content+'</svg>';
 const art={
  bunny:svg('<ellipse cx="71" cy="40" rx="12" ry="34" transform="rotate(-16 71 40)" fill="#f3dfd9"/><ellipse cx="99" cy="38" rx="12" ry="34" transform="rotate(11 99 38)" fill="#f3dfd9"/><path d="M69 15c-7 6 1 38 6 43M100 12c7 6-2 35-5 43" stroke="#e3a8b5" stroke-width="6" stroke-linecap="round"/><ellipse cx="83" cy="103" rx="33" ry="32" fill="#f3dfd9"/><circle cx="82" cy="72" r="29" fill="#faece5"/><circle cx="72" cy="70" r="2.5" fill="#6b5361"/><circle cx="93" cy="70" r="2.5" fill="#6b5361"/><path d="m80 78 4 0-2 4-2-4Z" fill="#d99eac"/><path d="M74 85c4 4 12 4 16 0" stroke="#aa7d88" stroke-width="2" stroke-linecap="round"/><ellipse cx="62" cy="129" rx="17" ry="7" fill="#ead0ce"/><ellipse cx="105" cy="129" rx="17" ry="7" fill="#ead0ce"/><circle cx="119" cy="112" r="12" fill="#fff5ed"/>'),
  eggs:svg('<path d="M28 127c-31-6-20-59-3-78 20-21 60 65 34 77-9 4-20 3-31 1Z" fill="#b6a9df"/><path d="m13 92 15-6 12 10 13-5m-34 20 14-7 13 10 14-4" stroke="#f3e5d6" stroke-width="5"/><path d="M79 130c-32-4-18-71 2-82 25-13 48 68 28 80-8 5-20 4-30 2Z" fill="#e7a4b8"/><circle cx="83" cy="75" r="4" fill="#fff1d6"/><circle cx="103" cy="94" r="4" fill="#fff1d6"/><circle cx="78" cy="112" r="4" fill="#fff1d6"/><path d="M117 128c-20-9-5-48 10-58 19-12 34 42 22 55-7 7-21 8-32 3Z" fill="#a7d6bb"/><path d="m113 99 34 3m-37 12 39 3" stroke="#f6efd1" stroke-width="4"/>')
 };
 const artwork=name=>window.AMRP_SEASON_ART?.render(name)||art[name]||'';
 function renderDecorations(theme,effects,motion,forceMotion){
  const stamp=[theme,effects,motion,forceMotion].join(':');if(stamp===lastTheme)return;lastTheme=stamp;decorations?.remove();decorations=null;
  if(theme==='standard'||!effects)return;
  decorations=document.createElement('div');decorations.className='amrp-season-layer';decorations.setAttribute('aria-hidden','true');decorations.dataset.motion=String(motion);decorations.dataset.forceMotion=String(forceMotion);
  const add=(name,className)=>{const e=document.createElement('div');e.className=className;e.innerHTML=artwork(name);decorations.append(e);return e;};
  const pair=theme==='halloween'?['pumpkin','pumpkin']:theme==='christmas'?['tree','tree']:['eggs','bunny'];
  pair.forEach((name,index)=>add(name,'amrp-season-art '+(index?'right':'left')));
  if(theme==='christmas'){
   const lights=document.createElement('div');lights.className='amrp-christmas-lights';
   for(let i=0;i<18;i++){const bulb=document.createElement('span');bulb.style.setProperty('--bulb',i);lights.append(bulb);}decorations.append(lights);
   for(let i=0;i<3;i++)add('bauble','amrp-season-bauble').style.setProperty('--ornament',i);
   add('flight','amrp-santa-flight');
  }
  if(theme==='halloween'){
   add('moon','amrp-halloween-moon');add('web','amrp-halloween-web');
   add('ghost','amrp-halloween-flyby ghost');add('bat','amrp-halloween-flyby bat');
   for(let i=0;i<4;i++){const bat=add('bat','amrp-halloween-bat');bat.style.cssText='--bat:'+i+';--bat-delay:'+(-i*2.3)+'s';}
   const fog=document.createElement('div');fog.className='amrp-halloween-fog';decorations.append(fog);
  }
  const count=theme==='christmas'?42:12;
  for(let i=0;i<count;i++){
   const e=document.createElement('i');e.className='amrp-season-particle';
   e.style.cssText='--x:'+((i*43+13)%100)+'%;--delay:'+(-i*1.7)+'s;--duration:'+(14+i%13)+'s;--size:'+(theme==='christmas'?8+i%5*3:3+i%4)+'px;--drift:'+(-35+i%5*19)+'px';
   if(theme==='christmas')e.innerHTML=artwork('snowflake');decorations.append(e);
  }
  document.body.append(decorations);
 }
 function updateAnnouncement(){
  if(admin||applying)return;const bar=document.getElementById('arp-mededeling-bar');if(!bar)return;
  if(bar!==announcement){announcement=bar;observer.observe(bar,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden']});}
  if(!hasSaved||!settings.announcement.override){if(announcementOriginal){const original=announcementOriginal;announcementOriginal=null;bar.replaceChildren(...original.nodes.map(node=>node.cloneNode(true)));bar.hidden=original.hidden;}return;}
  if(!announcementOriginal)announcementOriginal={nodes:[...bar.childNodes].map(node=>node.cloneNode(true)),hidden:bar.hidden};
  applying=true;try{if(bar.hidden===settings.announcement.enabled)bar.hidden=!settings.announcement.enabled;if(bar.textContent!==settings.announcement.text)bar.textContent=settings.announcement.text;}finally{applying=false;}
 }
 function apply(){
  if(admin)return;
  const theme=themeOverride||settings.theme.name,effects=parameters.has('previewEffects')?parameters.get('previewEffects')!=='0':settings.theme.effects,motion=parameters.has('previewMotion')?parameters.get('previewMotion')!=='0':settings.theme.motion;
  const forceMotion=parameters.has('previewForceMotion')?parameters.get('previewForceMotion')==='1':settings.theme.forceMotion;
  document.documentElement.dataset.amrpSeason=theme;document.documentElement.dataset.amrpSeasonEffects=String(effects);renderDecorations(theme,effects,motion,forceMotion);
  const maintenanceOn=settings.maintenance.enabled&&hasSaved;document.documentElement.classList.toggle('amrp-maintenance-preview-on',maintenanceOn);
  if(maintenanceOn){if(!maintenance){maintenance=document.createElement('main');maintenance.className='amrp-preview-maintenance';maintenance.tabIndex=-1;maintenance.setAttribute('aria-labelledby','amrp-maintenance-heading');maintenance.innerHTML='<div><span class="amrp-maintenance-label">ONDERHOUD</span><h1 id="amrp-maintenance-heading">De stad wordt vernieuwd.</h1><p></p></div>';document.body.append(maintenance);maintenance.focus({preventScroll:true});}maintenance.querySelector('p').textContent=settings.maintenance.message;}else{maintenance?.remove();maintenance=null;}
  if(hasSaved){for(const a of document.querySelectorAll('a[href]')){if(!originalLinks.has(a)){const href=a.getAttribute('href');if(a.hasAttribute('data-amrp-discord')||href==='https://discord.gg/tGqZBUYmZu')originalLinks.set(a,{href,field:'discord'});else if(href==='https://cfx.re/join/8emey4v')originalLinks.set(a,{href,field:'join'});}const original=originalLinks.get(a);if(original&&a.href!==settings.links[original.field])a.href=settings.links[original.field];}}
  else {for(const[a,original]of originalLinks)if(a.isConnected)a.setAttribute('href',original.href);originalLinks.clear();}
  updateAnnouncement();
 }
 let frame=0;const schedule=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;apply();});};
 const observer=new MutationObserver(schedule);if(!admin){observer.observe(document.body,{childList:true});const root=document.getElementById('root');if(root)observer.observe(root,{childList:true,subtree:true});}
 window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null){read();notify();}});
 window.addEventListener('popstate',schedule);window.addEventListener('hashchange',schedule);apply();
})();
