/* Espace Agents — moyens : parc de véhicules, entretien, dotations */
(function(){
'use strict';
const AG=window.AG,F=AG.F,E=AG.E,$=AG.$,$$=AG.$$,ic=AG.ic,DAY=AG.DAY;
const VETAT=['Opérationnel','En entretien','Hors service'];
const st={prov:'',com:''};
function vDrawer(id){
  const v=F.db().vehicles.find(x=>x.id===id);if(!v)return;
  AG.drawer(v.modele+' · '+v.immat,'<div style="margin-bottom:14px"><span class="bd '+(v.etat==='Opérationnel'?'ok':v.etat==='En entretien'?'warn':'bad')+'">'+E(v.etat)+'</span></div><dl class="dl"><dt>Identifiant</dt><dd><b>'+E(v.id)+'</b></dd><dt>Immatriculation</dt><dd>'+E(v.immat)+'</dd><dt>Province</dt><dd>'+E(AG.provNom(v.province))+'</dd><dt>Affectation</dt><dd>'+E(AG.comNom(v.affectation))+'</dd><dt>Carburant</dt><dd>'+v.carburant+' %</dd><dt>Kilométrage</dt><dd>'+E(Number(v.km).toLocaleString('fr-FR'))+' km</dd><dt>Prochain entretien</dt><dd>'+E(F.fmt(v.entretien,false))+'</dd><dt>Dotation</dt><dd>'+E(v.dotation||'—')+'</dd></dl>');
}
AG.openers.vehicule=vDrawer;
function view(main){
  const draw=()=>{
    const cas=AG.cascade('mv',st);const V=AG.scoped(F.db().vehicles).filter(v=>AG.inCascade(v,st)),now=Date.now(),dot=V.filter(v=>v.dotation);
    main.innerHTML='<div class="ph"><div><h2>Moyens</h2><p>Parc de véhicules, carburant, entretien et dotations · '+E(AG.scopeLabel())+'.</p></div><div class="acts"><button class="btn gold" id="vAdd">'+ic('plus')+'Ajouter un véhicule</button></div></div>'+
     '<div class="fbar"><span style="display:contents">'+cas+'</span></div>'+
     '<div class="grid g4 k"><div class="card kpi g"><span class="ki">'+ic('check')+'</span><small>Opérationnels</small><b>'+V.filter(v=>v.etat==='Opérationnel').length+'</b><span>sur '+V.length+' véhicules</span></div><div class="card kpi"><span class="ki">'+ic('moyens')+'</span><small>En entretien</small><b>'+V.filter(v=>v.etat==='En entretien').length+'</b><span>immobilisés</span></div><div class="card kpi r"><span class="ki">'+ic('alertes')+'</span><small>Hors service</small><b>'+V.filter(v=>v.etat==='Hors service').length+'</b><span>à remplacer</span></div><div class="card kpi b"><span class="ki">'+ic('clock')+'</span><small>Entretiens dépassés</small><b>'+V.filter(v=>v.entretien<now).length+'</b><span>à planifier</span></div></div>'+
     '<div class="tw mt">'+(V.length?'<table class="rt"><thead><tr><th>Véhicule</th><th>Affectation</th><th>État</th><th>Carburant</th><th>Kilométrage</th><th>Prochain entretien</th></tr></thead><tbody>'+
     V.map(v=>{const late=v.entretien<now,soon=!late&&v.entretien-now<15*DAY,col=v.carburant<25?'#C2410C':v.carburant<50?'#E0A91B':'#0F8F4F';
      return '<tr><td class="ttl" data-label=""><b><a href="#/moyens" data-v="'+E(v.id)+'">'+E(v.modele)+'</a></b><small>'+E(v.immat)+' · '+E(v.id)+(v.dotation?' · '+E(v.dotation):'')+'</small></td><td data-label="Affectation">'+E(AG.comNom(v.affectation))+'<small>'+E(AG.provNom(v.province))+'</small></td><td data-label="État"><select data-s="'+E(v.id)+'" aria-label="État de '+E(v.immat)+'">'+AG.opts(VETAT,v.etat)+'</select></td><td data-label="Carburant"><div class="fuel"><div class="bar" style="flex:1"><i style="width:'+v.carburant+'%;background:'+col+'"></i></div><span>'+v.carburant+'%</span></div></td><td data-label="Kilométrage">'+E(Number(v.km).toLocaleString('fr-FR'))+' km</td><td data-label="Prochain entretien">'+E(F.fmt(v.entretien,false))+' '+(late?'<span class="bd late">Dépassé</span>':soon?'<span class="bd warn">Bientôt</span>':'')+'</td></tr>'}).join('')+'</tbody></table>':AG.empty('Aucun véhicule','Aucun véhicule dans cette portée.','moyens'))+'</div>'+
     '<div class="grid g2 mt"><div class="photo"><img src="assets/img/dotation.jpg" alt="" loading="lazy"><div><b>Dotation de mai 2026</b><span>'+AG.plural(dot.length,'véhicule reçu','véhicules reçus')+' · données de démonstration</span></div></div>'+
     '<div class="card"><h3>Dotations <small>véhicules concernés</small></h3>'+(dot.length?'<ul class="mini">'+dot.map(v=>'<li style="cursor:default"><div><b>'+E(v.modele)+' · '+E(v.immat)+'</b><small>'+E(v.dotation)+' · '+E(AG.comNom(v.affectation))+'</small></div></li>').join('')+'</ul>':AG.empty('Aucune dotation enregistrée'))+'</div></div>';
    $$('select[data-s]',main).forEach(s=>s.onchange=()=>{const v=F.db().vehicles.find(x=>x.id===s.dataset.s);if(!v)return;v.etat=s.value;AG.log('Changement d’état véhicule',v.immat+' → '+v.etat);AG.toast(v.immat+' : '+v.etat+'.');draw()});
    $$('a[data-v]',main).forEach(a=>a.onclick=e=>{e.preventDefault();vDrawer(a.dataset.v)});
    AG.cascadeBind(main,'mv',st,draw);
    $('#vAdd').onclick=addV;
  };
  function addV(){
    const me=AG.me;
    AG.modal('Ajouter un véhicule','<form id="vF" novalidate><div class="f2"><div class="fld"><label for="vM">Modèle</label><input id="vM" required placeholder="ex. Toyota Hilux"></div><div class="fld"><label for="vI">Immatriculation</label><input id="vI" required placeholder="GA-123-AB"></div></div>'+AG.provCom('va',me.province,me.commissariat)+'<div class="f2"><div class="fld"><label for="vE">État</label><select id="vE">'+AG.opts(VETAT)+'</select></div><div class="fld"><label for="vC">Carburant (%)</label><input id="vC" type="number" min="0" max="100" value="80"></div><div class="fld"><label for="vK">Kilométrage</label><input id="vK" type="number" min="0" value="0"></div><div class="fld"><label for="vN">Prochain entretien</label><input id="vN" type="date" required></div></div><div class="fld"><label for="vD">Dotation</label><input id="vD" placeholder="ex. Dotation de mai 2026"></div><p class="err" id="vErr" hidden></p><div class="acts"><button type="button" class="btn line" id="vX">Annuler</button><button class="btn gold" type="submit">Ajouter</button></div></form>');
    $('#vN').value=new Date(Date.now()+90*DAY).toISOString().slice(0,10);
    AG.provComBind($('#modalBody'),'va');$('#vX').onclick=AG.closeModal;
    $('#vF').addEventListener('submit',e=>{e.preventDefault();const m=$('#vM').value.trim(),im=$('#vI').value.trim().toUpperCase(),er=$('#vErr');
      if(!m||!im){er.textContent='Le modèle et l’immatriculation sont obligatoires.';er.hidden=false;return}
      const V=F.db().vehicles,n=Math.max(0,...V.map(v=>parseInt(String(v.id).replace(/\D/g,''))||0))+1,pc=AG.provComVal('va');
      V.push({id:'V-'+n,immat:im,modele:m,affectation:pc.commissariat,province:pc.province,etat:$('#vE').value,carburant:Math.max(0,Math.min(100,+$('#vC').value||0)),km:Math.max(0,+$('#vK').value||0),entretien:new Date($('#vN').value).getTime()||Date.now(),dotation:$('#vD').value.trim()});
      AG.log('Ajout véhicule',im);AG.closeModal();AG.toast('Véhicule '+im+' ajouté au parc.');draw()});
  }
  draw();
}
AG.register('moyens',{label:'Moyens',short:'Moyens',key:'m',render:view});
})();
