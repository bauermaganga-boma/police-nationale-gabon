/* Base de données de démonstration (localStorage) — partagée entre le site citoyen et l'espace agents.
   Tout ce qui est créé côté citoyen (pré-plainte, alerte 177, candidature…) apparaît côté agents.
   Toutes les personnes, numéros et chiffres sont FICTIFS. En production : remplacé par une API sécurisée. */
(function(){
const KEY='fpn_demo_v2';
const D={};

/* ---------- Référentiels ---------- */
D.TYPES={preplainte:'Pré-plainte',cyber:'Signalement cyber',anonyme:'Signalement anonyme',objet:'Objet perdu / trouvé',rdv:'Rendez-vous DGDI',message:'Message / contact'};
D.STATUTS=[{k:'recue',l:'Reçue',c:'s1'},{k:'transmise',l:'Transmise au commissariat',c:'s2'},{k:'enquete',l:'En cours de traitement',c:'s3'},{k:'cloturee',l:'Clôturée',c:'s4'}];
D.statut=k=>D.STATUTS.find(s=>s.k===k)||D.STATUTS[0];
/* 9 provinces du Gabon (chef-lieu entre parenthèses). Commissariats : liste de démonstration à confirmer. */
D.PROVINCES=[
 {id:'estuaire',nom:'Estuaire',chef:'Libreville',lat:0.39,lng:9.45,z:10},
 {id:'haut-ogooue',nom:'Haut-Ogooué',chef:'Franceville',lat:-1.63,lng:13.58,z:9},
 {id:'moyen-ogooue',nom:'Moyen-Ogooué',chef:'Lambaréné',lat:-0.70,lng:10.24,z:9},
 {id:'ngounie',nom:'Ngounié',chef:'Mouila',lat:-1.87,lng:11.06,z:9},
 {id:'nyanga',nom:'Nyanga',chef:'Tchibanga',lat:-2.85,lng:11.02,z:9},
 {id:'ogooue-ivindo',nom:'Ogooué-Ivindo',chef:'Makokou',lat:0.57,lng:12.86,z:8},
 {id:'ogooue-lolo',nom:'Ogooué-Lolo',chef:'Koulamoutou',lat:-1.13,lng:12.47,z:9},
 {id:'ogooue-maritime',nom:'Ogooué-Maritime',chef:'Port-Gentil',lat:-0.72,lng:8.78,z:9},
 {id:'woleu-ntem',nom:'Woleu-Ntem',chef:'Oyem',lat:1.60,lng:11.58,z:8}
];
D.province=id=>D.PROVINCES.find(p=>p.id===id)||D.PROVINCES[0];
(function(){
 const L=[];
 const add=(id,nom,ville,prov,lat,lng,type,h,extra)=>L.push(Object.assign({id,nom,ville,province:prov,lat,lng,tel:'177',h:h||'24 h/24',type:type||'Commissariat'},extra||{}));
 // Estuaire
 add('plb','Préfecture de police du Grand Libreville','Libreville','estuaire',0.3925,9.4536,'Préfecture','24 h/24',{tel:'+241 65 81 81 81'});
 add('lbv1','Commissariat central de Libreville','Libreville','estuaire',0.3901,9.4467);
 add('lbv2','Commissariat d’arrondissement – Libreville 2e','Libreville','estuaire',0.4012,9.4601);
 add('lbv3','Commissariat d’arrondissement – Libreville 3e','Libreville','estuaire',0.4245,9.4733);
 add('lbv5','Commissariat d’arrondissement – Libreville 5e','Libreville','estuaire',0.3612,9.4399);
 add('akanda','Commissariat d’Akanda','Akanda','estuaire',0.5176,9.3855);
 add('owendo','Commissariat d’Owendo','Owendo','estuaire',0.2873,9.5081);
 add('pk12','Poste de police du PK12','Libreville','estuaire',0.4561,9.4812,'Poste','6 h – 22 h');
 add('ntoum','Commissariat de Ntoum','Ntoum','estuaire',0.3903,9.7611);
 add('cocobeach','Poste de police de Cocobeach','Cocobeach','estuaire',1.0,9.5833,'Poste','7 h – 20 h');
 add('dgdi','DGDI – Documentation et Immigration','Libreville','estuaire',0.4033,9.4571,'Service','Lun–Ven 7 h 30 – 15 h 30');
 // Autres provinces
 add('fcv','Commissariat central de Franceville','Franceville','haut-ogooue',-1.6333,13.5836);
 add('moanda','Commissariat de Moanda','Moanda','haut-ogooue',-1.5667,13.2);
 add('okondja','Poste de police d’Okondja','Okondja','haut-ogooue',-0.6667,13.6667,'Poste','7 h – 20 h');
 add('leconi','Poste de police de Léconi','Léconi','haut-ogooue',-1.5833,14.25,'Poste','7 h – 20 h');
 add('lamb','Commissariat de Lambaréné','Lambaréné','moyen-ogooue',-0.7001,10.2406);
 add('ndjole','Poste de police de Ndjolé','Ndjolé','moyen-ogooue',-0.1833,10.7667,'Poste','7 h – 20 h');
 add('mouila','Commissariat de Mouila','Mouila','ngounie',-1.8685,11.0559);
 add('fougamou','Poste de police de Fougamou','Fougamou','ngounie',-1.2167,10.5833,'Poste','7 h – 20 h');
 add('tchibanga','Commissariat de Tchibanga','Tchibanga','nyanga',-2.8573,11.0242);
 add('mayumba','Poste de police de Mayumba','Mayumba','nyanga',-3.4333,10.65,'Poste','7 h – 20 h');
 add('makokou','Commissariat de Makokou','Makokou','ogooue-ivindo',0.5738,12.8642);
 add('booue','Poste de police de Booué','Booué','ogooue-ivindo',-0.1,11.9333,'Poste','7 h – 20 h');
 add('mekambo','Poste de police de Mékambo','Mékambo','ogooue-ivindo',1.0167,13.9333,'Poste','7 h – 20 h');
 add('koula','Commissariat de Koulamoutou','Koulamoutou','ogooue-lolo',-1.1297,12.4733);
 add('lastours','Poste de police de Lastoursville','Lastoursville','ogooue-lolo',-0.8167,12.7333,'Poste','7 h – 20 h');
 add('pg','Commissariat central de Port-Gentil','Port-Gentil','ogooue-maritime',-0.7193,8.7815);
 add('pg2','Commissariat d’arrondissement – Port-Gentil 2','Port-Gentil','ogooue-maritime',-0.7301,8.7702);
 add('gamba','Poste de police de Gamba','Gamba','ogooue-maritime',-2.65,10.0,'Poste','7 h – 20 h');
 add('oyem','Commissariat central d’Oyem','Oyem','woleu-ntem',1.5995,11.5793);
 add('bitam','Commissariat de Bitam','Bitam','woleu-ntem',2.0833,11.4833);
 add('mitzic','Poste de police de Mitzic','Mitzic','woleu-ntem',0.7833,11.55,'Poste','7 h – 20 h');
 add('minvoul','Poste de police de Minvoul','Minvoul','woleu-ntem',2.1500,12.1333,'Poste','7 h – 20 h');
 D.COMMISSARIATS=L;
})();
D.commissariatsOf=pid=>D.COMMISSARIATS.filter(c=>c.province===pid);
D.provinceOf=cid=>D.commissariat(cid).province;
D.commissariat=id=>D.COMMISSARIATS.find(c=>c.id===id)||D.COMMISSARIATS[0];
D.GRADES=['Gardien de la paix','Brigadier','Brigadier-chef','Lieutenant','Capitaine','Commandant','Commissaire','Colonel'];
D.SERVICES=['Sécurité publique','Police judiciaire','Police technique et scientifique','OCLAD','Sécurité urbaine','DGDI','Services administratifs','Interpol / Afripol'];
D.ROLES={
 commandement:{l:'Commandement',mods:['dashboard','demandes','alertes','courante','rh','moyens','ops','concours','audit']},
 provincial:{l:'Direction provinciale',mods:['dashboard','demandes','alertes','courante','rh','moyens','ops']},
 chef:{l:'Chef de commissariat',mods:['dashboard','demandes','alertes','courante','moyens','ops']},
 agent:{l:'Agent de terrain',mods:['demandes','alertes','courante','ops']},
 rh:{l:'Ressources humaines',mods:['dashboard','rh','concours']},
 admin:{l:'Administrateur / audit',mods:['dashboard','audit','rh']}
};
D.COMPTES=[
 {matricule:'CMD-001',nom:'Cdt. Démo Commandement',role:'commandement',grade:'Colonel',poste:'État-major (démonstration)'},
 {matricule:'PRV-009',nom:'Col. Démo Direction provinciale',role:'provincial',grade:'Colonel',poste:'Direction provinciale – Estuaire',province:'estuaire'},
 {matricule:'CHF-014',nom:'Cne. Démo Commissariat',role:'chef',grade:'Capitaine',poste:'Commissariat central de Libreville',commissariat:'lbv1',province:'estuaire'},
 {matricule:'AGT-232',nom:'Bgd. Démo Terrain',role:'agent',grade:'Brigadier',poste:'Libreville 2e',commissariat:'lbv2',province:'estuaire'},
 {matricule:'RH-007',nom:'Lt. Démo Ressources humaines',role:'rh',grade:'Lieutenant',poste:'Direction des services administratifs'},
 {matricule:'ADM-000',nom:'Admin Démo',role:'admin',grade:'Commissaire',poste:'Inspection / audit'}
];
D.PASS='demo2026'; D.CODE2FA='123456';

/* ---------- Utilitaires ---------- */
let seed=20261004;
const rnd=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296};
const pick=a=>a[Math.floor(rnd()*a.length)];
D.pick=pick;
const DAY=864e5;
const pickCom=()=>{const L=rnd()<.52?D.commissariatsOf('estuaire').filter(c=>c.type!=='Service'):D.COMMISSARIATS.filter(c=>c.type!=='Service');return pick(L).id};
const FILES=[['photo-constat.jpg',184320,'image/jpeg'],['capture-ecran-message.png',96256,'image/png'],['recepisse-declaration.pdf',221184,'application/pdf'],['piece-identite.jpg',143360,'image/jpeg']];
D.now=()=>Date.now();
D.fmt=(t,withTime=true)=>{const d=new Date(t);const o={day:'2-digit',month:'short',year:'numeric'};if(withTime){o.hour='2-digit';o.minute='2-digit'}return d.toLocaleString('fr-FR',o)};
D.fmtShort=t=>new Date(t).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'});
D.esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- Données fictives ---------- */
const NOMS=['Moussavou','Nzamba','Obame','Mba','Ndong','Ondo','Ovono','Mintsa','Bongo','Nguema','Ekomi','Mouketou','Boussougou','Ntoutoume','Mengue','Koumba','Ngoua','Essono','Madoungou','Mapangou'];
const PRENOMS=['Jean','Marie','Paul','Estelle','Brice','Chantal','Hervé','Nadège','Cédric','Sandra','Arnaud','Prisca','Fabrice','Léa','Dimitri','Ruth','Steve','Carine','Yannick','Océane'];
const QUARTIERS=['Akébé','Nzeng-Ayong','Louis','Batterie IV','Lalala','Montagne Sainte','Angondjé','PK8','Oloumi','Mont-Bouët','Glass','Bikélé-Nzong','Alibandeng','Sibang'];
const SUJETS={
 preplainte:['Vol de téléphone portable','Vol à l’arraché','Cambriolage de domicile','Perte de documents','Dégradation de véhicule','Vol de moto'],
 cyber:['Arnaque Mobile Money','Usurpation de compte Facebook','Chantage sur les réseaux sociaux','Faux site de vente en ligne'],
 anonyme:['Point de deal signalé','Éclairage public défaillant','Attroupement suspect','Véhicule abandonné'],
 objet:['Carte d’identité retrouvée','Sac à dos perdu','Clés trouvées','Portefeuille perdu'],
 rdv:['Renouvellement de passeport','Carte de séjour','Demande de visa']
};
function mkRequests(){
  const out=[];const t0=Date.now();
  const types=['preplainte','preplainte','preplainte','cyber','cyber','anonyme','objet','rdv'];
  for(let i=0;i<64;i++){
    const type=pick(types);const age=Math.floor(rnd()*56)*DAY+Math.floor(rnd()*DAY);const at=t0-age;
    const prog=Math.min(3,Math.floor(age/DAY/(5+rnd()*8)));
    const st=D.STATUTS[prog].k;
    const com=pickCom();
    const nom=pick(NOMS)+' '+pick(PRENOMS);
    const tl=[{at,status:'recue',text:'Demande reçue et enregistrée.',by:'Système'}];
    if(prog>=1)tl.push({at:at+3*36e5,status:'transmise',text:'Transmise au '+D.commissariat(com).nom+'.',by:'Salle d’information'});
    if(prog>=2)tl.push({at:at+DAY*1.2,status:'enquete',text:'Dossier pris en charge par un officier.',by:'Cne. Démo Commissariat'});
    if(prog>=3)tl.push({at:at+DAY*(3+rnd()*5),status:'cloturee',text:'Dossier clôturé. L’usager a été informé.',by:'Cne. Démo Commissariat'});
    out.push({id:'FPN-2026-'+String(100+i).padStart(5,'0'),type,createdAt:at,status:st,commissariat:com,province:D.provinceOf(com),files:rnd()<.4?[pick(FILES)].map(f=>({name:f[0],size:f[1],type:f[2],data:null})):[],subject:pick(SUJETS[type]),
      details:{quartier:pick(QUARTIERS),description:'Description fournie par l’usager (donnée fictive de démonstration).'},
      contact:{nom,tel:'+241 0'+(6+Math.floor(rnd()*2))+' '+String(Math.floor(rnd()*90)+10)+' '+String(Math.floor(rnd()*90)+10)+' '+String(Math.floor(rnd()*90)+10),email:''},
      priority:rnd()<.18?'haute':'normale',assignee:prog>=2?'Cne. Démo Commissariat':'',timeline:tl});
  }
  return out.sort((a,b)=>b.createdAt-a.createdAt);
}
function mkAgents(){
  const out=[];
  for(let i=0;i<28;i++){
    const gi=Math.min(7,Math.floor(Math.pow(rnd(),1.6)*8));
    const cm=pickCom();out.push({id:'AG-'+(1000+i),province:D.provinceOf(cm),matricule:'FPN-'+String(2000+Math.floor(rnd()*7000)),badge:'FPN-'+(4800+i*7),
      nom:pick(NOMS).toUpperCase(),prenom:pick(PRENOMS),grade:D.GRADES[gi],service:pick(D.SERVICES),
      commissariat:cm,
      entree:2004+Math.floor(rnd()*21),statut:rnd()<.9?'En service':pick(['En congé','En formation']),
      formations:pick([['Maintien de l’ordre'],['Police judiciaire','Cybercriminalité'],['Premiers secours'],['Conduite de patrouille','Relations avec le public'],['Police technique']]),
      tableau:rnd()<.35?'Proposé 2026':'—'});
  }
  return out;
}
function mkVehicles(){
  const m=['Toyota Hilux','Suzuki Jimny','Toyota Land Cruiser','Moto Yamaha','Renault Duster','Mitsubishi L200'];
  const out=[];
  for(let i=0;i<14;i++){
    out.push({id:'V-'+(10+i),immat:'GA-'+(100+Math.floor(rnd()*800))+'-'+pick(['AB','FPN','LB','PN']),modele:pick(m),
      affectation:pickCom(),etat:rnd()<.72?'Opérationnel':(rnd()<.5?'En entretien':'Hors service'),
      carburant:Math.floor(rnd()*80)+15,km:Math.floor(rnd()*140000)+8000,entretien:Date.now()+Math.floor(rnd()*80-15)*DAY,dotation:rnd()<.3?'Dotation mai 2026':''});
  }
  return out;
}
function mkOps(){
  const t=Date.now();
  return [
   {id:'OP-301',titre:'Patrouille de nuit – Akébé / Nzeng-Ayong',type:'Patrouille',date:t+DAY*0.3,commissariat:'lbv2',effectif:12,statut:'Planifiée',cr:null},
   {id:'OP-300',titre:'Sécurisation de l’esplanade La Concorde',type:'Présence permanente',date:t-DAY*1,commissariat:'lbv1',effectif:20,statut:'En cours',cr:null},
   {id:'OP-299',titre:'Opération coordonnée – Ntoum',type:'Opération',date:t-DAY*6,commissariat:'ntoum',effectif:100,statut:'Terminée',cr:{interpellations:60,saisies:'Données de démonstration',remarques:'Opération terminée sans incident majeur.'}},
   {id:'OP-298',titre:'Opération – Grand Libreville',type:'Opération',date:t-DAY*16,commissariat:'plb',effectif:70,statut:'Terminée',cr:{interpellations:28,saisies:'Données de démonstration',remarques:'Compte rendu transmis au commandement.'}},
   {id:'OP-302',titre:'Contrôle routier PK12',type:'Contrôle',date:t+DAY*1.2,commissariat:'pk12',effectif:8,statut:'Planifiée',cr:null}
  ];
}
function mkCourante(){
  const out=[];const t=Date.now();
  const n=['Constat d’altercation','Dépôt de plainte – vol','Remise d’objet trouvé','Intervention – trouble à l’ordre public','Accident de la circulation sans blessé','Signalement de personne disparue'];
  for(let i=0;i<14;i++)out.push({id:'MC-'+(500+i),at:t-i*DAY*0.45-Math.floor(rnd()*36e5*6),commissariat:pickCom(),agent:pick(PRENOMS)+' '+pick(NOMS).toUpperCase(),nature:pick(n),texte:'Entrée fictive de démonstration : faits constatés, heure, personnes présentes, suite donnée.'});
  return out;
}
function mkAlerts(){
  const t=Date.now();const out=[];
  const T=['Agression','Accident','Incendie','Cambriolage en cours','Autre urgence'];
  for(let i=0;i<7;i++){
    const age=Math.floor(rnd()*20)*36e5*3;const at=t-age-i*36e5;
    const prog=age>3*DAY/3?3:Math.floor(rnd()*4);
    const st=['nouvelle','prise','patrouille','cloturee'][prog];
    out.push({id:'A-'+(2040+i),at,type:pick(T),lat:0.39+rnd()*0.08-0.02,lng:9.43+rnd()*0.06,quartier:pick(QUARTIERS),phone:'+241 06 '+Math.floor(rnd()*90+10)+' '+Math.floor(rnd()*90+10)+' 00',status:st,
      timeline:[{at,status:'nouvelle',text:'Alerte reçue avec position GPS.'}].concat(prog>=1?[{at:at+2*6e4,status:'prise',text:'Prise en charge par la salle de commandement.'}]:[],prog>=2?[{at:at+6*6e4,status:'patrouille',text:'Patrouille dépêchée.'}]:[],prog>=3?[{at:at+25*6e4,status:'cloturee',text:'Intervention terminée.'}]:[])});
  }
  return out.sort((a,b)=>b.at-a.at);
}
function mkCandidates(){
  const out=[];const C=['Gardien de la paix','Officier de police (exemple)'];
  for(let i=0;i<22;i++){
    out.push({id:'C-'+(3000+i),nom:pick(NOMS).toUpperCase(),prenom:pick(PRENOMS),naissance:(1995+Math.floor(rnd()*10))+'-0'+(1+Math.floor(rnd()*9))+'-1'+Math.floor(rnd()*9),tel:'+241 06 '+Math.floor(rnd()*90+10)+' '+Math.floor(rnd()*90+10)+' '+Math.floor(rnd()*90+10),email:'',diplome:pick(['BEPC','Baccalauréat','Licence','Master']),concours:pick(C),createdAt:Date.now()-Math.floor(rnd()*30)*DAY,status:pick(['recu','recu','valide','valide','convoque','rejete'])});
  }
  return out;
}
function mkAudit(){
  const t=Date.now();const a=['Connexion','Consultation dossier','Changement de statut','Export CSV','Nouvelle entrée main courante'];
  const out=[];for(let i=0;i<14;i++)out.push({at:t-i*36e5*2.4,user:pick(D.COMPTES).matricule,action:pick(a),objet:'FPN-2026-00'+(100+Math.floor(rnd()*60)),ip:'10.12.'+Math.floor(rnd()*20)+'.'+Math.floor(rnd()*250)});
  return out;
}
D.nearestProvince=(lat,lng)=>D.PROVINCES.map(p=>({p,d:(p.lat-lat)**2+(p.lng-lng)**2})).sort((a,b)=>a.d-b.d)[0].p.id;
D.seed=function(){
  const db={v:2,requests:mkRequests(),agents:mkAgents(),vehicles:mkVehicles(),ops:mkOps(),courante:mkCourante(),alerts:mkAlerts(),candidates:mkCandidates(),audit:mkAudit(),session:null,seq:{req:164,alert:2050,cand:3100,op:303,mc:520}};
  db.vehicles.forEach(v=>v.province=D.provinceOf(v.affectation));
  db.ops.forEach(o=>o.province=D.provinceOf(o.commissariat));
  db.courante.forEach(c=>c.province=D.provinceOf(c.commissariat));
  db.alerts.forEach(a=>a.province=D.nearestProvince(a.lat,a.lng));
  db.candidates.forEach(c=>{c.province=pick(D.PROVINCES).id;c.files=rnd()<.6?[{name:'diplome.pdf',size:210944,type:'application/pdf',data:null},{name:'cni.jpg',size:151552,type:'image/jpeg',data:null}]:[]});
  return db;
};
/* Pièces jointes : lit des fichiers (File) et renvoie [{name,size,type,data}] ; data (base64) conservé si le total reste raisonnable pour le stockage local. */
D.readFiles=function(list){
  const files=[...(list||[])];let budget=1800000;
  return Promise.all(files.map(f=>new Promise(res=>{
    const meta={name:f.name,size:f.size,type:f.type||'',data:null};
    if(f.size>budget||f.size>900000){res(meta);return}
    budget-=f.size;const r=new FileReader();r.onload=()=>{meta.data=r.result;res(meta)};r.onerror=()=>res(meta);r.readAsDataURL(f);
  })));
};
D.fmtSize=n=>n>1048576?(n/1048576).toFixed(1)+' Mo':Math.max(1,Math.round(n/1024))+' Ko';

/* ---------- Accès ---------- */
let cache=null;
D.db=function(){
  if(cache)return cache;
  try{const r=localStorage.getItem(KEY);if(r){cache=JSON.parse(r);return cache}}catch(e){}
  cache=D.seed();D.save();return cache;
};
D.save=function(){try{localStorage.setItem(KEY,JSON.stringify(cache))}catch(e){}};
D.reset=function(){cache=null;try{localStorage.removeItem(KEY)}catch(e){}return D.db()};
D.session=()=>D.db().session;
D.login=function(matricule,pass,code){
  const c=D.COMPTES.find(x=>x.matricule===String(matricule).trim().toUpperCase());
  if(!c||pass!==D.PASS)return{ok:false,err:'Matricule ou mot de passe incorrect.'};
  if(code!==D.CODE2FA)return{ok:false,err:'Code de vérification invalide.',step2:true};
  D.db().session=Object.assign({at:Date.now()},c);D.audit('Connexion','—');D.save();return{ok:true,user:c};
};
D.logout=function(){D.audit('Déconnexion','—');D.db().session=null;D.save()};
D.audit=function(action,objet){const s=D.db().session;D.db().audit.unshift({at:Date.now(),user:s?s.matricule:'citoyen',action,objet:objet||'—',ip:'10.12.4.'+Math.floor(Math.random()*250)});D.db().audit.length=Math.min(D.db().audit.length,200)};

D.nextId=function(kind){const s=D.db().seq;const n=++s[kind];D.save();return n};
D.addRequest=function(type,data){
  const n=D.nextId('req');const id='FPN-2026-'+String(n).padStart(5,'0');
  const now=Date.now();
  const r={id,type,createdAt:now,status:'recue',commissariat:data.commissariat||'lbv1',province:D.provinceOf(data.commissariat||'lbv1'),files:data.files||[],subject:data.subject||D.TYPES[type],details:data.details||{},contact:data.contact||{nom:'Anonyme',tel:'',email:''},priority:data.priority||'normale',assignee:'',timeline:[{at:now,status:'recue',text:'Demande reçue et enregistrée.',by:'Système'}]};
  D.db().requests.unshift(r);D.save();return r;
};
D.findRequest=function(id){id=String(id||'').trim().toUpperCase().replace(/\s+/g,'');return D.db().requests.find(r=>r.id===id)};
D.setStatus=function(id,status,text,by){
  const r=D.db().requests.find(x=>x.id===id);if(!r)return;
  r.status=status;r.timeline.push({at:Date.now(),status,text:text||D.statut(status).l,by:by||(D.session()&&D.session().nom)||'Agent'});
  D.audit('Changement de statut',id);D.save();return r;
};
D.addAlert=function(data){
  const n=D.nextId('alert');const now=Date.now();
  const a={id:'A-'+n,at:now,type:data.type||'Autre urgence',files:data.files||[],province:(data.lat!=null?D.nearestProvince(data.lat,data.lng):'estuaire'),lat:data.lat,lng:data.lng,quartier:data.quartier||'Position GPS',phone:data.phone||'',status:'nouvelle',timeline:[{at:now,status:'nouvelle',text:'Alerte reçue'+(data.lat?' avec position GPS.':'.')}]};
  D.db().alerts.unshift(a);D.save();return a;
};
D.addCandidate=function(c){const n=D.nextId('cand');const o=Object.assign({id:'C-'+n,createdAt:Date.now(),status:'recu'},c);D.db().candidates.unshift(o);D.save();return o};
D.verifyBadge=function(code){code=String(code||'').trim().toUpperCase();return D.db().agents.find(a=>a.badge===code)};

window.FPN=D;
})();
