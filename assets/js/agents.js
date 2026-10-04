/* Espace Agents — Police nationale du Gabon (démonstration). Toutes les données sont fictives. */
(function(){
'use strict';
const F=window.FPN, E=F.esc;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const DAY=864e5, STORE_KEY='fpn_demo_v1';
let me=null, cur=null, pollT=null;

/* ---------- Icônes ---------- */
const ICON={
 dashboard:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
 demandes:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
 alertes:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
 courante:'<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5z"/><path d="M8 7h8M8 11h8"/>',
 rh:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14.5a5 5 0 0 1 4.5 5"/>',
 moyens:'<path d="M5 17h14M3 13l2-6h14l2 6v4H3z"/><circle cx="7.5" cy="17" r="1.8"/><circle cx="16.5" cy="17" r="1.8"/>',
 ops:'<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/>',
 concours:'<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 22l5-3 5 3-1.5-8"/>',
 audit:'<path d="M9 3h6l1 2h3v16H5V5h3z"/><path d="M9 12h6M9 16h4"/>',
 more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
 back:'<path d="M15 5l-7 7 7 7"/>', exit:'<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
 plus:'<path d="M12 5v14M5 12h14"/>', dl:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
 search:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>', menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 print:'<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>', info:'<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>'
};
const ic=n=>'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">'+(ICON[n]||'')+'</svg>';
const MODS={
 dashboard:{t:'Tableau de bord',s:'Accueil'}, demandes:{t:'Demandes citoyennes',s:'Demandes'}, alertes:{t:'Alertes 177',s:'Alertes'},
 courante:{t:'Main courante',s:'Courante'}, rh:{t:'Ressources humaines',s:'RH'}, moyens:{t:'Moyens',s:'Moyens'},
 ops:{t:'Patrouilles & opérations',s:'Opérations'}, concours:{t:'Concours & recrutement',s:'Concours'}, audit:{t:'Journal d’audit',s:'Audit'}
};

/* ---------- Utilitaires ---------- */
const ago=t=>{const m=Math.round((Date.now()-t)/6e4);if(m<1)return 'à l’instant';if(m<60)return 'il y a '+m+' min';const h=Math.round(m/60);if(h<24)return 'il y a '+h+' h';const d=Math.round(h/24);return 'il y a '+d+' j'};
const comNom=id=>F.commissariat(id).nom;
const opts=(list,sel,empty)=>(empty!=null?'<option value="">'+E(empty)+'</option>':'')+list.map(o=>{const v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return '<option value="'+E(v)+'"'+(String(v)===String(sel)?' selected':'')+'>'+E(l)+'</option>'}).join('');
const comOpts=(sel,empty)=>opts(F.COMMISSARIATS.map(c=>[c.id,c.nom]),sel,empty);
const stBadge=k=>{const s=F.statut(k);return '<span class="bd '+s.c+'">'+E(s.l)+'</span>'};
const empty=(t,s)=>'<div class="empty"><div class="ei">'+ic('search')+'</div><b>'+E(t)+'</b><span>'+E(s||'')+'</span></div>';
const userName=()=>me?me.nom:'Agent';
const sess=()=>F.session()||me;

function toast(msg,type){const t=document.createElement('div');t.className='toast '+(type||'ok');t.textContent=msg;$('#toasts').appendChild(t);setTimeout(()=>{t.style.opacity='0';t.style.transition='.3s';setTimeout(()=>t.remove(),320)},3600)}
function csvDownload(name,rows){
  const body=rows.map(r=>r.map(c=>{c=String(c==null?'':c);return /[";\n\r]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c}).join(';')).join('\r\n');
  const blob=new Blob(['﻿'+body],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=name+'-'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
}
function beep(){try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;const c=new A(),o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=880;g.gain.value=.05;o.connect(g);g.connect(c.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.35);o.stop(c.currentTime+.4);setTimeout(()=>c.close&&c.close(),600)}catch(e){}}
/* Relit la base partagée (autres onglets) en mettant à jour l'objet en place */
function sync(){try{const raw=localStorage.getItem(STORE_KEY);if(!raw)return;const fresh=JSON.parse(raw),d=F.db();Object.keys(d).forEach(k=>delete d[k]);Object.assign(d,fresh);if(me&&!d.session)d.session=me}catch(e){}}
const save=()=>F.save();

/* ---------- Tiroir / modale / feuille ---------- */
let drawerCb=null,lastFocus=null;
function openDrawer(title,html,onClose){lastFocus=document.activeElement;drawerCb=onClose||null;$('#drawerTitle').textContent=title;$('#drawerBody').innerHTML=html;$('#drawer').classList.add('open');$('#drawer').setAttribute('aria-hidden','false');$('#scrim').classList.add('on');document.body.classList.add('lock');$('#drawerBody').scrollTop=0;setTimeout(()=>$('#drawerClose').focus(),60)}
function setDrawer(html){const b=$('#drawerBody');const y=b.scrollTop;b.innerHTML=html;b.scrollTop=y}
function drawerOpen(){return $('#drawer').classList.contains('open')}
function closeDrawer(){if(!drawerOpen())return;$('#drawer').classList.remove('open');$('#drawer').setAttribute('aria-hidden','true');$('#scrim').classList.remove('on');document.body.classList.remove('lock');const cb=drawerCb;drawerCb=null;if(cb)cb();if(lastFocus&&lastFocus.focus&&document.contains(lastFocus))try{lastFocus.focus()}catch(e){}}
function openModal(title,html,wide){$('#modalTitle').textContent=title;$('#modalBody').innerHTML=html;$('#modalCard').classList.toggle('wide',!!wide);$('#modal').classList.add('open');$('#modal').setAttribute('aria-hidden','false');document.body.classList.add('lock');setTimeout(()=>{const f=$('#modalBody input,#modalBody select,#modalBody textarea,#modalBody button');if(f)f.focus()},60)}
function closeModal(){$('#modal').classList.remove('open');$('#modal').setAttribute('aria-hidden','true');if(!drawerOpen())document.body.classList.remove('lock')}
function openSheet(){$('#sheet').classList.add('open');$('#sheet').setAttribute('aria-hidden','false')}
function closeSheet(){$('#sheet').classList.remove('open');$('#sheet').setAttribute('aria-hidden','true')}
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if($('#modal').classList.contains('open'))closeModal();else if(drawerOpen())closeDrawer();else closeSheet()});

function tlHTML(list){return '<ul class="tlist">'+list.map(t=>'<li'+(t.note?' class="n"':'')+'><b>'+E(t.text)+'</b><small>'+E(F.fmt(t.at))+(t.by?' · '+E(t.by):'')+(t.note?' · Réponse à l’usager':'')+'</small></li>').join('')+'</ul>'}

/* ======================================================================
   CONNEXION
   ====================================================================== */
const DEMO_LABEL={commandement:'Commandement',chef:'Chef de commissariat',agent:'Agent de terrain',rh:'Ressources humaines',admin:'Admin / audit'};
let pend=null;
function initLogin(){
  $('#demoBtns').innerHTML=F.COMPTES.map(c=>'<button type="button" class="demo-b" data-m="'+E(c.matricule)+'"><em>Entrer en un clic</em><b>'+E(DEMO_LABEL[c.role]||F.ROLES[c.role].l)+'</b><small>'+E(c.matricule)+' · '+E(c.nom)+'</small></button>').join('');
  $('#demoBtns').addEventListener('click',e=>{const b=e.target.closest('.demo-b');if(!b)return;quick(b.dataset.m)});
  $('#pwToggle').addEventListener('click',()=>{const i=$('#pwd'),s=i.type==='password';i.type=s?'text':'password';$('#pwToggle').textContent=s?'Masquer':'Afficher';$('#pwToggle').setAttribute('aria-label',s?'Masquer le mot de passe':'Afficher le mot de passe')});
  $('#f1').addEventListener('submit',e=>{
    e.preventDefault();const m=$('#mat').value.trim().toUpperCase(),p=$('#pwd').value;const er=$('#e1');
    const ok=F.COMPTES.some(c=>c.matricule===m)&&p===F.PASS;
    if(!m||!p){er.textContent='Renseignez votre matricule et votre mot de passe.';er.hidden=false;return}
    if(!ok){er.textContent='Matricule ou mot de passe incorrect.';er.hidden=false;return}
    er.hidden=true;pend={m,p};$('#f1').hidden=true;$('#f2').hidden=false;$('#code').value='';$('#code').focus();
  });
  $('#f2').addEventListener('submit',e=>{
    e.preventDefault();const er=$('#e2');const r=F.login(pend.m,pend.p,$('#code').value.trim());
    if(!r.ok){er.textContent=r.err;er.hidden=false;$('#code').select();return}
    er.hidden=true;enterApp();
  });
  $('#f2back').addEventListener('click',()=>{$('#f2').hidden=true;$('#f1').hidden=false;$('#pwd').value='';$('#mat').focus()});
}
function quick(mat){const r=F.login(mat,F.PASS,F.CODE2FA);if(r.ok)enterApp()}

/* ======================================================================
   COQUE
   ====================================================================== */
function mods(){return F.ROLES[me.role].mods}
function home(){return mods()[0]}
function enterApp(){
  me=F.session();if(!me)return;
  $('#login').hidden=true;$('#app').hidden=false;
  const lbl=F.ROLES[me.role].l;
  $('#sideUser').innerHTML='<b>'+E(me.nom)+'</b><span>'+E(me.grade)+' · '+E(lbl)+'</span>';
  $('#tbUser').innerHTML='<b>'+E(me.nom)+'</b>'+E(me.grade)+' · '+E(lbl);
  $$('[data-out]').forEach(b=>{b.innerHTML=ic('exit')+'<span>Sortir</span>'});
  $('.tb-site').innerHTML=ic('globe')+'<span class="lbl-site">Site</span>';
  $('#sideNav').innerHTML=mods().map(m=>'<a href="#/'+m+'" data-m="'+m+'">'+ic(m)+'<span>'+E(MODS[m].t)+'</span></a>').join('');
  buildBnav();
  $('#sheetList').innerHTML=mods().map(m=>'<a href="#/'+m+'" data-m="'+m+'">'+ic(m)+'<span>'+E(MODS[m].t)+'</span></a>').join('');
  if(!location.hash||!mods().includes(routeId()))location.hash='#/'+home();
  route();
  if(pollT)clearInterval(pollT);
  pollT=setInterval(()=>{sync();if(cur&&cur.poll)cur.poll()},5000);
}
function buildBnav(){
  const ms=mods();let main=ms,extra=[];
  if(ms.length>5){main=ms.slice(0,4);extra=ms.slice(4)}
  $('#bnav').innerHTML=main.map(m=>'<a href="#/'+m+'" data-m="'+m+'">'+ic(m)+'<span>'+E(MODS[m].s)+'</span></a>').join('')+(extra.length?'<button type="button" id="bnMore" aria-haspopup="dialog" data-extra="'+extra.join(',')+'">'+ic('more')+'<span>Plus</span></button>':'');
  const b=$('#bnMore');if(b)b.addEventListener('click',openSheet);
}
function routeId(){const m=(location.hash||'').match(/^#\/([a-z]+)/);return m?m[1]:''}
function route(){
  if(!me)return;
  let id=routeId();if(!mods().includes(id)){id=home();history.replaceState(null,'','#/'+id)}
  closeDrawer();closeModal();closeSheet();
  if(cur&&cur.destroy)cur.destroy();cur=null;
  sync();
  const m=MODS[id];document.title=m.t+' – Espace Agents · Police nationale';
  $('#tbTitle').innerHTML='<span class="long">'+E(m.t)+'</span><span class="short">'+E(m.s==='Accueil'?m.t:(id==='ops'?'Opérations':m.t.length>20?m.s:m.t))+'</span>';
  $$('#sideNav a,#bnav a,#sheetList a').forEach(a=>{const on=a.dataset.m===id;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  const more=$('#bnMore');if(more)more.classList.toggle('on',more.dataset.extra.split(',').includes(id));
  const L=$('#tbLeft');
  if(id!==home()){L.innerHTML=ic('back')+'<span>Retour</span>';L.setAttribute('aria-label','Retour au tableau de bord');L.dataset.act='back'}
  else{L.innerHTML=ic('menu')+'<span>Menu</span>';L.setAttribute('aria-label','Ouvrir le menu');L.dataset.act='menu'}
  const main=$('#main');main.innerHTML='';window.scrollTo(0,0);
  try{cur=VIEWS[id](main)||null}catch(err){console.error(err);main.innerHTML=empty('Une erreur est survenue','Rechargez la page.')}
}
window.addEventListener('hashchange',route);
function setupShell(){
  $('#tbLeft').addEventListener('click',()=>{if($('#tbLeft').dataset.act==='back')location.hash='#/'+home();else openSheet()});
  $$('[data-out]').forEach(b=>b.addEventListener('click',logout));
  $('#drawerClose').addEventListener('click',closeDrawer);$('#scrim').addEventListener('click',closeDrawer);
  $('#modalClose').addEventListener('click',closeModal);$('#modal').addEventListener('mousedown',e=>{if(e.target.id==='modal')closeModal()});
  $('#sheetClose').addEventListener('click',closeSheet);$('#sheet').addEventListener('click',e=>{if(e.target.id==='sheet'||e.target.closest('a'))closeSheet()});
}
function logout(){if(pollT)clearInterval(pollT);if(cur&&cur.destroy)cur.destroy();F.logout();me=null;location.href='index.html'}

/* ======================================================================
   TABLEAU DE BORD
   ====================================================================== */
const TCOL={preplainte:'#17407F',cyber:'#E0A91B',anonyme:'#0F8F4F',objet:'#D62839',rdv:'#2F6FD0'};
function barsSVG(vals,labels){
  const W=480,H=230,pb=34,pt=24,n=vals.length,bw=36,gap=(W-40-n*bw)/(n-1),max=Math.max(1,...vals);
  let s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Demandes par semaine sur les 8 dernières semaines">';
  for(let g=0;g<=3;g++){const y=pt+(H-pb-pt)*g/3;s+='<line x1="20" x2="'+(W-20)+'" y1="'+y+'" y2="'+y+'" stroke="#E7ECF4"/>'}
  vals.forEach((v,i)=>{const h=(H-pb-pt)*v/max,x=20+i*(bw+gap),y=H-pb-h,last=i===n-1;
    s+='<rect x="'+x+'" y="'+y+'" width="'+bw+'" height="'+Math.max(h,2)+'" rx="7" fill="'+(last?'#E0A91B':'#17407F')+'"><title>'+E(labels[i])+' : '+v+' demandes</title></rect>';
    s+='<text x="'+(x+bw/2)+'" y="'+(y-7)+'" text-anchor="middle" font-size="12" font-weight="700" fill="#0A1B33">'+v+'</text>';
    s+='<text x="'+(x+bw/2)+'" y="'+(H-12)+'" text-anchor="middle" font-size="10.5" fill="#5B6B82">'+E(labels[i])+'</text>'});
  return s+'</svg>';
}
function donutSVG(parts,total){
  const R=62,C=2*Math.PI*R;let off=0;
  let s='<svg viewBox="0 0 170 170" role="img" aria-label="Répartition des demandes par type"><circle cx="85" cy="85" r="'+R+'" fill="none" stroke="#EEF2F8" stroke-width="22"/>';
  parts.forEach(p=>{const l=C*p.v/Math.max(total,1);s+='<circle cx="85" cy="85" r="'+R+'" fill="none" stroke="'+p.c+'" stroke-width="22" stroke-dasharray="'+l+' '+(C-l)+'" stroke-dashoffset="'+(-off)+'" transform="rotate(-90 85 85)"><title>'+E(p.l)+' : '+p.v+'</title></circle>';off+=l});
  return s+'<text x="85" y="86" text-anchor="middle" font-family="Sora,sans-serif" font-size="26" font-weight="800" fill="#0A1B33">'+total+'</text><text x="85" y="104" text-anchor="middle" font-size="11" fill="#5B6B82">demandes</text></svg>';
}
const ALST={nouvelle:'Nouvelle',prise:'Prise en charge',patrouille:'Patrouille dépêchée',cloturee:'Clôturée'};
const ALCOL={nouvelle:'#D62839',prise:'#E0A91B',patrouille:'#17407F',cloturee:'#0F8F4F'};
function viewDashboard(main){
  const draw=()=>{
    const d=F.db(),R=d.requests,now=Date.now();
    const open=R.filter(r=>r.status!=='cloturee').length;
    const closed=R.filter(r=>r.status==='cloturee');
    const dur=closed.map(r=>{const t=r.timeline.find(x=>x.status==='cloturee');return t?(t.at-r.createdAt)/36e5:null}).filter(x=>x!=null);
    const avg=dur.length?Math.round(dur.reduce((a,b)=>a+b,0)/dur.length):null;
    const act=d.alerts.filter(a=>a.status!=='cloturee');
    const w7=R.filter(r=>now-r.createdAt<7*DAY).length;
    const wk=Array(8).fill(0);R.forEach(r=>{const i=Math.floor((now-r.createdAt)/(7*DAY));if(i>=0&&i<8)wk[7-i]++});
    const labels=wk.map((_,j)=>F.fmtShort(now-(8-j)*7*DAY));
    const types=Object.keys(F.TYPES).map(k=>({k,l:F.TYPES[k],v:R.filter(r=>r.type===k).length,c:TCOL[k]}));
    const byCom={};R.forEach(r=>{byCom[r.commissariat]=(byCom[r.commissariat]||0)+1});
    const rank=Object.entries(byCom).sort((a,b)=>b[1]-a[1]).slice(0,7),mx=rank.length?rank[0][1]:1;
    main.innerHTML=
    '<div class="demo-note">'+ic('info')+'<span>Données fictives de démonstration — aucun chiffre ne correspond à une situation réelle.</span></div>'+
    '<div class="ph"><div><h2>Tableau de bord</h2><p>Vue d’ensemble de l’activité · mis à jour '+E(F.fmt(now))+'</p></div></div>'+
    '<div class="grid g4 k">'+
     '<div class="card kpi"><small>Demandes reçues</small><b>'+R.length+'</b><span>dont '+w7+' sur 7 jours</span></div>'+
     '<div class="card kpi b"><small>En cours de traitement</small><b>'+open+'</b><span>'+(R.length?Math.round(open/R.length*100):0)+' % du total</span></div>'+
     '<div class="card kpi g"><small>Délai moyen de traitement</small><b>'+(avg==null?'—':avg+' h')+'</b><span>sur '+closed.length+' dossiers clôturés</span></div>'+
     '<div class="card kpi r"><small>Alertes 177 actives</small><b>'+act.length+'</b><span>'+d.alerts.length+' alertes au total</span></div>'+
    '</div>'+
    '<div class="grid g21 mt"><div class="card chart"><h3>Demandes par semaine <small>8 dernières semaines</small></h3>'+barsSVG(wk,labels)+'</div>'+
     '<div class="card"><h3>Répartition par type</h3><div class="donut">'+donutSVG(types,R.length)+'<ul class="legend">'+types.map(t=>'<li><i style="background:'+t.c+'"></i>'+E(t.l)+'<b>'+t.v+'</b></li>').join('')+'</ul></div></div></div>'+
    '<div class="grid g2 mt"><div class="card"><h3>Classement par commissariat <small>nombre de demandes</small></h3>'+
      (rank.length?'<ul class="rank">'+rank.map(([id,n])=>'<li><span>'+E(comNom(id))+'</span><b>'+n+'</b><div><i style="width:'+Math.round(n/mx*100)+'%"></i></div></li>').join('')+'</ul>':empty('Aucune donnée'))+'</div>'+
     '<div class="card"><h3>Dernières alertes 177 <a class="btn sm line" href="#/alertes" style="'+(mods().includes('alertes')?'':'display:none')+'">Voir tout</a></h3>'+
      (d.alerts.length?'<ul class="mini">'+d.alerts.slice(0,5).map(a=>'<li data-go="alertes"><span class="bd '+a.status+'">'+E(ALST[a.status])+'</span><div><b>'+E(a.type)+' · '+E(a.quartier)+'</b><small>'+E(ago(a.at))+' · '+E(a.id)+'</small></div></li>').join('')+'</ul>':empty('Aucune alerte'))+'</div></div>';
    $$('[data-go]',main).forEach(li=>li.addEventListener('click',()=>{if(mods().includes(li.dataset.go))location.hash='#/'+li.dataset.go}));
  };
  draw();let sig=sg();function sg(){const d=F.db();return d.requests.length+'|'+d.alerts.map(a=>a.id+a.status).join(',')+'|'+d.requests.filter(r=>r.status==='cloturee').length}
  return{poll(){const s=sg();if(s!==sig&&!drawerOpen()){sig=s;draw()}}};
}

/* ======================================================================
   DEMANDES
   ====================================================================== */
const dm={q:'',type:'',status:'',com:'',lim:50};
function reqFilt(){const q=dm.q.trim().toLowerCase();return F.db().requests.filter(r=>(!dm.type||r.type===dm.type)&&(!dm.status||r.status===dm.status)&&(!dm.com||r.commissariat===dm.com)&&(!q||r.id.toLowerCase().includes(q)||((r.contact&&r.contact.nom)||'').toLowerCase().includes(q)||(r.subject||'').toLowerCase().includes(q))).sort((a,b)=>b.createdAt-a.createdAt)}
function viewDemandes(main){
  main.innerHTML='<div class="ph"><div><h2>Demandes citoyennes</h2><p>Pré-plaintes, signalements, objets perdus et rendez-vous reçus depuis le site public.</p></div><div class="acts"><button class="btn line" id="dmCsv">'+ic('dl')+'Exporter en CSV</button></div></div>'+
   '<div class="fbar"><div class="sch"><label class="sr" style="position:absolute;left:-9999px" for="dmQ">Recherche</label>'+ic('search')+'<input id="dmQ" type="search" placeholder="Rechercher un n° ou un nom…" value="'+E(dm.q)+'"></div>'+
   '<select id="dmT" aria-label="Type">'+opts(Object.entries(F.TYPES),dm.type,'Tous les types')+'</select>'+
   '<select id="dmS" aria-label="Statut">'+opts(F.STATUTS.map(s=>[s.k,s.l]),dm.status,'Tous les statuts')+'</select>'+
   '<select id="dmC" aria-label="Commissariat">'+comOpts(dm.com,'Tous les commissariats')+'</select></div>'+
   '<div class="count" id="dmN"></div><div id="dmL"></div>';
  const list=()=>{
    const rows=reqFilt();$('#dmN').textContent=rows.length+' demande'+(rows.length>1?'s':'');
    if(!rows.length){$('#dmL').innerHTML='<div class="tw">'+empty('Aucune demande trouvée','Modifiez vos filtres ou votre recherche.')+'</div>';return}
    $('#dmL').innerHTML='<div class="tw"><table class="rt"><thead><tr><th>N°</th><th>Date</th><th>Type</th><th>Objet</th><th>Demandeur</th><th>Commissariat</th><th>Priorité</th><th>Statut</th></tr></thead><tbody>'+
     rows.slice(0,dm.lim).map(r=>'<tr tabindex="0" data-id="'+E(r.id)+'" aria-label="Ouvrir la demande '+E(r.id)+'"><td class="ttl" data-label=""><b>'+E(r.id)+'</b></td><td data-label="Date">'+E(F.fmt(r.createdAt,false))+'</td><td data-label="Type">'+E(F.TYPES[r.type]||r.type)+'</td><td data-label="Objet">'+E(r.subject)+'</td><td data-label="Demandeur">'+E((r.contact&&r.contact.nom)||'Anonyme')+'</td><td data-label="Commissariat">'+E(comNom(r.commissariat))+'</td><td data-label="Priorité">'+(r.priority==='haute'?'<span class="bd haute">Prioritaire</span>':'<span class="bd">Normale</span>')+'</td><td data-label="Statut">'+stBadge(r.status)+'</td></tr>').join('')+
     '</tbody></table></div>'+(rows.length>dm.lim?'<div class="more"><button class="btn line" id="dmMore">Afficher plus ('+(rows.length-dm.lim)+')</button></div>':'');
    const mb=$('#dmMore');if(mb)mb.addEventListener('click',()=>{dm.lim+=50;list()});
  };
  list();
  const bind=(id,k,ev)=>$(id).addEventListener(ev,e=>{dm[k]=e.target.value;dm.lim=50;list()});
  bind('#dmQ','q','input');bind('#dmT','type','change');bind('#dmS','status','change');bind('#dmC','com','change');
  $('#dmL').addEventListener('click',e=>{const tr=e.target.closest('tr[data-id]');if(tr)reqDrawer(tr.dataset.id,list)});
  $('#dmL').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const tr=e.target.closest('tr[data-id]');if(tr){e.preventDefault();reqDrawer(tr.dataset.id,list)}}});
  $('#dmCsv').addEventListener('click',()=>{
    const rows=reqFilt();if(!rows.length)return toast('Aucune donnée à exporter.','warn');
    csvDownload('demandes',[['N°','Date','Type','Objet','Demandeur','Téléphone','Commissariat','Priorité','Statut']].concat(rows.map(r=>[r.id,F.fmt(r.createdAt),F.TYPES[r.type]||r.type,r.subject,(r.contact&&r.contact.nom)||'',(r.contact&&r.contact.tel)||'',comNom(r.commissariat),r.priority,F.statut(r.status).l])));
    F.audit('Export CSV','Demandes ('+rows.length+')');save();toast('Export CSV généré ('+rows.length+' lignes).');
  });
  let sig=F.db().requests.length;
  return{poll(){const n=F.db().requests.length;if(n!==sig&&!drawerOpen()){sig=n;list()}}};
}
function reqDrawer(id,after){
  const get=()=>F.db().requests.find(x=>x.id===id);
  const html=()=>{
    const r=get();if(!r)return empty('Demande introuvable');
    const det=Object.entries(r.details||{}).map(([k,v])=>'<dt>'+E(k.replace(/_/g,' ').replace(/^./,c=>c.toUpperCase()))+'</dt><dd>'+E(typeof v==='object'?JSON.stringify(v):v)+'</dd>').join('');
    const ct=r.contact||{};
    return '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">'+stBadge(r.status)+(r.priority==='haute'?'<span class="bd haute">Prioritaire</span>':'')+'<span class="bd">'+E(F.TYPES[r.type]||r.type)+'</span></div>'+
    '<h3 style="margin-bottom:12px;font-size:1.1rem">'+E(r.subject)+'</h3>'+
    '<dl class="dl"><dt>Référence</dt><dd><b>'+E(r.id)+'</b></dd><dt>Reçue le</dt><dd>'+E(F.fmt(r.createdAt))+'</dd><dt>Commissariat</dt><dd>'+E(comNom(r.commissariat))+'</dd><dt>Responsable</dt><dd>'+E(r.assignee||'Non affectée')+'</dd></dl>'+
    '<span class="sec">Coordonnées du demandeur</span><dl class="dl"><dt>Nom</dt><dd>'+E(ct.nom||'Anonyme')+'</dd><dt>Téléphone</dt><dd>'+E(ct.tel||'—')+'</dd><dt>E-mail</dt><dd>'+E(ct.email||'—')+'</dd></dl>'+
    '<span class="sec">Description</span><dl class="dl">'+(det||'<dt>Détails</dt><dd>—</dd>')+'</dl>'+
    '<span class="sec">Traitement</span>'+
    '<div class="box"><label class="lbl" for="drS">Changer le statut</label><div class="row"><select id="drS">'+opts(F.STATUTS.map(s=>[s.k,s.l]),r.status)+'</select><button class="btn navy sm" id="drSb">Mettre à jour</button></div></div>'+
    '<div class="box"><label class="lbl" for="drC">Affecter à un commissariat</label><div class="row"><select id="drC">'+comOpts(r.commissariat)+'</select><button class="btn line sm" id="drCb">Affecter</button></div></div>'+
    '<div class="box"><label class="lbl" for="drN">Note / réponse à l’usager</label><textarea id="drN" placeholder="Votre message sera ajouté à la chronologie visible par l’usager…"></textarea><div style="margin-top:8px"><button class="btn gold sm" id="drNb">Ajouter à la chronologie</button></div></div>'+
    '<span class="sec">Chronologie</span>'+tlHTML(r.timeline);
  };
  const bind=()=>{
    const done=m=>{setDrawer(html());bind();if(after)after();toast(m)};
    $('#drSb')&&($('#drSb').onclick=()=>{const r=get(),v=$('#drS').value;if(v===r.status)return toast('Le statut est déjà « '+F.statut(v).l+' ».','warn');F.setStatus(id,v,'Statut : '+F.statut(v).l+'.',userName());done('Statut mis à jour.')});
    $('#drCb')&&($('#drCb').onclick=()=>{const r=get(),v=$('#drC').value;if(v===r.commissariat)return toast('Déjà affectée à ce commissariat.','warn');r.commissariat=v;r.assignee=userName();
      if(r.status==='recue')F.setStatus(id,'transmise','Transmise au '+comNom(v)+'.',userName());else r.timeline.push({at:Date.now(),status:r.status,text:'Réaffectée au '+comNom(v)+'.',by:userName()});
      F.audit('Affectation',id);save();done('Demande affectée.')});
    $('#drNb')&&($('#drNb').onclick=()=>{const t=$('#drN').value.trim();if(!t)return toast('Saisissez un message.','warn');const r=get();r.timeline.push({at:Date.now(),status:r.status,text:t,by:userName(),note:true});F.audit('Réponse à l’usager',id);save();done('Message ajouté à la chronologie.')});
  };
  openDrawer('Demande '+id,html(),after);bind();
}

/* ======================================================================
   ALERTES 177
   ====================================================================== */
function viewAlertes(main){
  let map=null,layer=null,filter='actives',known=new Set(F.db().alerts.map(a=>a.id)),sig='';
  const hasL=!!window.L;
  main.innerHTML='<div class="ph"><div><h2>Alertes 177</h2><p>Alertes d’urgence géolocalisées · actualisation automatique toutes les 5 secondes.</p></div><div class="acts"><button class="btn red" id="alSim">'+ic('alertes')+'Simuler une alerte entrante</button></div></div>'+
   '<div class="chips" role="group" aria-label="Filtre"><button class="chip" data-f="actives">Actives</button><button class="chip" data-f="toutes">Toutes</button></div>'+
   '<div class="al-wrap"><div>'+(hasL?'<div id="map" role="application" aria-label="Carte des alertes"></div>':'<div class="nomap">Carte indisponible (connexion ou bibliothèque non chargée) — affichage en liste uniquement.</div>')+
   '<div class="lgd">'+Object.keys(ALST).map(k=>'<span><i style="background:'+ALCOL[k]+'"></i>'+ALST[k]+'</span>').join('')+'</div></div><div id="alL" class="al-list"></div></div>';
  if(hasL){
    map=L.map('map',{zoomControl:true}).setView([0.4,9.45],12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    layer=L.layerGroup().addTo(map);setTimeout(()=>map&&map.invalidateSize(),250);
  }
  const vis=()=>F.db().alerts.filter(a=>filter==='toutes'||a.status!=='cloturee').sort((a,b)=>b.at-a.at);
  const draw=()=>{
    const rows=vis();$$('.chip',main).forEach(c=>{c.classList.toggle('on',c.dataset.f===filter);c.setAttribute('aria-pressed',c.dataset.f===filter)});
    $('#alL').innerHTML=rows.length?rows.map(a=>'<button class="al-i '+a.status+'" data-id="'+E(a.id)+'"><div><b>'+E(a.type)+' · '+E(a.quartier)+'</b><small>'+E(a.id)+' · '+E(ago(a.at))+'</small></div><span class="bd '+a.status+'">'+E(ALST[a.status])+'</span></button>').join(''):empty('Aucune alerte active','Les nouvelles alertes 177 apparaîtront ici automatiquement.');
    if(layer){layer.clearLayers();rows.forEach(a=>{if(typeof a.lat!=='number'||typeof a.lng!=='number')return;
      const m=L.circleMarker([a.lat,a.lng],{radius:11,weight:3,color:'#fff',fillColor:ALCOL[a.status],fillOpacity:.92}).addTo(layer);
      m.bindTooltip(a.type+' · '+ALST[a.status]);m.on('click',()=>alDrawer(a.id,refresh))})}
    sig=sg();
  };
  function sg(){return F.db().alerts.map(a=>a.id+a.status+a.timeline.length).join('|')+filter}
  const refresh=()=>draw();
  draw();
  main.addEventListener('click',e=>{
    const c=e.target.closest('.chip');if(c){filter=c.dataset.f;draw();return}
    const i=e.target.closest('.al-i');if(i){const a=F.db().alerts.find(x=>x.id===i.dataset.id);if(a&&map&&typeof a.lat==='number')map.setView([a.lat,a.lng],15);alDrawer(i.dataset.id,refresh)}
  });
  $('#alSim').addEventListener('click',()=>{
    const T=['Agression','Accident','Incendie','Cambriolage en cours','Autre urgence'],Q=['Akébé','Nzeng-Ayong','Louis','Batterie IV','Lalala','Glass','Oloumi','PK8'];
    const a=F.addAlert({type:T[Math.floor(Math.random()*T.length)],lat:0.4+(Math.random()-.5)*.1,lng:9.45+(Math.random()-.5)*.1,quartier:Q[Math.floor(Math.random()*Q.length)],phone:'+241 06 '+(10+Math.floor(Math.random()*89))+' '+(10+Math.floor(Math.random()*89))+' 00'});
    known.add(a.id);F.audit('Alerte simulée',a.id);save();beep();toast('Nouvelle alerte 177 : '+a.type+' ('+a.quartier+')','warn');draw();if(map)map.setView([a.lat,a.lng],14);
  });
  return{poll(){
    const fresh=F.db().alerts.filter(a=>!known.has(a.id));
    if(fresh.length){fresh.forEach(a=>known.add(a.id));beep();toast('Nouvelle alerte 177 reçue : '+fresh[0].type+(fresh.length>1?' (+'+(fresh.length-1)+')':''),'warn')}
    if(sg()!==sig){draw();if(drawerOpen()&&$('#drawerTitle').textContent.indexOf('Alerte')===0){/* le tiroir se met à jour à l'action */}}
    else if(!drawerOpen())draw();/* rafraîchit les « il y a x min » */
  },destroy(){if(map){map.remove();map=null}}};
}
const NEXT={nouvelle:['prise','Prendre en charge','Prise en charge par '],prise:['patrouille','Dépêcher une patrouille','Patrouille dépêchée par '],patrouille:['cloturee','Clôturer l’intervention','Intervention clôturée par ']};
function alDrawer(id,after){
  const get=()=>F.db().alerts.find(x=>x.id===id);
  const keys=Object.keys(ALST);
  const html=()=>{
    const a=get();if(!a)return empty('Alerte introuvable');const idx=keys.indexOf(a.status),nx=NEXT[a.status];
    return '<div style="margin-bottom:14px"><span class="bd '+a.status+'">'+E(ALST[a.status])+'</span></div>'+
    '<div class="stepper">'+keys.map((k,i)=>'<span class="'+(i<idx||(i===idx&&k==='cloturee')?'done':i===idx?'cur':'')+'">'+E(ALST[k])+'</span>').join('')+'</div>'+
    '<dl class="dl"><dt>Référence</dt><dd><b>'+E(a.id)+'</b></dd><dt>Nature</dt><dd>'+E(a.type)+'</dd><dt>Quartier</dt><dd>'+E(a.quartier)+'</dd><dt>Téléphone</dt><dd>'+E(a.phone||'—')+'</dd><dt>Position GPS</dt><dd>'+(typeof a.lat==='number'?a.lat.toFixed(4)+', '+a.lng.toFixed(4):'Non communiquée')+'</dd><dt>Reçue le</dt><dd>'+E(F.fmt(a.at))+'</dd></dl>'+
    (nx?'<button class="btn '+(a.status==='patrouille'?'green':'gold')+' block" id="alNext">'+E(nx[1])+'</button>':'<div class="box"><b>Alerte clôturée.</b> Aucune action restante.</div>')+
    '<span class="sec">Chronologie</span>'+tlHTML(a.timeline);
  };
  const bind=()=>{const b=$('#alNext');if(b)b.onclick=()=>{const a=get(),nx=NEXT[a.status];a.status=nx[0];a.timeline.push({at:Date.now(),status:nx[0],text:nx[2]+userName()+'.',by:userName()});F.audit('Alerte : '+ALST[nx[0]],a.id);save();setDrawer(html());bind();if(after)after();toast('Alerte mise à jour : '+ALST[nx[0]]+'.')}};
  openDrawer('Alerte '+id,html(),after);bind();
}

/* ======================================================================
   MAIN COURANTE
   ====================================================================== */
const mcF={q:'',com:''};
const NATURES=['Constat d’altercation','Dépôt de plainte','Remise d’objet trouvé','Intervention – trouble à l’ordre public','Accident de la circulation','Signalement de personne disparue','Contrôle d’identité','Autre'];
function mcFilt(){const q=mcF.q.trim().toLowerCase();return F.db().courante.filter(m=>(!mcF.com||m.commissariat===mcF.com)&&(!q||(m.nature+' '+m.texte+' '+m.agent+' '+m.id).toLowerCase().includes(q))).sort((a,b)=>b.at-a.at)}
function viewCourante(main){
  const defCom=me.commissariat||'lbv1';
  main.innerHTML='<div class="ph"><div><h2>Main courante numérique</h2><p>Registre chronologique des faits constatés · chaque entrée est horodatée et signée.</p></div><div class="acts"><button class="btn line" id="mcCsv">'+ic('dl')+'Exporter en CSV</button></div></div>'+
   '<div class="grid g21"><div><div class="fbar"><div class="sch">'+ic('search')+'<input id="mcQ" type="search" aria-label="Recherche" placeholder="Filtrer les entrées…" value="'+E(mcF.q)+'"></div><select id="mcC" aria-label="Commissariat">'+comOpts(mcF.com,'Tous les commissariats')+'</select></div><div class="count" id="mcN"></div><div id="mcL"></div></div>'+
   '<div class="card" style="align-self:start"><h3>Nouvelle entrée</h3><form id="mcF" novalidate><div class="fld"><label for="mcNat">Nature</label><select id="mcNat">'+opts(NATURES)+'</select></div><div class="fld"><label for="mcCom">Commissariat</label><select id="mcCom">'+comOpts(defCom)+'</select></div><div class="fld"><label for="mcTx">Faits constatés</label><textarea id="mcTx" required placeholder="Heure, lieu, personnes présentes, suite donnée…"></textarea></div><div class="fld"><label for="mcAg">Agent</label><input id="mcAg" value="'+E(me.nom)+'" readonly></div><button class="btn gold block" type="submit">Enregistrer l’entrée</button></form></div></div>';
  const list=()=>{
    const rows=mcFilt();$('#mcN').textContent=rows.length+' entrée'+(rows.length>1?'s':'');
    $('#mcL').innerHTML=rows.length?'<div class="tw"><table class="rt"><thead><tr><th>Date</th><th>N°</th><th>Nature</th><th>Commissariat</th><th>Agent</th><th>Détail</th></tr></thead><tbody>'+rows.slice(0,80).map(m=>'<tr><td class="ttl" data-label=""><b>'+E(F.fmt(m.at))+'</b></td><td data-label="N°">'+E(m.id)+'</td><td data-label="Nature">'+E(m.nature)+'</td><td data-label="Commissariat">'+E(comNom(m.commissariat))+'</td><td data-label="Agent">'+E(m.agent)+'</td><td class="stk" data-label="Détail">'+E(m.texte)+'</td></tr>').join('')+'</tbody></table></div>':'<div class="tw">'+empty('Aucune entrée','Aucune entrée ne correspond au filtre.')+'</div>';
  };
  list();
  $('#mcQ').addEventListener('input',e=>{mcF.q=e.target.value;list()});$('#mcC').addEventListener('change',e=>{mcF.com=e.target.value;list()});
  $('#mcF').addEventListener('submit',e=>{e.preventDefault();const tx=$('#mcTx').value.trim();if(!tx){toast('Décrivez les faits constatés.','warn');$('#mcTx').focus();return}
    const n=F.nextId('mc');F.db().courante.unshift({id:'MC-'+n,at:Date.now(),commissariat:$('#mcCom').value,agent:me.nom,nature:$('#mcNat').value,texte:tx});F.audit('Nouvelle entrée main courante','MC-'+n);save();$('#mcTx').value='';list();toast('Entrée MC-'+n+' enregistrée.')});
  $('#mcCsv').addEventListener('click',()=>{const rows=mcFilt();if(!rows.length)return toast('Aucune donnée à exporter.','warn');csvDownload('main-courante',[['N°','Date','Nature','Commissariat','Agent','Détail']].concat(rows.map(m=>[m.id,F.fmt(m.at),m.nature,comNom(m.commissariat),m.agent,m.texte])));F.audit('Export CSV','Main courante');save();toast('Export CSV généré.')});
}

/* ======================================================================
   RESSOURCES HUMAINES
   ====================================================================== */
const rhF={q:'',grade:'',service:'',com:''};
function rhFilt(){const q=rhF.q.trim().toLowerCase();return F.db().agents.filter(a=>(!rhF.grade||a.grade===rhF.grade)&&(!rhF.service||a.service===rhF.service)&&(!rhF.com||a.commissariat===rhF.com)&&(!q||(a.nom+' '+a.prenom+' '+a.matricule+' '+a.badge).toLowerCase().includes(q)))}
function viewRH(main){
  const ag=F.db().agents,mx=Math.max(1,...F.GRADES.map(g=>ag.filter(a=>a.grade===g).length));
  main.innerHTML='<div class="ph"><div><h2>Ressources humaines</h2><p>Annuaire des agents, affectations et avancement.</p></div></div>'+
   '<div class="sita"><div>'+ic('rh')+'</div><div><b>Tableau d’avancement – connecteur SITA</b><span>Raccordement au système d’information de gestion des personnels (SITA) à prévoir en phase de déploiement.</span></div><span class="bd">À raccorder</span></div>'+
   '<div class="grid g21"><div><div class="fbar"><div class="sch">'+ic('search')+'<input id="rhQ" type="search" aria-label="Recherche" placeholder="Nom, matricule, badge…" value="'+E(rhF.q)+'"></div><select id="rhG" aria-label="Grade">'+opts(F.GRADES,rhF.grade,'Tous les grades')+'</select><select id="rhS" aria-label="Service">'+opts(F.SERVICES,rhF.service,'Tous les services')+'</select><select id="rhC" aria-label="Affectation">'+comOpts(rhF.com,'Toutes les affectations')+'</select></div><div class="count" id="rhN"></div><div id="rhL"></div></div>'+
   '<div class="card" style="align-self:start"><h3>Répartition par grade <small>'+ag.length+' agents</small></h3><ul class="rank">'+F.GRADES.map(g=>{const n=ag.filter(a=>a.grade===g).length;return '<li><span>'+E(g)+'</span><b>'+n+'</b><div><i style="width:'+Math.round(n/mx*100)+'%"></i></div></li>'}).join('')+'</ul></div></div>';
  const list=()=>{
    const rows=rhFilt();$('#rhN').textContent=rows.length+' agent'+(rows.length>1?'s':'');
    $('#rhL').innerHTML=rows.length?'<div class="tw"><table class="rt"><thead><tr><th>Agent</th><th>Matricule</th><th>Grade</th><th>Service</th><th>Affectation</th><th>Statut</th></tr></thead><tbody>'+rows.map(a=>'<tr tabindex="0" data-id="'+E(a.id)+'" aria-label="Ouvrir la fiche de '+E(a.prenom+' '+a.nom)+'"><td class="ttl" data-label=""><b>'+E(a.nom)+' '+E(a.prenom)+'</b></td><td data-label="Matricule">'+E(a.matricule)+'</td><td data-label="Grade">'+E(a.grade)+'</td><td data-label="Service">'+E(a.service)+'</td><td data-label="Affectation">'+E(comNom(a.commissariat))+'</td><td data-label="Statut"><span class="bd '+(a.statut==='En service'?'ok':'warn')+'">'+E(a.statut)+'</span></td></tr>').join('')+'</tbody></table></div>':'<div class="tw">'+empty('Aucun agent trouvé','Modifiez vos filtres.')+'</div>';
  };
  list();
  [['#rhQ','q','input'],['#rhG','grade','change'],['#rhS','service','change'],['#rhC','com','change']].forEach(([s,k,ev])=>$(s).addEventListener(ev,e=>{rhF[k]=e.target.value;list()}));
  const open=e=>{const tr=e.target.closest('tr[data-id]');if(tr)agDrawer(tr.dataset.id,list)};
  $('#rhL').addEventListener('click',open);$('#rhL').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(e)}});
}
function agDrawer(id,after){
  const get=()=>F.db().agents.find(x=>x.id===id);
  const html=()=>{const a=get();if(!a)return empty('Agent introuvable');const yrs=new Date().getFullYear()-a.entree;
    return '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px"><span class="bd ok">&#10003; Badge vérifié</span><span class="bd '+(a.statut==='En service'?'ok':'warn')+'">'+E(a.statut)+'</span></div>'+
    '<h3 style="font-size:1.2rem;margin-bottom:12px">'+E(a.prenom)+' '+E(a.nom)+'</h3>'+
    '<dl class="dl"><dt>Matricule</dt><dd><b>'+E(a.matricule)+'</b></dd><dt>N° de badge</dt><dd>'+E(a.badge)+'</dd><dt>Grade</dt><dd>'+E(a.grade)+'</dd><dt>Service</dt><dd>'+E(a.service)+'</dd><dt>Affectation</dt><dd>'+E(comNom(a.commissariat))+'</dd><dt>Ancienneté</dt><dd>'+yrs+' an'+(yrs>1?'s':'')+' (entrée en '+E(a.entree)+')</dd><dt>Formations</dt><dd>'+(a.formations||[]).map(f=>'<span class="bd" style="margin:0 4px 4px 0">'+E(f)+'</span>').join('')+'</dd><dt>Avancement</dt><dd>'+E(a.tableau||'—')+'</dd></dl>'+
    '<span class="sec">Muter / affecter</span><div class="box"><label class="lbl" for="agC">Nouvelle affectation</label><div class="row"><select id="agC">'+comOpts(a.commissariat)+'</select><button class="btn navy sm" id="agB">Muter / affecter</button></div></div>';};
  const bind=()=>{const b=$('#agB');if(b)b.onclick=()=>{const a=get(),v=$('#agC').value;if(v===a.commissariat)return toast('L’agent est déjà affecté à ce poste.','warn');const old=a.commissariat;a.commissariat=v;F.audit('Mutation agent',a.matricule+' : '+old+' → '+v);save();setDrawer(html());bind();if(after)after();toast('Affectation mise à jour : '+comNom(v)+'.')}};
  const a=get();openDrawer(a?a.prenom+' '+a.nom:'Agent',html(),after);bind();
}

/* ======================================================================
   MOYENS
   ====================================================================== */
const VETAT=['Opérationnel','En entretien','Hors service'];
function viewMoyens(main){
  const draw=()=>{
    const V=F.db().vehicles,now=Date.now(),dot=V.filter(v=>v.dotation);
    main.innerHTML='<div class="ph"><div><h2>Moyens</h2><p>Parc de véhicules, carburant, entretien et dotations.</p></div><div class="acts"><button class="btn gold" id="vAdd">'+ic('plus')+'Ajouter un véhicule</button></div></div>'+
     '<div class="grid g4 k"><div class="card kpi g"><small>Opérationnels</small><b>'+V.filter(v=>v.etat==='Opérationnel').length+'</b><span>sur '+V.length+' véhicules</span></div><div class="card kpi"><small>En entretien</small><b>'+V.filter(v=>v.etat==='En entretien').length+'</b><span>immobilisés</span></div><div class="card kpi r"><small>Hors service</small><b>'+V.filter(v=>v.etat==='Hors service').length+'</b><span>à remplacer</span></div><div class="card kpi b"><small>Entretiens dépassés</small><b>'+V.filter(v=>v.entretien<now).length+'</b><span>à planifier</span></div></div>'+
     '<div class="tw mt"><table class="rt"><thead><tr><th>Véhicule</th><th>Affectation</th><th>État</th><th>Carburant</th><th>Kilométrage</th><th>Prochain entretien</th></tr></thead><tbody>'+
     V.map(v=>{const late=v.entretien<now,soon=!late&&v.entretien-now<15*DAY,col=v.carburant<25?'#D62839':v.carburant<50?'#E0A91B':'#0F8F4F';
      return '<tr><td class="ttl" data-label=""><b>'+E(v.modele)+'</b><small>'+E(v.immat)+' · '+E(v.id)+(v.dotation?' · '+E(v.dotation):'')+'</small></td><td data-label="Affectation">'+E(comNom(v.affectation))+'</td><td data-label="État"><select data-v="'+E(v.id)+'" aria-label="État de '+E(v.immat)+'">'+opts(VETAT,v.etat)+'</select></td><td data-label="Carburant"><div class="fuel"><div class="bar" style="flex:1"><i style="width:'+v.carburant+'%;background:'+col+'"></i></div><span>'+v.carburant+'%</span></div></td><td data-label="Kilométrage">'+E(Number(v.km).toLocaleString('fr-FR'))+' km</td><td data-label="Prochain entretien">'+E(F.fmt(v.entretien,false))+' '+(late?'<span class="bd bad">Dépassé</span>':soon?'<span class="bd warn">Bientôt</span>':'')+'</td></tr>'}).join('')+'</tbody></table></div>'+
     '<div class="grid g2 mt"><div class="photo"><img src="assets/img/dotation.jpg" alt="" loading="lazy"><div><b>Dotation de mai 2026</b><span>'+dot.length+' véhicule'+(dot.length>1?'s':'')+' reçu'+(dot.length>1?'s':'')+' · données de démonstration</span></div></div>'+
     '<div class="card"><h3>Dotations <small>véhicules concernés</small></h3>'+(dot.length?'<ul class="mini">'+dot.map(v=>'<li style="cursor:default"><div><b>'+E(v.modele)+' · '+E(v.immat)+'</b><small>'+E(v.dotation)+' · '+E(comNom(v.affectation))+'</small></div></li>').join('')+'</ul>':empty('Aucune dotation enregistrée'))+'</div></div>';
    $$('select[data-v]',main).forEach(s=>s.addEventListener('change',()=>{const v=F.db().vehicles.find(x=>x.id===s.dataset.v);if(!v)return;v.etat=s.value;F.audit('Changement d’état véhicule',v.immat+' → '+v.etat);save();toast(v.immat+' : '+v.etat+'.');draw()}));
    $('#vAdd').addEventListener('click',addV);
  };
  function addV(){
    openModal('Ajouter un véhicule','<form id="vF" novalidate><div class="f2"><div class="fld"><label for="vM">Modèle</label><input id="vM" required placeholder="ex. Toyota Hilux"></div><div class="fld"><label for="vI">Immatriculation</label><input id="vI" required placeholder="GA-123-AB"></div><div class="fld"><label for="vA">Affectation</label><select id="vA">'+comOpts('lbv1')+'</select></div><div class="fld"><label for="vE">État</label><select id="vE">'+opts(VETAT)+'</select></div><div class="fld"><label for="vC">Carburant (%)</label><input id="vC" type="number" min="0" max="100" value="80"></div><div class="fld"><label for="vK">Kilométrage</label><input id="vK" type="number" min="0" value="0"></div><div class="fld"><label for="vN">Prochain entretien</label><input id="vN" type="date" required></div><div class="fld"><label for="vD">Dotation</label><input id="vD" placeholder="ex. Dotation de mai 2026"></div></div><p class="err" id="vErr" hidden></p><div class="acts"><button type="button" class="btn line" id="vX">Annuler</button><button class="btn gold" type="submit">Ajouter</button></div></form>');
    $('#vN').value=new Date(Date.now()+90*DAY).toISOString().slice(0,10);
    $('#vX').onclick=closeModal;
    $('#vF').addEventListener('submit',e=>{e.preventDefault();const m=$('#vM').value.trim(),im=$('#vI').value.trim().toUpperCase();const er=$('#vErr');
      if(!m||!im){er.textContent='Le modèle et l’immatriculation sont obligatoires.';er.hidden=false;return}
      const V=F.db().vehicles;const n=Math.max(0,...V.map(v=>parseInt(String(v.id).replace(/\D/g,''))||0))+1;
      V.push({id:'V-'+n,immat:im,modele:m,affectation:$('#vA').value,etat:$('#vE').value,carburant:Math.max(0,Math.min(100,+$('#vC').value||0)),km:Math.max(0,+$('#vK').value||0),entretien:new Date($('#vN').value).getTime()||Date.now(),dotation:$('#vD').value.trim()});
      F.audit('Ajout véhicule',im);save();closeModal();toast('Véhicule '+im+' ajouté au parc.');draw()});
  }
  draw();
}

/* ======================================================================
   PATROUILLES & OPÉRATIONS
   ====================================================================== */
let opWk=0;
const OPST={'Planifiée':'s2','En cours':'s3','Terminée':'s4'};
function viewOps(main){
  const draw=()=>{
    const O=F.db().ops.slice().sort((a,b)=>b.date-a.date);
    const mon=new Date();mon.setHours(0,0,0,0);mon.setDate(mon.getDate()-((mon.getDay()+6)%7)+opWk*7);
    const days=Array.from({length:7},(_,i)=>{const d=new Date(mon);d.setDate(d.getDate()+i);return d});
    const todayS=new Date().toDateString();
    main.innerHTML='<div class="ph"><div><h2>Patrouilles &amp; opérations</h2><p>Planning, mise en œuvre et comptes rendus.</p></div><div class="acts"><button class="btn gold" id="opAdd">'+ic('plus')+'Créer une opération</button></div></div>'+
     '<div class="card"><h3>Planning de la semaine</h3><div class="wknav"><button class="btn sm line" id="wkP" aria-label="Semaine précédente">&larr;</button><b>'+E(F.fmt(days[0],false))+' – '+E(F.fmt(days[6],false))+'</b><button class="btn sm line" id="wkN" aria-label="Semaine suivante">&rarr;</button>'+(opWk?'<button class="btn sm line" id="wkT">Cette semaine</button>':'')+'</div><div class="week">'+days.map(d=>{const ev=O.filter(o=>new Date(o.date).toDateString()===d.toDateString()).sort((a,b)=>a.date-b.date);return '<div class="wd'+(d.toDateString()===todayS?' today':'')+'"><h4>'+E(d.toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'2-digit'}))+'</h4>'+(ev.length?ev.map(o=>'<div class="ev '+(o.statut==='Terminée'?'t':o.statut==='En cours'?'c':'')+'" tabindex="0" role="button" data-id="'+E(o.id)+'">'+E(o.titre)+'</div>').join(''):'<span style="color:#9aa8bd">—</span>')+'</div>'}).join('')+'</div></div>'+
     '<h3 style="margin:22px 0 12px">Toutes les opérations</h3>'+
     (O.length?'<div class="tw"><table class="rt"><thead><tr><th>Opération</th><th>Date</th><th>Type</th><th>Commissariat</th><th>Effectif</th><th>Statut</th><th>Actions</th></tr></thead><tbody>'+O.map(o=>'<tr><td class="ttl" data-label=""><b>'+E(o.titre)+'</b><small>'+E(o.id)+'</small></td><td data-label="Date">'+E(F.fmt(o.date))+'</td><td data-label="Type">'+E(o.type)+'</td><td data-label="Commissariat">'+E(comNom(o.commissariat))+'</td><td data-label="Effectif">'+E(o.effectif)+' agents</td><td data-label="Statut"><span class="bd '+(OPST[o.statut]||'')+'">'+E(o.statut)+'</span></td><td data-label="Actions"><div class="act">'+(o.statut==='Planifiée'?'<button class="btn sm line" data-start="'+E(o.id)+'">Démarrer</button>':'')+(o.statut!=='Terminée'?'<button class="btn sm navy" data-cr="'+E(o.id)+'">Compte rendu</button>':'<button class="btn sm line" data-view="'+E(o.id)+'">Voir le CR</button>')+'</div></td></tr>').join('')+'</tbody></table></div>':'<div class="tw">'+empty('Aucune opération','Créez la première opération.')+'</div>');
    $('#opAdd').onclick=addOp;
    $('#wkP').onclick=()=>{opWk--;draw()};$('#wkN').onclick=()=>{opWk++;draw()};const t=$('#wkT');if(t)t.onclick=()=>{opWk=0;draw()};
    $$('[data-start]',main).forEach(b=>b.onclick=()=>{const o=F.db().ops.find(x=>x.id===b.dataset.start);o.statut='En cours';F.audit('Opération démarrée',o.id);save();toast(o.id+' démarrée.');draw()});
    $$('[data-cr]',main).forEach(b=>b.onclick=()=>crOp(b.dataset.cr));
    $$('[data-view]',main).forEach(b=>b.onclick=()=>viewCr(b.dataset.view));
    $$('.ev',main).forEach(b=>{const f=()=>{const o=F.db().ops.find(x=>x.id===b.dataset.id);if(o)(o.statut==='Terminée'?viewCr:crOp)(o.id)};b.onclick=f;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f()}}});
  };
  function addOp(){
    const d=new Date(Date.now()+DAY);d.setMinutes(0);const iso=new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,16);
    openModal('Créer une opération','<form id="oF" novalidate><div class="fld"><label for="oT">Intitulé</label><input id="oT" required placeholder="ex. Patrouille de nuit – Glass"></div><div class="f2"><div class="fld"><label for="oY">Type</label><select id="oY">'+opts(['Patrouille','Opération','Contrôle','Présence permanente'])+'</select></div><div class="fld"><label for="oD">Date et heure</label><input id="oD" type="datetime-local" value="'+iso+'" required></div><div class="fld"><label for="oC">Commissariat</label><select id="oC">'+comOpts(me.commissariat||'lbv1')+'</select></div><div class="fld"><label for="oE">Effectif</label><input id="oE" type="number" min="1" value="10"></div></div><p class="err" id="oErr" hidden></p><div class="acts"><button type="button" class="btn line" id="oX">Annuler</button><button class="btn gold" type="submit">Créer</button></div></form>');
    $('#oX').onclick=closeModal;
    $('#oF').addEventListener('submit',e=>{e.preventDefault();const t=$('#oT').value.trim(),dt=new Date($('#oD').value).getTime();const er=$('#oErr');
      if(!t||!dt){er.textContent='Renseignez l’intitulé et la date.';er.hidden=false;return}
      const n=F.nextId('op');F.db().ops.push({id:'OP-'+n,titre:t,type:$('#oY').value,date:dt,commissariat:$('#oC').value,effectif:Math.max(1,+$('#oE').value||1),statut:'Planifiée',cr:null});F.audit('Création opération','OP-'+n);save();closeModal();toast('Opération OP-'+n+' créée.');draw()});
  }
  function crOp(id){
    const o=F.db().ops.find(x=>x.id===id);if(!o)return;
    openModal('Compte rendu – '+o.id,'<p style="margin-bottom:12px;color:var(--muted)">'+E(o.titre)+'</p><form id="cF" novalidate><div class="fld"><label for="cI">Interpellations</label><input id="cI" type="number" min="0" value="0"></div><div class="fld"><label for="cS">Saisies</label><input id="cS" placeholder="ex. 2 véhicules, 1 arme blanche"></div><div class="fld"><label for="cR">Remarques</label><textarea id="cR" placeholder="Déroulement, incidents, suites à donner…"></textarea></div><p class="lg-help" style="color:var(--muted);font-size:.84rem;margin-bottom:10px">L’enregistrement passe l’opération au statut « Terminée ».</p><div class="acts"><button type="button" class="btn line" id="cX">Annuler</button><button class="btn gold" type="submit">Enregistrer le compte rendu</button></div></form>');
    $('#cX').onclick=closeModal;
    $('#cF').addEventListener('submit',e=>{e.preventDefault();o.cr={interpellations:Math.max(0,+$('#cI').value||0),saisies:$('#cS').value.trim()||'Néant',remarques:$('#cR').value.trim()||'—'};o.statut='Terminée';F.audit('Compte rendu opération',o.id);save();closeModal();toast('Compte rendu enregistré · '+o.id+' terminée.');draw()});
  }
  function viewCr(id){
    const o=F.db().ops.find(x=>x.id===id);if(!o)return;const c=o.cr||{};
    openModal('Compte rendu – '+o.id,'<p style="margin-bottom:12px"><b>'+E(o.titre)+'</b><br><span style="color:var(--muted)">'+E(F.fmt(o.date))+' · '+E(comNom(o.commissariat))+'</span></p><dl class="dl"><dt>Interpellations</dt><dd>'+E(c.interpellations!=null?c.interpellations:'—')+'</dd><dt>Saisies</dt><dd>'+E(c.saisies||'—')+'</dd><dt>Remarques</dt><dd>'+E(c.remarques||'—')+'</dd></dl><div class="acts"><button class="btn line" id="vcX">Fermer</button></div>');$('#vcX').onclick=closeModal;
  }
  draw();
}

/* ======================================================================
   CONCOURS & RECRUTEMENT
   ====================================================================== */
const CST={recu:'Reçue',valide:'Validée',convoque:'Convoquée',rejete:'Rejetée'};
const cF={q:'',st:''};
function viewConcours(main){
  const draw=()=>{
    const C=F.db().candidates,q=cF.q.trim().toLowerCase();
    const rows=C.filter(c=>(!cF.st||c.status===cF.st)&&(!q||(c.nom+' '+c.prenom+' '+c.id).toLowerCase().includes(q))).sort((a,b)=>b.createdAt-a.createdAt);
    const pub=F.db().resultsPublishedAt;
    main.innerHTML='<div class="ph"><div><h2>Concours &amp; recrutement</h2><p>Candidatures reçues, y compris via le formulaire du site public.</p></div><div class="acts"><button class="btn navy" id="cPub">Publier les résultats</button></div></div>'+
     (pub?'<div class="demo-note">'+ic('info')+'<span>Résultats publiés le '+E(F.fmt(pub))+' (action factice de démonstration).</span></div>':'')+
     '<div class="grid g4 k">'+Object.keys(CST).map(k=>'<div class="card kpi'+(k==='valide'?' g':k==='rejete'?' r':k==='convoque'?' b':'')+'"><small>'+CST[k]+'s</small><b>'+C.filter(c=>c.status===k).length+'</b><span>candidature'+(C.filter(c=>c.status===k).length>1?'s':'')+'</span></div>').join('')+'</div>'+
     '<div class="fbar mt"><div class="sch">'+ic('search')+'<input id="cQ" type="search" aria-label="Recherche" placeholder="Rechercher un candidat…" value="'+E(cF.q)+'"></div><select id="cS" aria-label="Statut">'+opts(Object.entries(CST),cF.st,'Tous les statuts')+'</select></div><div class="count">'+rows.length+' candidature'+(rows.length>1?'s':'')+'</div>'+
     (rows.length?'<div class="tw"><table class="rt"><thead><tr><th>Candidat</th><th>Concours</th><th>Diplôme</th><th>Contact</th><th>Reçue le</th><th>Statut</th><th>Actions</th></tr></thead><tbody>'+rows.map(c=>'<tr><td class="ttl" data-label=""><b>'+E(c.nom)+' '+E(c.prenom)+'</b><small>'+E(c.id)+(c.naissance?' · né(e) le '+E(c.naissance):'')+'</small></td><td data-label="Concours">'+E(c.concours||'—')+'</td><td data-label="Diplôme">'+E(c.diplome||'—')+'</td><td data-label="Contact">'+E(c.tel||c.email||'—')+'</td><td data-label="Reçue le">'+E(F.fmt(c.createdAt,false))+'</td><td data-label="Statut"><span class="bd '+c.status+'">'+E(CST[c.status]||c.status)+'</span></td><td data-label="Actions"><div class="act">'+(c.status!=='valide'&&c.status!=='convoque'?'<button class="btn sm green" data-a="valide" data-id="'+E(c.id)+'">Valider</button>':'')+(c.status!=='rejete'?'<button class="btn sm line" data-a="rejete" data-id="'+E(c.id)+'">Rejeter</button>':'')+(c.status==='valide'||c.status==='convoque'?'<button class="btn sm navy" data-a="convoque" data-id="'+E(c.id)+'">'+(c.status==='convoque'?'Convocation':'Convoquer')+'</button>':'')+'</div></td></tr>').join('')+'</tbody></table></div>':'<div class="tw">'+empty('Aucune candidature','Aucune candidature ne correspond aux filtres.')+'</div>');
    $('#cQ').addEventListener('input',e=>{cF.q=e.target.value;const p=e.target.selectionStart;draw();const i=$('#cQ');i.focus();try{i.setSelectionRange(p,p)}catch(x){}});
    $('#cS').addEventListener('change',e=>{cF.st=e.target.value;draw()});
    $('#cPub').onclick=()=>{openModal('Publier les résultats','<p style="margin-bottom:14px">Vous allez publier la liste des candidats <b>validés</b> ('+C.filter(c=>c.status==='valide'||c.status==='convoque').length+') sur le site public.</p><p class="lg-help" style="color:var(--muted);font-size:.86rem;margin-bottom:14px">Action factice de démonstration : aucune donnée n’est réellement diffusée.</p><div class="acts"><button class="btn line" id="pX">Annuler</button><button class="btn gold" id="pOk">Confirmer la publication</button></div>');$('#pX').onclick=closeModal;$('#pOk').onclick=()=>{F.db().resultsPublishedAt=Date.now();F.audit('Publication des résultats','Concours');save();closeModal();toast('Résultats publiés (simulation).');draw()}};
    $$('[data-a]',main).forEach(b=>b.onclick=()=>{
      const c=F.db().candidates.find(x=>x.id===b.dataset.id);if(!c)return;const a=b.dataset.a;
      if(a==='convoque'){if(c.status!=='convoque'){c.status='convoque';c.convocation={date:Date.now()+14*DAY,lieu:'Centre d’examen de Libreville (démonstration)'};F.audit('Convocation candidat',c.id);save();draw()}else if(!c.convocation)c.convocation={date:Date.now()+14*DAY,lieu:'Centre d’examen de Libreville (démonstration)'};convoc(c.id);return}
      c.status=a;F.audit(a==='valide'?'Candidature validée':'Candidature rejetée',c.id);save();toast('Candidature '+c.id+' '+(a==='valide'?'validée':'rejetée')+'.');draw();
    });
  };
  function convoc(id){
    const c=F.db().candidates.find(x=>x.id===id);const cv=c.convocation||{date:Date.now()+14*DAY,lieu:'Centre d’examen de Libreville (démonstration)'};
    openModal('Convocation – '+c.id,'<div id="printArea"><div class="convoc"><h3>République gabonaise – Police nationale</h3><p class="c-sub">Direction des ressources humaines · Concours d’entrée (document de démonstration)</p><p><b>CONVOCATION N° '+E(c.id)+'</b></p><p>Monsieur / Madame <b>'+E(c.prenom)+' '+E(c.nom)+'</b>, candidat(e) au concours <b>'+E(c.concours||'—')+'</b>, est convoqué(e) aux épreuves le <b>'+E(F.fmt(cv.date,false))+'</b> à <b>08 h 00</b>.</p><p>Lieu : <b>'+E(cv.lieu)+'</b>.</p><p>Se présenter muni d’une pièce d’identité et de la présente convocation.</p><div class="sig"><span>Fait à Libreville, le '+E(F.fmt(Date.now(),false))+'</span><span>Le Directeur (signature fictive)</span></div></div></div><div class="acts"><button class="btn line" id="kX">Fermer</button><button class="btn gold" id="kP">'+ic('print')+'Imprimer</button></div>',true);
    $('#kX').onclick=closeModal;$('#kP').onclick=()=>{F.audit('Impression convocation',c.id);save();window.print()};
  }
  draw();
}

/* ======================================================================
   JOURNAL D'AUDIT
   ====================================================================== */
let auQ='';
function viewAudit(main){
  const rowsF=()=>{const q=auQ.trim().toLowerCase();return F.db().audit.filter(a=>!q||(a.user+' '+a.action+' '+a.objet+' '+a.ip).toLowerCase().includes(q))};
  const nm=m=>{const c=F.COMPTES.find(x=>x.matricule===m);return c?c.nom:m};
  main.innerHTML='<div class="ph"><div><h2>Journal d’audit</h2><p>Traçabilité de toutes les actions · conservé et non modifiable en production.</p></div><div class="acts"><button class="btn line" id="auCsv">'+ic('dl')+'Exporter en CSV</button></div></div>'+
   '<div class="fbar"><div class="sch">'+ic('search')+'<input id="auQ" type="search" aria-label="Recherche" placeholder="Filtrer par agent, action, objet…" value="'+E(auQ)+'"></div></div><div class="count" id="auN"></div><div id="auL"></div>';
  const list=()=>{const rows=rowsF();$('#auN').textContent=rows.length+' événement'+(rows.length>1?'s':'');
    $('#auL').innerHTML=rows.length?'<div class="tw"><table class="rt"><thead><tr><th>Date</th><th>Agent</th><th>Action</th><th>Objet</th><th>Adresse IP</th></tr></thead><tbody>'+rows.slice(0,150).map(a=>'<tr><td class="ttl" data-label=""><b>'+E(F.fmt(a.at))+'</b></td><td data-label="Agent">'+E(a.user)+'<small>'+(a.user==='citoyen'?'Usager public':E(nm(a.user)))+'</small></td><td data-label="Action">'+E(a.action)+'</td><td data-label="Objet">'+E(a.objet)+'</td><td data-label="IP">'+E(a.ip)+'</td></tr>').join('')+'</tbody></table></div>':'<div class="tw">'+empty('Aucun événement','Aucune action ne correspond au filtre.')+'</div>'};
  list();
  $('#auQ').addEventListener('input',e=>{auQ=e.target.value;list()});
  $('#auCsv').addEventListener('click',()=>{const rows=rowsF();if(!rows.length)return toast('Aucune donnée à exporter.','warn');csvDownload('journal-audit',[['Date','Agent','Nom','Action','Objet','IP']].concat(rows.map(a=>[F.fmt(a.at),a.user,nm(a.user),a.action,a.objet,a.ip])));F.audit('Export CSV','Journal d’audit');save();toast('Export CSV généré.')});
}

const VIEWS={dashboard:viewDashboard,demandes:viewDemandes,alertes:viewAlertes,courante:viewCourante,rh:viewRH,moyens:viewMoyens,ops:viewOps,concours:viewConcours,audit:viewAudit};

/* ======================================================================
   DÉMARRAGE
   ====================================================================== */
setupShell();initLogin();
(function boot(){
  const p=new URLSearchParams(location.search).get('demo');
  if(p){const k=String(p).toLowerCase();const c=F.COMPTES.find(x=>x.role===k||x.matricule.toLowerCase()===k);
    if(c){const r=F.login(c.matricule,F.PASS,F.CODE2FA);if(r.ok){history.replaceState(null,'',location.pathname+location.hash);enterApp();return}}}
  if(F.session())enterApp();
})();
})();
