/* Espace Agents — statistiques & rapports (impression / PDF, export CSV) */
(function(){
'use strict';
const AG=window.AG,F=AG.F,E=AG.E,$=AG.$,ic=AG.ic,DAY=AG.DAY;
const st={days:30,prov:'',com:''};
const PER=[[7,'7 derniers jours'],[30,'30 derniers jours'],[90,'90 derniers jours'],[0,'Depuis le début']];
function data(){
  const d=F.db(),now=Date.now(),inP=t=>!st.days||now-t<=st.days*DAY,f=l=>AG.scoped(l).filter(x=>AG.inCascade(x,st));
  const R=f(d.requests).filter(r=>inP(r.createdAt)),A=f(d.alerts).filter(a=>inP(a.at)),O=f(d.ops).filter(o=>inP(o.date)),M=f(d.courante).filter(m=>inP(m.at));
  const closed=R.filter(r=>r.status==='cloturee');
  const dur=closed.map(r=>{const t=r.timeline.find(x=>x.status==='cloturee');return t?(t.at-r.createdAt)/36e5:null}).filter(x=>x!=null);
  const byCom={};R.forEach(r=>{const c=byCom[r.commissariat]=byCom[r.commissariat]||{n:0,c:0};c.n++;if(r.status==='cloturee')c.c++});
  return{R,A,O,M,closed,avg:dur.length?Math.round(dur.reduce((a,b)=>a+b,0)/dur.length):null,sla:dur.length?Math.round(dur.filter(h=>h<=72).length/dur.length*100):0,byCom,interp:O.reduce((s,o)=>s+((o.cr&&o.cr.interpellations)||0),0)};
}
function view(main){
  const draw=()=>{
    const cas=AG.cascade('rp',st);const D=data(),per=(PER.find(p=>p[0]===st.days)||PER[1])[1];
    const scopeTxt=st.com?AG.comNom(st.com):st.prov?'Province '+AG.provNom(st.prov):AG.scopeLabel();
    const types=Object.keys(F.TYPES).map(k=>[F.TYPES[k],D.R.filter(r=>r.type===k).length]);
    const stat=F.STATUTS.map(s=>[s.l,D.R.filter(r=>r.status===s.k).length]);
    const coms=Object.entries(D.byCom).sort((a,b)=>b[1].n-a[1].n).slice(0,12);
    const tbl=(h,rows)=>'<table class="rt"><thead><tr>'+h.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map((c,i)=>'<td'+(i?'':' class="ttl"')+' data-label="'+E(h[i])+'">'+(i?E(c):'<b>'+E(c)+'</b>')+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
    main.innerHTML='<div class="ph no-print"><div><h2>Statistiques &amp; rapports</h2><p>Rapport d’activité par période, province et commissariat.</p></div><div class="acts"><button class="btn line" id="rpCsv">'+ic('dl')+'Exporter en CSV</button><button class="btn gold" id="rpPrint">'+ic('print')+'Imprimer / PDF</button></div></div>'+
     '<div class="fbar no-print"><select id="rpD" aria-label="Période">'+AG.opts(PER,st.days)+'</select><span style="display:contents">'+cas+'</span></div>'+
     '<div id="printArea" class="pr-doc"><div class="card"><h2 style="margin-bottom:4px">Rapport d’activité – Forces de Police Nationale (FPN)</h2><p style="color:var(--muted);font-size:.9rem">'+E(per)+' · Portée : '+E(scopeTxt)+' · édité le '+E(F.fmt(Date.now()))+' par '+E(AG.me.nom)+' · données fictives de démonstration</p></div>'+
     '<div class="grid g4 k mt"><div class="card kpi"><small>Demandes reçues</small><b>'+D.R.length+'</b><span>'+D.closed.length+' clôturées</span></div><div class="card kpi g"><small>Délai moyen</small><b>'+(D.avg==null?'—':D.avg+' h')+'</b><span>'+D.sla+' % sous 72 h</span></div><div class="card kpi r"><small>Alertes 177</small><b>'+D.A.length+'</b><span>'+D.A.filter(a=>a.status==='cloturee').length+' clôturées</span></div><div class="card kpi b"><small>Opérations</small><b>'+D.O.length+'</b><span>'+D.interp+' interpellations</span></div></div>'+
     '<div class="grid g2 mt"><div class="card"><h3>Demandes par type</h3>'+tbl(['Type','Nombre'],types)+'</div><div class="card"><h3>Demandes par statut</h3>'+tbl(['Statut','Nombre'],stat)+'</div></div>'+
     '<div class="card mt"><h3>Activité par commissariat <small>'+AG.plural(D.M.length,'entrée')+' de main courante</small></h3>'+(coms.length?tbl(['Commissariat','Province','Demandes','Clôturées'],coms.map(([id,v])=>[AG.comNom(id),AG.provNom(F.provinceOf(id)),v.n,v.c])):AG.empty('Aucune donnée','Aucune demande sur cette période.'))+'</div></div>';
    $('#rpD').onchange=e=>{st.days=+e.target.value;draw()};
    AG.cascadeBind(main,'rp',st,draw);
    $('#rpPrint').onclick=()=>{AG.log('Impression rapport',scopeTxt);window.print()};
    $('#rpCsv').onclick=()=>{AG.csv('rapport',[['Rapport FPN',per,scopeTxt],[],['Indicateur','Valeur'],['Demandes reçues',D.R.length],['Demandes clôturées',D.closed.length],['Délai moyen (h)',D.avg==null?'':D.avg],['Alertes 177',D.A.length],['Opérations',D.O.length],['Interpellations',D.interp],[],['Commissariat','Province','Demandes','Clôturées']].concat(coms.map(([id,v])=>[AG.comNom(id),AG.provNom(F.provinceOf(id)),v.n,v.c])));AG.log('Export CSV','Rapport');AG.toast('Export CSV généré.')};
  };
  draw();
}
AG.register('rapports',{label:'Statistiques & rapports',short:'Rapports',key:'s',render:view});
})();
