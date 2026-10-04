/* Espace Agents — ressources humaines */
(function(){
'use strict';
const AG=window.AG,F=AG.F,E=AG.E,$=AG.$,$$=AG.$$,ic=AG.ic;
const st={q:'',grade:'',service:'',prov:'',com:''};
function filt(){const q=st.q.trim().toLowerCase();return AG.scoped(F.db().agents).filter(a=>(!st.grade||a.grade===st.grade)&&(!st.service||a.service===st.service)&&AG.inCascade(a,st)&&(!q||(a.nom+' '+a.prenom+' '+a.matricule+' '+a.badge).toLowerCase().includes(q)))}
function agDrawer(id,after){
  const get=()=>F.db().agents.find(x=>x.id===id);
  const html=()=>{const a=get();if(!a)return AG.empty('Agent introuvable');const yrs=new Date().getFullYear()-a.entree;
    return '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px"><span class="bd ok">&#10003; Badge vérifié</span><span class="bd '+(a.statut==='En service'?'ok':'warn')+'">'+E(a.statut)+'</span></div>'+
    '<h3 style="font-size:1.2rem;margin-bottom:12px">'+E(a.prenom)+' '+E(a.nom)+'</h3>'+
    '<dl class="dl"><dt>Matricule</dt><dd><b>'+E(a.matricule)+'</b></dd><dt>N° de badge</dt><dd>'+E(a.badge)+'</dd><dt>Grade</dt><dd>'+E(a.grade)+'</dd><dt>Service</dt><dd>'+E(a.service)+'</dd><dt>Province</dt><dd>'+E(AG.provNom(a.province))+'</dd><dt>Affectation</dt><dd>'+E(AG.comNom(a.commissariat))+'</dd><dt>Ancienneté</dt><dd>'+yrs+' an'+(yrs>1?'s':'')+' (entrée en '+E(a.entree)+')</dd><dt>Formations</dt><dd>'+(a.formations||[]).map(f=>'<span class="bd" style="margin:0 4px 4px 0">'+E(f)+'</span>').join('')+'</dd><dt>Avancement</dt><dd>'+E(a.tableau||'—')+'</dd></dl>'+
    '<span class="sec">Muter / affecter</span><div class="box">'+AG.provCom('agm',a.province,a.commissariat)+'<button class="btn navy sm" id="agB">Muter / affecter</button></div>';};
  const bind=()=>{AG.provComBind($('#drawerBody'),'agm');$('#agB').onclick=()=>{const a=get(),v=AG.provComVal('agm');if(v.commissariat===a.commissariat)return AG.toast('L’agent est déjà affecté à ce poste.','warn');const old=a.commissariat;a.commissariat=v.commissariat;a.province=v.province;AG.log('Mutation agent',a.matricule+' : '+old+' → '+v.commissariat);AG.setDrawer(html());bind();if(after)after();AG.toast('Affectation mise à jour : '+AG.comNom(v.commissariat)+'.')}};
  const a=get();AG.drawer(a?a.prenom+' '+a.nom:'Agent',html(),after);bind();
}
AG.openers.agent=id=>agDrawer(id,null);
function view(main){
  const ag=AG.scoped(F.db().agents),mx=Math.max(1,...F.GRADES.map(g=>ag.filter(a=>a.grade===g).length));
  main.innerHTML='<div class="ph"><div><h2>Ressources humaines</h2><p>Annuaire des agents, affectations et avancement · '+E(AG.scopeLabel())+'.</p></div></div>'+
   '<div class="sita"><div>'+ic('rh')+'</div><div><b>Tableau d’avancement – connecteur SITA</b><span>Raccordement au système d’information de gestion des personnels (SITA) à prévoir en phase de déploiement.</span></div><span class="bd">À raccorder</span></div>'+
   '<div class="grid g21"><div><div class="fbar"><div class="sch"><label class="sr" for="rhQ">Recherche</label>'+ic('search')+'<input id="rhQ" type="search" placeholder="Nom, matricule, badge…" value="'+E(st.q)+'"></div><select id="rhG" aria-label="Grade">'+AG.opts(F.GRADES,st.grade,'Tous les grades')+'</select><select id="rhS" aria-label="Service">'+AG.opts(F.SERVICES,st.service,'Tous les services')+'</select><span style="display:contents">'+AG.cascade('rh',st)+'</span></div><div class="count" id="rhN"></div><div id="rhL"></div></div>'+
   '<div class="card" style="align-self:start"><h3>Répartition par grade <small>'+ag.length+' agents</small></h3><ul class="rank">'+F.GRADES.map(g=>{const n=ag.filter(a=>a.grade===g).length;return '<li><span>'+E(g)+'</span><b>'+n+'</b><div><i style="width:'+Math.round(n/mx*100)+'%"></i></div></li>'}).join('')+'</ul></div></div>';
  const list=()=>{
    const rows=filt();$('#rhN').textContent=AG.plural(rows.length,'agent');
    $('#rhL').innerHTML=rows.length?'<div class="tw"><table class="rt"><thead><tr><th>Agent</th><th>Matricule</th><th>Grade</th><th>Service</th><th>Affectation</th><th>Statut</th></tr></thead><tbody>'+rows.map(a=>'<tr tabindex="0" data-id="'+E(a.id)+'" aria-label="Ouvrir la fiche de '+E(a.prenom+' '+a.nom)+'"><td class="ttl" data-label=""><b>'+E(a.nom)+' '+E(a.prenom)+'</b></td><td data-label="Matricule">'+E(a.matricule)+'</td><td data-label="Grade">'+E(a.grade)+'</td><td data-label="Service">'+E(a.service)+'</td><td data-label="Affectation">'+E(AG.comNom(a.commissariat))+'<small>'+E(AG.provNom(a.province))+'</small></td><td data-label="Statut"><span class="bd '+(a.statut==='En service'?'ok':'warn')+'">'+E(a.statut)+'</span></td></tr>').join('')+'</tbody></table></div>':'<div class="tw">'+AG.empty('Aucun agent trouvé','Modifiez vos filtres ou la portée.','rh')+'</div>';
  };
  list();
  AG.cascadeBind(main,'rh',st,list);
  [['#rhQ','q','input'],['#rhG','grade','change'],['#rhS','service','change']].forEach(([s,k,ev])=>$(s).addEventListener(ev,e=>{st[k]=e.target.value;list()}));
  const open=e=>{const tr=e.target.closest('tr[data-id]');if(tr)agDrawer(tr.dataset.id,list)};
  $('#rhL').addEventListener('click',open);$('#rhL').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(e)}});
}
AG.register('rh',{label:'Ressources humaines',short:'RH',key:'h',render:view});
})();
