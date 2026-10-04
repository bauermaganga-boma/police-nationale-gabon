/* Espace Agents — concours & recrutement */
(function(){
'use strict';
const AG=window.AG,F=AG.F,E=AG.E,$=AG.$,$$=AG.$$,ic=AG.ic,DAY=AG.DAY;
const CST={recu:'Reçue',valide:'Validée',convoque:'Convoquée',rejete:'Rejetée'};
const st={q:'',st:'',prov:''};
const LIEU='Centre d’examen de Libreville (démonstration)';
const get=id=>F.db().candidates.find(x=>x.id===id);
function convoc(id){
  const c=get(id);const cv=c.convocation||{date:Date.now()+14*DAY,lieu:LIEU};
  AG.modal('Convocation – '+c.id,'<div id="printArea"><div class="convoc"><h3>République gabonaise – Forces de Police Nationale (FPN)</h3><p class="c-sub">Direction des ressources humaines · Concours d’entrée (document de démonstration)</p><p><b>CONVOCATION N° '+E(c.id)+'</b></p><p>Monsieur / Madame <b>'+E(c.prenom)+' '+E(c.nom)+'</b>, candidat(e) au concours <b>'+E(c.concours||'—')+'</b>, est convoqué(e) aux épreuves le <b>'+E(F.fmt(cv.date,false))+'</b> à <b>08 h 00</b>.</p><p>Lieu : <b>'+E(cv.lieu)+'</b>.</p><p>Se présenter muni d’une pièce d’identité et de la présente convocation.</p><div class="sig"><span>Fait à Libreville, le '+E(F.fmt(Date.now(),false))+'</span><span>Le Directeur (signature fictive)</span></div></div></div><div class="acts"><button class="btn line" id="kX">Fermer</button><button class="btn gold" id="kP">'+ic('print')+'Imprimer</button></div>',true);
  $('#kX').onclick=AG.closeModal;$('#kP').onclick=()=>{AG.log('Impression convocation',c.id);window.print()};
}
function setStatus(c,a){
  if(a==='convoque'&&c.status!=='convoque'){c.status='convoque';c.convocation={date:Date.now()+14*DAY,lieu:LIEU};AG.log('Convocation candidat',c.id)}
  else if(a!=='convoque'){c.status=a;AG.log(a==='valide'?'Candidature validée':'Candidature rejetée',c.id)}
}
function cdDrawer(id,after){
  const html=()=>{const c=get();return ''};
  const draw=()=>{
    const c=get(id);if(!c)return AG.empty('Candidature introuvable');c.files=c.files||[];
    return '<div style="margin-bottom:14px"><span class="bd '+c.status+'">'+E(CST[c.status]||c.status)+'</span></div><h3 style="font-size:1.15rem;margin-bottom:12px">'+E(c.prenom)+' '+E(c.nom)+'</h3>'+
     '<dl class="dl"><dt>Référence</dt><dd><b>'+E(c.id)+'</b></dd><dt>Concours</dt><dd>'+E(c.concours||'—')+'</dd><dt>Diplôme</dt><dd>'+E(c.diplome||'—')+'</dd><dt>Naissance</dt><dd>'+E(c.naissance||'—')+'</dd><dt>Province</dt><dd>'+E(AG.provNom(c.province))+'</dd><dt>Téléphone</dt><dd>'+E(c.tel||'—')+'</dd><dt>Reçue le</dt><dd>'+E(F.fmt(c.createdAt))+'</dd></dl>'+
     AG.files.section(c.files,true)+'<span class="sec">Décision</span><div class="act" style="display:flex;gap:8px;flex-wrap:wrap">'+(c.status!=='valide'&&c.status!=='convoque'?'<button class="btn green" data-a="valide">Valider</button>':'')+(c.status!=='rejete'?'<button class="btn line" data-a="rejete">Rejeter</button>':'')+(c.status==='valide'||c.status==='convoque'?'<button class="btn navy" data-a="convoque">'+(c.status==='convoque'?'Voir la convocation':'Convoquer')+'</button>':'')+'</div>';
  };
  const bind=()=>{const r=$('#drawerBody');const done=m=>{AG.setDrawer(draw());bind();if(after)after();AG.toast(m)};
    $$('[data-a]',r).forEach(b=>b.onclick=()=>{const c=get(id),a=b.dataset.a;setStatus(c,a);if(a==='convoque'){done('Candidat convoqué.');convoc(id)}else done('Candidature '+c.id+' '+(a==='valide'?'validée':'rejetée')+'.')});
    AG.files.bind(r,()=>{const c=get(id);c.files=c.files||[];return c.files},fs=>{AG.log('Pièce jointe ajoutée',id+' · '+fs.map(f=>f.name).join(', '));done(fs.length+' pièce(s) jointe(s) ajoutée(s).')});
  };
  AG.drawer('Candidature '+id,draw(),after);bind();
}
function view(main){
  const draw=()=>{
    const C=AG.scoped(F.db().candidates),q=st.q.trim().toLowerCase();
    const rows=C.filter(c=>(!st.st||c.status===st.st)&&(!st.prov||c.province===st.prov)&&(!q||(c.nom+' '+c.prenom+' '+c.id).toLowerCase().includes(q))).sort((a,b)=>b.createdAt-a.createdAt);
    const pub=F.db().resultsPublishedAt;
    main.innerHTML='<div class="ph"><div><h2>Concours &amp; recrutement</h2><p>Candidatures reçues, y compris via le formulaire du site public.</p></div><div class="acts"><button class="btn navy" id="cPub">Publier les résultats</button></div></div>'+
     (pub?'<div class="demo-note">'+ic('info')+'<span>Résultats publiés le '+E(F.fmt(pub))+' (action factice de démonstration).</span></div>':'')+
     '<div class="grid g4 k">'+Object.keys(CST).map(k=>{const n=C.filter(c=>c.status===k).length;return '<div class="card kpi'+(k==='valide'?' g':k==='rejete'?' r':k==='convoque'?' b':'')+'"><span class="ki">'+ic(k==='valide'||k==='convoque'?'check':'concours')+'</span><small>'+CST[k]+'s</small><b>'+n+'</b><span>'+AG.plural(n,'candidature')+'</span></div>'}).join('')+'</div>'+
     '<div class="fbar mt"><div class="sch"><label class="sr" for="cQ">Recherche</label>'+ic('search')+'<input id="cQ" type="search" placeholder="Rechercher un candidat…" value="'+E(st.q)+'"></div><select id="cS" aria-label="Statut">'+AG.opts(Object.entries(CST),st.st,'Tous les statuts')+'</select><select id="cP" aria-label="Province">'+AG.opts(F.PROVINCES.map(p=>[p.id,p.nom]),st.prov,'Toutes les provinces')+'</select></div><div class="count">'+AG.plural(rows.length,'candidature')+'</div>'+
     (rows.length?'<div class="tw"><table class="rt"><thead><tr><th>Candidat</th><th>Concours</th><th>Diplôme</th><th>Province</th><th>Reçue le</th><th>Statut</th><th>Actions</th></tr></thead><tbody>'+rows.map(c=>'<tr tabindex="0" data-id="'+E(c.id)+'"><td class="ttl" data-label=""><b>'+E(c.nom)+' '+E(c.prenom)+'</b> '+AG.files.badge(c.files)+'<small>'+E(c.id)+(c.naissance?' · né(e) le '+E(c.naissance):'')+'</small></td><td data-label="Concours">'+E(c.concours||'—')+'</td><td data-label="Diplôme">'+E(c.diplome||'—')+'</td><td data-label="Province">'+E(AG.provNom(c.province))+'</td><td data-label="Reçue le">'+E(F.fmt(c.createdAt,false))+'</td><td data-label="Statut"><span class="bd '+c.status+'">'+E(CST[c.status]||c.status)+'</span></td><td data-label="Actions"><div class="act">'+(c.status!=='valide'&&c.status!=='convoque'?'<button class="btn sm green" data-a="valide" data-c="'+E(c.id)+'">Valider</button>':'')+(c.status!=='rejete'?'<button class="btn sm line" data-a="rejete" data-c="'+E(c.id)+'">Rejeter</button>':'')+(c.status==='valide'||c.status==='convoque'?'<button class="btn sm navy" data-a="convoque" data-c="'+E(c.id)+'">'+(c.status==='convoque'?'Convocation':'Convoquer')+'</button>':'')+'</div></td></tr>').join('')+'</tbody></table></div>':'<div class="tw">'+AG.empty('Aucune candidature','Aucune candidature ne correspond aux filtres.','concours')+'</div>');
    $('#cQ').addEventListener('input',e=>{st.q=e.target.value;const p=e.target.selectionStart;draw();const i=$('#cQ');i.focus();try{i.setSelectionRange(p,p)}catch(x){}});
    $('#cS').onchange=e=>{st.st=e.target.value;draw()};$('#cP').onchange=e=>{st.prov=e.target.value;draw()};
    $('#cPub').onclick=()=>AG.confirm('Publier les résultats','Vous allez publier la liste des candidats <b>validés</b> ('+C.filter(c=>c.status==='valide'||c.status==='convoque').length+') sur le site public. Action factice de démonstration : aucune donnée n’est réellement diffusée.','Confirmer la publication',()=>{F.db().resultsPublishedAt=Date.now();AG.log('Publication des résultats','Concours');AG.toast('Résultats publiés (simulation).');draw()});
    main.onclick=e=>{const b=e.target.closest('[data-a]');
      if(b){const c=get(b.dataset.c);if(!c)return;const a=b.dataset.a;setStatus(c,a);if(a==='convoque'){draw();convoc(c.id)}else{AG.toast('Candidature '+c.id+' '+(a==='valide'?'validée':'rejetée')+'.');draw()}return}
      const tr=e.target.closest('tr[data-id]');if(tr)cdDrawer(tr.dataset.id,draw)};
  };
  draw();
}
AG.register('concours',{label:'Concours & recrutement',short:'Concours',key:'k',render:view});
})();
