var KR={};
'use strict';
/* ═════ Utilitaires ═════ */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-3);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function h(t,a,k){const e=document.createElement(t);a=a||{};
 for(const x in a){const v=a[x];if(v==null||v===false)continue;
  if(x==='class')e.className=v;else if(x==='style')e.style.cssText=v;else if(x.startsWith('on'))e[x]=v;
  else if(x==='value'||x==='checked'||x==='disabled'||x==='draggable'||x==='multiple')e[x]=v;
  else e.setAttribute(x,v===true?'':v)}
 (k==null?[]:Array.isArray(k)?k:[k]).forEach(n=>{if(n!=null&&n!==false)e.append(n)});return e}
function rgb(x){x=String(x||'#888888').replace('#','');if(x.length===3)x=[...x].map(c=>c+c).join('');const n=parseInt(x,16)||0;return[(n>>16)&255,(n>>8)&255,n&255]}
const ink=x=>{const[r,g,b]=rgb(x);return(r*299+g*587+b*114)/1000>150?'#14161c':'#ffffff'};
const mix=(a,b,t)=>{const x=rgb(a),y=rgb(b);return'#'+x.map((v,i)=>Math.round(v*t+y[i]*(1-t)).toString(16).padStart(2,'0')).join('')};
const wc=t=>{t=(t||'').trim();return t?t.split(/\s+/).length:0};
const bw=m=>wc(m.text)+wc(m.a)+wc(m.b)+wc(m.c);
const mt=m=>[m.text,m.a,m.b,m.cap].filter(Boolean).join(' ').toLowerCase();
const pad=n=>String(n).padStart(2,'0');
const timeNow=()=>{const d=new Date();return pad(d.getHours())+':'+pad(d.getMinutes())};
const dayKey=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};

/* ═════ Constantes ═════ */
const PAL=['#2f6bff','#8a93a6','#e5484d','#2fa36b','#f08c1a','#8e4ec6','#0fa3b1','#d6409f'];
const PALS={'Classique':PAL,'Pastel':['#7aa7ff','#b4bccb','#ff8f94','#6fd1a0','#ffbf69','#c39bf0','#6ed3de','#f79ac8'],'Néon':['#00b8d4','#76c200','#e0209f','#d4b800','#ff6a00','#7c4dff','#00c27a','#ff3d71'],'Sépia':['#8b5e3c','#a98467','#6f4e37','#b8905a','#7a5230','#9c7a5b','#5c4033','#b08968'],'Noir & blanc':['#111111','#6b6b6b','#333333','#8f8f8f','#1f1f1f','#4d4d4d','#262626','#a0a0a0']};
const ACC=['#6d4aff','#2f6bff','#0fa3b1','#2fa36b','#f08c1a','#e5484d','#d6409f','#111111'];
const RX=['','❤️','👍','😂','😮','😢','😡','🔥','🙏','👎'];
const STAT={draft:'Brouillon',review:'À relire',final:'Terminé'},STORD=['draft','review','final'];
const SPECIAL=['time','narr','sys','sep','note','conv','rcpt'];
/* Conversations dans un chapitre : marqueurs {who:'conv',thread,name,parts,sub,ctx} */
function convSegs(c){const out=[];let cur={mk:null,msgs:[]};
 (c.msgs||[]).forEach(m=>{if(m.who==='conv'){if(cur.mk||cur.msgs.length)out.push(cur);cur={mk:m,msgs:[]}}else cur.msgs.push(m)});
 if(cur.mk||cur.msgs.length||!out.length)out.push(cur);return out}
function convMarkers(){const r=[];S.chapters.forEach(c=>(c.msgs||[]).forEach(m=>{if(m.who==='conv')r.push({m,c})}));return r}
function convIsResume(mk){const all=convMarkers();const i=all.findIndex(x=>x.m===mk);return i>0&&all.slice(0,i).some(x=>x.m.thread===mk.thread)}
function convHist(mk){const acc=[];for(const c of S.chapters)for(const sg of convSegs(c)){if(sg.mk===mk)return acc;if(sg.mk&&sg.mk.thread===mk.thread)acc.push(...sg.msgs.filter(x=>x.who!=='note'&&x.who!=='conv'))}return acc}
function convHeadChap(c,sg){const k=sg.mk;return{conv:k.name||'',parts:k.parts||'',sub:k.sub||'',msgs:sg.msgs,alias:k.alias||null}}
/* Noms affichés par conversation (ex. Mathis affiché « Numéro Inconnu » sur le téléphone de Chloé) */
let ALIASC=null;
function aliasOf(m){if(!ALIASC){ALIASC=new Map();S.chapters.forEach(c=>convSegs(c).forEach(sg=>{const a=sg.mk&&sg.mk.alias;if(a&&Object.keys(a).length)sg.msgs.forEach(x=>ALIASC.set(x.id,a))}))}return ALIASC.get(m.id)||null}
const dispName=(c,m)=>{const a=m&&aliasOf(m);return(a&&c&&a[c.id])||(c&&c.name)||''};
function aliasTxt(mk){const a=mk&&mk.alias||{};return Object.entries(a).map(([id,v])=>{const c=ch(id);return c?c.name+' = '+v:''}).filter(Boolean).join(', ')}
function aliasParse(t){const o={};(t||'').split(',').forEach(x=>{const m=x.match(/^\s*(.+?)\s*=\s*(.+?)\s*$/);if(m){const c=S.chars.find(y=>y.name.toLowerCase()===m[1].toLowerCase());if(c)o[c.id]=m[2]}});return o}
function recapInto(P,H,cx){P.append(h('div',{class:'rcl'},'↺ Suite de la conversation'));H.forEach((m,i)=>{const n=node(m,i,H,cx);n.classList.add('rcp');P.append(n)});P.append(h('div',{class:'rcs'}))}
const LIGHT={ink:'#171a22',mute:'#667086',bg:'#ffffff',line:'#dde1ea',panel:'#ffffff'};
const DARK={ink:'#e9ebf2',mute:'#9099ae',bg:'#0f1218',line:'#262b38',panel:'#151821'};
const FONTS={sys:'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',serif:'Georgia,"Times New Roman",serif',mono:'"SFMono-Regular",Consolas,"Courier New",monospace',round:'"Trebuchet MS","Segoe UI",sans-serif',hand:'"Segoe Print","Bradley Hand","Comic Sans MS",cursive'};
const PAGES={'11x17':{w:110,h:170},A6:{w:105,h:148},B6:{w:125,h:176},A5:{w:148,h:210},A4:{w:210,h:297},letter:{w:216,h:279},'6x9':{w:152,h:229},'5x8':{w:127,h:203}};

/* ═════ Données ═════ */
let A={},dirtyA=false;
const addAsset=u=>{const id='a'+uid();A[id]=u;dirtyA=true;return id};
const DEF=(kind,starter_)=>({v:4,kind:kind||'sms',meta:{title:'Mon livre',sub:'',author:'',dedic:'',epi:'',copy:'',blurb:'',thanks:'',about:'',year:new Date().getFullYear(),lang:'fr',cover:{style:KR[kind]?KR[kind].cover[0]:kind==='journal'?'cuir':kind==='spell'?'grimoire':kind==='ana'?'ana':'bulles',c1:KR[kind]?KR[kind].cover[1]:kind==='journal'?'#7a4b2a':kind==='spell'?'#2a1747':'#6d4aff',c2:KR[kind]?KR[kind].cover[2]:kind==='journal'?'#c9a24a':kind==='spell'?'#0d0a1f':'#12151c',img:''}},
 set:{style:'ios',theme:'auto',accent:'#6d4aff',fs:16,font:'sys',radius:20,width:82,gap:3,names:true,times:false,read:false,readText:'Lu',avatars:false,tails:true,header:true,status:false,wall:'none',wallc:'#f2f0ea',wallImg:'',enter:true,
  page:'A5',margin:14,pnum:true,toc:true,cover:true,front:true,back:true,runhead:false,partpg:true,jfont:'caveat',jsize:24,jpaper:'ruled',jink:'#26263a',jline:true,jtape:true,spec:true,specPre:'arc',sh0:0,sh1:300,ss0:0,ss1:85,sl:30,specInk:true,specPaper:true,specTape:true,specStrip:true,evoDev:true,dev0:25,dev1:100,evoAge:true,age0:0,age1:55,janim:true,stheme:'parchemin',sfont:'fell',sfs:19,sdrop:true,smotion:true,sparts:true,sreveal:true,anaInk:'process',ghost:100,depth:4,afont:'serif',afs:17,anaNotice:true,anaCalib:true,sauto:true,anaMix:'normal',gmode:'kdp',paper:'white',cvPdf:true,recto:false,pnpos:'center',mirror:'off',bpm:90,palFade:55,dosReveal:true},
 cur:'c1',notes:'',goal:{target:300,day:'',base:0,last:0,log:{}},exp:0,
 chars:[{id:'a',name:'Léa',color:PAL[0],side:'right',emoji:'',av:'',note:''},{id:'b',name:'Tom',color:PAL[1],side:'left',emoji:'',av:'',note:''}],
 chapters:[{id:'c1',title:kind==='journal'?'Lundi 3 juin':'Chapitre 1',part:'',conv:'',sub:'',status:'draft',note:'',mood:'',msgs:starter_&&kind&&kind!=='sms'?starter(kind):[]}]});
function norm(d){d=d&&typeof d==='object'?d:{};d.kind=['sms','journal','spell','ana'].concat(Object.keys(KR)).includes(d.kind)?d.kind:'sms';const f=DEF(d.kind);
 if(d.title&&!d.meta)d.meta={title:d.title,sub:'',author:''};
 const mc=Object.assign({},f.meta.cover,d.meta&&d.meta.cover);
 d.meta=Object.assign(f.meta,d.meta);d.meta.cover=mc;
 d.set=Object.assign(f.set,d.set);d.goal=Object.assign(f.goal,d.goal);if(!d.goal.log)d.goal.log={};
 if(!['ios','wa','msn','disc','min','retro'].includes(d.set.style))d.set.style='ios';
 d.notes=typeof d.notes==='string'?d.notes:'';d.exp=d.exp||0;
 if(!Array.isArray(d.chars)||!d.chars.length)d.chars=f.chars;
 d.chars.forEach(c=>{c.id=c.id||uid();c.name=c.name||'?';c.emoji=c.emoji||'';c.av=c.av||'';c.note=c.note||'';c.side=c.side==='left'?'left':'right';c.color=/^#[0-9a-f]{6}$/i.test(c.color)?c.color:'#888888'});
 if(!Array.isArray(d.chapters)||!d.chapters.length)d.chapters=f.chapters;
 d.chapters.forEach(c=>{c.id=c.id||uid();c.title=c.title||'';c.part=c.part||'';c.conv=c.conv||'';c.parts=c.parts||'';c.sub=c.sub||'';c.status=STAT[c.status]?c.status:'draft';c.note=c.note||'';c.mood=c.mood||'';c.msgs=Array.isArray(c.msgs)?c.msgs:[];
  c.msgs.forEach(m=>{m.id=m.id||uid();if(m.img&&/^data:/.test(m.img))m.img=addAsset(m.img);if(m.img2&&/^data:/.test(m.img2))m.img2=addAsset(m.img2)})});
 if(!d.chapters.some(c=>c.id===d.cur))d.cur=d.chapters[0].id;d.v=4;return d}
let S=norm({}),who='a',Q='',HITS=[],hi=-1,hist=[],redo=[],view='write',fm=false,SEL=new Set(),lastSel=null,INS=null,REPLY=null,DRAG=null,DRAGC=null;
const ch=id=>S.chars.find(c=>c.id===id),chap=()=>S.chapters.find(c=>c.id===S.cur);
const isChar=m=>!SPECIAL.includes(m.who)&&!!ch(m.who);
function findMsg(id){for(const c of S.chapters){const m=c.msgs.find(x=>x.id===id);if(m)return m}return null}
function previewText(m){const t=m.type||'text',d=m.d||{};if(t==='photo')return'📷 '+(m.cap||'Polaroïd');if(t==='sticky')return'📝 '+(m.text||'');if(t==='break')return'↵ saut de page';if(t==='dual')return'◐ '+((m.a||m.b||'').slice(0,60));if(t==='dimg')return'◐ Image double'+(m.cap?' : '+m.cap:'');if(t==='both'||t==='title')return(m.text||'').slice(0,70);if(t==='sep')return'✦ ✦ ✦';return t==='draft'?'✎ Brouillon : '+(m.text||'').slice(0,60):t==='img'?(d.kind==='capture'?'📱 ':'📷 ')+(d.alt||'Photo'):t==='voice'?'🎤 Message vocal':t==='call'?'📞 Appel':t==='loc'?'📍 '+(d.name||'Position'):t==='link'?'🔗 '+(d.title||'Lien'):t==='file'?'📎 '+(d.name||'Fichier'):t==='typing'?'…':(m.text||'').replace(/\s+/g,' ').slice(0,70)}
function usedAssets(){const u=new Set();S.chapters.forEach(c=>c.msgs.forEach(m=>{if(m.img)u.add(m.img);if(m.img2)u.add(m.img2)}));S.chars.forEach(c=>{if(c.av)u.add(c.av)});[S.meta.cover.img,S.set.wallImg].forEach(x=>x&&u.add(x));const o={};u.forEach(id=>{if(A[id])o[id]=A[id]});return o}
function words(){let w=0;S.chapters.forEach(c=>c.msgs.forEach(m=>{if(m.who!=='note')w+=bw(m)}));return w}

/* ═════ Stockage (IndexedDB → localStorage → mémoire) ═════ */
const lsGet=k=>{try{const v=localStorage.getItem('sbs_'+k);return v?JSON.parse(v):undefined}catch(e){}};
const lsSet=(k,v)=>{try{localStorage.setItem('sbs_'+k,JSON.stringify(v));return true}catch(e){return false}};
const DB={d:null,ok:true,
 open(){return new Promise(r=>{if(this.d||!this.ok)return r(this.d);try{const q=indexedDB.open('smsbookstudio',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onsuccess=()=>{this.d=q.result;r(this.d)};q.onerror=q.onblocked=()=>{this.ok=false;r(null)}}catch(e){this.ok=false;r(null)}})},
 async get(k){const d=await this.open();if(!d)return lsGet(k);return new Promise(r=>{try{const q=d.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>r(q.result);q.onerror=()=>r(undefined)}catch(e){r(undefined)}})},
 async set(k,v){const d=await this.open();if(!d)return lsSet(k,v);return new Promise(r=>{try{const t=d.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=()=>r(true);t.onerror=t.onabort=()=>r(false)}catch(e){r(false)}})}};
let saveT=0,BID='',LIB=[];
function save(){clearTimeout(saveT);const s=$('#svs');if(s)s.textContent='…';saveT=setTimeout(flush,400)}
async function flush(){clearTimeout(saveT);if(!BID)return;let ok=await DB.set('b_'+BID,S);if(dirtyA){ok=(await DB.set('a_'+BID,A))&&ok;dirtyA=false}
 const e=LIB.find(x=>x.id===BID);if(e){e.title=S.meta.title||'Sans titre';e.kind=S.kind;e.t=Date.now();e.w=words();await DB.set('lib',LIB)}
 const s=$('#svs');if(s){s.textContent=ok?'Enregistré '+timeNow():'⚠ non enregistré';s.title=ok?'Sauvegarde automatique dans ce navigateur':'Stockage indisponible : exportez le livre (.json) !'}}
let snapsC=null;
async function snaps(){if(!snapsC)snapsC=(await DB.get('s_'+BID))||[];return snapsC}
async function snap(label,auto){const L=await snaps(),js=JSON.stringify(S);if(auto&&L.length&&L[0].js===js)return;L.unshift({t:Date.now(),label,js,w:words()});while(L.length>30)L.pop();await DB.set('s_'+BID,L)}

/* ═════ Historique d'annulation ═════ */
function mut(fn,render){ALIASC=null;hist.push(JSON.stringify(S));if(hist.length>120)hist.shift();redo=[];fn();save();hs();if(render!==false)all()}
function hs(){const u=$('#bUn'),r=$('#bRe');if(u)u.disabled=!hist.length;if(r)r.disabled=!redo.length}
function undo(){if(!hist.length)return;redo.push(JSON.stringify(S));S=JSON.parse(hist.pop());back()}
function redoF(){if(!redo.length)return;hist.push(JSON.stringify(S));S=JSON.parse(redo.pop());back()}
function back(){ALIASC=null;if(!ch(who)&&!SPECIAL.includes(who))who=S.chars[0].id;SEL.clear();INS=null;REPLY=null;save();all()}

/* ═════ Rendu : CSS du livre (valeurs littérales, sans variables : compatible EPUB) ═════ */
function bookCSS(s,th,P,noImg){
 const st=s.style,disc=st==='disc',G=s.gap,W=s.width;
 const R=st==='wa'?Math.min(s.radius,10):st==='retro'?3:s.radius;
 let fam=FONTS[s.font]||FONTS.sys;if(s.font==='sys'){if(st==='min')fam=FONTS.serif;if(st==='retro')fam=FONTS.mono}
 const wallC=['color','dots','grid','diag'].includes(s.wall),wc_=s.wallc;
 let wp='';
 if(s.wall==='color')wp='background-color:'+wc_+';';
 else if(s.wall==='dots')wp='background-color:'+wc_+';background-image:radial-gradient(rgba(0,0,0,.09) 1.2px,transparent 1.4px);background-size:16px 16px;';
 else if(s.wall==='grid')wp='background-color:'+wc_+';background-image:linear-gradient(rgba(0,0,0,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.06) 1px,transparent 1px);background-size:22px 22px;';
 else if(s.wall==='diag')wp='background-color:'+wc_+';background-image:repeating-linear-gradient(45deg,rgba(0,0,0,.045) 0 2px,transparent 2px 14px);';
 else if(s.wall==='image'&&!noImg&&s.wallImg&&A[s.wallImg])wp='background:url("'+A[s.wallImg]+'") center/cover;';
 const ink0=wallC?ink(wc_):th.ink,mu=wallC?(ink(wc_)==='#ffffff'?'#c4c9d8':'#5f677b'):th.mute;
 const L=[],a=(sel,body)=>L.push(sel.split(',').map(x=>(P+' '+x.trim()).trim()).join(',')+'{'+body+'}');
 a('','font-family:'+fam+';font-size:'+s.fs+'px;line-height:1.38;color:'+th.ink+';background:'+th.bg);
 a('.pg','display:flex;flex-direction:column;padding:8px 14px 28px;min-height:280px;color:'+ink0+';'+wp);
 a('.it','display:flex;align-items:flex-end;gap:6px;margin-top:'+G+'px;max-width:'+W+'%;position:relative');
 a('.it.first','margin-top:'+(G*3+5)+'px');
 a('.it.r','align-self:flex-end');a('.it.l','align-self:flex-start');
 a('.it.c','align-self:center;align-items:center;justify-content:center;max-width:94%;margin-top:16px');
 a('.col','display:flex;flex-direction:column;min-width:0');
 a('.r>.col','align-items:flex-end');a('.l>.col','align-items:flex-start');
 a('.col.re','margin-bottom:13px');
 a('.who','font-size:.74em;color:'+mu+';margin:0 12px 2px');
 a('.bw','position:relative;max-width:100%;z-index:1');
 a('.b','padding:8px 14px;border-radius:'+R+'px;white-space:pre-wrap;overflow-wrap:anywhere;min-width:28px;text-align:left;outline:none;box-sizing:border-box');
 a('.b.big','background:none!important;border:0!important;box-shadow:none!important;padding:0 4px;font-size:2.6em;line-height:1.15;color:inherit!important');
 if(st==='ios'||st==='min'){if(s.tails){a('.r.last .b','border-bottom-right-radius:5px');a('.l.last .b','border-bottom-left-radius:5px')}}
 if(st==='wa'){a('.r.first .b','border-top-right-radius:2px');a('.l.first .b','border-top-left-radius:2px')}
 if(st==='msn'){a('.r .b','border-top-right-radius:5px;border-bottom-right-radius:5px');a('.l .b','border-top-left-radius:5px;border-bottom-left-radius:5px');
  a('.r.first .b','border-top-right-radius:'+R+'px');a('.r.last .b','border-bottom-right-radius:'+R+'px');a('.l.first .b','border-top-left-radius:'+R+'px');a('.l.last .b','border-bottom-left-radius:'+R+'px')}
 if(st==='retro')a('.b','box-shadow:2px 2px 0 #14240d');
 if(disc){a('.it','max-width:100%;width:100%;align-items:flex-start;gap:10px');a('.it.r','flex-direction:row-reverse;justify-content:flex-end;align-self:flex-start');a('.it.c','width:auto');a('.r>.col,.l>.col','align-items:flex-start');
  a('.b','padding:1px 0;border-radius:0;background:none');a('.who','margin:0 0 1px;font-weight:700;font-size:.9em');a('.it.first','margin-top:'+(G*3+9)+'px');a('.avt,.avs','width:36px;height:36px');a('.rx','position:static;display:inline-block;margin-top:3px')}
 a('.avt','width:28px;height:28px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;font:600 12px/1 system-ui,sans-serif;overflow:hidden;font-style:normal');
 a('.avt img','width:100%;height:100%;object-fit:cover;display:block');
 a('.avs','width:28px;flex:none');
 a('.rx','position:absolute;bottom:-13px;font-size:13px;background:'+th.panel+';border:1px solid '+th.line+';border-radius:999px;padding:0 6px;line-height:20px;color:'+th.ink);
 a('.r .rx','right:8px');a('.l .rx','left:8px');
 a('.rp','font-size:.8em;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-left:3px solid #888;padding:3px 9px 9px;margin:0 0 -6px;border-radius:9px 9px 9px 2px;background:rgba(127,127,127,.16);color:'+mu+';box-sizing:border-box');
 a('.tmx','font-size:.72em;color:'+mu+';margin:2px 10px 0');
 a('.rd','align-self:flex-end;font-size:.72em;color:'+mu+';margin:3px 6px 0');
 a('.vc','display:flex;align-items:center;gap:9px;min-width:170px');a('.vc .wv','display:flex;align-items:center;gap:2px;height:22px;flex:1');
 a('.vc .wv i','display:block;width:3px;border-radius:2px;background:currentColor;opacity:.75');a('.vc .du','font-size:.8em;opacity:.85');
 a('.cl,.lk,.fl','display:flex;align-items:center;gap:9px;min-width:150px');a('.cl small,.lk small,.fl small','display:block;opacity:.8;font-size:.82em');a('.cl .ic,.lk .ic,.fl .ic','font-size:1.5em');
 a('.lc','width:200px;max-width:100%');
 a('.lc .mp','height:84px;border-radius:'+Math.max(R-6,4)+'px;background-color:#cfe5d0;background-image:linear-gradient(115deg,transparent 40%,#ffffff 41%,#ffffff 45%,transparent 46%),linear-gradient(20deg,transparent 55%,#ffe39a 56%,#ffe39a 60%,transparent 61%);display:flex;align-items:center;justify-content:center;font-size:1.8em');
 a('.lc b','display:block;margin-top:5px');
 a('.b.img','padding:3px;max-width:100%');a('.b.img:has(.imph)','background:transparent!important;padding:0');a('.b.img img','display:block;max-width:100%;max-height:340px;border-radius:'+Math.max(R-3,3)+'px');a('.b.img .cap','padding:5px 10px 3px');
 a('.dots','display:flex;gap:4px;padding:13px 16px');a('.dots i','width:7px;height:7px;border-radius:50%;background:currentColor;opacity:.6;display:block');
 a('.stamp,.narr,.sys,.sep','outline:none;text-align:center;white-space:pre-wrap');
 a('.stamp','font-size:.78em;font-weight:600;color:'+mu+(st==='wa'?';background:rgba(120,120,120,.18);padding:3px 12px;border-radius:8px':''));
 a('.narr','font-family:Georgia,"Times New Roman",serif;font-style:italic;font-size:'+(s.fs+1)+'px;line-height:1.55;opacity:.9;padding:0 8px;color:'+ink0);
 a('.sys','font-size:.78em;color:'+mu+';background:rgba(127,127,127,.14);padding:3px 12px;border-radius:999px');
 a('.sep','letter-spacing:.5em;color:'+mu+';font-size:1.1em;margin:10px 0 0');
 a('.sb','display:flex;justify-content:space-between;padding:8px 20px 0;font:600 12px system-ui,sans-serif;color:'+th.ink);
 a('.hd','display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 12px 9px;border-bottom:1px solid '+th.line+';background:'+th.panel+';color:'+th.mute+';font-size:12px');
 a('.hd .avs2','display:flex');
 a('.hd .avs2 i','width:34px;height:34px;border-radius:50%;font:600 14px/34px system-ui,sans-serif;text-align:center;font-style:normal;border:2px solid '+th.panel+';margin:0 4px;overflow:hidden;display:block');
 a('.hd .avs2 img','width:100%;height:100%;object-fit:cover;display:block');
 a('.hd b','color:'+th.ink+';font-size:14px');
 a('.it.rk','margin-top:2px');a('.rcv','font-size:.72em;color:'+mu+';margin:0 6px;outline:none;text-align:right');
 a('.b.draft','background:transparent!important;border:1.5px dashed '+mu+'!important;color:'+mu+'!important;box-shadow:none!important');a('.b.draft .dl','display:block;font-size:.72em;font-style:italic;margin-bottom:2px;opacity:.9');a('.b.draft s','text-decoration-thickness:1px;opacity:.85');
 a('.imph','width:220px;max-width:100%;aspect-ratio:4/3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;padding:10px 12px;box-sizing:border-box;border-radius:'+Math.max(R-3,3)+'px;background:#f4f4f6;border:1px solid rgba(0,0,0,.08);color:#3a3f4c;font-size:.82em;line-height:1.3;white-space:normal');a('.imph.cap9','width:170px;aspect-ratio:3/4');a('.imph .imi','font-size:2em;line-height:1');a('.imph .imt','font-style:italic');
 a('.rcp','opacity:.5');a('.rcl','align-self:center;font-size:.72em;color:'+mu+';letter-spacing:.06em;margin-top:6px');a('.rcs','align-self:stretch;border-top:1px dashed '+th.line+';margin-top:14px');
 return L.join('\n')}

const LAYOUT=`
.pp{font-family:Georgia,"Times New Roman",serif;background:transparent!important}
.pp .sheet{box-sizing:border-box;background:#fff;color:#171a22;max-width:560px;margin:16px auto;padding:7% 8%;box-shadow:0 8px 30px -12px rgba(0,0,0,.35);border-radius:3px;overflow:hidden}
.pp h2{font:700 1.6em/1.2 Georgia,serif;text-align:center;margin:0 0 .8em;break-after:avoid}
.pp .pre{white-space:pre-wrap}
.pp .cv{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:14px;padding:8%;min-height:340px}
.pp .cv h1{font:700 2.4em/1.1 Georgia,serif;margin:0}.pp .cv p{margin:0}
.pp .cv .cs{font-size:1.15em;opacity:.85;font-style:italic}
.pp .cv .ca{font-size:1.05em;letter-spacing:.14em;text-transform:uppercase;margin-top:18px}
.pp .cv-image{padding:0}.pp .cv-image img{width:100%;height:100%;object-fit:cover;display:block}
.pp .cv-split{padding:0;gap:0}.pp .cv-split>div{flex:1;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:8%;box-sizing:border-box}
.pp .cvbs{display:flex;flex-direction:column;gap:8px;width:72%;margin-bottom:10px}
.pp .cvbub{height:34px;border-radius:18px;display:flex;align-items:center;padding:0 16px;gap:4px}
.pp .cvbub i{width:7px;height:7px;border-radius:50%;background:#fff;opacity:.85;display:block}
.pp .tp{display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;min-height:300px}
.pp .tp h1{font:700 2.2em/1.15 Georgia,serif;margin:0 0 .3em}.pp .tp .ts{font-style:italic;font-size:1.15em;margin:0 0 2em}.pp .tp .ta{letter-spacing:.14em;text-transform:uppercase;margin:0}
.pp .cp{font-size:.8em;color:#444;display:flex;flex-direction:column;justify-content:flex-end;min-height:260px}.pp .cp p{margin:.3em 0}
.pp .dd,.pp .ep{display:flex;align-items:center;justify-content:center;text-align:center;font-style:italic;min-height:260px;font-size:1.1em}
.pp .ep p{max-width:80%}
.pp .toc ol{list-style:none;margin:0;padding:0}.pp .toc li{margin:.5em 0}.pp .toc li.tpt{font-weight:700;margin-top:1.1em;text-transform:uppercase;letter-spacing:.08em;font-size:.85em}
.pp .toc a{color:inherit;text-decoration:none}
.pp .part{display:flex;align-items:center;justify-content:center;min-height:300px}.pp .part h2{font-size:2.2em}
.pp .ptag{text-align:center;text-transform:uppercase;letter-spacing:.1em;font-size:.8em;color:#777;margin:0 0 .4em}
.pp .back p{line-height:1.6}
.pp .chp .hd,.pp .chp .sb{max-width:100%}
.pp .chp .pg{padding:8px 4px 20px;min-height:0}
@media print{
 @page{orphans:3}
 .pp .sheet{max-width:none;margin:0;padding:0;box-shadow:none;border-radius:0;break-after:page;page-break-after:always;overflow:visible}
 .pp .sheet:last-child{break-after:auto;page-break-after:auto}
 .pp .cv{aspect-ratio:auto!important;height:90vh;min-height:0;overflow:hidden}.pp .tp,.pp .dd,.pp .ep,.pp .part{min-height:80vh}.pp .cp{min-height:80vh}
 .pp .it,.pp .rp{break-inside:avoid}
}`;
const EPUBX=`.pp .sheet{max-width:none;margin:0;padding:1em;box-shadow:none;border-radius:0}.pp .cv{aspect-ratio:auto!important;min-height:90vh}.pp .tp,.pp .dd,.pp .ep,.pp .part,.pp .cp{min-height:60vh}`;

/* ═════ Rendu : messages ═════ */
function fmt(t){const out=[],re=/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|~~[^~\n]+~~|__[^_\n]+__)/g;let last=0,m;t=t||'';
 while((m=re.exec(t))){if(m.index>last)out.push(t.slice(last,m.index));const x=m[0];
  if(x.startsWith('**'))out.push(h('b',{},x.slice(2,-2)));else if(x[0]==='*')out.push(h('i',{},x.slice(1,-1)));else if(x[0]==='~')out.push(h('s',{},x.slice(2,-2)));else out.push(h('u',{},x.slice(2,-2)));last=m.index+x.length}
 if(last<t.length)out.push(t.slice(last));return out}
const isBig=t=>!!t&&t.length<=24&&/^[\p{Extended_Pictographic}‍️\u{1F3FB}-\u{1F3FF}\s]+$/u.test(t)&&Array.from(t.replace(/\s/g,'')).length<=8;
function wave(seed,n){let x=0;for(const c of String(seed))x=(x*31+c.charCodeAt(0))>>>0;const o=[];for(let i=0;i<(n||26);i++){x=(x*1664525+1013904223)>>>0;o.push(5+(x>>>24)%17)}return o}
function bst(c,th){const col=c.color,st=S.set.style;
 if(st==='min')return'background:'+mix(col,th.bg,.13)+';color:'+th.ink+';border:1.5px solid '+col;
 if(st==='disc')return'color:inherit';
 if(st==='retro')return c.side==='right'?'background:#8fc37a;color:#14240d;border:2px solid #14240d':'background:#c9e6b4;color:#14240d;border:2px solid #14240d';
 return'background:'+col+';color:'+ink(col)}
function avEl(c,src,nm){const e=h('i',{class:'avt'});e.style.background=c.color;e.style.color=ink(c.color);const u=c.av&&src(c.av);if(u)e.append(h('img',{src:u,alt:''}));else e.textContent=c.emoji||(nm||c.name||'?')[0].toUpperCase();return e}
function convParts(c){let r=[];
 if(c.parts){c.parts.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean).forEach(n=>{const x=S.chars.find(y=>(y.name||'').toLowerCase()===n);if(x&&!r.includes(x))r.push(x)})}
 if(!r.length)(c.msgs||[]).forEach(m=>{const x=SPECIAL.includes(m.who)?null:ch(m.who);if(x&&!r.includes(x))r.push(x)});
 if(!r.length)r=S.chars.slice(0,2);return r.slice(0,6)}
function headEls(c,cx){const o=[],s=S.set;
 if(s.status)o.push(h('div',{class:'sb'},[h('span',{},'9:41'),h('span',{},'▂▄▆ ▮')]));
 if(s.header){const P0=convParts(c),PL=P0.filter(x=>x.side!=='right'),P=PL.length?PL:P0,al=c.alias||{},nm=c.conv||P.map(x=>al[x.id]||x.name).join(', ');
  o.push(h('div',{class:'hd'},[h('div',{class:'avs2'},P.map(x=>{const i=h('i');i.style.background=x.color;i.style.color=ink(x.color);const u=x.av&&cx.src(x.av);if(u)i.append(h('img',{src:u,alt:''}));else i.textContent=x.emoji||(al[x.id]||x.name||'?')[0].toUpperCase();return i})),h('b',{},nm),c.sub?h('span',{},c.sub):null]))}
 return o}

function node(m,i,L,cx){
 if(m.who==='conv')return convBanner(m,cx);
 const c=ch(m.who),kind=c?'msg':(SPECIAL.includes(m.who)?m.who:'narr'),prev=L[i-1],next=L[i+1],s=S.set;
 const first=!prev||prev.who!==m.who,last=!next||next.who!==m.who;
 const el=h('div',{class:'it '+(m.who==='rcpt'?'r rk':c?(c.side==='right'?'r':'l'):'c')+(first?' first':'')+(last?' last':''),'data-mid':m.id});
 let t;
 if(kind==='msg'){
  t=h('div',{class:'b'});t.setAttribute('style',bst(c,cx.th));
  const ty=m.type||'text',d=m.d||{};
  if(ty==='typing'){t.classList.add('dots');t.append(h('i'),h('i'),h('i'))}
  else if(ty==='img'){t.classList.add('img');const u=cx.src(m.img);if(u)t.append(h('img',{src:u,alt:d.alt||m.text||'Image envoyée'}));else{const cap=d.kind==='capture';const ph=h('div',{class:'imph'+(cap?' cap9':'')},[h('span',{class:'imi'},cap?'📱':'📷'),h('span',{class:'imt'},d.alt||(cap?'Capture d’écran':'Photo'))]);if(cx.edit){ph.title='Cliquer pour choisir l’image';ph.style.cursor='pointer';ph.onclick=async e=>{e.stopPropagation();const id=await pickImg(1100);if(id)mut(()=>{m.img=id})}}t.append(ph)}if(m.text)t.append(h('div',{class:'cap'},fmt(m.text)))}
  else if(ty==='draft'){t.classList.add('draft');t.append(h('small',{class:'dl'},'✎ Brouillon — effacé sans être envoyé'),h('s',{},fmt(m.text||'')))}
  else if(ty==='voice')t.append(h('div',{class:'vc'},[h('span',{class:'pl'},'▶'),h('span',{class:'wv'},wave(m.id).map(x=>h('i',{style:'height:'+x+'px'}))),h('span',{class:'du'},d.dur||'0:10')]));
  else if(ty==='call'){const v=d.kind==='video',ms=!!d.miss;t.append(h('div',{class:'cl'},[h('span',{class:'ic'},ms?'📵':v?'📹':'📞'),h('div',{},[h('b',{},ms?(v?'Appel vidéo manqué':'Appel manqué'):(v?'Appel vidéo':'Appel vocal')),h('small',{},ms?'Appuyez pour rappeler':(d.dur||''))])]))}
  else if(ty==='loc')t.append(h('div',{class:'lc'},[h('div',{class:'mp'},'📍'),h('b',{},d.name||'Position partagée')]));
  else if(ty==='link')t.append(h('div',{class:'lk'},[h('span',{class:'ic'},'🔗'),h('div',{},[h('b',{},d.title||'Lien'),h('small',{},d.dom||'')])]));
  else if(ty==='file')t.append(h('div',{class:'fl'},[h('span',{class:'ic'},'📎'),h('div',{},[h('b',{},d.name||'document.pdf'),h('small',{},d.size||'')])]));
  else{if(isBig(m.text))t.classList.add('big');t.append(...fmt(m.text));if(cx.edit)editable(t,m,cx,fmt)}
 }else{
  t=h('div',{class:kind==='time'?'stamp':kind==='note'?'authnote':kind==='rcpt'?'rcv':kind});
  const rend=x=>kind==='sep'&&!x?['✦ ✦ ✦']:fmt(x);
  t.append(...rend(m.text));if(cx.edit)editable(t,m,cx,rend)}
 if(kind!=='msg'){el.append(t)}
 else{
  const col=h('div',{class:'col'+(m.react?' re':'')});
  if(s.names&&first&&c.side!=='right')col.append(h('div',{class:'who'},dispName(c,m)));
  if(m.reply){const o=findMsg(m.reply);if(o){const oc=ch(o.who),q=h('div',{class:'rp'},(oc?dispName(oc,o)+' · ':'')+previewText(o));if(oc)q.style.borderLeftColor=oc.color;col.append(q)}}
  const bw=h('div',{class:'bw'},t);if(m.react)bw.append(h('span',{class:'rx'},m.react));col.append(bw);
  if(s.times&&m.time)col.append(h('div',{class:'tmx'},m.time));
  let av=null;
  if(s.avatars||s.style==='disc'){const slot=s.style==='disc'?first:last;av=slot?avEl(c,cx.src,dispName(c,m)):h('span',{class:'avs'})}
  if(c.side==='right'){el.append(col);if(av)el.append(av)}else{if(av)el.append(av);el.append(col)}}
 if(cx.edit)decorate(el,m,cx,kind==='msg');
 return el}

function listInto(P,L,cx){
 L.forEach((m,i)=>{const n=node(m,i,L,cx);
  if(cx.edit){if(SEL.has(m.id))n.classList.add('sel');if(Q){n.classList.add(mt(m).includes(Q)?'hit':'dim')}}
  P.append(n)});
 const l=[...L].reverse().find(x=>x.who!=='note');
 if(S.set.read&&l&&ch(l.who)&&ch(l.who).side==='right')P.append(h('div',{class:'rd'},S.set.readText||'Lu'))}

/* ═════ Livre complet (aperçu, impression, exports) ═════ */
function coverEl(cx){const cv=S.meta.cover,m=S.meta,e=h('section',{class:'sheet cv cv-'+cv.style,'data-g':'cover'}),pg=PAGES[S.set.page]||PAGES.A5;
 if(cx.ratio)e.style.aspectRatio=pg.w+'/'+pg.h;
 const titles=(c)=>[h('h1',{},m.title||'Sans titre'),m.sub?h('p',{class:'cs'},m.sub):null,m.author?h('p',{class:'ca'},m.author):null];
 const u=cv.img&&cx.src(cv.img);
 if(cv.style==='image'&&u){e.append(h('img',{src:u,alt:'Couverture'}));return e}
 if(cv.style==='split'){const a=h('div',{style:'background:'+cv.c1+';color:'+ink(cv.c1)},[h('h1',{},m.title||'Sans titre'),m.sub?h('p',{class:'cs'},m.sub):null]);
  const b=h('div',{style:'background:'+cv.c2+';color:'+ink(cv.c2)},[m.author?h('p',{class:'ca'},m.author):null]);e.append(a,b);return e}
 e.style.background=cv.c1;e.style.color=ink(cv.c1);
 if(cv.style==='bulles'){const c0=S.chars[0]||{color:'#fff'},c1=S.chars[1]||c0;
  const mk=(col,al,w,dots)=>h('div',{class:'cvbub',style:'background:'+col+';align-self:'+al+';width:'+w+';'},dots?[h('i'),h('i'),h('i')]:null);
  e.append(h('div',{class:'cvbs'},[mk(c1.color,'flex-start','62%'),mk(c0.color,'flex-end','48%'),mk(c1.color,'flex-start','30%',true)]))}
 if(u)e.append(h('img',{src:u,alt:'',style:'max-width:60%;max-height:35%;border-radius:12px'}));
 titles().forEach(x=>x&&e.append(x));return e}

function buildBook(cx){
 const s=S.set,m=S.meta,root=h('div',{class:'bk pp'});
 const sh=(k,kids,id,g)=>{const e=h('section',{class:'sheet '+k,id:id||null,'data-g':g||'front'},kids);root.append(e);return e};
 if(s.cover)root.append(S.kind==='sms'?coverEl(cx):coverX(cx));
 if(s.front){
  sh('tp',[h('h1',{},m.title||'Sans titre'),m.sub?h('p',{class:'ts'},m.sub):null,m.author?h('p',{class:'ta'},m.author):null]);
  if(m.copy||m.author)sh('cp',[m.author?h('p',{},'© '+(m.year||'')+' '+m.author):null,m.copy?h('p',{class:'pre'},m.copy):null]);
  if(m.dedic)sh('dd',[h('p',{class:'pre'},m.dedic)]);
  if(m.epi)sh('ep',[h('p',{class:'pre'},m.epi)])}
 if(S.kind==='ana'&&(s.anaNotice||s.anaCalib))anaNotice(sh,s);
 if(s.toc){const ol=h('ol');let lp='';
  S.chapters.forEach((c,i)=>{if(c.part&&c.part!==lp){ol.append(h('li',{class:'tpt'},c.part));lp=c.part}
   const hr=cx.href?cx.href(c,i):null,tt=c.title||'Sans titre';ol.append(h('li',{},[hr?h('a',{href:hr},tt):tt,cx.pgmap?h('i',{class:'tl'}):null,cx.pgmap&&cx.pgmap[c.id]?h('span',{class:'tpn'},String(cx.pgmap[c.id])):null]))});
  sh('toc',[h('h2',{},'Table des matières'),ol],null,'toc')}
 let lp='';
 S.chapters.forEach((c,i)=>{const g='c'+i;
  if(c.part&&c.part!==lp){lp=c.part;if(s.partpg)sh('part',[h('h2',{},c.part)],null,g)}
  if(S.kind!=='sms'){const sx=sh('chp xk',[],cx.idp?cx.idp+c.id:null,g);sx.append(xChapterEl(c,Object.assign({},cx,{edit:false,msgs:c.msgs,prog:cx.prog||jProg()})));return}
  const sec=sh('chp',[],cx.idp?cx.idp+c.id:null,g);
  if(c.part&&!s.partpg&&(i===0||S.chapters[i-1].part!==c.part))sec.append(h('p',{class:'ptag'},c.part));
  sec.append(h('h2',{},c.title||'Sans titre'));
  convSegs(c).forEach((sg,si)=>{const L=sg.msgs.filter(x=>x.who!=='note'),he=headEls(sg.mk?convHeadChap(c,sg):c,cx);
   if(si>0)sec.append(h('div',{class:'sbr cvbk',style:'height:0;break-before:page;page-break-before:always'}));he.forEach(e=>sec.append(e));
   const P=h('div',{class:'pg'}),cx2={th:cx.th,src:cx.src,edit:false,msgs:L};
   if(sg.mk){const H=convHist(sg.mk);if(H.length)recapInto(P,H.slice(-(sg.mk.ctx==null?3:sg.mk.ctx)),cx2)}
   listInto(P,L,cx2);sec.append(P)})});
 if(s.back){
  if(m.blurb)sh('back',[h('h2',{},'Résumé'),h('p',{class:'pre'},m.blurb)],null,'back');
  if(m.thanks)sh('back',[h('h2',{},'Remerciements'),h('p',{class:'pre'},m.thanks)],null,'back');
  if(m.about)sh('back',[h('h2',{},'À propos de l’auteur'),h('p',{class:'pre'},m.about)],null,'back')}
 return root}

function pageCSS(){const s=S.set,p=PAGES[s.page]||PAGES.A5;
 let c='@page{size:'+p.w+'mm '+p.h+'mm;margin:'+s.margin+'mm}';
 if(s.pnum)c+='@page{@bottom-center{content:counter(page);font:10px Georgia,serif;color:#555}}@page:first{@bottom-center{content:none}}';
 if(s.runhead)c+='@page{@top-center{content:"'+(S.meta.title||'').replace(/["\\\n]/g,' ')+'";font:italic 10px Georgia,serif;color:#777}}@page:first{@top-center{content:none}}';
 return c}

/* ═════ Exports ═════ */
const slug=()=>(S.meta.title||'livre').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^\w\-]+/g,'_').replace(/^_+|_+$/g,'')||'livre';
function dl(name,data,type){const b=data instanceof Blob?data:new Blob([data],{type});const u=URL.createObjectURL(b),a=h('a',{href:u,download:name});document.body.append(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(u)},3000)}
function scriptText(){if(S.kind!=='sms')return xText();const L=[];

 S.chapters.forEach(c=>{L.push('# '+(c.title||'Sans titre'));L.push('');
  c.msgs.forEach(m=>{const x=ch(m.who),t=m.type||'text',d=m.d||{};
   if(m.who==='conv'){const sg=convSegs(c).find(x=>x.mk===m);L.push('','=== '+(convIsResume(m)?'reprise ':'')+convParts({parts:m.parts,msgs:sg?sg.msgs:[]}).map(x=>x.name+(m.alias&&m.alias[x.id]?' ('+m.alias[x.id]+')':'')).join(', ')+(m.name?' | '+m.name:'')+(m.sub?(m.name?'':' | ')+' | '+m.sub:''),'')}else if(m.who==='time')L.push('['+m.text+']');else if(m.who==='narr')L.push('* '+m.text);else if(m.who==='sys')L.push('! '+m.text);
   else if(m.who==='sep')L.push('---');else if(m.who==='note')L.push('// '+m.text);else if(m.who==='rcpt')L.push('> '+m.text);
   else if(x){let b;
    if(t==='typing')b='...';else if(t==='img')b=d.alt!=null?'('+(d.kind==='capture'?'capture':'photo')+': '+d.alt+(m.text?' | '+m.text:'')+')':(m.text||'[image]');else if(t==='draft')b='(brouillon: '+(m.text||'')+')';else if(t==='voice')b='(vocal '+(d.dur||'0:10')+')';
    else if(t==='call')b='('+(d.kind==='video'?'visio':'appel')+(d.miss?' manqué':(d.dur?' '+d.dur:''))+')';
    else if(t==='loc')b='(lieu: '+(d.name||'')+')';else if(t==='file')b='(fichier: '+(d.name||'')+')';
    else if(t==='link')b='(lien: '+(d.title||'')+(d.dom?' | '+d.dom:'')+')';else b=m.text;
    L.push(x.name+': '+String(b).replace(/\n/g,'\n'))}});
  L.push('')});return L.join('\n')}
function mdText(){if(S.kind!=='sms')return xText();const m=S.meta,L=['# '+(m.title||'Sans titre')];if(m.sub)L.push('*'+m.sub+'*');if(m.author)L.push('par '+m.author);
 S.chapters.forEach(c=>{L.push('','## '+(c.title||'Sans titre'),'');
  c.msgs.forEach(x=>{if(x.who==='note')return;const p=ch(x.who);if(x.who==='conv'){L.push('','### '+convLabel(x,c)+(convIsResume(x)?' (reprise)':''),'');return}
   if(x.who==='time')L.push('> ['+x.text+']  ');else if(x.who==='narr')L.push('*'+x.text+'*  ');else if(x.who==='sys')L.push('_'+x.text+'_  ');else if(x.who==='sep')L.push('','* * *','');else if(x.who==='rcpt')L.push('_'+x.text+'_  ');
   else if(p)L.push('**'+p.name+'** : '+previewText(x).replace(/^📷 Photo$/,'[image]')+(x.type&&x.type!=='text'&&x.type!=='img'?'':'')+'  ')});
  });return L.join('\n')}
function exportHTML(){const k=S.kind,root=buildBook({th:LIGHT,src:id=>A[id]||'',href:c=>'#c-'+c.id,idp:'c-'});
 let css='body{margin:0;background:#d4d8e3}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}'+(k==='sms'?bookCSS(S.set,LIGHT,'.bk'):modeCSS(k))+LAYOUT+LAYOUTX+pageCSS(),pre='',js='';
 if(k==='ana'){pre=ANA_SVG+'<div class="lensbar"><button data-l="none" class="on">Sans lunettes</button><button data-l="red">🔴 Verre rouge</button><button data-l="cyan">🔵 Verre cyan</button><label>Relief <input type="range" min="0" max="3" step=".25" value="1"></label></div>';css+=LENSBAR_CSS;js='('+anaRuntime+')()'}
 if(k==='journal'&&S.set.janim)js='('+journalRuntime+')(document.body)';
 if(k==='spell')js='('+spellRuntime+')(document.body)';
 if(KR[k])js='('+mechRuntime+')(document.body)';
 const html='<!DOCTYPE html>\n<html lang="'+esc(S.meta.lang)+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(S.meta.title)+'</title><style>'+css+'</style></head><body>'+pre+root.outerHTML+(js?'<script>'+js+'<\/script>':'')+'</body></html>';
 dl(slug()+'.html',html,'text/html')}

const CT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=u=>{let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CT[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
function zip(files){const enc=new TextEncoder(),parts=[],cd=[];let off=0;
 const w16=(v,x)=>v.push(x&255,(x>>8)&255),w32=(v,x)=>v.push(x&255,(x>>>8)&255,(x>>>16)&255,(x>>>24)&255);
 files.forEach(f=>{const nm=enc.encode(f.n),d=f.d,c=crc32(d),lh=[];
  w32(lh,0x04034b50);w16(lh,20);w16(lh,0x0800);w16(lh,0);w16(lh,0);w16(lh,0x21);w32(lh,c);w32(lh,d.length);w32(lh,d.length);w16(lh,nm.length);w16(lh,0);
  parts.push(new Uint8Array(lh),nm,d);
  const ce=[];w32(ce,0x02014b50);w16(ce,20);w16(ce,20);w16(ce,0x0800);w16(ce,0);w16(ce,0);w16(ce,0x21);w32(ce,c);w32(ce,d.length);w32(ce,d.length);w16(ce,nm.length);w16(ce,0);w16(ce,0);w16(ce,0);w16(ce,0);w32(ce,0);w32(ce,off);
  cd.push(new Uint8Array(ce),nm);off+=lh.length+nm.length+d.length});
 let cs=0;cd.forEach(x=>cs+=x.length);const e=[];w32(e,0x06054b50);w16(e,0);w16(e,0);w16(e,files.length);w16(e,files.length);w32(e,cs);w32(e,off);w16(e,0);
 return new Blob([...parts,...cd,new Uint8Array(e)],{type:'application/epub+zip'})}
function exportEPUB(){
 if(S.kind!=='sms'){toast('L’EPUB est disponible pour les livres SMS. Pour ce type de livre, utilisez le PDF ou la page web.');return}
 const enc=new TextEncoder(),lang=S.meta.lang||'fr',imgs={};let n=0;
 const src=id=>{if(!id||!A[id])return'';if(imgs[id])return imgs[id].path;const d=A[id],mt=(d.match(/^data:([^;,]+)/)||[])[1]||'image/jpeg',ext=/png/.test(mt)?'png':/gif/.test(mt)?'gif':/webp/.test(mt)?'webp':'jpg';
  const bin=atob(d.split(',')[1]||''),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  imgs[id]={path:'images/i'+(++n)+'.'+ext,mt,u};return imgs[id].path};
 const root=buildBook({th:LIGHT,src,href:(c,i)=>'ch'+i+'.xhtml'});
 const groups=[],gm={};[...root.children].forEach(sec=>{const g=sec.dataset.g||'front';sec.removeAttribute('data-g');sec.removeAttribute('id');sec.style.aspectRatio='';if(!gm[g]){gm[g]={g,secs:[]};groups.push(gm[g])}gm[g].secs.push(sec)});
 const ser=el=>new XMLSerializer().serializeToString(el);
 const xh=(t,body)=>'<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="'+lang+'" xml:lang="'+lang+'"><head><meta charset="utf-8"/><title>'+esc(t)+'</title><link rel="stylesheet" type="text/css" href="style.css"/></head><body><div class="bk pp">'+body+'</div></body></html>';
 const files=[],add=(p,txt)=>files.push({n:p,d:enc.encode(txt)});
 const names={cover:'cover.xhtml',front:'front.xhtml',toc:'toc.xhtml',back:'back.xhtml'};
 const spine=[];groups.forEach(g=>{const f=names[g.g]||('ch'+g.g.slice(1)+'.xhtml');g.f=f;
  const ttl=/^c\d+$/.test(g.g)?(S.chapters[+g.g.slice(1)].title||'Chapitre'):g.g;
  add('OEBPS/'+f,xh(ttl,g.secs.map(ser).join('')));spine.push(g)});
 add('OEBPS/style.css',bookCSS(S.set,LIGHT,'.bk',true)+LAYOUT+EPUBX);
 const nav='<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="'+lang+'"><head><meta charset="utf-8"/><title>Sommaire</title></head><body><nav epub:type="toc" id="toc"><h1>Sommaire</h1><ol>'+S.chapters.map((c,i)=>{const g=gm['c'+i];return g?'<li><a href="'+g.f+'">'+esc(c.title||'Sans titre')+'</a></li>':''}).join('')+'</ol></nav></body></html>';
 add('OEBPS/nav.xhtml',nav);
 Object.values(imgs).forEach(o=>files.push({n:'OEBPS/'+o.path,d:o.u}));
 const bid='urn:uuid:'+(crypto.randomUUID?crypto.randomUUID():uid()+uid()+uid());
 const cvId=S.meta.cover.img&&imgs[S.meta.cover.img]?'img'+Object.keys(imgs).indexOf(S.meta.cover.img):null;
 const man=spine.map((g,i)=>'<item id="p'+i+'" href="'+g.f+'" media-type="application/xhtml+xml"/>').join('')+'<item id="css" href="style.css" media-type="text/css"/><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>'+Object.keys(imgs).map((k,i)=>'<item id="img'+i+'" href="'+imgs[k].path+'" media-type="'+imgs[k].mt+'"'+(('img'+i)===cvId?' properties="cover-image"':'')+'/>').join('');
 const opf='<?xml version="1.0" encoding="utf-8"?>\n<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bid"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="bid">'+bid+'</dc:identifier><dc:title>'+esc(S.meta.title||'Sans titre')+'</dc:title><dc:language>'+lang+'</dc:language>'+(S.meta.author?'<dc:creator>'+esc(S.meta.author)+'</dc:creator>':'')+'<meta property="dcterms:modified">'+new Date().toISOString().replace(/\.\d+Z$/,'Z')+'</meta></metadata><manifest>'+man+'</manifest><spine>'+spine.map((g,i)=>'<itemref idref="p'+i+'"/>').join('')+'</spine></package>';
 add('OEBPS/content.opf',opf);
 add('META-INF/container.xml','<?xml version="1.0"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
 files.unshift({n:'mimetype',d:enc.encode('application/epub+zip')});
 dl(slug()+'.epub',zip(files),'application/epub+zip')}

/* ═════ Fenêtres, popovers, toasts ═════ */
function modal(title,body,o){o=o||{};return new Promise(res=>{const d=$('#md');$('#mdT').textContent=title;$('#mdB').replaceChildren(body);
 d.classList.toggle('wide',!!o.wide);$('#mdOk').textContent=o.ok||'OK';$('#mdOk').style.display=o.ok===false?'none':'';
 $('#mdNo').textContent=o.ok===false?'Fermer':'Annuler';$('#mdNo').style.display=o.cancel===false?'none':'';
 let done=false;const fin=v=>{if(done)return;done=true;try{d.close()}catch(e){}res(v)};
 const okf=()=>{if(o.check&&o.check()===false)return;fin(true)};$('#mdOk').onclick=okf;$('#mdForm').onsubmit=e=>{e.preventDefault();okf()};$('#mdForm').onkeydown=e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'&&e.target.type!=='file'){e.preventDefault();okf()}};
 $('#mdNo').onclick=()=>fin(false);d.onclose=()=>{if(!done){done=true;res(false)}};
 d.showModal();if(!o.nofocus){const f=$('#mdB').querySelector('input:not([type=file]),textarea,select');if(f)f.focus()}})}
function form(fs){const el=h('div'),inp={};
 fs.forEach(f=>{let i;
  if(f.t==='select'){i=h('select');f.o.forEach(([v,l])=>i.append(h('option',{value:v},l)));i.value=f.v}
  else if(f.t==='area'){i=h('textarea',{rows:f.rows||4,placeholder:f.ph||''});i.value=f.v||''}
  else if(f.t==='check'){i=h('input',{type:'checkbox'});i.checked=!!f.v}
  else{i=h('input',{type:f.t||'text',placeholder:f.ph||''});i.value=f.v==null?'':f.v}
  inp[f.k]=i;el.append(h('label',{class:f.t==='check'?'ck':''},f.t==='check'?[i,f.l]:[f.l,i]))});
 return{el,inp,get:()=>Object.fromEntries(Object.entries(inp).map(([k,i])=>[k,i.type==='checkbox'?i.checked:i.type==='number'?+i.value:i.value]))}}
async function ask(title,fs,ok){const f=form(fs);return(await modal(title,f.el,{ok}))?f.get():null}
const sure=(msg,ok)=>modal('Confirmation',h('p',{},msg),{ok:ok||'Supprimer',nofocus:true});
function toast(msg,act,fn){const t=h('div',{class:'toast',role:'status'},[msg]);if(act)t.append(h('button',{onclick:()=>{fn();t.remove()}},act));$('#toasts').append(t);setTimeout(()=>t.remove(),act?7000:3400)}
let popA=null;
function closePop(){const p=$('#pop');p.hidden=true;p.replaceChildren();popA=null}
function pop(anchor,el){closePop();const p=$('#pop');p.replaceChildren(el);p.hidden=false;p.style.left='0px';p.style.top='0px';
 const r=anchor.getBoundingClientRect(),w=p.offsetWidth,hh=p.offsetHeight;let x=Math.min(Math.max(8,r.left),innerWidth-w-8),y=r.bottom+6;if(y+hh>innerHeight-8)y=Math.max(8,r.top-hh-6);
 p.style.left=x+'px';p.style.top=y+'px';popA=anchor}
function menu(anchor,items){pop(anchor,h('div',{},items.filter(Boolean).map(([l,f,d])=>h('button',{class:'pi'+(d?' danger':''),onclick:()=>{closePop();f()}},l))))}
document.addEventListener('pointerdown',e=>{const p=$('#pop');if(!p.hidden&&!p.contains(e.target)&&!(popA&&popA.contains(e.target)))closePop()},true);
function pickFile(accept,multi){return new Promise(res=>{const i=h('input',{type:'file',accept,style:'display:none'});if(multi)i.multiple=true;i.onchange=()=>{res([...i.files]);i.remove()};i.addEventListener('cancel',()=>{res([]);i.remove()});document.body.append(i);i.click()})}
function readImg(file,max,q){return new Promise((res,rej)=>{const r=new FileReader();r.onerror=rej;r.onload=()=>{const im=new Image();im.onerror=rej;im.onload=()=>{const k=Math.min(1,(max||900)/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(im.width*k));cv.height=Math.max(1,Math.round(im.height*k));const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);x.drawImage(im,0,0,cv.width,cv.height);res(cv.toDataURL('image/jpeg',q||.85))};im.src=r.result};r.readAsDataURL(file)})}

/* ═════ Apparence ═════ */
const isDark=()=>{const t=S.set.theme;return t==='dark'||(t==='auto'&&matchMedia('(prefers-color-scheme:dark)').matches)};
function apply(){const s=S.set,r=document.documentElement;document.body.dataset.kind=S.kind;r.dataset.t=isDark()?'dark':'light';r.style.setProperty('--acc',s.accent);r.style.setProperty('--accT',ink(s.accent));
 document.body.classList.toggle('fm',fm);
 $('#bkA').textContent=bookCSS(s,isDark()?DARK:LIGHT,'.bk');$('#bkP').textContent=bookCSS(s,LIGHT,'.bk.pp');
 document.title=(S.meta.title||'Livre')+' – Scriptorium';
 $('#hint').textContent=(s.enter?'Entrée envoie · Maj+Entrée : ligne':'Ctrl+Entrée envoie · Entrée : ligne')+' · Tab : expéditeur · **gras** *italique* · / commandes · Ctrl+K palette'}
const getP=p=>p.split('.').reduce((o,k)=>o&&o[k],S);
function setP(p,v){const a=p.split('.'),l=a.pop();a.reduce((o,k)=>o[k],S)[l]=v}
function syncB(){$$('[data-b]').forEach(el=>{const v=getP(el.dataset.b);if(el.type==='checkbox')el.checked=!!v;else el.value=v==null?'':v});
 $$('[data-o]').forEach(o=>o.textContent=getP(o.dataset.o));
 $$('#styBtns button').forEach(b=>b.classList.toggle('on',b.dataset.sty===S.set.style));
 $$('#accSw button').forEach(b=>b.classList.toggle('on',b.dataset.c===S.set.accent));if(typeof specBar==='function')specBar()}
function onSet(p){save();if(p.startsWith('set.')){apply();renderView()}else{if(p==='meta.title')apply();if(view==='book')bookView()}stat();syncB()}
$$('[data-b]').forEach(el=>el.addEventListener('input',()=>{const t=el.type;setP(el.dataset.b,t==='checkbox'?el.checked:(t==='range'||t==='number')?+el.value:el.value);onSet(el.dataset.b)}));
$$('#styBtns button').forEach(b=>b.onclick=()=>{S.set.style=b.dataset.sty;onSet('set.style')});
ACC.forEach(c=>{const b=h('button',{style:'background:'+c,'data-c':c,'aria-label':'Accent '+c,onclick:()=>{S.set.accent=c;onSet('set.accent')}});$('#accSw').append(b)});
$('#palSel').append(h('option',{value:''},'Appliquer une palette de couleurs…'),...Object.keys(PALS).map(k=>h('option',{value:k},k)));
$('#palSel').onchange=e=>{const p=PALS[e.target.value];if(!p)return;mut(()=>S.chars.forEach((c,i)=>c.color=p[i%p.length]));e.target.value=''};
$$('.tabs button').forEach(b=>b.onclick=()=>setTab(+b.dataset.tab));
function setTab(n){$$('.tabs button').forEach(b=>b.classList.toggle('on',+b.dataset.tab===n));$$('.tp').forEach(p=>p.classList.toggle('on',+p.dataset.p===n))}

/* ═════ Vues ═════ */
function setView(v){stopRead();if(XCLEAN){XCLEAN();XCLEAN=null}view=v;$$('#seg button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));const sms=S.kind==='sms';
 $('#vWrite').hidden=!(v==='write'&&sms);$('#vX').hidden=!(v==='write'&&!sms);$('#vPlan').hidden=v!=='plan';$('#vRead').hidden=!(v==='read'&&sms);$('#vXRead').hidden=!(v==='read'&&!sms);$('#vBook').hidden=v!=='book';renderView()}
function renderView(){const k=S.kind;$('#ct').value=chap().title;({write:k==='sms'?chat:xWrite,plan:planView,read:k==='sms'?readView:xReadView,book:bookView})[view]();stat()}
function all(){ALIASC=null;syncB();apply();kindUI();pChaps();pChars();chips();cbar();hs();xComposer();const sms=S.kind==='sms';$('#vWrite').hidden=!(view==='write'&&sms);$('#vX').hidden=!(view==='write'&&!sms);$('#vRead').hidden=!(view==='read'&&sms);$('#vXRead').hidden=!(view==='read'&&!sms);renderView()}
$$('#seg button').forEach(b=>b.onclick=()=>setView(b.dataset.v));
const cxE=()=>({th:isDark()?DARK:LIGHT,edit:true,msgs:chap().msgs,src:id=>A[id]||''});

/* ═════ Édition d'un message ═════ */
function wrapEd(mark){const s=getSelection();if(!s.rangeCount||!s.toString())return;document.execCommand('insertText',false,mark+s.toString()+mark)}
function editable(t,m,cx,render,prop){prop=prop||'text';
 try{t.contentEditable='plaintext-only'}catch(e){t.contentEditable='true'}
 t.spellcheck=true;
 t.onfocus=()=>{t.classList.remove('big');t.classList.add('raw');t.textContent=m[prop]||'';const r=document.createRange();r.selectNodeContents(t);r.collapse(false);const s=getSelection();s.removeAllRanges();s.addRange(r)};
 t.onblur=()=>{t.classList.remove('raw');const v=t.innerText.replace(/\u00a0/g,' ').trim();
  if(!v&&prop==='text'&&m.who!=='sep'&&m.type!=='sep'){mut(()=>{const i=cx.msgs.indexOf(m);if(i>-1)cx.msgs.splice(i,1)});return}
  if(v!==(m[prop]||''))mut(()=>{m[prop]=v},false);
  t.classList.toggle('big',!!ch(m.who)&&isBig(m[prop]));t.replaceChildren(...render(m[prop]||''));stat()};
 t.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();t.blur()}
  else if(e.key==='Escape'){e.preventDefault();t.textContent=m[prop]||'';t.blur()}
  else if((e.ctrlKey||e.metaKey)&&(e.key==='b'||e.key==='i')){e.preventDefault();wrapEd(e.key==='b'?'**':'*')}}}
function selectMsg(m,range,msgs){
 if(range&&lastSel){const a=msgs.findIndex(x=>x.id===lastSel),b=msgs.findIndex(x=>x.id===m.id);if(a>-1&&b>-1)for(let i=Math.min(a,b);i<=Math.max(a,b);i++)SEL.add(msgs[i].id)}
 else{SEL.has(m.id)?SEL.delete(m.id):SEL.add(m.id)}
 lastSel=m.id;chat()}
function clearDrop(){$$('.dT,.dB,.dz').forEach(e=>e.classList.remove('dT','dB','dz'))}
function dropMsgs(ids,target,after){mut(()=>{const c=chap(),mv=c.msgs.filter(x=>ids.includes(x.id)),rest=c.msgs.filter(x=>!ids.includes(x.id)),ti=rest.findIndex(x=>x.id===target);if(ti<0||!mv.length)return;rest.splice(ti+(after?1:0),0,...mv);c.msgs=rest})}
function moveMsgs(ids,cid){const to=S.chapters.find(c=>c.id===cid);if(!to||to.id===S.cur)return;mut(()=>{const c=chap(),mv=c.msgs.filter(x=>ids.includes(x.id));c.msgs=c.msgs.filter(x=>!ids.includes(x.id));to.msgs.push(...mv);SEL.clear()});toast(ids.length+' message(s) déplacé(s) vers « '+(to.title||'Sans titre')+' »')}
function mvMsg(L,i,d){const j=i+d;if(j<0||j>=L.length)return;mut(()=>{[L[i],L[j]]=[L[j],L[i]]})}
function decorate(el,m,cx,isMsg){
 const L=cx.msgs,B=(l,tt,f)=>h('button',{title:tt,'aria-label':tt,onclick:e=>{e.stopPropagation();f(e.currentTarget)}},l);
 const dg=h('span',{class:'dg',title:'Glisser pour déplacer (ou vers un chapitre)',draggable:true,ondragstart:e=>{DRAG=SEL.has(m.id)?[...SEL]:[m.id];e.dataTransfer.setData('text/plain',m.id);e.dataTransfer.effectAllowed='move'},ondragend:()=>{DRAG=null;clearDrop()}},'⋮⋮');
 const typed=isMsg&&m.type&&!['text','typing'].includes(m.type);
 el.append(h('div',{class:'ctl'},[dg,B('↑','Monter',()=>mvMsg(L,L.indexOf(m),-1)),B('↓','Descendre',()=>mvMsg(L,L.indexOf(m),1)),
  isMsg?B('☺','Réaction',a=>reactPop(a,m)):null,isMsg?B('◷','Heure sous la bulle',a=>timePop(a,m)):null,
  isMsg?B('↩','Répondre à ce message',()=>{REPLY=m.id;cbar();$('#ta').focus()}):null,
  isMsg?B('⇄','Changer d’expéditeur',a=>whoPop(a,[m.id])):null,
  typed?B('✎','Modifier les détails',()=>detail(m)):null,
  B('⤵','Écrire après ce message',()=>{INS=m.id;cbar();$('#ta').focus()}),
  B('⧉','Dupliquer',()=>mut(()=>{L.splice(L.indexOf(m)+1,0,{...m,id:uid()})})),
  B('☑','Sélectionner',()=>selectMsg(m,false,L)),
  B('✕','Supprimer',()=>mut(()=>{L.splice(L.indexOf(m),1)}))]));
 el.addEventListener('mousedown',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey){e.preventDefault();e.stopPropagation();selectMsg(m,e.shiftKey,L)}},true);
 el.ondragover=e=>{if(!DRAG)return;e.preventDefault();const r=el.getBoundingClientRect();clearDrop();el.classList.add(e.clientY>r.top+r.height/2?'dB':'dT')};
 el.ondrop=e=>{if(!DRAG)return;e.preventDefault();e.stopPropagation();const r=el.getBoundingClientRect(),ids=DRAG;DRAG=null;clearDrop();if(!ids.includes(m.id))dropMsgs(ids,m.id,e.clientY>r.top+r.height/2)}}
function reactPop(a,m){pop(a,h('div',{class:'rg'},RX.map(x=>h('button',{onclick:()=>{closePop();mut(()=>{m.react=x})}},x||'∅'))))}
function timePop(a,m){const i=h('input',{type:'text',value:m.time||'',placeholder:'21:14',style:'width:100px','aria-label':'Heure'});
 const ok=()=>{closePop();mut(()=>{m.time=i.value.trim();if(m.time&&!S.set.times)S.set.times=true})};
 i.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ok()}};
 pop(a,h('div',{class:'tp2'},[i,h('button',{class:'pi',onclick:()=>{i.value=timeNow()}},'Maintenant'),h('button',{class:'pi acc',onclick:ok},'OK')]));i.focus()}
function whoPop(a,ids){pop(a,h('div',{},[...S.chars.map(c=>h('button',{class:'pi',onclick:()=>{closePop();mut(()=>{ids.forEach(id=>{const m=findMsg(id);if(m){m.who=c.id}})})}},[h('span',{style:'color:'+c.color},'● '),c.name])),
 h('button',{class:'pi',onclick:()=>{closePop();mut(()=>ids.forEach(id=>{const m=findMsg(id);if(m){m.who='narr';m.type=undefined}}))}},'Narration')]))}
async function detail(m){const d=m.d||{},t=m.type;let fs;
 if(t==='voice')fs=[{k:'dur',l:'Durée (ex. 0:23)',v:d.dur||'0:10'}];
 else if(t==='call')fs=[{k:'kind',l:'Type',t:'select',o:[['vocal','Vocal'],['video','Vidéo']],v:d.kind||'vocal'},{k:'miss',l:'Appel manqué',t:'check',v:d.miss},{k:'dur',l:'Durée',v:d.dur||''}];
 else if(t==='loc')fs=[{k:'name',l:'Nom du lieu',v:d.name||''}];
 else if(t==='link')fs=[{k:'title',l:'Titre',v:d.title||''},{k:'dom',l:'Site',v:d.dom||''}];
 else if(t==='file')fs=[{k:'name',l:'Nom du fichier',v:d.name||''},{k:'size',l:'Taille',v:d.size||''}];
 else if(t==='img')fs=[{k:'alt',l:'Description (affichée tant qu’il n’y a pas d’image)',v:d.alt||''},{k:'text',l:'Légende',v:m.text||''}];
 else if(t==='draft')fs=[{k:'text',l:'Texte du brouillon effacé',t:'area',v:m.text||''}];else return;
 const r=await ask('Modifier le message',fs,'Enregistrer');if(!r)return;
 mut(()=>{if(t==='img'){m.text=r.text;m.d=Object.assign({},m.d,{alt:r.alt})}else if(t==='draft')m.text=r.text;else m.d=Object.assign({},m.d,r)})}

/* ═════ Écriture : composer ═════ */
function cbar(){const B=$('#cbar');B.replaceChildren();
 if(REPLY){const m=findMsg(REPLY);if(m){const c=ch(m.who);B.append(h('div',{class:'cb'},[h('span',{},'↩ Réponse à '+(c?c.name+' : ':'')+previewText(m).slice(0,50)),h('button',{'aria-label':'Annuler la réponse',onclick:()=>{REPLY=null;cbar()}},'✕')]))}else REPLY=null}
 if(INS){const m=findMsg(INS);if(m)B.append(h('div',{class:'cb'},[h('span',{},'⤵ Insertion après : '+previewText(m).slice(0,50)),h('button',{'aria-label':'Annuler l’insertion',onclick:()=>{INS=null;cbar()}},'✕')]));else INS=null}}
function chips(){const K=$('#chips');K.replaceChildren();
 const mk=(id,l,col)=>{const b=h('button',{class:'chip'+(who===id?' on':''),onclick:()=>{who=id;chips();$('#ta').focus()}},l);if(who===id){b.style.background=col;b.style.color=ink(col)}K.append(b)};
 S.chars.forEach(c=>mk(c.id,c.name,c.color));mk('narr','Narration','#555');mk('time','Horodatage','#555');mk('sys','Système','#555');mk('rcpt','Accusé','#555');mk('note','Note d’auteur','#a67c00');
 const c=ch(who);$('#ta').placeholder=c?'Écrire en tant que '+c.name+'…':who==='narr'?'Narration…':who==='time'?'Horodatage (ex. Mardi 21:14)…':who==='sys'?'Message système…':who==='rcpt'?'Accusé (ex. Lu à 02:17, Distribué)…':'Note d’auteur (non imprimée)…'}
function push(m){const c=chap(),id=uid(),msg=Object.assign({id,who},m);
 if(REPLY&&ch(msg.who)&&!msg.reply)msg.reply=REPLY;
 let ins=false;
 mut(()=>{if(INS){const i=c.msgs.findIndex(x=>x.id===INS);if(i>-1){c.msgs.splice(i+1,0,msg);INS=id;ins=true;return}INS=null}c.msgs.push(msg)},false);
 REPLY=null;if(view!=='write')setView('write');else chat();chips();cbar();
 const e=$('#chat');if(ins){const n=$('[data-mid="'+id+'"]');if(n)n.scrollIntoView({block:'nearest'})}else e.scrollTop=e.scrollHeight}
const scrRe=l=>/^\[.+\]$/.test(l)||/^>\s*\S/.test(l)||/^(\*|!|#|\/\/)\s*\S/.test(l)||/^={3,}\s*\S/.test(l)||/^(-{3,}|\*\s\*\s\*)$/.test(l)||S.chars.some(c=>l.toLowerCase().startsWith(c.name.toLowerCase())&&/^\s*[:：]/.test(l.slice(c.name.length)));
function parseScript(src){const out=[];let last=null;
 src.split(/\r?\n/).forEach(raw=>{const l=raw.trim();if(!l)return;let m;
  if(m=l.match(/^={3,}\s*(.+)$/)){const p=m[1].split('|').map(x=>x.trim()),rs=/^(reprise|reprend|suite)\s*[:：]?\s+/i.test(p[0]);out.push({conv:{parts:p[0].replace(/^(reprise|reprend|suite)\s*[:：]?\s+/i,'').trim(),name:p[1]||'',sub:p[2]||'',resume:rs}});last=null}
  else if(m=l.match(/^#\s*(.+)$/)){out.push({chap:m[1]});last=null}
  else if(/^(-{3,}|\*\s\*\s\*)$/.test(l)){out.push({who:'sep',text:''});last=null}
  else if(m=l.match(/^\[(.+)\]$/)){out.push({who:'time',text:m[1]});last=null}
  else if(m=l.match(/^\/\/\s*(.+)$/)){out.push({who:'note',text:m[1]});last=null}
  else if(m=l.match(/^>\s*(.+)$/)){out.push({who:'rcpt',text:m[1]});last=null}
  else if(m=l.match(/^!\s*(.+)$/)){out.push({who:'sys',text:m[1]});last=null}
  else if(m=l.match(/^\*\s*(.+)$/)){out.push({who:'narr',text:m[1]});last=out[out.length-1]}
  else if(m=l.match(/^([^:：\n]{1,24}?)\s*[:：]\s*(.+)$/)){const n=m[1].trim(),known=S.chars.some(c=>c.name.toLowerCase()===n.toLowerCase()),okName=/^[\p{L}][\p{L}\p{M}'’\- .]{0,22}$/u.test(n);
   if(known||okName){const it={name:n,text:m[2]},t=m[2].trim();let q;
    if(/^(\.{3}|…)$/.test(t)){it.type='typing';it.text=''}
    else if(q=t.match(/^\((vocal|appel|visio|lieu|fichier|lien|photo|image|capture|brouillon)(?:\s*:?\s*([\s\S]*))?\)$/i)){const k=q[1].toLowerCase(),a=(q[2]||'').trim();it.text='';
     if(k==='vocal'){it.type='voice';it.d={dur:a||'0:10'}}
     else if(k==='appel'||k==='visio'){it.type='call';it.d={kind:k==='visio'?'video':'vocal',miss:/manqu/i.test(a),dur:a.replace(/manqu\S*/i,'').trim()}}
     else if(k==='lieu'){it.type='loc';it.d={name:a||'Position partagée'}}
     else if(k==='fichier'){it.type='file';it.d={name:a||'document.pdf',size:''}}
     else if(k==='photo'||k==='image'||k==='capture'){const[p,r]=a.split('|');it.type='img';it.d={kind:k==='capture'?'capture':'photo',alt:(p||'').trim()};it.text=(r||'').trim()}
     else if(k==='brouillon'){it.type='draft';it.text=a}
     else{const[p,r]=a.split('|');it.type='link';it.d={title:(p||'Lien').trim(),dom:(r||'').trim()}}}
    out.push(it);last=it}
   else if(last&&last.text!=null){last.text+='\n'+l}else{out.push({who:'narr',text:l});last=out[out.length-1]}}
  else if(last&&last.text!=null&&!last.type){last.text+='\n'+l}
  else{out.push({who:'narr',text:l});last=out[out.length-1]}});
 return out}
function commit(items,o){o=o||{};let n=0;
 mut(()=>{let c=chap(),reuse=!c.msgs.length&&!o.newChap,firstC=null;
  if(S.chapters.every(k=>!k.msgs.length)&&S.chars.every(x=>['a','b'].includes(x.id)))S.chars=[];
  const mk=t=>{const k={id:uid(),title:t,part:'',conv:'',sub:'',status:'draft',note:'',msgs:[]};S.chapters.push(k);return k};
  const getC=nm=>{let x=S.chars.find(y=>y.name.toLowerCase()===nm.toLowerCase());if(!x){x={id:uid(),name:nm,color:PAL[S.chars.length%PAL.length],side:S.chars.some(y=>y.side==='right')?'left':'right',emoji:'',av:'',note:''};S.chars.push(x)}return x};
  if(o.newChap){c=mk(o.newChap);firstC=c}
  const nms=(mk,k)=>{const sg=convSegs(k).find(x=>x.mk===mk);return convParts({parts:mk.parts,msgs:sg?sg.msgs:[]}).map(x=>x.name.toLowerCase()).sort().join('|')};
  items.forEach(it=>{if(it.conv){const cv=it.conv,raw=cv.parts.split(/\s*,\s*|\s+et\s+/).map(x=>x.trim()).filter(Boolean),al={},alN={},names=raw.map(x=>{const q=x.match(/^(.+?)\s*[(（]\s*(.+?)\s*[)）]$/);if(q){alN[q[1].trim()]=q[2];return q[1].trim()}return x});names.forEach(getC);Object.entries(alN).forEach(([n,v])=>{al[getC(n).id]=v});
    if(!c.msgs.some(x=>x.who==='conv')&&c.msgs.some(x=>ch(x.who))){const i0=uid();c.msgs.unshift({id:i0,who:'conv',text:'',thread:i0,name:c.conv||'',parts:c.parts||'',sub:c.sub||'',ctx:3})}
    const id=uid(),mkr={id,who:'conv',text:'',thread:id,name:cv.name,parts:names.join(', '),sub:cv.sub,ctx:3,alias:al};
    if(cv.resume){const key=names.map(x=>x.toLowerCase()).sort().join('|');const prev=convMarkers().filter(x=>nms(x.m,x.c)===key).pop();if(prev){mkr.thread=prev.m.thread;if(!Object.keys(al).length&&prev.m.alias)mkr.alias=Object.assign({},prev.m.alias);if(!cv.name&&prev.m.name&&!Object.keys(al).length){mkr.name=prev.m.name;if(!cv.sub)mkr.sub=prev.m.sub}}}
    if(!c.msgs.some(x=>x.who==='conv')&&c.msgs.length&&!c.msgs.some(x=>ch(x.who)))c.msgs.unshift(mkr);else c.msgs.push(mkr);return}
   if(it.chap!=null){if(reuse){c.title=it.chap;reuse=false;if(!firstC)firstC=c}else{c=mk(it.chap);if(!firstC)firstC=c}return}
   const m=Object.assign({id:uid()},it);if(it.name!=null){m.who=getC(it.name).id;delete m.name}c.msgs.push(m);n++});
  if(firstC)S.cur=firstC.id;
  const used=new Set();S.chapters.forEach(k=>k.msgs.forEach(m=>{used.add(m.who);if(m.who==='conv')(m.parts||'').split(',').forEach(x=>{const y=S.chars.find(z=>z.name.toLowerCase()===x.trim().toLowerCase());if(y)used.add(y.id)})}));
  const keep=S.chars.filter(x=>used.has(x.id)||!['a','b'].includes(x.id));if(keep.length&&keep.length<S.chars.length){S.chars=keep;if(!ch(who))who=S.chars[0].id}});
 return n}
function slash(c,a){const need=()=>{if(!ch(who)){toast('Choisissez d’abord un personnage.');return false}return true};
 switch(c){
  case't':case'heure':push({who:'time',text:a||timeNow()});return true;
  case'n':case'narration':if(!a)return false;push({who:'narr',text:a});return true;
  case's':case'sys':if(!a)return false;push({who:'sys',text:a});return true;
  case'sep':push({who:'sep',text:a});return true;
  case'note':if(!a)return false;push({who:'note',text:a});return true;
  case'chap':addChapter(a||undefined);return true;
  case'conv':addConv(a?{parts:a}:null);return true;
  case'reprise':addConv({resume:true});return true;
  case'v':case'vocal':if(!need())return true;push({type:'voice',text:'',d:{dur:a||'0:12'}});return true;
  case'appel':case'visio':if(!need())return true;push({type:'call',text:'',d:{kind:c==='visio'?'video':'vocal',miss:/manqu/i.test(a),dur:a.replace(/manqu\S*/i,'').trim()||(/manqu/i.test(a)?'':'3:12')}});return true;
  case'lieu':if(!need())return true;push({type:'loc',text:'',d:{name:a||'Position partagée'}});return true;
  case'fichier':if(!need())return true;push({type:'file',text:'',d:{name:a||'document.pdf',size:''}});return true;
  case'lien':{if(!need())return true;const p=a.split('|');push({type:'link',text:'',d:{title:(p[0]||'Lien').trim(),dom:(p[1]||'').trim()}});return true}
  case'aide':case'?':shortcuts();return true}
 return false}
function clearTA(){const ta=$('#ta');ta.value='';ta.style.height='auto';ta.focus()}
function send(){const ta=$('#ta'),v=ta.value.replace(/\s+$/,'');if(!v.trim())return;
 const lines=v.split(/\r?\n/).filter(l=>l.trim()),sl=lines.filter(l=>scrRe(l.trim())).length;
 if(lines.length>1&&sl>=2&&sl>=lines.length*.6){const n=commit(parseScript(v));toast(n+' éléments ajoutés');clearTA();return}
 const cm=v.match(/^\/(\S+)(?:\s+([\s\S]*))?$/);
 if(cm&&slash(cm[1].toLowerCase(),(cm[2]||'').trim())){clearTA();return}
 const mm=v.match(/^([^:：\n]{1,24}?)\s*[:：]\s+([\s\S]+)$/);
 if(mm){const c=S.chars.find(x=>x.name.toLowerCase()===mm[1].trim().toLowerCase());if(c){who=c.id;push({text:mm[2]});clearTA();return}}
 push({text:v});clearTA()}
async function sendImage(file){if(!ch(who)){toast('Choisissez un personnage pour envoyer une image.');return}
 try{const u=await readImg(file,900);push({type:'img',text:'',img:addAsset(u)})}catch(e){toast('Image illisible.')}}
function insertMenu(a){menu(a,[
 ['🖼  Image…',async()=>{const f=(await pickFile('image/*',true));for(const x of f)await sendImage(x)}],
 ['🎤  Message vocal…',()=>quick('voice')],['📞  Appel…',()=>quick('call')],['📍  Localisation…',()=>quick('loc')],['🔗  Lien…',()=>quick('link')],['📎  Fichier…',()=>quick('file')],
 ['💬  Nouvelle conversation…',()=>addConv()],['↺  Reprendre une conversation…',()=>addConv({resume:true})],
 ['✦  Séparateur de scène',()=>push({who:'sep',text:''})],
 ['📄  Coller un script…',()=>scriptDlg('')],['💬  Importer une discussion WhatsApp…',()=>waDlg('')]])}
async function quick(t){if(!ch(who)){toast('Choisissez d’abord un personnage.');return}
 const f={voice:[{k:'dur',l:'Durée (ex. 0:23)',v:'0:12'}],call:[{k:'kind',l:'Type',t:'select',o:[['vocal','Vocal'],['video','Vidéo']],v:'vocal'},{k:'miss',l:'Appel manqué',t:'check'},{k:'dur',l:'Durée',v:'3:12'}],loc:[{k:'name',l:'Nom du lieu',v:''}],link:[{k:'title',l:'Titre',v:''},{k:'dom',l:'Site (ex. lemonde.fr)',v:''}],file:[{k:'name',l:'Nom du fichier',v:'document.pdf'},{k:'size',l:'Taille',v:'1,2 Mo'}]}[t];
 const r=await ask({voice:'Message vocal',call:'Appel',loc:'Localisation',link:'Lien',file:'Fichier'}[t],f,'Insérer');if(r)push({type:t,text:'',d:r})}

/* ═════ Écriture : rendu du chapitre ═════ */
function chat(){const c=chap(),P=$('#page'),cx=cxE();P.replaceChildren();$('#ct').value=c.title;
 $('#pt').replaceChildren(...(c.msgs[0]&&c.msgs[0].who==='conv'?[]:headEls(c,cx)));
 if(!c.msgs.length)P.append(h('div',{class:'empty'},'Ce chapitre est vide. Choisissez un personnage ci-dessous et écrivez, ou utilisez ＋ pour coller un script.'));
 listInto(P,c.msgs,cx);selbar();stat()}
function selbar(){const b=$('#selbar');b.replaceChildren();if(!SEL.size){b.hidden=true;return}b.hidden=false;
 const ids=()=>[...SEL];
 b.append(h('b',{},SEL.size+' sélectionné(s)'),
  h('button',{onclick:e=>whoPop(e.currentTarget,ids())},'⇄ Expéditeur'),
  h('button',{onclick:e=>menu(e.currentTarget,S.chapters.filter(k=>k.id!==S.cur).map(k=>[k.title||'Sans titre',()=>moveMsgs(ids(),k.id)]))},'➜ Déplacer vers…'),
  h('button',{onclick:()=>{const t=chap().msgs.filter(m=>SEL.has(m.id)).map(m=>(ch(m.who)?ch(m.who).name+': ':'')+previewText(m)).join('\n');navigator.clipboard&&navigator.clipboard.writeText(t).then(()=>toast('Copié')).catch(()=>toast('Copie impossible ici'))}},'⧉ Copier'),
  h('button',{onclick:()=>{const n=SEL.size;mut(()=>{const c=chap();c.msgs=c.msgs.filter(m=>!SEL.has(m.id));SEL.clear()});toast(n+' supprimé(s)','Annuler',undo)}},'✕ Supprimer'),
  h('button',{onclick:()=>{SEL.clear();chat()},'aria-label':'Désélectionner'},'Fermer'))}
function stat(){let w=0,n=0;S.chapters.forEach(c=>c.msgs.forEach(m=>{if(m.who==='note')return;n++;w+=bw(m)}));
 const g=S.goal,d=dayKey();if(g.day!==d){if(g.day)g.log[g.day]=Math.max(0,(g.last||g.base)-g.base);g.day=d;g.base=w;const ks=Object.keys(g.log).sort();while(ks.length>90)delete g.log[ks.shift()]}g.last=w;
 const today=Math.max(0,w-g.base),pc=g.target?Math.min(100,Math.round(today/g.target*100)):0;
 let s=w+' mots · '+n+' messages<br>≈ '+Math.max(1,Math.round(w/200))+' min · <span id="svs"></span>';
 if(Q){HITS=[];S.chapters.forEach(c=>c.msgs.forEach(m=>{if(mt(m).includes(Q))HITS.push({c:c.id,m:m.id})}));$('#qc').textContent=HITS.length?(hi+1)+'/'+HITS.length:'0'}else{HITS=[];hi=-1;$('#qc').textContent=''}
 const b=$('#stat');b.innerHTML=s+'<div class="goal" title="Aujourd’hui : '+today+' / '+g.target+' mots"><i style="width:'+pc+'%"></i></div>';b.title='Aujourd’hui : '+today+' / '+g.target+' mots — cliquer pour les statistiques';
 $$('[data-n]').forEach(e=>{const c=S.chapters.find(k=>k.id===e.dataset.n);if(c)e.textContent=c.msgs.filter(m=>m.who!=='note').length});
 const sv=$('#svs');if(sv&&!sv.textContent)sv.textContent=''}
function gotoHit(d){if(!HITS.length)return;hi=(hi+d+HITS.length)%HITS.length;const x=HITS[hi];if(view!=='write')setView('write');
 if(S.cur!==x.c){S.cur=x.c;save();all()}$('#qc').textContent=(hi+1)+'/'+HITS.length;const e=$('[data-mid="'+x.m+'"]');if(e){e.scrollIntoView({block:'center'});e.classList.add('flash');setTimeout(()=>e.classList.remove('flash'),1500)}}

/* ═════ Panneau : chapitres ═════ */
function addChapter(t){mut(()=>{const c={id:uid(),title:t||'Chapitre '+(S.chapters.length+1),part:'',conv:'',sub:'',status:'draft',note:'',msgs:[]};S.chapters.push(c);S.cur=c.id;SEL.clear()});setView('write');if(!t){$('#ct').focus();$('#ct').select()}}
function goChap(id){S.cur=id;SEL.clear();INS=null;save();if(view==='plan'||view==='book')view='write';setView(view);all()}
function mvChap(i,d){const j=i+d;if(j<0||j>=S.chapters.length)return;mut(()=>{const a=S.chapters;[a[i],a[j]]=[a[j],a[i]]})}
function dupChap(c){mut(()=>{const k=JSON.parse(JSON.stringify(c));k.id=uid();k.title=(c.title||'Chapitre')+' (copie)';k.msgs.forEach(m=>m.id=uid());S.chapters.splice(S.chapters.indexOf(c)+1,0,k);S.cur=k.id})}
async function delChap(c){if(S.chapters.length<2){toast('Un livre garde au moins un chapitre.');return}
 if(!await sure('Supprimer « '+(c.title||'Sans titre')+' » et ses '+c.msgs.length+' éléments ?'))return;
 mut(()=>{S.chapters.splice(S.chapters.indexOf(c),1);if(S.cur===c.id)S.cur=S.chapters[0].id});toast('Chapitre supprimé','Annuler',undo)}
function mergeChap(i){if(i<1)return;mut(()=>{const a=S.chapters[i-1],b=S.chapters[i];a.msgs.push(...b.msgs);S.chapters.splice(i,1);S.cur=a.id})}
function cycleStatus(c){mut(()=>{c.status=STORD[(STORD.indexOf(c.status)+1)%3]})}
async function chapProps(c){const r=await ask('Propriétés du chapitre',[{k:'title',l:'Titre',v:c.title},{k:'part',l:'Partie (titre de partie affiché avant ce chapitre)',v:c.part,ph:'ex. Partie I — L’été'},{k:'conv',l:'Nom de la conversation (en-tête)',v:c.conv,ph:'ex. Groupe Famille'},{k:'parts',l:'Participants affichés en en-tête (noms séparés par des virgules ; vide = auto)',v:c.parts,ph:'ex. Léa, Tom'},{k:'sub',l:'Sous-titre de la conversation',v:c.sub,ph:'ex. en ligne'},{k:'status',l:'Statut',t:'select',o:STORD.map(k=>[k,STAT[k]]),v:c.status},{k:'note',l:'Note (non imprimée)',t:'area',rows:3,v:c.note}].concat(S.kind==='spell'?[{k:'mood',l:'Ambiance de ce chapitre',t:'select',o:[['','Ambiance du livre'],...Object.entries(SPELL_THEMES).map(([k,v])=>[k,v.n])],v:c.mood||''}]:[]),'Enregistrer');
 if(r)mut(()=>Object.assign(c,r))}
function chapMenu(a,c){const i=S.chapters.indexOf(c);menu(a,[['Propriétés…',()=>chapProps(c)],S.kind==='sms'?['Ajouter une conversation…',()=>{S.cur=c.id;addConv()}]:null,S.kind==='sms'?['Exporter en vidéo MP4…',()=>{S.cur=c.id;exportVideo()}]:null,['Dupliquer',()=>dupChap(c)],i>0?['Fusionner avec le précédent',()=>mergeChap(i)]:null,['Changer le statut ('+STAT[c.status]+')',()=>cycleStatus(c)],['Supprimer',()=>delChap(c),1]])}
function pChaps(){const L=$('#chaps');L.replaceChildren();let lp=null;
 S.chapters.forEach((c,i)=>{if(c.part&&c.part!==lp)L.append(h('div',{class:'part'},c.part));lp=c.part;
  const row=h('div',{class:'row crow',draggable:true,'data-c':c.id,
   ondragstart:e=>{if(DRAG)return;DRAGC=c.id;e.dataTransfer.setData('text/plain','c:'+c.id)},ondragend:()=>{DRAGC=null;clearDrop()},
   ondragover:e=>{if(DRAG||DRAGC){e.preventDefault();clearDrop();row.classList.add('dz')}},
   ondrop:e=>{e.preventDefault();clearDrop();if(DRAG){const ids=DRAG;DRAG=null;moveMsgs(ids,c.id)}else if(DRAGC&&DRAGC!==c.id){const id=DRAGC;DRAGC=null;mut(()=>{const a=S.chapters,f=a.findIndex(x=>x.id===id),[m]=a.splice(f,1);a.splice(a.findIndex(x=>x.id===c.id),0,m)})}}},[
   h('button',{class:'chap'+(c.id===S.cur?' on':''),onclick:()=>goChap(c.id)},[h('span',{class:'sd s-'+c.status,title:STAT[c.status]}),h('span',{class:'tt'},c.title||'Sans titre'),h('small',{'data-n':c.id},String(c.msgs.filter(m=>m.who!=='note'&&m.who!=='conv').length))]),
   h('button',{class:'mini',title:'Monter','aria-label':'Monter',onclick:()=>mvChap(i,-1)},'↑'),h('button',{class:'mini',title:'Descendre','aria-label':'Descendre',onclick:()=>mvChap(i,1)},'↓'),
   h('button',{class:'mini',title:'Plus d’options','aria-label':'Plus d’options',onclick:e=>chapMenu(e.currentTarget,c)},'⋯')]);
  L.append(row);if(S.kind==='sms'&&c.msgs.some(m=>m.who==='conv'))L.append(convList(c,false))})}

/* ═════ Panneau : personnages ═════ */
async function avatarDlg(c){const em=h('input',{type:'text',value:c.emoji,placeholder:'Emoji (ex. 🦊) — ou laisser vide pour l’initiale',maxlength:4});
 let img=null,rm=false;const info=h('div',{class:'small'},c.av?'Une photo est définie.':'Aucune photo.');
 const up=h('button',{type:'button',class:'btn',onclick:async()=>{const f=(await pickFile('image/*'))[0];if(f){try{img=await readImg(f,160,.85);info.textContent='Nouvelle photo choisie.';rm=false}catch(e){info.textContent='Image illisible.'}}}},'Choisir une photo…');
 const no=h('button',{type:'button',class:'btn',onclick:()=>{img=null;rm=true;info.textContent='La photo sera retirée.'}},'Retirer la photo');
 const body=h('div',{},[h('label',{},['Emoji',em]),h('div',{style:'display:flex;gap:8px;margin-top:10px'},[up,no]),info]);
 if(!await modal('Avatar de '+c.name,body,{ok:'Enregistrer'}))return;
 mut(()=>{c.emoji=em.value.trim();if(img)c.av=addAsset(img);else if(rm)c.av=''})}
async function delChar(c){if(S.chars.length<2){toast('Gardez au moins un personnage.');return}
 const n=S.chapters.reduce((a,k)=>a+k.msgs.filter(m=>m.who===c.id).length,0);
 const r=await ask('Supprimer '+c.name,[{k:'to',l:n?'Que faire de ses '+n+' messages ?':'Confirmer la suppression',t:'select',o:[['del','Supprimer ses messages'],...S.chars.filter(x=>x.id!==c.id).map(x=>[x.id,'Les attribuer à '+x.name])],v:'del'}],'Supprimer');if(!r)return;
 mut(()=>{S.chapters.forEach(k=>{if(r.to==='del')k.msgs=k.msgs.filter(m=>m.who!==c.id);else k.msgs.forEach(m=>{if(m.who===c.id)m.who=r.to})});S.chars=S.chars.filter(x=>x.id!==c.id)});back()}
function pChars(){const C=$('#chars');C.replaceChildren();
 S.chars.forEach(c=>{const av=h('button',{class:'avb',title:'Avatar','aria-label':'Avatar de '+c.name,onclick:()=>avatarDlg(c)});av.style.background=c.color;av.style.color=ink(c.color);
  const u=c.av&&A[c.av];if(u)av.append(h('img',{src:u,alt:'',style:'width:100%;height:100%;object-fit:cover'}));else av.textContent=c.emoji||(c.name||'?')[0].toUpperCase();
  C.append(h('div',{class:'cc'},[h('div',{class:'row'},[av,
   h('input',{type:'text',value:c.name,'aria-label':'Nom',onchange:e=>{const v=e.target.value.trim()||'?';mut(()=>{c.name=v},false);chat();chips();apply()}}),
   h('input',{type:'color',value:c.color,'aria-label':'Couleur de '+c.name,oninput:e=>{c.color=e.target.value;av.style.background=c.color;save();if(view==='write')chat();chips()}}),
   h('button',{class:'mini',title:'Côté des bulles (D = droite, G = gauche)',onclick:()=>mut(()=>{c.side=c.side==='right'?'left':'right'})},c.side==='right'?'D':'G'),
   h('button',{class:'mini',title:'Supprimer','aria-label':'Supprimer '+c.name,onclick:()=>delChar(c)},'✕')]),
   h('input',{class:'note',type:'text',value:c.note,placeholder:'Note (âge, caractère…)','aria-label':'Note sur '+c.name,oninput:e=>{c.note=e.target.value;save()}})]))})}

/* ═════ Vue Plan ═════ */
function planView(){const G=$('#pgrid');G.replaceChildren();const f=$('#pf').value;let tot=0;
 S.chapters.forEach((c,i)=>{const ms=c.msgs.filter(m=>m.who!=='note'&&m.who!=='conv'),w=ms.reduce((a,m)=>a+bw(m),0);tot+=w;if(f!=='all'&&c.status!==f)return;
  const ex=ms.filter(m=>m.text||m.a||m.b||m.img).slice(0,3).map(m=>{const x=S.kind==='sms'?ch(m.who):null;return(x?x.name+' : ':'')+previewText(m).slice(0,70)});
  const card=h('article',{class:'card'+(c.id===S.cur?' cur':''),draggable:true,
   ondragstart:e=>{DRAGC=c.id;e.dataTransfer.setData('text/plain','c:'+c.id)},ondragend:()=>{DRAGC=null;clearDrop()},
   ondragover:e=>{if(DRAGC){e.preventDefault();clearDrop();card.classList.add('dz')}},
   ondrop:e=>{e.preventDefault();clearDrop();if(DRAGC&&DRAGC!==c.id){const id=DRAGC;DRAGC=null;mut(()=>{const a=S.chapters,fi=a.findIndex(x=>x.id===id),[m]=a.splice(fi,1);a.splice(a.findIndex(x=>x.id===c.id),0,m)})}}},[
   c.part?h('div',{class:'ctag'},c.part):null,
   h('div',{class:'ch'},[h('b',{},(i+1)+'. '+(c.title||'Sans titre')),h('button',{class:'st s-'+c.status,title:'Changer le statut',onclick:()=>cycleStatus(c)},STAT[c.status])]),
   h('div',{class:'cm'},ms.length+' messages · '+w+' mots'),(S.kind==='sms'&&c.msgs.some(m=>m.who==='conv'))?convList(c,true):h('div',{class:'cx'},ex.map(t=>h('p',{},t))),c.note?h('div',{class:'cn'},'📝 '+c.note):null,
   h('div',{class:'ca'},[h('button',{onclick:()=>{S.cur=c.id;save();setView('write');all()}},'Ouvrir'),h('button',{onclick:()=>chapProps(c)},'Propriétés'),h('button',{onclick:()=>dupChap(c)},'Dupliquer'),h('button',{class:'dg',onclick:()=>delChap(c)},'Supprimer')])]);
  G.append(card)});
 G.append(h('button',{class:'card addc',onclick:()=>addChapter()},'+ Nouveau chapitre'));
 $('#pinfo').textContent=S.chapters.length+' chapitres · '+tot+' mots'}
$('#pf').onchange=planView;

/* ═════ Vue Lecture animée ═════ */
const RD={els:[],L:[],i:0,run:false,t:0,dot:null,cx:null};
function readView(){stopRead();const c=chap(),P=$('#rpage');P.replaceChildren();const L=c.msgs.filter(m=>m.who!=='note'&&m.who!=='conv'),cx={th:isDark()?DARK:LIGHT,edit:false,msgs:L,src:id=>A[id]||''};
 $('#rpt').replaceChildren(...headEls(c,cx));L.forEach((m,i)=>P.append(node(m,i,L,cx)));RD.els=[...P.children];RD.L=L;RD.cx=cx;RD.i=L.length;$('#rtitle').textContent=c.title;upBtn()}
function upBtn(){$('#rPlay').textContent=RD.run?'⏸ Pause':'▶ Lire'}
function stopRead(){clearTimeout(RD.t);RD.run=false;if(RD.dot){RD.dot.remove();RD.dot=null}if(typeof upBtn==='function'&&$('#rPlay'))upBtn()}
function stepRead(){if(!RD.run)return;if(RD.i>=RD.els.length){stopRead();return}
 const e=RD.els[RD.i],m=RD.L[RD.i],sp=+$('#rsp').value,box=$('#rchat');
 const reveal=()=>{if(!RD.run)return;if(RD.dot){RD.dot.remove();RD.dot=null}e.classList.remove('hid');RD.i++;box.scrollTo({top:box.scrollHeight,behavior:'smooth'});RD.t=setTimeout(stepRead,(500+Math.min(bw(m),40)*90)/sp)};
 if(isChar(m)&&(!m.type||m.type==='text')){const d=node({id:'rdot',who:m.who,type:'typing',text:''},0,[],RD.cx);RD.dot=d;e.before(d);box.scrollTo({top:box.scrollHeight,behavior:'smooth'});RD.t=setTimeout(reveal,(600+Math.min(bw(m),30)*70)/sp)}
 else reveal()}
$('#rPlay').onclick=()=>{if(RD.run){stopRead();return}if(RD.i>=RD.els.length){RD.els.forEach(e=>e.classList.add('hid'));RD.i=0}RD.run=true;upBtn();stepRead()};
$('#rNext').onclick=()=>{stopRead();if(RD.i>=RD.els.length){RD.els.forEach(e=>e.classList.add('hid'));RD.i=0}const e=RD.els[RD.i];if(e){e.classList.remove('hid');RD.i++;$('#rchat').scrollTop=1e7}};
$('#rAll').onclick=()=>{stopRead();RD.els.forEach(e=>e.classList.remove('hid'));RD.i=RD.els.length};

/* ═════ Vue Livre ═════ */
addEventListener('beforeprint',()=>{if(!$('#pr .paged'))printBuild()});
addEventListener('afterprint',()=>{$('#pr').replaceChildren()});

/* ═════ Dialogues ═════ */
function scriptDlg(v){const ta=h('textarea',{'aria-label':'Script',placeholder:'# Chapitre 2\n[Mardi 21:14]\nLéa: salut !\nTom: ça va ?\nLéa: (vocal 0:23)\n* Il pleuvait.\n! Tom a quitté la conversation\n---',style:'min-height:240px'});ta.value=v||'';
 const nc=h('input',{type:'checkbox'}),body=h('div',{},[h('div',{class:'small',style:'color:var(--mute)'},'Une ligne par élément. Les nouveaux noms créent des personnages. # titre = nouveau chapitre. === Léa, Tom = nouvelle conversation (=== reprise Léa, Tom pour la reprendre).'),ta,h('label',{class:'ck'},[nc,'Créer un nouveau chapitre pour ce texte'])]);
 modal('Coller un script',body,{ok:'Ajouter',wide:true}).then(ok=>{if(!ok||!ta.value.trim())return;const n=commit(parseScript(ta.value),{newChap:nc.checked?'Chapitre '+(S.chapters.length+1):null});toast(n+' éléments ajoutés');all()})}
function parseWA(txt){const re=/^‎?\[?(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4}),?\s+(\d{1,2})[:.](\d{2})(?:[:.]\d{2})?\s*([APap]\.?[Mm]\.?)?\]?\s*(?:[-–—]\s*)?([^:]{1,30}?):\s([\s\S]*)$/;
 const out=[];let lastDay='',cur=null;
 txt.split(/\r?\n/).forEach(raw=>{const l=raw.replace(/[‎‏]/g,'');const m=re.exec(l);
  if(m){let hh=+m[4];if(m[6]){const p=/p/i.test(m[6]);if(p&&hh<12)hh+=12;if(!p&&hh===12)hh=0}
   const day=m[1]+'/'+m[2]+'/'+m[3];if(day!==lastDay){out.push({who:'time',text:day});lastDay=day}
   let t=m[8];if(/^<.*(omis|omitted|absent).*>$|^(image|video|vidéo|audio|sticker|GIF) (omis|omitted|absent)/i.test(t.trim()))t='📷 (média non conservé)';
   cur={name:m[7].trim(),text:t,time:pad(hh)+':'+m[5]};out.push(cur)}
  else if(cur&&l.trim())cur.text+='\n'+l});return out}
const looksWA=t=>{const L=t.split(/\r?\n/).filter(x=>x.trim()).slice(0,8);return L.filter(l=>/^‎?\[?\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4},?\s+\d{1,2}[:.]\d{2}/.test(l)).length>=3};
function waDlg(v){const ta=h('textarea',{'aria-label':'Discussion',placeholder:'Collez ici un export WhatsApp (« Exporter la discussion » → sans médias)…',style:'min-height:240px'});ta.value=v||'';
 const f=h('input',{type:'file',accept:'.txt',style:'margin-top:8px'});f.onchange=async()=>{if(f.files[0])ta.value=await f.files[0].text()};
 modal('Importer une discussion WhatsApp',h('div',{},[h('div',{class:'small',style:'color:var(--mute)'},'Les participants deviennent des personnages, les jours des horodatages. Un nouveau chapitre est créé.'),ta,f]),{ok:'Importer',wide:true})
 .then(ok=>{if(!ok)return;const it=parseWA(ta.value);if(!it.length){toast('Format non reconnu.');return}const n=commit(it,{newChap:'Discussion importée'});toast(n+' éléments importés');S.set.times=true;all()})}
async function importFile(f){const txt=await f.text();
 if(/\.json$/i.test(f.name)||txt.trim().startsWith('{')){try{const d=JSON.parse(txt);if(!d.chapters||!d.chars)throw 0;
   if(!await sure('Remplacer le livre actuel par « '+((d.meta&&d.meta.title)||d.title||'sans titre')+' » ? Un point de restauration est créé avant.','Importer'))return;
   await snap('Avant import');mut(()=>{if(d.assets){Object.assign(A,d.assets);dirtyA=true}delete d.assets;S=norm(d)},false);back();toast('Livre importé')}catch(e){toast('Ce fichier n’est pas un livre SMS Book valide.')}return}
 if(looksWA(txt))waDlg(txt);else scriptDlg(txt)}
async function histDlg(){const L=await snaps(),box=h('div');
 const b=h('button',{type:'button',class:'btn',onclick:async()=>{await snap('Point manuel');toast('Point de restauration créé');histDlg.again=true;document.getElementById('mdNo').click();histDlg()}},'Créer un point de restauration maintenant');box.append(b);
 if(!L.length)box.append(h('p',{class:'small',style:'color:var(--mute)'},'Aucune version pour le moment. Elles se créent toutes les 4 minutes en cas de modification.'));
 L.forEach((e,i)=>box.append(h('div',{class:'hrow'},[h('span',{},[new Date(e.t).toLocaleString('fr-FR')+' · '+e.label+' · '+e.w+' mots']),
  h('button',{type:'button',class:'btn',onclick:async()=>{await snap('Avant restauration');hist.push(JSON.stringify(S));S=norm(JSON.parse(e.js));back();document.getElementById('mdNo').click();toast('Version restaurée')}},'Restaurer'),
  h('button',{type:'button',class:'btn',onclick:async()=>{L.splice(i,1);await DB.set('s_'+BID,L);document.getElementById('mdNo').click();histDlg()}},'✕')])));
 modal('Historique des versions',box,{ok:false,wide:true})}
function statsDlg(){const box=h('div'),tot=words(),g=S.goal,today=Math.max(0,tot-g.base);
 let n=0;S.chapters.forEach(c=>n+=c.msgs.filter(m=>m.who!=='note').length);
 let streak=0;const d=new Date();for(let k=0;k<90;k++){const key=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());const v=key===dayKey()?today:(g.log[key]||0);if(v>=g.target&&g.target>0)streak++;else if(k>0)break;d.setDate(d.getDate()-1)}
 box.append(h('div',{class:'sgrid'},[['Mots',tot],['Messages',n],['Lecture',Math.max(1,Math.round(tot/200))+' min'],['Série 🔥',streak+' j']].map(([l,v])=>h('div',{},[h('b',{},String(v)),l]))));
 box.append(h('p',{},'Aujourd’hui : '+today+' / '+g.target+' mots'),h('div',{class:'bar'},[h('i',{style:'width:'+Math.min(100,g.target?today/g.target*100:0)+'%'})]));
 box.append(h('h4',{},'Par chapitre'));const mx=Math.max(1,...S.chapters.map(c=>c.msgs.reduce((a,m)=>a+(m.who==='note'?0:bw(m)),0)));
 S.chapters.forEach(c=>{const w=c.msgs.reduce((a,m)=>a+(m.who==='note'?0:bw(m)),0);box.append(h('div',{class:'srow'},[h('span',{},c.title||'Sans titre'),h('div',{class:'bar'},[h('i',{style:'width:'+w/mx*100+'%'})]),h('span',{},w+' mots')]))});
 if(S.kind==='sms')box.append(h('h4',{},'Par personnage'));const cw=S.chars.map(c=>({c,w:S.chapters.reduce((a,k)=>a+k.msgs.filter(m=>m.who===c.id).reduce((b,m)=>b+bw(m),0),0),n:S.chapters.reduce((a,k)=>a+k.msgs.filter(m=>m.who===c.id).length,0)})),cm=Math.max(1,...cw.map(x=>x.w));
 if(S.kind==='sms')cw.forEach(x=>box.append(h('div',{class:'srow'},[h('span',{},x.c.name),h('div',{class:'bar'},[h('i',{style:'width:'+x.w/cm*100+'%;background:'+x.c.color})]),h('span',{},x.w+' mots · '+x.n+' msg')])));
 modal('Statistiques',box,{ok:false,wide:true})}
function shortcuts(){const R=[['Entrée','Envoyer (Maj+Entrée : nouvelle ligne)'],['Tab','Changer d’expéditeur'],['Alt + 1…9','Choisir le personnage n°'],['Ctrl+B / Ctrl+I','Gras / italique (sur le texte sélectionné)'],['Ctrl+K','Palette de commandes'],['Ctrl+F','Rechercher · Entrée : résultat suivant'],['Ctrl+H','Rechercher / remplacer'],['Ctrl+Z / Ctrl+Maj+Z','Annuler / rétablir'],['Ctrl+S','Créer un point de restauration'],['Ctrl+P','Imprimer / PDF'],['Ctrl+.','Mode concentration'],['Alt+← / →','Chapitre précédent / suivant'],['Clic sur une bulle','Modifier le texte (Entrée valide, Échap annule)'],['Ctrl/Maj + clic','Sélectionner plusieurs messages'],['⋮⋮ (poignée)','Glisser un message : dans le chapitre, ou sur un chapitre du panneau'],
 ['/t 21:14','Horodatage'],['/n texte','Narration'],['/s texte','Message système'],['/sep','Séparateur de scène'],['/note texte','Note d’auteur'],['/chap Titre','Nouveau chapitre'],['/v 0:23  /appel 3:12  /visio  /lieu Nom  /fichier nom  /lien Titre|site','Messages spéciaux'],['Nom: texte','Écrit en tant que ce personnage']];
 modal('Raccourcis et commandes',h('div',{},R.map(([k,v])=>h('div',{class:'hrow'},[h('kbd',{},k),h('span',{},v)]))),{ok:false,wide:true})}
async function replaceDlg(){const f=form([{k:'a',l:'Rechercher',v:Q?$('#q').value:''},{k:'b',l:'Remplacer par',v:''},{k:'cs',t:'check',l:'Respecter la casse'},{k:'w',t:'check',l:'Mots entiers'},{k:'sc',l:'Portée',t:'select',o:[['all','Tout le livre'],['cur','Chapitre courant']],v:'all'},{k:'who',l:'Limiter à',t:'select',o:[['','Tous'],...S.chars.map(c=>[c.id,c.name]),['narr','Narration']],v:''}]);
 if(!await modal('Rechercher / remplacer',f.el,{ok:'Tout remplacer'}))return;const v=f.get();if(!v.a)return;
 const e=v.a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),re=new RegExp(v.w?'(?<![\\p{L}\\p{N}])'+e+'(?![\\p{L}\\p{N}])':e,'gu'+(v.cs?'':'i'));let n=0;
 mut(()=>{S.chapters.filter(c=>v.sc==='all'||c.id===S.cur).forEach(c=>c.msgs.forEach(m=>{if(v.who&&m.who!==v.who)return;['text','a','b','cap'].forEach(f=>{if(m[f])m[f]=m[f].replace(re,()=>{n++;return v.b})})}))});
 toast(n+' remplacement'+(n>1?'s':''),'Annuler',undo)}

/* ═════ Palette de commandes ═════ */
let palI=0,palL=[];
function cmds(){const o=[],a=(l,f)=>o.push({l,f});
 [['write','Écrire'],['plan','Plan'],['read','Lecture animée'],['book','Aperçu du livre']].forEach(([v,l])=>a('Vue : '+l,()=>setView(v)));
 a('Nouveau chapitre',()=>addChapter());if(S.kind==='sms')a('Nouveau personnage',()=>$('#addChar').click());a('Bibliothèque de livres…',libDlg);a('Mode sans distraction',focusToggle);a('Aperçu : double page',()=>{BKM='spread';setView('book')});a('Aperçu : pages',()=>{BKM='pages';setView('book')});a('Nouveau livre…',newBookDlg);
 a('Coller un script…',()=>scriptDlg(''));a('Importer une discussion WhatsApp…',()=>waDlg(''));a('Rechercher / remplacer…',replaceDlg);
 a('Exporter : PDF (imprimer)',doPrint);a('Exporter : EPUB',exportEPUB);a('Exporter : vidéo MP4 (conversation animée)',exportVideo);a('Exporter : page web (.html)',exportHTML);a('Exporter : Markdown',()=>dl(slug()+'.md',mdText(),'text/markdown'));a('Exporter : script texte',()=>dl(slug()+'.txt',scriptText(),'text/plain'));a('Exporter : livre (.json)',exportJSON);
 a('Historique des versions',histDlg);a('Statistiques',statsDlg);a('Raccourcis clavier',shortcuts);a('Mode concentration',()=>{fm=!fm;apply()});
 [['auto','Automatique'],['light','Clair'],['dark','Sombre']].forEach(([k,l])=>a('Thème : '+l,()=>{S.set.theme=k;onSet('set.theme')}));
 (S.kind==='sms'?[['ios','Messages'],['wa','Discussion'],['msn','Messenger'],['disc','Salon'],['min','Papier N&B'],['retro','SMS rétro']]:[]).forEach(([k,l])=>a('Style de bulles : '+l,()=>{S.set.style=k;onSet('set.style')}));
 S.chapters.forEach(c=>a('Aller au chapitre : '+(c.title||'Sans titre'),()=>goChap(c.id)));
 (S.kind==='sms'?S.chars:[]).forEach(c=>a('Écrire en tant que : '+c.name,()=>{who=c.id;setView('write');chips();$('#ta').focus()}));return o}
const nz=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function palRender(){const q=nz($('#pi').value.trim()),L=$('#pl');L.replaceChildren();palL=cmds().filter(c=>!q||q.split(/\s+/).every(w=>nz(c.l).includes(w))).slice(0,40);if(palI>=palL.length)palI=0;
 palL.forEach((c,i)=>L.append(h('button',{class:i===palI?'on':'',onclick:()=>palRun(i)},c.l)))}
function palRun(i){const c=palL[i];$('#pal').close();if(c)c.f()}
function openPal(){const d=$('#pal');palI=0;$('#pi').value='';palRender();d.showModal();$('#pi').focus()}
$('#pi').oninput=()=>{palI=0;palRender()};
$('#pi').onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();palI=Math.min(palL.length-1,palI+1);palRender()}else if(e.key==='ArrowUp'){e.preventDefault();palI=Math.max(0,palI-1);palRender()}else if(e.key==='Enter'){e.preventDefault();palRun(palI)}};
$('#pal').addEventListener('click',e=>{if(e.target===$('#pal'))$('#pal').close()});

/* ═════ Export JSON, branchements ═════ */
function exportJSON(){S.exp=Date.now();save();dl(slug()+'.json',JSON.stringify(Object.assign({},S,{assets:usedAssets()})),'application/json');expInfo()}
function expInfo(){$('#expInfo').textContent=S.exp?'Dernier export .json : '+new Date(S.exp).toLocaleString('fr-FR'):'Aucun export .json pour le moment.'}
$('#addChap').onclick=()=>addChapter();
$('#addChar').onclick=()=>{mut(()=>{const c={id:uid(),name:'Personnage '+(S.chars.length+1),color:PAL[S.chars.length%PAL.length],side:S.chars.length%2?'left':'right',emoji:'',av:'',note:''};S.chars.push(c);who=c.id});setTab(1)};
$('#bPrint').onclick=$('#bPrint2').onclick=doPrint;
$('#bMp4').onclick=exportVideo;$('#bEpub').onclick=exportEPUB;$('#bHtmlP').onclick=exportPagedHTML;$('#bKdpSvg').onclick=kdpSvg;$('#bKdpCalc').onclick=()=>{kdpRecalc();toast('Pagination recalculée')};$$('#bkMode button').forEach(b=>b.onclick=()=>{BKM=b.dataset.m;bookView()});$('#bkZ').oninput=e=>{BKZ=+e.target.value;bookView()};$('#bHtml').onclick=exportHTML;$('#bMd').onclick=()=>dl(slug()+'.md',mdText(),'text/markdown');$('#bTxt').onclick=()=>dl(slug()+'.txt',scriptText(),'text/plain');$('#bJson').onclick=exportJSON;
$('#bImp').onclick=async()=>{const f=(await pickFile('.json,.txt,.md'))[0];if(f)importFile(f)};
$('#bScript').onclick=()=>scriptDlg('');$('#bWA').onclick=()=>waDlg('');$('#bHist').onclick=histDlg;$('#bStats').onclick=$('#stat').onclick=statsDlg;$('#bKeys').onclick=shortcuts;$('#bNew').onclick=newBookDlg;$('#bHome').onclick=()=>homeShow();$('#bLib').onclick=$('#bLib2').onclick=libDlg;$('#bK').onclick=openPal;
$('#bCvImg').onclick=async()=>{const f=(await pickFile('image/*'))[0];if(!f)return;try{const u=await readImg(f,1200,.88);S.meta.cover.img=addAsset(u);S.meta.cover.style='image';onSet('meta.cover.img');toast('Image de couverture définie')}catch(e){toast('Image illisible.')}};
$('#bCvNo').onclick=()=>{S.meta.cover.img='';if(S.meta.cover.style==='image')S.meta.cover.style='bulles';onSet('meta.cover.img')};
$('#bWall').onclick=async()=>{const f=(await pickFile('image/*'))[0];if(!f)return;try{const u=await readImg(f,900,.8);S.set.wallImg=addAsset(u);S.set.wall='image';onSet('set.wall')}catch(e){toast('Image illisible.')}};
$('#bWallNo').onclick=()=>{S.set.wallImg='';if(S.set.wall==='image')S.set.wall='none';onSet('set.wall')};
$('#bFm').onclick=()=>{if(innerWidth<=900)document.body.classList.toggle('sbo');else{fm=!fm;apply()}};
$('#bUn').onclick=undo;$('#bRe').onclick=redoF;
$('#ct').oninput=e=>{chap().title=e.target.value;save()};$('#ct').onchange=()=>{pChaps();stat()};
$('#q').oninput=e=>{Q=e.target.value.trim().toLowerCase();hi=-1;if(view!=='write'&&Q)setView('write');else renderView();if(Q&&HITS.length)gotoHit(1)};
$('#q').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();gotoHit(e.shiftKey?-1:1)}else if(e.key==='Escape'){e.target.value='';e.target.oninput({target:e.target})}};
$('#qn').onclick=()=>gotoHit(1);$('#qp').onclick=()=>gotoHit(-1);
$('#go').onclick=send;$('#bTy').onclick=()=>{if(!ch(who)){toast('Choisissez un personnage pour afficher « … ».');return}push({type:'typing',text:''})};
$('#bPlus').onclick=e=>insertMenu(e.currentTarget);
$('#ta').oninput=e=>{const t=e.target;t.style.height='auto';t.style.height=Math.min(t.scrollHeight,140)+'px'};
$('#ta').onkeydown=e=>{
 if(e.key==='Enter'){const ctrl=e.ctrlKey||e.metaKey;if(S.set.enter?(!e.shiftKey&&!e.isComposing):ctrl){e.preventDefault();send()}}
 else if(e.key==='Tab'&&!e.shiftKey){e.preventDefault();const ids=[...S.chars.map(c=>c.id),'narr','time','sys','rcpt','note'];who=ids[(ids.indexOf(who)+1)%ids.length];chips()}
 else if((e.ctrlKey||e.metaKey)&&(e.key==='b'||e.key==='i')){e.preventDefault();const t=e.target,a=t.selectionStart,b=t.selectionEnd,mk=e.key==='b'?'**':'*';if(a!==b){t.setRangeText(mk+t.value.slice(a,b)+mk,a,b,'end')}}};
$('#ta').onpaste=e=>{const f=[...(e.clipboardData?e.clipboardData.files:[])].find(x=>x.type.startsWith('image/'));if(f){e.preventDefault();sendImage(f)}};
const chatEl=$('#chat');
chatEl.ondragover=e=>{if(!DRAG&&e.dataTransfer&&[...e.dataTransfer.types].includes('Files'))e.preventDefault()};
chatEl.ondrop=e=>{if(DRAG||!e.dataTransfer||!e.dataTransfer.files.length)return;e.preventDefault();[...e.dataTransfer.files].filter(f=>f.type.startsWith('image/')).forEach(sendImage)};
addEventListener('keydown',e=>{const k=e.key.toLowerCase(),m=e.ctrlKey||e.metaKey,ed=/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable;
 if(m&&k==='k'){e.preventDefault();openPal()}
 else if(m&&k==='f'){e.preventDefault();$('#q').focus();$('#q').select()}
 else if(m&&k==='h'){e.preventDefault();replaceDlg()}
 else if(m&&k==='s'){e.preventDefault();snap('Point manuel').then(()=>toast('Point de restauration créé'));flush()}
 else if(m&&k==='p'){e.preventDefault();doPrint()}
 else if(m&&k==='.'){e.preventDefault();fm=!fm;apply()}
 else if(m&&k==='z'&&!ed){e.preventDefault();e.shiftKey?redoF():undo()}
 else if(m&&k==='y'&&!ed){e.preventDefault();redoF()}
 else if(e.altKey&&/^[1-9]$/.test(e.key)){const c=S.chars[+e.key-1];if(c){e.preventDefault();who=c.id;chips()}}
 else if(e.altKey&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();const i=S.chapters.findIndex(c=>c.id===S.cur),j=i+(e.key==='ArrowLeft'?-1:1);if(S.chapters[j])goChap(S.chapters[j].id)}
 else if(e.key==='Escape'){if(!$('#pop').hidden)closePop();else if(SEL.size){SEL.clear();chat()}}});
matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{if(S.set.theme==='auto'){apply();renderView()}});
addEventListener('visibilitychange',()=>{if(document.hidden)flush()});addEventListener('beforeunload',()=>{flush()});


/* ═════ Conversations ═════ */
function convLabel(mk,c){const sg=convSegs(c).find(x=>x.mk===mk);const nm=mk.name||convParts({parts:mk.parts,msgs:sg?sg.msgs:[]}).map(x=>x.name).join(' et ');return nm||'Conversation'}
function convBanner(m,cx){const c=S.chapters.find(x=>x.msgs.includes(m))||chap(),res=convIsResume(m),n=convSegs(c).filter(x=>x.mk).findIndex(x=>x.mk===m)+1;
 const el=h('div',{class:'it c','data-mid':m.id}),b=h('div',{class:'cvb'},[h('span',{class:'cvn',style:'font-weight:600;margin-right:8px'},'💬 '+convLabel(m,c)),h('small',{style:'opacity:.7'},(res?'↺ reprise · ':'')+'conversation '+n+(m.sub?' · '+m.sub:''))]);
 b.setAttribute('style','border:1px dashed '+cx.th.line+';border-radius:12px;padding:7px 14px;text-align:center;font-size:.85em;color:'+cx.th.ink+';background:'+cx.th.panel);
 el.append(b);
 if(cx.edit)el.append(h('div',{class:'ctl'},[h('button',{title:'Modifier la conversation',onclick:e=>{e.stopPropagation();editConv(m)}},'✎'),
  h('button',{title:'Monter toute la conversation',onclick:e=>{e.stopPropagation();mvConv(c,m,-1)}},'⇧'),h('button',{title:'Descendre toute la conversation',onclick:e=>{e.stopPropagation();mvConv(c,m,1)}},'⇩'),
  h('button',{title:'Supprimer le marqueur (fusionne avec la conversation précédente)',onclick:e=>{e.stopPropagation();mut(()=>{c.msgs.splice(c.msgs.indexOf(m),1)})}},'✕')]));
 return el}
function mvConv(c,mk,d){const sg=convSegs(c),i=sg.findIndex(x=>x.mk===mk),j=i+d;if(i<0||j<0||j>=sg.length||(!sg[j].mk)){toast('Déjà en première ou dernière position.');return}
 mut(()=>{[sg[i],sg[j]]=[sg[j],sg[i]];c.msgs=[].concat(...sg.map(x=>(x.mk?[x.mk]:[]).concat(x.msgs)))})}
async function editConv(m){const r=await ask('Conversation',[{k:'name',l:'Nom affiché en en-tête (vide = noms des participants)',v:m.name||''},{k:'parts',l:'Participants (noms séparés par des virgules ; vide = auto)',v:m.parts||'',ph:'ex. Chloé, Eliot'},{k:'sub',l:'Sous-titre',v:m.sub||''},{k:'al',l:'Noms affichés dans cette conversation (ex. Mathis = Numéro Inconnu)',v:aliasTxt(m)},{k:'ctx',l:'Messages d’avant rappelés en PDF/web si c’est une reprise',t:'number',v:m.ctx==null?3:m.ctx}],'Enregistrer');
 if(r)mut(()=>{m.name=r.name;m.parts=r.parts;m.sub=r.sub;m.alias=aliasParse(r.al);m.ctx=Math.max(0,Math.min(30,r.ctx|0))})}
async function addConv(o){const c=chap();if(!c)return;o=o||{};
 const th=[];convMarkers().forEach(x=>{if(!th.some(t=>t.thread===x.m.thread))th.push({thread:x.m.thread,m:x.m,c:x.c})});
 let thread=null,base=null;
 if(o.resume||(th.length&&!o.parts)){
  if(!th.length){toast('Aucune conversation existante à reprendre pour l’instant.');return}
  const r=await ask('Nouvelle conversation ou reprise ?',[{k:'t',l:'Conversation',t:'select',o:[['',  'Nouvelle conversation']].concat(th.map(t=>[t.thread,'↺ Reprendre : '+convLabel(t.m,t.c)+' (chap. « '+(t.c.title||'sans titre')+' »)'])),v:o.resume?th[th.length-1].thread:''}],'Suivant');
  if(!r)return;if(r.t){thread=r.t;base=th.find(t=>t.thread===r.t).m}}
 const d={name:base?base.name:'',parts:base?base.parts:(o.parts||''),sub:base?base.sub:'',ctx:3};
 const r=await ask(base?'Reprise de la conversation':'Nouvelle conversation',[{k:'name',l:'Nom affiché en en-tête (vide = noms des participants)',v:d.name},{k:'parts',l:'Participants (noms séparés par des virgules ; vide = auto)',v:d.parts,ph:'ex. Chloé, Eliot'},{k:'sub',l:'Sous-titre',v:d.sub}].concat(base?[{k:'ctx',l:'Messages d’avant à rappeler (PDF/web) — la vidéo rejoue toute la conversation',t:'number',v:3}]:[]),'Ajouter');
 if(!r)return;
 mut(()=>{if(!c.msgs.some(x=>x.who==='conv')&&c.msgs.length){const id0=uid();c.msgs.unshift({id:id0,who:'conv',text:'',thread:id0,name:c.conv||'',parts:c.parts||'',sub:c.sub||'',ctx:3})}
  const id=uid();c.msgs.push({id,who:'conv',text:'',thread:thread||id,name:r.name,parts:r.parts,sub:r.sub,alias:base&&base.alias?Object.assign({},base.alias):{},ctx:base?Math.max(0,Math.min(30,r.ctx|0)):3})});
 toast(base?'Reprise ajoutée à la fin du chapitre. Écrivez la suite de la conversation.':'Nouvelle conversation ajoutée à la fin du chapitre.')}

function goConv(c,mk){S.cur=c.id;SEL.clear();INS=null;save();view='write';setView('write');all();setTimeout(()=>{const n=document.querySelector('#chat [data-mid="'+mk.id+'"]');if(n)n.scrollIntoView({block:'start'})},80)}
function convList(c,big){const box=h('div',{class:'convs'});
 convSegs(c).forEach((sg,i,a)=>{if(!sg.mk)return;const n=sg.msgs.filter(x=>x.who!=='note').length,res=convIsResume(sg.mk);
  const row=h('div',{class:'crv'},[h('button',{class:'cvl',title:'Aller à cette conversation',onclick:e=>{e.stopPropagation();goConv(c,sg.mk)}},[h('span',{},(res?'↺ ':'💬 ')+convLabel(sg.mk,c)),h('small',{},n+' msg')]),
   h('button',{class:'mini',title:'Monter la conversation','aria-label':'Monter la conversation',onclick:e=>{e.stopPropagation();mvConv(c,sg.mk,-1)}},'↑'),
   h('button',{class:'mini',title:'Descendre la conversation','aria-label':'Descendre la conversation',onclick:e=>{e.stopPropagation();mvConv(c,sg.mk,1)}},'↓')]);
  box.append(row);
  if(big){const ex=sg.msgs.filter(m=>m.text).slice(0,2).map(m=>{const x=ch(m.who);return(x?x.name+' : ':'')+previewText(m).slice(0,60)});if(ex.length)box.append(h('div',{class:'cx'},ex.map(t=>h('p',{},t))))}});
 box.append(h('button',{class:'cvadd',onclick:e=>{e.stopPropagation();S.cur=c.id;addConv()}},'＋ Conversation'));return box}
/* ═════ Types de livre ═════ */
const KINDS={
 sms:{n:'Roman SMS',i:'💬',d:'Conversations en bulles, comme sur un téléphone.'},
 journal:{n:'Journal manuscrit',i:'📔',d:'Écriture à la main, Polaroïds qui se développent et vieillissent, couleurs qui évoluent au fil des pages.'},
 spell:{n:'Livre ensorcelé',i:'🪄',d:'La typographie et la mise en page réagissent au texte : effets, ambiances, particules.'},
 ana:{n:'Livre anaglyphe',i:'🕶️',d:'Double exposition rouge / cyan : un texte secret, révélé par les lunettes.'}};
let XCLEAN=null;
const jProg=()=>(c,k,n)=>{const N=S.chapters.length,i=Math.max(0,S.chapters.indexOf(c)),f=n>1?(k||0)/(n-1):0;return Math.max(0,Math.min(1,(i+f)/N))};
function starter(k){const T=(t,o)=>Object.assign({id:uid(),who:'x',type:'text',text:t},o||{}),X=o=>Object.assign({id:uid(),who:'x'},o);
 if(KR[k])return KR[k].starter(T,X);
 if(k==='journal')return[T('Cher journal,\nAujourd’hui j’ai retrouvé la vieille boîte à chaussures du grenier. Dedans : des lettres, des tickets de cinéma et une photo que je n’avais jamais vue.'),X({type:'photo',cap:'Été 1998',img:''}),T('Je ne sais pas encore qui est la fille au bord de l’eau, mais je vais le découvrir.'),T('À demander à Mamie !',{type:'sticky'})];
 if(k==='spell')return[T('La Forêt qui murmure',{type:'title'}),T('Il était une fois, dans un royaume où la nuit tombait plus tôt qu’ailleurs, une petite maison perdue au cœur de la forêt.'),T('Un soir, un [murmure:murmure] glissa sous la porte. Puis un [cri:cri] déchira le silence, et chacun sentit le [tremble:frisson] de la peur.'),T('Mais la [or:lumière] revient toujours.'),X({type:'sep'})];
 if(k==='ana')return[T('Le Livre Double',{type:'title'}),T('Lisez d’abord sans lunettes : ce paragraphe est visible par tous.'),X({type:'dual',a:'Avec le verre cyan, vous lisez ce message rouge.',b:'Avec le verre rouge, une tout autre histoire apparaît…',z:0}),T('Ce texte flotte au-dessus de la page.',{type:'both',z:2})];
 return[]}

/* ═════ Spectre progressif ═════ */
const SPEC_PRE={arc:['Arc-en-ciel',0,300,0,85],aube:['Aube',340,410,10,80],ocean:['Océan',180,260,10,70],feu:['Braise',55,0,15,90],foret:['Forêt',70,150,10,70],mono:['Mono',210,210,0,0]};
const specH=p=>{const s=S.set;return(((s.sh0+(s.sh1-s.sh0)*p)%360)+360)%360};
const specS=p=>{const s=S.set;return s.ss0+(s.ss1-s.ss0)*p};
const specCol=(p,l,a)=>'hsl('+specH(p).toFixed(0)+' '+specS(p).toFixed(0)+'% '+l+'%'+(a==null?'':' / '+a)+')';
function specBar(){const P=$('#specPre');if(!P)return;if(!P.children.length)Object.entries(SPEC_PRE).forEach(([k,v])=>P.append(h('button',{type:'button',onclick:()=>{const s=S.set;[s.sh0,s.sh1,s.ss0,s.ss1]=v.slice(1);onSet('set.sh0')}},v[0])));
 const pv=$('#specPrev');if(pv)pv.style.background='linear-gradient(90deg,'+[0,.2,.4,.6,.8,1].map(p=>specCol(p,S.set.sl+25)).join(',')+')'}

/* ═════ Effets du livre ensorcelé ═════ */
const SPELL_THEMES={
 parchemin:{n:'Parchemin',bg:'#f3e6c8',ink:'#3a2a14',acc:'#8a5a1c',fxo:'#2b2540',bgi:'radial-gradient(ellipse at 50% 20%,rgba(255,255,255,.35),transparent 70%),radial-gradient(ellipse at 50% 120%,rgba(120,70,20,.3),transparent 60%)',pt:'dust'},
 nuit:{n:'Nuit étoilée',bg:'#0f1230',ink:'#e6e8ff',acc:'#9aa8ff',fxo:'#8890d8',bgi:'radial-gradient(ellipse at 50% 0%,rgba(110,120,255,.25),transparent 65%)',pt:'stars'},
 sang:{n:'Cramoisi',bg:'#2a0a0f',ink:'#f3dcd6',acc:'#e0354a',fxo:'#d86a70',bgi:'radial-gradient(ellipse at 50% 110%,rgba(255,60,40,.3),transparent 60%)',pt:'embers'},
 givre:{n:'Givre',bg:'#e8f3fb',ink:'#14324a',acc:'#3d9bd6',fxo:'#26486a',bgi:'linear-gradient(180deg,rgba(255,255,255,.7),transparent 55%)',pt:'snow'},
 foret:{n:'Forêt enchantée',bg:'#0f2418',ink:'#e0f0d8',acc:'#7fd16a',fxo:'#8ab87c',bgi:'radial-gradient(ellipse at 50% 100%,rgba(120,220,100,.22),transparent 60%)',pt:'fly'},
 or:{n:'Or & ivoire',bg:'#fbf4e2',ink:'#2c2410',acc:'#c9a24a',fxo:'#3a3322',bgi:'radial-gradient(ellipse at 50% 0%,rgba(255,215,120,.35),transparent 65%)',pt:'spark'}};
const themeOf=c=>SPELL_THEMES[(c&&c.mood)||S.set.stheme]?((c&&c.mood)||S.set.stheme):'parchemin';
const FXN=['feu','glace','ombre','or','sang','murmure','cri','tremble','vague','magie'];
const FXSPLIT=['tremble','vague','magie'];
const LEX=[['feu',/^(?:feu|flamm|brûl|incend|braise|ardent|embras|volcan)/],['glace',/^(?:glac|givr|froid|neige|gelé|gelée|hiver|frimas)/],['ombre',/^(?:ombr|ténèbr|obscur|noirceur|nuit)/],['or',/^(?:lumi[eè]r|étoile|soleil|doré|dorée|éclat|aurore|lueur|scintill)/],['sang',/^(?:sang|blessur|carmin)/],['murmure',/^(?:murmur|chuchot|souffl|silence)/],['cri',/^(?:cri|cris|crier|cria|criait|crient|hurl|tonnerre|éclair|explos|fracas)$|^(?:hurl|tonnerre|explos|fracas)/],['tremble',/^(?:trembl|frisson|terreur|effroi|épouvant|peur)/],['vague',/^(?:vague|flot|océan|marée)/],['magie',/^(?:magi|sortil|enchant|sorcier|sorcière|rune|grimoire|elfe|fée|dragon)/]];
function fxSpan(fx,txt){const e=h('span',{class:'fx fx-'+fx});if(FXSPLIT.includes(fx)){[...txt].forEach((ch,i)=>e.append(h('i',{style:'--i:'+i},ch===' '?' ':ch)))}else e.textContent=txt;return e}
function autoFx(text){const out=[],re=/[\p{L}’'-]+/gu;let last=0,m;
 while((m=re.exec(text))){const w=m[0].toLowerCase();let fx=null;for(const[k,r]of LEX)if(r.test(w)){fx=k;break}
  if(fx){if(m.index>last)out.push(document.createTextNode(text.slice(last,m.index)));out.push(fxSpan(fx,m[0]));last=m.index+m[0].length}}
 if(last<text.length)out.push(document.createTextNode(text.slice(last)));return out}
function mapTxt(nodes,f){return nodes.flatMap(n=>{if(n.nodeType===3)return f(n.textContent);if(n.childNodes&&n.childNodes.length&&!(n.classList&&n.classList.contains('fx'))){const k=[...n.childNodes];n.replaceChildren(...mapTxt(k,f))}return[n]})}
function spellNodes(text){text=text||'';const auto=S.set.sauto!==false,re=new RegExp('\\[('+FXN.join('|')+'):([^\\]\\n]+)\\]','g'),out=[];let last=0,m;
 const plain=t=>{if(!t)return;const ns=fmtN(t);out.push(...(auto?mapTxt(ns,autoFx):ns))};
 while((m=re.exec(text))){plain(text.slice(last,m.index));out.push(fxSpan(m[1],m[2]));last=m.index+m[0].length}
 plain(text.slice(last));return out}
function spellClass(t){const x=(t||'').trim(),w=wc(x),c=[];if(!x)return'';const L=x.replace(/\[\w+:([^\]]*)\]/g,'$1').replace(/[^\p{L}]/gu,'');
 if(L.length>3&&L===L.toUpperCase())c.push('shout');else if(w<=4&&!/[,;:]/.test(x))c.push('punch');
 if(/!\s*$/.test(x))c.push('exc');if(/\?\s*$/.test(x))c.push('qst');if(/(\.\.\.|…)\s*$/.test(x))c.push('trail');if(/^\s*(—|–|«|- )/.test(x))c.push('dlg');if(w>60)c.push('long');return c.join(' ')}
const fmtN=t=>fmt(t).map(x=>typeof x==='string'?document.createTextNode(x):x);
function wrapWords(nodes){let i=0;const go=ns=>ns.flatMap(n=>{if(n.nodeType===3)return n.textContent.split(/(\s+)/).filter(Boolean).map(w=>{if(/^\s+$/.test(w))return document.createTextNode(w);const e=h('span',{class:'w',style:'--i:'+Math.min(i++,90)});e.textContent=w;return e});const k=[...n.childNodes];n.replaceChildren(...go(k));return[n]});return go(nodes)}
const stripFx=t=>(t||'').replace(new RegExp('\\[(?:'+FXN.join('|')+'):([^\\]]+)\\]','g'),'$1');

/* ═════ Outils d’édition communs ═════ */
async function pickImg(max){const f=(await pickFile('image/*'))[0];if(!f)return null;try{return addAsset(await readImg(f,max||1100,.86))}catch(e){toast('Image illisible.');return null}}
function moveItem(m,d){mut(()=>{const L=chap().msgs,i=L.indexOf(m),j=i+d;if(i<0||j<0||j>=L.length)return;L.splice(i,1);L.splice(j,0,m)})}
function noteEl(m,cx){const e=h('div',{class:'xnote'});e.append(...fmt(m.text||''));editable(e,m,cx,fmt);return e}
function wrapI(el,m,cx){if(m.mir&&el.classList)el.classList.add('mir');if(!cx.edit)return el;
 const b=(t,f,tt)=>h('button',{type:'button',title:tt,'aria-label':tt,onclick:e=>{e.stopPropagation();f(e.currentTarget)}},t);
 return h('div',{class:'xi t-'+(m.type||'text'),'data-id':m.id},[h('div',{class:'xt'},[b('↑',()=>moveItem(m,-1),'Monter'),b('↓',()=>moveItem(m,1),'Descendre'),b('⋯',a=>itemMenu(m,a),'Options')]),el])}
const ITEM_FORMS={
 photo:m=>[{k:'cap',l:'Légende',v:m.cap||''},{k:'tilt',l:'Inclinaison (°)',t:'number',v:m.tilt==null?'':m.tilt},{k:'dev',l:'Développement forcé (0-100, vide = automatique)',t:'number',v:m.dev==null?'':m.dev},{k:'age',l:'Vieillissement forcé (0-100, vide = automatique)',t:'number',v:m.age==null?'':m.age}],
 sticky:m=>[{k:'col',l:'Couleur',t:'select',o:[['','Selon le spectre'],['#fff2a0','Jaune'],['#ffc9d9','Rose'],['#c9e6ff','Bleu'],['#d3f5c3','Vert']],v:m.col||''},{k:'tilt',l:'Inclinaison (°)',t:'number',v:m.tilt==null?'':m.tilt}],
 img:m=>[{k:'cap',l:'Légende',v:m.cap||''},{k:'fl',l:'Disposition',t:'select',o:[['fu','Pleine largeur'],['fl','Flotte à gauche (texte autour)'],['fr','Flotte à droite (texte autour)']],v:m.fl||'fu'},{k:'circ',l:'Image ronde (le texte épouse la forme)',t:'check',v:m.circ},{k:'w',l:'Largeur (%)',t:'number',v:m.w||45}],
 dimg:m=>[{k:'cap',l:'Légende',v:m.cap||''},{k:'z',l:'Relief (−4 à 4)',t:'number',v:m.z==null?'':m.z}],
 both:m=>[{k:'z',l:'Relief (−4 = enfoncé, 4 = flottant)',t:'number',v:m.z==null?'':m.z}],
 dual:m=>[{k:'z',l:'Décalage des couches (0 = superposées)',t:'number',v:m.z==null?'':m.z}],
 title:m=>S.kind==='ana'?[{k:'z',l:'Relief (−4 à 4)',t:'number',v:m.z==null?'':m.z}]:[]};
function itemMenu(m,anchor){const t=m.type||'text',it=[];
 if(ITEM_FORMS[t]&&ITEM_FORMS[t](m).length)it.push(['Propriétés…',async()=>{const v=await ask('Propriétés',ITEM_FORMS[t](m),'Appliquer');if(!v)return;mut(()=>{Object.keys(v).forEach(k=>{if(v[k]===''&&['tilt','dev','age','z'].includes(k))delete m[k];else m[k]=v[k]})})}]);
 if(['photo','img','dimg'].includes(t))it.push(['Changer l’image…',async()=>{const id=await pickImg();if(id)mut(()=>{m.img=id})}]);
 if(t==='dimg')it.push(['Seconde image (double exposition)…',async()=>{const id=await pickImg();if(id)mut(()=>{m.img2=id})}]);
 if(t==='dimg'&&m.img2)it.push(['Retirer la seconde image',()=>mut(()=>{delete m.img2})]);
 const conv=S.kind==='journal'?[['text','Texte'],['sticky','Post-it']]:S.kind==='spell'?[['text','Paragraphe'],['title','Titre'],['quote','Citation']]:S.kind==='ana'?[['text','Texte'],['both','Texte en relief'],['title','Titre']]:[];
 if(conv.some(c=>c[0]===t))conv.filter(c=>c[0]!==t).forEach(([k,l])=>it.push(['Convertir en : '+l,()=>mut(()=>{m.type=k;if(!m.text&&m.a)m.text=m.a})]));
 if(t==='dual')it.push(['Convertir en : Texte en relief',()=>mut(()=>{m.type='both';m.text=m.a||m.b||''})]);
if(S.kind!=='sms')it.push([m.mir?'Remettre à l’endroit (miroir)':'🪞 Retourner en miroir',()=>mut(()=>{m.mir=!m.mir})]);
 it.push(['Dupliquer',()=>mut(()=>{const L=chap().msgs,k=JSON.parse(JSON.stringify(m));k.id=uid();L.splice(L.indexOf(m)+1,0,k)})]);
 it.push(['Supprimer',()=>{mut(()=>{const L=chap().msgs;L.splice(L.indexOf(m),1)});toast('Élément supprimé','Annuler',undo)},true]);
 menu(anchor,it)}

/* ═════ Journal manuscrit ═════ */
const JF={caveat:"'SBS Caveat',cursive",apple:"'SBS Apple',cursive",beanie:"'SBS Beanie',cursive"};
function journalChapter(c,cx){const s=S.set,L=cx.msgs,n=L.length,P=cx.prog,pm=P(c,Math.max(0,(n-1)/2),n);
 const ink=pk=>s.spec&&s.specInk?specCol(pk,Math.min(s.sl,42)):s.jink;
 const paper=s.spec&&s.specPaper?'hsl('+specH(pm).toFixed(0)+' '+(specS(pm)*.45).toFixed(0)+'% 95%)':'#fbf7ec';
 const root=h('article',{class:'xc xc-journal'+(s.jline&&s.jpaper==='ruled'?' ln':''),'data-pa':s.jpaper,'data-anim':cx.anim&&s.janim?1:null,style:'--pap:'+paper});
 if(s.spec&&s.specStrip)root.append(h('i',{class:'jstrip',style:'background:linear-gradient('+specCol(P(c,0,n),58)+','+specCol(P(c,n-1,n),58)+')'}));
 const body=h('div',{class:'jb'},[h('h3',{class:'jd',style:'color:'+ink(pm)},c.title||'Sans titre')]);let pi=0;
 L.forEach((m,k)=>{const t=m.type||'text',pk=P(c,k,n);let el;if(m.who==='note'){if(cx.edit)body.append(wrapI(noteEl(m,cx),m,cx));return}
  if(t==='photo'){const D=m.dev!=null&&m.dev!==''?+m.dev:(s.evoDev?s.dev0+(s.dev1-s.dev0)*pk:100),Ag=m.age!=null&&m.age!==''?+m.age:(s.evoAge?s.age0+(s.age1-s.age0)*pk:0),idx=pi++;
   el=h('figure',{class:'pol '+(idx%2?'r':'l'),'data-an':cx.anim?1:null,style:'--dev:'+(D/100).toFixed(3)+';--age:'+(Ag/100).toFixed(3)+';--tilt:'+(m.tilt==null?(idx%2?2.5:-2.5):m.tilt)+'deg;--tape:'+(s.spec&&s.specTape?specCol(pk,72,.8):'rgba(240,225,150,.8)')});
   const im=h('div',{class:'pim'}),u=m.img&&cx.src(m.img);
   if(u)im.append(h('img',{src:u,alt:m.cap||''}));else im.append(h('div',{class:'ph',style:'background:linear-gradient(135deg,'+specCol(pk,64)+','+specCol(Math.min(1,pk+.25),40)+')'},'📷'));
   im.append(h('i',{class:'fog'}));const cap=h('figcaption',{class:'pc'});cap.append(...fmt(m.cap||''));
   if(cx.edit){editable(cap,m,cx,fmt,'cap');im.onclick=async()=>{const id=await pickImg();if(id)mut(()=>{m.img=id})};im.style.cursor='pointer';im.title='Cliquer pour choisir la photo'}
   el.append(im,cap);if(s.jtape)el.append(h('i',{class:'tape'}))}
  else if(t==='sticky'){el=h('div',{class:'jst','data-an':cx.anim?1:null,style:'--sk:'+(m.col||(s.spec?specCol(pk,86):'#fff2a0'))+';--tilt:'+(m.tilt==null?(k%2?-2:2.5):m.tilt)+'deg;color:'+ink(pk)});el.append(...fmt(m.text||''));if(cx.edit)editable(el,m,cx,fmt)}
  else if(t==='sep'){el=h('div',{class:'jsep',style:'color:'+ink(pk)},'✦ ✦ ✦');if(cx.edit)el.title='Séparateur'}
  else{el=h('p',{class:'jt','data-an':cx.anim&&s.janim?1:null,style:'color:'+ink(pk)});
   if(cx.edit){el.append(...fmt(m.text||''));editable(el,m,cx,fmt)}else el.append(...(cx.anim&&s.janim?wrapWords(fmtN(m.text||'')):fmt(m.text||'')))}
  body.append(wrapI(el,m,cx))});
 root.append(body);return root}
function journalRuntime(root){const els=[...root.querySelectorAll('[data-an]')],show=e=>e.classList.add('in');
 if(!('IntersectionObserver' in window)){els.forEach(show);return function(){}}
 const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){show(x.target);io.unobserve(x.target)}}),{threshold:.3});
 els.forEach(e=>io.observe(e));const bp=()=>els.forEach(show);window.addEventListener('beforeprint',bp);
 return function(){io.disconnect();window.removeEventListener('beforeprint',bp)}}

/* ═════ Livre ensorcelé ═════ */
function spellChapter(c,cx){const s=S.set,L=cx.msgs,th=themeOf(c);
 const root=h('article',{class:'xc xc-spell'+(s.sdrop?' dc':'')+(s.smotion?' mo':''),'data-th':th,'data-rv':cx.anim&&s.sreveal?1:null,'data-parts':cx.anim&&s.sparts?1:null});
 const sin=h('div',{class:'sin'},[h('h2',{class:'sch'+(cx.anim?' anm':'')},c.title||'Sans titre')]);let first=true;
 root.append(sin);
 L.forEach(m=>{const t=m.type||'text';let el;if(m.who==='note'){if(cx.edit)sin.append(wrapI(noteEl(m,cx),m,cx));return}
  if(t==='title'){el=h('h3',{class:'stt'});el.append(...spellNodes(m.text));if(cx.edit)editable(el,m,cx,spellNodes)}
  else if(t==='quote'){el=h('blockquote',{class:'sq'});el.append(...spellNodes(m.text));if(cx.edit)editable(el,m,cx,spellNodes)}
  else if(t==='sep')el=h('div',{class:'ssep'},'❦');
  else if(t==='break')el=h('div',{class:'sbr',title:'Saut de page'},cx.edit?'⤓ saut de page':'');
  else if(t==='img'){const u=m.img&&cx.src(m.img),cl='sfig '+(m.fl||'fu')+(m.circ&&m.fl&&m.fl!=='fu'?' circ':'');
   el=h('figure',{class:cl,style:'--w:'+(m.w||45)+'%'});el.append(u?h('img',{src:u,alt:m.cap||''}):h('div',{class:'ph'},'🖼'));if(m.cap)el.append(h('figcaption',{},m.cap));
   if(cx.edit){el.style.cursor='pointer';el.onclick=async()=>{if(m.img)return;const id=await pickImg();if(id)mut(()=>{m.img=id})}}}
  else{const sc=spellClass(m.text);el=h('p',{class:'sp '+sc+(first&&!sc?' first':'')});el.append(...spellNodes(m.text));if(!sc)first=false;if(cx.edit){editable(el,m,cx,spellNodes);const f=el.onfocus;el.onfocus=()=>{f();el.className='sp raw'};}}
  sin.append(wrapI(el,m,cx))});
 return root}
function spellRuntime(root){const cl=[];
 root.querySelectorAll('.xc-spell').forEach(a=>{
  if(a.dataset.rv&&'IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.15});
   a.querySelectorAll('.sp,.stt,.sq,.sfig,.sch,.ssep').forEach(e=>io.observe(e));cl.push(()=>io.disconnect());
   const bp=()=>a.querySelectorAll('.sp,.stt,.sq,.sfig,.sch,.ssep').forEach(e=>e.classList.add('in'));window.addEventListener('beforeprint',bp);cl.push(()=>window.removeEventListener('beforeprint',bp))}
  if(a.dataset.parts&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches)){
   const cv=document.createElement('canvas');cv.className='sfx';a.append(cv);const ctx=cv.getContext('2d');let w=0,hh=0,P=[],vis=true,raf=0;
   const K={parchemin:'dust',nuit:'stars',sang:'embers',givre:'snow',foret:'fly',or:'spark'},kind=K[a.dataset.th]||'dust';
   const seed=()=>{const N=Math.max(12,Math.min(70,Math.round(w*hh/14000)));P=[];for(let i=0;i<N;i++)P.push({x:Math.random()*w,y:Math.random()*hh,r:Math.random()*1.8+.7,v:Math.random()*.6+.25,ph:Math.random()*6.28,s:Math.random()})};
   const size=()=>{const r=a.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);w=Math.max(10,r.width);hh=Math.max(10,r.height);cv.width=w*d;cv.height=hh*d;ctx.setTransform(d,0,0,d,0,0);seed()};
   const circ=(x,y,r)=>{ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill()};
   const frame=t=>{raf=0;if(!vis)return;ctx.clearRect(0,0,w,hh);
    for(const p of P){
     if(kind==='snow'){p.y+=p.v*.7+.25;p.x+=Math.sin(t/900+p.ph)*.35;if(p.y>hh+4){p.y=-4;p.x=Math.random()*w}ctx.fillStyle='rgba(255,255,255,.9)';ctx.shadowColor='rgba(120,170,220,.6)';ctx.shadowBlur=3;circ(p.x,p.y,p.r*1.2);ctx.shadowBlur=0}
     else if(kind==='embers'){p.y-=p.v*.8+.2;p.x+=Math.sin(t/700+p.ph)*.45;if(p.y<-4){p.y=hh+4;p.x=Math.random()*w}ctx.fillStyle='rgba(255,'+(110+p.s*90|0)+',40,'+(.3+p.s*.5)+')';circ(p.x,p.y,p.r)}
     else if(kind==='stars'){ctx.fillStyle='rgba(255,255,235,'+(.25+.7*Math.abs(Math.sin(t/1100*p.v+p.ph)))+')';circ(p.x,p.y,p.r*.8)}
     else if(kind==='fly'){p.x+=Math.sin(t/1300+p.ph)*.45;p.y+=Math.cos(t/1100+p.ph)*.35;const al=.3+.6*Math.abs(Math.sin(t/900+p.ph)),g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*6);g.addColorStop(0,'rgba(220,255,120,'+al+')');g.addColorStop(1,'rgba(220,255,120,0)');ctx.fillStyle=g;circ(p.x,p.y,p.r*6)}
     else if(kind==='spark'){const al=Math.abs(Math.sin(t/800*p.v+p.ph));ctx.strokeStyle='rgba(212,168,60,'+al+')';ctx.lineWidth=1;const r=p.r*2.2*al;ctx.beginPath();ctx.moveTo(p.x-r,p.y);ctx.lineTo(p.x+r,p.y);ctx.moveTo(p.x,p.y-r);ctx.lineTo(p.x,p.y+r);ctx.stroke()}
     else{p.x+=Math.sin(t/2000+p.ph)*.15+.05;p.y-=p.v*.08;if(p.y<-4)p.y=hh+4;if(p.x>w+4)p.x=-4;ctx.fillStyle='rgba(120,90,50,.28)';circ(p.x,p.y,p.r*.8)}}
    raf=requestAnimationFrame(frame)};
   const go=()=>{if(!raf&&vis)raf=requestAnimationFrame(frame)};
   const ro=window.ResizeObserver?new ResizeObserver(()=>{size();go()}):null;if(ro)ro.observe(a);size();
   const io2=new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis)go();else if(raf){cancelAnimationFrame(raf);raf=0}});io2.observe(a);go();
   cl.push(()=>{vis=false;if(raf)cancelAnimationFrame(raf);io2.disconnect();if(ro)ro.disconnect();cv.remove()})}});
 return function(){cl.forEach(f=>f())}}

/* ═════ Livre anaglyphe ═════ */
const ANA_INK={process:['#ff0000','#00ffff'],soft:['#f0463c','#28c8d2'],rgb:['#ff2a2a','#00e5ff']};
const ANA_SVG='<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><filter id="anaR" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/></filter><filter id="anaC" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter></defs></svg>';
const lz=(m,def)=>(m.z==null||m.z===''?def:+m.z)*S.set.depth*.5;
function layers(a,b,z,tag,cls){return h(tag||'div',{class:'ap '+(cls||'')},[h('span',{class:'ly a',style:'--z:'+(-z).toFixed(2)},a),h('span',{class:'ly b',style:'--z:'+z.toFixed(2)},b)])}
function anaCard(m,cx,fields,build){const prev=h('div',{class:'anp'}),draw=()=>prev.replaceChildren(build()),card=h('div',{class:'anc'},[prev]);draw();
 fields.forEach(([prop,lab,cls])=>{const t=h('div',{class:'anf '+cls});t.append(...fmt(m[prop]||''));editable(t,m,cx,v=>{draw();return fmt(v)},prop);card.append(h('div',{class:'anl'},[h('span',{class:'ant '+cls},lab),t]))});return card}
function anaChapter(c,cx){const s=S.set,L=cx.msgs,root=h('article',{class:'xc xc-ana'}),sin=h('div',{class:'sin'});root.append(sin);
 const T=c.title||'Sans titre';sin.append(layers(T,T,lz({},1.5),'h2','ach'));
 L.forEach(m=>{const t=m.type||'text';let el;if(m.who==='note'){if(cx.edit)sin.append(wrapI(noteEl(m,cx),m,cx));return}
  if(t==='dual'){const b=()=>layers(fmt(m.a||''),fmt(m.b||''),lz(m,0),'div','');
   el=cx.edit?anaCard(m,cx,[['a','Texte rouge · visible avec le verre cyan','a'],['b','Texte cyan · visible avec le verre rouge','b']],b):b()}
  else if(t==='both'||t==='title'||t==='text'){const b=()=>layers(fmt(m.text||''),fmt(m.text||''),lz(m,t==='title'?2:t==='both'?2:1),t==='title'?'h3':'div',t==='title'?'atl':'');
   if(cx.edit)el=anaCard(m,cx,[['text',t==='title'?'Titre':t==='both'?'Texte en relief (visible avec les deux verres)':'Texte (visible avec les deux verres)','a']],b);else el=b()}
  else if(t==='dimg'){const u=m.img&&cx.src(m.img),u2=m.img2&&cx.src(m.img2),z=lz(m,u2?0:2),
    mk=(src,ph)=>src?h('img',{src,alt:''}):h('div',{class:'ph '+ph});
   el=h('figure',{class:'adi'},[h('div',{class:'ap dx'},[h('span',{class:'ly a im',style:'--z:'+(-z).toFixed(2)},[mk(u,'pa')]),h('span',{class:'ly b im',style:'--z:'+z.toFixed(2)},[mk(u2||u,'pb')])]),m.cap?h('figcaption',{},m.cap):null]);
   if(cx.edit&&!m.img){el.style.cursor='pointer';el.onclick=async()=>{const id=await pickImg();if(id)mut(()=>{m.img=id})}}}
  else if(t==='sep')el=layers('✦ ✦ ✦','✦ ✦ ✦',lz({},1),'div','asep');
  else if(t==='break')el=h('div',{class:'sbr'},cx.edit?'⤓ saut de page':'');
  else el=h('div');
  sin.append(wrapI(el,m,cx))});
 return root}
function anaNotice(sh,s){const k=[h('h2',{},'Avant de lire')];
 if(s.anaNotice){k.push(h('p',{},'Ce livre est imprimé en double exposition : deux textes sont superposés, l’un en rouge, l’autre en cyan.'),h('p',{},'Munissez-vous de lunettes 3D rouge / cyan. Fermez un œil, puis l’autre : chaque verre fait disparaître une des deux couches et révèle l’autre.'),h('p',{class:'small'},'Impression : couleur, papier blanc mat, sans mode économie d’encre.'))}
 if(s.anaCalib)k.push(h('div',{class:'cal'},[h('div',{class:'cpa'},'ROUGE'),h('div',{class:'cpb'},'CYAN'),layers('Visible avec le verre cyan','Visible avec le verre rouge',0,'div','calt')]));
 sh('anan',k,null,'front')}

/* ═════ Couvertures ═════ */
function coverX(cx){const m=S.meta,cv=m.cover,k=S.kind,st=cv.style,u=cv.img&&cx.src(cv.img);
 const box=h('section',{class:'sheet cv cvx cvx-'+st,'data-g':'cover',style:'--c1:'+cv.c1+';--c2:'+cv.c2+(u&&(st==='image'||st==='cuir'||st==='grimoire')?';--img:url('+u+')':'')});
 const tl=k==='ana'?layers(m.title||'Sans titre',m.title||'Sans titre',2,'h1','cvt'):h('h1',{class:'cvt'},m.title||'Sans titre');
 box.append(tl);if(m.sub)box.append(k==='ana'?layers(m.sub,m.sub,1,'p','cvs'):h('p',{class:'cvs'},m.sub));if(m.author)box.append(k==='ana'?layers(m.author,m.author,lz({},.5),'p','cva'):h('p',{class:'cva'},m.author));
 if(u&&st!=='image')box.prepend(h('img',{src:u,alt:'',class:'cvi'}));
 return box}
function covOptions(){if(KR[S.kind])return KR[S.kind].covOpts;const O={sms:[['bulles','Bulles'],['plain','Unie'],['split','Deux tons'],['image','Image seule']],journal:[['cuir','Cuir & sangle'],['toile','Toile'],['kraft','Carnet kraft'],['image','Image seule']],spell:[['grimoire','Grimoire'],['parchemin','Parchemin'],['vitrail','Vitrail'],['image','Image seule']],ana:[['ana','Double exposition'],['noir','Noir profond'],['image','Image seule']]};return O[S.kind]}

/* ═════ Feuilles de style ═════ */
function modeCSS(k,noFont){let c='';
 if(!noFont)c+=(k==='journal'?FONT_J:(k==='spell'||(KR[k]&&KR[k].fs))?FONT_S:'');
 c+='.xc{box-sizing:border-box;position:relative}.xc .w{display:inline-block;white-space:pre-wrap}.xc p{margin:0}.xc .ph{display:flex;align-items:center;justify-content:center;font-size:2em;width:100%;height:100%}';
 c+=MIRCSS+cvCSS(k)+(KR[k]?(KR[k].cvcss||'')+KR[k].css():'');
 if(k==='journal')c+=cssJ();else if(k==='spell')c+=cssS();else if(k==='ana')c+=cssA();return c}
function cvCSS(k){const s=S.set;let c='.pp .cvx{padding:10% 8%;text-align:center;color:#fff;position:relative;overflow:hidden;background:var(--c1)}.cvx .cvt{font:700 2.4em/1.1 Georgia,serif;margin:0;position:relative;z-index:1}.cvx .cvs{font-style:italic;font-size:1.15em;position:relative;z-index:1;margin:0}.cvx .cva{letter-spacing:.16em;text-transform:uppercase;margin-top:18px;position:relative;z-index:1}.cvx .cvi{max-width:55%;max-height:34%;border-radius:6px;position:relative;z-index:1}.cvx-image{background:var(--c1) var(--img) center/cover}.cvx-image .cvt,.cvx-image .cva,.cvx-image .cvs{text-shadow:0 2px 12px rgba(0,0,0,.7)}';
 if(k==='journal')c+=".cvx-cuir,.cvx-toile,.cvx-kraft{background:linear-gradient(135deg,var(--c1),color-mix(in srgb,var(--c1),#000 35%))}.cvx-cuir:before{content:'';position:absolute;inset:14px;border:2px solid var(--c2);border-radius:6px;opacity:.7}.cvx-cuir:after{content:'';position:absolute;right:7%;top:0;bottom:0;width:22px;background:rgba(0,0,0,.35);box-shadow:0 0 0 2px var(--c2) inset}.cvx-toile{background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.05) 0 2px,transparent 2px 4px),repeating-linear-gradient(-45deg,rgba(0,0,0,.08) 0 2px,transparent 2px 4px),linear-gradient(135deg,var(--c1),color-mix(in srgb,var(--c1),#000 30%))}.cvx-kraft{background:#c9a878;color:#3a2a14}.cvx-kraft .cvt,.cvx-kraft .cvs,.cvx-kraft .cva{color:#3a2a14;font-family:"+(JF[s.jfont]||JF.caveat)+"}.cvx-cuir .cvt,.cvx-toile .cvt{color:var(--c2);font-family:"+(JF[s.jfont]||JF.caveat)+";font-size:3em}.cvx-cuir .cva,.cvx-toile .cva{color:var(--c2)}";
 if(k==='spell')c+=".cvx-grimoire,.cvx-parchemin,.cvx-vitrail{font-family:'SBS Cinzel',Georgia,serif}.cvx-grimoire{background:radial-gradient(circle at 50% 30%,color-mix(in srgb,var(--c1),#fff 12%),var(--c2) 85%)}.cvx-grimoire:before{content:'';position:absolute;inset:16px;border:2px solid #d4a83c;box-shadow:0 0 0 6px var(--c2),0 0 0 8px #d4a83c88,inset 0 0 40px #000a}.cvx-grimoire .cvt{color:#f0d078;text-shadow:0 0 14px #d4a83c88;font-family:'SBS Cinzel',serif}.cvx-grimoire .cva{color:#d4a83c}.cvx-parchemin{background:#f3e6c8;color:#3a2a14;background-image:radial-gradient(ellipse at 50% 20%,#fff6,transparent 70%),radial-gradient(ellipse at 50% 120%,#7846144d,transparent 60%)}.cvx-parchemin .cvt,.cvx-parchemin .cvs,.cvx-parchemin .cva{color:#3a2a14}.cvx-vitrail{background:conic-gradient(from 20deg,var(--c1),#c0392b,#e8a317,#2e8b57,#2a6fd6,var(--c2),var(--c1))}.cvx-vitrail:before{content:'';position:absolute;inset:0;background:repeating-conic-gradient(rgba(0,0,0,.35) 0 1deg,transparent 1deg 30deg)}.cvx-vitrail .cvt{background:#000a;padding:.2em .5em;border-radius:6px}";
 if(k==='ana'){const I=ANA_INK[s.anaInk]||ANA_INK.process;c+=".cvx-ana,.cvx-noir{background:#fff}.cvx-noir{background:#0b0b0e}.cvx-noir .ap{isolation:isolate}.cvx-noir .ly.a,.cvx-noir .ly.b{mix-blend-mode:screen}";}
 return c}
function cssJ(){const s=S.set,fs=s.jsize,lh=Math.round(fs*(s.jfont==='beanie'?1.28:1.5)),ff=JF[s.jfont]||JF.caveat,L=lh;
 const PA={ruled:'background-image:repeating-linear-gradient(transparent 0,transparent '+(L-1)+'px,rgba(90,120,170,.38) '+(L-1)+'px,rgba(90,120,170,.38) '+L+'px);background-position:0 '+Math.round(L*.45)+'px;',grid:'background-image:linear-gradient(rgba(90,120,170,.22) 1px,transparent 1px),linear-gradient(90deg,rgba(90,120,170,.22) 1px,transparent 1px);background-size:'+Math.round(L*.9)+'px '+Math.round(L*.9)+'px;',dots:'background-image:radial-gradient(rgba(80,80,100,.38) 1.2px,transparent 1.5px);background-size:'+Math.round(L*.8)+'px '+Math.round(L*.8)+'px;',plain:'',kraft:'background-image:repeating-linear-gradient(90deg,rgba(120,80,30,.05) 0 2px,transparent 2px 5px);'};
 return `.xc-journal{background-color:var(--pap,#fbf7ec);color:${s.jink};font-family:${ff};font-size:${fs}px;line-height:${lh}px;min-height:72vh;border-radius:3px;overflow:hidden;${PA[s.jpaper]||''}${s.jpaper==='kraft'?'background-color:#d9bf94;':''}}
.xc-journal .jb{padding:${lh}px 7% ${lh*2}px ${s.jpaper==='ruled'&&s.jline?'14%':'8%'}}
.xc-journal.ln:before{content:'';position:absolute;left:10.5%;top:0;bottom:0;width:2px;background:rgba(214,80,80,.5)}
.xc-journal .jstrip{position:absolute;left:0;top:0;bottom:0;width:9px}
.xc-journal .jd{font:inherit;font-size:1.25em;font-weight:700;margin:0 0 ${Math.round(lh*.4)}px;line-height:${lh}px}
.xc-journal .jt{white-space:pre-wrap;margin:0;min-height:${lh}px}
.xc-journal .jt .w{animation:none}
.xc-journal[data-anim] .jt:not(.in) .w{opacity:0}.xc-journal[data-anim] .jt.in .w{animation:jw .45s both;animation-delay:calc(var(--i)*55ms)}
@keyframes jw{from{opacity:0;transform:translateY(3px) rotate(-1deg)}to{opacity:1;transform:none}}
.xc-journal .jsep{text-align:center;opacity:.55;letter-spacing:.4em;margin:${Math.round(lh/2)}px 0}
.xc-journal .jst{width:62%;margin:${lh*.5}px 0 ${lh*.5}px auto;padding:12px 16px;background:var(--sk,#fff2a0);box-shadow:2px 5px 10px rgba(0,0,0,.25);transform:rotate(var(--tilt,2deg));white-space:pre-wrap;font-size:.95em;line-height:1.25}
.xc-journal .pol{position:relative;width:min(58%,250px);margin:${lh}px auto ${Math.round(lh*.8)}px;padding:9px 9px 3px;box-sizing:border-box;background:color-mix(in srgb,#fcfcfa,#e4cf98 calc(var(--age,0)*100%));box-shadow:0 3px 10px rgba(0,0,0,.3),0 0 0 1px rgba(0,0,0,.06);transform:rotate(var(--tilt,0deg));break-inside:avoid;line-height:1.2}
.xc-journal .pol.l{margin-left:4%}.xc-journal .pol.r{margin-right:4%}
.xc-journal .pim{position:relative;aspect-ratio:1/1;background:#333;overflow:hidden}
.xc-journal .pim img{width:100%;height:100%;object-fit:cover;display:block;filter:blur(calc((1 - var(--dev,1))*7px)) saturate(calc(.15 + var(--dev,1)*.85)) sepia(calc(var(--age,0)*.85)) contrast(calc(1 - var(--age,0)*.12)) brightness(calc(1 - var(--age,0)*.05));transition:filter 2.6s ease}
.xc-journal .pim .ph{color:#fff8}
.xc-journal .fog{position:absolute;inset:0;background:#ece6d6;opacity:calc((1 - var(--dev,1))*.8);pointer-events:none;transition:opacity 2.6s ease}
.xc-journal[data-anim] .pol:not(.in) .pim img{filter:blur(10px) saturate(0) brightness(1.6) sepia(0)}.xc-journal[data-anim] .pol:not(.in) .fog{opacity:.95}
.xc-journal .pc{font-size:.85em;text-align:center;min-height:2em;padding:5px 2px 4px;color:${s.jink}}
.xc-journal .tape{position:absolute;top:-11px;left:50%;width:74px;height:22px;margin-left:-37px;transform:rotate(-3deg);background:var(--tape,rgba(240,225,150,.8));opacity:.82;box-shadow:0 1px 2px rgba(0,0,0,.15)}
.xc-journal .pc:empty:before{content:attr(data-ph)}`}
function cssS(){const s=S.set,fs=s.sfs,bf=s.sfont==='serif'?'Georgia,serif':"'SBS Fell',Georgia,serif",hf=s.sfont==='fraktur'?"'SBS Fraktur','SBS Fell',serif":"'SBS Cinzel','SBS Fell',serif";
 let c='';Object.entries(SPELL_THEMES).forEach(([k,t])=>{c+=`.xc-spell[data-th=${k}]{--bg:${t.bg};--ink:${t.ink};--acc:${t.acc};--fxo:${t.fxo};background-image:${t.bgi}}`});
 c+=`.xc-spell{container-type:inline-size;overflow:hidden;background-color:var(--bg);color:var(--ink);font-family:${bf};min-height:72vh;border-radius:3px;line-height:1.62}
.xc-spell .sin{position:relative;z-index:1;padding:9cqw 8cqw 10cqw;font-size:max(${Math.round(fs*.78)}px,${(fs/5.6).toFixed(2)}cqw)}
.xc-spell .sfx{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0}
.xc-spell .sch{font-family:${hf};font-weight:700;text-align:center;font-size:1.9em;line-height:1.15;margin:0 0 1.2em;color:var(--acc);letter-spacing:.04em}
.xc-spell .sch:after{content:'❦';display:block;font-size:.5em;margin-top:.5em;opacity:.8}
.xc-spell .stt{font-family:${hf};font-weight:700;text-align:center;font-size:1.45em;margin:1.4em 0 .6em;color:var(--acc);letter-spacing:.05em}
.xc-spell .sp{margin:0 0 .85em;text-align:justify;hyphens:auto}
.xc-spell.dc .sp.first:first-letter{float:left;font-family:${hf};font-weight:700;font-size:3.5em;line-height:.82;padding:.06em .09em 0 0;color:var(--acc);text-shadow:0 0 12px color-mix(in srgb,var(--acc),transparent 55%)}
.xc-spell .sp.punch{text-align:center;font-size:1.4em;margin:1.1em 0;font-style:italic}
.xc-spell .sp.shout{text-align:center;font-size:1.55em;font-weight:700;letter-spacing:.08em;margin:1em 0}
.xc-spell .sp.exc{font-size:1.15em;font-style:italic}
.xc-spell .sp.qst{font-style:italic;padding-left:1.2em;border-left:2px solid color-mix(in srgb,var(--acc),transparent 50%)}
.xc-spell .sp.trail{-webkit-mask-image:linear-gradient(90deg,#000 60%,transparent);mask-image:linear-gradient(90deg,#000 60%,transparent)}
.xc-spell .sp.dlg{padding-left:1.4em;text-indent:-.9em;text-align:left}
.xc-spell .sp.long{text-align:justify}
.xc-spell .sq{margin:1.2em 1.4em;padding-left:1em;border-left:3px solid var(--acc);font-style:italic;font-size:1.08em;opacity:.95}
.xc-spell .ssep{text-align:center;font-size:1.6em;color:var(--acc);margin:.9em 0;letter-spacing:.5em}
.xc-spell .sbr{clear:both;break-after:page;page-break-after:always;border-top:1px dashed var(--acc);margin:1.2em 0;opacity:.6;font-size:.7em;text-align:center}
.xc-spell .sfig{margin:.3em 0 .8em;max-width:100%}.xc-spell .sfig img,.xc-spell .sfig .ph{width:100%;display:block;border-radius:4px;box-shadow:0 6px 18px rgba(0,0,0,.35)}.xc-spell .sfig .ph{aspect-ratio:4/3;background:color-mix(in srgb,var(--acc),transparent 75%)}
.xc-spell .sfig figcaption{font-size:.8em;font-style:italic;text-align:center;opacity:.8;margin-top:.4em}
.xc-spell .sfig.fu{width:100%;clear:both}.xc-spell .sfig.fl{float:left;width:var(--w);margin:.2em 1.2em .6em 0}.xc-spell .sfig.fr{float:right;width:var(--w);margin:.2em 0 .6em 1.2em}
.xc-spell .sfig.circ{shape-margin:1em}.xc-spell .sfig.fl.circ{shape-outside:circle(closest-side)}.xc-spell .sfig.fr.circ{shape-outside:circle(closest-side)}.xc-spell .sfig.circ img,.xc-spell .sfig.circ .ph{border-radius:50%;aspect-ratio:1/1;object-fit:cover}
.xc-spell[data-rv] .sp:not(.in),.xc-spell[data-rv] .stt:not(.in),.xc-spell[data-rv] .sq:not(.in),.xc-spell[data-rv] .sch:not(.in),.xc-spell[data-rv] .sfig:not(.in),.xc-spell[data-rv] .ssep:not(.in){opacity:0;transform:translateY(12px)}
.xc-spell[data-rv] .sp,.xc-spell[data-rv] .stt,.xc-spell[data-rv] .sq,.xc-spell[data-rv] .sch,.xc-spell[data-rv] .sfig,.xc-spell[data-rv] .ssep{transition:opacity 1s ease,transform 1s ease}
.xc-spell .fx{display:inline}.xc-spell .fx i{font-style:inherit;display:inline-block}
.xc-spell .fx-feu{background:linear-gradient(#ffe27a,#ff7a1f 55%,#b3170a);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:700;filter:drop-shadow(0 0 3px #ff7a1faa)}
.xc-spell .fx-glace{background:linear-gradient(#fff,#8fd8ff 60%,#3a9ad9);-webkit-background-clip:text;background-clip:text;color:transparent;letter-spacing:.05em;font-weight:700;filter:drop-shadow(0 0 3px #7fd0ff88)}
.xc-spell .fx-ombre{color:var(--fxo);text-shadow:2px 3px 7px rgba(0,0,0,.65),-1px 0 3px rgba(0,0,0,.35);letter-spacing:.04em;font-weight:700}
.xc-spell .fx-or{background:linear-gradient(100deg,#7a5a10,#e6bc4a 40%,#a87a14 65%,#e6bc4a);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:700;filter:drop-shadow(0 0 4px #ffd96666)}
.xc-spell .fx-sang{color:#b3121a;font-weight:700;text-shadow:0 .12em 0 #6e0a10,0 .3em .1em #b3121a88}
.xc-spell .fx-murmure{font-size:.78em;letter-spacing:.14em;opacity:.7;font-style:italic}
.xc-spell .fx-cri{font-size:1.35em;font-weight:700;text-transform:uppercase;letter-spacing:.03em;line-height:1}
.xc-spell .fx-tremble i,.xc-spell .fx-vague i,.xc-spell .fx-magie i{display:inline-block}
.xc-spell .fx-magie i{background:linear-gradient(90deg,#ff6ad5,#c774e8,#7aa2ff,#5cf0e0,#ffe27a);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:700}
.xc-spell.mo .fx-feu{animation:flk 1.6s infinite alternate}.xc-spell.mo .fx-tremble i{animation:shk .22s infinite alternate;animation-delay:calc(var(--i)*-37ms)}.xc-spell.mo .fx-vague i{animation:wav 1.8s ease-in-out infinite;animation-delay:calc(var(--i)*90ms)}.xc-spell.mo .fx-magie i{animation:mag 3s linear infinite;animation-delay:calc(var(--i)*120ms);background-size:300% 100%}.xc-spell.mo .fx-glace{animation:gl 3s ease-in-out infinite alternate}.xc-spell.mo .fx-or{animation:gl 2.4s ease-in-out infinite alternate}
@keyframes flk{from{filter:drop-shadow(0 0 2px #ff7a1f88) brightness(.95)}to{filter:drop-shadow(0 0 7px #ffb347) brightness(1.2)}}
@keyframes shk{from{transform:translate(-.6px,.4px) rotate(-1.5deg)}to{transform:translate(.7px,-.5px) rotate(1.5deg)}}
@keyframes wav{0%,100%{transform:translateY(0)}50%{transform:translateY(-.28em)}}
@keyframes mag{from{background-position:0 0}to{background-position:300% 0}}
@keyframes gl{from{filter:drop-shadow(0 0 2px #fff8)}to{filter:drop-shadow(0 0 7px #fffc)}}
@media print{.xc-spell .sfx{display:none}}`;
 return c}
function cssA(){const s=S.set,I=ANA_INK[s.anaInk]||ANA_INK.process,fs=s.afs,ff=s.afont==='sans'?'Helvetica,Arial,sans-serif':s.afont==='mono'?'"Courier New",monospace':'Georgia,"Times New Roman",serif';
 return `.xc-ana{background:#fff;color:${I[0]};font-family:${ff};font-size:${fs}px;line-height:1.55;min-height:72vh;border-radius:3px}
.xc-ana .sin{padding:9% 9% 10%}
.xc-ana .ap{display:grid;isolation:isolate;margin:0 0 .85em}.xc-ana .ap>.ly{grid-area:1/1;display:block;mix-blend-mode:${s.anaMix==='multiply'?'multiply':'normal'};opacity:${(s.ghost/100).toFixed(2)};transform:translateX(calc(var(--z,0)*1px*var(--rel,1)));white-space:pre-wrap}
.xc-ana .ly.a{color:${I[0]}}.xc-ana .ly.b{color:${I[1]}}
.xc-ana .at0{margin:0 0 .85em;white-space:pre-wrap}
.xc-ana .ach{font:700 1.9em/1.15 ${ff};text-align:center;margin:0 0 1em}.xc-ana .atl{font:700 1.4em/1.2 ${ff};text-align:center;margin:1.2em 0 .6em}
.xc-ana .asep{text-align:center;font-size:1.5em;letter-spacing:.4em;margin:.7em 0}
.xc-ana .adi{margin:1em 0}.xc-ana .adi .dx{aspect-ratio:4/3;margin:0}.xc-ana .adi .im{overflow:hidden;background:transparent}.xc-ana .adi .im img{width:100%;height:100%;object-fit:cover;display:block}
.xc-ana .adi .ly.a img{filter:url(#anaR)}.xc-ana .adi .ly.b img{filter:url(#anaC)}
.xc-ana .adi .ph{width:100%;height:100%}.xc-ana .adi .ph.pa{background:radial-gradient(circle at 38% 48%,${I[0]} 0 24%,transparent 25%),repeating-linear-gradient(45deg,${I[0]}55 0 6px,transparent 6px 12px)}.xc-ana .adi .ph.pb{background:linear-gradient(135deg,transparent 30%,${I[1]} 31% 65%,transparent 66%),radial-gradient(circle at 62% 50%,${I[1]}88 0 20%,transparent 21%)}
.xc-ana .adi figcaption{font-size:.8em;text-align:center;margin-top:.3em;color:${I[1]}}
.xc-ana .sbr{clear:both;break-after:page;page-break-after:always;border-top:1px dashed ${I[1]};margin:1em 0;font-size:.7em;text-align:center;opacity:.6}
.pp .anan{padding:9%;text-align:left}.pp .anan{color:${I[0]}}.pp .anan h2{color:${I[1]}}.pp .anan p{line-height:1.5}.pp .anan .small{font-size:.8em;color:${I[1]}}
.anan .cal{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.anan .cpa,.anan .cpb{height:46px;display:flex;align-items:center;justify-content:center;font:700 1.1em Helvetica,Arial,sans-serif;letter-spacing:.2em}.anan .cpa{background:${I[0]};color:${I[0]}}.anan .cpb{background:${I[1]};color:${I[1]}}.anan .calt{grid-column:1/-1;font-size:1.1em;text-align:center;padding:10px 0}
.pp .cvx-ana .ap,.pp .cvx-noir .ap{display:grid;margin:0}.pp .cvx-ana .ly,.pp .cvx-noir .ly{grid-area:1/1;display:block;transform:translateX(calc(var(--z,0)*1px*var(--rel,1)))}.pp .cvx-ana .ly.a{color:${I[0]}}.pp .cvx-ana .ly.b{color:${I[1]}}.pp .cvx-noir .ly.a{color:${I[0]}}.pp .cvx-noir .ly.b{color:${I[1]}}.pp .cvx-ana h1.ap{font:700 2.5em/1.1 Georgia,serif}.pp .cvx-noir h1.ap{font:700 2.5em/1.1 Georgia,serif}`}
const LAYOUTX=`
.pp .sheet.xk{padding:0;background:transparent;box-shadow:none;max-width:600px;border-radius:0;overflow:visible}
.pp .sheet.xk .xc{box-shadow:0 8px 30px -12px rgba(0,0,0,.35)}
.pp .sheet.cvx{padding:10% 8%}
@media print{.pp .sheet.xk{max-width:none}.pp .sheet.xk .xc{box-shadow:none;border-radius:0;min-height:0}.xc-spell .sp,.xc-spell .stt,.xc-spell .sq,.xc-spell .sch,.xc-spell .sfig,.xc-spell .ssep{opacity:1!important;transform:none!important}.xc .pol{break-inside:avoid}.xc-journal .pim img{transition:none}.lensbar,#lensov{display:none!important}}`;
const LENSBAR_CSS=`.lensbar{position:sticky;top:0;z-index:70;display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;padding:8px;background:#14161c;color:#fff;font:14px system-ui,sans-serif}.lensbar button{background:#2a2e3a;border:1px solid #444;color:#fff;border-radius:8px;padding:5px 12px;cursor:pointer}.lensbar button.on{background:#fff;color:#111}.lensbar label{display:flex;gap:6px;align-items:center}#lensov{position:fixed;inset:0;pointer-events:none;mix-blend-mode:multiply;z-index:30;display:none}body[data-lens=red] .xc-ana .ly,body[data-lens=cyan] .xc-ana .ly{mix-blend-mode:multiply!important}body[data-lens=red] #lensov{display:block;background:#f00}body[data-lens=cyan] #lensov{display:block;background:#0ff}`;
function anaRuntime(){var b=document.body,ov=document.getElementById('lensov');if(!ov){ov=document.createElement('div');ov.id='lensov';b.appendChild(ov)}
 var bar=document.querySelector('.lensbar');if(!bar)return;var bs=bar.querySelectorAll('button');
 bs.forEach(function(x){x.onclick=function(){b.dataset.lens=x.dataset.l;bs.forEach(function(y){y.classList.toggle('on',y===x)})}});
 var r=bar.querySelector('input');if(r)r.oninput=function(){b.style.setProperty('--rel',r.value)}}
function lensBarEl(){const b=document.body.dataset.lens||'none',mk=(l,t)=>h('button',{type:'button','data-l':l,class:b===l?'on':null,onclick:e=>{document.body.dataset.lens=l;$$('.lensbar button').forEach(x=>x.classList.toggle('on',x.dataset.l===l))}},t);
 const r=h('input',{type:'range',min:0,max:3,step:.25,value:getComputedStyle(document.body).getPropertyValue('--rel')||1,oninput:()=>document.body.style.setProperty('--rel',r.value)});
 return h('div',{class:'lensbar',style:'position:static;border-radius:8px;padding:4px 8px'},[mk('none','Sans lunettes'),mk('red','🔴 Verre rouge'),mk('cyan','🔵 Verre cyan'),h('label',{},['Relief ',r])])}
const EDITCSS=`.xi{position:relative}.xi:hover{outline:1px dashed rgba(120,120,170,.55);outline-offset:3px}.xt{position:absolute;right:-4px;top:-15px;display:none;gap:1px;background:#fff;border:1px solid #ccd;border-radius:7px;padding:2px;z-index:5;box-shadow:0 3px 10px rgba(0,0,0,.2)}.xi:hover>.xt,.xi:focus-within>.xt{display:flex}.xt button{border:0;background:none;width:24px;height:22px;border-radius:5px;color:#334;cursor:pointer;font-size:14px}.xt button:hover{background:#e8eaf5}
.xi [contenteditable]{outline:none;cursor:text}.xi [contenteditable].raw{background:rgba(255,255,160,.35);border-radius:3px;white-space:pre-wrap}
.xc .pc[contenteditable]:empty:before{content:'Légende…';opacity:.45}
.anc{border:1px solid rgba(0,0,0,.12);border-radius:8px;padding:8px;margin:0 0 1em;background:#fafafd}.anp{margin-bottom:6px;padding-bottom:6px;border-bottom:1px dashed #ccd}.anl{margin:3px 0}.ant{display:block;font:11px system-ui;color:#778;margin-bottom:1px}.ant.a{color:#d42}.ant.b{color:#08a}.anf{padding:3px 6px;border-radius:5px;min-height:1.3em;border:1px solid rgba(0,0,0,.1);background:#fff;white-space:pre-wrap}.anf.a{border-color:#f0463c88}.anf.b{border-color:#28c8d288}
.xc-spell .sp.raw{white-space:pre-wrap;text-align:left}.xnote{background:#fff7c2;color:#5a4a00;border-left:4px solid #e0b800;padding:6px 10px;margin:.6em 0;font:13px system-ui;border-radius:4px;white-space:pre-wrap}
#xslash{position:absolute;bottom:100%;left:0;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:4px;box-shadow:0 8px 24px rgba(0,0,0,.25);z-index:5}#xslash button{display:flex;gap:10px;border:0;background:none;color:var(--ink);padding:5px 10px;border-radius:6px;cursor:pointer;width:100%;text-align:left}#xslash button:hover{background:var(--bg)}#xslash span{color:var(--mute)}`;

/* ═════ Édition / lecture des modes ═════ */
const xcx=(c,o)=>Object.assign({edit:false,msgs:c.msgs,prog:jProg(),src:id=>A[id]||'',th:LIGHT},o||{});
function xChapterEl(c,cx){const k=S.kind;if(KR[k])return KR[k].chapter(c,cx);return(k==='journal'?journalChapter:k==='spell'?spellChapter:anaChapter)(c,cx)}
function xText(){const m=S.meta,L=[m.title||'Sans titre'];if(m.author)L.push('par '+m.author);L.push('');
 S.chapters.forEach(c=>{L.push('# '+(c.title||'Sans titre'),'');c.msgs.forEach(x=>{const t=x.type||'text';if(x.who==='note')return;const mx=mechTxt(x);if(mx!=null){L.push(mx);return}
  if(t==='dual')L.push('[rouge] '+(x.a||''),'[cyan] '+(x.b||''));else if(t==='photo')L.push('[Polaroïd] '+(x.cap||''));else if(t==='dimg'||t==='img')L.push('[Image] '+(x.cap||''));else if(t==='sep')L.push('* * *');else if(t==='break')L.push('');else if(x.text)L.push(t==='title'?'## '+stripFx(x.text):stripFx(x.text))});L.push('')});
 return L.join('\n')}
function xWrite(){const c=chap(),P=$('#xpage'),B=$('#xbar'),k=S.kind;
 const bits=[h('b',{},KINDS[k].i+' '+KINDS[k].n),h('span',{},'Cliquez dans le texte pour écrire · survolez un élément pour le déplacer ou changer ses options.')];
 if(k==='spell')bits.push(h('label',{},['Ambiance : ',(()=>{const s=h('select',{onchange:()=>mut(()=>{c.mood=s.value})},[h('option',{value:''},'celle du livre'),...Object.entries(SPELL_THEMES).map(([v,t])=>h('option',{value:v},t.n))]);s.value=c.mood||'';return s})()]));
 if(k==='ana')bits.push(lensBarEl());
 if(KR[k]&&KR[k].bar)bits.push(...KR[k].bar(c));labgRender();
 B.replaceChildren(...bits);P.replaceChildren(xChapterEl(c,xcx(c,{edit:true})));
 if(!c.msgs.length)P.append(h('div',{class:'empty'},'Chapitre vide : écrivez dans la zone ci-dessous.'))}
function xAdd(it){it.id=uid();it.who=it.who||'x';mut(()=>{chap().msgs.push(it)});setTimeout(()=>{const P=$('#xchat');if(P)P.scrollTop=P.scrollHeight},40)}
function wrapSel(fx){const t=$('#xta');if(!t)return;const a=t.selectionStart,b=t.selectionEnd,sel=t.value.slice(a,b)||'texte';t.setRangeText('['+fx+':'+sel+']',a,b,'end');t.focus()}
function xComposer(){const B=$('#xcomp');if(!B)return;const k=S.kind;if(B.dataset.k===k)return;B.dataset.k=k;B.replaceChildren();if(k==='sms')return;
 const ta=h('textarea',{id:'xta',rows:2,placeholder:KR[k]?KR[k].ph:k==='journal'?'Écrivez comme dans votre journal…':k==='spell'?'Écrivez… Astuce : [feu:flamme] [murmure:chut] [cri:AH]':'Texte rouge (visible avec le verre cyan) ou texte normal…'});
 const tb=h('textarea',{id:'xtb',rows:2,placeholder:'Texte cyan secret (visible avec le verre rouge)…',style:k==='ana'?'':'display:none'});
 const val=()=>{const v=ta.value.trim();return v};
 const btn=(l,f,t,cls)=>h('button',{type:'button',class:cls||'',title:t||l,onclick:f},l);
 const add=type=>{const v=val();if(!v)return false;xAdd({type,text:v});ta.value='';ta.focus();return true};
 const imgAdd=async(type,extra)=>{const id=await pickImg();if(id)xAdd(Object.assign({type,img:id,cap:val()},extra||{}));if(id)ta.value=''};
 let btns=[];
 if(k==='journal')btns=[btn('Ajouter ↵',()=>add('text'),'Ajouter un paragraphe','acc'),btn('📷 Polaroïd',()=>imgAdd('photo')),btn('📝 Post-it',()=>add('sticky')||xAdd({type:'sticky',text:'Note…'})),btn('✦ Séparateur',()=>xAdd({type:'sep'}))];
 else if(k==='spell')btns=[btn('Ajouter ↵',()=>add('text'),'Ajouter un paragraphe','acc'),btn('Titre',()=>add('title')),btn('Citation',()=>add('quote')),btn('🖼 Image',()=>imgAdd('img',{fl:'fl',circ:false})),btn('❦ Séparateur',()=>xAdd({type:'sep'})),btn('⤓ Saut de page',()=>xAdd({type:'break'})),btn('✨ Effet ▾',e=>menu(e.currentTarget,FXN.map(f=>[f[0].toUpperCase()+f.slice(1),()=>wrapSel(f)])),'Entourer la sélection d’un effet')];
 else if(k==='ana')btns=[btn('＋ Texte',()=>add('text'),'Texte rouge + cyan, visible avec les deux verres'),btn('＋ Texte en relief',()=>add('both'),'Même texte dans les deux couches, décalé : effet 3D','acc'),btn('＋ Double texte secret',()=>{const a=ta.value.trim(),b=tb.value.trim();if(!a&&!b)return;xAdd({type:'dual',a,b,z:0});ta.value=tb.value='';ta.focus()},'Texte rouge + texte cyan superposés'),btn('Titre',()=>add('title')),btn('🖼 Image double',()=>imgAdd('dimg')),btn('✦',()=>xAdd({type:'sep'}),'Séparateur'),btn('⤓',()=>xAdd({type:'break'}),'Saut de page')];
 if(KR[k])btns=KR[k].btns({add,xAdd,btn,imgAdd,ta,tb,val});
 ta.oninput=()=>slashBox(ta);ta.onkeydown=e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey||!e.shiftKey)){e.preventDefault();if(ta.value.startsWith('/')){if(slashRun(ta.value)){ta.value='';slashBox(ta)}else toast('Commande inconnue ici.');return}add('text')}};
 B.append(h('div',{class:'xrow'},[h('div',{class:'xtas'},[ta,tb]),h('div',{class:'xbtns'},btns)]),h('div',{class:'hint'},KR[k]?KR[k].hint:k==='journal'?'Entrée ajoute · Maj+Entrée : ligne · **gras** *italique* · le spectre et les Polaroïds évoluent avec la place dans le livre.':k==='spell'?'Entrée ajoute · les mots comme feu, glace, ombre, murmure… réagissent automatiquement · [effet:texte] pour forcer.':'Tout est en rouge et cyan, jamais de noir. Texte / relief = même texte dans les deux couches. Double texte = un secret par verre.'))}
function startRuntime(P){const k=S.kind;if(KR[k])return mechRuntime(P);if(k==='journal')return journalRuntime(P);if(k==='spell')return spellRuntime(P);return function(){}}
function xReadView(){if(XCLEAN){XCLEAN();XCLEAN=null}const c=chap(),i=S.chapters.indexOf(c),P=$('#xrpage');
 $('#xrtitle').textContent=(i+1)+' / '+S.chapters.length+' · '+(c.title||'Sans titre');
 P.replaceChildren(xChapterEl(c,xcx(c,{anim:true,go:id=>{S.cur=id;save();all()}})));XCLEAN=startRuntime(P);P.classList.toggle('mirror',MIRV);
 $('#xrx').replaceChildren(...[S.kind==='ana'?lensBarEl():null,mirBtn('#xrpage')].filter(Boolean));$('#xrbox').scrollTop=0;$('#xrPrev').disabled=i<1;$('#xrNext').disabled=i>=S.chapters.length-1}
$('#xrPrev').onclick=()=>{const i=S.chapters.indexOf(chap());if(i>0){S.cur=S.chapters[i-1].id;save();all()}};
$('#xrNext').onclick=()=>{const i=S.chapters.indexOf(chap());if(i<S.chapters.length-1){S.cur=S.chapters[i+1].id;save();all()}};
$('#xrReplay').onclick=()=>xReadView();
function kindUI(){const k=S.kind,b=document.body;b.dataset.kind=k;if(k!=='ana')delete b.dataset.lens;
 $('#kbadge').textContent=KINDS[k].i+' '+KINDS[k].n;
 $$('.mk').forEach(e=>{e.hidden=!e.classList.contains('mk-'+k)});
 const t1=$('.tabs [data-tab="1"]');if(t1){t1.style.display=k==='sms'?'':'none';if(k!=='sms'&&t1.classList.contains('on'))$('.tabs [data-tab="0"]').click()}
 const cs=$('#covSel');if(cs){const key=k+'|'+S.meta.cover.style;if(cs.dataset.k!==k){cs.replaceChildren(...covOptions().map(([v,l])=>h('option',{value:v},l)));cs.dataset.k=k}cs.value=S.meta.cover.style}
 $('#xcss').textContent=MIRAPP+(k==='sms'?LENSBAR_CSS:modeCSS(k,true)+LENSBAR_CSS+EDITCSS+MECHEDIT);
 $('#bkx').replaceChildren(...[k==='ana'?lensBarEl():null,mirBtn('#bwrap')].filter(Boolean));labgRender();
 if(k!=='sms')$('#hint').textContent=''}

/* ═════ Bibliothèque ═════ */
async function loadBook(id){const st=await DB.get('b_'+id),as=await DB.get('a_'+id);BID=id;S=norm(st||{});A=as&&typeof as==='object'?as:{};dirtyA=false;snapsC=null;hist=[];redo=[];SEL.clear();INS=null;REPLY=null;Q='';const q=$('#q');if(q)q.value='';who=S.chars[0].id;
 const u=usedAssets();if(Object.keys(u).length!==Object.keys(A).length){A=u;dirtyA=true}}
async function switchBook(id){homeHide();await flush();await DB.set('cur',id);await loadBook(id);view='write';setView('write');all();const sc=$('#xchat');if(sc)sc.scrollTop=1e7;const c=$('#chat');if(c)c.scrollTop=1e7;toast('« '+(S.meta.title||'Sans titre')+' » ouvert')}
async function createBook(kind,title){homeHide();await flush();const id=uid(),d=norm(DEF(kind,true));if(KR[kind]&&KR[kind].init)KR[kind].init(d);d.meta.title=title||('Nouveau '+KINDS[kind].n.toLowerCase());
 LIB.unshift({id,title:d.meta.title,kind,t:Date.now(),w:0});BID=id;S=d;A={};dirtyA=true;snapsC=null;hist=[];redo=[];SEL.clear();who=S.chars[0].id;view='write';
 await DB.set('cur',id);await flush();setView('write');all()}
async function dupBook(id){await flush();const st=await DB.get('b_'+id),as=await DB.get('a_'+id),e=LIB.find(x=>x.id===id);if(!st)return;const nid=uid(),d=JSON.parse(JSON.stringify(st));d.meta.title=(d.meta.title||'Sans titre')+' (copie)';
 await DB.set('b_'+nid,d);if(as)await DB.set('a_'+nid,as);LIB.unshift({id:nid,title:d.meta.title,kind:e?e.kind:'sms',t:Date.now(),w:e?e.w:0});await DB.set('lib',LIB)}
async function delBook(id){await DB.set('b_'+id,null);await DB.set('a_'+id,null);await DB.set('s_'+id,null);LIB=LIB.filter(x=>x.id!==id);await DB.set('lib',LIB);if(id===BID){if(!LIB.length){await createBook('sms','')}else await switchBook(LIB[0].id)}}
async function libDlg(){await flush();const box=h('div',{class:'lib'}),close=()=>document.getElementById('mdNo').click();
 const tick=()=>new Promise(r=>setTimeout(r,80)),render=()=>box.replaceChildren(...LIB.slice().sort((a,b)=>b.t-a.t).map(b=>{const k=KINDS[b.kind]||KINDS.sms;
  return h('div',{class:'lb'+(b.id===BID?' cur':'')},[h('span',{class:'lbi'},k.i),h('div',{class:'lbt'},[h('b',{},b.title||'Sans titre'),h('small',{},k.n+' · '+(b.w||0)+' mots · '+new Date(b.t).toLocaleDateString('fr-FR'))]),
   h('button',{type:'button',class:'acc',onclick:async()=>{close();await tick();if(b.id!==BID)await switchBook(b.id)}},b.id===BID?'Ouvert':'Ouvrir'),
   h('button',{type:'button',title:'Dupliquer',onclick:async()=>{await dupBook(b.id);render()}},'⧉'),
   h('button',{type:'button',title:'Supprimer',onclick:async()=>{close();await tick();if(await sure('Supprimer définitivement « '+(b.title||'Sans titre')+' » ?'))await delBook(b.id);libDlg()}},'🗑')])}));
 render();box.append(h('div',{class:'tools'},[h('button',{type:'button',onclick:async()=>{close();await tick();newBookDlg()}},'＋ Nouveau livre…')]));
 await modal('Bibliothèque de livres',box,{ok:false,wide:true})}
async function newBookDlg(){let kind='sms';const ti=h('input',{placeholder:'Titre du livre (facultatif)'}),
 cards=Object.entries(KINDS).map(([k,v])=>h('button',{type:'button',class:'kc'+(k===kind?' on':''),'data-k':k,onclick:()=>{kind=k;cards.forEach(c=>c.classList.toggle('on',c.dataset.k===k))}},[h('span',{class:'kci'},v.i),h('b',{},v.n),h('small',{},v.d)]));
 const box=h('div',{},[h('div',{class:'kcs'},cards),h('label',{},['Titre',ti])]);
 if(!await modal('Nouveau livre',box,{ok:'Créer le livre',wide:true}))return;await createBook(kind,ti.value.trim())}

/* ═════ Accueil ═════ */
function homeHide(){const e=$('#home');if(e)e.hidden=true}
async function importBook(f){try{const d=JSON.parse(await f.text());if(!d.chapters)throw 0;const as=d.assets||{};delete d.assets;await flush();const id=uid();BID=id;S=norm(d);A=as;dirtyA=true;snapsC=null;hist=[];redo=[];LIB.unshift({id,title:S.meta.title||'Sans titre',kind:S.kind,t:Date.now(),w:words()});await DB.set('cur',id);await flush();homeHide();setView('write');all()}catch(e){toast('Fichier .json invalide.')}}
async function homeShow(){if(BID)await flush();let H=$('#home');if(!H){H=h('div',{id:'home'});document.body.append(H)}H.hidden=false;
 const tick=()=>new Promise(r=>setTimeout(r,80)),L=LIB.slice().sort((a,b)=>b.t-a.t);
 const card=b=>{const k=KINDS[b.kind]||KINDS.sms;return h('div',{class:'hb',tabindex:0,onclick:()=>switchBook(b.id),onkeydown:e=>{if(e.key==='Enter')switchBook(b.id)}},[h('span',{class:'hbi'},k.i),h('b',{},b.title||'Sans titre'),h('small',{},k.n+' · '+(b.w||0)+' mots'),h('small',{},new Date(b.t).toLocaleDateString('fr-FR')),
  h('div',{class:'hbx'},[h('button',{type:'button',title:'Dupliquer',onclick:async e=>{e.stopPropagation();await dupBook(b.id);homeShow()}},'⧉'),h('button',{type:'button',title:'Supprimer',onclick:async e=>{e.stopPropagation();if(await sure('Supprimer définitivement « '+(b.title||'Sans titre')+' » ?')){await tick();await delBook(b.id);homeShow()}}},'🗑')])])};
 const kc=Object.entries(KINDS).map(([k,v])=>h('button',{type:'button',class:'hk',onclick:async()=>{const r=await ask('Nouveau : '+v.n,[{k:'t',l:'Titre du livre (facultatif)',v:''}],'Créer le livre');if(r)await createBook(k,r.t.trim())}},[h('span',{class:'hbi'},v.i),h('b',{},v.n),h('small',{},v.d)]));
 H.replaceChildren(h('div',{class:'hw'},[h('h1',{},['Script',h('i',{},'orium')]),h('p',{class:'hs'},'L’atelier où chaque livre choisit sa façon d’être écrit.'),
  L.length?h('section',{},[h('h2',{},'Reprendre'),h('div',{class:'hg'},L.map(card))]):null,
  h('section',{},[h('h2',{},L.length?'Créer un nouveau livre':'Commencez par créer votre premier livre'),h('div',{class:'hg k'},kc)]),
  h('div',{class:'hf'},[h('button',{type:'button',onclick:async()=>{const f=(await pickFile('.json,application/json'))[0];if(f)importBook(f)}},'⤒ Importer un livre (.json)'),BID?h('button',{type:'button',class:'acc',onclick:homeHide},'Retour au livre ouvert'):null])]))}

/* ═════ Démarrage ═════ */
async function boot(){
 document.body.insertAdjacentHTML('beforeend',ANA_SVG+'<div id="lensov"></div>');
 const f=document.createElement('style');f.textContent=FONT_J+FONT_S;document.head.append(f);
 $('#lay').textContent=LAYOUT+LAYOUTX+PAGEDCSS;
 LIB=(await DB.get('lib'))||[];if(!Array.isArray(LIB))LIB=[];let first=false;
 if(!LIB.length){let st=await DB.get('state');const as=await DB.get('assets');
  if(!st){try{const raw=localStorage.getItem('smsbook2')||localStorage.getItem('smsbook');if(raw)st=JSON.parse(raw)}catch(e){}}
  first=!st;const id=uid();BID=id;S=norm(st||{});A=as&&typeof as==='object'?as:{};dirtyA=true;
  const u=usedAssets();A=u;if(!first)LIB=[{id,title:S.meta.title||'Sans titre',kind:S.kind,t:Date.now(),w:words()}];else{LIB=[];BID=''}
  const sn=await DB.get('snaps');if(sn)await DB.set('s_'+id,sn);if(!first)await DB.set('cur',id);who=S.chars[0].id}
 else{const cur=await DB.get('cur'),id=LIB.find(x=>x.id===cur)?cur:LIB[0].id;await loadBook(id)}
 view='write';setView('write');all();const sc=$('#xchat'),c=$('#chat');if(sc)sc.scrollTop=1e7;if(c)c.scrollTop=1e7;
 if(typeof expInfo==='function')expInfo();flush();
 setInterval(()=>{if(BID)snap('Automatique',true)},4*60*1000);homeShow()}
/* ═════ Moteur de pagination : mêmes pages pour l’aperçu, la double page, l’impression et KDP ═════ */
const GUT=n=>n<=150?9.6:n<=300?12.7:n<=500?15.9:n<=700?19.1:22.3;      // marge intérieure minimale KDP (mm)
const PAPER={white:['Blanc',0.0572],cream:['Crème',0.0635],color:['Couleur premium',0.0596]};
const BLEED=3.175;
const CONT=/(^| )(chp|xk|xc|jb|sin|pg)( |$)/,ATOM=/(^| )(tp|cp|dd|ep|part|back|anan)( |$)/;
let PG={count:0,map:{},gut:0,pages:0};
const pageDims=()=>PAGES[S.set.page]||PAGES.A5;
function marginsFor(n,i){const s=S.set,o=Math.max(6.4,+s.margin||18),g=s.gmode==='uni'?o:Math.max(o,GUT(Math.max(24,n))),rec=i%2===0;return{t:o,b:o,l:rec?g:o,r:rec?o:g,g}}
function mkPage(i,n,cls){const P=pageDims(),m=marginsFor(n,i),pg=h('div',{class:'page '+(i%2?'verso':'recto')+(S.set.mirror==='book'?' mirp':'')+(cls?' '+cls:''),style:'width:'+P.w+'mm;height:'+P.h+'mm;--mt:'+m.t+'mm;--mb:'+m.b+'mm;--ml:'+m.l+'mm;--mr:'+m.r+'mm'});
 const box=h('div',{class:'pbox',style:'left:'+m.l+'mm;right:'+m.r+'mm;top:'+m.t+'mm;bottom:'+m.b+'mm'});pg.append(box);pg._box=box;pg._map=new Map();pg._n=0;return pg}
function mountFor(pg,chain){let par=pg._box;for(const o of chain){let c=pg._map.get(o);if(!c){c=o.cloneNode(false);c.removeAttribute('id');par.append(c);pg._map.set(o,c)}par=c}return par}
function flat(sh){const out=[];(function go(el,chain){[...el.children].forEach(c=>{const cls=typeof c.className==='string'?c.className:'';if(c.tagName==='ARTICLE'||c.tagName==='OL'||CONT.test(cls))go(c,chain.concat(c));else out.push({node:c,chain})})})(sh,[sh]);return out}
const textNodes=el=>{const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),a=[];let n;while((n=w.nextNode()))a.push(n);return a};
const textLen=el=>textNodes(el).reduce((s,t)=>s+t.length,0);
function truncate(orig,k){const c=orig.cloneNode(true);let left=k;textNodes(c).forEach(t=>{if(left<=0)t.remove();else if(t.length>left){t.textContent=t.textContent.slice(0,left);left=0}else left-=t.length});return c}
function dropHead(orig,k){const c=orig.cloneNode(true);let first=true;textNodes(c).forEach(t=>{if(k>=t.length){k-=t.length;t.remove()}else{if(k>0){t.textContent=t.textContent.slice(k);k=0}if(first){t.textContent=t.textContent.replace(/^\s+/,'');first=false}}});return c}
const splittable=el=>el.matches&&el.matches('p,.sp,.jt,blockquote,li')&&!el.matches('.ap,.ly,.sbr,.ddoc');
function fitsIn(pg,node){const r=node.getBoundingClientRect(),b=pg._box.getBoundingClientRect();return r.bottom<=b.bottom+.5}
function splitFit(pg,mount,node){const orig=node.cloneNode(true);mount.removeChild(node);const total=textLen(orig);let lo=1,hi=total-1,best=0;
 while(lo<=hi){const mid=(lo+hi)>>1,t=truncate(orig,mid);mount.append(t);const ok=fitsIn(pg,t);mount.removeChild(t);if(ok){best=mid;lo=mid+1}else hi=mid-1}
 const txt=orig.textContent;let j=best;while(j>0&&!/\s/.test(txt[j-1]))j--;if(j>0)best=j;
 if(best<=0)return null;const head=truncate(orig,best),rest=dropHead(orig,best);if(rest.classList)rest.classList.remove('first');return{head,rest}}

function layout(cx,n){
 const s=S.set,root=buildBook(cx),host=h('div',{class:'bk pp paged',style:'position:absolute;left:-99999px;top:0;visibility:hidden;width:max-content'});document.body.append(host);
 const pages=[],map={},started=new Set();let cover=null,pg=null;
 const add=(g,cls)=>{const p=mkPage(pages.length,n,cls);p._g=g;host.append(p);pages.push(p);return p};
 const blank=()=>{const p=add('blank','blank');return p};
 try{
 [...root.children].forEach(sh=>{const g=sh.dataset.g||'front',cl=typeof sh.className==='string'?sh.className:'';
  if(g==='cover'){cover=sh;return}
  if(!started.has(g)){started.add(g);if(s.recto&&/^c\d+$/.test(g)&&pages.length%2===1)blank()}
  const ci=/^c(\d+)$/.exec(g);
  if(ATOM.test(cl)){const p=add(g,'atomp');p._box.append(sh);sh.classList.add('atom');return}
  pg=add(g);if(sh.id)pg.id=sh.id;
  if(ci&&/(^| )chp( |$)/.test(cl)){const c=S.chapters[+ci[1]];if(c)map[c.id]=pages.length}
  if(/(^| )toc( |$)/.test(cl))map.toc=pages.length;
  flat(sh).forEach(({node,chain})=>{
   if(node.matches&&node.matches('.sbr')){if(pg._n)pg=add(g);return}
   for(let guard=0;guard<500;guard++){
    const mount=mountFor(pg,chain);mount.append(node);
    if(fitsIn(pg,node)||!pg._n){pg._n++;return}
    if(splittable(node)){const r=splitFit(pg,mount,node);if(r){mount.append(r.head);pg._n++;pg=add(g);node=r.rest;continue}}
    else mount.removeChild(node);
    pg=add(g)}
  })});
 if(pages.length%2===1)blank();
 }finally{}
 const total=pages.length;
 pages.forEach((p,i)=>{p.dataset.n=i+1;const g=p._g,body=/^c\d+$/.test(g)||g==='back';
  if(body&&!p.classList.contains('blank')){
   if(s.pnum){const o=s.pnpos==='outer';p.append(h('div',{class:'pn '+(o?(i%2?'l':'r'):'c')},String(i+1)))}
   if(s.runhead){const c=/^c(\d+)$/.exec(g),t=i%2===0&&c&&S.chapters[+c[1]]?S.chapters[+c[1]].title:S.meta.title;p.append(h('div',{class:'rh'},t||''))}}});
 pages.forEach(p=>{const x=p._box.querySelector('.xc');if(x){const cs=getComputedStyle(x);['backgroundColor','backgroundImage','backgroundSize','backgroundPosition','backgroundRepeat'].forEach(k=>{p.style[k]=cs[k]});x.style.background='none';x.style.backgroundImage='none'}});
 host.remove();return{pages,cover,map,count:total}}

function pagedBook(cx){let n=PG.count||40,res;
 for(let k=0;k<3;k++){res=layout(cx,n);const stable=GUT(Math.max(24,res.count))===GUT(Math.max(24,n))||S.set.gmode==='uni';n=res.count;if(stable)break}
 if((S.set.toc||S.kind==='lab')&&!cx.pgmap){const c2=Object.assign({},cx,{pgmap:res.map});res=layout(c2,res.count)}
 PG={count:res.count,map:res.map,gut:marginsFor(res.count,0).g};
 const wrap=h('div',{class:'bk pp paged'});
 let cov=null;if(res.cover){cov=h('div',{class:'page cover atomp',style:'width:'+pageDims().w+'mm;height:'+pageDims().h+'mm'});const b=h('div',{class:'pbox',style:'inset:0'});b.append(res.cover);res.cover.classList.add('atom');cov.append(b)}
 return{pages:res.pages,cover:cov,count:res.count,map:res.map}}

/* ═════ Aperçu : continu / pages / double page ═════ */
let BKM='pages',BKT=0,BKZ=0;
function bookView(){clearTimeout(BKT);const w=$('#bwrap');if(BKM!=='flow'&&!w.firstChild)w.replaceChildren(h('div',{class:'empty'},'Mise en page…'));BKT=setTimeout(bookDraw,view==='book'?90:0)}
function bookDraw(){const w=$('#bwrap');if(!w||view!=='book')return;const sc=w.scrollTop;
 $$('#bkMode button').forEach(b=>b.classList.toggle('on',b.dataset.m===BKM));
 if(BKM==='flow'){w.replaceChildren(buildBook({th:LIGHT,src:id=>A[id]||'',ratio:true}));$('#bkInfo').textContent='';return}
 const r=pagedBook({th:LIGHT,src:id=>A[id]||'',noAnchors:true}),P=pageDims(),spread=BKM==='spread',need=(spread?P.w*2:P.w)*96/25.4,z=BKZ?BKZ/100:Math.max(.3,Math.min(1.4,(w.clientWidth-40)/need));
 const hold=h('div',{class:'bk pp paged pv',style:'zoom:'+z});
 if(r.cover)hold.append(h('div',{class:'pgw single'},[r.cover]));
 if(!spread)r.pages.forEach(p=>hold.append(h('div',{class:'pgw single'},[p])));
 else{const L=r.pages.slice();hold.append(h('div',{class:'spread'},[h('div',{class:'page ghost',style:'width:'+P.w+'mm;height:'+P.h+'mm'}),L.shift()]));
  while(L.length){const a=L.shift(),b=L.shift();hold.append(h('div',{class:'spread'},[a,b||h('div',{class:'page ghost',style:'width:'+P.w+'mm;height:'+P.h+'mm'})]))}}
 w.replaceChildren(hold);w.scrollTop=sc;
 $('#bkInfo').textContent=r.count+' pages · '+P.w+' × '+P.h+' mm · reliure '+PG.gut.toFixed(1).replace('.',',')+' mm';kdpUpdate()}
function printBuild(){const r=pagedBook({th:LIGHT,src:id=>A[id]||'',noAnchors:true}),P=pageDims(),wrap=h('div',{class:'bk pp paged'});
 if(r.cover&&S.set.cvPdf!==false)wrap.append(r.cover);r.pages.forEach(p=>wrap.append(p));
 $('#pr').replaceChildren(wrap);$('#pgs').textContent='@page{size:'+P.w+'mm '+P.h+'mm;margin:0}';$('#lay').textContent=LAYOUT+LAYOUTX+PAGEDCSS;kdpUpdate()}
function doPrint(){try{printBuild();print()}catch(e){console.error(e);toast('Impression bloquée ici : ouvrez le fichier dans votre navigateur.')}}
function exportPagedHTML(){const r=pagedBook({th:LIGHT,src:id=>A[id]||'',noAnchors:true}),P=pageDims(),k=S.kind,wrap=h('div',{class:'bk pp paged'});
 if(r.cover&&S.set.cvPdf!==false)wrap.append(r.cover);r.pages.forEach(p=>wrap.append(p));
 const css='body{margin:0;background:#d4d8e3}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}'+(k==='sms'?bookCSS(S.set,LIGHT,'.bk'):modeCSS(k))+LAYOUT+LAYOUTX+PAGEDCSS+(k==='ana'?LENSBAR_CSS:'')+'@page{size:'+P.w+'mm '+P.h+'mm;margin:0}@media screen{.paged .page{margin:14px auto;box-shadow:0 6px 24px -10px rgba(0,0,0,.4)}}';
 let pre='',js='';if(k==='ana'){pre=ANA_SVG+'<div class="lensbar"><button data-l="none" class="on">Sans lunettes</button><button data-l="red">🔴 Verre rouge</button><button data-l="cyan">🔵 Verre cyan</button><label>Relief <input type="range" min="0" max="3" step=".25" value="1"></label></div>';js='('+anaRuntime+')()'}else if(KR[k])js='('+mechRuntime+')(document.body)';
 dl(slug()+'-pages.html','<!DOCTYPE html>\n<html lang="'+esc(S.meta.lang)+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(S.meta.title)+'</title><style>'+css+'</style></head><body>'+pre+wrap.outerHTML+(js?'<script>'+js+'<\/script>':'')+'</body></html>','text/html')}
const PAGEDCSS=`
.paged .page{position:relative;box-sizing:border-box;background:#fff;overflow:hidden;break-after:page;page-break-after:always;color:#171a22}
.paged .pbox{position:absolute;overflow:hidden}
.paged .page .sheet{padding:0!important;margin:0!important;max-width:none!important;box-shadow:none!important;border-radius:0!important;overflow:visible!important;min-height:0!important;break-after:auto!important}
.paged .page .sheet:not(.cv):not(.cvx){background:transparent!important}
.paged .ph{font-size:0!important}
.paged .page .sheet.atom{position:absolute;inset:0;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;box-sizing:border-box;padding:6%!important;overflow:hidden!important}
.paged .page.cover .sheet.atom{padding:10% 8%!important}
.paged .page .sheet.cv,.paged .page .sheet.cvx{aspect-ratio:auto!important;height:100%!important;min-height:0!important;padding:10% 8%!important}
.paged .page .sheet.cp{justify-content:flex-end}.paged .page .sheet.anan,.paged .page .sheet.back{justify-content:flex-start;align-items:stretch}
.paged .page .tp,.paged .page .dd,.paged .page .ep,.paged .page .part{min-height:0!important}
.paged .page .xc{min-height:calc(100% + var(--mt) + var(--mb))!important;box-shadow:none!important;border-radius:0!important;margin:calc(var(--mt)*-1) calc(var(--mr)*-1) calc(var(--mb)*-1) calc(var(--ml)*-1)!important;padding:var(--mt) var(--mr) var(--mb) var(--ml)!important}
.paged .page .xc-spell .sin,.paged .page .xc-ana .sin{padding:0!important}.paged .page .xc-journal .jb{padding-top:0!important;padding-bottom:0!important;padding-right:0!important}
.paged .page .xc-journal.ln .jb{padding-left:7%!important}
.paged .page .toc li{display:flex;align-items:baseline}.paged .page .toc li .tl{flex:1;border-bottom:1px dotted #999;margin:0 .4em}
.paged .pn,.paged .rh{position:absolute;font:10px Georgia,serif;color:#555;z-index:3}
.paged .pn{bottom:calc(var(--mb)*.3)}.paged .pn.c{left:0;right:0;text-align:center}.paged .pn.r{right:var(--mr)}.paged .pn.l{left:var(--ml)}
.paged .rh{top:calc(var(--mt)*.35);left:var(--ml);right:var(--mr);text-align:center;font-style:italic;color:#777}
.paged .page .it,.paged .page .rp{break-inside:avoid}
@media screen{.pv .page.mirp .pbox{transform:scaleX(-1)}}.paged .page.mirp .pbox{transform:scaleX(-1)}
@media print{.paged .page:last-child{break-after:auto!important;page-break-after:auto!important}.paged .page{margin:0!important;box-shadow:none!important}.paged .pgw,.paged .spread{display:block;margin:0}}
@media screen{.pv{width:max-content;margin:0 auto}.pv .pgw{margin:14px auto;width:max-content}.pv .page{box-shadow:0 6px 24px -10px rgba(0,0,0,.45)}.pv .spread{display:flex;width:max-content;margin:14px auto;position:relative}.pv .spread .page{box-shadow:none}.pv .spread .page.ghost{background:transparent}.pv .spread:after{content:'';position:absolute;top:0;bottom:0;left:50%;width:46px;margin-left:-23px;background:linear-gradient(90deg,transparent,rgba(0,0,0,.2) 46%,rgba(0,0,0,.34) 50%,rgba(0,0,0,.2) 54%,transparent);pointer-events:none;z-index:6}.pv .spread{box-shadow:0 8px 28px -10px rgba(0,0,0,.5)}}`;

/* ═════ KDP : tranche, couverture, marges ═════ */
function kdpData(){const s=S.set,P=pageDims(),n=Math.max(PG.count||0,0),rate=(PAPER[s.paper]||PAPER.white)[1],spine=n*rate;
 return{n,P,rate,spine,cw:2*P.w+spine+2*BLEED,ch:P.h+2*BLEED,gut:marginsFor(n||40,0).g}}
function kdpUpdate(){const B=$('#kdpBox');if(!B)return;const d=kdpData(),f=(x,p)=>x.toFixed(p==null?2:p).replace('.',','),inch=x=>(x/25.4).toFixed(3).replace('.',',');
 const w=[];if(d.n&&d.n<24)w.push('KDP demande au moins 24 pages.');if(d.n>828)w.push('KDP accepte au plus 828 pages (broché).');if(d.n&&d.n<80)w.push('Sous environ 80 pages, la tranche est trop fine pour y imprimer du texte.');
 B.replaceChildren(h('div',{class:'kr'},[h('span',{},'Pages (intérieur)'),h('b',{},String(d.n||'—'))]),h('div',{class:'kr'},[h('span',{},'Marge de reliure'),h('b',{},f(d.gut,1)+' mm')]),
  h('div',{class:'kr'},[h('span',{},'Tranche'),h('b',{},f(d.spine)+' mm')]),h('div',{class:'kr'},[h('span',{},'Couverture à plat'),h('b',{},f(d.cw)+' × '+f(d.ch)+' mm')]),
  h('div',{class:'kr'},[h('span',{},'en pouces'),h('b',{},inch(d.cw)+' × '+inch(d.ch)+' po')]),
  h('p',{class:'small'},'Couverture = 4ᵉ + tranche + 1ʳᵉ + fonds perdus de '+f(BLEED,3)+' mm sur chaque bord. Les pages comptées incluent les pages blanches ajoutées.'),...w.map(t=>h('p',{class:'warn'},'⚠ '+t)))}
function kdpRecalc(){const r=pagedBook({th:LIGHT,src:id=>A[id]||'',noAnchors:true});kdpUpdate();return r}
function kdpSvg(){const d=kdpData(),b=BLEED,W=d.cw,H=d.ch,P=d.P,sp=d.spine,safe=3.2;
 const x1=b+P.w,x2=x1+sp;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W.toFixed(3)}mm" height="${H.toFixed(3)}mm" viewBox="0 0 ${W.toFixed(3)} ${H.toFixed(3)}" font-family="sans-serif">
<rect width="${W}" height="${H}" fill="#fff"/>
<rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#e00" stroke-width=".3"/>
<rect x="${b}" y="${b}" width="${W-2*b}" height="${P.h}" fill="none" stroke="#0a0" stroke-width=".3" stroke-dasharray="2 1"/>
<rect x="${x1}" y="${b}" width="${sp}" height="${P.h}" fill="#eef"/>
<line x1="${x1}" y1="0" x2="${x1}" y2="${H}" stroke="#00f" stroke-width=".25"/><line x1="${x2}" y1="0" x2="${x2}" y2="${H}" stroke="#00f" stroke-width=".25"/>
<rect x="${b+safe}" y="${b+safe}" width="${P.w-2*safe}" height="${P.h-2*safe}" fill="none" stroke="#999" stroke-width=".2" stroke-dasharray="1 1"/>
<rect x="${x2+safe}" y="${b+safe}" width="${P.w-2*safe}" height="${P.h-2*safe}" fill="none" stroke="#999" stroke-width=".2" stroke-dasharray="1 1"/>
<text x="${b+P.w/2}" y="${H/2}" text-anchor="middle" font-size="6" fill="#888">4ᵉ de couverture</text>
<text x="${x2+P.w/2}" y="${H/2}" text-anchor="middle" font-size="6" fill="#888">1ʳᵉ de couverture</text>
<text x="${x1+sp/2}" y="${H/2}" text-anchor="middle" font-size="3" fill="#66a" transform="rotate(90 ${x1+sp/2} ${H/2})">tranche ${sp.toFixed(2)} mm</text>
<text x="${W/2}" y="${H-1.2}" text-anchor="middle" font-size="2.4" fill="#e00">rouge : bord du fond perdu · vert : rogné · gris : zone de sécurité · bleu : tranche — ${W.toFixed(2)} × ${H.toFixed(2)} mm, ${d.n} pages</text></svg>`;
 dl('gabarit-couverture-'+slug()+'.svg',svg,'image/svg+xml')}
/* ═════ Mode sans distraction · chronomètre · bruit blanc · commandes / ═════ */
const FOC={on:false,t0:0,acc:0,run:false,w0:0,goal:300,iv:0,au:null};
const SLASH={};
function slashReg(name,kinds,desc,fn){SLASH[name]={kinds,desc,fn}}
function slashList(){return Object.entries(SLASH).filter(([k,v])=>!v.kinds||v.kinds.includes(S.kind)).map(([k,v])=>[k,v.desc])}
function slashRun(txt){const m=/^\/(\S+)\s*([\s\S]*)$/.exec(txt.trim());if(!m)return false;const c=SLASH[m[1].toLowerCase()];if(!c||(c.kinds&&!c.kinds.includes(S.kind)))return false;c.fn(m[2]);return true}
slashReg('titre',null,'Ajouter un titre',a=>xAdd({type:'title',text:a||'Titre'}));
slashReg('sep',null,'Séparateur',()=>xAdd({type:'sep'}));
slashReg('saut',null,'Saut de page',()=>xAdd({type:'break'}));
slashReg('note',null,'Note d’auteur (jamais imprimée)',a=>xAdd({type:'text',text:a||'Note…',who:'note'}));
slashReg('focus',null,'Mode sans distraction',()=>focusToggle());
slashReg('chapitre',null,'Nouveau chapitre',a=>addChapter(a||undefined));
function slashBox(ta){let B=$('#xslash');if(!B){B=h('div',{id:'xslash',hidden:true});ta.parentNode.append(B)}
 const v=ta.value;if(!v.startsWith('/')||/\s/.test(v)){B.hidden=true;return}
 const q=v.slice(1).toLowerCase(),L=slashList().filter(([k])=>k.startsWith(q));
 if(!L.length){B.hidden=true;return}B.hidden=false;B.replaceChildren(...L.map(([k,d])=>h('button',{type:'button',onclick:()=>{ta.value='/'+k+' ';ta.focus();B.hidden=true}},[h('b',{},'/'+k),h('span',{},d)])))}
const fmtT=s=>{s=Math.floor(s/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
function focusTick(){const e=FOC.acc+(FOC.run?Date.now()-FOC.t0:0),w=words()-FOC.w0,g=Math.max(1,FOC.goal|0);
 const t=$('#ftime');if(t)t.textContent=fmtT(e);const p=$('#fprog');if(p){p.style.width=Math.max(0,Math.min(100,w/g*100))+'%';p.parentNode.title=w+' / '+g+' mots'}const c=$('#fcount');if(c)c.textContent=Math.max(0,w)+' / '+g+' mots'}
function noiseToggle(){if(FOC.au){try{FOC.au.close()}catch(e){}FOC.au=null;return false}
 try{const ac=new (window.AudioContext||window.webkitAudioContext)(),len=ac.sampleRate*3,buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);let last=0;
  for(let i=0;i<len;i++){const w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=last*3.5}
  const src=ac.createBufferSource();src.buffer=buf;src.loop=true;const g=ac.createGain();g.gain.value=.25;src.connect(g);g.connect(ac.destination);src.start();FOC.au=ac;return true}catch(e){toast('Audio indisponible.');return false}}
function focusOn(){FOC.on=true;document.body.classList.add('focus');FOC.w0=words();FOC.acc=0;FOC.t0=Date.now();FOC.run=true;
 try{if(document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{})}catch(e){}
 let B=$('#fbar');if(!B){B=h('div',{id:'fbar'});document.body.append(B)}B.hidden=false;
 const pause=h('button',{type:'button',onclick:()=>{if(FOC.run){FOC.acc+=Date.now()-FOC.t0;FOC.run=false;pause.textContent='▶'}else{FOC.t0=Date.now();FOC.run=true;pause.textContent='⏸'}}},'⏸'),
  goal=h('input',{type:'number',min:1,value:FOC.goal,title:'Objectif de la session (mots)',oninput:()=>{FOC.goal=+goal.value||1;focusTick()}}),
  noise=h('button',{type:'button',onclick:()=>{noise.classList.toggle('on',noiseToggle())}},'🌊 Bruit blanc');
 B.replaceChildren(h('b',{id:'ftime'},'00:00'),pause,h('span',{},'Objectif'),goal,h('div',{class:'fbar'},[h('i',{id:'fprog'})]),h('span',{id:'fcount'}),noise,h('button',{type:'button',onclick:focusOff},'✕ Quitter'));
 clearInterval(FOC.iv);FOC.iv=setInterval(focusTick,500);focusTick();toast('Mode sans distraction · Échap pour quitter')}
function focusOff(){if(!FOC.on)return;FOC.on=false;document.body.classList.remove('focus');clearInterval(FOC.iv);if(FOC.au){try{FOC.au.close()}catch(e){}FOC.au=null}
 const B=$('#fbar');if(B)B.hidden=true;try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}
 const mins=Math.round((FOC.acc+(FOC.run?Date.now()-FOC.t0:0))/60000),w=words()-FOC.w0;toast('Session : '+mins+' min · '+w+' mots')}
function focusToggle(){FOC.on?focusOff():focusOn()}
addEventListener('keydown',e=>{if(e.key==='F'&&e.shiftKey&&(e.ctrlKey||e.metaKey)){e.preventDefault();focusToggle()}else if(e.key==='Escape'&&FOC.on&&!document.querySelector('dialog[open]')&&document.activeElement&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)&&!document.activeElement.isContentEditable)focusOff()});
$('#bFocus').onclick=focusToggle;
/* ═════ Mécaniques de lecture non linéaires ═════
   Palimpseste · Dossier d’enquête · Labyrinthe à renvois · Pliage · Spirale/calligrammes · Partition/rythme · Miroir (transversal)
   Chaque mécanique est un « type de livre » enregistré dans KR ; le moteur de pagination, les exports et la sauvegarde la traitent comme les autres. */

const MIRCSS='.mir{transform:scaleX(-1)}.mirall .xc{transform:scaleX(-1)}@media print{.nopr{display:none!important}}';
const MIRAPP='#xrpage.mirror .xc{transform:scaleX(-1)}#bwrap.mirror .pv .page,#bwrap.mirror .bk:not(.pv){transform:scaleX(-1)}#labg{margin-top:10px}#labg svg{width:100%;height:auto;background:rgba(255,255,255,.04);border-radius:10px}#labg .lgl{font-size:11px;opacity:.8;line-height:1.5;margin-top:4px}';
let MIRV=false;
function mirBtn(target){const b=h('button',{type:'button',class:MIRV?'on':'',title:'Lire en miroir (retourne le texte, pour un miroir ou un verso)',onclick:()=>{MIRV=!MIRV;b.classList.toggle('on',MIRV);const p=$(target);if(p)p.classList.toggle('mirror',MIRV)}},'🪞 Miroir');
 if(MIRV)setTimeout(()=>{const p=$(target);if(p)p.classList.add('mirror')});
 return h('div',{class:'lensbar',style:'position:static;border-radius:8px;padding:4px 8px'},[b])}

/* ── SVG ── */
const SVGNS='http://www.w3.org/2000/svg';
function sv(tag,at,kids){const e=document.createElementNS(SVGNS,tag);Object.entries(at||{}).forEach(([k,v])=>{if(v!=null)e.setAttribute(k,v)});(kids||[]).forEach(k=>e.append(k));return e}

/* ── Briques communes ── */
function xFig(m,cx,cls){const u=m.img&&cx.src(m.img),f=h('figure',{class:'xfig '+(cls||''),style:m.tilt!=null&&m.tilt!==''?'--tilt:'+m.tilt+'deg':null});
 f.append(u?h('img',{src:u,alt:m.cap||''}):h('div',{class:'ph'},'🖼'));if(m.cap)f.append(h('figcaption',{},m.cap));
 if(cx.edit&&!m.img){f.style.cursor='pointer';f.onclick=async()=>{const id=await pickImg();if(id)mut(()=>{m.img=id})}}return f}
function fieldCard(m,cx,fields,build){const prev=h('div',{class:'fcp'}),draw=()=>prev.replaceChildren(build()),card=h('div',{class:'fcd'},[prev]);draw();
 fields.forEach(([prop,lab])=>{const t=h('div',{class:'fcf'});t.append(...fmt(m[prop]||''));editable(t,m,cx,v=>{draw();return fmt(v)},prop);card.append(h('div',{class:'fcl'},[h('span',{class:'fct'},lab),t]))});return card}
const ctlOn=cx=>!cx.edit&&!cx.noAnchors;
function xBase(k,c,cx,itemFn,head){const root=h('article',{class:'xc xc-'+k+(ctlOn(cx)?' rd':'')+(k==='dos'&&S.set.dosReveal!==false&&ctlOn(cx)?' rv':''),style:k==='pal'?'--pf:'+((S.set.palFade||55)/100):null}),sin=h('div',{class:'sin'});root.append(sin);
 sin.append(head?head(c,cx):h('h2',{class:'xh'},c.title||'Sans titre'));
 cx.msgs.forEach(m=>{const t=m.type||'text';let el;
  if(m.who==='note'){if(cx.edit)sin.append(wrapI(noteEl(m,cx),m,cx));return}
  if(t==='break')el=h('div',{class:'sbr'},cx.edit?'⤓ saut de page':'');
  else if(t==='sep')el=h('div',{class:'xsep'},'✦ ✦ ✦');
  else if(t==='title'){el=h('h3',{class:'xt3'});el.append(...fmt(m.text||''));if(cx.edit)editable(el,m,cx,fmt)}
  else if(t==='img')el=xFig(m,cx,'');
  else el=itemFn(m,t,cx);
  if(!el){el=h('p',{class:'xp'});el.append(...fmt(m.text||''));if(cx.edit)editable(el,m,cx,fmt)}
  sin.append(wrapI(el,m,cx))});
 return root}
const wrapRaw=(a,b)=>{const t=$('#xta');if(!t)return;const s=t.selectionStart,e=t.selectionEnd,sel=t.value.slice(s,e)||'texte';t.setRangeText(a+sel+b,s,e,'end');t.focus()};
const COVO=[['plain','Unie'],['image','Image seule']];

/* ═════ 1 · PALIMPSESTE ═════ */
function palItem(m,t,cx){if(t!=='pal')return null;
 const build=()=>{const el=h('div',{class:'pal'}),u=h('div',{class:'pu'}),o=h('div',{class:'po'});u.append(...fmt(m.b||''));o.append(...fmt(m.a||''));el.append(u,o);if(ctlOn(cx))el.append(h('span',{class:'pgr nopr'},'✋ gratter'));return el};
 return cx.edit?fieldCard(m,cx,[['a','Texte de surface (le plus récent)'],['b','Texte gratté en dessous (l’ancien)']],build):build()}
KR.pal={n:'Palimpseste',i:'📜',d:'Un texte récent écrit par-dessus un texte gratté : on gratte la surface pour lire l’ancien.',fs:true,cover:['palp','#e3d2a6','#7a5a30'],covOpts:[['palp','Parchemin gratté'],...COVO],
 cvcss:".cvx-palp{background:#e3d2a6;color:#2a2014;background-image:radial-gradient(ellipse at 50% 30%,#fff8,transparent 70%),repeating-linear-gradient(0deg,rgba(90,60,20,.07) 0 3px,transparent 3px 8px)}.cvx-palp .cvt{font-family:'SBS Fell',Georgia,serif;text-shadow:4px 4px 0 rgba(120,80,30,.22)}.cvx-palp:before{content:attr(data-g);display:none}",
 starter:(T,X)=>[X({type:'title',text:'Le grimoire de la cave'}),T('Ce carnet appartient à Madame Vasseur. Toute personne qui le trouve est priée de le rendre.'),X({type:'pal',a:'Tout va bien, la maison est calme.',b:'Ne descendez jamais seule à la cave : quelque chose répond quand on l’appelle.'}),T('Cliquez sur un passage en lecture pour gratter la surface.')],
 chapter:(c,cx)=>xBase('pal',c,cx,palItem),
 css:()=>`.xc-pal{background:#efe0bd;color:#2a2014;font:italic 19px/1.65 'SBS Fell',Georgia,serif;padding:6% 9%;min-height:72vh;border-radius:3px;background-image:radial-gradient(ellipse at 50% 0%,rgba(255,255,255,.45),transparent 65%),repeating-linear-gradient(0deg,rgba(100,70,30,.05) 0 3px,transparent 3px 9px)}
.xc-pal .xh{font:600 1.9em/1.15 'SBS Cinzel',Georgia,serif;text-align:center;margin:.2em 0 1em;font-style:normal;color:#5a3a14}.xc-pal .xt3{font:600 1.3em 'SBS Cinzel',Georgia,serif;font-style:normal;text-align:center;margin:1em 0 .4em}.xc-pal .xp{margin:0 0 .8em;text-indent:1.4em}.xc-pal .xsep{text-align:center;color:#8a5a1c;margin:1em 0}
.pal{display:grid;margin:1em 0;position:relative;cursor:default}.pal>.pu,.pal>.po{grid-area:1/1;transition:opacity .9s ease,filter .9s ease}
.pal .pu{color:#7a4a18;opacity:var(--pf,.55);transform:rotate(-1.3deg) translate(7px,6px);font-size:.96em;padding-left:1em}
.pal .po{color:#2a2014;mix-blend-mode:multiply;text-shadow:0 0 .5px #2a2014}
.rd .pal{cursor:pointer}.rd .pal:hover .po,.pal.scr .po{opacity:.16;filter:blur(.7px)}.rd .pal:hover .pu,.pal.scr .pu{opacity:1;color:#4a2a08}
.pal .pgr{position:absolute;right:0;bottom:-1.3em;font:12px system-ui;font-style:normal;color:#8a5a1c;opacity:.7}
.paged .pal .pgr{display:none}`,
 btns:({add,xAdd,btn,ta,tb,val})=>{ta.placeholder='Texte de surface (récent)…';tb.style.display='';tb.placeholder='Texte gratté dessous (ancien)…';
  return[btn('Ajouter ↵',()=>add('text'),'Paragraphe simple','acc'),btn('📜 Palimpseste',()=>{const a=ta.value.trim(),b=tb.value.trim();if(!a&&!b)return;xAdd({type:'pal',a,b});ta.value=tb.value='';ta.focus()},'Texte de surface + texte gratté dessous'),btn('Titre',()=>add('title')),btn('✦',()=>xAdd({type:'sep'}),'Séparateur'),btn('⤓',()=>xAdd({type:'break'}),'Saut de page')]},
 ph:'Texte de surface (le plus récent)…',hint:'Entrée ajoute un paragraphe · 📜 Palimpseste = surface (zone du haut) + ancien texte gratté (zone du dessous).'};

/* ═════ 2 · DOSSIER D’ENQUÊTE ═════ */
const DOS_TPL={rapport:'Rapport',lettre:'Lettre',ticket:'Ticket / reçu',interro:'Interrogatoire',telegramme:'Télégramme'};
const DOS_HEAD={rapport:'RAPPORT',lettre:'',ticket:'REÇU',interro:'PROCÈS-VERBAL D’INTERROGATOIRE',telegramme:'TÉLÉGRAMME'};
const DOS_STAMP=[['CONFIDENTIEL','#b3261e'],['SECRET DÉFENSE','#b3261e'],['PIÈCE À CONVICTION','#1f4e9c'],['CLASSÉ','#1c6b3a'],['URGENT','#b3261e'],['NON ÉLUCIDÉ','#6a2c91']];
function dosNodes(text){text=text||'';const out=[],re=/\[\[([^\]]+)\]\]/g;let last=0,m;
 while((m=re.exec(text))){if(m.index>last)out.push(...fmtN(text.slice(last,m.index)));out.push(h('span',{class:'rdx',title:'Passage caviardé'},m[1]));last=m.index+m[0].length}
 if(last<text.length)out.push(...fmtN(text.slice(last)));return out}
function dosItem(m,t,cx){
 if(t==='text'){const el=h('p',{class:'xp dt'});el.append(...dosNodes(m.text));if(cx.edit)editable(el,m,cx,dosNodes);return el}
 if(t==='doc'){const tpl=m.tpl||'rapport',el=h('p',{class:'ddoc tpl-'+tpl+(m.clip===false?'':' clip'),style:m.tilt!=null&&m.tilt!==''?'--tilt:'+m.tilt+'deg':null}),hd=m.head!=null&&m.head!==''?m.head:DOS_HEAD[tpl],b=h('span',{class:'dbd'});
  if(hd)el.append(h('span',{class:'dhd'},hd));b.append(...dosNodes(m.text));if(cx.edit)editable(b,m,cx,dosNodes);el.append(b);return el}
 if(t==='stamp')return h('div',{class:'dst',style:'--rot:'+(m.rot==null||m.rot===''?-8:m.rot)+'deg;--col:'+(m.col||'#b3261e')},m.text||'CONFIDENTIEL');
 if(t==='photo')return xFig(m,cx,'dph clip');
 return null}
KR.dos={n:'Dossier d’enquête',i:'🗂️',d:'Pièces à conviction : rapports, lettres, tickets, tampons, passages caviardés révélables, photos et trombones.',cover:['dossier','#cfa968','#7a4a14'],covOpts:[['dossier','Chemise cartonnée'],...COVO],
 cvcss:".cvx-dossier{background:#cfa968;color:#2a1c0a;background-image:linear-gradient(135deg,#ffffff30,transparent 50%),repeating-linear-gradient(0deg,rgba(90,50,10,.06) 0 2px,transparent 2px 6px)}.cvx-dossier .cvt{font-family:'Courier New',monospace;letter-spacing:.04em}.cvx-dossier:before{content:'CONFIDENTIEL';position:absolute;top:12%;left:50%;transform:translateX(-50%) rotate(-9deg);border:4px solid #b3261e;color:#b3261e;padding:.05em .5em;font:700 1.25em Georgia,serif;opacity:.82;letter-spacing:.12em;z-index:2;white-space:nowrap}",
 starter:(T,X)=>[X({type:'title',text:'Dossier n° 47 — Disparition du phare'}),X({type:'stamp',text:'CONFIDENTIEL',col:'#b3261e'}),X({type:'doc',tpl:'rapport',head:'RAPPORT N° 47-B',text:'Le [[gardien Marcel Dufour]] a été vu pour la dernière fois le 12 octobre, vers 22 h. Aucune trace d’effraction. La lampe du phare était [[encore allumée]].'}),X({type:'photo',cap:'Pièce n° 3 — la porte du phare',img:''}),T('Témoin entendu : « Il me parlait sans cesse de [[la cave]]. »'),X({type:'doc',tpl:'ticket',text:'Quincaillerie du Port\n1 cadenas ......... 8,50\n1 corde ........... 6,00\nTOTAL ............ 14,50'})],
 chapter:(c,cx)=>xBase('dos',c,cx,dosItem),
 css:()=>`.xc-dos{background:#e9e2d0;color:#1d1a14;font:16px/1.6 'Courier New',Courier,monospace;padding:6% 8%;min-height:72vh;border-radius:3px;background-image:radial-gradient(ellipse at 20% 0%,rgba(255,255,255,.5),transparent 60%)}
.xc-dos .xh{font:700 1.5em/1.2 'Courier New',monospace;text-transform:uppercase;letter-spacing:.08em;border-bottom:3px double #1d1a14;padding-bottom:.3em;margin:0 0 1em}.xc-dos .xt3{font:700 1.1em 'Courier New',monospace;text-transform:uppercase;margin:1em 0 .4em}.xc-dos .xp{margin:0 0 .7em}.xc-dos .xsep{text-align:center;letter-spacing:.4em;margin:1em 0;color:#777}
.rdx{background:#111;color:#111;border-radius:2px;padding:0 .12em;box-decoration-break:clone;-webkit-box-decoration-break:clone}.rv .rdx{cursor:pointer}.rv .rdx.open{background:rgba(0,0,0,.09);color:inherit;outline:1px dashed #b3261e}
.ddoc{display:block;position:relative;margin:1.2em 0;padding:1em 1.2em;background:#fffdf4;border:1px solid #cfc7ac;box-shadow:0 2px 6px -2px rgba(0,0,0,.35);transform:rotate(var(--tilt,-.4deg));white-space:pre-wrap}
.ddoc .dhd{display:block;font-weight:700;letter-spacing:.1em;border-bottom:1px solid #1d1a14;margin-bottom:.6em;padding-bottom:.2em}
.ddoc.clip:before{content:'';position:absolute;left:18px;top:-14px;width:16px;height:38px;border:3px solid #8a9099;border-radius:9px;border-bottom-color:transparent;box-shadow:inset 0 0 0 1px #fff6}
.tpl-lettre{font-family:Georgia,serif;font-style:italic;background:#fbf3df}.tpl-ticket{font-size:.92em;max-width:70%;margin-left:auto;margin-right:auto;border-style:dashed;background:#fff}.tpl-interro .dbd{display:block}.tpl-telegramme{background:#f3e5b8;text-transform:uppercase;letter-spacing:.05em}
.dst{display:block;width:max-content;max-width:100%;margin:1em auto;padding:.1em .6em;border:4px solid var(--col);color:var(--col);font:700 1.5em Georgia,serif;letter-spacing:.14em;transform:rotate(var(--rot,-8deg));opacity:.86;border-radius:6px;text-align:center}
.dph{margin:1.2em auto;width:min(70%,320px);background:#fff;padding:8px 8px 6px;box-shadow:0 3px 9px -3px rgba(0,0,0,.45);transform:rotate(var(--tilt,2deg));position:relative}.dph img,.dph .ph{display:block;width:100%;height:auto;min-height:110px;background:#ccc;filter:grayscale(.6) contrast(1.1)}.dph figcaption{font:12px 'Courier New',monospace;text-align:center;padding-top:5px}
.dph.clip:before{content:'';position:absolute;right:20px;top:-14px;width:16px;height:38px;border:3px solid #8a9099;border-radius:9px;border-bottom-color:transparent}`,
 btns:({add,xAdd,btn,imgAdd,ta,val})=>[btn('Ajouter ↵',()=>add('text'),'Ajouter un paragraphe','acc'),
  btn('📄 Pièce ▾',e=>menu(e.currentTarget,Object.entries(DOS_TPL).map(([k,l])=>[l,()=>{const v=val();xAdd({type:'doc',tpl:k,text:v||'Texte de la pièce…'});ta.value=''}])),'Ajouter une pièce du dossier (le texte saisi devient son contenu)'),
  btn('🔴 Tampon ▾',e=>menu(e.currentTarget,DOS_STAMP.map(([l,c])=>[l,()=>xAdd({type:'stamp',text:l,col:c})])),'Ajouter un tampon'),
  btn('▮ Caviarder',()=>wrapRaw('[[',']]'),'Caviarder la sélection (révélable en lecture)'),btn('📷 Photo',()=>imgAdd('photo'),'Photo d’enquête avec trombone'),btn('Titre',()=>add('title')),btn('⤓',()=>xAdd({type:'break'}),'Saut de page')],
 ph:'Notes d’enquête… (sélectionnez un passage puis « Caviarder »)',hint:'Entrée ajoute · [[passage]] = caviardé · /tampon CONFIDENTIEL · une pièce prend le texte saisi comme contenu.'};

/* ═════ 3 · LABYRINTHE À RENVOIS ═════ */
const labTarget=m=>S.chapters.find(x=>x.id===m.to);
function labChoice(m,cx){const tg=labTarget(m),n=tg?S.chapters.indexOf(tg)+1:0,el=h('p',{class:'lch'}),tx=h('span',{class:'lct'});tx.append(...fmt(m.text||''));if(cx.edit)editable(tx,m,cx,fmt);
 let go;
 if(!tg)go=h('b',{class:'lcg bad'},'⚠ choisissez la destination (⋯ › Propriétés)');
 else if(cx.edit)go=h('b',{class:'lcg'},'→ § '+n+' · '+(tg.title||'Sans titre'));
 else if(cx.noAnchors||(cx.pgmap&&!cx.href&&!cx.go)){const pn=cx.pgmap&&cx.pgmap[tg.id];go=h('b',{class:'lcg'},'→ page '+(pn||'…'))}
 else if(cx.href)go=h('a',{class:'lcg',href:cx.href(tg)},'→ § '+n+' · '+(tg.title||'Sans titre'));
 else if(cx.go)go=h('button',{type:'button',class:'lcg',onclick:()=>cx.go(tg.id)},'→ § '+n+' · '+(tg.title||'Sans titre'));
 else go=h('b',{class:'lcg'},'→ § '+n);
 el.append(tx,' ',go);return el}
function labItem(m,t,cx){return t==='choice'?labChoice(m,cx):null}
function labHead(c){const i=S.chapters.indexOf(c);return h('h2',{class:'xh lh'},[h('span',{class:'ln'},String(i+1)),h('span',{class:'lht'},c.title||'Sans titre')])}
function labAnalyse(){const L=S.chapters,idx=new Map(L.map((c,i)=>[c.id,i])),E=[];
 L.forEach((c,i)=>c.msgs.forEach(m=>{if(m.type==='choice'&&idx.has(m.to))E.push([i,idx.get(m.to)])}));
 const reach=new Set([0]),q=[0];while(q.length){const a=q.pop();E.forEach(([x,y])=>{if(x===a&&!reach.has(y)){reach.add(y);q.push(y)}})}
 const out=new Set(E.map(e=>e[0])),orphans=L.map((c,i)=>i).filter(i=>!reach.has(i)),dead=L.map((c,i)=>i).filter(i=>reach.has(i)&&!out.has(i));
 return{L,E,reach,orphans,dead}}
function labGraph(onNode){const a=labAnalyse(),N=a.L.length,W=360,R=N<2?0:Math.min(140,60+N*10),cx0=W/2,cy0=W/2,P=i=>N<2?[cx0,cy0]:[cx0+R*Math.cos(-Math.PI/2+i*2*Math.PI/N),cy0+R*Math.sin(-Math.PI/2+i*2*Math.PI/N)];
 const svg=sv('svg',{viewBox:'0 0 '+W+' '+W,role:'img','aria-label':'Graphe des renvois'});
 svg.append(sv('defs',{},[sv('marker',{id:'lgA',viewBox:'0 0 10 10',refX:'9',refY:'5',markerWidth:'7',markerHeight:'7',orient:'auto-start-reverse'},[sv('path',{d:'M0 0L10 5L0 10z',fill:'#9aa8ff'})])]));
 a.E.forEach(([x,y])=>{const[p,q]=[P(x),P(y)];if(x===y){svg.append(sv('circle',{cx:p[0]+14,cy:p[1]-14,r:10,fill:'none',stroke:'#9aa8ff','stroke-width':1.3,'marker-end':'url(#lgA)'}));return}
  const dx=q[0]-p[0],dy=q[1]-p[1],d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;svg.append(sv('line',{x1:p[0]+ux*17,y1:p[1]+uy*17,x2:q[0]-ux*20,y2:q[1]-uy*20,stroke:'#9aa8ff','stroke-width':1.3,'marker-end':'url(#lgA)',opacity:.85}))});
 a.L.forEach((c,i)=>{const[p,q]=P(i),col=!a.reach.has(i)?'#e0354a':a.dead.includes(i)?'#e0a020':i===0?'#3fae6a':'#6d4aff',g=sv('g',{style:'cursor:pointer'},[sv('circle',{cx:p,cy:q,r:15,fill:col,stroke:i===S.chapters.indexOf(chap())?'#fff':'none','stroke-width':2}),sv('text',{x:p,y:q+4,'text-anchor':'middle','font-size':12,'font-weight':700,fill:'#fff'},[String(i+1)]),sv('title',{},[(c.title||'Sans titre')])]);
  g.onclick=()=>onNode&&onNode(c.id);svg.append(g)});
 const nm=l=>l.map(i=>'§'+(i+1)+' '+(a.L[i].title||'')).join(' · ');
 const leg=h('div',{class:'lgl'},[h('div',{},'🟢 départ · 🟣 chapitre · 🟠 impasse (aucun choix) · 🔴 orphelin (inaccessible)'),
  a.orphans.length?h('div',{style:'color:#ff8a98'},'Orphelins : '+nm(a.orphans)):h('div',{},'Aucun chapitre orphelin.'),a.dead.length?h('div',{style:'color:#f0c060'},'Impasses : '+nm(a.dead)):null]);
 return h('div',{},[svg,leg])}
function labgRender(){const B=$('#labg');if(!B)return;if(S.kind!=='lab'){B.replaceChildren();return}
 B.replaceChildren(h('h4',{style:'margin:10px 0 4px'},'Carte des renvois'),labGraph(id=>{S.cur=id;save();all()}))}
KR.lab={n:'Labyrinthe à renvois',i:'🧭',d:'Livre dont vous êtes le héros : chapitres numérotés, choix qui renvoient à un autre chapitre, vrais numéros de page à l’impression.',cover:['lab','#14161f','#6d4aff'],covOpts:[['lab','Labyrinthe'],...COVO],
 cvcss:".cvx-lab{background:#14161f;color:#e8e8ff;background-image:repeating-linear-gradient(90deg,#ffffff12 0 2px,transparent 2px 34px),repeating-linear-gradient(0deg,#ffffff12 0 2px,transparent 2px 34px)}.cvx-lab .cvt{color:#c9c2ff;text-shadow:0 0 18px #6d4aff}",
 starter:(T,X)=>[T('Vous vous réveillez dans un couloir de pierre. Devant vous, une porte rouge ; derrière, un escalier qui descend dans le noir.')],
 init:d=>{const c1=d.chapters[0],mk=(id,t,msgs)=>({id,title:t,part:'',conv:'',sub:'',status:'draft',note:'',mood:'',msgs});
  const ch=(t,to)=>({id:uid(),who:'x',type:'choice',text:t,to});
  const c2=mk('c2','La porte rouge',[{id:uid(),who:'x',type:'text',text:'La porte s’ouvre sur une salle remplie de miroirs. Un seul d’entre eux ne vous reflète pas.'}]),c3=mk('c3','L’escalier',[{id:uid(),who:'x',type:'text',text:'Vos pas résonnent. En bas, une lueur vacille : quelqu’un vous attend.'}]);
  c1.title='Le réveil';c1.msgs.push(ch('Si vous ouvrez la porte rouge,','c2'),ch('Si vous descendez l’escalier,','c3'));c2.msgs.push(ch('Pour revenir sur vos pas,',c1.id));d.chapters.push(c2,c3);},
 chapter:(c,cx)=>xBase('lab',c,cx,labItem,labHead),
 css:()=>`.xc-lab{background:#fbf8f0;color:#1d1b26;font:17px/1.65 Georgia,serif;padding:6% 9%;min-height:72vh;border-radius:3px}
.xc-lab .xh{display:flex;align-items:center;gap:.6em;font:700 1.6em/1.15 Georgia,serif;margin:0 0 1em}.xc-lab .ln{flex:none;display:inline-flex;align-items:center;justify-content:center;min-width:1.7em;height:1.7em;border-radius:50%;background:#1d1b26;color:#fff;font:700 .95em system-ui}
.xc-lab .xt3{font:700 1.2em Georgia,serif;margin:1em 0 .4em}.xc-lab .xp{margin:0 0 .8em}.xc-lab .xsep{text-align:center;color:#999;margin:1em 0}
.lch{display:block;margin:.8em 0;padding:.6em .9em;border:2px solid #1d1b26;border-radius:6px;background:#f1edff}.lch .lcg{font:700 .95em system-ui;color:#4a2fd0;background:none;border:0;padding:0;cursor:pointer;text-decoration:none}.lch .lcg.bad{color:#c0213a}.lch button.lcg:hover,.lch a.lcg:hover{text-decoration:underline}`,
 btns:({add,xAdd,btn,ta,val})=>[btn('Ajouter ↵',()=>add('text'),'Ajouter un paragraphe','acc'),btn('↪ Choix…',async()=>{const v=await ask('Nouveau choix',[{k:'text',l:'Texte du choix',v:val()||'Si vous ouvrez la porte,'},{k:'to',l:'Renvoie vers',t:'select',o:[['','(à choisir plus tard)'],...S.chapters.map((c,i)=>[c.id,'§ '+(i+1)+' · '+(c.title||'Sans titre')])],v:''}],'Ajouter');if(!v)return;xAdd({type:'choice',text:v.text,to:v.to});ta.value=''},'Choix qui renvoie à un autre chapitre'),btn('Titre',()=>add('title')),btn('✦',()=>xAdd({type:'sep'}),'Séparateur'),btn('⤓',()=>xAdd({type:'break'}),'Saut de page')],
 bar:c=>[h('button',{type:'button',class:'lbtn',onclick:()=>modal('Carte du labyrinthe',labGraph(),{ok:'Fermer'})},'🧭 Carte des renvois')],
 ph:'Texte du paragraphe…',hint:'Entrée ajoute · « ↪ Choix » renvoie vers un autre chapitre (lien en lecture, « page N » sur papier) · la carte signale les chapitres orphelins.'};

/* ═════ 4 · PLIAGE ═════ */
function foldItem(m,t,cx){if(t!=='fold')return null;
 const mk=(tx,cl)=>{const d=h('div',{class:cl});d.append(...fmt(tx||''));return d};
 const build=()=>{if(ctlOn(cx))return h('div',{class:'fold'},[h('div',{class:'fsc'},[mk(m.a,'fa'),h('div',{class:'fcrease'},'· · · ✂ pli · · ·'),h('div',{class:'fb'},[mk(m.b,'fbf'),mk(m.c,'fbk')])]),h('button',{type:'button',class:'fbtn nopr'},'↻ Plier / déplier')]);
  return h('div',{class:'fold flat'},[mk(m.a,'fa'),mk(m.b,'fbf'),h('div',{class:'fcrease'},'✂ - - - - - - - pli - - - - - - -'),mk(m.c,'fbk r180')])};
 return cx.edit?fieldCard(m,cx,[['a','Haut de la feuille (toujours visible)'],['b','Bas de la feuille (face visible quand c’est déplié)'],['c','Verso du bas (apparaît une fois plié)']],build):build()}
KR.fold={n:'Pliage',i:'📄',d:'Une feuille qui se plie : une fois repliée, le verso du bas recouvre le haut et révèle un autre message (simulation 3D).',cover:['plain','#3b4a7a','#e9e2d0'],covOpts:[['plain','Unie'],['fold','Feuille pliée'],['image','Image seule']],
 cvcss:".cvx-fold{background:linear-gradient(180deg,var(--c1) 0 50%,var(--c2) 50% 100%);color:#fff}.cvx-fold:after{content:'';position:absolute;left:0;right:0;top:50%;border-top:2px dashed #ffffff99}",
 starter:(T,X)=>[X({type:'title',text:'Lettre à plier'}),T('Posez la feuille devant vous. Lisez-la une première fois, puis repliez le bas vers le haut.'),X({type:'fold',a:'Ma chère Anna, tout va pour le mieux ici.',b:'Je t’écris du bord de la mer, il fait beau et la maison est calme.',c:'Viens vite : on nous surveille.'})],
 chapter:(c,cx)=>xBase('fold',c,cx,foldItem),
 css:()=>`.xc-fold{background:#f4f1e8;color:#1d1b26;font:18px/1.6 Georgia,serif;padding:6% 9%;min-height:72vh;border-radius:3px}.xc-fold .xh{font:700 1.7em Georgia,serif;margin:0 0 .8em;text-align:center}.xc-fold .xt3{font:700 1.2em Georgia,serif;text-align:center}.xc-fold .xp{margin:0 0 .8em}.xc-fold .xsep{text-align:center;color:#999;margin:1em 0}
.fold{margin:1.2em auto;max-width:440px}.fold .fa,.fold .fbf,.fold .fbk{background:#fffdf6;padding:1em 1.3em;border:1px solid #d8d0b8}.fold .fa{border-bottom:0;min-height:5em}.fold .fbf{border-top:0;min-height:5em}
.fold .fcrease{text-align:center;font:11px system-ui;color:#888;border-top:1px dashed #888;padding-top:2px;margin:0}
.fold.flat .fbf{border-bottom:1px solid #d8d0b8}.fold .r180{transform:rotate(180deg);margin-top:.5em;border-top:1px solid #d8d0b8}
.fold:not(.flat) .fsc{perspective:1000px;position:relative}.fold:not(.flat) .fb{position:relative;z-index:2;transform-origin:top center;transform-style:preserve-3d;transition:transform 1.4s cubic-bezier(.5,.1,.2,1)}.fold:not(.flat) .fbf{backface-visibility:hidden;-webkit-backface-visibility:hidden;border-top:1px solid #d8d0b8;box-shadow:0 10px 18px -10px rgba(0,0,0,.4)}
.fold:not(.flat) .fbk{position:absolute;inset:0;transform:rotateX(180deg);backface-visibility:hidden;-webkit-backface-visibility:hidden;background:#fff8e0;border-top:1px solid #d8d0b8;box-shadow:0 -10px 18px -10px rgba(0,0,0,.4)}
.fold.on:not(.flat) .fb{transform:rotateX(180deg)}.fold .fcrease{position:relative;z-index:3}
.fbtn{display:block;margin:12px auto 0;border:0;border-radius:20px;padding:7px 16px;background:#1d1b26;color:#fff;cursor:pointer;font:600 13px system-ui}`,
 btns:({add,xAdd,btn,ta,tb,val})=>{ta.placeholder='Haut de la feuille (toujours visible)…';tb.style.display='';tb.placeholder='Bas de la feuille — puis « Pliage » : le verso se saisit dans l’élément…';
  return[btn('Ajouter ↵',()=>add('text'),'Paragraphe simple','acc'),btn('📄 Pliage',()=>{const a=ta.value.trim(),b=tb.value.trim();xAdd({type:'fold',a:a||'Haut de la feuille…',b:b||'Bas de la feuille…',c:'Verso : message qui apparaît une fois plié…'});ta.value=tb.value='';ta.focus()},'Feuille à plier : haut + bas (+ verso à écrire dans l’élément)'),btn('Titre',()=>add('title')),btn('✦',()=>xAdd({type:'sep'}),'Séparateur'),btn('⤓',()=>xAdd({type:'break'}),'Saut de page')]},
 ph:'Haut de la feuille (toujours visible)…',hint:'📄 Pliage = haut (zone du haut) + bas (zone du dessous) ; le verso se complète dans l’élément. /pli fait la même chose.'};

/* ═════ 5 · SPIRALE & CALLIGRAMMES ═════ */
let SPI_N=0;
function spiGeo(shape,n,fs){const need=Math.max(n,6)*fs*.47,P=[];
 if(shape==='circle'){const R=Math.max(fs*3,need/(2*Math.PI));for(let k=0;k<=360;k++){const a=-Math.PI/2+k*Math.PI/180;P.push([R*Math.cos(a),R*Math.sin(a)])}}
 else if(shape==='wave'){const amp=fs*2.4,wl=fs*10;let len=0,x=0,py=0,px=0;for(;len<need*1.02;x+=2){const y=amp*Math.sin(2*Math.PI*x/wl);if(x>0)len+=Math.hypot(x-px,y-py);P.push([x,y]);px=x;py=y}}
 else if(shape==='heart'){const T=[];for(let k=0;k<=400;k++){const t=Math.PI+k*2*Math.PI/400;T.push([16*Math.pow(Math.sin(t),3),-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))])}
  let L=0;T.forEach((p,i)=>{if(i)L+=Math.hypot(p[0]-T[i-1][0],p[1]-T[i-1][1])});const s=Math.max(need/L,fs*.4);T.forEach(p=>P.push([p[0]*s,p[1]*s]))}
 else{const gap=fs*1.7,r0=fs*2.2,pts=[];let th=0,len=0,pr=null;
  while(len<need*1.04&&th<400){const r=r0+gap*th/(2*Math.PI),p=[r*Math.cos(th),r*Math.sin(th)];if(pr)len+=Math.hypot(p[0]-pr[0],p[1]-pr[1]);pts.push(p);pr=p;th+=.07}
  pts.reverse().forEach(p=>P.push(p))}
 let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;P.forEach(p=>{x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])});
 const pad=fs*1.6,W=x1-x0+2*pad,H=y1-y0+2*pad;
 return{d:'M'+P.map(p=>(p[0]-x0+pad).toFixed(1)+' '+(p[1]-y0+pad).toFixed(1)).join('L'),W:Math.round(W),H:Math.round(H)}}
function spiItem(m,t,cx){if(t!=='spiral')return null;
 const txt=(m.text||'').replace(/\s+/g,' ').trim()||'Votre texte s’enroule ici…',fs=+m.fs||16,g=spiGeo(m.shape||'spiral',txt.length,fs),id='spi'+(++SPI_N);
 const svg=sv('svg',{viewBox:'0 0 '+g.W+' '+g.H,class:'spisv',style:'max-width:'+g.W+'px'},[sv('path',{id,d:g.d,fill:'none'}),sv('text',{'font-size':fs,class:'spit'},[sv('textPath',{href:'#'+id},[txt])])]);
 const el=h('div',{class:'spi'},[svg]);if(ctlOn(cx))el.append(h('button',{type:'button',class:'sbtn nopr'},'↻ Pivoter'));
 if(cx.edit){const ed=h('div',{class:'spe'});ed.append(...fmt(m.text||''));editable(ed,m,cx,fmt);return h('div',{},[el,h('div',{class:'fcl'},[h('span',{class:'fct'},'Texte du calligramme'),ed])])}
 return el}
KR.spi={n:'Spirale & calligrammes',i:'🌀',d:'Le texte épouse une forme : spirale, cercle, vague, cœur. On fait pivoter la page pour lire.',fs:true,cover:['spiral','#1b1140','#6d4aff'],covOpts:[['spiral','Spirale'],...COVO],
 cvcss:".cvx-spiral{background:repeating-radial-gradient(circle at 50% 50%,var(--c2) 0 3px,var(--c1) 3px 22px);color:#fff}.cvx-spiral .cvt{background:var(--c1);padding:.2em .5em;border-radius:6px}",
 starter:(T,X)=>[X({type:'title',text:'Tout tourne'}),T('Le texte ne se lit plus de gauche à droite : il s’enroule.'),X({type:'spiral',shape:'spiral',text:'Il y a des phrases qui ne vont nulle part, qui tournent sur elles-mêmes, se rapprochent du centre, et finissent par dire ce qu’on n’osait pas dire au début.'}),X({type:'spiral',shape:'heart',text:'Je t’écris en rond autour de ton prénom, comme on tourne autour d’un feu.'})],
 chapter:(c,cx)=>xBase('spi',c,cx,spiItem),
 css:()=>`.xc-spi{background:#fbf8ff;color:#1d1440;font:17px/1.6 'SBS Fell',Georgia,serif;padding:6% 8%;min-height:72vh;border-radius:3px}.xc-spi .xh{font:600 1.7em 'SBS Cinzel',Georgia,serif;text-align:center;margin:0 0 .8em}.xc-spi .xt3{font:600 1.2em 'SBS Cinzel',Georgia,serif;text-align:center}.xc-spi .xp{margin:0 0 .8em}.xc-spi .xsep{text-align:center;color:#999;margin:1em 0}
.spi{margin:1em auto;text-align:center}.spi .spisv{display:block;width:100%;height:auto;margin:0 auto;transition:transform .9s cubic-bezier(.4,.1,.2,1);overflow:visible}.spi .spit{fill:#2a1a66;font-family:'SBS Fell',Georgia,serif;font-style:italic}.spi .sbtn{border:0;border-radius:16px;padding:5px 14px;background:#2a1a66;color:#fff;cursor:pointer;font:600 12px system-ui;margin-top:6px}`,
 btns:({add,xAdd,btn,ta,val})=>{const sp=shape=>()=>{const v=val();if(!v)return;xAdd({type:'spiral',shape,text:v});ta.value='';ta.focus()};
  return[btn('Ajouter ↵',()=>add('text'),'Paragraphe normal','acc'),btn('🌀 Spirale',sp('spiral'),'Texte en spirale'),btn('⭕ Cercle',sp('circle')),btn('〰 Vague',sp('wave')),btn('❤ Cœur',sp('heart')),btn('Titre',()=>add('title')),btn('⤓',()=>xAdd({type:'break'}),'Saut de page')]},
 ph:'Écrivez le texte, puis choisissez sa forme…',hint:'Écrivez, puis cliquez sur la forme voulue (spirale, cercle, vague, cœur). En lecture : « Pivoter » tourne la forme.'};

/* ═════ 6 · PARTITION & RYTHME ═════ */
function parBars(text){const bars=[];let cur=[],beats=0;
 (text||'').trim().split(/\s+/).filter(Boolean).forEach(tk=>{if(tk==='|'){if(cur.length){bars.push(cur);cur=[];beats=0}return}
  const rest=tk==='.',ext=(tk.match(/_+$/)||[''])[0].length,w=rest?'':tk.replace(/_+$/,''),d=1+ext;cur.push({w,d,rest});beats+=d;if(beats>=4){bars.push(cur);cur=[];beats=0}});
 if(cur.length)bars.push(cur);return bars}
function parItem(m,t,cx){if(t!=='score')return null;
 const build=()=>{const bars=parBars(m.text),bpm=+m.bpm||+S.set.bpm||90,el=h('div',{class:'pscore','data-bpm':bpm}),per=+m.bpl||2;
  if(ctlOn(cx))el.append(h('div',{class:'pctl nopr'},[h('button',{type:'button',class:'pplay'},'▶ Lire en rythme'),h('label',{},['♩ = ',h('input',{type:'range',class:'pbpm',min:40,max:200,value:bpm}),' ',h('span',{class:'pbv'},bpm+' BPM')])]));
  else el.append(h('div',{class:'ptempo'},'♩ = '+bpm));
  for(let i=0;i<bars.length;i+=per){const ln=h('div',{class:'pline'});bars.slice(i,i+per).forEach(b=>ln.append(h('div',{class:'pbar'},b.map(n=>h('span',{class:'nt'+(n.rest?' rs':'')+(n.d>=3?' w':n.d===2?' hf':' q'),style:'flex:'+n.d,'data-d':n.d},[h('i',{class:'nh'},n.rest?'—':n.d>=2?'○':'●'),h('span',{class:'nw'},n.w)])))));el.append(ln)}
  if(!bars.length)el.append(h('div',{class:'pln0'},'Écrivez des mots : un mot = une noire, mot_ = deux temps, . = silence, | = barre.'));
  return el};
 return cx.edit?fieldCard(m,cx,[['text','Paroles et rythme  (mot_ = long · . = silence · | = barre)']],build):build()}
KR.par={n:'Partition & rythme',i:'🎼',d:'Le texte posé sur une portée : chaque mot a une durée, des mesures, un tempo (BPM) et une lecture rythmée.',fs:true,cover:['staff','#fffdf6','#1d1b26'],covOpts:[['staff','Portée'],...COVO],
 cvcss:".cvx-staff{background:#fffdf6;color:#1d1b26;background-image:repeating-linear-gradient(transparent 0 18px,#1d1b2630 18px 19px)}.cvx-staff .cvt{font-family:Georgia,serif;background:#fffdf6;padding:.1em .4em}",
 starter:(T,X)=>[X({type:'title',text:'Berceuse pour un soir de pluie'}),T('Chaque mot tient sur une portée : plus il est long, plus il dure.'),X({type:'score',text:'Il_ pleut . sur_ la ville | et_ mon cœur__ bat_ | doucement . doucement__',bpm:72})],
 chapter:(c,cx)=>xBase('par',c,cx,parItem),
 css:()=>`.xc-par{background:#fffdf6;color:#1d1b26;font:17px/1.6 Georgia,serif;padding:6% 7%;min-height:72vh;border-radius:3px}.xc-par .xh{font:700 1.6em Georgia,serif;text-align:center;margin:0 0 .8em}.xc-par .xt3{font:700 1.2em Georgia,serif;text-align:center}.xc-par .xp{margin:0 0 .8em}.xc-par .xsep{text-align:center;color:#999;margin:1em 0}
.pscore{margin:1.2em 0}.pctl{display:flex;gap:12px;align-items:center;margin-bottom:8px;font:600 12px system-ui}.pctl button{border:0;border-radius:16px;padding:6px 14px;background:#1d1b26;color:#fff;cursor:pointer;font:600 12px system-ui}.pctl button.run{background:#c0213a}.pctl input{vertical-align:middle;width:120px}.ptempo{font:italic 13px Georgia,serif;margin-bottom:4px}
.pline{display:flex;margin:0 0 10px;background:repeating-linear-gradient(transparent 0 7px,rgba(29,27,38,.45) 7px 8px);background-size:100% 40px;background-position:0 22px;background-repeat:repeat-x;padding-top:2px;border-left:2px solid #1d1b26}
.pbar{display:flex;flex:1;border-right:2px solid #1d1b26;min-height:60px}.pbar:last-child{border-right:4px double #1d1b26}.pline .pbar+.pbar{flex:1}
.nt{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;min-width:0;padding:0 2px;transition:background .12s,transform .12s}.nt .nh{font-style:normal;font-size:15px;line-height:1;color:#1d1b26}.nt.w .nh{letter-spacing:.35em}.nt .nw{font:600 .9em/1.1 Georgia,serif;text-align:center;overflow-wrap:anywhere}.nt.rs .nh{color:#999}
.nt.on{background:#6d4aff;color:#fff;border-radius:6px;transform:translateY(-3px)}.nt.on .nh{color:#fff}.pln0{font:italic 13px system-ui;color:#888}`,
 btns:({add,xAdd,btn,ta,val})=>[btn('🎼 Mesure ↵',()=>{const v=val();if(!v)return;xAdd({type:'score',text:v,bpm:+S.set.bpm||90});ta.value='';ta.focus()},'Poser ce texte sur une portée','acc'),btn('Paragraphe',()=>add('text')),btn('Titre',()=>add('title')),btn('✦',()=>xAdd({type:'sep'}),'Séparateur'),btn('⤓',()=>xAdd({type:'break'}),'Saut de page')],
 ph:'Paroles : un mot = une noire · mot_ = 2 temps · mot__ = 3 · . = silence · | = barre',hint:'Entrée pose le texte sur une portée · en lecture, « ▶ Lire en rythme » surligne les mots au tempo choisi (BPM).'};

/* ═════ Commandes slash des mécaniques ═════ */
slashReg('miroir',null,'Retourner le dernier bloc en miroir',()=>mut(()=>{const L=chap().msgs.filter(x=>x.who!=='note'),m=L[L.length-1];if(m)m.mir=!m.mir}));
slashReg('tampon',['dos'],'Tampon (ex. /tampon CONFIDENTIEL)',a=>xAdd({type:'stamp',text:(a||'CONFIDENTIEL').toUpperCase(),col:'#b3261e'}));
slashReg('pli',['fold'],'Feuille à plier',a=>xAdd({type:'fold',a:a||'Haut de la feuille…',b:'Bas de la feuille…',c:'Verso : message qui apparaît une fois plié…'}));
slashReg('choix',['lab'],'Choix vers un autre chapitre',a=>xAdd({type:'choice',text:a||'Si vous ouvrez la porte,',to:''}));
slashReg('spirale',['spi'],'Texte en spirale',a=>xAdd({type:'spiral',shape:'spiral',text:a||'Votre texte s’enroule ici…'}));
slashReg('cercle',['spi'],'Texte en cercle',a=>xAdd({type:'spiral',shape:'circle',text:a||'Votre texte tourne en rond…'}));
slashReg('portee',['par'],'Texte sur une portée',a=>xAdd({type:'score',text:a||'Un mot_ après . un mot |',bpm:+S.set.bpm||90}));
slashReg('palimpseste',['pal'],'Palimpseste (surface / dessous)',a=>xAdd({type:'pal',a:a||'Texte de surface…',b:'Texte gratté dessous…'}));
slashReg('piece',['dos'],'Pièce du dossier',a=>xAdd({type:'doc',tpl:'rapport',text:a||'Texte de la pièce…'}));

/* ═════ Formulaires de propriétés ═════ */
Object.assign(ITEM_FORMS,{
 doc:m=>[{k:'tpl',l:'Modèle',t:'select',o:Object.entries(DOS_TPL),v:m.tpl||'rapport'},{k:'head',l:'En-tête (vide = celui du modèle)',v:m.head||''},{k:'tilt',l:'Inclinaison (°)',t:'number',v:m.tilt==null?'':m.tilt},{k:'clip',l:'Trombone',t:'check',v:m.clip!==false}],
 stamp:m=>[{k:'text',l:'Texte du tampon',v:m.text||''},{k:'col',l:'Couleur',t:'select',o:[['#b3261e','Rouge'],['#1f4e9c','Bleu'],['#1c6b3a','Vert'],['#6a2c91','Violet']],v:m.col||'#b3261e'},{k:'rot',l:'Rotation (°)',t:'number',v:m.rot==null?-8:m.rot}],
 choice:m=>[{k:'text',l:'Texte du choix',v:m.text||''},{k:'to',l:'Renvoie vers',t:'select',o:[['','(à choisir)'],...S.chapters.map((c,i)=>[c.id,'§ '+(i+1)+' · '+(c.title||'Sans titre')])],v:m.to||''}],
 spiral:m=>[{k:'shape',l:'Forme',t:'select',o:[['spiral','Spirale'],['circle','Cercle'],['wave','Vague'],['heart','Cœur']],v:m.shape||'spiral'},{k:'fs',l:'Taille des lettres (px)',t:'number',v:m.fs||16}],
 score:m=>[{k:'bpm',l:'Tempo (BPM)',t:'number',v:m.bpm||S.set.bpm||90},{k:'bpl',l:'Mesures par ligne',t:'number',v:m.bpl||2}],
 photo:m=>S.kind==='dos'?[{k:'cap',l:'Légende',v:m.cap||''},{k:'tilt',l:'Inclinaison (°)',t:'number',v:m.tilt==null?'':m.tilt}]:ITEM_FORMS_PHOTO(m)});
function ITEM_FORMS_PHOTO(m){return[{k:'cap',l:'Légende',v:m.cap||''},{k:'tilt',l:'Inclinaison (°)',t:'number',v:m.tilt==null?'':m.tilt},{k:'dev',l:'Développement forcé (0-100, vide = automatique)',t:'number',v:m.dev==null?'':m.dev},{k:'age',l:'Vieillissement forcé (0-100, vide = automatique)',t:'number',v:m.age==null?'':m.age}]}

/* ═════ Texte brut (export .txt / .md) ═════ */
function mechTxt(x){const t=x.type||'text';
 if(t==='pal')return(x.a||'')+'  [sous le texte gratté : '+(x.b||'')+']';
 if(t==='doc')return'['+((x.head)||DOS_TPL[x.tpl||'rapport']||'Pièce')+'] '+(x.text||'').replace(/\[\[([^\]]+)\]\]/g,'█████');
 if(t==='stamp')return'*** '+(x.text||'')+' ***';
 if(t==='fold')return[x.a,x.b,'(verso : '+(x.c||'')+')'].join('\n');
 if(t==='spiral'||t==='score')return x.text||'';
 if(t==='choice'){const tg=S.chapters.find(c=>c.id===x.to);return(x.text||'')+' → '+(tg?'§ '+(S.chapters.indexOf(tg)+1)+' '+(tg.title||''):'?')}
 if(S.kind==='dos'&&x.text&&/\[\[/.test(x.text))return x.text.replace(/\[\[([^\]]+)\]\]/g,'█████');
 return null}

/* ═════ Exécution : fonction autonome (injectée telle quelle dans les exports HTML) ═════ */
function mechRuntime(root){var cl=[];root=root||document;
 function on(sel,ev,fn){var f=function(e){var t=e.target.closest&&e.target.closest(sel);if(t&&root.contains(t))fn(t,e)};root.addEventListener(ev,f);cl.push(function(){root.removeEventListener(ev,f)})}
 on('.rd .pal','click',function(t){t.classList.toggle('scr')});
 on('.rv .rdx','click',function(t){t.classList.toggle('open')});
 on('.fbtn','click',function(t){t.closest('.fold').classList.toggle('on')});
 on('.sbtn','click',function(t){var s=t.closest('.spi').querySelector('svg'),r=(+s.getAttribute('data-rot')||0)+90;s.setAttribute('data-rot',r);s.style.transform='rotate('+r+'deg)'});
 var timers=[];
 function stop(){timers.forEach(clearTimeout);timers=[];root.querySelectorAll('.nt.on').forEach(function(n){n.classList.remove('on')});root.querySelectorAll('.pplay.run').forEach(function(b){b.classList.remove('run');b.textContent='▶ Lire en rythme'})}
 on('.pplay','click',function(t){if(t.classList.contains('run')){stop();return}stop();var sc=t.closest('.pscore'),bp=sc.querySelector('.pbpm'),bpm=+(bp&&bp.value)||+sc.getAttribute('data-bpm')||90,ms=60000/bpm,nts=[].slice.call(sc.querySelectorAll('.nt')),at=0;
  t.classList.add('run');t.textContent='■ Arrêter';
  nts.forEach(function(n){var d=+n.getAttribute('data-d')||1;timers.push(setTimeout(function(){nts.forEach(function(x){x.classList.remove('on')});n.classList.add('on')},at));at+=d*ms});timers.push(setTimeout(stop,at+150))});
 on('.pbpm','input',function(t){var v=t.closest('.pscore').querySelector('.pbv');if(v)v.textContent=t.value+' BPM'});
 cl.push(stop);
 if(root===document.body){var b=document.createElement('button');b.textContent='🪞';b.title='Lire en miroir';b.className='nopr';b.style.cssText='position:fixed;right:14px;bottom:14px;z-index:50;font-size:20px;border:0;border-radius:50%;width:42px;height:42px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.35)';b.onclick=function(){document.body.classList.toggle('mirall')};document.body.appendChild(b);cl.push(function(){b.remove()})}
 return function(){cl.forEach(function(f){f()})}}

/* ═════ Styles d’édition communs aux nouvelles mécaniques ═════ */
const MECHEDIT=`.fcd{border:1px dashed rgba(120,120,170,.5);border-radius:8px;padding:8px;margin:.8em 0;background:rgba(255,255,255,.4)}.fcp{margin-bottom:6px}.fcl{margin-top:6px}.fct{display:block;font:600 11px system-ui;color:#556;margin-bottom:2px}.fcf,.spe{border:1px solid rgba(100,100,140,.35);border-radius:6px;padding:4px 8px;background:#fff;color:#222;font:14px/1.5 system-ui;min-height:1.6em;white-space:pre-wrap;font-style:normal}
.lbtn{border:0;border-radius:14px;padding:5px 12px;background:#6d4aff;color:#fff;cursor:pointer;font:600 12px system-ui}`;

Object.keys(KR).forEach(k=>{KINDS[k]={n:KR[k].n,i:KR[k].i,d:KR[k].d}});
/* ═════ Export vidéo MP4 : la conversation se crée petit à petit ═════ */
const VFPS=30;
const vU32=n=>new Uint8Array([n>>>24&255,n>>>16&255,n>>>8&255,n&255]),vU16=n=>new Uint8Array([n>>8&255,n&255]);
const vCat=a=>{let L=0;a.forEach(x=>L+=x.length);const o=new Uint8Array(L);let p=0;a.forEach(x=>{o.set(x,p);p+=x.length});return o};
const vBx=(t,...c)=>{const b=vCat(c);return vCat([vU32(b.length+8),new TextEncoder().encode(t),b])};
const vFb=(t,f,...c)=>vBx(t,vU32(f),...c);
const vZ=n=>new Uint8Array(n);
/* Muxeur MP4 minimal (1 piste H.264, sans B-frames) → Blob video/mp4 */
function mp4Mux(w,h,fps,avcC,samples){
 const TS=fps*1000,D=1000,n=samples.length,dur=n*D,MAT=vCat([vU32(0x10000),vZ(12),vU32(0x10000),vZ(12),vU32(0x40000000)]);
 const ftyp=vBx('ftyp',new TextEncoder().encode('isom'),vU32(512),new TextEncoder().encode('isomiso2avc1mp41'));
 const mk=off=>{
  const stsd=vFb('stsd',0,vU32(1),vBx('avc1',vZ(6),vU16(1),vZ(16),vU16(w),vU16(h),vU32(0x480000),vU32(0x480000),vZ(4),vU16(1),vZ(32),vU16(0x18),vU16(0xffff),vBx('avcC',avcC)));
  const keys=[];samples.forEach((s,i)=>{if(s.key)keys.push(i+1)});
  const stbl=vBx('stbl',stsd,vFb('stts',0,vU32(1),vU32(n),vU32(D)),vFb('stss',0,vU32(keys.length),...keys.map(vU32)),
   vFb('stsc',0,vU32(1),vU32(1),vU32(n),vU32(1)),vFb('stsz',0,vU32(0),vU32(n),...samples.map(s=>vU32(s.data.length))),vFb('stco',0,vU32(1),vU32(off)));
  const minf=vBx('minf',vFb('vmhd',1,vZ(8)),vBx('dinf',vFb('dref',0,vU32(1),vFb('url ',1))),stbl);
  const mdia=vBx('mdia',vFb('mdhd',0,vU32(0),vU32(0),vU32(TS),vU32(dur),vU16(0x55c4),vU16(0)),
   vFb('hdlr',0,vU32(0),new TextEncoder().encode('vide'),vZ(12),new TextEncoder().encode('VideoHandler\0')),minf);
  const trak=vBx('trak',vFb('tkhd',3,vU32(0),vU32(0),vU32(1),vU32(0),vU32(dur),vZ(8),vU16(0),vU16(0),vU16(0),vU16(0),MAT,vU32(w<<16),vU32(h<<16)),mdia);
  return vBx('moov',vFb('mvhd',0,vU32(0),vU32(0),vU32(TS),vU32(dur),vU32(0x10000),vU16(0x100),vZ(10),MAT,vZ(24),vU32(2)),trak)};
 const m0=mk(0),moov=mk(ftyp.length+m0.length+8);
 let tot=0;samples.forEach(s=>tot+=s.data.length);
 return new Blob([ftyp,moov,vU32(tot+8),new TextEncoder().encode('mdat'),...samples.map(s=>s.data)],{type:'video/mp4'})}

const vEase=x=>x<=0?0:x>=1?1:1-Math.pow(1-x,3);
const vClamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const vSleep=ms=>new Promise(r=>setTimeout(r,ms));
/* Rastérise un morceau de DOM (XHTML → SVG foreignObject → canvas), à l'échelle k */
async function vRast(kids,o){
 const bk=h('div',{class:'bk',style:'width:390px;box-sizing:border-box;background:'+(o.bg||'none')+';color:'+o.th.ink},[h('style',{},o.css)]);
 let host=bk;if(o.pg){host=h('div',{class:'pg',style:o.pgStyle||''});bk.append(host)}
 kids.forEach(x=>host.append(x));
 const hh0=h('div',{style:'all:initial;position:fixed;left:-10000px;top:0;visibility:hidden'});document.body.append(hh0);
 const sr=hh0.attachShadow({mode:'open'});sr.append(bk);
 const hh=o.H||Math.max(1,Math.ceil(bk.getBoundingClientRect().height));
 if(o.H)bk.style.height=o.H+'px';
 const xml=new XMLSerializer().serializeToString(bk);hh0.remove();
 const w=Math.round(390*o.k),hp=Math.max(1,Math.round(hh*o.k));
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+hp+'" viewBox="0 0 390 '+hh+'"><foreignObject x="0" y="0" width="390" height="'+hh+'">'+xml+'</foreignObject></svg>';
 const im=new Image();im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
 try{await im.decode()}catch(e){await new Promise((r,j)=>{im.onload=r;im.onerror=()=>j(new Error('Rendu d’un message impossible'))})}
 const cv=document.createElement('canvas');cv.width=w;cv.height=hp;cv.getContext('2d').drawImage(im,0,0,w,hp);
 return{cv,h:hh}}

function vWrap(ctx,t,maxW){const w=t.split(/\s+/),L=[];let c='';w.forEach(x=>{const n=c?c+' '+x:x;if(c&&ctx.measureText(n).width>maxW){L.push(c);c=x}else c=n});if(c)L.push(c);return L}

/* Plan : une partie par chapitre, chaque message reçoit son instant d'apparition */
function vPlan(segs,o){
 const sp={slow:1.5,norm:1,fast:.62}[o.speed]||1;let t=.5;
 segs.forEach(sg=>{
  sg.t0=t;if(o.title&&sg.card)t+=2.4;sg.tc=t;t+=.5*sp;
  sg.items.forEach(it=>{if(it.pre){it.at=-1;return}const m=it.m,c=ch(m.who),isM=!!c&&!SPECIAL.includes(m.who),txt=(m.text||'').replace(/\s+/g,' ').trim(),words=txt?txt.split(' ').length:2;
   it.ty=null;
   if(isM&&o.typing&&m.type!=='typing'){const td=((m.type||'text')==='text'?vClamp(.55+txt.length*.032,.8,2.8):1.0)*sp;it.ty=[t,t+td];t+=td}
   it.at=t;t+=(isM?vClamp(.5+words*.17,.9,4):.95)*sp});
  t+=.9*sp;sg.t1=t});
 return t+1.3}

async function exportVideo(){
 if(S.kind!=='sms'){toast('L’export vidéo concerne les livres SMS.');return}
 const cur=chap();
 const r=await ask('Exporter en vidéo MP4',[
  {k:'ch',l:'Quoi exporter ?',t:'select',o:[[cur?cur.id:'','Le chapitre ouvert ('+(cur&&cur.title||'sans titre')+')'],['__all','Tous les chapitres, à la suite']].concat(S.chapters.filter(c=>!cur||c.id!==cur.id).map(c=>[c.id,'Chapitre : '+(c.title||'Sans titre')])),v:cur?cur.id:'__all'},
  {k:'fmt',l:'Format',t:'select',o:[['720x1280','Vertical 9:16 — 720×1280 (léger)'],['1080x1920','Vertical 9:16 — 1080×1920 (Reels, TikTok, Shorts)'],['1080x1080','Carré 1:1 — 1080×1080'],['1280x720','Paysage 16:9 — 1280×720'],['1920x1080','Paysage 16:9 — 1920×1080']],v:'720x1280'},
  {k:'speed',l:'Rythme',t:'select',o:[['slow','Lent (le temps de lire)'],['norm','Normal'],['fast','Rapide']],v:'norm'},
  {k:'typing',l:'Afficher les points « … » avant chaque message',t:'check',v:true},
  {k:'title',l:'Carte titre au début de chaque chapitre',t:'check',v:true},
  {k:'header',l:'Afficher l’en-tête (participants de la conversation)',t:'check',v:true},
  {k:'theme',l:'Thème',t:'select',o:[['auto','Celui du livre'],['light','Clair'],['dark','Sombre']],v:'auto'}],'Créer la vidéo');
 if(!r)return;
 const chs=r.ch==='__all'?S.chapters.slice():S.chapters.filter(c=>c.id===r.ch);
 if(!chs.length)return;
 const[W,H]=r.fmt.split('x').map(Number),th=r.theme==='dark'?DARK:r.theme==='light'?LIGHT:(isDark()?DARK:LIGHT);
 const colW=Math.min(W,Math.round(H*9/16/2)*2),k=colW/390,LH=H/k,cx0=Math.round((W-colW)/2);
 const css=bookCSS(S.set,th,'.bk'),src=id=>A[id]||'';
 /* fenêtre de progression */
 let cancel=false;
 const cvS=h('canvas',{width:W,height:H,style:'max-width:100%;max-height:46vh;border-radius:10px;background:#000;display:block;margin:0 auto'});
 const bar=h('div',{style:'height:100%;width:0;background:#6d5bff;transition:width .15s'}),lab=h('div',{class:'small',style:'text-align:center;margin:8px 0'},'Préparation des messages…');
 const ov=h('div',{style:'position:fixed;inset:0;z-index:9999;background:rgba(10,12,20,.78);display:flex;align-items:center;justify-content:center;padding:16px'},
  h('div',{style:'background:var(--panel,#fff);color:var(--ink,#171a22);border-radius:14px;padding:16px;width:min(420px,100%);box-shadow:0 20px 60px rgba(0,0,0,.5)'},[
   h('b',{style:'display:block;margin-bottom:10px'},'Création de la vidéo…'),cvS,
   h('div',{style:'height:8px;border-radius:6px;background:rgba(127,127,127,.25);overflow:hidden;margin-top:12px'},bar),lab,
   h('div',{style:'text-align:center'},h('button',{onclick:()=>{cancel=true;lab.textContent='Annulation…'}},'Annuler'))]));
 document.body.append(ov);
 const fail=e=>{ov.remove();console.error(e);toast('Export vidéo impossible : '+(e&&e.message||e))};
 try{
  /* 1. rastérisation */
  const bgR=await vRast([],{th,css,k,pg:true,pgStyle:'padding:0;min-height:0;height:'+LH+'px',H:LH});
  const dots=[];
  const segs=[];let done=0,total=0;chs.forEach(c=>convSegs(c).forEach(sg=>{total+=sg.msgs.filter(m=>m.who!=='note').length+(sg.mk?convHist(sg.mk).length:0)}));total=Math.max(total,1);
  for(const c of chs){for(const [si,csg] of convSegs(c).entries()){
   const hist=csg.mk?convHist(csg.mk):[],own=csg.msgs.filter(m=>m.who!=='note'),L=hist.concat(own),cx={th,src,edit:false,msgs:L};
   const sg={c,items:[],hd:null,hH:0,card:si===0};
   const hs=S.set.header,ss=S.set.status;if(r.header)S.set.header=true;
   const hel=headEls(csg.mk?convHeadChap(c,csg):c,cx);S.set.header=hs;
   if(hel.length&&(r.header||ss)){const hr=await vRast(hel,{th,css,k,bg:th.panel});sg.hd=hr.cv;sg.hH=hr.h}
   const tyc={};
   for(let i=0;i<L.length;i++){
    if(cancel)throw new Error('Annulé');
    const m=L[i],n=node(m,i,L,cx),rr=await vRast([n],{th,css,k,pg:true,pgStyle:'padding:0 14px;min-height:0;background:none'});
    const it={m,cv:rr.cv,h:rr.h,ty:null,tys:null,tyh:0,pre:i<hist.length};
    const cc=ch(m.who);
    if(!it.pre&&r.typing&&cc&&!SPECIAL.includes(m.who)&&m.type!=='typing'){
     const first=!L[i-1]||L[i-1].who!==m.who,key=m.who+first;
     if(!tyc[key]){tyc[key]=[];const Lt=L.slice(0,i).concat([{id:'_ty',who:m.who,type:'typing',text:''}]);
      for(let v=0;v<3;v++){const tn=node(Lt[i],i,Lt,cx);tn.querySelectorAll('.dots i').forEach((d,j)=>{d.style.opacity=j===v?'1':'.3'});
       tyc[key].push(await vRast([tn],{th,css,k,pg:true,pgStyle:'padding:0 14px;min-height:0;background:none'}))}}
     it.tys=tyc[key];it.tyh=tyc[key][0].h}
    sg.items.push(it);done++;
    if(i%4===0){bar.style.width=(done/total*35)+'%';lab.textContent='Préparation des messages… '+done+' / '+total;await vSleep(0)}}
   segs.push(sg)}}
  const dur=vPlan(segs,r),NF=Math.ceil(dur*VFPS);
  /* 2. composition d'une image */
  const ctx=cvS.getContext('2d'),cv0=S.meta.cover||{},tc1=cv0.c1||'#1d2330';
  const frame=t=>{
   const sg=segs.find(s=>t<s.t1)||segs[segs.length-1];
   ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;
   ctx.fillStyle=th.bg;ctx.fillRect(0,0,W,H);
   if(cx0>0){ctx.drawImage(bgR.cv,0,0,Math.min(40,bgR.cv.width),bgR.cv.height,0,0,W,H);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(0,0,W,H)}
   ctx.drawImage(bgR.cv,cx0,0,colW,H);
   if(t<sg.tc){ /* carte titre */
    const a=t<sg.t0+.3?vEase((t-sg.t0)/.3):t>sg.tc-.4?vEase((sg.tc-t)/.4):1;
    ctx.globalAlpha=a;ctx.fillStyle=tc1;ctx.fillRect(cx0,0,colW,H);ctx.fillStyle=ink(tc1);ctx.textAlign='center';ctx.textBaseline='middle';
    const fs=colW/390;ctx.font='italic '+(15*fs)+'px Georgia,serif';ctx.globalAlpha=a*.8;ctx.fillText((S.meta.title||'').slice(0,60),cx0+colW/2,H*.38);
    ctx.globalAlpha=a;ctx.font='700 '+(30*fs)+'px Georgia,serif';const ls=vWrap(ctx,sg.c.title||'Sans titre',colW*.8);
    ls.forEach((l,i)=>ctx.fillText(l,cx0+colW/2,H*.47+i*34*fs));
    if(S.meta.author){ctx.globalAlpha=a*.75;ctx.font='13px Georgia,serif';ctx.font=(13*fs)+'px Georgia,serif';ctx.fillText(S.meta.author,cx0+colW/2,H*.47+ls.length*34*fs+26*fs)}
    ctx.globalAlpha=1;return}
   const hH=sg.hH,pad=16;let acc=0;const rows=[];
   sg.items.forEach(it=>{
    if(t>=it.at){const p=vEase((t-it.at)/.28),f=it.tys?1:p;rows.push({it,p,f,img:it.cv,hh:it.h});acc+=it.h*f}
    else if(it.ty&&t>=it.ty[0]){const p=vEase((t-it.ty[0])/.2),v=Math.floor((t-it.ty[0])*3.2)%3,tr=it.tys[v];rows.push({it,p,f:p,img:tr.cv,hh:tr.h});acc+=tr.h*p}});
   const scroll=Math.max(0,acc+hH+pad-LH);let y=hH-scroll;
   rows.forEach(rw=>{const yy=y+(1-rw.p)*8;if(yy+rw.hh>hH-4&&yy<LH){ctx.globalAlpha=rw.p;ctx.drawImage(rw.img,cx0,yy*k,rw.img.width,rw.img.height)}y+=rw.hh*rw.f});
   ctx.globalAlpha=1;if(sg.hd){ctx.drawImage(sg.hd,cx0,0)}};
  /* 3. encodage */
  const br=vClamp(Math.round(W*H*VFPS*.11),1.5e6,14e6);let blob,ext='mp4',note='';
  const wc=typeof VideoEncoder==='function'&&typeof VideoFrame==='function';let cfg=null;
  if(wc){for(const cd of(W*H>921600?['avc1.420028','avc1.42002a','avc1.420033']:['avc1.42001f','avc1.420028'])){try{const c={codec:cd,width:W,height:H,bitrate:br,framerate:VFPS,avc:{format:'avc'}};const s=await VideoEncoder.isConfigSupported(c);if(s.supported){cfg=c;break}}catch(e){}}}
  if(cfg){
   const samples=[];let avcC=null,err=null;
   const enc=new VideoEncoder({output:(ch_,meta)=>{if(meta&&meta.decoderConfig&&meta.decoderConfig.description&&!avcC){const d=meta.decoderConfig.description;avcC=new Uint8Array(d.buffer?new Uint8Array(d.buffer,d.byteOffset,d.byteLength):d)}
    const d=new Uint8Array(ch_.byteLength);ch_.copyTo(d);samples.push({data:d,key:ch_.type==='key'})},error:e=>{err=e}});
   enc.configure(cfg);
   for(let i=0;i<NF;i++){
    if(cancel)throw new Error('Annulé');if(err)throw err;
    frame(i/VFPS);const vf=new VideoFrame(cvS,{timestamp:Math.round(i*1e6/VFPS),duration:Math.round(1e6/VFPS)});
    enc.encode(vf,{keyFrame:i%(VFPS*2)===0});vf.close();
    while(enc.encodeQueueSize>6){await vSleep(3)}
    if(i%6===0){bar.style.width=(35+i/NF*63)+'%';lab.textContent='Encodage… '+Math.round(i/NF*100)+' %';await vSleep(0)}}
   await enc.flush();enc.close();if(err)throw err;if(!avcC)throw new Error('Encodeur H.264 sans configuration');
   blob=mp4Mux(W,H,VFPS,avcC,samples)}
  else if(typeof MediaRecorder==='function'){
   const mt=['video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9','video/webm'].find(x=>MediaRecorder.isTypeSupported(x));
   if(!mt)throw new Error('Ce navigateur ne sait pas enregistrer de vidéo. Utilisez Chrome, Edge ou Safari récent.');
   ext=/mp4/.test(mt)?'mp4':'webm';if(ext==='webm')note=' (format WebM : ce navigateur ne produit pas de MP4)';
   const stream=cvS.captureStream(VFPS),rec=new MediaRecorder(stream,{mimeType:mt,videoBitsPerSecond:br}),parts=[];
   rec.ondataavailable=e=>{if(e.data.size)parts.push(e.data)};const stopped=new Promise(r=>rec.onstop=r);
   rec.start(500);const t0=performance.now();let i=0;
   lab.textContent='Enregistrement en temps réel — gardez cet onglet visible…';
   while(i<NF){if(cancel){rec.stop();throw new Error('Annulé')}const tgt=t0+i/VFPS*1000;frame(i/VFPS);i++;const w=tgt-performance.now();if(w>0)await vSleep(w);else if(i%5===0)await vSleep(0);if(i%6===0)bar.style.width=(35+i/NF*63)+'%'}
   await vSleep(200);rec.stop();await stopped;blob=new Blob(parts,{type:mt.split(';')[0]})}
  else throw new Error('Ce navigateur ne gère ni WebCodecs ni MediaRecorder. Utilisez Chrome, Edge ou Safari récent.');
  ov.remove();
  const nm=slug()+(chs.length===1?'-'+(String(chs[0].title||'chapitre').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^\w]+/g,'_').slice(0,30)):'-conversations')+'.'+ext;
  dl(nm,blob,blob.type);toast('Vidéo créée : '+nm+' ('+Math.round(dur)+' s, '+(blob.size/1048576).toFixed(1)+' Mo)'+note);
  window.__lastVideo=blob;
 }catch(e){fail(e)}}
boot().catch(e=>{console.error(e);document.body.prepend(h('pre',{style:'color:#c00;padding:10px'},'Erreur au démarrage : '+e.message+'\n'+e.stack))});
