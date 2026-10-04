/* Gabarit commun : bandeau urgence, en-tête, barre mobile, pied de page, alerte 177, pièces jointes, carrousel du commandement */
(function(){
const P=document.body.dataset.page||'';
const TITLE=document.body.dataset.title||'';
const I={
 home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
 file:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
 map:'<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
 badge:'<path d="M12 2l8 3v6c0 5.500-3.500 9-8 11-4.500-2-8-5.500-8-11V5z"/><path d="M12 7l1.600 3.300 3.600.5-2.600 2.500.6 3.600L12 15.200 8.800 16.900l.6-3.600L6.800 10.800l3.600-.5z"/>',
 phone:'<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
 back:'<path d="M15 5l-7 7 7 7"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.500-4.500"/>',
 lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.500 3 14.500 0 18M12 3c-3 3.500-3 14.500 0 18"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 box:'<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
 id:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.500"/><path d="M5.500 17c.5-2 2-3 3.500-3s3 1 3.500 3M15 10h3M15 14h3"/>',
 users:'<circle cx="9" cy="8" r="3.500"/><path d="M2 20c0-3.500 3-5 7-5s7 1.500 7 5M16 4.500a3.500 3.500 0 0 1 0 7M18 15c2.500.5 4 2 4 5"/>',
 news:'<path d="M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2"/><path d="M8 9h5M8 13h5"/>',
 chart:'<path d="M4 20V4M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-8"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
 check:'<path d="M5 13l4 4L19 7"/>',
 alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
 siren:'<path d="M7 18v-6a5 5 0 0 1 10 0v6"/><path d="M5 18h14v3H5zM12 3v2M4.500 6l1.500 1.500M19.500 6L18 7.500M2 12h2M20 12h2"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1"/>',
 star:'<path d="M12 3l2.800 5.800 6.200.9-4.500 4.400 1.100 6.300L12 17.400 6.400 20.400l1.100-6.300L3 9.700l6.200-.9z"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 car:'<path d="M3 13l2-6h14l2 6v5h-3v-2H6v2H3z"/><circle cx="7.500" cy="13.500" r="1"/><circle cx="16.500" cy="13.500" r="1"/>',
 cap:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.500V16c0 1.500 3 3 6 3s6-1.500 6-3v-4.500"/>',
 heart:'<path d="M12 21s-8-5-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 10c0 6-8 11-8 11z"/>',
 paperclip:'<path d="M21 11l-9 9a5 5 0 0 1-7-7l9-9a3.500 3.500 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8"/>',
 upload:'<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
 trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
 image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 9"/>',
 flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
 gavel:'<path d="M14 4l6 6-3 3-6-6zM9 9l6 6M4 20l7-7M3 21h8"/>',
 flask:'<path d="M9 3h6M10 3v6L4.500 18a2 2 0 0 0 1.800 3h11.400a2 2 0 0 0 1.800-3L14 9V3"/><path d="M7.500 15h9"/>',
 building:'<path d="M4 21V5l8-3 8 3v16M2 21h20M9 9h2M13 9h2M9 13h2M13 13h2M10 21v-4h4v4"/>',
 doc:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h8"/>',
 plane:'<path d="M2 12l20-8-6 16-3-7z"/><path d="M13 13l9-9"/>',
 pin:'<path d="M12 22v-8M8 3h8l-1 6 3 3H6l3-3z"/>',
 wifi:'<path d="M2 9a15 15 0 0 1 20 0M5.500 12.500a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0M12 19.500h.01"/>',
 sms:'<path d="M4 4h16v12H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
 key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>',
 download:'<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>',
 book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5"/><path d="M8 7h7"/>',
 question:'<circle cx="12" cy="12" r="9"/><path d="M9.500 9.500a2.500 2.500 0 1 1 3.500 2.300c-.700.400-1 1-1 1.700M12 17h.01"/>',
 printer:'<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z"/>',
 trophy:'<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4M8 21h8M10 18h4"/>'
};
const ic=(n,c)=>`<svg class="ico ${c||''}" viewBox="0 0 24 24" aria-hidden="true">${I[n]||''}</svg>`;
window.icon=ic;
window.ib=(n,c)=>`<span class="ib ${c||'c1'}">${ic(n)}</span>`;
window.ICONS=I;

const NAV=[['index.html','Accueil','home'],['demarches.html','Mes démarches','file'],['institution.html','L’institution','shield'],['recrutement.html','Métiers & recrutement','cap'],['prevention.html','Prévention','heart'],['actualites.html','Actualités','news'],['documents.html','Documents & guides','book'],['commissariats.html','Commissariats','map']];
const isIdx=P==='index';
const LOGO='assets/img/logo.png';

/* En-tête */
const strip=`<div class="strip"><div class="wrap"><a href="tel:177">${ic('phone')} Urgence police : <b>177</b></a><span>Préfecture de police : +241 65 81 81 81</span><button class="lite" id="liteBtn" aria-pressed="false" title="Réduit la consommation de données (sans photos)">Mode économe en données</button></div></div>`;
const head=`<header class="head ${isIdx?'':'inner'}"><div class="wrap">
 ${isIdx?'':`<button class="mback" id="mback" aria-label="Retour">${ic('back')}</button>`}
 <a class="brand" href="index.html"><img src="${LOGO}" alt="Écusson des Forces de Police Nationale"><span><b>${isIdx?'Forces de Police Nationale':(TITLE||'Forces de Police Nationale')}</b><small>FPN · République gabonaise</small></span></a>
 <nav class="nav" aria-label="Navigation principale">${NAV.map(n=>`<a href="${n[0]}" class="${n[0].startsWith(P)&&P?'on':''}">${n[1]}</a>`).join('')}</nav>
 <div class="cta"><a class="btn line sm" href="agents.html">${ic('lock')} Espace agents</a><button class="btn red sm" data-alert>${ic('siren')} Alerte 177</button></div>
 <a class="mcall" href="tel:177">${ic('phone')} 177</a>
</div></header>`;
document.body.insertAdjacentHTML('afterbegin',strip+head+'<div class="tri"></div>');
(function(){const b=document.getElementById('liteBtn');let on=false;try{on=localStorage.getItem('fpn_lite')==='1'}catch(e){}
 const apply=()=>{document.body.classList.toggle('lite',on);b.setAttribute('aria-pressed',on);b.textContent=on?'Mode économe : activé':'Mode économe en données'};apply();
 b.onclick=()=>{on=!on;try{localStorage.setItem('fpn_lite',on?'1':'0')}catch(e){}apply();window.toast&&toast(on?'Photos désactivées pour économiser vos données':'Mode normal rétabli')}})();

/* Pied de page */
const foot=`<footer class="foot"><div class="wrap"><div class="cols">
 <div><a class="brand" href="index.html"><img src="${LOGO}" alt="" style="height:64px"><span><b>Forces de Police Nationale</b><small>FPN · Gabon</small></span></a>
  <p style="margin-top:14px;font-size:.93rem;max-width:38ch">Au service de la sécurité des personnes et de la protection des biens, dans les neuf provinces du pays. Sous la tutelle du ministère de l’Intérieur, de la Sécurité et de la Décentralisation.</p>
  <p class="f177">${ic('phone')} Urgence : <b>177</b></p></div>
 <div><h4>${ic('file')} Citoyens</h4><a href="demarches.html">Mes démarches</a><a href="suivi.html">Suivre ma demande</a><a href="verifier.html">Vérifier un policier</a><a href="prevention.html">Conseils de prévention</a><a href="commissariats.html">Trouver un commissariat</a></div>
 <div><h4>${ic('shield')} Institution</h4><a href="institution.html">Missions et directions</a><a href="recrutement.html">Métiers & recrutement</a><a href="actualites.html">Salle de presse</a><a href="documents.html">Documents & guides</a><a href="chiffres.html">La sécurité en chiffres</a><a href="contact.html">Contact</a></div>
 <div><h4>${ic('lock')} Vous êtes agent ?</h4><div class="agents"><b>Espace agents sécurisé</b><span style="font-size:.88rem">Demandes citoyennes, main courante, ressources humaines, moyens, opérations — par province et par commissariat.</span><br><a class="btn gold sm" href="agents.html">${ic('lock')} Se connecter</a></div></div>
</div>
<div class="legal"><span>© 2026 Forces de Police Nationale (FPN) – République gabonaise · Version de démonstration</span><span>Site conçu et développé par <em>Rouana</em></span></div>
<p class="credits">Crédits photo : Président de la République — Lukasz Kobus / Union européenne, CC BY 4.0 (Wikimedia Commons) · Commandant en chef — miboue.com · Opérations — presse gabonaise. Droits de réutilisation à confirmer avant mise en production.</p></div></footer>`;
const mainEnd=document.createElement('div');mainEnd.innerHTML=foot;document.body.appendChild(mainEnd.firstChild);

/* Barre mobile */
const tabs=[['index.html','Accueil','home','index'],['demarches.html','Démarches','file','demarches'],null,['commissariats.html','Carte','map','commissariats']];
const mbar=`<nav class="mbar" aria-label="Navigation mobile">
 ${tabs.map(t=>t?`<a href="${t[0]}" class="${P===t[3]?'on':''}">${ic(t[2])}<span>${t[1]}</span></a>`:`<button class="sos" data-alert aria-label="Alerte 177"><span>177</span>Urgence</button>`).join('')}
 <button id="mmenu" aria-label="Menu">${ic('menu')}<span>Menu</span></button></nav>
<div class="sheet" id="sheet"><div class="in"><div class="grab"></div>
 ${[['suivi.html','Suivre ma demande','search'],['verifier.html','Vérifier un policier','qr'],['institution.html','L’institution','shield'],['recrutement.html','Métiers & recrutement','cap'],['prevention.html','Prévention','heart'],['actualites.html','Actualités','news'],['documents.html','Documents & guides','book'],['chiffres.html','La sécurité en chiffres','chart'],['contact.html','Contact','mail']].map(m=>`<a class="m" href="${m[0]}">${ic(m[2])}${m[1]}</a>`).join('')}
 <a class="m agent" href="agents.html">${ic('lock')} Espace agents (connexion)</a></div></div>`;
document.body.insertAdjacentHTML('beforeend',mbar);
const sheet=document.getElementById('sheet');
document.getElementById('mmenu').onclick=()=>sheet.classList.add('on');
sheet.onclick=e=>{if(e.target===sheet)sheet.classList.remove('on')};

/* Retour */
const back=document.getElementById('mback');
if(back)back.onclick=()=>{let ok=false;try{ok=document.referrer&&new URL(document.referrer).origin===location.origin}catch(e){}ok&&history.length>1?history.back():location.href='index.html'};

/* Toast */
const toast=document.createElement('div');toast.className='toast';document.body.appendChild(toast);
window.toast=(m)=>{toast.textContent=m;toast.classList.add('on');clearTimeout(window._t);window._t=setTimeout(()=>toast.classList.remove('on'),3200)};

/* ---------- Pièces jointes ---------- */
const MAX_FILES=6,MAX_SIZE=8*1048576;
const fileIcon=t=>/^image/.test(t)?'image':/pdf/.test(t)?'doc':'file';
window.mountAttach=function(el,opt){
  opt=opt||{};const files=[];
  el.classList.add('attach');
  el.innerHTML=`<label class="fl">${ic('paperclip')} ${opt.label||'Joindre des documents'} <i style="color:var(--muted);font-weight:500;font-style:normal">(facultatif)</i></label>
   <div class="drop" tabindex="0" role="button"><input type="file" multiple accept="${opt.accept||'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip'}" ${opt.camera?'capture="environment"':''} hidden>
    ${ic('upload')}<div><b>Touchez ou déposez vos fichiers ici</b><small>Photos, captures d’écran, PDF, Word… · ${MAX_FILES} fichiers max · ${MAX_SIZE/1048576} Mo chacun</small></div></div>
   <ul class="flist"></ul>`;
  const inp=el.querySelector('input'),drop=el.querySelector('.drop'),ul=el.querySelector('.flist');
  const draw=()=>{ul.innerHTML=files.map((f,i)=>`<li><span class="fi">${ic(fileIcon(f.type))}</span><span class="fn"><b>${(window.FPN?FPN.esc(f.name):f.name)}</b><small>${window.FPN?FPN.fmtSize(f.size):Math.round(f.size/1024)+' Ko'}</small></span><button type="button" data-i="${i}" aria-label="Retirer ${f.name}">${ic('trash')}</button></li>`).join('')};
  const add=list=>{[...list].forEach(f=>{if(files.length>=MAX_FILES){window.toast&&toast('Maximum '+MAX_FILES+' fichiers');return}if(f.size>MAX_SIZE){window.toast&&toast(f.name+' dépasse '+MAX_SIZE/1048576+' Mo');return}files.push(f)});draw()};
  drop.onclick=()=>inp.click();drop.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inp.click()}};
  inp.onchange=()=>{add(inp.files);inp.value=''};
  ['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over')}));
  ['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('over')}));
  drop.addEventListener('drop',e=>add(e.dataTransfer.files));
  ul.onclick=e=>{const b=e.target.closest('button');if(b){files.splice(+b.dataset.i,1);draw()}};
  const api={count:()=>files.length,read:()=>FPN.readFiles(files),clear:()=>{files.length=0;draw()}};
  el._att=api;return api;
};
window.initAttach=function(root){(root||document).querySelectorAll('[data-attach]').forEach(el=>{if(!el._att)mountAttach(el,{label:el.dataset.label,camera:el.hasAttribute('data-camera')})})};

/* ---------- Province → commissariat ---------- */
window.provinceSelects=function(pSel,cSel,opt){
  opt=opt||{};const D=window.FPN;
  pSel.innerHTML=(opt.all?'<option value="">Toutes les provinces</option>':'<option value="">Choisir la province…</option>')+D.PROVINCES.map(p=>`<option value="${p.id}">${p.nom}</option>`).join('');
  const fill=()=>{const l=pSel.value?D.commissariatsOf(pSel.value).filter(c=>opt.services||c.type!=='Service'):[];cSel.innerHTML=(opt.all?'<option value="">Tous les commissariats</option>':'<option value="">Choisir le commissariat…</option>')+l.map(c=>`<option value="${c.id}">${c.nom}</option>`).join('');cSel.disabled=!pSel.value};
  pSel.onchange=()=>{fill();opt.onchange&&opt.onchange()};cSel.onchange=()=>opt.onchange&&opt.onchange();fill();
};

/* ---------- Bandeau défilant d'accueil ---------- */
window.mountHero=function(el){
  const S=[
   {img:'assets/img/president.jpg',pos:'center 22%',k:'Chef de l’État',h:'Brice Clotaire Oligui Nguema',p:'Président de la République gabonaise.',cap:'Photo : Lukasz Kobus / Union européenne, CC BY 4.0',btn:['institution.html','Le commandement']},
   {img:'assets/img/commandant.jpg',pos:'center 10%',k:'Commandement',h:'Général Serge Hervé Ngoma',p:'Commandant en chef des Forces de Police Nationale, à la tête de la Préfecture de police du Grand Libreville et des commissariats des neuf provinces.',cap:'Photo : miboue.com',btn:['institution.html','Les directions et services']},
   {img:'assets/img/dotation.jpg',pos:'center',k:'Moyens et équipements',h:'Une police mieux équipée',p:'Le 2 mai 2026, de nouveaux équipements techniques et véhicules ont été remis aux forces de police, dans le cadre de la loi de programmation de la sécurité 2026-2030.',cap:'Cérémonie de remise — presse gabonaise',btn:['actualites.html#n4','Lire l’actualité']},
   {img:'assets/img/defile.jpg',pos:'center',k:'Forces de Police Nationale',h:'Au service de la population, partout au Gabon',p:'Sécurité des personnes et des biens, prévention, enquête judiciaire, documents d’identité : neuf provinces, une même mission.',cap:'Unités de la Police nationale',btn:['demarches.html','Faire une démarche en ligne']}
  ];
  el.className='hs';
  el.innerHTML='<div class="hs-stage">'+S.map((s,i)=>'<div class="hs-slide'+(i?'':' on')+'"><div class="hs-txt"><em>'+s.k+'</em>'+(i?'<h2>':'<h1>')+s.h+(i?'</h2>':'</h1>')+'<p>'+s.p+'</p><div class="row"><a class="btn red" href="'+s.btn[0]+'">'+s.btn[1]+'</a>'+(i===3?'<button class="btn ghost" data-alert>Alerte 177</button>':'')+'</div></div><div class="hs-img"><img src="'+s.img+'" alt="'+s.h+'" style="object-position:'+s.pos+'"'+(i?' loading="lazy"':'')+'></div></div>').join('')+
  '<div class="hs-ctl"><div class="wrap"><div class="hs-dots">'+S.map((_,i)=>'<button class="'+(i?'':'on')+'" aria-label="Diapositive '+(i+1)+'"></button>').join('')+'</div><span class="hs-cap" id="hsCap">'+S[0].cap+'</span><div class="hs-arrows"><button aria-label="Précédent">'+ic('back')+'</button><button aria-label="Suivant" style="transform:scaleX(-1)">'+ic('back')+'</button></div></div></div></div>';
  const sl=[...el.querySelectorAll('.hs-slide')],ds=[...el.querySelectorAll('.hs-dots button')],cap=el.querySelector('#hsCap');let k=0,t;
  const go=n=>{sl[k].classList.remove('on');ds[k].classList.remove('on');k=(n+sl.length)%sl.length;sl[k].classList.add('on');ds[k].classList.add('on');cap.textContent=S[k].cap};
  const run=()=>{clearInterval(t);t=setInterval(()=>go(k+1),8000)};
  ds.forEach((b,i)=>b.onclick=()=>{go(i);run()});
  const ar=el.querySelectorAll('.hs-arrows button');ar[0].onclick=()=>{go(k-1);run()};ar[1].onclick=()=>{go(k+1);run()};
  el.addEventListener('mouseenter',()=>clearInterval(t));el.addEventListener('mouseleave',run);
  let x0=null;el.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});el.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40){go(k+(dx<0?1:-1));run()}x0=null});
  run();
};

/* Alerte 177 */
const modal=document.createElement('div');modal.className='modal';modal.id='alertModal';
modal.innerHTML=`<div class="mbox" role="dialog" aria-modal="true" aria-labelledby="alT"><button class="x" aria-label="Fermer">×</button>
<div id="alForm"><h2 id="alT">${ic('siren')} Alerte 177</h2>
<p style="color:var(--muted);margin-bottom:6px">Votre position est envoyée à la salle de commandement, qui vous rappelle.</p>
<div class="warn" style="margin:10px 0"><b>Démonstration :</b> aucune alerte réelle n’est transmise depuis cette version. En cas d’urgence, composez le <b>177</b>.</div>
<div class="types" id="alTypes"><button class="on" data-t="Agression"><span>🛑</span>Agression</button><button data-t="Accident"><span>🚗</span>Accident</button><button data-t="Incendie"><span>🔥</span>Incendie</button><button data-t="Cambriolage en cours"><span>🏠</span>Cambriolage</button></div>
<div class="fld"><label for="alPhone">Votre numéro (pour le rappel)</label><input id="alPhone" type="tel" inputmode="tel" placeholder="+241 06 00 00 00"></div>
<div style="margin-top:12px" id="alAtt"></div>
<div class="info" id="alGeo" style="margin:14px 0">📍 Position : <span id="alGeoT">recherche en cours…</span></div>
<button class="btn red block" id="alSend">${ic('siren')} Envoyer l’alerte maintenant</button></div>
<div id="alDone" class="done" style="display:none"><div class="ok">${ic('check')}</div><h2 style="padding:0">Alerte transmise</h2><p style="color:var(--muted)">La salle de commandement a reçu votre alerte et vous rappellera.</p><div class="numb" id="alNum"></div><p style="font-size:.9rem;color:var(--muted);margin-bottom:14px">Restez en sécurité. Si vous le pouvez, appelez aussi le <b>177</b>.</p><button class="btn navy block" id="alClose">Fermer</button></div></div>`;
document.body.appendChild(modal);
let pos=null,atype='Agression';const alAtt=mountAttach(modal.querySelector('#alAtt'),{label:'Joindre une photo ou une vidéo',camera:true,accept:'image/*,video/*'});
const closeAl=()=>modal.classList.remove('on');
modal.querySelector('.x').onclick=closeAl;modal.onclick=e=>{if(e.target===modal)closeAl()};
modal.querySelector('#alClose').onclick=closeAl;
modal.querySelectorAll('#alTypes button').forEach(b=>b.onclick=()=>{modal.querySelectorAll('#alTypes button').forEach(x=>x.classList.remove('on'));b.classList.add('on');atype=b.dataset.t});
function openAl(){
  modal.classList.add('on');modal.querySelector('#alForm').style.display='';modal.querySelector('#alDone').style.display='none';alAtt.clear();
  const g=modal.querySelector('#alGeoT');g.textContent='recherche en cours…';pos=null;
  if(navigator.geolocation)navigator.geolocation.getCurrentPosition(p=>{pos={lat:p.coords.latitude,lng:p.coords.longitude};g.textContent='localisée ('+pos.lat.toFixed(4)+', '+pos.lng.toFixed(4)+')'},()=>{g.textContent='non disponible — indiquez votre quartier au téléphone'},{timeout:6000});
  else g.textContent='non disponible sur cet appareil';
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-alert]');if(b){e.preventDefault();openAl()}});
modal.querySelector('#alSend').onclick=async()=>{
  const files=await alAtt.read();
  const a=window.FPN&&FPN.addAlert({type:atype,files,lat:pos?pos.lat:0.39+Math.random()*.05,lng:pos?pos.lng:9.43+Math.random()*.05,phone:modal.querySelector('#alPhone').value,quartier:pos?'Position GPS':'Position approximative'});
  modal.querySelector('#alNum').textContent=a?a.id:'A-0000';
  modal.querySelector('#alForm').style.display='none';modal.querySelector('#alDone').style.display='';
};

/* Apparition au défilement */
const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12}):null;
document.querySelectorAll('.reveal').forEach(el=>io?io.observe(el):el.classList.add('in'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('.modal.on').forEach(m=>m.classList.remove('on'));sheet.classList.remove('on')}});
document.querySelectorAll('[data-i]').forEach(e=>{if(!e.innerHTML.trim())e.innerHTML=ic(e.dataset.i)});
})();
