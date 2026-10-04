/* Espace Agents — recherche globale, notifications, sélecteur de portée, profil, raccourcis clavier */
(function(){
'use strict';
const AG=window.AG,F=AG.F,E=AG.E,$=AG.$,$$=AG.$$,ic=AG.ic;

/* ---------- Navigation vers un objet ---------- */
const KIND_MOD={demande:'demandes',alerte:'alertes',agent:'rh',vehicule:'moyens',op:'ops'};
AG.goto=function(kind,id){
  const mod=KIND_MOD[kind];if(!AG.mods().includes(mod)){AG.toast('Ce module n’est pas accessible avec votre profil.','warn');return}
  AG.closeAll();$('#cmdk').classList.remove('open');
  if(AG.curId===mod&&AG.openers[kind])AG.openers[kind](id);
  else{AG.pending=[kind,id];location.hash='#/'+mod}
};

/* ---------- Recherche globale ---------- */
let ckItems=[],ckSel=0;
function ckSearch(q){
  q=q.trim().toLowerCase();const d=F.db(),has=m=>AG.mods().includes(m),out=[];
  if(!q)return out;
  const hit=s=>String(s||'').toLowerCase().includes(q);
  if(has('demandes'))AG.scoped(d.requests).filter(r=>hit(r.id)||hit(r.subject)||hit(r.contact&&r.contact.nom)).slice(0,6).forEach(r=>out.push({g:'Demandes',kind:'demande',id:r.id,icon:'demandes',t:r.id+' · '+r.subject,s:((r.contact&&r.contact.nom)||'Anonyme')+' · '+(F.TYPES[r.type]||r.type)}));
  if(has('rh'))AG.scoped(d.agents).filter(a=>hit(a.nom+' '+a.prenom)||hit(a.matricule)||hit(a.badge)).slice(0,6).forEach(a=>out.push({g:'Agents',kind:'agent',id:a.id,icon:'rh',t:a.prenom+' '+a.nom,s:a.matricule+' · '+a.grade+' · '+AG.comNom(a.commissariat)}));
  if(has('moyens'))AG.scoped(d.vehicles).filter(v=>hit(v.immat)||hit(v.modele)||hit(v.id)).slice(0,6).forEach(v=>out.push({g:'Véhicules',kind:'vehicule',id:v.id,icon:'moyens',t:v.modele+' · '+v.immat,s:AG.comNom(v.affectation)+' · '+v.etat}));
  if(has('ops'))AG.scoped(d.ops).filter(o=>hit(o.titre)||hit(o.id)).slice(0,6).forEach(o=>out.push({g:'Opérations',kind:'op',id:o.id,icon:'ops',t:o.id+' · '+o.titre,s:o.statut+' · '+AG.comNom(o.commissariat)}));
  if(has('alertes'))AG.scoped(d.alerts).filter(a=>hit(a.id)||hit(a.quartier)||hit(a.type)).slice(0,4).forEach(a=>out.push({g:'Alertes 177',kind:'alerte',id:a.id,icon:'alertes',t:a.id+' · '+a.type,s:a.quartier+' · '+AG.ago(a.at)}));
  return out;
}
function ckDraw(){
  const q=$('#ckQ').value;ckItems=ckSearch(q);ckSel=0;let h='',g='';
  if(!q.trim())h='<div class="ck-g">Aller à</div>'+AG.mods().map(m=>'<a class="ck-i" href="#/'+m+'" data-nav="1">'+ic(AG.MODS[m].icon)+'<div><b>'+E(AG.MODS[m].label)+'</b></div></a>').join('');
  else if(!ckItems.length)h=AG.empty('Aucun résultat','Essayez un numéro de dossier, un nom, une immatriculation…');
  else ckItems.forEach((it,i)=>{if(it.g!==g){g=it.g;h+='<div class="ck-g">'+E(g)+'</div>'}h+='<button type="button" class="ck-i'+(i===0?' on':'')+'" data-i="'+i+'">'+ic(it.icon)+'<div><b>'+E(it.t)+'</b><small>'+E(it.s)+'</small></div></button>'});
  $('#ckL').innerHTML=h;
}
AG.openSearch=function(){AG.closeAll();const c=$('#cmdk');c.classList.add('open');c.setAttribute('aria-hidden','false');$('#ckQ').value='';ckDraw();setTimeout(()=>$('#ckQ').focus(),30)};
function ckClose(){const c=$('#cmdk');c.classList.remove('open');c.setAttribute('aria-hidden','true')}
function ckGo(i){const it=ckItems[i];if(it){ckClose();AG.goto(it.kind,it.id)}}
function ckMark(){$$('#ckL .ck-i[data-i]').forEach(b=>b.classList.toggle('on',+b.dataset.i===ckSel));const b=$('#ckL .ck-i.on');if(b)b.scrollIntoView({block:'nearest'})}

/* ---------- Notifications ---------- */
AG.notifs=function(){
  const d=F.db(),now=Date.now(),has=m=>AG.mods().includes(m),all=[];
  if(has('alertes'))AG.scoped(d.alerts).filter(a=>a.status==='nouvelle').forEach(a=>all.push({al:1,icon:'alertes',t:'Alerte 177 : '+a.type,s:a.quartier+' · '+AG.ago(a.at),kind:'alerte',id:a.id}));
  if(has('demandes'))AG.scoped(d.requests).filter(r=>(r.status==='recue'||r.status==='transmise')&&now-r.createdAt>48*36e5).sort((a,b)=>a.createdAt-b.createdAt).forEach(r=>all.push({icon:'clock',t:'Demande non traitée > 48 h',s:r.id+' · '+r.subject,kind:'demande',id:r.id}));
  if(has('moyens'))AG.scoped(d.vehicles).filter(v=>v.entretien<now).forEach(v=>all.push({icon:'moyens',t:'Entretien en retard',s:v.modele+' · '+v.immat,kind:'vehicule',id:v.id}));
  return all;
};
function bellDraw(){const n=AG.notifs().length;const b=$('#tbBell');b.innerHTML=ic('bell')+(n?'<span class="badge">'+(n>99?'99+':n)+'</span>':'');b.setAttribute('aria-label','Notifications'+(n?' ('+n+')':''))}
AG.bellDraw=bellDraw;
function notifPanel(){
  const l=AG.notifs();
  const p=AG.panel('Notifications ('+l.length+')',l.length?'<div class="pn-list">'+l.slice(0,30).map((n,i)=>'<button type="button" class="pn-i" data-n="'+i+'"><span class="ni'+(n.al?' al':'')+'">'+ic(n.icon)+'</span><div><b>'+E(n.t)+'</b><small>'+E(n.s)+'</small></div></button>').join('')+'</div>':AG.empty('Tout est à jour','Aucune alerte ni retard à signaler dans votre portée.','check'));
  p.onclick=e=>{const b=e.target.closest('[data-n]');if(b){const n=l[+b.dataset.n];AG.closePanel();AG.goto(n.kind,n.id)}};
}

/* ---------- Portée ---------- */
function scopePanel(){
  const s0=AG.scope();
  if(s0.lock==='com'){AG.toast('Portée verrouillée sur votre commissariat.','warn');return}
  const draw=()=>{
    const s=AG.scope();const provs=s0.lock==='prov'?F.PROVINCES.filter(p=>p.id===s0.prov):F.PROVINCES;
    let h='<p class="lg-help" style="color:var(--muted);font-size:.84rem;margin-bottom:10px">'+(s0.lock==='prov'?'Votre portée est verrouillée sur votre province ; vous pouvez affiner par commissariat.':'Le choix filtre tous les modules et le tableau de bord.')+'</p><div class="pn-list">';
    if(!s0.lock)h+='<button type="button" class="pn-i'+(!s.prov?' on':'')+'" data-p=""><span class="ni">'+ic('globe')+'</span><div><b>Tout le pays</b><small>9 provinces</small></div></button>';
    provs.forEach(p=>{h+='<button type="button" class="pn-i'+(s.prov===p.id&&!s.com?' on':'')+'" data-p="'+p.id+'"><span class="ni">'+ic('pin')+'</span><div><b>'+E(p.nom)+'</b><small>Chef-lieu : '+E(p.chef)+'</small></div></button>';
      if(s.prov===p.id){h+='<div style="margin-left:18px;display:grid;gap:6px">'+F.commissariatsOf(p.id).map(c=>'<button type="button" class="pn-i'+(s.com===c.id?' on':'')+'" data-c="'+c.id+'" style="min-height:42px"><div><b>'+E(c.nom)+'</b></div></button>').join('')+'</div>'}});
    const p=AG.panel('Portée : '+AG.scopeLabel(),h+'</div>',true);
    p.onclick=e=>{const b=e.target.closest('button[data-p],button[data-c]');if(!b)return;
      if(b.dataset.c!=null){AG.setScope(s.prov,b.dataset.c);AG.closePanel();return}
      const id=b.dataset.p;AG.setScope(id,'');if(!id)AG.closePanel();else draw()};
  };
  draw();
}

/* ---------- Profil ---------- */
function profilePanel(){
  const m=AG.me,s=F.db().audit.filter(a=>a.user===m.matricule&&a.action==='Connexion');
  const prev=s[1]?F.fmt(s[1].at):'Première connexion';
  const p=AG.panel('Mon profil','<div class="prof"><dl><dt>Nom</dt><dd>'+E(m.nom)+'</dd><dt>Matricule</dt><dd>'+E(m.matricule)+'</dd><dt>Grade</dt><dd>'+E(m.grade)+'</dd><dt>Poste</dt><dd>'+E(m.poste)+'</dd><dt>Rôle</dt><dd>'+E(F.ROLES[m.role].l)+'</dd><dt>Portée</dt><dd>'+E(AG.scopeLabel())+(AG.scope().lock?' (verrouillée)':'')+'</dd><dt>Dernière connexion</dt><dd>'+E(prev)+'</dd></dl>'+
    '<div style="display:grid;gap:8px"><button class="btn line block" id="pfReset">'+ic('refresh')+'Réinitialiser les données de démo</button><button class="btn navy block" id="pfOut">'+ic('exit')+'Sortir</button></div></div>');
  $('#pfOut',p).onclick=()=>AG.logout();
  $('#pfReset',p).onclick=()=>{AG.closePanel();AG.confirm('Réinitialiser les données de démo','Toutes les modifications faites dans la démonstration (demandes, alertes, notes…) seront effacées et les données fictives d’origine rétablies.','Réinitialiser',()=>{const mm=AG.me;F.reset();F.db().session=Object.assign({at:Date.now()},F.COMPTES.find(c=>c.matricule===mm.matricule));F.save();location.reload()})};
}

AG.initTools=function(){
  $('#ckQ').addEventListener('input',ckDraw);
  $('#ckX').onclick=ckClose;$('#cmdk').addEventListener('mousedown',e=>{if(e.target.id==='cmdk')ckClose()});
  $('#ckL').addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(b)ckGo(+b.dataset.i);else if(e.target.closest('[data-nav]'))ckClose()});
  $('#ckQ').addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();ckSel=Math.min(ckItems.length-1,ckSel+1);ckMark()}else if(e.key==='ArrowUp'){e.preventDefault();ckSel=Math.max(0,ckSel-1);ckMark()}else if(e.key==='Enter'){e.preventDefault();ckGo(ckSel)}else if(e.key==='Escape')ckClose()});
  $('#srchBtn').onclick=AG.openSearch;$('#tbBell').onclick=notifPanel;$('#scopeBtn').onclick=scopePanel;
  $('#tbUser').onclick=profilePanel;$('#sideUser').onclick=profilePanel;$('#panelScrim').onclick=AG.closePanel;
  let g=0;
  document.addEventListener('keydown',e=>{
    if(!AG.me)return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();AG.openSearch();return}
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    const tg=e.target.tagName;if(/INPUT|TEXTAREA|SELECT/.test(tg)||e.target.isContentEditable)return;
    if(e.key==='/'){e.preventDefault();AG.openSearch();return}
    if(g&&Date.now()-g<1300){g=0;const m=Object.values(AG.MODS).find(x=>x.key===e.key.toLowerCase()&&AG.mods().includes(x.id));if(m){e.preventDefault();location.hash='#/'+m.id}return}
    if(e.key==='g')g=Date.now();
  });
};
})();
