/* ═════ Sauvegarde dans le cloud — projet Firebase commun « KMAUGER Apps » (Mijote, Scriptorium et les apps à venir) ═════
   Un seul compte pour toutes les apps. Données : users/{uid}/apps/scriptorium/books/{idLivre}
   (+ sous-collection chunks : texte du livre et images découpés en morceaux < 1 Mo, seuls les morceaux modifiés sont renvoyés). */
const KM_FB={apiKey:'AIzaSyB_qpMK1-eDFEdu_tNHeJW8SdK12baGd7A',authDomain:'kmauger-apps.firebaseapp.com',projectId:'kmauger-apps',
 storageBucket:'kmauger-apps.firebasestorage.app',messagingSenderId:'603142273613',appId:'1:603142273613:web:658426cadbca6686073a04'};
const Cloud=(()=>{
 const V='10.14.1',U='https://www.gstatic.com/firebasejs/'+V+'/',APP='scriptorium',CH=300000,AUTO_MS=3*60*1000;
 let fb=null,user=null,ready=null,timer=0,busy=false,lastErr='';
 const prefs=()=>{try{return JSON.parse(localStorage.getItem('km_cloud')||'{}')}catch(e){return{}}};
 const setPref=(k,v)=>{const p=prefs();p[k]=v;try{localStorage.setItem('km_cloud',JSON.stringify(p))}catch(e){}};
 const auto=()=>prefs().auto!==false;
 const hash=s=>{let a=2166136261,b=0;for(let i=0;i<s.length;i+=1){a^=s.charCodeAt(i);a=Math.imul(a,16777619);b=(b+a)|0}return(a>>>0).toString(36)+(b>>>0).toString(36)+s.length.toString(36)};
 const parts=s=>{const o=[];for(let i=0;i<s.length;i+=CH)o.push(s.slice(i,i+CH));return o.length?o:['']};
 const ERR={'auth/invalid-email':'Adresse e-mail invalide.','auth/missing-password':'Mot de passe manquant.','auth/weak-password':'Mot de passe trop court (6 caractères minimum).',
  'auth/email-already-in-use':'Un compte existe déjà avec cette adresse : connectez-vous.','auth/invalid-credential':'E-mail ou mot de passe incorrect.','auth/wrong-password':'E-mail ou mot de passe incorrect.',
  'auth/user-not-found':'Aucun compte avec cette adresse.','auth/too-many-requests':'Trop d’essais : réessayez dans quelques minutes.','auth/network-request-failed':'Pas de connexion internet.',
  'permission-denied':'Accès refusé par Firebase : les règles de sécurité ne sont pas encore publiées.','unavailable':'Firebase est injoignable (hors ligne ?).','resource-exhausted':'Quota gratuit du jour atteint : la sauvegarde reprendra demain.'};
 const msg=e=>ERR[e&&e.code]||ERR[(e&&e.code||'').replace(/^firestore\//,'')]||(e&&e.message)||String(e);
 function init(){if(ready)return ready;ready=(async()=>{
   const [a,au,fs]=await Promise.all([import(U+'firebase-app.js'),import(U+'firebase-auth.js'),import(U+'firebase-firestore.js')]);
   const app=a.initializeApp(KM_FB),auth=au.getAuth(app),db=fs.getFirestore(app);fb={au,fs,auth,db};
   await new Promise(r=>{let first=true;au.onAuthStateChanged(auth,u=>{user=u;badge();if(first){first=false;r()}})});return fb})();
  ready.catch(e=>{ready=null;lastErr=msg(e)});return ready}
 const col=()=>fb.fs.collection(fb.db,'users',user.uid,'apps',APP,'books');
 const meta=id=>fb.fs.doc(fb.db,'users',user.uid,'apps',APP,'books',id);
 const chk=(id,k)=>fb.fs.doc(fb.db,'users',user.uid,'apps',APP,'books',id,'chunks',k);
 async function list(){await init();if(!user)return[];const q=await fb.fs.getDocs(col());return q.docs.map(d=>Object.assign({id:d.id},d.data())).sort((a,b)=>(b.t||0)-(a.t||0))}
 /* Envoi d'un livre (S, A) : seuls les morceaux qui ont changé sont réécrits */
 async function push(id,st,as,info){await init();if(!user)throw new Error('Non connecté');
  const sj=JSON.stringify(st),aj=JSON.stringify(as||{}),sh=hash(sj),ah=hash(aj),ref=meta(id),old=(await fb.fs.getDoc(ref)).data()||{};
  if(old.sh===sh&&old.ah===ah)return false;
  const ops=[];const put=(pre,s,n0)=>{const P=parts(s);P.forEach((p,i)=>ops.push([chk(id,pre+i),{d:p}]));for(let i=P.length;i<(n0||0);i++)ops.push([chk(id,pre+i),null]);return P.length};
  let sN=old.sN||0,aN=old.aN||0;if(old.sh!==sh)sN=put('s',sj,old.sN);if(old.ah!==ah)aN=put('a',aj,old.aN);
  for(let i=0;i<ops.length;i+=8){const b=fb.fs.writeBatch(fb.db);ops.slice(i,i+8).forEach(([r,v])=>v?b.set(r,v):b.delete(r));await b.commit()}
  await fb.fs.setDoc(ref,Object.assign({title:'Sans titre',kind:'sms',w:0},info||{},{t:Date.now(),sh,ah,sN,aN,size:sj.length+aj.length,dev:navigator.userAgent.slice(0,80)}));return true}
 async function pull(id){await init();const m=(await fb.fs.getDoc(meta(id))).data();if(!m)throw new Error('Livre introuvable dans le cloud');
  const get=async(pre,n)=>{let s='';for(let i=0;i<n;i++){const d=(await fb.fs.getDoc(chk(id,pre+i))).data();s+=d?d.d:''}return s};
  const sj=await get('s',m.sN),aj=await get('a',m.aN);return{m,st:JSON.parse(sj),as:aj?JSON.parse(aj):{}}}
 async function remove(id){await init();const m=(await fb.fs.getDoc(meta(id))).data()||{};const b=fb.fs.writeBatch(fb.db);
  for(let i=0;i<(m.sN||0);i++)b.delete(chk(id,'s'+i));for(let i=0;i<(m.aN||0);i++)b.delete(chk(id,'a'+i));b.delete(meta(id));await b.commit()}
 /* Livre ouvert → cloud */
 async function saveCur(quiet){if(busy||!BID)return;busy=true;badge('…');
  try{await flush();const e=LIB.find(x=>x.id===BID)||{};const ch=await push(BID,S,A,{title:S.meta.title||'Sans titre',kind:S.kind,w:words()});lastErr='';
   setPref('t_'+BID,Date.now());if(!quiet)toast(ch?'☁️ « '+(S.meta.title||'Sans titre')+' » sauvegardé dans le cloud':'☁️ Déjà à jour dans le cloud')}
  catch(e){lastErr=msg(e);if(!quiet)toast('☁️ '+lastErr)}finally{busy=false;badge()}}
 function dirty(){if(!user||!auto())return;clearTimeout(timer);const last=prefs()['t_'+BID]||0,wait=Math.max(20000,AUTO_MS-(Date.now()-last));timer=setTimeout(()=>saveCur(true),wait)}
 async function restore(id){badge('…');try{const{m,st,as}=await pull(id);await flush();
   await DB.set('b_'+id,st);await DB.set('a_'+id,as);const e=LIB.find(x=>x.id===id),inf={id,title:m.title||st.meta&&st.meta.title||'Sans titre',kind:m.kind||st.kind||'sms',t:Date.now(),w:m.w||0};
   if(e)Object.assign(e,inf);else LIB.unshift(inf);await DB.set('lib',LIB);setPref('t_'+id,Date.now());await switchBook(id);toast('☁️ « '+inf.title+' » récupéré depuis le cloud')}
  catch(e){toast('☁️ '+msg(e))}finally{badge()}}
 function badge(t){const b=document.getElementById('bCloud');if(!b)return;b.textContent=t||(user?(lastErr?'⚠️':'☁️'):'☁');b.title=user?('Cloud : '+user.email+(lastErr?' — '+lastErr:'')):'Sauvegarde dans le cloud (se connecter)';b.classList.toggle('on',!!user)}
 /* Fenêtre */
 async function dlg(){const box=h('div',{class:'cloud',style:'display:grid;gap:12px'}),st=h('p',{class:'small'},'Connexion à Firebase…');box.append(st);
  const pm=modal('☁️ Sauvegarde dans le cloud',box,{ok:false,wide:true});const close=()=>document.getElementById('mdNo').click(),tick=()=>new Promise(r=>setTimeout(r,80));
  try{await init()}catch(e){st.textContent='Impossible de charger Firebase : '+msg(e)+' (connexion internet ?)';return pm}
  const render=async()=>{box.replaceChildren();
   if(!user){const em=h('input',{type:'email',placeholder:'adresse@e-mail.fr',autocomplete:'username'}),pw=h('input',{type:'password',placeholder:'Mot de passe',autocomplete:'current-password'}),er=h('p',{class:'small',style:'color:#e5484d;min-height:1em;margin:0'});
    const go=async f=>{er.textContent='';try{await f()}catch(e){er.textContent=msg(e);return}await render()};
    box.append(h('p',{class:'small',style:'margin:0'},'Un seul compte pour toutes mes apps (Scriptorium, Mijote…). Vos livres restent aussi dans ce navigateur ; le cloud permet de les retrouver sur un autre appareil et de ne rien perdre.'),
     h('label',{},['E-mail',em]),h('label',{},['Mot de passe',pw]),er,
     h('div',{class:'tools'},[h('button',{class:'pri',onclick:()=>go(()=>fb.au.signInWithEmailAndPassword(fb.auth,em.value.trim(),pw.value))},'Se connecter'),
      h('button',{onclick:()=>go(()=>fb.au.createUserWithEmailAndPassword(fb.auth,em.value.trim(),pw.value))},'Créer un compte'),
      h('button',{onclick:async()=>{er.textContent='';if(!em.value.trim()){er.textContent='Saisissez d’abord votre e-mail.';return}try{await fb.au.sendPasswordResetEmail(fb.auth,em.value.trim());er.style.color='';er.textContent='E-mail de réinitialisation envoyé.'}catch(e){er.textContent=msg(e)}}},'Mot de passe oublié')]));return}
   const au=h('input',{type:'checkbox'});au.checked=auto();au.onchange=()=>{setPref('auto',au.checked);if(au.checked)dirty()};
   const lst=h('div',{class:'lib'},h('p',{class:'small'},'Chargement de vos livres…'));
   box.append(h('div',{style:'display:flex;gap:10px;align-items:center;flex-wrap:wrap'},[h('b',{},'Connecté : '+user.email),h('span',{style:'flex:1'}),h('button',{onclick:async()=>{await fb.au.signOut(fb.auth);await render()}},'Se déconnecter')]),
    h('label',{class:'ck'},[au,'Sauvegarde automatique du livre ouvert (au plus toutes les 3 minutes, seulement ce qui a changé)']),
    h('div',{class:'tools'},[h('button',{class:'pri',onclick:async()=>{await saveCur();await fill()}},'☁️ Sauvegarder « '+(S.meta.title||'Sans titre')+' » maintenant'),
     h('button',{onclick:async()=>{const cur=BID;for(const b of LIB){if(b.id===cur){await saveCur(true);continue}const st=await DB.get('b_'+b.id),as=await DB.get('a_'+b.id);if(st)try{await push(b.id,st,as,{title:b.title,kind:b.kind,w:b.w})}catch(e){toast('☁️ '+msg(e));break}}toast('☁️ Bibliothèque sauvegardée');await fill()}},'Sauvegarder toute la bibliothèque')]),
    h('h4',{style:'margin:6px 0 0'},'Mes livres dans le cloud'),lst);
   if(lastErr)box.append(h('p',{class:'small',style:'color:#e5484d'},'Dernière erreur : '+lastErr));
   const fill=async()=>{let L;try{L=await list()}catch(e){lst.replaceChildren(h('p',{class:'small',style:'color:#e5484d'},msg(e)));return}
    if(!L.length){lst.replaceChildren(h('p',{class:'small'},'Aucun livre dans le cloud pour l’instant.'));return}
    lst.replaceChildren(...L.map(b=>{const k=(typeof KINDS!=='undefined'&&KINDS[b.kind])||{i:'📘',n:''},loc=LIB.find(x=>x.id===b.id),newer=loc&&b.t>(loc.t||0)+5000;
     return h('div',{class:'lb'+(b.id===BID?' cur':'')},[h('span',{class:'lbi'},k.i),h('div',{class:'lbt'},[h('b',{},b.title||'Sans titre'),h('small',{},(k.n?k.n+' · ':'')+(b.w||0)+' mots · '+new Date(b.t).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'})+' · '+Math.max(1,Math.round((b.size||0)/1024))+' Ko'+(loc?(newer?' · plus récent que ce navigateur':' · aussi dans ce navigateur'):' · absent de ce navigateur'))]),
      h('button',{class:'acc',onclick:async()=>{if(loc&&!await sure('Remplacer la version de « '+(b.title||'Sans titre')+' » de ce navigateur par celle du cloud ?','Remplacer'))return;close();await tick();await restore(b.id)}},loc?'Récupérer':'Télécharger'),
      h('button',{title:'Supprimer du cloud (le livre reste dans ce navigateur)',onclick:async()=>{if(!await sure('Supprimer « '+(b.title||'Sans titre')+' » du cloud ? (il reste dans ce navigateur s’il y est)'))return;try{await remove(b.id)}catch(e){toast('☁️ '+msg(e))}await fill()}},'🗑')])}))};
   fill()};
  await render();return pm}
 /* Au démarrage : reconnexion silencieuse si l'utilisateur s'était déjà connecté */
 if(prefs().used)init().catch(()=>{});
 return{init,dlg:()=>{setPref('used',true);return dlg()},saveCur,dirty,list,push,pull,remove,restore,get user(){return user}}})();
