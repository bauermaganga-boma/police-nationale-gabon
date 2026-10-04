/* Espace Agents — demandes : tiroir de détail, pièces jointes, modèles de réponse */
(function(){
'use strict';
const AG=window.AG,F=AG.F,E=AG.E,$=AG.$,ic=AG.ic;
const TPL=[
 ['Accusé de réception','Bonjour, votre demande a bien été enregistrée. Elle sera examinée dans les meilleurs délais par le commissariat compétent.'],
 ['Complément demandé','Bonjour, afin de poursuivre le traitement de votre dossier, merci de vous présenter au commissariat avec une pièce d’identité et tout document utile.'],
 ['Objet retrouvé','Bonjour, un objet correspondant à votre déclaration a été retrouvé. Vous pouvez le récupérer au commissariat muni d’une pièce d’identité.'],
 ['Dossier clôturé','Bonjour, votre dossier a été traité et clôturé. Merci de votre confiance envers les Forces de Police Nationale.']
];
AG.TPL=TPL;
/* Étiquette de délai (SLA 72 h) pour un dossier */
AG.delay=function(r){
  if(r.status==='cloturee')return '';
  const h=(Date.now()-r.createdAt)/36e5;
  if(h>72){const x=h-72;return '<span class="bd late">Hors délai +'+(x<24?Math.max(1,Math.round(x))+' h':Math.floor(x/24)+' j')+'</span>'}
  if(h>48)return '<span class="bd warn">Reste '+Math.max(1,Math.round(72-h))+' h</span>';
  return '<span class="bd ok">Dans les délais</span>';
};
AG.reqDrawer=function(id,after){
  const get=()=>F.db().requests.find(x=>x.id===id);
  const html=()=>{
    const r=get();if(!r)return AG.empty('Demande introuvable');
    r.files=r.files||[];
    const det=Object.entries(r.details||{}).map(([k,v])=>'<dt>'+E(k.replace(/_/g,' ').replace(/^./,c=>c.toUpperCase()))+'</dt><dd>'+E(typeof v==='object'?JSON.stringify(v):v)+'</dd>').join('');
    const ct=r.contact||{};
    return '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">'+AG.stBadge(r.status)+(r.priority==='haute'?'<span class="bd haute">Prioritaire</span>':'')+'<span class="bd">'+E(F.TYPES[r.type]||r.type)+'</span>'+AG.delay(r)+'</div>'+
    '<h3 style="margin-bottom:12px;font-size:1.1rem">'+E(r.subject)+'</h3>'+
    '<dl class="dl"><dt>Référence</dt><dd><b>'+E(r.id)+'</b></dd><dt>Reçue le</dt><dd>'+E(F.fmt(r.createdAt))+'</dd><dt>Province</dt><dd>'+E(AG.provNom(r.province))+'</dd><dt>Commissariat</dt><dd>'+E(AG.comNom(r.commissariat))+'</dd><dt>Responsable</dt><dd>'+E(r.assignee||'Non affectée')+'</dd></dl>'+
    '<span class="sec">Coordonnées du demandeur</span><dl class="dl"><dt>Nom</dt><dd>'+E(ct.nom||'Anonyme')+'</dd><dt>Téléphone</dt><dd>'+E(ct.tel||'—')+'</dd><dt>E-mail</dt><dd>'+E(ct.email||'—')+'</dd></dl>'+
    '<span class="sec">Description</span><dl class="dl">'+(det||'<dt>Détails</dt><dd>—</dd>')+'</dl>'+
    '<div id="drFiles">'+AG.files.section(r.files,true)+'</div>'+
    '<span class="sec">Traitement</span>'+
    '<div class="box"><label class="lbl" for="drS">Changer le statut</label><div class="row"><select id="drS">'+AG.opts(F.STATUTS.map(s=>[s.k,s.l]),r.status)+'</select><button class="btn navy sm" id="drSb">Mettre à jour</button></div></div>'+
    '<div class="box"><span class="lbl">Affecter</span>'+AG.provCom('drA',r.province,r.commissariat)+'<button class="btn line sm" id="drCb">Affecter</button></div>'+
    '<div class="box"><label class="lbl" for="drT">Note / réponse à l’usager</label><select id="drT" style="margin-bottom:8px">'+AG.opts(TPL.map((t,i)=>[i,t[0]]),'','Modèle de réponse…')+'</select><textarea id="drN" placeholder="Votre message sera ajouté à la chronologie visible par l’usager…"></textarea><div style="margin-top:8px"><button class="btn gold sm" id="drNb">'+ic('send')+'Ajouter à la chronologie</button></div></div>'+
    '<span class="sec">Chronologie</span>'+AG.tl(r.timeline);
  };
  const bind=()=>{
    const root=$('#drawerBody');const done=m=>{AG.setDrawer(html());bind();if(after)after();AG.toast(m);if(AG.bellDraw)AG.bellDraw()};
    AG.provComBind(root,'drA');
    $('#drSb').onclick=()=>{const r=get(),v=$('#drS').value;if(v===r.status)return AG.toast('Le statut est déjà « '+F.statut(v).l+' ».','warn');F.setStatus(id,v,'Statut : '+F.statut(v).l+'.',AG.userName());done('Statut mis à jour.')};
    $('#drCb').onclick=()=>{const r=get(),v=AG.provComVal('drA');if(v.commissariat===r.commissariat)return AG.toast('Déjà affectée à ce commissariat.','warn');
      r.commissariat=v.commissariat;r.province=v.province;r.assignee=AG.userName();
      if(r.status==='recue')F.setStatus(id,'transmise','Transmise au '+AG.comNom(v.commissariat)+'.',AG.userName());else r.timeline.push({at:Date.now(),status:r.status,text:'Réaffectée au '+AG.comNom(v.commissariat)+'.',by:AG.userName()});
      AG.log('Affectation',id);done('Demande affectée.')};
    $('#drT').onchange=e=>{if(e.target.value!=='')$('#drN').value=TPL[+e.target.value][1]};
    $('#drNb').onclick=()=>{const t=$('#drN').value.trim();if(!t)return AG.toast('Saisissez un message.','warn');const r=get();r.timeline.push({at:Date.now(),status:r.status,text:t,by:AG.userName(),note:true});AG.log('Réponse à l’usager',id);done('Message ajouté à la chronologie.')};
    AG.files.bind(root,()=>{const r=get();r.files=r.files||[];return r.files},fs=>{const r=get();fs.forEach(f=>r.timeline.push({at:Date.now(),status:r.status,text:'Pièce jointe ajoutée : '+f.name+' ('+F.fmtSize(f.size)+').',by:AG.userName()}));AG.log('Pièce jointe ajoutée',id+' · '+fs.map(f=>f.name).join(', '));done(fs.length+' pièce(s) jointe(s) ajoutée(s).')});
  };
  AG.drawer('Demande '+id,html(),after);bind();
};
AG.openers.demande=id=>AG.reqDrawer(id,null);
})();
