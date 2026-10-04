/* Espace Agents — pièces jointes (demandes, alertes, candidatures) */
(function(){
'use strict';
const AG=window.AG,F=AG.F,E=AG.E,$=AG.$,$$=AG.$$,ic=AG.ic;
const isImg=f=>/^image\//.test(f.type||'')||/\.(png|jpe?g|gif|webp)$/i.test(f.name||'');
const isPdf=f=>/pdf/.test(f.type||'')||/\.pdf$/i.test(f.name||'');
const kind=f=>isImg(f)?'image':'file';
AG.files={
  count:l=>(l||[]).length,
  /* pastille trombone + nombre pour les listes */
  badge(l){const n=(l||[]).length;return n?'<span class="clip" title="'+n+' pièce'+(n>1?'s':'')+' jointe'+(n>1?'s':'')+'">'+ic('clip')+n+'</span>':''},
  section(list,canAdd){
    list=list||[];
    return '<span class="sec">Pièces jointes ('+list.length+')</span>'+
     (list.length?'<ul class="files">'+list.map((f,i)=>'<li><span class="fi'+(isPdf(f)?' pdf':'')+'">'+ic(kind(f))+'</span><div><b>'+E(f.name)+'</b><small>'+E(F.fmtSize(f.size||0))+(f.type?' · '+E(f.type):'')+'</small></div><button type="button" class="btn sm line" data-fi="'+i+'">'+(f.data&&isImg(f)?'Ouvrir':'Télécharger')+'</button></li>').join('')+'</ul>':'<p style="color:var(--muted);font-size:.88rem;margin-bottom:10px">Aucune pièce jointe.</p>')+
     (canAdd?'<div class="box"><label class="lbl" for="fAdd">Ajouter une pièce jointe</label><input type="file" id="fAdd" multiple aria-label="Ajouter une pièce jointe"><small style="color:var(--muted);display:block;margin-top:6px">Les fichiers de plus de 900 Ko sont enregistrés sans aperçu (démonstration).</small></div>':'');
  },
  open(f){
    if(!f)return;
    if(!f.data){AG.toast('Aperçu non disponible (fichier de démonstration).','warn');return}
    if(isImg(f)){AG.modal(f.name,'<div class="viewer"><img src="'+f.data+'" alt="'+E(f.name)+'"><div class="acts" style="margin-top:12px"><a class="btn line" download="'+E(f.name)+'" href="'+f.data+'">'+ic('dl')+'Télécharger</a><button class="btn gold" id="vwX">Fermer</button></div></div>',true);$('#vwX').onclick=AG.closeModal;return}
    const a=document.createElement('a');a.href=f.data;a.download=f.name;document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),300);
  },
  /* getList() renvoie le tableau vivant ; onAdded(fichiers) est appelé après lecture */
  bind(root,getList,onAdded){
    $$('[data-fi]',root).forEach(b=>b.onclick=()=>AG.files.open((getList()||[])[+b.dataset.fi]));
    const inp=$('#fAdd',root);
    if(inp)inp.onchange=()=>{if(!inp.files.length)return;F.readFiles(inp.files).then(fs=>{if(!fs.length)return;const l=getList();fs.forEach(f=>l.push(f));onAdded(fs)})};
  }
};
})();
