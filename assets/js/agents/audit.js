/* Espace Agents — journal d'audit */
(function(){
'use strict';
const AG=window.AG,F=AG.F,E=AG.E,$=AG.$,ic=AG.ic;
let q='';
function view(main){
  const rowsF=()=>{const s=q.trim().toLowerCase();return F.db().audit.filter(a=>!s||(a.user+' '+a.action+' '+a.objet+' '+a.ip).toLowerCase().includes(s))};
  const nm=m=>{const c=F.COMPTES.find(x=>x.matricule===m);return c?c.nom:m};
  main.innerHTML='<div class="ph"><div><h2>Journal d’audit</h2><p>Traçabilité de toutes les actions · conservé et non modifiable en production.</p></div><div class="acts"><button class="btn line" id="auCsv">'+ic('dl')+'Exporter en CSV</button></div></div>'+
   '<div class="fbar"><div class="sch"><label class="sr" for="auQ">Filtre</label>'+ic('search')+'<input id="auQ" type="search" placeholder="Filtrer par agent, action, objet…" value="'+E(q)+'"></div></div><div class="count" id="auN"></div><div id="auL"></div>';
  const list=()=>{const rows=rowsF();$('#auN').textContent=AG.plural(rows.length,'événement');
    $('#auL').innerHTML=rows.length?'<div class="tw"><table class="rt"><thead><tr><th>Date</th><th>Agent</th><th>Action</th><th>Objet</th><th>Adresse IP</th></tr></thead><tbody>'+rows.slice(0,150).map(a=>'<tr><td class="ttl" data-label=""><b>'+E(F.fmt(a.at))+'</b></td><td data-label="Agent">'+E(a.user)+'<small>'+(a.user==='citoyen'?'Usager public':E(nm(a.user)))+'</small></td><td data-label="Action">'+E(a.action)+'</td><td data-label="Objet">'+E(a.objet)+'</td><td data-label="IP">'+E(a.ip)+'</td></tr>').join('')+'</tbody></table></div>':'<div class="tw">'+AG.empty('Aucun événement','Aucune action ne correspond au filtre.','audit')+'</div>'};
  list();
  $('#auQ').addEventListener('input',e=>{q=e.target.value;list()});
  $('#auCsv').onclick=()=>{const rows=rowsF();if(!rows.length)return AG.toast('Aucune donnée à exporter.','warn');AG.csv('journal-audit',[['Date','Agent','Nom','Action','Objet','IP']].concat(rows.map(a=>[F.fmt(a.at),a.user,nm(a.user),a.action,a.objet,a.ip])));AG.log('Export CSV','Journal d’audit');AG.toast('Export CSV généré.')};
}
AG.register('audit',{label:'Journal d’audit',short:'Audit',key:'j',render:view});
})();
