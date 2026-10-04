/* Espace Agents — alertes 177 : carte du pays, zoom par province, détail, pièces jointes */
(function(){
'use strict';
const AG=window.AG,F=AG.F,E=AG.E,$=AG.$,$$=AG.$$,ic=AG.ic,ALST=AG.ALST,ALCOL=AG.ALCOL;
const NEXT={nouvelle:['prise','Prendre en charge','Prise en charge par '],prise:['patrouille','Dépêcher une patrouille','Patrouille dépêchée par '],patrouille:['cloturee','Clôturer l’intervention','Intervention clôturée par ']};
const st={filter:'actives',prov:'',com:''};
function alDrawer(id,after){
  const get=()=>F.db().alerts.find(x=>x.id===id);
  const keys=Object.keys(ALST);
  const html=()=>{
    const a=get();if(!a)return AG.empty('Alerte introuvable');a.files=a.files||[];const idx=keys.indexOf(a.status),nx=NEXT[a.status];
    return '<div style="margin-bottom:14px"><span class="bd '+a.status+'">'+E(ALST[a.status])+'</span></div>'+
    '<div class="stepper">'+keys.map((k,i)=>'<span class="'+(i<idx||(i===idx&&k==='cloturee')?'done':i===idx?'cur':'')+'">'+E(ALST[k])+'</span>').join('')+'</div>'+
    '<dl class="dl"><dt>Référence</dt><dd><b>'+E(a.id)+'</b></dd><dt>Nature</dt><dd>'+E(a.type)+'</dd><dt>Province</dt><dd>'+E(AG.provNom(a.province))+'</dd><dt>Quartier</dt><dd>'+E(a.quartier)+'</dd><dt>Téléphone</dt><dd>'+E(a.phone||'—')+'</dd><dt>Position GPS</dt><dd>'+(typeof a.lat==='number'?a.lat.toFixed(4)+', '+a.lng.toFixed(4):'Non communiquée')+'</dd><dt>Reçue le</dt><dd>'+E(F.fmt(a.at))+'</dd></dl>'+
    (nx?'<button class="btn '+(a.status==='patrouille'?'green':'gold')+' block" id="alNext">'+E(nx[1])+'</button>':'<div class="box"><b>Alerte clôturée.</b> Aucune action restante.</div>')+
    AG.files.section(a.files,true)+'<span class="sec">Chronologie</span>'+AG.tl(a.timeline);
  };
  const bind=()=>{
    const done=m=>{AG.setDrawer(html());bind();if(after)after();AG.toast(m);AG.bellDraw()};
    const b=$('#alNext');if(b)b.onclick=()=>{const a=get(),nx=NEXT[a.status];a.status=nx[0];a.timeline.push({at:Date.now(),status:nx[0],text:nx[2]+AG.userName()+'.',by:AG.userName()});AG.log('Alerte : '+ALST[nx[0]],a.id);done('Alerte mise à jour : '+ALST[nx[0]]+'.')};
    AG.files.bind($('#drawerBody'),()=>{const a=get();a.files=a.files||[];return a.files},fs=>{const a=get();fs.forEach(f=>a.timeline.push({at:Date.now(),status:a.status,text:'Pièce jointe ajoutée : '+f.name+'.',by:AG.userName()}));AG.log('Pièce jointe ajoutée',id+' · '+fs.map(f=>f.name).join(', '));done(fs.length+' pièce(s) jointe(s) ajoutée(s).')});
  };
  AG.drawer('Alerte '+id,html(),after);bind();
}
AG.openers.alerte=id=>alDrawer(id,null);
function view(main){
  let map=null,layer=null,known=new Set(F.db().alerts.map(a=>a.id)),sig='';
  const hasL=!!window.L,sc=AG.scope();
  main.innerHTML='<div class="ph"><div><h2>Alertes 177</h2><p>Alertes d’urgence géolocalisées sur tout le pays · actualisation automatique toutes les 5 secondes.</p></div><div class="acts"><button class="btn alert" id="alSim">'+ic('alertes')+'Simuler une alerte entrante</button></div></div>'+
   '<div class="fbar"><div class="chips" style="margin:0" role="group" aria-label="Filtre"><button class="chip" data-f="actives">Actives</button><button class="chip" data-f="toutes">Toutes</button></div><span id="alCas" style="display:contents">'+AG.cascade('al',st)+'</span></div>'+
   '<div class="chips" id="alZoom" role="group" aria-label="Zoom par province"><button class="chip" data-z="">Tout le pays</button>'+F.PROVINCES.map(p=>'<button class="chip" data-z="'+p.id+'">'+E(p.nom)+'</button>').join('')+'</div>'+
   '<div class="al-wrap"><div>'+(hasL?'<div id="map" role="application" aria-label="Carte des alertes du Gabon"></div>':'<div class="nomap">Carte indisponible (connexion ou bibliothèque non chargée) — affichage en liste uniquement.</div>')+
   '<div class="lgd">'+Object.keys(ALST).map(k=>'<span><i style="background:'+ALCOL[k]+'"></i>'+ALST[k]+'</span>').join('')+'</div></div><div id="alL" class="al-list"></div></div>';
  const zoomTo=pid=>{if(!map)return;const p=pid&&F.province(pid);if(p)map.flyTo([p.lat,p.lng],p.z+1,{duration:.6});else map.flyTo([-0.8,11.6],6,{duration:.6});$$('#alZoom .chip',main).forEach(c=>c.classList.toggle('on',c.dataset.z===(pid||'')))};
  if(hasL){
    map=L.map('map',{zoomControl:true,minZoom:5}).setView([-0.8,11.6],6);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    layer=L.layerGroup().addTo(map);setTimeout(()=>{if(map){map.invalidateSize();zoomTo(sc.prov||st.prov)}},250);
  }
  const vis=()=>AG.scoped(F.db().alerts).filter(a=>AG.inCascade(a,st)&&(st.filter==='toutes'||a.status!=='cloturee')).sort((a,b)=>b.at-a.at);
  const sg=()=>F.db().alerts.map(a=>a.id+a.status+a.timeline.length+(a.files||[]).length).join('|')+st.filter+st.prov+st.com;
  const draw=()=>{
    const rows=vis();$$('[data-f]',main).forEach(c=>{c.classList.toggle('on',c.dataset.f===st.filter);c.setAttribute('aria-pressed',c.dataset.f===st.filter)});
    $('#alL').innerHTML=rows.length?rows.map(a=>'<button class="al-i '+a.status+'" data-id="'+E(a.id)+'"><div><b>'+E(a.type)+' · '+E(a.quartier)+'</b><small>'+E(a.id)+' · '+E(AG.provNom(a.province))+' · '+E(AG.ago(a.at))+'</small></div>'+AG.files.badge(a.files)+'<span class="bd '+a.status+'">'+E(ALST[a.status])+'</span></button>').join(''):AG.empty('Aucune alerte','Les nouvelles alertes 177 apparaîtront ici automatiquement.','alertes');
    if(layer){layer.clearLayers();rows.forEach(a=>{if(typeof a.lat!=='number'||typeof a.lng!=='number')return;
      const m=L.circleMarker([a.lat,a.lng],{radius:11,weight:3,color:'#fff',fillColor:ALCOL[a.status],fillOpacity:.92}).addTo(layer);
      m.bindTooltip(a.type+' · '+ALST[a.status]+' · '+AG.provNom(a.province));m.on('click',()=>alDrawer(a.id,draw))})}
    sig=sg();
  };
  draw();
  AG.cascadeBind(main,'al',st,()=>{draw();zoomTo(st.prov)});
  main.addEventListener('click',e=>{
    const f=e.target.closest('[data-f]');if(f){st.filter=f.dataset.f;draw();return}
    const z=e.target.closest('[data-z]');if(z){zoomTo(z.dataset.z);return}
    const i=e.target.closest('.al-i');if(i){const a=F.db().alerts.find(x=>x.id===i.dataset.id);if(a&&map&&typeof a.lat==='number')map.flyTo([a.lat,a.lng],14,{duration:.5});alDrawer(i.dataset.id,draw)}
  });
  $('#alSim').onclick=()=>{
    const T=['Agression','Accident','Incendie','Cambriolage en cours','Autre urgence'],Q=['Akébé','Nzeng-Ayong','Louis','Batterie IV','Lalala','Glass','Oloumi','PK8'];
    const p=F.province(AG.scope().prov||st.prov||'estuaire'),r=()=>(Math.random()-.5)*.12;
    const a=F.addAlert({type:T[Math.floor(Math.random()*T.length)],lat:p.lat+r(),lng:p.lng+r(),quartier:p.id==='estuaire'?Q[Math.floor(Math.random()*Q.length)]:p.chef,phone:'+241 06 '+(10+Math.floor(Math.random()*89))+' '+(10+Math.floor(Math.random()*89))+' 00'});
    known.add(a.id);AG.log('Alerte simulée',a.id);AG.beep();AG.toast('Nouvelle alerte 177 : '+a.type+' ('+a.quartier+')','warn');draw();AG.bellDraw();if(map)map.flyTo([a.lat,a.lng],13,{duration:.5});
  };
  return{poll(){
    const fresh=AG.scoped(F.db().alerts).filter(a=>!known.has(a.id));
    if(fresh.length){F.db().alerts.forEach(a=>known.add(a.id));AG.beep();AG.toast('Nouvelle alerte 177 reçue : '+fresh[0].type+(fresh.length>1?' (+'+(fresh.length-1)+')':''),'warn')}
    if(sg()!==sig||!AG.drawerOpen())draw();
  },destroy(){if(map){map.remove();map=null}}};
}
AG.register('alertes',{label:'Alertes 177',short:'Alertes',key:'a',render:view});
})();
