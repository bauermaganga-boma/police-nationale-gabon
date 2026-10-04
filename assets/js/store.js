/* Base de données de démonstration (localStorage) — partagée entre le site citoyen et l'espace agents.
   Tout ce qui est créé côté citoyen (pré-plainte, alerte 177, candidature…) apparaît côté agents.
   Toutes les personnes, numéros et chiffres sont FICTIFS. En production : remplacé par une API sécurisée. */
(function(){
const KEY='fpn_demo_v1';
const D={};

/* ---------- Référentiels ---------- */
D.TYPES={preplainte:'Pré-plainte',cyber:'Signalement cyber',anonyme:'Signalement anonyme',objet:'Objet perdu / trouvé',rdv:'Rendez-vous DGDI'};
D.STATUTS=[{k:'recue',l:'Reçue',c:'s1'},{k:'transmise',l:'Transmise au commissariat',c:'s2'},{k:'enquete',l:'En cours de traitement',c:'s3'},{k:'cloturee',l:'Clôturée',c:'s4'}];
D.statut=k=>D.STATUTS.find(s=>s.k===k)||D.STATUTS[0];
D.COMMISSARIATS=[
 {id:'plb',nom:'Préfecture de police du Grand Libreville',ville:'Libreville',lat:0.3925,lng:9.4536,tel:'+241 65 81 81 81',h:'24 h/24',type:'Préfecture'},
 {id:'lbv1',nom:'Commissariat central de Libreville',ville:'Libreville',lat:0.3901,lng:9.4467,tel:'177',h:'24 h/24',type:'Commissariat'},
 {id:'lbv2',nom:'Commissariat d’arrondissement – Libreville 2e',ville:'Libreville',lat:0.4012,lng:9.4601,tel:'177',h:'24 h/24',type:'Commissariat'},
 {id:'lbv3',nom:'Commissariat d’arrondissement – Libreville 3e',ville:'Libreville',lat:0.4245,lng:9.4733,tel:'177',h:'24 h/24',type:'Commissariat'},
 {id:'lbv5',nom:'Commissariat d’arrondissement – Libreville 5e',ville:'Libreville',lat:0.3612,lng:9.4399,tel:'177',h:'24 h/24',type:'Commissariat'},
 {id:'akanda',nom:'Commissariat d’Akanda',ville:'Akanda',lat:0.5176,lng:9.3855,tel:'177',h:'24 h/24',type:'Commissariat'},
 {id:'owendo',nom:'Commissariat d’Owendo',ville:'Owendo',lat:0.2873,lng:9.5081,tel:'177',h:'24 h/24',type:'Commissariat'},
 {id:'pk12',nom:'Poste de police du PK12',ville:'Libreville',lat:0.4561,lng:9.4812,tel:'177',h:'6 h – 22 h',type:'Poste'},
 {id:'ntoum',nom:'Commissariat de Ntoum',ville:'Ntoum',lat:0.3903,lng:9.7611,tel:'177',h:'24 h/24',type:'Commissariat'},
 {id:'pg',nom:'Commissariat central de Port-Gentil',ville:'Port-Gentil',lat:-0.7193,lng:8.7815,tel:'177',h:'24 h/24',type:'Commissariat'},
 {id:'fcv',nom:'Commissariat central de Franceville',ville:'Franceville',lat:-1.6333,lng:13.5836,tel:'177',h:'24 h/24',type:'Commissariat'},
 {id:'oyem',nom:'Commissariat central d’Oyem',ville:'Oyem',lat:1.5995,lng:11.5793,tel:'177',h:'24 h/24',type:'Commissariat'},
 {id:'lamb',nom:'Commissariat de Lambaréné',ville:'Lambaréné',lat:-0.7001,lng:10.2406,tel:'177',h:'24 h/24',type:'Commissariat'},
 {id:'mouila',nom:'Commissariat de Mouila',ville:'Mouila',lat:-1.8685,lng:11.0559,tel:'177',h:'24 h/24',type:'Commissariat'},
 {id:'dgdi',nom:'DGDI – Documentation et Immigration',ville:'Libreville',lat:0.4033,lng:9.4571,tel:'177',h:'Lun–Ven 7 h 30 – 15 h 30',type:'Service'}
];
D.commissariat=id=>D.COMMISSARIATS.find(c=>c.id===id)||D.COMMISSARIATS[0];
D.GRADES=['Gardien de la paix','Brigadier','Brigadier-chef','Lieutenant','Capitaine','Commandant','Commissaire','Colonel'];
D.SERVICES=['Sécurité publique','Police judiciaire','Police technique et scientifique','OCLAD','Sécurité urbaine','DGDI','Services administratifs','Interpol / Afripol'];
D.ROLES={
 commandement:{l:'Commandement',mods:['dashboard','demandes','alertes','courante','rh','moyens','ops','concours','audit']},
 chef:{l:'Chef de commissariat',mods:['dashboard','demandes','alertes','courante','moyens','ops']},
 agent:{l:'Agent de terrain',mods:['demandes','alertes','courante','ops']},
 rh:{l:'Ressources humaines',mods:['dashboard','rh','concours']},
 admin:{l:'Administrateur / audit',mods:['dashboard','audit','rh']}
};
D.COMPTES=[
 {matricule:'CMD-001',nom:'Cdt. Démo Commandement',role:'commandement',grade:'Colonel',poste:'État-major (démonstration)'},
 {matricule:'CHF-014',nom:'Cne. Démo Commissariat',role:'chef',grade:'Capitaine',poste:'Commissariat central de Libreville',commissariat:'lbv1'},
 {matricule:'AGT-232',nom:'Bgd. Démo Terrain',role:'agent',grade:'Brigadier',poste:'Libreville 2e',commissariat:'lbv2'},
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
    const com=pick(['lbv1','lbv2','lbv3','lbv5','akanda','owendo','pk12','ntoum','pg']);
    const nom=pick(NOMS)+' '+pick(PRENOMS);
    const tl=[{at,status:'recue',text:'Demande reçue et enregistrée.',by:'Système'}];
    if(prog>=1)tl.push({at:at+3*36e5,status:'transmise',text:'Transmise au '+D.commissariat(com).nom+'.',by:'Salle d’information'});
    if(prog>=2)tl.push({at:at+DAY*1.2,status:'enquete',text:'Dossier pris en charge par un officier.',by:'Cne. Démo Commissariat'});
    if(prog>=3)tl.push({at:at+DAY*(3+rnd()*5),status:'cloturee',text:'Dossier clôturé. L’usager a été informé.',by:'Cne. Démo Commissariat'});
    out.push({id:'FPN-2026-'+String(100+i).padStart(5,'0'),type,createdAt:at,status:st,commissariat:com,subject:pick(SUJETS[type]),
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
    out.push({id:'AG-'+(1000+i),matricule:'FPN-'+String(2000+Math.floor(rnd()*7000)),badge:'FPN-'+(4800+i*7),
      nom:pick(NOMS).toUpperCase(),prenom:pick(PRENOMS),grade:D.GRADES[gi],service:pick(D.SERVICES),
      commissariat:pick(['lbv1','lbv2','lbv3','lbv5','akanda','owendo','ntoum','pg','fcv','oyem']),
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
      affectation:pick(['lbv1','lbv2','lbv3','lbv5','akanda','owendo','ntoum','pg']),etat:rnd()<.72?'Opérationnel':(rnd()<.5?'En entretien':'Hors service'),
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
  for(let i=0;i<14;i++)out.push({id:'MC-'+(500+i),at:t-i*DAY*0.45-Math.floor(rnd()*36e5*6),commissariat:pick(['lbv1','lbv2','lbv3','akanda','owendo']),agent:pick(PRENOMS)+' '+pick(NOMS).toUpperCase(),nature:pick(n),texte:'Entrée fictive de démonstration : faits constatés, heure, personnes présentes, suite donnée.'});
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
D.seed=function(){return{v:1,requests:mkRequests(),agents:mkAgents(),vehicles:mkVehicles(),ops:mkOps(),courante:mkCourante(),alerts:mkAlerts(),candidates:mkCandidates(),audit:mkAudit(),session:null,seq:{req:164,alert:2050,cand:3100,op:303,mc:520}}};

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
  const r={id,type,createdAt:now,status:'recue',commissariat:data.commissariat||'lbv1',subject:data.subject||D.TYPES[type],details:data.details||{},contact:data.contact||{nom:'Anonyme',tel:'',email:''},priority:data.priority||'normale',assignee:'',timeline:[{at:now,status:'recue',text:'Demande reçue et enregistrée.',by:'Système'}]};
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
  const a={id:'A-'+n,at:now,type:data.type||'Autre urgence',lat:data.lat,lng:data.lng,quartier:data.quartier||'Position GPS',phone:data.phone||'',status:'nouvelle',timeline:[{at:now,status:'nouvelle',text:'Alerte reçue'+(data.lat?' avec position GPS.':'.')}]};
  D.db().alerts.unshift(a);D.save();return a;
};
D.addCandidate=function(c){const n=D.nextId('cand');const o=Object.assign({id:'C-'+n,createdAt:Date.now(),status:'recu'},c);D.db().candidates.unshift(o);D.save();return o};
D.verifyBadge=function(code){code=String(code||'').trim().toUpperCase();return D.db().agents.find(a=>a.badge===code)};

window.FPN=D;
})();
