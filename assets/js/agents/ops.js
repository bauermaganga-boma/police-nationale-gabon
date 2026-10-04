/* Espace Agents — patrouilles & opérations */
(function(){
'use strict';
const AG=window.AG,F=AG.F,E=AG.E,$=AG.$,$$=AG.$$,ic=AG.ic,DAY=AG.DAY;
const OPST={'Planifiée':'s2','En cours':'s3','Terminée':'s4'};
const st={prov:'',com:''};let wk=0,redraw=null;
const get=id=>F.db().ops.find(x=>x.id===id);
function crOp(id){
  const o=get(id);if(!o)return;
  AG.modal('Compte rendu – '+o.id,'<p style="margin-bottom:12px;color:var(--muted)">'+E(o.titre)+'</p><form id="cF" novalidate><div class="fld"><label for="cI">Interpellations</label><input id="cI" type="number" min="0" value="0"></div><div class="fld"><label for="cS">Saisies</label><input id="cS" placeholder="ex. 2 véhicules, 1 arme blanche"></div><div class="fld"><label for="cR">Remarques</label><textarea id="cR" placeholder="Déroulement, incidents, suites à donner…"></textarea></div><p style="color:var(--muted);font-size:.84rem;margin-bottom:10px">L’enregistrement passe l’opération au statut « Terminée ».</p><div class="acts"><button type="button" class="btn line" id="cX">Annuler</button><button class="btn gold" type="submit">Enregistrer le compte rendu</button></div></form>');
  $('#cX').onclick=AG.closeModal;
  $('#cF').addEventListener('submit',e=>{e.preventDefault();o.cr={interpellations:Math.max(0,+$('#cI').value||0),saisies:$('#cS').value.trim()||'Néant',remarques:$('#cR').value.trim()||'—'};o.statut='Terminée';AG.log('Compte rendu opération',o.id);AG.closeModal();AG.toast('Compte rendu enregistré · '+o.id+' terminée.');if(redraw)redraw()});
}
function viewCr(id){
  const o=get(id);if(!o)return;const c=o.cr||{};
  AG.modal('Compte rendu – '+o.id,'<p style="margin-bottom:12px"><b>'+E(o.titre)+'</b><br><span style="color:var(--muted)">'+E(F.fmt(o.date))+' · '+E(AG.comNom(o.commissariat))+'</span></p><dl class="dl"><dt>Interpellations</dt><dd>'+E(c.interpellations!=null?c.interpellations:'—')+'</dd><dt>Saisies</dt><dd>'+E(c.saisies||'—')+'</dd><dt>Remarques</dt><dd>'+E(c.remarques||'—')+'</dd></dl><div class="acts"><button class="btn line" id="vcX">Fermer</button></div>');$('#vcX').onclick=AG.closeModal;
}
AG.openers.op=id=>{const o=get(id);if(o)(o.statut==='Terminée'?viewCr:crOp)(id)};
function view(main){
  const draw=()=>{
    const cas=AG.cascade('op',st);const O=AG.scoped(F.db().ops).filter(o=>AG.inCascade(o,st)).sort((a,b)=>b.date-a.date);
    const mon=new Date();mon.setHours(0,0,0,0);mon.setDate(mon.getDate()-((mon.getDay()+6)%7)+wk*7);
    const days=Array.from({length:7},(_,i)=>{const d=new Date(mon);d.setDate(d.getDate()+i);return d}),todayS=new Date().toDateString();
    main.innerHTML='<div class="ph"><div><h2>Patrouilles &amp; opérations</h2><p>Planning, mise en œuvre et comptes rendus · '+E(AG.scopeLabel())+'.</p></div><div class="acts"><button class="btn gold" id="opAdd">'+ic('plus')+'Créer une opération</button></div></div>'+
     '<div class="fbar"><span style="display:contents">'+cas+'</span></div>'+
     '<div class="card"><h3>Planning de la semaine</h3><div class="wknav"><button class="btn sm line" id="wkP" aria-label="Semaine précédente">&larr;</button><b>'+E(F.fmt(days[0],false))+' – '+E(F.fmt(days[6],false))+'</b><button class="btn sm line" id="wkN" aria-label="Semaine suivante">&rarr;</button>'+(wk?'<button class="btn sm line" id="wkT">Cette semaine</button>':'')+'</div><div class="week">'+days.map(d=>{const ev=O.filter(o=>new Date(o.date).toDateString()===d.toDateString()).sort((a,b)=>a.date-b.date);return '<div class="wd'+(d.toDateString()===todayS?' today':'')+'"><h4>'+E(d.toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'2-digit'}))+'</h4>'+(ev.length?ev.map(o=>'<div class="ev '+(o.statut==='Terminée'?'t':o.statut==='En cours'?'c':'')+'" tabindex="0" role="button" data-id="'+E(o.id)+'">'+E(o.titre)+'</div>').join(''):'<span style="color:#9aa8bd">—</span>')+'</div>'}).join('')+'</div></div>'+
     '<h3 class="sh">Toutes les opérations</h3>'+
     (O.length?'<div class="tw"><table class="rt"><thead><tr><th>Opération</th><th>Date</th><th>Type</th><th>Commissariat</th><th>Effectif</th><th>Statut</th><th>Actions</th></tr></thead><tbody>'+O.map(o=>'<tr><td class="ttl" data-label=""><b>'+E(o.titre)+'</b><small>'+E(o.id)+'</small></td><td data-label="Date">'+E(F.fmt(o.date))+'</td><td data-label="Type">'+E(o.type)+'</td><td data-label="Commissariat">'+E(AG.comNom(o.commissariat))+'<small>'+E(AG.provNom(o.province))+'</small></td><td data-label="Effectif">'+E(o.effectif)+' agents</td><td data-label="Statut"><span class="bd '+(OPST[o.statut]||'')+'">'+E(o.statut)+'</span></td><td data-label="Actions"><div class="act">'+(o.statut==='Planifiée'?'<button class="btn sm line" data-start="'+E(o.id)+'">Démarrer</button>':'')+(o.statut!=='Terminée'?'<button class="btn sm navy" data-cr="'+E(o.id)+'">Compte rendu</button>':'<button class="btn sm line" data-view="'+E(o.id)+'">Voir le CR</button>')+'</div></td></tr>').join('')+'</tbody></table></div>':'<div class="tw">'+AG.empty('Aucune opération','Créez la première opération.','ops')+'</div>');
    $('#opAdd').onclick=addOp;
    $('#wkP').onclick=()=>{wk--;draw()};$('#wkN').onclick=()=>{wk++;draw()};const t=$('#wkT');if(t)t.onclick=()=>{wk=0;draw()};
    AG.cascadeBind(main,'op',st,draw);
    $$('[data-start]',main).forEach(b=>b.onclick=()=>{const o=get(b.dataset.start);o.statut='En cours';AG.log('Opération démarrée',o.id);AG.toast(o.id+' démarrée.');draw()});
    $$('[data-cr]',main).forEach(b=>b.onclick=()=>crOp(b.dataset.cr));
    $$('[data-view]',main).forEach(b=>b.onclick=()=>viewCr(b.dataset.view));
    $$('.ev',main).forEach(b=>{const f=()=>AG.openers.op(b.dataset.id);b.onclick=f;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f()}}});
  };
  redraw=draw;
  function addOp(){
    const me=AG.me,d=new Date(Date.now()+DAY);d.setMinutes(0);const iso=new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,16);
    AG.modal('Créer une opération','<form id="oF" novalidate><div class="fld"><label for="oT">Intitulé</label><input id="oT" required placeholder="ex. Patrouille de nuit – Glass"></div>'+AG.provCom('opn',me.province,me.commissariat)+'<div class="f2"><div class="fld"><label for="oY">Type</label><select id="oY">'+AG.opts(['Patrouille','Opération','Contrôle','Présence permanente'])+'</select></div><div class="fld"><label for="oD">Date et heure</label><input id="oD" type="datetime-local" value="'+iso+'" required></div></div><div class="fld"><label for="oE">Effectif</label><input id="oE" type="number" min="1" value="10"></div><p class="err" id="oErr" hidden></p><div class="acts"><button type="button" class="btn line" id="oX">Annuler</button><button class="btn gold" type="submit">Créer</button></div></form>');
    AG.provComBind($('#modalBody'),'opn');$('#oX').onclick=AG.closeModal;
    $('#oF').addEventListener('submit',e=>{e.preventDefault();const t=$('#oT').value.trim(),dt=new Date($('#oD').value).getTime(),er=$('#oErr');
      if(!t||!dt){er.textContent='Renseignez l’intitulé et la date.';er.hidden=false;return}
      const n=F.nextId('op'),pc=AG.provComVal('opn');F.db().ops.push({id:'OP-'+n,titre:t,type:$('#oY').value,date:dt,commissariat:pc.commissariat,province:pc.province,effectif:Math.max(1,+$('#oE').value||1),statut:'Planifiée',cr:null});
      AG.log('Création opération','OP-'+n);AG.closeModal();AG.toast('Opération OP-'+n+' créée.');draw()});
  }
  draw();
}
AG.register('ops',{label:'Patrouilles & opérations',short:'Opérations',key:'o',render:view});
})();
