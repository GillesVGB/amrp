/* Shared content validation and public views. Preview content stays in this browser. */
(()=>{'use strict';
 const types={server:'Serverupdate',apv:'APV-wijziging'},teams={staff:'Staffteam',politie:'Politie',ambulance:'Ambulance',overig:'Overige teams'};
 const text=(value,max,label,required=false)=>{const result=String(value??'').trim();if(result.length>max||required&&!result)throw Error(label+' is verplicht en mag maximaal '+max+' tekens bevatten.');return result;};
 function date(value,optional=false){const v=String(value||'');if(optional&&!v)return '';if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error('Vul een geldige datum in.');return v;}
 function url(value){if(!value)return '';let u;try{u=new URL(value);}catch{throw Error('Vul een geldige sollicitatielink in.');}if(u.protocol!=='https:'||u.username||u.password)throw Error('Gebruik een HTTPS-sollicitatielink zonder inloggegevens.');return u.href;}
 function validate(value){
  if(!value)return {updates:[],vacancies:[]};const result={};
  for(const key of ['updates','vacancies']){
   if(!Array.isArray(value[key])||value[key].length>100)throw Error('Gebruik maximaal 100 '+(key==='updates'?'updates':'vacatures')+'.');
   const ids=new Set();result[key]=value[key].map(item=>{
    if(!item||typeof item!=='object'||!/^[a-zA-Z0-9_-]{1,80}$/.test(item.id)||ids.has(item.id))throw Error('Een bericht heeft een ongeldig of dubbel ID.');ids.add(item.id);
    const base={id:item.id,title:text(item.title,120,'De titel',true),summary:text(item.summary,350,'De samenvatting'),published:item.published===true};
    if(key==='updates'){
     if(!types[item.type])throw Error('Kies Serverupdate of APV-wijziging.');
     const articleIds=item.articleIds||[],known=new Set((window.AMRP_REGULATIONS_DATA?.rules||[]).map(r=>r.id));
     if(!Array.isArray(articleIds)||articleIds.length>65||articleIds.some(id=>!known.has(id)))throw Error('Kies bestaande APV-artikelen.');
     return {...base,type:item.type,date:date(item.date),body:text(item.body,8000,'De update',base.published),articleIds:[...new Set(articleIds)]};
    }
    if(!teams[item.team]||!['open','closed'].includes(item.status))throw Error('Kies een geldig team en een vacaturestatus.');
    const applyUrl=url(text(item.applyUrl,1500,'De sollicitatielink')),slots=Number(item.slots);
    if(!Number.isInteger(slots)||slots<1||slots>99)throw Error('Het aantal plekken moet tussen 1 en 99 liggen.');
    if(base.published&&item.status==='open'&&!applyUrl)throw Error('Voeg een sollicitatielink toe voordat je een open vacature publiceert.');
    return {...base,team:item.team,status:item.status,slots,deadline:date(item.deadline,true),description:text(item.description,8000,'De vacaturetekst',base.published),requirements:text(item.requirements,3000,'De vereisten'),applyUrl};
   });
  }return result;
 }
 const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Amsterdam'}).format(new Date());
 const isOpen=item=>item.status==='open'&&(!item.deadline||item.deadline>=today());
 const formatDate=value=>new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Amsterdam'}).format(new Date(value+'T12:00:00Z'));
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 window.AMRP_CONTENT={validate,types,teams,today,isOpen,formatDate,escape};
 function start(){
  const manager=window.AMRP_PREVIEW,page=location.pathname.replace(/\/$/,'');if(!manager||!['/updates','/vacatures'].includes(page))return;
  const jobs=page==='/vacatures';document.documentElement.setAttribute('data-amrp-community','');document.title=(jobs?'Vacatures':'Updates')+' | Amsterdam Roleplay';
  const host=document.createElement('main');host.id='amrp-community';host.tabIndex=-1;
  host.innerHTML=`<div class="amrp-community-wrap"><header class="amrp-community-hero"><div><p class="amrp-community-eyebrow">AMSTERDAM ROLEPLAY · ${jobs?'BOUW MEE AAN DE STAD':'NIEUWS & ONTWIKKELING'}</p><h1>${jobs?'Jouw volgende<br><em>rol in de stad.</em>':'De stad blijft<br><em>in beweging.</em>'}</h1><p>${jobs?'Maak het verschil binnen ons staffteam of de hulpdiensten. Ontdek waar jouw talenten passen.':'Alle serverupdates en wijzigingen in onze regelgeving, overzichtelijk op één plek.'}</p></div><div class="amrp-community-emblem" aria-hidden="true"><img src="/assets/img/logo-t.png" width="142" height="142" alt=""><span>${jobs?'SAMEN MAKEN WE AMSTERDAM':'JOUW STAD. JOUW VERHAAL.'}</span></div></header><div class="amrp-community-stats" id="community-stats"></div><div class="amrp-community-heading"><div><p class="amrp-community-eyebrow">${jobs?'EEN PLEK VOOR JOU':'WAT IS ER NIEUW?'}</p><h2>${jobs?'Ontdek de mogelijkheden':'Het laatste uit Amsterdam'}</h2></div><span id="community-count" role="status" aria-live="polite"></span></div><form class="amrp-community-filters" role="search"><label><span class="sr-only">${jobs?'Zoek een vacature':'Zoek een update'}</span><input id="community-search" type="search" placeholder="${jobs?'Zoek op functie, team of trefwoord…':'Zoek op titel, update of artikel…'}" autocomplete="off"></label><label><span class="sr-only">${jobs?'Filter op team':'Filter op soort update'}</span><select id="community-filter"><option value="all">${jobs?'Alle teams':'Alle updates'}</option>${Object.entries(jobs?teams:types).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label>${jobs?'<label class="amrp-open-filter"><input id="community-open-only" type="checkbox" checked>Alleen open vacatures</label>':''}</form><div id="community-list" class="amrp-community-list"></div><section id="community-empty" class="amrp-community-empty" hidden><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="9" y="12" width="30" height="28" rx="4"/><path d="M17 12V8h14v4M17 23h14M17 30h9"/></svg><h3></h3><p></p><button type="button" class="amrp-community-button" id="community-clear" hidden>Filters wissen</button></section><aside class="amrp-community-help"><div><h2>${jobs?'Samen bouwen aan goede roleplay.':'Blijf verbonden met de stad.'}</h2><p>${jobs?'Lees voor je solliciteert de APV en de vereisten van de functie. Vragen? Ons team helpt je via Discord.':'Bespreek updates met de community. De actuele regelgeving vind je altijd op de APV-pagina.'}</p></div><a href="/regels#apv">Bekijk de APV <span aria-hidden="true">↗</span></a><a data-amrp-discord href="https://discord.gg/tGqZBUYmZu" target="_blank" rel="noopener noreferrer">Naar Discord <span aria-hidden="true">↗</span></a></aside><footer class="amrp-community-footer">© ${new Date().getFullYear()} Amsterdam Roleplay <span>Samen maken we de stad.</span></footer></div>`;
  document.body.append(host);const $=id=>document.getElementById('community-'+id);
  $('search').form.addEventListener('submit',e=>e.preventDefault());
  function render(){
   const all=manager.read().content[jobs?'vacancies':'updates'].filter(item=>item.published),query=$('search').value.trim().toLocaleLowerCase('nl'),filter=$('filter').value;
   let items=all.filter(item=>(filter==='all'||(jobs?item.team:item.type)===filter)&&(!jobs||!$('open-only').checked||isOpen(item)));
   items=items.filter(item=>([item.title,item.summary,jobs?item.description:item.body,jobs?teams[item.team]:types[item.type],...(item.articleIds||[]).map(id=>window.AMRP_REGULATIONS_DATA.rules.find(r=>r.id===id)?.title||id)].join(' ').toLocaleLowerCase('nl').includes(query)));
   items.sort(jobs?(a,b)=>Number(isOpen(b))-Number(isOpen(a))||a.title.localeCompare(b.title,'nl'):(a,b)=>b.date.localeCompare(a.date)||a.title.localeCompare(b.title,'nl'));
   $('count').textContent=items.length+' '+(jobs?'vacatures':'updates');
   const counts=jobs?[[all.filter(isOpen).length,'Open vacatures'],[all.filter(isOpen).reduce((n,j)=>n+j.slots,0),'Beschikbare plekken'],[new Set(all.filter(isOpen).map(j=>j.team)).size,'Teams zoeken versterking']]:[[all.length,'Gepubliceerde updates'],[all.filter(i=>i.type==='server').length,'Serverupdates'],[all.filter(i=>i.type==='apv').length,'APV-wijzigingen']];
   $('stats').innerHTML=counts.map(([n,label])=>`<div><strong>${n}</strong><span>${label}</span></div>`).join('');
   $('list').replaceChildren();
   for(const item of items){
    const article=document.createElement('article');article.className='amrp-community-card';article.id=item.id;
    const state=jobs?isOpen(item):true;
    article.innerHTML=`<details><summary><span class="amrp-community-card-meta"><span class="amrp-community-tag">${escape(jobs?teams[item.team]:types[item.type])}</span>${jobs?`<span class="amrp-vacancy-state" data-open="${state}">${state?'Open':'Gesloten'}</span>`:`<time datetime="${item.date}">${formatDate(item.date)}</time>`}</span><span class="amrp-community-card-title"><strong>${escape(item.title)}</strong><span aria-hidden="true">↗</span></span><span class="amrp-community-excerpt">${escape(item.summary||(jobs?item.description:item.body).slice(0,180))}</span><span class="amrp-community-card-bottom">${jobs?`${item.slots} ${item.slots===1?'plek':'plekken'}${item.deadline?' · Sluit '+formatDate(item.deadline):' · Geen vaste sluitingsdatum'}`:'Lees de update'}<span aria-hidden="true">+</span></span></summary><div class="amrp-community-card-body"></div></details>`;
    const body=article.querySelector('.amrp-community-card-body'),p=document.createElement('p');p.textContent=jobs?item.description:item.body;body.append(p);
    if(jobs&&item.requirements){const h=document.createElement('h3');h.textContent='Wat we van je vragen';const list=document.createElement('ul');for(const line of item.requirements.split('\n').filter(l=>l.trim())){const li=document.createElement('li');li.textContent=line.replace(/^[-•]\s*/,'');list.append(li);}body.append(h,list);}
    if(!jobs&&item.articleIds.length){const h=document.createElement('h3');h.textContent='Betrokken APV-artikelen';body.append(h);const links=document.createElement('div');links.className='amrp-community-article-links';for(const id of item.articleIds){const rule=window.AMRP_REGULATIONS_DATA.rules.find(r=>r.id===id),a=document.createElement('a');a.href='/regels#'+id;a.textContent=rule?(rule.num||id.replace('artikel-',''))+' · '+rule.title:id;links.append(a);}body.append(links);}
    const actions=document.createElement('div');actions.className='amrp-community-actions';
    if(jobs&&state){const a=document.createElement('a');a.className='amrp-community-button';a.href=item.applyUrl;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Solliciteren ↗';actions.append(a);}else if(jobs){const closed=document.createElement('p');closed.textContent='Solliciteren op deze vacature is gesloten.';actions.append(closed);}
    const link=document.createElement('a');link.href=page+'#'+item.id;link.textContent='Directe link';link.className='amrp-community-permalink';actions.append(link);body.append(actions);$('list').append(article);
   }
   const empty=!items.length;$('empty').hidden=!empty;
   if(empty){$('empty').querySelector('h3').textContent=all.length?(jobs?'Geen passende vacatures':'Geen updates gevonden'):(jobs?'Er zijn nog geen vacatures geplaatst':'De eerste update volgt binnenkort');$('empty').querySelector('p').textContent=all.length?'Pas je zoekopdracht of filters aan.':jobs?'Zodra een team versterking zoekt, vind je de vacature en sollicitatie-informatie hier.':'Nieuwe serverupdates en APV-wijzigingen verschijnen hier zodra ze zijn gepubliceerd.';$('clear').hidden=!all.length;}
   openHash();
  }
  function openHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const target=document.getElementById(id);if(target&&$('list').contains(target))target.querySelector('details').open=true;}
  $('search').addEventListener('input',render);$('filter').addEventListener('change',render);$('open-only')?.addEventListener('change',render);$('clear').addEventListener('click',()=>{$('search').value='';$('filter').value='all';if(jobs)$('open-only').checked=false;render();$('search').focus();});
  window.addEventListener('hashchange',()=>{openHash();document.getElementById(location.hash.slice(1))?.scrollIntoView({block:'start'});});manager.subscribe(render);render();
 }
 if(window.AMRP_PREVIEW)start();else document.addEventListener('DOMContentLoaded',start,{once:true});
})();
