/* Espace Agents — tableau de bord */
(function(){
'use strict';
const AG=window.AG,F=AG.F,E=AG.E,$=AG.$,$$=AG.$$,ic=AG.ic,DAY=AG.DAY;
const TCOL={preplainte:'#17407F',cyber:'#E0A91B',anonyme:'#0F8F4F',objet:'#B58500',rdv:'#2F6FD0',message:'#8a5a2b'};
const ALST={nouvelle:'Nouvelle',prise:'Prise en charge',patrouille:'Patrouille dépêchée',cloturee:'Clôturée'};
AG.ALST=ALST;AG.ALCOL={nouvelle:'#B58500',prise:'#E0A91B',patrouille:'#17407F',cloturee:'#0F8F4F'};
function trend(cur,prev,goodUp){
  if(!prev&&!cur)return '<span class="trend eq">=</span>';
  const p=prev?Math.round((cur-prev)/prev*100):100;if(p===0)return '<span class="trend eq">= 0 %</span>';
  const good=(p>0)===goodUp;return '<span class="trend '+(good?'up':'dn')+'">'+(p>0?'▲ +':'▼ ')+p+' %</span>';
}
function bars(vals,closed,labels){
  const W=480,H=230,pb=34,pt=24,n=vals.length,bw=34,gap=(W-40-n*bw)/(n-1),max=Math.max(1,...vals,...closed);
  let s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Demandes reçues et clôturées par semaine">';
  for(let g=0;g<=3;g++){const y=pt+(H-pb-pt)*g/3;s+='<line x1="20" x2="'+(W-20)+'" y1="'+y+'" y2="'+y+'" stroke="#E7ECF4"/>'}
  const pts=[];
  vals.forEach((v,i)=>{const h=(H-pb-pt)*v/max,x=20+i*(bw+gap),y=H-pb-h;
    s+='<rect x="'+x+'" y="'+y+'" width="'+bw+'" height="'+Math.max(h,2)+'" rx="7" fill="'+(i===n-1?'#E0A91B':'#17407F')+'"><title>'+E(labels[i])+' : '+v+' reçues</title></rect>';
    s+='<text x="'+(x+bw/2)+'" y="'+(y-6)+'" text-anchor="middle" font-size="11" font-weight="700" fill="#0A1B33">'+v+'</text><text x="'+(x+bw/2)+'" y="'+(H-12)+'" text-anchor="middle" font-size="10" fill="#5B6B82">'+E(labels[i])+'</text>';
    pts.push((x+bw/2)+','+(H-pb-(H-pb-pt)*closed[i]/max))});
  s+='<polyline points="'+pts.join(' ')+'" fill="none" stroke="#0F8F4F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
  pts.forEach(p=>{const [x,y]=p.split(',');s+='<circle cx="'+x+'" cy="'+y+'" r="4" fill="#fff" stroke="#0F8F4F" stroke-width="2.5"/>'});
  return s+'</svg>';
}
function donut(parts,total){
  const R=60,C=2*Math.PI*R;let off=0;
  let s='<svg viewBox="0 0 170 170" role="img" aria-label="Répartition par type"><circle cx="85" cy="85" r="'+R+'" fill="none" stroke="#EEF2F8" stroke-width="22"/>';
  parts.forEach(p=>{if(!p.v)return;const l=C*p.v/Math.max(total,1);s+='<circle cx="85" cy="85" r="'+R+'" fill="none" stroke="'+p.c+'" stroke-width="22" stroke-dasharray="'+l+' '+(C-l)+'" stroke-dashoffset="'+(-off)+'" transform="rotate(-90 85 85)"><title>'+E(p.l)+' : '+p.v+'</title></circle>';off+=l});
  return s+'<text x="85" y="88" text-anchor="middle" font-family="Sora,sans-serif" font-size="26" font-weight="800" fill="#0A1B33">'+total+'</text><text x="85" y="105" text-anchor="middle" font-size="11" fill="#5B6B82">demandes</text></svg>';
}
function gauge(pct){
  const a=Math.PI*(1-pct/100),x=60+50*Math.cos(a),y=62-50*Math.sin(a),col=pct>=70?'#0F8F4F':pct>=40?'#E0A91B':'#B58500';
  return '<svg viewBox="0 0 120 74" role="img" aria-label="'+pct+' % des dossiers clôturés sous 72 h"><path d="M10 62A50 50 0 0 1 110 62" fill="none" stroke="#EEF2F8" stroke-width="12" stroke-linecap="round"/><path d="M10 62A50 50 0 0 1 '+x.toFixed(1)+' '+y.toFixed(1)+'" fill="none" stroke="'+col+'" stroke-width="12" stroke-linecap="round"/><text x="60" y="60" text-anchor="middle" font-family="Sora,sans-serif" font-size="20" font-weight="800" fill="#0A1B33">'+pct+'%</text></svg>';
}
function kpi(cls,icon,label,val,sub){return '<div class="card kpi '+cls+'"><span class="ki">'+ic(icon)+'</span><small>'+E(label)+'</small><b>'+val+'</b><span>'+sub+'</span></div>'}

function view(main){
  const draw=()=>{
    const d=F.db(),now=Date.now(),has=m=>AG.mods().includes(m),sc=AG.scope();
    const R=AG.scoped(d.requests),A=AG.scoped(d.alerts),AGT=AG.scoped(d.agents),V=AG.scoped(d.vehicles);
    const open=R.filter(r=>r.status!=='cloturee').length,closed=R.filter(r=>r.status==='cloturee');
    const dur=closed.map(r=>{const t=r.timeline.find(x=>x.status==='cloturee');return t?(t.at-r.createdAt)/36e5:null}).filter(x=>x!=null);
    const avg=dur.length?Math.round(dur.reduce((a,b)=>a+b,0)/dur.length):null;
    const sla=dur.length?Math.round(dur.filter(h=>h<=72).length/dur.length*100):0;
    const act=A.filter(a=>a.status!=='cloturee');
    const w=(a,b)=>R.filter(r=>now-r.createdAt>=a*DAY&&now-r.createdAt<b*DAY).length;
    const w7=w(0,7),p7=w(7,14);
    const alW=A.filter(a=>now-a.at<7*DAY).length,alP=A.filter(a=>now-a.at>=7*DAY&&now-a.at<14*DAY).length;
    const wk=Array(8).fill(0),wc=Array(8).fill(0);
    R.forEach(r=>{const i=Math.floor((now-r.createdAt)/(7*DAY));if(i>=0&&i<8)wk[7-i]++;const t=r.timeline.find(x=>x.status==='cloturee');if(t){const j=Math.floor((now-t.at)/(7*DAY));if(j>=0&&j<8)wc[7-j]++}});
    const labels=wk.map((_,j)=>F.fmtShort(now-(7-j)*7*DAY));
    const types=Object.keys(F.TYPES).map(k=>({k,l:F.TYPES[k],v:R.filter(r=>r.type===k).length,c:TCOL[k]}));
    const q={};R.forEach(r=>{const k=r.details&&r.details.quartier;if(k)q[k]=(q[k]||0)+1});
    const topq=Object.entries(q).sort((a,b)=>b[1]-a[1]).slice(0,6),mq=topq.length?topq[0][1]:1;
    const todo=[];
    if(has('alertes'))A.filter(a=>a.status==='nouvelle').slice(0,3).forEach(a=>todo.push({k:'a',id:a.id,t:a.type+' · '+a.quartier,s:'Alerte 177 · '+AG.ago(a.at),b:'Prendre en charge'}));
    if(has('demandes'))R.filter(r=>r.status==='recue').sort((a,b)=>(b.priority==='haute')-(a.priority==='haute')||a.createdAt-b.createdAt).slice(0,5-todo.length).forEach(r=>todo.push({k:'r',id:r.id,t:r.subject,s:r.id+' · '+AG.ago(r.createdAt)+(r.priority==='haute'?' · prioritaire':''),b:'Transmettre'}));
    const lateN=R.filter(r=>r.status!=='cloturee'&&now-r.createdAt>72*36e5).length;
    let h='<div class="demo-note">'+ic('info')+'<span>Données fictives de démonstration — aucun chiffre ne correspond à une situation réelle.</span></div>'+
     '<div class="ph"><div><h2>Tableau de bord</h2><p>'+E(AG.scopeLabel())+' · mis à jour '+E(F.fmt(now))+'</p></div></div>'+
     '<div class="grid g4 k">'+
      kpi('','demandes','Demandes reçues',R.length,trend(w7,p7,true)+w7+' cette semaine')+
      kpi('b','clock','En cours de traitement',open,(R.length?Math.round(open/R.length*100):0)+' % du total · '+lateN+' hors délai')+
      kpi('g','check','Délai moyen',avg==null?'—':avg+' h','sur '+closed.length+' clôturés')+
      kpi('r','alertes','Alertes 177 actives',act.length,trend(alW,alP,false)+alW+' sur 7 jours')+'</div>'+
     '<div class="grid g21 mt"><div class="card chart"><h3>Demandes par semaine <small>barres : reçues · courbe : clôturées</small></h3>'+bars(wk,wc,labels)+'</div>'+
      '<div class="grid" style="align-content:start"><div class="card"><h3>Délai de traitement (SLA 72 h)</h3><div class="gauge">'+gauge(sla)+'<div style="font-size:.86rem;color:var(--muted)">des dossiers clôturés l’ont été en moins de 72 h.</div></div></div>'+
      '<div class="card"><h3>Par type</h3><div class="donut">'+donut(types,R.length)+'<ul class="legend">'+types.map(t=>'<li><i style="background:'+t.c+'"></i>'+E(t.l)+'<b>'+t.v+'</b></li>').join('')+'</ul></div></div></div></div>'+
     '<div class="grid g2 mt"><div class="card"><h3>À traiter maintenant <small>actions rapides</small></h3>'+(todo.length?'<ul class="mini">'+todo.map(t=>'<li data-open="'+t.k+':'+E(t.id)+'"><div><b>'+E(t.t)+'</b><small>'+E(t.s)+'</small></div><button type="button" class="btn sm gold" data-q="'+t.k+':'+E(t.id)+'">'+E(t.b)+'</button></li>').join('')+'</ul>':AG.empty('Rien d’urgent','Toutes les alertes et demandes récentes sont prises en charge.','check'))+'</div>'+
      '<div class="card"><h3>Top quartiers <small>demandes</small></h3>'+(topq.length?'<ul class="rank">'+topq.map(([k,n])=>'<li><span>'+E(k)+'</span><b>'+n+'</b><div><i style="width:'+Math.round(n/mq*100)+'%"></i></div></li>').join('')+'</ul>':AG.empty('Aucune donnée'))+'</div></div>';
    /* Par province / détail par commissariat */
    if(!sc.prov&&!sc.lock){
      h+='<h3 class="sh">Par province <small>cliquer pour appliquer la portée</small></h3><div class="pv">'+F.PROVINCES.map(p=>{
        const rr=d.requests.filter(r=>r.province===p.id),aa=d.alerts.filter(a=>a.province===p.id&&a.status!=='cloturee').length,ag=d.agents.filter(a=>a.province===p.id).length,vv=d.vehicles.filter(v=>v.province===p.id&&v.etat==='Opérationnel').length;
        return '<button type="button" class="pvc" data-prov="'+p.id+'"><h4>'+E(p.nom)+'<small>'+E(p.chef)+'</small></h4><dl><div><dt>Demandes</dt><dd>'+rr.length+'</dd></div><div><dt>Alertes</dt><dd class="'+(aa?'al':'')+'">'+aa+'</dd></div><div><dt>Effectifs</dt><dd>'+ag+'</dd></div><div><dt>Véhicules</dt><dd>'+vv+'</dd></div></dl></button>'}).join('')+'</div>';
    }else if(sc.prov&&!sc.com){
      h+='<h3 class="sh">Détail par commissariat <small>'+E(AG.provNom(sc.prov))+'</small></h3><div class="pv">'+F.commissariatsOf(sc.prov).map(c=>{
        const rr=d.requests.filter(r=>r.commissariat===c.id),ag=d.agents.filter(a=>a.commissariat===c.id).length,vv=d.vehicles.filter(v=>v.affectation===c.id&&v.etat==='Opérationnel').length,oo=d.ops.filter(o=>o.commissariat===c.id&&o.statut!=='Terminée').length;
        return '<button type="button" class="pvc" data-com="'+c.id+'"><h4>'+E(c.nom)+'</h4><dl><div><dt>Demandes</dt><dd>'+rr.length+'</dd></div><div><dt>Ouvertes</dt><dd>'+rr.filter(r=>r.status!=='cloturee').length+'</dd></div><div><dt>Effectifs</dt><dd>'+ag+'</dd></div><div><dt>Opér.</dt><dd>'+oo+'</dd></div></dl></button>'}).join('')+'</div>';
    }
    h+='<h3 class="sh">Raccourcis</h3><div class="shortcuts">'+AG.mods().filter(m=>m!=='dashboard').map(m=>'<a class="sc" href="#/'+m+'">'+ic(AG.MODS[m].icon)+E(AG.MODS[m].label)+'</a>').join('')+'</div>';
    main.innerHTML=h;
    $$('[data-prov]',main).forEach(b=>b.onclick=()=>AG.setScope(b.dataset.prov,''));
    $$('[data-com]',main).forEach(b=>b.onclick=()=>AG.setScope(sc.prov,b.dataset.com));
    $$('li[data-open]',main).forEach(li=>li.onclick=e=>{if(e.target.closest('[data-q]'))return;const [k,id]=li.dataset.open.split(':');AG.goto(k==='a'?'alerte':'demande',id)});
    $$('[data-q]',main).forEach(b=>b.onclick=()=>{const [k,id]=b.dataset.q.split(':'),u=AG.userName();
      if(k==='a'){const a=F.db().alerts.find(x=>x.id===id);a.status='prise';a.timeline.push({at:Date.now(),status:'prise',text:'Prise en charge par '+u+'.',by:u});AG.log('Alerte : Prise en charge',id)}
      else F.setStatus(id,'transmise','Transmise au commissariat par '+u+'.',u);
      AG.toast('Action enregistrée.');draw();AG.bellDraw()});
  };
  draw();
  const sg=()=>{const d=F.db();return d.requests.length+'|'+d.alerts.map(a=>a.id+a.status).join(',')+'|'+d.requests.filter(r=>r.status==='cloturee').length};let sig=sg();
  return{poll(){const s=sg();if(s!==sig&&!AG.drawerOpen()){sig=s;draw()}}};
}
AG.register('dashboard',{label:'Tableau de bord',short:'Accueil',key:'d',render:view});
})();
