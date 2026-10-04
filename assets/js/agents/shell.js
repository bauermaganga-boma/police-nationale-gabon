/* Espace Agents — connexion, coque, routeur, démarrage (chargé en dernier) */
(function(){
'use strict';
const AG=window.AG,F=AG.F,E=AG.E,$=AG.$,$$=AG.$$,ic=AG.ic;
const ORDER=['dashboard','demandes','alertes','courante','rh','moyens','ops','messages','rapports','concours','audit'];
const REPORT_ROLES=['commandement','provincial','chef','admin'];
let pollT=null,known=new Set();
AG.mods=function(){const r=AG.me.role,base=F.ROLES[r].mods;return ORDER.filter(m=>AG.MODS[m]&&(base.includes(m)||m==='messages'||(m==='rapports'&&REPORT_ROLES.includes(r))))};
const home=()=>AG.mods()[0];
const routeId=()=>{const m=(location.hash||'').match(/^#\/([a-z]+)/);return m?m[1]:''};

/* ---------- Connexion ---------- */
const DEMO_LABEL={commandement:'Commandement',provincial:'Direction provinciale',chef:'Chef de commissariat',agent:'Agent de terrain',rh:'Ressources humaines',admin:'Admin / audit'};
let pend=null;
function initLogin(){
  $('#demoBtns').innerHTML=F.COMPTES.map(c=>'<button type="button" class="demo-b" data-m="'+E(c.matricule)+'"><em>Entrer en un clic</em><b>'+E(DEMO_LABEL[c.role]||F.ROLES[c.role].l)+'</b><small>'+E(c.matricule)+' · '+E(c.nom)+'</small></button>').join('');
  $('#demoBtns').addEventListener('click',e=>{const b=e.target.closest('.demo-b');if(!b)return;if(F.login(b.dataset.m,F.PASS,F.CODE2FA).ok)enterApp()});
  $('#pwToggle').addEventListener('click',()=>{const i=$('#pwd'),s=i.type==='password';i.type=s?'text':'password';$('#pwToggle').textContent=s?'Masquer':'Afficher';$('#pwToggle').setAttribute('aria-label',s?'Masquer le mot de passe':'Afficher le mot de passe')});
  $('#f1').addEventListener('submit',e=>{
    e.preventDefault();const m=$('#mat').value.trim().toUpperCase(),p=$('#pwd').value,er=$('#e1');
    if(!m||!p){er.textContent='Renseignez votre matricule et votre mot de passe.';er.hidden=false;return}
    if(!(F.COMPTES.some(c=>c.matricule===m)&&p===F.PASS)){er.textContent='Matricule ou mot de passe incorrect.';er.hidden=false;return}
    er.hidden=true;pend={m,p};$('#f1').hidden=true;$('#f2').hidden=false;$('#code').value='';$('#code').focus();
  });
  $('#f2').addEventListener('submit',e=>{e.preventDefault();const er=$('#e2'),r=F.login(pend.m,pend.p,$('#code').value.trim());
    if(!r.ok){er.textContent=r.err;er.hidden=false;$('#code').select();return}er.hidden=true;enterApp()});
  $('#f2back').addEventListener('click',()=>{$('#f2').hidden=true;$('#f1').hidden=false;$('#pwd').value='';$('#mat').focus()});
}

/* ---------- Coque ---------- */
function scopeBtn(){const s=AG.scope(),b=$('#scopeBtn');b.classList.toggle('lock',!!s.lock);b.innerHTML=ic(s.lock?'lock':'pin')+'<span>'+E(AG.scopeLabel())+'</span>';b.setAttribute('aria-label','Portée : '+AG.scopeLabel()+(s.lock?' (verrouillée)':'. Changer'))}
function enterApp(){
  AG.me=F.session();if(!AG.me)return;const me=AG.me;
  $('#login').hidden=true;$('#app').hidden=false;AG.loadScope();
  const lbl=F.ROLES[me.role].l;
  $('#sideUser').innerHTML='<b>'+E(me.nom)+'</b><span>'+E(me.grade)+' · '+E(lbl)+'</span>';
  $('#tbUser').innerHTML='<b>'+E(me.nom)+'</b>'+E(me.grade)+' · '+E(lbl);
  $$('[data-out]').forEach(b=>{b.innerHTML=ic('exit')+'<span>Sortir</span>'});
  $('.tb-site').innerHTML=ic('globe')+'<span class="lbl-site">Site</span>';
  $('#srchBtn').innerHTML=ic('search')+'<span class="lbl">Rechercher</span><kbd>Ctrl K</kbd>';
  const links=AG.mods().map(m=>'<a href="#/'+m+'" data-m="'+m+'">'+ic(AG.MODS[m].icon)+'<span>'+E(AG.MODS[m].label)+'</span></a>').join('');
  $('#sideNav').innerHTML=links;$('#sheetList').innerHTML=links;buildBnav();scopeBtn();AG.bellDraw();
  known=new Set(F.db().alerts.map(a=>a.id));
  if(!location.hash||!AG.mods().includes(routeId()))location.hash='#/'+home();
  route();
  if(pollT)clearInterval(pollT);
  pollT=setInterval(tick,5000);
}
function buildBnav(){
  const ms=AG.mods();let main=ms,extra=[];if(ms.length>5){main=ms.slice(0,4);extra=ms.slice(4)}
  $('#bnav').innerHTML=main.map(m=>'<a href="#/'+m+'" data-m="'+m+'">'+ic(AG.MODS[m].icon)+'<span>'+E(AG.MODS[m].short)+'</span></a>').join('')+(extra.length?'<button type="button" id="bnMore" aria-haspopup="dialog" data-extra="'+extra.join(',')+'">'+ic('more')+'<span>Plus</span></button>':'');
  const b=$('#bnMore');if(b)b.addEventListener('click',AG.openSheet);
}
function route(){
  if(!AG.me)return;
  let id=routeId();if(!AG.mods().includes(id)){id=home();history.replaceState(null,'','#/'+id)}
  AG.closeAll();if(AG.cur&&AG.cur.destroy)AG.cur.destroy();AG.cur=null;AG.curId=id;AG.sync();
  const m=AG.MODS[id];document.title=m.label+' – Espace Agents · Forces de Police Nationale (FPN)';
  $('#tbTitle').innerHTML='<span class="long">'+E(m.label)+'</span><span class="short">'+E(m.short==='Accueil'?m.label:m.short)+'</span>';
  $$('#sideNav a,#bnav a,#sheetList a').forEach(a=>{const on=a.dataset.m===id;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  const more=$('#bnMore');if(more)more.classList.toggle('on',more.dataset.extra.split(',').includes(id));
  const L=$('#tbLeft');
  if(id!==home()){L.innerHTML=ic('back')+'<span>Retour</span>';L.setAttribute('aria-label','Retour au tableau de bord');L.dataset.act='back'}
  else{L.innerHTML=ic('menu')+'<span>Menu</span>';L.setAttribute('aria-label','Ouvrir le menu');L.dataset.act='menu'}
  render();
  if(AG.pending){const [k,i]=AG.pending;AG.pending=null;if(AG.openers[k])AG.openers[k](i)}
}
function render(){
  const main=$('#main');main.innerHTML='';window.scrollTo(0,0);
  try{AG.cur=AG.MODS[AG.curId].render(main)||null}catch(err){console.error(err);main.innerHTML=AG.empty('Une erreur est survenue','Rechargez la page.')}
}
function tick(){
  AG.sync();
  const fresh=AG.scoped(F.db().alerts).filter(a=>!known.has(a.id));
  F.db().alerts.forEach(a=>known.add(a.id));
  if(fresh.length&&AG.curId!=='alertes'&&AG.mods().includes('alertes')){AG.beep();AG.toast('Nouvelle alerte 177 : '+fresh[0].type+(fresh.length>1?' (+'+(fresh.length-1)+')':''),'warn')}
  AG.bellDraw();if(AG.cur&&AG.cur.poll)AG.cur.poll();
}
AG.logout=function(){if(pollT)clearInterval(pollT);if(AG.cur&&AG.cur.destroy)AG.cur.destroy();F.logout();AG.me=null;location.href='index.html'};
function setup(){
  $('#tbLeft').addEventListener('click',()=>{if($('#tbLeft').dataset.act==='back')location.hash='#/'+home();else AG.openSheet()});
  $$('[data-out]').forEach(b=>b.addEventListener('click',AG.logout));
  $('#drawerClose').addEventListener('click',AG.closeDrawer);$('#scrim').addEventListener('click',AG.closeDrawer);
  $('#modalClose').addEventListener('click',AG.closeModal);$('#modal').addEventListener('mousedown',e=>{if(e.target.id==='modal')AG.closeModal()});
  $('#sheetClose').addEventListener('click',AG.closeSheet);$('#sheet').addEventListener('click',e=>{if(e.target.id==='sheet'||e.target.closest('a'))AG.closeSheet()});
  window.addEventListener('hashchange',route);
  document.addEventListener('ag-scope',()=>{scopeBtn();AG.bellDraw();AG.closePanel();render()});
  AG.initTools();
}
setup();initLogin();
(function boot(){
  const p=new URLSearchParams(location.search).get('demo');
  if(p){const k=String(p).toLowerCase(),c=F.COMPTES.find(x=>x.role===k||x.matricule.toLowerCase()===k);
    if(c&&F.login(c.matricule,F.PASS,F.CODE2FA).ok){history.replaceState(null,'',location.pathname+location.hash);enterApp();return}}
  if(F.session())enterApp();
})();
})();
