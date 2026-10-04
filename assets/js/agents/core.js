/* Espace Agents — noyau : état, utilitaires, tiroir/modale/panneau, portée, filtres en cascade. Données fictives. */
(function(){
'use strict';
const F=window.FPN, E=F.esc;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const AG=window.AG={F,E,$,$$,DAY:864e5,STORE_KEY:'fpn_demo_v2',MODS:{},openers:{},me:null,cur:null};

/* ---------- Icônes (trait 2 px arrondi) ---------- */
const ICON={
 dashboard:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
 demandes:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
 alertes:'<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
 courante:'<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5z"/><path d="M8 7h8M8 11h8"/>',
 rh:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14.5a5 5 0 0 1 4.5 5"/>',
 moyens:'<path d="M5 17h14M3 13l2-6h14l2 6v4H3z"/><circle cx="7.5" cy="17" r="1.8"/><circle cx="16.5" cy="17" r="1.8"/>',
 ops:'<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/>',
 concours:'<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 22l5-3 5 3-1.5-8"/>',
 audit:'<path d="M9 3h6l1 2h3v16H5V5h3z"/><path d="M9 12h6M9 16h4"/>',
 messages:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
 rapports:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
 back:'<path d="M15 5l-7 7 7 7"/>', exit:'<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
 plus:'<path d="M12 5v14M5 12h14"/>', dl:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
 search:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>', menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 print:'<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>', info:'<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>',
 clip:'<path d="M20 11l-8.5 8.5a5 5 0 0 1-7-7L13 4a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4L14 7"/>',
 file:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
 image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-9 9"/>',
 bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
 pin:'<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>', clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 send:'<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>', table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>',
 kanban:'<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/>',
 refresh:'<path d="M20 11a8 8 0 0 0-14-4L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4l2-2M20 20v-5h-5"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 up:'<path d="M7 14l5-5 5 5"/>', down:'<path d="M7 10l5 5 5-5"/>',
 key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>', trend:'<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>'
};
AG.ICON=ICON;
AG.ic=n=>'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">'+(ICON[n]||'')+'</svg>';
const ic=AG.ic;

/* ---------- Modules ---------- */
AG.register=function(id,def){AG.MODS[id]=Object.assign({id,icon:id,short:def.label},def)};

/* ---------- Utilitaires ---------- */
AG.ago=t=>{const m=Math.round((Date.now()-t)/6e4);if(m<1)return 'à l’instant';if(m<60)return 'il y a '+m+' min';const h=Math.round(m/60);if(h<24)return 'il y a '+h+' h';const d=Math.round(h/24);return 'il y a '+d+' j'};
AG.comNom=id=>F.commissariat(id).nom;
AG.provNom=id=>F.province(id).nom;
AG.opts=(list,sel,empty)=>(empty!=null?'<option value="">'+E(empty)+'</option>':'')+list.map(o=>{const v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return '<option value="'+E(v)+'"'+(String(v)===String(sel)?' selected':'')+'>'+E(l)+'</option>'}).join('');
AG.stBadge=k=>{const s=F.statut(k);return '<span class="bd '+s.c+'">'+E(s.l)+'</span>'};
AG.empty=(t,s,icon)=>'<div class="empty"><div class="ei">'+ic(icon||'search')+'</div><b>'+E(t)+'</b><span>'+E(s||'')+'</span></div>';
AG.userName=()=>AG.me?AG.me.nom:'Agent';
AG.save=()=>F.save();
AG.log=(a,o)=>{F.audit(a,o);F.save()};
AG.tl=list=>'<ul class="tlist">'+list.map(t=>'<li'+(t.note?' class="n"':'')+'><b>'+E(t.text)+'</b><small>'+E(F.fmt(t.at))+(t.by?' · '+E(t.by):'')+(t.note?' · Réponse à l’usager':'')+'</small></li>').join('')+'</ul>';
AG.plural=(n,s,p)=>n+' '+(n>1?(p||s+'s'):s);
AG.toast=function(msg,type){const t=document.createElement('div');t.className='toast '+(type||'ok');t.textContent=msg;$('#toasts').appendChild(t);setTimeout(()=>{t.style.opacity='0';t.style.transition='.3s';setTimeout(()=>t.remove(),320)},3600)};
AG.csv=function(name,rows){
  const body=rows.map(r=>r.map(c=>{c=String(c==null?'':c);return /[";\n\r]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c}).join(';')).join('\r\n');
  const blob=new Blob(['﻿'+body],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=name+'-'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
};
AG.beep=function(){try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;const c=new A(),o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=880;g.gain.value=.05;o.connect(g);g.connect(c.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.35);o.stop(c.currentTime+.4);setTimeout(()=>c.close&&c.close(),600)}catch(e){}};
/* Relit la base partagée (autres onglets) en mettant à jour l'objet en place */
AG.sync=function(){try{const raw=localStorage.getItem(AG.STORE_KEY);if(!raw)return;const fresh=JSON.parse(raw),d=F.db();Object.keys(d).forEach(k=>delete d[k]);Object.assign(d,fresh);if(AG.me&&!d.session)d.session=AG.me}catch(e){}};
/* Notes de service : créées au besoin dans la base (additif, sans toucher au store) */
AG.messages=function(){const d=F.db();if(!d.messages){const t=Date.now(),DAY=AG.DAY;d.messages=[
 {id:'NS-003',at:t-DAY*1,from:'État-major',titre:'Dispositif de sécurité – week-end',important:true,texte:'Renforcement des patrouilles de nuit dans les grandes villes de chaque province. Les chefs de commissariat confirment les effectifs avant vendredi 16 h. (Note fictive de démonstration.)',province:'',com:''},
 {id:'NS-002',at:t-DAY*4,from:'Direction des services administratifs',titre:'Mise à jour des dotations',important:false,texte:'Les dotations de véhicules et de matériel sont à recenser dans le module Moyens avant la fin du mois.',province:'',com:''},
 {id:'NS-001',at:t-DAY*9,from:'Direction provinciale – Estuaire',titre:'Rappel : main courante',important:false,texte:'Chaque intervention doit être consignée dans la main courante numérique le jour même.',province:'estuaire',com:''}];
 d.chat=[{at:t-36e5*5,de:'CMD-001',nom:'Cdt. Démo Commandement',texte:'Bonjour à tous, merci de remonter les alertes 177 non traitées avant 18 h.'}];F.save()}return d.messages};

/* ---------- Tiroir / modale / panneau / feuille ---------- */
let drawerCb=null,lastFocus=null;
AG.drawerOpen=()=>$('#drawer').classList.contains('open');
AG.drawer=function(title,html,onClose){lastFocus=document.activeElement;drawerCb=onClose||null;$('#drawerTitle').textContent=title;$('#drawerBody').innerHTML=html;$('#drawer').classList.add('open');$('#drawer').setAttribute('aria-hidden','false');$('#scrim').classList.add('on');document.body.classList.add('lock');$('#drawerBody').scrollTop=0;setTimeout(()=>$('#drawerClose').focus(),60)};
AG.setDrawer=function(html){const b=$('#drawerBody');const y=b.scrollTop;b.innerHTML=html;b.scrollTop=y};
AG.closeDrawer=function(){if(!AG.drawerOpen())return;$('#drawer').classList.remove('open');$('#drawer').setAttribute('aria-hidden','true');$('#scrim').classList.remove('on');document.body.classList.remove('lock');const cb=drawerCb;drawerCb=null;if(cb)cb();if(lastFocus&&lastFocus.focus&&document.contains(lastFocus))try{lastFocus.focus()}catch(e){}};
AG.modalOpen=()=>$('#modal').classList.contains('open');
AG.modal=function(title,html,wide){$('#modalTitle').textContent=title;$('#modalBody').innerHTML=html;$('#modalCard').classList.toggle('wide',!!wide);$('#modal').classList.add('open');$('#modal').setAttribute('aria-hidden','false');document.body.classList.add('lock');setTimeout(()=>{const f=$('#modalBody input:not([type=file]),#modalBody select,#modalBody textarea,#modalBody button');if(f)f.focus()},60)};
AG.closeModal=function(){$('#modal').classList.remove('open');$('#modal').setAttribute('aria-hidden','true');if(!AG.drawerOpen())document.body.classList.remove('lock')};
AG.confirm=function(title,text,okLabel,onOk){AG.modal(title,'<p style="margin-bottom:16px">'+text+'</p><div class="acts"><button class="btn line" id="cfX">Annuler</button><button class="btn gold" id="cfOk">'+E(okLabel||'Confirmer')+'</button></div>');$('#cfX').onclick=AG.closeModal;$('#cfOk').onclick=()=>{AG.closeModal();onOk()}};
AG.panelOpen=()=>$('#panel').classList.contains('open');
AG.panel=function(title,html,left){const p=$('#panel');p.innerHTML='<div class="pn-h"><span>'+E(title)+'</span><button type="button" class="x" id="pnX" aria-label="Fermer" style="width:38px;height:38px">&times;</button></div><div class="pn-b">'+html+'</div>';p.classList.toggle('left',!!left);p.classList.add('open');p.setAttribute('aria-hidden','false');$('#panelScrim').classList.add('on');$('#pnX').onclick=AG.closePanel;return p};
AG.closePanel=function(){$('#panel').classList.remove('open');$('#panel').setAttribute('aria-hidden','true');$('#panelScrim').classList.remove('on')};
AG.openSheet=()=>{$('#sheet').classList.add('open');$('#sheet').setAttribute('aria-hidden','false')};
AG.closeSheet=()=>{$('#sheet').classList.remove('open');$('#sheet').setAttribute('aria-hidden','true')};
AG.closeAll=()=>{AG.closeDrawer();AG.closeModal();AG.closePanel();AG.closeSheet()};

/* ---------- Portée (pays → province → commissariat) ---------- */
let sc={prov:'',com:''};
function lockInfo(){const m=AG.me;if(!m)return{lock:''};
  if(m.role==='agent'||m.role==='chef')return{prov:m.province,com:m.commissariat,lock:'com'};
  if(m.role==='provincial')return{prov:m.province,lock:'prov'};return{lock:''}}
AG.scope=function(){const l=lockInfo();if(l.lock==='com')return{prov:l.prov,com:l.com,lock:'com'};
  const prov=l.lock==='prov'?l.prov:sc.prov;let com=sc.com;if(!prov||(com&&F.provinceOf(com)!==prov))com='';return{prov,com,lock:l.lock}};
AG.scopeKey=()=>'fpn_scope_'+(AG.me?AG.me.matricule:'x');
AG.loadScope=function(){try{sc=JSON.parse(localStorage.getItem(AG.scopeKey())||'null')||{prov:'',com:''}}catch(e){sc={prov:'',com:''}}};
AG.setScope=function(prov,com){if(AG.scope().lock==='com')return;sc={prov:prov||'',com:com||''};try{localStorage.setItem(AG.scopeKey(),JSON.stringify(sc))}catch(e){}document.dispatchEvent(new Event('ag-scope'))};
AG.scopeLabel=function(){const s=AG.scope();if(s.com)return AG.comNom(s.com);if(s.prov)return 'Province '+AG.provNom(s.prov);return 'Tout le pays'};
AG.inScope=function(it){const s=AG.scope();const c=it.commissariat||it.affectation;const p=it.province||(c?F.provinceOf(c):'');
  if(s.com&&c)return c===s.com;if(s.prov)return p===s.prov;return true};
AG.scoped=list=>list.filter(AG.inScope);

/* ---------- Filtres province → commissariat en cascade ---------- */
AG.cascade=function(pfx,st){const s=AG.scope();let h='';const provs=F.PROVINCES.map(p=>[p.id,p.nom]);
  if(s.prov||s.com)st.prov='';if(s.com)st.com='';
  if(!s.prov&&!s.com)h+='<select id="'+pfx+'P" aria-label="Province">'+AG.opts(provs,st.prov,'Toutes les provinces')+'</select>';
  if(!s.com){const p=s.prov||st.prov;const list=(p?F.commissariatsOf(p):F.COMMISSARIATS);if(st.com&&!list.some(c=>c.id===st.com))st.com='';
    h+='<select id="'+pfx+'C" aria-label="Commissariat">'+AG.opts(list.map(c=>[c.id,c.nom]),st.com,'Tous les commissariats')+'</select>'}
  return h};
AG.cascadeBind=function(root,pfx,st,cb){const P=$('#'+pfx+'P',root),C=$('#'+pfx+'C',root);
  if(P)P.onchange=()=>{st.prov=P.value;st.com='';if(C)C.innerHTML=AG.opts((st.prov?F.commissariatsOf(st.prov):F.COMMISSARIATS).map(c=>[c.id,c.nom]),'','Tous les commissariats');cb()};
  if(C)C.onchange=()=>{st.com=C.value;cb()}};
AG.inCascade=function(it,st){const c=it.commissariat||it.affectation;const p=it.province||(c?F.provinceOf(c):'');
  if(st.com&&c)return c===st.com;if(st.prov)return p===st.prov;return true};
/* Création : province puis commissariat (selon la portée de l'agent) */
AG.provCom=function(pfx,prov,com){const s=AG.scope();
  if(!prov)prov=com?F.provinceOf(com):(s.prov||'estuaire');
  if(s.lock==='com'){prov=s.prov;com=s.com}else if(s.lock==='prov')prov=s.prov;
  else if(s.com&&!com)com=s.com;
  const list=F.commissariatsOf(prov);if(!com||F.provinceOf(com)!==prov)com=(list.find(c=>c.type!=='Service')||list[0]).id;
  const dP=s.lock?' disabled':'',dC=s.lock==='com'?' disabled':'';
  return '<div class="f2"><div class="fld"><label for="'+pfx+'P">Province</label><select id="'+pfx+'P"'+dP+'>'+AG.opts(F.PROVINCES.map(p=>[p.id,p.nom]),prov)+'</select></div>'+
   '<div class="fld"><label for="'+pfx+'C">Commissariat</label><select id="'+pfx+'C"'+dC+'>'+AG.opts(list.map(c=>[c.id,c.nom]),com)+'</select></div></div>'};
AG.provComBind=function(root,pfx){const P=$('#'+pfx+'P',root),C=$('#'+pfx+'C',root);P.onchange=()=>{C.innerHTML=AG.opts(F.commissariatsOf(P.value).map(c=>[c.id,c.nom]),'')}};
AG.provComVal=pfx=>{const c=$('#'+pfx+'C').value;return{commissariat:c,province:F.provinceOf(c)}};

document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(AG.modalOpen())AG.closeModal();else if(AG.panelOpen())AG.closePanel();else if(AG.drawerOpen())AG.closeDrawer();else AG.closeSheet()});
})();
