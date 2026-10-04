/* Espace Agents — notes de service & messagerie */
(function(){
'use strict';
const AG=window.AG,F=AG.F,E=AG.E,$=AG.$,ic=AG.ic;
function view(main){
  const me=AG.me,canPost=['commandement','provincial','chef','admin'].includes(me.role);
  const notes=()=>{const s=AG.scope();return AG.messages().filter(n=>!n.province||!s.prov||n.province===s.prov).sort((a,b)=>b.at-a.at)};
  const draw=()=>{
    const N=notes(),chat=F.db().chat||[];
    main.innerHTML='<div class="ph"><div><h2>Notes de service &amp; messagerie</h2><p>Communications internes · '+E(AG.scopeLabel())+'.</p></div>'+(canPost?'<div class="acts"><button class="btn gold" id="nsAdd">'+ic('plus')+'Nouvelle note de service</button></div>':'')+'</div>'+
     '<div class="msg"><div><h3 class="sh" style="margin-top:0">Notes de service <small>'+AG.plural(N.length,'note')+'</small></h3>'+
      (N.length?N.map(n=>'<article class="note'+(n.important?' imp':'')+'"><h4>'+E(n.titre)+(n.important?' <span class="bd late">Important</span>':'')+'</h4><small>'+E(n.id)+' · '+E(n.from)+' · '+E(F.fmt(n.at))+' · '+E(n.province?AG.provNom(n.province):'Tout le pays')+'</small><p style="font-size:.9rem">'+E(n.texte)+'</p></article>').join(''):AG.empty('Aucune note','Aucune note de service pour cette portée.','messages'))+'</div>'+
     '<div class="card"><h3>Messagerie interne <small>canal commun</small></h3><div class="chat" id="chat">'+(chat.length?chat.map(c=>'<div class="bub'+(c.de===me.matricule?' me':'')+'"><small>'+E(c.nom)+' · '+E(F.fmt(c.at))+'</small>'+E(c.texte)+'</div>').join(''):AG.empty('Aucun message','Écrivez le premier message.'))+'</div><form id="chF" class="row" style="display:flex;gap:8px"><label class="sr" for="chT">Message</label><input id="chT" placeholder="Écrire un message…" autocomplete="off"><button class="btn navy" type="submit" aria-label="Envoyer">'+ic('send')+'</button></form></div></div>';
    const c=$('#chat');if(c)c.scrollTop=c.scrollHeight;
    $('#chF').addEventListener('submit',e=>{e.preventDefault();const t=$('#chT').value.trim();if(!t)return;const d=F.db();(d.chat=d.chat||[]).push({at:Date.now(),de:me.matricule,nom:me.nom,texte:t});AG.log('Message interne','Canal commun');draw();$('#chT').focus()});
    const a=$('#nsAdd');if(a)a.onclick=addNote;
  };
  function addNote(){
    const s=AG.scope();
    AG.modal('Nouvelle note de service','<form id="nF" novalidate><div class="fld"><label for="nT">Titre</label><input id="nT" required></div><div class="fld"><label for="nX">Texte</label><textarea id="nX" required></textarea></div><div class="f2"><div class="fld"><label for="nP">Destinataires</label><select id="nP">'+AG.opts([['','Tout le pays']].concat(F.PROVINCES.filter(p=>!s.prov||p.id===s.prov).map(p=>[p.id,p.nom])),s.prov||'')+'</select></div><div class="fld"><label for="nI">Importance</label><select id="nI"><option value="">Normale</option><option value="1">Importante</option></select></div></div><p class="err" id="nE" hidden>Renseignez le titre et le texte.</p><div class="acts"><button type="button" class="btn line" id="nC">Annuler</button><button class="btn gold" type="submit">Publier</button></div></form>');
    if(s.prov)$('#nP').disabled=true;
    $('#nC').onclick=AG.closeModal;
    $('#nF').addEventListener('submit',e=>{e.preventDefault();const t=$('#nT').value.trim(),x=$('#nX').value.trim();if(!t||!x){$('#nE').hidden=false;return}
      const L=AG.messages(),n=Math.max(0,...L.map(m=>parseInt(String(m.id).replace(/\D/g,''))||0))+1;
      L.unshift({id:'NS-'+String(n).padStart(3,'0'),at:Date.now(),from:me.nom,titre:t,texte:x,important:!!$('#nI').value,province:$('#nP').value,com:''});
      AG.log('Note de service publiée','NS-'+n);AG.closeModal();AG.toast('Note de service publiée.');draw()});
  }
  draw();
}
AG.register('messages',{label:'Notes de service & messagerie',short:'Messages',key:'n',render:view});
})();
