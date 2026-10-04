/* Espace Agents — main courante numérique */
(function(){
'use strict';
const AG=window.AG,F=AG.F,E=AG.E,$=AG.$,ic=AG.ic;
const st={q:'',prov:'',com:''};
const NATURES=['Constat d’altercation','Dépôt de plainte','Remise d’objet trouvé','Intervention – trouble à l’ordre public','Accident de la circulation','Signalement de personne disparue','Contrôle d’identité','Autre'];
function filt(){const q=st.q.trim().toLowerCase();return AG.scoped(F.db().courante).filter(m=>AG.inCascade(m,st)&&(!q||(m.nature+' '+m.texte+' '+m.agent+' '+m.id).toLowerCase().includes(q))).sort((a,b)=>b.at-a.at)}
function view(main){
  const me=AG.me;
  main.innerHTML='<div class="ph"><div><h2>Main courante numérique</h2><p>Registre chronologique des faits constatés · chaque entrée est horodatée et signée.</p></div><div class="acts"><button class="btn line" id="mcCsv">'+ic('dl')+'Exporter en CSV</button></div></div>'+
   '<div class="grid g21"><div><div class="fbar"><div class="sch"><label class="sr" for="mcQ">Recherche</label>'+ic('search')+'<input id="mcQ" type="search" placeholder="Filtrer les entrées…" value="'+E(st.q)+'"></div><span style="display:contents">'+AG.cascade('mc',st)+'</span></div><div class="count" id="mcN"></div><div id="mcL"></div></div>'+
   '<div class="card" style="align-self:start"><h3>Nouvelle entrée</h3><form id="mcF" novalidate><div class="fld"><label for="mcNat">Nature</label><select id="mcNat">'+AG.opts(NATURES)+'</select></div>'+AG.provCom('mcn',me.province,me.commissariat)+'<div class="fld"><label for="mcTx">Faits constatés</label><textarea id="mcTx" required placeholder="Heure, lieu, personnes présentes, suite donnée…"></textarea></div><div class="fld"><label for="mcAg">Agent</label><input id="mcAg" value="'+E(me.nom)+'" readonly></div><button class="btn gold block" type="submit">Enregistrer l’entrée</button></form></div></div>';
  const list=()=>{
    const rows=filt();$('#mcN').textContent=AG.plural(rows.length,'entrée');
    $('#mcL').innerHTML=rows.length?'<div class="tw"><table class="rt"><thead><tr><th>Date</th><th>N°</th><th>Nature</th><th>Commissariat</th><th>Agent</th><th>Détail</th></tr></thead><tbody>'+rows.slice(0,80).map(m=>'<tr><td class="ttl" data-label=""><b>'+E(F.fmt(m.at))+'</b></td><td data-label="N°">'+E(m.id)+'</td><td data-label="Nature">'+E(m.nature)+'</td><td data-label="Commissariat">'+E(AG.comNom(m.commissariat))+'<small>'+E(AG.provNom(m.province))+'</small></td><td data-label="Agent">'+E(m.agent)+'</td><td class="stk" data-label="Détail">'+E(m.texte)+'</td></tr>').join('')+'</tbody></table></div>':'<div class="tw">'+AG.empty('Aucune entrée','Aucune entrée ne correspond au filtre.','courante')+'</div>';
  };
  list();
  AG.provComBind(main,'mcn');AG.cascadeBind(main,'mc',st,list);
  $('#mcQ').addEventListener('input',e=>{st.q=e.target.value;list()});
  $('#mcF').addEventListener('submit',e=>{e.preventDefault();const tx=$('#mcTx').value.trim();if(!tx){AG.toast('Décrivez les faits constatés.','warn');$('#mcTx').focus();return}
    const n=F.nextId('mc'),pc=AG.provComVal('mcn');
    F.db().courante.unshift({id:'MC-'+n,at:Date.now(),commissariat:pc.commissariat,province:pc.province,agent:me.nom,nature:$('#mcNat').value,texte:tx});
    AG.log('Nouvelle entrée main courante','MC-'+n);$('#mcTx').value='';list();AG.toast('Entrée MC-'+n+' enregistrée.')});
  $('#mcCsv').onclick=()=>{const rows=filt();if(!rows.length)return AG.toast('Aucune donnée à exporter.','warn');AG.csv('main-courante',[['N°','Date','Nature','Province','Commissariat','Agent','Détail']].concat(rows.map(m=>[m.id,F.fmt(m.at),m.nature,AG.provNom(m.province),AG.comNom(m.commissariat),m.agent,m.texte])));AG.log('Export CSV','Main courante');AG.toast('Export CSV généré.')};
}
AG.register('courante',{label:'Main courante',short:'Courante',key:'c',render:view});
})();
