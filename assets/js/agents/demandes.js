/* Espace Agents — demandes citoyennes : tableau, kanban, tri, pagination, actions groupées */
(function(){
'use strict';
const AG=window.AG,F=AG.F,E=AG.E,$=AG.$,$$=AG.$$,ic=AG.ic;
const st={q:'',type:'',status:'',prov:'',com:'',view:'table',sort:'date',dir:-1,page:1};
const PER=25;
const nm=r=>(r.contact&&r.contact.nom)||'Anonyme';
const KEYS={id:r=>r.id,date:r=>r.createdAt,type:r=>F.TYPES[r.type]||r.type,subject:r=>r.subject,name:r=>nm(r),com:r=>AG.comNom(r.commissariat),prio:r=>r.priority==='haute'?1:0,status:r=>F.STATUTS.findIndex(s=>s.k===r.status)};
function filt(){
  const q=st.q.trim().toLowerCase();
  const k=KEYS[st.sort]||KEYS.date;
  return AG.scoped(F.db().requests).filter(r=>(!st.type||r.type===st.type)&&(!st.status||r.status===st.status)&&AG.inCascade(r,st)&&(!q||r.id.toLowerCase().includes(q)||nm(r).toLowerCase().includes(q)||(r.subject||'').toLowerCase().includes(q)))
   .sort((a,b)=>{const x=k(a),y=k(b);return (x>y?1:x<y?-1:0)*st.dir});
}
function comOptGroups(){return F.PROVINCES.map(p=>'<optgroup label="'+E(p.nom)+'">'+F.commissariatsOf(p.id).map(c=>'<option value="'+c.id+'">'+E(c.nom)+'</option>').join('')+'</optgroup>').join('')}
function view(main){
  const sel=new Set();
  const th=(k,l)=>'<th data-sort="'+k+'" aria-sort="'+(st.sort===k?(st.dir>0?'ascending':'descending'):'none')+'">'+l+(st.sort===k?(st.dir>0?' ▲':' ▼'):'')+'</th>';
  main.innerHTML='<div class="ph"><div><h2>Demandes citoyennes</h2><p>Pré-plaintes, signalements, messages, objets perdus et rendez-vous reçus depuis le site public.</p></div><div class="acts"><div class="seg" role="group" aria-label="Affichage"><button type="button" data-v="table">'+ic('table')+'Tableau</button><button type="button" data-v="kanban">'+ic('kanban')+'Kanban</button></div><button class="btn line" id="dmCsv">'+ic('dl')+'Exporter en CSV</button></div></div>'+
   '<div class="fbar"><div class="sch"><label class="sr" for="dmQ">Recherche</label>'+ic('search')+'<input id="dmQ" type="search" placeholder="Rechercher un n°, un nom, un sujet…" value="'+E(st.q)+'"></div>'+
   '<select id="dmT" aria-label="Type">'+AG.opts(Object.entries(F.TYPES),st.type,'Tous les types')+'</select>'+
   '<select id="dmS" aria-label="Statut">'+AG.opts(F.STATUTS.map(s=>[s.k,s.l]),st.status,'Tous les statuts')+'</select><span id="dmCas" style="display:contents">'+AG.cascade('dm',st)+'</span></div>'+
   '<div class="count" id="dmN"></div><div id="dmBulk"></div><div id="dmL"></div>';
  const refresh=()=>{sel.clear();draw()};
  function bulk(){
    const b=$('#dmBulk');
    if(!sel.size){b.innerHTML='';return}
    b.innerHTML='<div class="bulk"><b>'+AG.plural(sel.size,'sélectionnée')+'</b><select id="bkS" aria-label="Nouveau statut">'+AG.opts(F.STATUTS.map(s=>[s.k,s.l]),'','Changer le statut…')+'</select><select id="bkC" aria-label="Affecter à">'+'<option value="">Affecter à…</option>'+comOptGroups()+'</select><button class="btn gold sm" id="bkGo">Appliquer</button><button class="btn line sm" id="bkX">Annuler</button></div>';
    $('#bkX').onclick=()=>{sel.clear();draw()};
    $('#bkGo').onclick=()=>{const s=$('#bkS').value,c=$('#bkC').value;if(!s&&!c)return AG.toast('Choisissez un statut ou une affectation.','warn');
      const u=AG.userName();sel.forEach(id=>{const r=F.db().requests.find(x=>x.id===id);if(!r)return;
        if(c){r.commissariat=c;r.province=F.provinceOf(c);r.assignee=u;r.timeline.push({at:Date.now(),status:r.status,text:'Réaffectée au '+AG.comNom(c)+'.',by:u})}
        if(s&&s!==r.status){r.status=s;r.timeline.push({at:Date.now(),status:s,text:'Statut : '+F.statut(s).l+'.',by:u})}});
      AG.log('Action groupée',sel.size+' demande(s)');AG.toast(AG.plural(sel.size,'demande modifiée','demandes modifiées'));sel.clear();draw();AG.bellDraw()};
  }
  function table(rows){
    const pages=Math.max(1,Math.ceil(rows.length/PER));if(st.page>pages)st.page=pages;
    const sl=rows.slice((st.page-1)*PER,st.page*PER);
    return '<div class="tw"><table class="rt"><thead><tr><th class="ck"><input type="checkbox" id="dmAll" aria-label="Tout sélectionner"></th>'+th('id','N°')+th('date','Date')+th('type','Type')+th('subject','Objet')+th('name','Demandeur')+th('com','Commissariat')+th('prio','Priorité')+th('status','Statut')+'<th>Délai</th></tr></thead><tbody>'+
     sl.map(r=>'<tr tabindex="0" data-id="'+E(r.id)+'" class="'+(sel.has(r.id)?'sel':'')+'" aria-label="Ouvrir la demande '+E(r.id)+'"><td class="ck" data-label=""><input type="checkbox" data-ck="'+E(r.id)+'" aria-label="Sélectionner '+E(r.id)+'"'+(sel.has(r.id)?' checked':'')+'></td><td class="ttl" data-label=""><b>'+E(r.id)+'</b> '+AG.files.badge(r.files)+'</td><td data-label="Date">'+E(F.fmt(r.createdAt,false))+'</td><td data-label="Type">'+E(F.TYPES[r.type]||r.type)+'</td><td data-label="Objet">'+E(r.subject)+'</td><td data-label="Demandeur">'+E(nm(r))+'</td><td data-label="Commissariat">'+E(AG.comNom(r.commissariat))+'<small>'+E(AG.provNom(r.province))+'</small></td><td data-label="Priorité">'+(r.priority==='haute'?'<span class="bd haute">Prioritaire</span>':'<span class="bd">Normale</span>')+'</td><td data-label="Statut">'+AG.stBadge(r.status)+'</td><td data-label="Délai">'+(AG.delay(r)||'—')+'</td></tr>').join('')+
     '</tbody></table>'+(pages>1?'<div class="pager"><button class="btn sm line" data-pg="-1"'+(st.page<=1?' disabled':'')+'>&larr; Précédent</button><span>Page '+st.page+' / '+pages+'</span><button class="btn sm line" data-pg="1"'+(st.page>=pages?' disabled':'')+'>Suivant &rarr;</button></div>':'')+'</div>';
  }
  function kanban(rows){
    return '<div class="kb">'+F.STATUTS.map((s,i)=>{const col=rows.filter(r=>r.status===s.k);
      return '<div class="kcol" data-col="'+s.k+'"><h4><span>'+E(s.l)+'</span><span class="bd '+s.c+'">'+col.length+'</span></h4>'+col.slice(0,30).map(r=>'<div class="kcard" draggable="true" tabindex="0" data-id="'+E(r.id)+'"><b>'+E(r.subject)+'</b><small>'+E(r.id)+' · '+E(nm(r))+'</small><small>'+E(AG.comNom(r.commissariat))+'</small><div class="kf">'+(r.priority==='haute'?'<span class="bd haute">Prioritaire</span>':'')+AG.delay(r)+AG.files.badge(r.files)+'</div><div class="kmv">'+(i>0?'<button type="button" class="btn sm line" data-mv="-1" aria-label="Statut précédent">&larr;</button>':'')+(i<3?'<button type="button" class="btn sm line" data-mv="1" aria-label="Statut suivant">&rarr;</button>':'')+'</div></div>').join('')+(col.length>30?'<small style="display:block;text-align:center;color:var(--muted)">+ '+(col.length-30)+' autres</small>':'')+(col.length?'':'<small style="display:block;text-align:center;color:var(--muted);padding:14px 0">Aucune demande</small>')+'</div>'}).join('')+'</div>';
  }
  function move(id,to){const r=F.db().requests.find(x=>x.id===id);if(!r||r.status===to)return;F.setStatus(id,to,'Statut : '+F.statut(to).l+'.',AG.userName());AG.toast(id+' → '+F.statut(to).l);draw();AG.bellDraw()}
  function draw(){
    const rows=filt();$$('.seg button',main).forEach(b=>b.classList.toggle('on',b.dataset.v===st.view));
    $('#dmN').innerHTML=AG.plural(rows.length,'demande')+(AG.files?'':'');
    bulk();
    const L=$('#dmL');
    if(!rows.length){L.innerHTML='<div class="tw">'+AG.empty('Aucune demande trouvée','Modifiez vos filtres, votre recherche ou la portée.')+'</div>';return}
    L.innerHTML=st.view==='kanban'?kanban(rows):table(rows);
  }
  draw();
  $('#dmQ').addEventListener('input',e=>{st.q=e.target.value;st.page=1;draw()});
  $('#dmT').onchange=e=>{st.type=e.target.value;st.page=1;draw()};
  $('#dmS').onchange=e=>{st.status=e.target.value;st.page=1;draw()};
  AG.cascadeBind(main,'dm',st,()=>{st.page=1;draw()});
  $$('.seg button',main).forEach(b=>b.onclick=()=>{st.view=b.dataset.v;sel.clear();draw()});
  const L=$('#dmL');
  L.addEventListener('click',e=>{
    const ck=e.target.closest('[data-ck]');if(ck){ck.checked?sel.add(ck.dataset.ck):sel.delete(ck.dataset.ck);ck.closest('tr').classList.toggle('sel',ck.checked);bulk();return}
    if(e.target.id==='dmAll'){const ids=$$('[data-ck]',L).map(c=>c.dataset.ck);e.target.checked?ids.forEach(i=>sel.add(i)):ids.forEach(i=>sel.delete(i));draw();return}
    const s=e.target.closest('th[data-sort]');if(s){const k=s.dataset.sort;st.dir=st.sort===k?-st.dir:1;st.sort=k;draw();return}
    const pg=e.target.closest('[data-pg]');if(pg){st.page+=+pg.dataset.pg;draw();window.scrollTo(0,0);return}
    const mv=e.target.closest('[data-mv]');if(mv){const c=mv.closest('.kcard'),i=F.STATUTS.findIndex(x=>x.k===mv.closest('.kcol').dataset.col);move(c.dataset.id,F.STATUTS[i+ +mv.dataset.mv].k);return}
    const o=e.target.closest('[data-id]');if(o)AG.reqDrawer(o.dataset.id,refresh);
  });
  L.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('tr[data-id],.kcard')){e.preventDefault();AG.reqDrawer(e.target.dataset.id,refresh)}});
  let dragId=null;
  L.addEventListener('dragstart',e=>{const c=e.target.closest('.kcard');if(!c)return;dragId=c.dataset.id;c.classList.add('drag');try{e.dataTransfer.setData('text/plain',dragId);e.dataTransfer.effectAllowed='move'}catch(x){}});
  L.addEventListener('dragend',e=>{$$('.drag,.over',L).forEach(x=>x.classList.remove('drag','over'))});
  L.addEventListener('dragover',e=>{const c=e.target.closest('.kcol');if(c){e.preventDefault();$$('.over',L).forEach(x=>x!==c&&x.classList.remove('over'));c.classList.add('over')}});
  L.addEventListener('drop',e=>{const c=e.target.closest('.kcol');if(c&&dragId){e.preventDefault();const id=dragId;dragId=null;move(id,c.dataset.col)}});
  $('#dmCsv').onclick=()=>{const rows=filt();if(!rows.length)return AG.toast('Aucune donnée à exporter.','warn');
    AG.csv('demandes',[['N°','Date','Type','Objet','Demandeur','Téléphone','Province','Commissariat','Priorité','Statut','Pièces jointes']].concat(rows.map(r=>[r.id,F.fmt(r.createdAt),F.TYPES[r.type]||r.type,r.subject,nm(r),(r.contact&&r.contact.tel)||'',AG.provNom(r.province),AG.comNom(r.commissariat),r.priority,F.statut(r.status).l,(r.files||[]).length])));
    AG.log('Export CSV','Demandes ('+rows.length+')');AG.toast('Export CSV généré ('+rows.length+' lignes).')};
  let sig=F.db().requests.length;
  return{poll(){const n=F.db().requests.length;if(n!==sig&&!AG.drawerOpen()){sig=n;draw()}}};
}
AG.register('demandes',{label:'Demandes citoyennes',short:'Demandes',key:'r',render:view});
})();
