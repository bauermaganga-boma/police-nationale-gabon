/* Gabarit commun : bandeau urgence, en-tête, barre mobile, pied de page, alerte 177 */
(function(){
const P=document.body.dataset.page||'';
const TITLE=document.body.dataset.title||'';
const I={
 home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
 file:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
 map:'<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.500C5 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.500"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
 phone:'<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
 back:'<path d="M15 5l-7 7 7 7"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.500-6 8-6s8 2 8 6"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.500-4.500"/>',
 lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
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
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1"/>',
 star:'<path d="M12 3l2.800 5.800 6.200.9-4.500 4.400 1.100 6.300L12 17.400 6.400 20.400l1.100-6.300L3 9.700l6.200-.9z"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 car:'<path d="M3 13l2-6h14l2 6v5h-3v-2H6v2H3z"/><circle cx="7.500" cy="13.500" r="1"/><circle cx="16.500" cy="13.500" r="1"/>',
 cap:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.500V16c0 1.500 3 3 6 3s6-1.500 6-3v-4.500"/>',
 heart:'<path d="M12 21s-8-5-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 10c0 6-8 11-8 11z"/>'
};
const ic=(n,c)=>`<svg class="ico ${c||''}" viewBox="0 0 24 24" aria-hidden="true">${I[n]||''}</svg>`;
window.icon=ic;

const NAV=[['index.html','Accueil','home'],['institution.html','L’institution','shield'],['demarches.html','Mes démarches','file'],['prevention.html','Prévention','heart'],['commissariats.html','Commissariats','map'],['recrutement.html','Recrutement','cap'],['actualites.html','Actualités','news']];
const isIdx=P==='index';

/* En-tête */
const strip=`<div class="strip"><div class="wrap"><a href="tel:177"><span class="pulse"></span> Urgence police : <b>177</b></a><span>Préfecture de police : +241 65 81 81 81</span><span class="demo">Version de démonstration · Forces de Police Nationale – Gabon</span></div></div>`;
const head=`<header class="head ${isIdx?'':'inner'}"><div class="wrap">
 ${isIdx?'':`<button class="mback" id="mback" aria-label="Retour">${ic('back')}</button>`}
 <a class="brand" href="index.html"><img src="assets/img/logo.svg" alt="Emblème de la Police nationale du Gabon"><span><b>${isIdx?'Police nationale du Gabon':(TITLE||'Police nationale')}</b><small>République gabonaise</small></span></a>
 <nav class="nav" aria-label="Navigation principale">${NAV.map(n=>`<a href="${n[0]}" class="${n[0].startsWith(P)&&P?'on':''}">${n[1]}</a>`).join('')}</nav>
 <div class="cta"><a class="btn line sm" href="agents.html">${ic('lock')} Espace agents</a><button class="btn red sm" data-alert>${ic('alert')} Alerte 177</button></div>
 <a class="mcall" href="tel:177">${ic('phone')} 177</a>
</div></header>`;
document.body.insertAdjacentHTML('afterbegin',strip+head);

/* Pied de page */
const foot=`<footer class="foot"><div class="wrap"><div class="cols">
 <div><a class="brand" href="index.html"><img src="assets/img/logo.svg" alt="" style="height:56px"><span><b>Police nationale du Gabon</b><small>Forces de Police Nationale</small></span></a>
  <p style="margin-top:14px;font-size:.93rem;max-width:36ch">Au service de la sécurité des personnes et de la protection des biens. Placée sous la tutelle du ministère de l’Intérieur, de la Sécurité et de la Décentralisation.</p>
  <p style="margin-top:14px"><b style="color:#fff;font-size:1.3rem;font-family:var(--head)">Urgence : 177</b></p></div>
 <div><h4>Citoyens</h4><a href="demarches.html">Mes démarches</a><a href="suivi.html">Suivre ma demande</a><a href="verifier.html">Vérifier un policier</a><a href="prevention.html">Conseils de prévention</a><a href="commissariats.html">Trouver un commissariat</a></div>
 <div><h4>Institution</h4><a href="institution.html">Missions et directions</a><a href="recrutement.html">Recrutement</a><a href="actualites.html">Salle de presse</a><a href="chiffres.html">La sécurité en chiffres</a><a href="contact.html">Contact</a></div>
 <div><h4>Vous êtes agent ?</h4><div class="agents"><b>Espace agents sécurisé</b><span style="font-size:.88rem">Demandes citoyennes, main courante, ressources humaines, moyens, opérations.</span><br><a class="btn gold sm" href="agents.html">${ic('lock')} Se connecter</a></div></div>
</div>
<div class="legal"><span>© 2026 Forces de Police Nationale – République gabonaise · Version de démonstration</span><span>Site conçu et développé par <em>Rouana</em></span></div></div></footer>`;
const mainEnd=document.createElement('div');mainEnd.innerHTML=foot;document.body.appendChild(mainEnd.firstChild);

/* Barre mobile */
const tabs=[['index.html','Accueil','home','index'],['demarches.html','Démarches','file','demarches'],null,['commissariats.html','Carte','map','commissariats']];
const mbar=`<nav class="mbar" aria-label="Navigation mobile">
 ${tabs.map(t=>t?`<a href="${t[0]}" class="${P===t[3]?'on':''}">${ic(t[2])}<span>${t[1]}</span></a>`:`<button class="sos" data-alert aria-label="Alerte 177"><span>177</span>Alerte</button>`).join('')}
 <button id="mmenu" aria-label="Menu">${ic('menu')}<span>Menu</span></button></nav>
<div class="sheet" id="sheet"><div class="in"><div class="grab"></div>
 ${[['suivi.html','Suivre ma demande','search'],['verifier.html','Vérifier un policier','qr'],['institution.html','L’institution','shield'],['prevention.html','Prévention','heart'],['recrutement.html','Recrutement','cap'],['actualites.html','Actualités','news'],['chiffres.html','La sécurité en chiffres','chart'],['contact.html','Contact','mail']].map(m=>`<a class="m" href="${m[0]}">${ic(m[2])}${m[1]}</a>`).join('')}
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

/* Alerte 177 */
const modal=document.createElement('div');modal.className='modal';modal.id='alertModal';
modal.innerHTML=`<div class="mbox" role="dialog" aria-modal="true" aria-labelledby="alT"><button class="x" aria-label="Fermer">×</button>
<div id="alForm"><h2 id="alT">🚨 Alerte 177</h2>
<p style="color:var(--muted);margin-bottom:6px">Votre position est envoyée à la salle de commandement, qui vous rappelle.</p>
<div class="warn" style="margin:10px 0"><b>Démonstration :</b> aucune alerte réelle n’est transmise depuis cette version. En cas d’urgence, composez le <b>177</b>.</div>
<div class="types" id="alTypes"><button class="on" data-t="Agression"><span>🛑</span>Agression</button><button data-t="Accident"><span>🚗</span>Accident</button><button data-t="Incendie"><span>🔥</span>Incendie</button><button data-t="Cambriolage en cours"><span>🏠</span>Cambriolage</button></div>
<div class="fld"><label for="alPhone">Votre numéro (pour le rappel)</label><input id="alPhone" type="tel" inputmode="tel" placeholder="+241 06 00 00 00"></div>
<div class="info" id="alGeo" style="margin:14px 0">📍 Position : <span id="alGeoT">recherche en cours…</span></div>
<button class="btn red block" id="alSend">${ic('alert')} Envoyer l’alerte maintenant</button></div>
<div id="alDone" class="done" style="display:none"><div class="ok">${ic('check')}</div><h2 style="padding:0">Alerte transmise</h2><p style="color:var(--muted)">La salle de commandement a reçu votre alerte et vous rappellera.</p><div class="numb" id="alNum"></div><p style="font-size:.9rem;color:var(--muted);margin-bottom:14px">Restez en sécurité. Si vous le pouvez, appelez aussi le <b>177</b>.</p><button class="btn navy block" id="alClose">Fermer</button></div></div>`;
document.body.appendChild(modal);
let pos=null,atype='Agression';
const closeAl=()=>modal.classList.remove('on');
modal.querySelector('.x').onclick=closeAl;modal.onclick=e=>{if(e.target===modal)closeAl()};
modal.querySelector('#alClose').onclick=closeAl;
modal.querySelectorAll('#alTypes button').forEach(b=>b.onclick=()=>{modal.querySelectorAll('#alTypes button').forEach(x=>x.classList.remove('on'));b.classList.add('on');atype=b.dataset.t});
function openAl(){
  modal.classList.add('on');modal.querySelector('#alForm').style.display='';modal.querySelector('#alDone').style.display='none';
  const g=modal.querySelector('#alGeoT');g.textContent='recherche en cours…';pos=null;
  if(navigator.geolocation)navigator.geolocation.getCurrentPosition(p=>{pos={lat:p.coords.latitude,lng:p.coords.longitude};g.textContent='localisée ('+pos.lat.toFixed(4)+', '+pos.lng.toFixed(4)+')'},()=>{g.textContent='non disponible — indiquez votre quartier au téléphone'},{timeout:6000});
  else g.textContent='non disponible sur cet appareil';
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-alert]');if(b){e.preventDefault();openAl()}});
modal.querySelector('#alSend').onclick=()=>{
  const a=window.FPN&&FPN.addAlert({type:atype,lat:pos?pos.lat:0.39+Math.random()*.05,lng:pos?pos.lng:9.43+Math.random()*.05,phone:modal.querySelector('#alPhone').value,quartier:pos?'Position GPS':'Position approximative'});
  modal.querySelector('#alNum').textContent=a?a.id:'A-0000';
  modal.querySelector('#alForm').style.display='none';modal.querySelector('#alDone').style.display='';
};

/* Apparition au défilement */
const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12}):null;
document.querySelectorAll('.reveal').forEach(el=>io?io.observe(el):el.classList.add('in'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('.modal.on').forEach(m=>m.classList.remove('on'));sheet.classList.remove('on')}});
})();
