(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function r(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(n){if(n.ep)return;n.ep=!0;const o=r(n);fetch(n.href,o)}})();const xe="modulepreload",be=function(e){return"/"+e},K={},h=function(t,r,s){let n=Promise.resolve();if(r&&r.length>0){document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),i=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));n=Promise.allSettled(r.map(l=>{if(l=be(l),l in K)return;K[l]=!0;const u=l.endsWith(".css"),v=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${v}`))return;const m=document.createElement("link");if(m.rel=u?"stylesheet":xe,u||(m.as="script"),m.crossOrigin="",m.href=l,i&&m.setAttribute("nonce",i),document.head.appendChild(m),u)return new Promise((C,I)=>{m.addEventListener("load",C),m.addEventListener("error",()=>I(new Error(`Unable to preload CSS for ${l}`)))})}))}function o(a){const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=a,window.dispatchEvent(i),!i.defaultPrevented)throw a}return n.then(a=>{for(const i of a||[])i.status==="rejected"&&o(i.reason);return t().catch(o)})};function c(e,t="info"){document.querySelectorAll(".toast").forEach(o=>o.remove());const s=document.createElement("div"),n={success:"#25D366",error:"#ef4444",info:"#8696a0",warning:"#f59e0b"};s.className="toast fixed right-4 top-4 p-4 rounded-lg text-white shadow-lg transform translate-x-full transition-all duration-300 z-50",s.style.backgroundColor=n[t],s.innerHTML=`
    <div class="flex items-center">
      <i class="fas ${t==="success"?"fa-check-circle":t==="error"?"fa-exclamation-circle":t==="warning"?"fa-exclamation-triangle":"fa-info-circle"} mr-2"></i>
      <span>${e}</span>
    </div>
  `,document.body.appendChild(s),setTimeout(()=>{s.style.transform="translateX(0)"},100),setTimeout(()=>{s.style.transform="translateX(100%)",setTimeout(()=>s.remove(),300)},3e3)}async function Ee(){try{return await Notification.requestPermission()==="granted"}catch(e){return console.error("Erreur permissions notifications:",e),!1}}const $="https://mon-serveur-cub8.onrender.com";async function $e(){try{const e=Ie();if(!e)return console.error("Aucun utilisateur connecté"),[];console.log(`Récupération chats pour ${e.name} (ID: ${e.id})`);const t=await fetch(`${$}/chats`);if(!t.ok)throw new Error("Erreur réseau");const r=await t.json();console.log("Total chats dans la base:",r.length);const s=r.filter(n=>n.ownerId===e.id);return console.log(`Chats de ${e.name}:`,s.length),s}catch(e){return console.error(" Erreur getChats:",e),[]}}async function re(e){try{console.log("Récupération messages pour chat:",e);const t=await fetch(`${$}/chats/${e}`);if(!t.ok)throw new Error("Erreur réseau");return(await t.json()).messages||[]}catch(t){return console.error("Erreur getMessages:",t),[]}}async function Ce(e,t){try{console.log(` Mise à jour chat ${e}:`,t);const r=await fetch(`${$}/chats/${e}`);if(!r.ok)return console.warn(` Chat ${e} non trouvé pour mise à jour`),null;const s=await r.json();Object.assign(s,t);const n=await fetch(`${$}/chats/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(!n.ok)throw new Error("Erreur mise à jour");return console.log(`Chat ${e} mis à jour`),await n.json()}catch(r){return console.error(" Erreur updateChat:",r),null}}async function Se(e,t){try{console.log(`Mise à jour statut utilisateur ${e}:`,t?"en ligne":"hors ligne");const r=await fetch(`${$}/users/${e}`);if(r.ok){const n=await r.json();n.isOnline=t,n.lastSeen=new Date().toISOString(),await fetch(`${$}/users/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)})}const s=await fetch(`${$}/chats`);if(s.ok){const o=(await s.json()).filter(a=>a.contactId===e);for(const a of o)a.isOnline=t,a.lastSeen=new Date().toISOString(),a.status=t?"en ligne":"hors ligne",await fetch(`${$}/chats/${a.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)})}console.log(` Statut utilisateur ${e} mis à jour`)}catch(r){console.error(" Erreur updateUserStatus:",r)}}function Ie(){const e=localStorage.getItem("currentUser");return e?JSON.parse(e):null}async function Le(){try{console.log(" Initialisation de tous les chats croisés...");const t=await(await fetch(`${$}/users`)).json();console.log(` ${t.length} utilisateurs trouvés`);const s=await(await fetch(`${$}/chats`)).json();let n=0;for(const o of t)for(const a of t)if(o.id!==a.id&&!s.find(l=>l.ownerId===o.id&&l.contactId===a.id)){const l={id:`${o.id}_${a.id}_${Date.now()+Math.random()}`,ownerId:o.id,contactId:a.id,name:a.name,phone:a.phone,avatar:a.avatar,status:"Hors ligne",isOnline:a.isOnline||!1,lastSeen:a.lastSeen||new Date().toISOString(),unread:0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),lastMessage:"",lastMessageTime:new Date().toISOString(),messages:[]};await fetch(`${$}/chats`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(l)}),n++,console.log(` Chat créé: ${o.name} -> ${a.name}`)}return console.log(` Initialisation terminée: ${n} chats créés`),{success:!0,chatsCreated:n}}catch(e){throw console.error("Erreur initialisation chats:",e),e}}let ne=null;function Me(){const e=localStorage.getItem("currentUser");if(e)try{const t=JSON.parse(e);return se(t),t}catch(t){console.error("Erreur parsing user:",t),localStorage.removeItem("currentUser")}return null}function g(){return ne||Me()}function se(e){ne=e,e?(localStorage.setItem("currentUser",JSON.stringify(e)),Se(e.id,"en ligne").catch(console.error)):localStorage.removeItem("currentUser")}function oe(){window.refreshInterval&&clearInterval(window.refreshInterval),localStorage.removeItem("currentUser"),window.location.reload()}async function Te(e,t){try{if(!e&&!t)return c(" Veuillez remplir tous les champs","error"),null;if(!e)return c(" Le nom est obligatoire","error"),null;if(!t)return c(" Le numéro de téléphone est obligatoire","error"),null;if(e.length<2)return c(" Le nom doit contenir au moins 2 caractères","error"),null;if(e.length>50)return c(" Le nom ne peut pas dépasser 50 caractères","error"),null;if(!/^\d+$/.test(t))return c(" Le numéro ne doit contenir que des chiffres","error"),null;if(t.length!==9)return c(" Le numéro doit contenir exactement 9 chiffres","error"),null;if(!t.startsWith("7"))return c(" Le numéro doit commencer par 7 (format sénégalais)","error"),null;const r=await fetch("https://mon-serveur-cub8.onrender.com/users");if(!r.ok)return c(" Erreur de connexion au serveur","error"),null;const s=await r.json(),n=s.find(o=>o.name.toLowerCase().trim()===e.toLowerCase().trim()&&o.phone.trim()===t.trim());if(n)return se(n),c(` Bienvenue ${n.name} !`,"success"),n;{const o=s.find(i=>i.name.toLowerCase().trim()===e.toLowerCase().trim()),a=s.find(i=>i.phone.trim()===t.trim());return c(o&&!a?" Ce nom existe mais avec un autre numéro de téléphone":!o&&a?"Ce numéro existe mais avec un autre nom":"Aucun compte trouvé avec ces informations","error"),null}}catch(r){return console.error("Erreur de connexion:",r),c(" Erreur de connexion au serveur. Vérifiez votre connexion internet.","error"),null}}function Ae(e){const t=document.createElement("div");t.className="min-h-screen flex items-center justify-center bg-[#111b21] px-4",t.innerHTML=`
    <div class="max-w-md w-full bg-[#222e35] rounded-lg shadow-xl p-8">
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fab fa-whatsapp text-3xl text-white"></i>
        </div>
        <h1 class="text-2xl font-bold text-white mb-2">WhatsApp Web</h1>
        <p class="text-gray-400">Connectez-vous pour continuer</p>
      </div>
      
      <form id="loginForm" class="space-y-4">
        <div>
          <input 
            type="text" 
            id="nameInput"
            placeholder="Votre nom" 
            class="w-full px-4 py-3 bg-[#2a3942] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all"
          >
        </div>
        
        <div>
          <input 
            type="tel" 
            id="phoneInput"
            placeholder="Numéro de téléphone (9 chiffres)" 
            class="w-full px-4 py-3 bg-[#2a3942] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all"
          >
        </div>
        
        <button 
          type="submit"
          id="loginButton"
          class="w-full py-3 bg-[#25D366] hover:bg-[#1ea952] text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Se connecter
        </button>
      </form>
      
      <div class="mt-6 p-4 bg-[#2a3942] rounded-lg">
        <p class="text-sm text-gray-400 mb-2"> Comptes de test disponibles :</p>
        <div class="space-y-1 text-xs text-gray-500">
          <div>• Zafe - 777867740</div>
          <div>• Abdallah - 778123456</div>
          <div>• Ousmane Marra - 776543210</div>
          <div>• Maman Dié ODC - 775555555</div>
          <div>• Zeynabe Ba - 774444444</div>
        </div>
      </div>
    </div>
  `;const r=t.querySelector("#loginForm"),s=t.querySelector("#nameInput"),n=t.querySelector("#phoneInput"),o=t.querySelector("#loginButton");return n.addEventListener("input",a=>{let i=a.target.value.replace(/[^0-9]/g,"");i.length>9&&(i=i.substring(0,9),c(" Maximum 9 chiffres autorisés","warning")),a.target.value=i}),s.addEventListener("input",a=>{let i=a.target.value;i.length>50&&(i=i.substring(0,50),c(" Maximum 50 caractères autorisés pour le nom","warning"),a.target.value=i)}),r.addEventListener("submit",async a=>{a.preventDefault();const i=s.value.trim(),l=n.value.trim();o.disabled=!0,o.innerHTML=`
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        Connexion en cours...
      </div>
    `;try{const u=await Te(i,l);u&&e&&e(u)}finally{o.disabled=!1,o.textContent="Se connecter"}}),t}const G="https://mon-serveur-cub8.onrender.com",X=new Map,Y=new Map;let L=null,P=null,N=null,ae=!0;function Be(e,t){console.log("🚀 Initialisation synchronisation temps réel AMÉLIORÉE..."),P=e,N=t,L&&clearInterval(L),L=setInterval(R,1e3),Ge(),window.addEventListener("beforeunload",Ue),window.addEventListener("visibilitychange",De),console.log("✅ Synchronisation temps réel ULTRA-RAPIDE activée")}async function R(){try{const e=q();if(!e)return;await ke(e),await je(e)}catch(e){console.error("❌ Erreur synchronisation temps réel:",e)}}async function ke(e){try{const t=await fetch(`${G}/chats`);if(!t.ok)return;const r=await t.json();for(const s of r){const n=s.messages||[],o=s.id,a=X.get(o)||0,i=Y.get(o)||null;if(n.length>a){const l=n.slice(a);for(const u of l)i&&u.id===i||_e(e.id,s,u)&&(console.log("📨 NOUVEAU MESSAGE DÉTECTÉ:",{from:u.senderName||u.senderId,to:e.name,type:u.type,chat:s.name}),P&&P(u,s),document.hidden&&Oe(u,s),Y.set(o,u.id));X.set(o,n.length)}}}catch(t){console.error("❌ Erreur vérification messages:",t)}}async function je(e){try{if(!N)return;const t=await fetch(`${G}/users`);if(!t.ok)return;const r=await t.json();for(const s of r)if(s.id!==e.id){const n=new Date(s.lastSeen||0),i=(new Date-n)/(1e3*60)<2;N(s.id,i)}}catch(t){console.error("❌ Erreur vérification statuts:",t)}}function _e(e,t,r){const s=t.ownerId===e,n=t.contactId===e,o=r.senderId!==e;return(s||n)&&o}async function Ge(){try{const e=q();if(!e)return;await fetch(`${G}/users/${e.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...e,isOnline:!0,lastSeen:new Date().toISOString()})}),ae=!0,console.log("🟢 Utilisateur marqué en ligne")}catch(e){console.error("❌ Erreur marquage en ligne:",e)}}async function Ue(){try{const e=q();if(!e)return;await fetch(`${G}/users/${e.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...e,isOnline:!1,lastSeen:new Date().toISOString()})}),ae=!1,console.log("🔴 Utilisateur marqué hors ligne")}catch(e){console.error("❌ Erreur marquage hors ligne:",e)}}function De(){document.hidden?console.log("👁️ Onglet masqué"):(console.log("👁️ Onglet visible"),ie())}function Oe(e,t){try{if(!("Notification"in window)||Notification.permission!=="granted")return;const r=e.senderName||t.name||"Nouveau message";let s="";switch(e.type){case"voice":s="🎤 Message vocal";break;case"image":s="📷 Photo";break;case"video":s="🎥 Vidéo";break;default:s=e.text||"Nouveau message";break}const n=new Notification(r,{body:s,icon:t.avatar||"/placeholder.svg?height=64&width=64",badge:"/placeholder.svg?height=32&width=32",tag:`whatsapp-${e.id}`,requireInteraction:!1,silent:!1});setTimeout(()=>n.close(),5e3),n.onclick=()=>{window.focus(),n.close()}}catch(r){console.error("❌ Erreur notification système:",r)}}function q(){const e=localStorage.getItem("currentUser");return e?JSON.parse(e):null}function ie(){console.log("⚡ Synchronisation forcée IMMÉDIATE"),R()}function ce(e){L&&(clearInterval(L),L=setInterval(R,e),console.log(`🔄 Fréquence de sync ajustée à ${e}ms`))}let le=Date.now();function V(){le=Date.now(),L&&ce(1e3)}setInterval(()=>{Date.now()-le>3e4&&L&&(ce(5e3),console.log("😴 Utilisateur inactif, réduction de la fréquence de sync"))},1e4);document.addEventListener("click",V);document.addEventListener("keypress",V);document.addEventListener("scroll",V);const B="https://mon-serveur-cub8.onrender.com";async function ue(e,t,r){try{console.log(" Envoi message:",{senderId:e,receiverId:t,message:r});const n=await(await fetch(`${B}/users`)).json(),o=n.find(m=>m.id===e),a=n.find(m=>m.id===t);if(!o||!a)throw console.error("Utilisateur non trouvé:",{sender:o,receiver:a}),new Error("Utilisateur non trouvé");const l=await(await fetch(`${B}/chats`)).json(),u=l.find(m=>m.ownerId===e&&m.contactId===t),v=l.find(m=>m.ownerId===t&&m.contactId===e);if(u&&await ee(u.id,r),v){const m={...r,sent:!1};await ee(v.id,m)}else await Pe(t,e,o,r);return console.log(" Message envoyé avec succès"),!0}catch(s){throw console.error("Erreur envoi message:",s),s}}async function Pe(e,t,r,s){try{const n={...s,sent:!1},o={id:`${e}_${t}_${Date.now()}`,ownerId:e,contactId:t,name:r.name,phone:r.phone,avatar:r.avatar,status:r.status,isOnline:r.isOnline,lastSeen:r.lastSeen,unread:1,time:s.time,lastMessage:s.type==="text"?s.text:de(s),lastMessageTime:s.timestamp,messages:[n]};await fetch(`${B}/chats`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)}),console.log(`Chat créé pour le destinataire ${e}`)}catch(n){console.error(" Erreur création chat destinataire:",n)}}async function ee(e,t){try{const r=await fetch(`${B}/chats/${e}`);if(!r.ok)throw console.error(`Chat ${e} non trouvé`),new Error(`Chat ${e} non trouvé`);const s=await r.json();if(s.messages=s.messages||[],s.messages.find(a=>a.id===t.id)){console.log(`Message ${t.id} existe déjà dans le chat ${e}`);return}if(s.messages.push(t),s.lastMessage=t.type==="text"?t.text:de(t),s.time=t.time,s.lastMessageTime=t.timestamp,t.sent||(s.unread=(s.unread||0)+1),!(await fetch(`${B}/chats/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)})).ok)throw new Error("Erreur mise à jour chat");console.log(` Message ajouté au chat ${e}`)}catch(r){throw console.error(`Erreur ajout message au chat ${e}:`,r),r}}function de(e){switch(e.type){case"image":return" Photo";case"video":return" Vidéo";case"audio":return" Audio";case"voice":return" Message vocal";case"document":return` ${e.fileName}`;default:return e.text}}const At=Object.freeze(Object.defineProperty({__proto__:null,handleSendMessage:ue},Symbol.toStringTag,{value:"Module"})),_="https://mon-serveur-cub8.onrender.com";function Ne(e,t=null){const r=["men","women"],s=t||r[Math.floor(Math.random()*r.length)],n=Math.floor(Math.random()*99)+1;return`https://randomuser.me/api/portraits/${s}/${n}.jpg`}async function Re(e,t,r){try{if(!r||!t)return c(" Veuillez remplir tous les champs","error"),null;if(r.length<2||r.length>50)return c(" Le nom doit contenir entre 2 et 50 caractères","error"),null;if(!/^\d{9}$/.test(t)||!t.startsWith("7"))return c(" Numéro invalide (9 chiffres commençant par 7)","error"),null;const s=await fetch(`${_}/users`);if(!s.ok)return c(" Erreur de connexion au serveur","error"),null;const n=await s.json();let o=n.find(a=>a.phone===t);return!o&&(o={id:(n.length+1).toString(),name:r,phone:t,avatar:Ne(r),status:"Hors ligne",isOnline:!1,lastSeen:new Date().toISOString(),bio:"Salut ! J'utilise WhatsApp.",walletBalance:0,totalEarnings:0,contacts:[],groups:[]},!(await fetch(`${_}/users`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)})).ok)?(c(" Erreur lors de la création du contact","error"),null):o.id===e?(c(" Vous ne pouvez pas vous ajouter vous-même","error"),null):(await qe(e,o),c(` ${o.name} ajouté à vos contacts`,"success"),o)}catch(s){return console.error("Erreur ajout contact:",s),c(" Erreur de connexion","error"),null}}async function qe(e,t){try{if((await(await fetch(`${_}/chats`)).json()).find(a=>a.ownerId===e&&a.contactId===t.id)){console.log("Chat déjà existant pour cet utilisateur");return}const o={id:`${e}_${t.id}_${Date.now()}`,ownerId:e,contactId:t.id,name:t.name,phone:t.phone,avatar:t.avatar,status:t.status,isOnline:t.isOnline,lastSeen:t.lastSeen,unread:0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),lastMessage:"",lastMessageTime:new Date().toISOString(),messages:[]};await fetch(`${_}/chats`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)}),console.log(` Chat personnel créé pour ${e} avec ${t.name}`)}catch(r){console.error("Erreur création chat personnel:",r)}}function H(e){const t=document.createElement("div");t.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",t.innerHTML=`
    <div class="bg-[#222e35] rounded-lg p-6 w-full max-w-md">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-white">Ajouter un contact</h2>
        <button id="closeModal" class="text-gray-400 hover:text-white">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="addContactForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Nom complet
          </label>
          <input 
            type="text" 
            id="contactName"
            placeholder="Ex: Jean Dupont"
            class="w-full px-4 py-3 bg-[#2a3942] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Numéro de téléphone
          </label>
          <input 
            type="tel" 
            id="contactPhone"
            placeholder="Ex: 777123456"
            class="w-full px-4 py-3 bg-[#2a3942] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
        </div>
        
        <div class="text-xs text-gray-500 bg-[#2a3942] p-3 rounded-lg">
          <i class="fas fa-info-circle mr-2"></i>
           Ce contact sera ajouté UNIQUEMENT à votre liste personnelle.
        </div>
        
        <div class="flex space-x-3">
          <button 
            type="button"
            id="cancelBtn"
            class="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button 
            type="submit"
            id="addBtn"
            class="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Ajouter
          </button>
        </div>
      </form>
    </div>
  `;const r=t.querySelector("#closeModal"),s=t.querySelector("#cancelBtn"),n=t.querySelector("#addContactForm"),o=t.querySelector("#contactName"),a=t.querySelector("#contactPhone"),i=()=>{document.body.removeChild(t)};r.addEventListener("click",i),s.addEventListener("click",i),a.addEventListener("input",l=>{let u=l.target.value.replace(/[^0-9]/g,"");u.length>9&&(u=u.substring(0,9),c(" Maximum 9 chiffres autorisés","warning")),l.target.value=u}),o.addEventListener("input",l=>{let u=l.target.value;u.length>50&&(u=u.substring(0,50),c(" Maximum 50 caractères autorisés","warning"),l.target.value=u)}),n.addEventListener("submit",async l=>{l.preventDefault();const u=o.value.trim(),v=a.value.trim(),m=JSON.parse(localStorage.getItem("currentUser"));if(!m){c(" Erreur: utilisateur non connecté","error");return}const C=t.querySelector("#addBtn");C.disabled=!0,C.innerHTML=`
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Ajout...
      </div>
    `;try{const I=await Re(m.id,v,u);I&&e&&e(I),i()}finally{C.disabled=!1,C.textContent="Ajouter"}}),document.body.appendChild(t),o.focus()}const F="https://mon-serveur-cub8.onrender.com";async function Ve(){try{const e=await fetch(`${F}/stories`);if(!e.ok)throw new Error(`Erreur HTTP: ${e.status}`);return await e.json()}catch(e){return console.error("Erreur récupération stories:",e),[]}}function He(e){const t=document.createElement("div");t.className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4",t.innerHTML=`
    <div class="bg-[#1f2937] rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-gray-700">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-white">Créer une story</h2>
        <button id="closeModal" class="text-gray-400 hover:text-white transition-colors p-2">
          <i class="fas fa-times text-2xl"></i>
        </button>
      </div>
      
      <form id="createStoryForm" class="space-y-6">
        <!-- Zone de drop pour fichier -->
        <div id="dropZone" class="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-green-500 transition-colors cursor-pointer">
          <div id="dropContent">
            <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
            <p class="text-white font-medium mb-2">Glissez votre photo/vidéo ici</p>
            <p class="text-gray-400 text-sm mb-4">ou cliquez pour sélectionner</p>
            <input 
              type="file" 
              id="storyContent"
              accept="image/*,video/*"
              class="hidden"
              required
            >
            <button type="button" id="selectFileBtn" class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Choisir un fichier
            </button>
          </div>
          
          <!-- Prévisualisation -->
          <div id="previewContainer" class="hidden">
            <div class="relative">
              <img id="imagePreview" class="hidden w-full h-48 object-cover rounded-lg mb-4">
              <video id="videoPreview" class="hidden w-full h-48 object-cover rounded-lg mb-4" controls></video>
              <button type="button" id="removeFile" class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <p id="fileName" class="text-white text-sm"></p>
          </div>
        </div>
        
        <!-- Options de story -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Texte sur la story (optionnel)
            </label>
            <input 
              type="text" 
              id="storyText"
              placeholder="Ajoutez du texte..."
              class="w-full px-4 py-3 bg-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-600"
            >
          </div>
          
          <div class="flex items-center space-x-3">
            <input type="checkbox" id="allowReplies" class="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500">
            <label for="allowReplies" class="text-gray-300">Autoriser les réponses</label>
          </div>
        </div>
        
        <div class="flex space-x-4">
          <button 
            type="button"
            id="cancelBtn"
            class="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
          >
            Annuler
          </button>
          <button 
            type="submit"
            id="createBtn"
            class="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          >
            Publier la story
          </button>
        </div>
      </form>
    </div>
  `,document.body.appendChild(t),Fe(t,e)}function Fe(e,t){const r=e.querySelector("#closeModal"),s=e.querySelector("#cancelBtn"),n=e.querySelector("#createStoryForm"),o=e.querySelector("#dropZone"),a=e.querySelector("#storyContent"),i=e.querySelector("#selectFileBtn"),l=e.querySelector("#dropContent"),u=e.querySelector("#previewContainer"),v=e.querySelector("#imagePreview"),m=e.querySelector("#videoPreview"),C=e.querySelector("#fileName"),I=e.querySelector("#removeFile"),T=()=>document.body.removeChild(e);r.addEventListener("click",T),s.addEventListener("click",T),i.addEventListener("click",()=>a.click()),o.addEventListener("dragover",f=>{f.preventDefault(),o.classList.add("border-green-500")}),o.addEventListener("dragleave",()=>{o.classList.remove("border-green-500")}),o.addEventListener("drop",f=>{f.preventDefault(),o.classList.remove("border-green-500");const y=f.dataTransfer.files;y.length>0&&A(y[0])}),a.addEventListener("change",f=>{f.target.files.length>0&&A(f.target.files[0])}),I.addEventListener("click",()=>{a.value="",l.classList.remove("hidden"),u.classList.add("hidden"),v.classList.add("hidden"),m.classList.add("hidden")});function A(f){if(!f.type.startsWith("image/")&&!f.type.startsWith("video/")){c("Veuillez sélectionner une image ou une vidéo","error");return}const y=new FileReader;y.onload=w=>{l.classList.add("hidden"),u.classList.remove("hidden"),C.textContent=f.name,f.type.startsWith("image/")?(v.src=w.target.result,v.classList.remove("hidden"),m.classList.add("hidden")):(m.src=w.target.result,m.classList.remove("hidden"),v.classList.add("hidden"))},y.readAsDataURL(f)}n.addEventListener("submit",async f=>{f.preventDefault();const y=a.files[0];if(!y){c("Veuillez sélectionner un fichier","error");return}const w=JSON.parse(localStorage.getItem("currentUser"));if(!w){c("Erreur: utilisateur non connecté","error");return}const x=e.querySelector("#createBtn");x.disabled=!0,x.innerHTML=`
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        Publication...
      </div>
    `;try{const b=await We(y),j=e.querySelector("#storyText").value.trim(),we=e.querySelector("#allowReplies").checked,Q={id:`story_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,userId:w.id,userName:w.name,userAvatar:w.avatar,contentUrl:b,contentType:y.type,text:j,allowReplies:we,timestamp:new Date().toISOString(),views:[],replies:[],isMonetized:!1,earnings:0,expiresAt:new Date(Date.now()+24*60*60*1e3).toISOString()},Z=await fetch(`${F}/stories`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Q)});if(!Z.ok)throw new Error(`Erreur HTTP: ${Z.status}`);c("✅ Story publiée avec succès","success"),t&&t(Q),T()}catch(b){console.error("Erreur création story:",b),c("❌ Erreur lors de la publication","error")}finally{x.disabled=!1,x.textContent="Publier la story"}})}function ze(e,t=0){if(!e||e.length===0){c("Aucune story à afficher","error");return}let r=t,s=null,n=e[r],o=Date.now();const a=document.createElement("div");a.id="storyViewer",a.className="fixed inset-0 bg-black z-50 flex flex-col";function i(){var w;n=e[r];const f=(w=n.contentType)==null?void 0:w.startsWith("video/"),y=f?15e3:5e3;a.innerHTML=`
      <!-- Barres de progression en haut -->
      <div class="absolute top-4 left-4 right-4 z-20">
        <div class="flex space-x-1">
          ${e.map((x,b)=>`
            <div class="flex-1 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <div class="progress-bar h-full bg-white transition-all duration-100 ${b<r?"w-full":"w-0"}" data-story-index="${b}"></div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Header avec info utilisateur -->
      <div class="absolute top-12 left-4 right-4 z-20 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <img src="${n.userAvatar}" alt="${n.userName}" 
               class="w-10 h-10 rounded-full border-2 border-white object-cover">
          <div>
            <div class="text-white font-medium text-sm">${n.userName}</div>
            <div class="text-white text-opacity-80 text-xs">${Qe(n.timestamp)}</div>
          </div>
        </div>
        
        <button id="closeStoryViewer" class="text-white text-opacity-80 hover:text-white p-2">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Contenu principal -->
      <div class="flex-1 relative flex items-center justify-center">
        ${f?`
          <video id="storyVideo" class="max-w-full max-h-full object-contain" autoplay muted>
            <source src="${n.contentUrl}" type="${n.contentType}">
          </video>
        `:`
          <img id="storyImage" src="${n.contentUrl}" alt="Story" 
               class="max-w-full max-h-full object-contain">
        `}
        
        <!-- Texte sur la story -->
        ${n.text?`
          <div class="absolute bottom-20 left-4 right-4 text-center">
            <div class="bg-black bg-opacity-50 rounded-lg px-4 py-2 inline-block">
              <p class="text-white text-lg font-medium">${n.text}</p>
            </div>
          </div>
        `:""}

        <!-- Zones de navigation invisibles -->
        <div class="absolute inset-0 flex">
          <div id="prevArea" class="w-1/3 h-full cursor-pointer"></div>
          <div id="pauseArea" class="w-1/3 h-full cursor-pointer"></div>
          <div id="nextArea" class="w-1/3 h-full cursor-pointer"></div>
        </div>
      </div>

      <!-- Footer avec actions -->
      <div class="absolute bottom-4 left-4 right-4 z-20">
        ${n.allowReplies?`
          <div class="flex items-center space-x-3">
            <input type="text" placeholder="Répondre à ${n.userName}..." 
                   class="flex-1 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 px-4 py-2 rounded-full focus:outline-none focus:bg-opacity-30">
            <button class="text-white text-opacity-80 hover:text-white p-2">
              <i class="fas fa-heart text-xl"></i>
            </button>
            <button class="text-white text-opacity-80 hover:text-white p-2">
              <i class="fas fa-share text-xl"></i>
            </button>
          </div>
        `:`
          <div class="flex justify-center space-x-6">
            <button class="text-white text-opacity-80 hover:text-white p-2">
              <i class="fas fa-heart text-xl"></i>
            </button>
            <button class="text-white text-opacity-80 hover:text-white p-2">
              <i class="fas fa-share text-xl"></i>
            </button>
          </div>
        `}
      </div>
    `,l(y),u()}function l(f){clearInterval(s),o=Date.now();const y=a.querySelector(`[data-story-index="${r}"]`);y&&(s=setInterval(()=>{const w=Date.now()-o,x=Math.min(w/f*100,100);y.style.width=`${x}%`,x>=100&&(clearInterval(s),v())},50))}function u(){const f=a.querySelector("#closeStoryViewer"),y=a.querySelector("#prevArea"),w=a.querySelector("#pauseArea"),x=a.querySelector("#nextArea");f==null||f.addEventListener("click",A),y==null||y.addEventListener("click",m),x==null||x.addEventListener("click",v);let b=!1;w==null||w.addEventListener("click",()=>{b?I():C(),b=!b}),document.addEventListener("keydown",T)}function v(){r<e.length-1?(r++,i()):A()}function m(){r>0&&(r--,i())}function C(){clearInterval(s);const f=a.querySelector("#storyVideo");f&&f.pause()}function I(){var j;const f=Date.now()-o,x=(((j=n.contentType)==null?void 0:j.startsWith("video/"))?15e3:5e3)-f;x>0&&l(x);const b=a.querySelector("#storyVideo");b&&b.play()}function T(f){switch(f.key){case"ArrowLeft":m();break;case"ArrowRight":case" ":v();break;case"Escape":A();break}}function A(){clearInterval(s),document.removeEventListener("keydown",T),document.body.removeChild(a)}document.body.appendChild(a),i(),Je(n.id)}async function Je(e){try{const t=JSON.parse(localStorage.getItem("currentUser"));if(!t)return;await fetch(`${F}/stories/${e}/view`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:t.id})})}catch(t){console.error("Erreur marquage vue story:",t)}}function We(e){return new Promise((t,r)=>{const s=new FileReader;s.onload=()=>t(s.result),s.onerror=r,s.readAsDataURL(e)})}function Qe(e){const t=new Date(e),s=new Date().getTime()-t.getTime(),n=Math.floor(s/6e4),o=Math.floor(s/36e5),a=Math.floor(s/864e5);return n<1?"À l'instant":n<60?`${n} min`:o<24?`${o}h`:`${a}j`}const Ze=ze;let M=[],d=null,p=null,E="chats",D=!1,O=!1;window.currentChat=null;window.currentGroup=null;window.showSimpleGroups=null;document.addEventListener("DOMContentLoaded",()=>{console.log("🚀 WhatsApp Web démarré"),Ke(),setTimeout(Et,1e3)});async function Ke(){const e=document.getElementById("mainContainer"),t=document.getElementById("loginContainer"),r=g();r?(console.log("✅ Utilisateur connecté:",r.name),n()):(console.log("❌ Aucun utilisateur connecté"),s());function s(){e.style.display="none",t.style.display="block",t.innerHTML="";const o=Ae(a=>{console.log("✅ Connexion réussie pour:",a.name),n()});t.appendChild(o)}function n(){t.style.display="none",e.style.display="flex",Xe()}}async function Xe(){try{console.log("🔧 Initialisation de l'interface..."),await S(),Ye(),ht(),ye(),Be((e,t)=>{console.log("📨 Nouveau message reçu:",e),wt(e,t)},(e,t)=>{console.log(`👤 Statut utilisateur ${e}:`,t?"en ligne":"hors ligne"),xt(e,t)}),yt(),await Ee(),console.log("✅ Interface principale initialisée")}catch(e){console.error("❌ Erreur initialisation:",e),c("Erreur de chargement","error")}}async function S(){try{if(console.log("📂 Chargement des chats..."),M=await $e(),console.log(`📊 ${M.length} chats chargés`),E==="chats"&&z(),d){const e=await re(d.id);await ge(e)}}catch(e){console.error("❌ Erreur chargement chats:",e),c("Impossible de charger les conversations","error")}}function Ye(){console.log("🔧 Configuration des événements...");const e=document.getElementById("userAvatarButton");e&&e.addEventListener("click",pt);const t=document.getElementById("backToChats");t&&t.addEventListener("click",ve);const r=document.getElementById("logoutButton");r&&r.addEventListener("click",oe);const s=document.getElementById("backButton");s&&s.addEventListener("click",ft),mt(),nt(),tt(),rt(),et(),window.addEventListener("resize",vt)}function et(){const e=document.getElementById("newChatBtn");e&&e.addEventListener("click",()=>{if(!g()){c("❌ Erreur: utilisateur non connecté","error");return}H(async r=>{console.log("✅ Contact ajouté:",r.name),await S(),c(`${r.name} ajouté avec succès`,"success")})})}function tt(){const e=document.getElementById("searchInput");e&&e.addEventListener("input",t=>{const r=t.target.value.toLowerCase().trim();it(r)})}function rt(){const e=document.querySelectorAll(".filter-tab");e.forEach(t=>{t.addEventListener("click",()=>{e.forEach(n=>{n.classList.remove("active","bg-green-600","text-white"),n.classList.add("text-gray-400")}),t.classList.add("active","bg-green-600","text-white"),t.classList.remove("text-gray-400");const r=t.dataset.filter,s=t.textContent.trim().toLowerCase();s.includes("groupe")||s.includes("group")?(console.log("📱 Clic sur onglet Groupes"),E="groups",k()):(console.log("💬 Retour aux chats normaux"),E="chats",p=null,window.currentGroup=null,r==="all"||!r?z():ct(r))})})}function nt(){const e=document.querySelectorAll(".nav-item");e.forEach(t=>{t.addEventListener("click",async r=>{r.preventDefault(),r.stopPropagation();const s=t.dataset.view;if(console.log("🧭 Navigation vers:",s),!(D||E===s)){D=!0;try{switch(E=s,e.forEach(n=>n.classList.remove("active")),t.classList.add("active"),s){case"chats":await te();break;case"status":await st();break;case"communities":c("📱 Groupes - Fonctionnalité en développement","info");break;case"settings":ot();break}console.log("✅ Navigation terminée vers:",s)}catch(n){console.error("❌ Erreur navigation:",n),E="chats",await te()}finally{setTimeout(()=>{D=!1},500)}}})})}async function te(){console.log("💬 Affichage vue chats");const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel");t.style.display="none",e.style.display="flex",p=null,window.currentGroup=null,await S()}async function st(){console.log("📸 Affichage vue stories");const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel");t.style.display="none",e.style.display="flex",await me()}function ot(){console.log("⚙️ Affichage vue paramètres");const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel");t.style.display="none",e.style.display="flex",at()}async function me(){const e=document.getElementById("chatList"),t=g();if(!(!e||!t))try{const r=await Ve();e.innerHTML=`
      <div class="p-4">
        <button id="createStoryBtn" class="w-full p-4 bg-[#202c33] hover:bg-[#2a3942] rounded-lg flex items-center space-x-3 mb-4 transition-colors">
          <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <i class="fas fa-plus text-white text-xl"></i>
          </div>
          <div class="text-left">
            <div class="text-white font-medium">Créer une story</div>
            <div class="text-gray-400 text-sm">Partagez un moment</div>
          </div>
        </button>
        
        <div class="space-y-2">
          ${r.length===0?`
            <div class="text-center py-8 text-gray-400">
              <i class="fas fa-circle text-4xl mb-4 opacity-30"></i>
              <p>Aucune story disponible</p>
              <p class="text-sm">Soyez le premier à partager !</p>
            </div>
          `:r.map(n=>`
            <div class="story-item p-3 hover:bg-[#202c33] rounded-lg cursor-pointer transition-colors" data-story-id="${n.id}">
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <img src="${n.userAvatar}" alt="${n.userName}" class="w-12 h-12 rounded-full object-cover">
                </div>
                <div class="flex-1">
                  <div class="text-white font-medium">${n.userName}</div>
                  <div class="text-gray-400 text-sm">${bt(n.timestamp)}</div>
                </div>
                <div class="text-right">
                  <div class="text-gray-400 text-xs">${n.views.length} vues</div>
                  ${n.isMonetized?`<div class="text-green-400 text-xs">💰 ${n.earnings} FCFA</div>`:""}
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;const s=document.getElementById("createStoryBtn");s&&s.addEventListener("click",()=>{He(async n=>{E==="status"&&await me()})}),document.querySelectorAll(".story-item").forEach(n=>{n.addEventListener("click",()=>{const o=n.dataset.storyId,a=r.findIndex(i=>i.id===o);a!==-1&&Ze(r,a)})})}catch(r){console.error("❌ Erreur chargement stories:",r),e.innerHTML=`
      <div class="text-center py-8 text-red-400">
        <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
        <p>Erreur de chargement</p>
      </div>
    `}}function at(){const e=document.getElementById("chatList"),t=g();if(!e||!t)return;e.innerHTML=`
    <div class="p-4 space-y-4">
      <div class="bg-[#202c33] rounded-lg p-4">
        <div class="flex items-center space-x-3 mb-4">
          <img src="${t.avatar}" alt="${t.name}" class="w-16 h-16 rounded-full object-cover">
          <div>
            <div class="text-white font-medium text-lg">${t.name}</div>
            <div class="text-gray-400">${t.phone}</div>
          </div>
        </div>
        <div class="text-gray-300 text-sm">${t.bio||"Aucune bio"}</div>
      </div>
      
      <div class="space-y-2">
        <button id="addContactBtn" class="w-full p-3 bg-[#202c33] hover:bg-[#2a3942] rounded-lg flex items-center space-x-3 transition-colors">
          <i class="fas fa-user-plus text-green-400"></i>
          <span class="text-white">Ajouter un contact</span>
        </button>
        
        <button id="initChatsBtn" class="w-full p-3 bg-green-600 hover:bg-green-700 rounded-lg flex items-center space-x-3 transition-colors">
          <i class="fas fa-rocket text-white"></i>
          <span class="text-white">Initialiser tous les chats</span>
        </button>
        
        <button id="refreshBtn" class="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-3 transition-colors">
          <i class="fas fa-sync text-white"></i>
          <span class="text-white">Actualiser</span>
        </button>
        
        <button id="logoutBtn" class="w-full p-3 bg-red-600 hover:bg-red-700 rounded-lg flex items-center space-x-3 transition-colors">
          <i class="fas fa-sign-out-alt text-white"></i>
          <span class="text-white">Se déconnecter</span>
        </button>
      </div>
    </div>
  `;const r=document.getElementById("addContactBtn");r&&r.addEventListener("click",()=>{H(async a=>{await S(),c(`${a.name} ajouté avec succès`,"success")})});const s=document.getElementById("initChatsBtn");s&&s.addEventListener("click",async()=>{try{c("🚀 Initialisation de tous les chats...","info");const a=await Le();c(`${a.chatsCreated} chats créés !`,"success"),await S()}catch(a){console.error("❌ Erreur initialisation:",a),c("❌ Erreur lors de l'initialisation","error")}});const n=document.getElementById("refreshBtn");n&&n.addEventListener("click",async()=>{c("Actualisation...","info"),await S(),ie(),c("✅ Actualisé !","success")});const o=document.getElementById("logoutBtn");o&&o.addEventListener("click",oe)}function it(e){document.querySelectorAll(".chat-item").forEach(r=>{var o,a;const s=((o=r.querySelector(".chat-name"))==null?void 0:o.textContent.toLowerCase())||"",n=((a=r.querySelector(".chat-message"))==null?void 0:a.textContent.toLowerCase())||"";s.includes(e)||n.includes(e)?r.style.display="block":r.style.display="none"})}function ct(e){let t=[...M];switch(e){case"unread":t=t.filter(r=>r.unread>0);break;case"favorites":t=t.filter(r=>r.isFavorite);break;case"groups":t=t.filter(r=>r.isGroup);break}lt(t)}function lt(e){const t=document.getElementById("chatList");t&&(t.innerHTML="",e.forEach(r=>{const s=fe(r);t.appendChild(s)}))}function z(){const e=document.getElementById("chatList");if(!e)return;const t=g();if(!t)return;if(console.log(`📊 Rendu de ${M.length} chats pour ${t.name}`),e.innerHTML="",M.length===0){e.innerHTML=`
      <div class="text-center py-8 text-gray-400">
        <i class="fas fa-comments text-4xl mb-4 opacity-30"></i>
        <p class="mb-2">Aucune conversation</p>
        <p class="text-sm">Ajoutez un contact pour commencer !</p>
        <button id="addFirstContact" class="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
          <i class="fas fa-user-plus mr-2"></i>
          Ajouter un contact
        </button>
      </div>
    `;const s=document.getElementById("addFirstContact");s&&s.addEventListener("click",()=>{H(async n=>{await S(),c(`${n.name} ajouté avec succès`,"success")})});return}[...M].sort((s,n)=>{const o=new Date(s.lastMessageTime||s.time);return new Date(n.lastMessageTime||n.time)-o}).forEach(s=>{const n=fe(s);e.appendChild(n)})}function fe(e){const t=document.createElement("div");t.className="chat-item px-4 py-3 cursor-pointer hover:bg-[#202c33] transition-colors border-b border-gray-700",t.dataset.chatId=e.id;const r=e.unread>0,s=e.isOnline;return t.innerHTML=`
    <div class="flex items-center space-x-3">
      <div class="relative">
        <img src="${e.avatar}" alt="${e.name}" class="w-12 h-12 rounded-full object-cover">
        ${s?'<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#222e35]"></div>':""}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start">
          <h3 class="chat-name font-medium text-white truncate ${r?"font-semibold":""}">${e.name}</h3>
          <div class="flex flex-col items-end space-y-1">
            <span class="text-xs ${r?"text-green-400":"text-gray-400"}">${e.time}</span>
            ${r?`<span class="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">${e.unread}</span>`:""}
          </div>
        </div>
        <div class="mt-1">
          <p class="chat-message text-sm ${r?"text-white font-medium":"text-gray-400"} truncate">${e.lastMessage||"Aucun message"}</p>
        </div>
      </div>
    </div>
  `,t.addEventListener("click",()=>{console.log("🔘 Clic sur chat:",e.name,"ID:",e.id),p=null,window.currentGroup=null,ut(e.id)}),t}async function ut(e){var t;try{if(console.log("💬 === OUVERTURE CHAT PERSONNEL ==="),console.log("Chat ID:",e),ve(),p=null,window.currentGroup=null,d=M.find(r=>r.id===e),window.currentChat=d,!d){console.error("❌ Chat non trouvé:",e),c("Chat non trouvé","error");return}console.log("✅ Chat personnel ouvert:",d.name),console.log("Contact ID:",d.contactId),d.unread>0&&(d.unread=0,await Ce(d.id,{unread:0})),document.querySelectorAll(".chat-item").forEach(r=>{r.classList.remove("bg-[#202c33]")}),(t=document.querySelector(`[data-chat-id="${e}"]`))==null||t.classList.add("bg-[#202c33]"),U()&&(document.getElementById("sidebar").style.display="none"),document.getElementById("chatArea").style.display="flex",pe(),await ge(),he(),E==="chats"&&z()}catch(r){console.error("❌ Erreur ouverture chat:",r),c("Erreur lors de l'ouverture du chat","error")}}function pe(){const e=document.getElementById("chatHeader"),t=document.getElementById("chatAvatar"),r=document.getElementById("chatName"),s=document.getElementById("chatStatus");if(e&&(d||p)){if(e.style.display="flex",p){console.log("📱 Affichage header GROUPE:",p.name),t.innerHTML=`
        <div class="relative">
          <img src="${p.avatar||"https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop"}" 
               alt="${p.name}" class="w-10 h-10 rounded-full object-cover">
          <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-600 rounded-full flex items-center justify-center">
            <i class="fas fa-users text-xs text-white"></i>
          </div>
        </div>
      `,r.textContent=p.name,St(p,s);const n=document.getElementById("callButtons");n&&(n.innerHTML=`
          <button onclick="openGroupInfos()" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors">
            ℹ️ Infos
          </button>
        `)}else if(d){console.log("💬 Affichage header CHAT PERSONNEL:",d.name),t.innerHTML=`<img src="${d.avatar}" alt="${d.name}" class="w-10 h-10 rounded-full object-cover">`,r.textContent=d.name,s.textContent=d.isOnline?"en ligne":d.status;const n=document.getElementById("callButtons");n&&(n.innerHTML=`
          <button id="audioCallBtn" class="p-2 text-gray-400 hover:text-white transition-colors">
            <i class="fas fa-phone text-lg"></i>
          </button>
          <button id="videoCallBtn" class="p-2 text-gray-400 hover:text-white transition-colors">
            <i class="fas fa-video text-lg"></i>
          </button>
        `,requestAnimationFrame(()=>{const o=document.getElementById("audioCallBtn"),a=document.getElementById("videoCallBtn");console.log("🔧 Configuration boutons d'appel..."),console.log("Audio button:",o),console.log("Video button:",a),o?(o.replaceWith(o.cloneNode(!0)),document.getElementById("audioCallBtn").addEventListener("click",async l=>{l.preventDefault(),l.stopPropagation(),console.log("📞 === CLIC APPEL AUDIO ==="),console.log("Contact:",d.name);try{c("🔄 Initialisation appel audio...","info");const{initializeAudioCall:u}=await h(async()=>{const{initializeAudioCall:v}=await import("./calls-BX4_nfsH.js");return{initializeAudioCall:v}},[]);console.log("📞 Module calls importé, démarrage appel..."),await u(d)}catch(u){console.error("❌ Erreur appel audio:",u),c("❌ Erreur lors de l'appel audio: "+u.message,"error")}}),console.log("✅ Event listener audio ajouté")):console.error("❌ Bouton audio non trouvé"),a?(a.replaceWith(a.cloneNode(!0)),document.getElementById("videoCallBtn").addEventListener("click",async l=>{l.preventDefault(),l.stopPropagation(),console.log("📹 === CLIC APPEL VIDEO ==="),console.log("Contact:",d.name);try{c("🔄 Initialisation appel vidéo...","info");const{startVideoCall:u}=await h(async()=>{const{startVideoCall:v}=await import("./calls-BX4_nfsH.js");return{startVideoCall:v}},[]);console.log("📹 Module calls importé, démarrage appel..."),await u(d)}catch(u){console.error("❌ Erreur appel vidéo:",u),c("❌ Erreur lors de l'appel vidéo: "+u.message,"error")}}),console.log("✅ Event listener vidéo ajouté")):console.error("❌ Bouton vidéo non trouvé")}))}}}async function ge(){const e=document.getElementById("messagesArea");if(!(!e||!d))try{console.log("📨 Rendu des messages pour:",d.name);const t=await re(d.id);if(d.messages=t,e.innerHTML="",t.length===0){e.innerHTML=`
        <div class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <i class="fas fa-comments text-4xl mb-4 opacity-30"></i>
            <p>Aucun message</p>
            <p class="text-sm">Envoyez votre premier message !</p>
          </div>
        </div>
      `;return}t.forEach(r=>{const s=J(r);e.appendChild(s)}),e.scrollTop=e.scrollHeight,console.log(`✅ ${t.length} messages affichés`)}catch(t){console.error("❌ Erreur lors du rendu des messages:",t),c("Erreur lors du chargement des messages","error")}}function J(e){const t=g(),r=e.senderId===t.id,s=document.createElement("div");s.className=`flex mb-4 ${r?"justify-end":"justify-start"}`,s.dataset.messageId=e.id;let n="";switch(e.type){case"voice":n=`
        <div class="flex items-center space-x-3">
          ${r?"":`
            <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img src="${t.avatar}" alt="Avatar" class="w-full h-full object-cover">
            </div>
          `}
          
          <button class="voice-play-btn w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all" 
                  data-message-id="${e.id}" 
                  data-audio-data="${e.fileData}">
            <i class="fas fa-play text-sm"></i>
          </button>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-1 mb-1">
              ${Array.from({length:20},(o,a)=>`<div class="bg-white bg-opacity-60 rounded-full" style="width: 2px; height: ${Math.random()*16+4}px;"></div>`).join("")}
            </div>
            <div class="text-xs text-gray-300">
              <span class="voice-duration">${e.duration||0}s</span>
            </div>
          </div>
        </div>
      `;break;case"text":default:n=`<p class="text-sm">${e.text}</p>`;break}if(s.innerHTML=`
    <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${r?"bg-[#005c4b] text-white":"bg-[#202c33] text-white"} shadow-md">
      ${n}
      <div class="flex justify-end items-center mt-1 space-x-1">
        <span class="text-xs text-gray-300">${e.time}</span>
        ${r?`<i class="fas fa-check-double text-xs ${e.status==="read"?"text-blue-400":"text-gray-400"}"></i>`:""}
      </div>
    </div>
  `,e.type==="voice"){const o=s.querySelector(".voice-play-btn");o&&o.addEventListener("click",()=>dt(o))}return s}function dt(e){e.dataset.messageId;const t=e.dataset.audioData;if(!t){c("Données audio manquantes","error");return}try{const r=new Audio(t),s=e.querySelector("i"),n=e.closest(".max-w-xs, .max-w-md").querySelector(".voice-duration");let o=!1;r.addEventListener("timeupdate",()=>{if(n&&r.duration){const a=Math.ceil(r.duration-r.currentTime);n.textContent=`${a}s`}}),r.addEventListener("ended",()=>{s.className="fas fa-play text-sm",n&&r.duration&&(n.textContent=`${Math.ceil(r.duration)}s`),o=!1}),r.addEventListener("error",a=>{console.error("Erreur lecture audio:",a),c("Erreur lecture audio","error"),s.className="fas fa-play text-sm",o=!1}),o?(r.pause(),s.className="fas fa-play text-sm",o=!1):r.play().then(()=>{s.className="fas fa-pause text-sm",o=!0}).catch(a=>{console.error("Erreur démarrage audio:",a),c("Impossible de lire l'audio","error")})}catch(r){console.error("Erreur création audio:",r),c("Erreur lecture message vocal","error")}}function he(){const e=document.getElementById("messageInput");e&&(e.style.display="flex")}function mt(){const e=document.getElementById("messageText"),t=document.getElementById("sendButton"),r=document.getElementById("voiceBtn");if(!e||!t)return;if(r){let n=!1;r.addEventListener("click",async()=>{if(n){const{stopVoiceRecording:o}=await h(async()=>{const{stopVoiceRecording:a}=await import("./audio-recorder-Cgwpfqdb.js");return{stopVoiceRecording:a}},[]);o(),n=!1}else{const{startVoiceRecording:o}=await h(async()=>{const{startVoiceRecording:i}=await import("./audio-recorder-Cgwpfqdb.js");return{startVoiceRecording:i}},[]);await o()&&(n=!0)}})}async function s(){if(O){console.log("⏳ Envoi déjà en cours, ignoré");return}const n=e.value.trim();if(n&&!(!d&&!p))try{O=!0;const o=g();if(!o)return;console.log("📤 Envoi message:",n);const a={id:Date.now(),senderId:o.id,receiverId:p?p.id:d.contactId,text:n,sent:!0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),timestamp:new Date().toISOString(),type:"text",status:"sent"};e.value="";const i=J(a),l=document.getElementById("messagesArea");l&&(l.appendChild(i),l.scrollTop=l.scrollHeight),p?await Mt(o.id,p.id,a):await ue(o.id,d.contactId,a),E==="chats"&&await S(),console.log("✅ Message envoyé avec succès")}catch(o){console.error("❌ Erreur envoi message:",o),c("Erreur lors de l'envoi","error")}finally{O=!1}}t.addEventListener("click",s),e.addEventListener("keypress",n=>{n.key==="Enter"&&!n.shiftKey&&(n.preventDefault(),s())})}function ft(){U()&&(document.getElementById("sidebar").style.display="flex",document.getElementById("chatArea").style.display="none"),d=null,p=null,window.currentChat=null,window.currentGroup=null,document.getElementById("chatHeader").style.display="none",document.getElementById("messageInput").style.display="none",ye()}function pt(){const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel"),r=document.getElementById("chatArea");e.style.display="none",r.style.display="none",t.style.display="flex",gt()}function ve(){const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel"),r=document.getElementById("chatArea");t.style.display="none",e.style.display="flex",(d||p)&&(r.style.display="flex")}function gt(){const e=g();if(e){const t=document.getElementById("profileImage"),r=document.getElementById("profileName");t&&(t.src=e.avatar,t.alt=e.name),r&&(r.textContent=e.name)}}function ht(){const e=g(),t=document.querySelectorAll(".user-avatar img");e&&t.length>0&&t.forEach(r=>{r.src=e.avatar,r.alt=e.name})}function ye(){const e=document.getElementById("messagesArea");e&&(e.innerHTML=`
      <div class="flex items-center justify-center h-full text-gray-500">
        <div class="text-center">
          <div class="text-8xl mb-4 opacity-30">
            <i class="fab fa-whatsapp text-green-500"></i>
          </div>
          <h2 class="text-3xl mb-4 font-light">WhatsApp Web</h2>
          <p class="text-gray-400 mb-2">Sélectionnez une conversation pour commencer</p>
          <div class="mt-8 flex justify-center">
            <div class="flex items-center text-gray-500 text-sm">
              <i class="fas fa-lock mr-2"></i>
              <span>Vos messages sont chiffrés de bout en bout</span>
            </div>
          </div>
        </div>
      </div>
    `)}function vt(){!U()&&(d||p)&&(document.getElementById("sidebar").style.display="flex",document.getElementById("chatArea").style.display="flex")}function U(){return window.innerWidth<768}function yt(){setInterval(async()=>{E==="chats"&&await S()},1e4)}function wt(e,t){const r=g();if(r){if(d&&d.id===t.id){const s=J(e),n=document.getElementById("messagesArea");n&&(n.appendChild(s),n.scrollTop=n.scrollHeight)}E==="chats"&&S(),e.senderId!==r.id&&c(`📨 Nouveau message de ${t.name}`,"info")}}function xt(e,t){if(document.querySelectorAll(".chat-item").forEach(s=>{const n=M.find(o=>o.id===s.dataset.chatId);if(n&&n.contactId===e){const o=s.querySelector(".online-indicator");if(t&&!o){const a=s.querySelector(".relative");a.innerHTML+='<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#222e35]"></div>'}else!t&&o&&o.remove()}}),d&&d.contactId===e){const s=document.getElementById("chatStatus");s&&(s.textContent=t?"en ligne":"hors ligne")}}function bt(e){const t=new Date(e),s=new Date().getTime()-t.getTime(),n=Math.floor(s/6e4);return n<60?`${n} minutes`:n<1440?`${Math.floor(n/60)} heures`:`${Math.floor(n/1440)} jours`}function Et(){console.log("🚀 Initialisation simple des groupes..."),setTimeout(()=>{document.querySelectorAll(".filter-tab").forEach((t,r)=>{const s=t.textContent.trim().toLowerCase();if(s.includes("groupe")||s.includes("group")||r===3){console.log("📱 Onglet Groupes trouvé:",s);const n=t.cloneNode(!0);t.parentNode.replaceChild(n,t),n.addEventListener("click",k)}})},1e3)}async function k(){console.log("📱 Affichage des groupes avec boutons d'action...");const e=document.getElementById("chatList");if(e){E="groups";try{const t=g();if(!t){c("Vous devez être connecté","error");return}const{getUserGroups:r}=await h(async()=>{const{getUserGroups:o}=await import("./groups-C2Hc1Rjt.js");return{getUserGroups:o}},[]),s=await r(t.id);e.innerHTML=`
      <div class="p-4">
        <button id="createGroupBtn" class="w-full p-4 bg-green-600 hover:bg-green-700 rounded-lg flex items-center space-x-3 mb-4 transition-colors">
          <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <i class="fas fa-users text-green-600 text-xl"></i>
          </div>
          <div class="text-left">
            <div class="text-white font-medium">Nouveau groupe</div>
            <div class="text-gray-200 text-sm">Créer un groupe avec vos contacts</div>
          </div>
        </button>
        
        <div class="space-y-3">
          ${s.length===0?`
            <div class="text-center py-8 text-gray-400">
              <div class="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                <i class="fas fa-users text-2xl text-gray-400"></i>
              </div>
              <h3 class="text-lg font-medium text-white mb-2">Aucun groupe</h3>
              <p class="text-gray-400 text-sm max-w-xs mx-auto">
                Vous n'avez pas encore de groupes. Créez-en un pour commencer !
              </p>
            </div>
          `:s.map(o=>`
            <div class="bg-[#202c33] rounded-lg p-4 hover:bg-[#2a3942] transition-colors">
              <!-- En-tête du groupe -->
              <div class="flex items-center space-x-3 mb-3">
                <div class="relative cursor-pointer" onclick="openGroupChat('${o.id}')">
                  <img src="${o.avatar||"https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop"}" 
                       alt="${o.name}" 
                       class="w-12 h-12 rounded-full object-cover">
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                    <i class="fas fa-users text-xs text-white"></i>
                  </div>
                </div>
                
                <div class="flex-1 min-w-0 cursor-pointer" onclick="openGroupChat('${o.id}')">
                  <div class="flex items-center justify-between">
                    <h3 class="font-medium text-white truncate">${o.name}</h3>
                    <span class="text-xs text-gray-400">${Tt(o.lastMessageTime)}</span>
                  </div>
                  
                  <div class="flex items-center justify-between mt-1">
                    <p class="text-sm text-gray-400 truncate">
                      ${o.lastMessage||"Aucun message"}
                    </p>
                    <div class="flex items-center space-x-2">
                      ${o.admins&&o.admins.includes(t.id)?'<i class="fas fa-crown text-yellow-500 text-xs" title="Administrateur"></i>':""}
                      <span class="text-xs text-gray-500">${o.members?o.members.length:0} membres</span>
                    </div>
                  </div>
                  
                  ${o.description?`<p class="text-xs text-gray-500 mt-1 truncate">${o.description}</p>`:""}
                </div>
              </div>
              
              <!-- Boutons d'action -->
              <div class="flex flex-wrap gap-2 pt-3 border-t border-gray-600">
                <button onclick="openGroupChat('${o.id}')" 
                        class="flex-1 min-w-0 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors">
                  📱 Ouvrir
                </button>
                
                <button onclick="showGroupInfoQuick('${o.id}')" 
                        class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors">
                  ℹ️ Infos
                </button>
                
                ${o.admins&&o.admins.includes(t.id)?`
                  <button onclick="showAddMemberQuick('${o.id}')" 
                          class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors">
                    ➕ Membre
                  </button>
                  
                  <button onclick="showManageMembersQuick('${o.id}')" 
                          class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition-colors">
                    👥 Gérer
                  </button>
                `:""}
                
                <button onclick="leaveGroupQuick('${o.id}')" 
                        class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors">
                  🚪 Quitter
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;const n=document.getElementById("createGroupBtn");n&&n.addEventListener("click",async()=>{try{const{createGroupModal:o}=await h(async()=>{const{createGroupModal:a}=await import("./groups-C2Hc1Rjt.js");return{createGroupModal:a}},[]);o(a=>{a&&(c(`Groupe "${a.name}" créé avec succès`,"success"),k())})}catch(o){console.error("Erreur chargement module groupes:",o),c("Erreur lors du chargement du module groupes","error")}}),console.log(`✅ ${s.length} groupe(s) affiché(s) avec boutons d'action`)}catch(t){console.error("❌ Erreur affichage groupes:",t),e.innerHTML=`
      <div class="text-center py-8 text-red-400">
        <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
        <p>Erreur de chargement des groupes</p>
        <button onclick="showSimpleGroups()" class="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
          Réessayer
        </button>
      </div>
    `}}}window.openGroupChat=async e=>{try{console.log("💬 Ouverture groupe depuis bouton:",e);const{getUserGroups:t}=await h(async()=>{const{getUserGroups:o}=await import("./groups-C2Hc1Rjt.js");return{getUserGroups:o}},[]),r=g(),n=(await t(r.id)).find(o=>o.id===e);n?await Ct(n):c("Groupe non trouvé","error")}catch(t){console.error("Erreur ouverture groupe:",t),c("Erreur lors de l'ouverture du groupe","error")}};window.showGroupInfoQuick=async e=>{try{console.log("📋 Infos groupe depuis bouton:",e);const{getUserGroups:t,showGroupInfo:r}=await h(async()=>{const{getUserGroups:a,showGroupInfo:i}=await import("./groups-C2Hc1Rjt.js");return{getUserGroups:a,showGroupInfo:i}},[]),s=g(),o=(await t(s.id)).find(a=>a.id===e);o?r(o):c("Groupe non trouvé","error")}catch(t){console.error("Erreur infos groupe:",t),c("Erreur lors de l'affichage des infos","error")}};window.showAddMemberQuick=async e=>{try{console.log("➕ Ajout membre depuis bouton:",e);const{getUserGroups:t,showAddMemberModal:r}=await h(async()=>{const{getUserGroups:a,showAddMemberModal:i}=await import("./groups-C2Hc1Rjt.js");return{getUserGroups:a,showAddMemberModal:i}},[]),s=g(),o=(await t(s.id)).find(a=>a.id===e);o?r(o):c("Groupe non trouvé","error")}catch(t){console.error("Erreur ajout membre:",t),c("Erreur lors de l'ajout de membre","error")}};window.showManageMembersQuick=async e=>{try{console.log("👥 Gestion membres depuis bouton:",e);const{getUserGroups:t}=await h(async()=>{const{getUserGroups:o}=await import("./groups-C2Hc1Rjt.js");return{getUserGroups:o}},[]),r=g(),n=(await t(r.id)).find(o=>o.id===e);n?$t(n):c("Groupe non trouvé","error")}catch(t){console.error("Erreur gestion membres:",t),c("Erreur lors de la gestion des membres","error")}};window.leaveGroupQuick=async e=>{try{console.log("🚪 Quitter groupe depuis bouton:",e);const{getUserGroups:t,leaveGroup:r}=await h(async()=>{const{getUserGroups:a,leaveGroup:i}=await import("./groups-C2Hc1Rjt.js");return{getUserGroups:a,leaveGroup:i}},[]),s=g(),o=(await t(s.id)).find(a=>a.id===e);o?confirm(`Êtes-vous sûr de vouloir quitter le groupe "${o.name}" ?`)&&await r(o.id,s.id)&&(c(`Vous avez quitté le groupe "${o.name}"`,"success"),k()):c("Groupe non trouvé","error")}catch(t){console.error("Erreur quitter groupe:",t),c("Erreur lors de la sortie du groupe","error")}};function $t(e){const t=document.createElement("div");t.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",t.innerHTML=`
    <div class="bg-[#222e35] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-white">Gérer les membres</h2>
        <button id="closeModal" class="text-gray-400 hover:text-white">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <div class="mb-4">
        <h3 class="text-lg font-medium text-white mb-2">${e.name}</h3>
        <p class="text-gray-400 text-sm">${e.members?e.members.length:0} membres</p>
      </div>
      
      <div id="membersList" class="space-y-3 max-h-96 overflow-y-auto">
        <!-- Les membres seront chargés ici -->
      </div>
      
      <div class="mt-6 flex justify-end">
        <button id="closeBtn" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
          Fermer
        </button>
      </div>
    </div>
  `,document.body.appendChild(t),W(e);const r=t.querySelector("#closeModal"),s=t.querySelector("#closeBtn"),n=()=>document.body.removeChild(t);r.addEventListener("click",n),s.addEventListener("click",n)}async function W(e){try{const t=g(),{getGroupMembers:r}=await h(async()=>{const{getGroupMembers:o}=await import("./groups-C2Hc1Rjt.js");return{getGroupMembers:o}},[]),s=await r(e.id),n=document.getElementById("membersList");if(!n)return;n.innerHTML=s.map(o=>{const a=e.admins&&e.admins.includes(o.id),i=o.id===e.createdBy,l=o.id===t.id;return`
        <div class="bg-[#2a3942] rounded-lg p-3">
          <div class="flex items-center space-x-3 mb-2">
            <img src="${o.avatar}" alt="${o.name}" class="w-10 h-10 rounded-full object-cover">
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <div class="text-white font-medium">${l?"Vous":o.name}</div>
                ${i?'<span class="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Créateur</span>':""}
                ${a&&!i?'<span class="text-xs bg-green-600 text-white px-2 py-1 rounded">Admin</span>':""}
              </div>
              <div class="text-gray-400 text-sm">${o.phone}</div>
            </div>
          </div>
          
          ${!l&&!i?`
            <div class="flex gap-2">
              ${a?"":`<button onclick="promoteToAdminQuick('${e.id}', '${o.id}')" 
                            class="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                       Promouvoir Admin
                    </button>`}
              
              <button onclick="removeMemberQuick('${e.id}', '${o.id}')" 
                      class="flex-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
                 Supprimer
              </button>
            </div>
          `:""}
        </div>
      `}).join("")}catch(t){console.error("Erreur chargement membres:",t);const r=document.getElementById("membersList");r&&(r.innerHTML='<div class="text-red-400 text-sm p-3">Erreur de chargement</div>')}}window.promoteToAdminQuick=async(e,t)=>{try{const{promoteToAdmin:r}=await h(async()=>{const{promoteToAdmin:o}=await import("./groups-C2Hc1Rjt.js");return{promoteToAdmin:o}},[]),s=g();if(await r(e,t,s.id)){const{getUserGroups:o}=await h(async()=>{const{getUserGroups:l}=await import("./groups-C2Hc1Rjt.js");return{getUserGroups:l}},[]),i=(await o(s.id)).find(l=>l.id===e);i&&W(i)}}catch(r){console.error("Erreur promotion admin:",r),c("Erreur lors de la promotion","error")}};window.removeMemberQuick=async(e,t)=>{try{const{removeMemberFromGroup:r}=await h(async()=>{const{removeMemberFromGroup:n}=await import("./groups-C2Hc1Rjt.js");return{removeMemberFromGroup:n}},[]),s=g();if(confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")&&await r(e,t,s.id)){const{getUserGroups:o}=await h(async()=>{const{getUserGroups:l}=await import("./groups-C2Hc1Rjt.js");return{getUserGroups:l}},[]),i=(await o(s.id)).find(l=>l.id===e);i&&W(i)}}catch(r){console.error("Erreur suppression membre:",r),c("Erreur lors de la suppression","error")}};async function Ct(e){try{console.log("💬 === OUVERTURE CHAT GROUPE DIRECT ==="),console.log("Groupe:",e.name,"ID:",e.id),d=null,window.currentChat=null,p=e,window.currentGroup=e,U()&&(document.getElementById("sidebar").style.display="none"),document.getElementById("chatArea").style.display="flex",pe(),await It(e),he(),c(`Groupe "${e.name}" ouvert`,"success")}catch(t){console.error("❌ Erreur ouverture groupe:",t),c("Erreur lors de l'ouverture du groupe","error")}}async function St(e,t){try{const r=g(),{getGroupMembers:s}=await h(async()=>{const{getGroupMembers:l}=await import("./groups-C2Hc1Rjt.js");return{getGroupMembers:l}},[]),n=await s(e.id);if(n.length===0){t.textContent="Aucun membre";return}const o=n.find(l=>l.id===r.id),a=n.filter(l=>l.id!==r.id);let i="";o?(i="Vous",a.length>0&&(a.length===1?i+=`, ${a[0].name}`:a.length===2?i+=`, ${a[0].name}, ${a[1].name}`:i+=`, ${a[0].name} et ${a.length-1} autre${a.length-1>1?"s":""}`)):n.length===1?i=n[0].name:n.length===2?i=`${n[0].name}, ${n[1].name}`:i=`${n[0].name} et ${n.length-1} autres`,t.textContent=i,console.log("✅ Membres affichés:",i)}catch(r){console.error("Erreur affichage membres:",r),t.textContent=`${e.members?e.members.length:0} membres`}}async function It(e){const t=document.getElementById("messagesArea");if(!(!t||!e))try{console.log("📱 Rendu des messages du groupe:",e.name);const{getGroupMessages:r}=await h(async()=>{const{getGroupMessages:n}=await import("./groups-C2Hc1Rjt.js");return{getGroupMessages:n}},[]),s=await r(e.id);if(t.innerHTML="",s.length===0){t.innerHTML=`
        <div class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <i class="fas fa-users text-4xl mb-4 opacity-30"></i>
            <p>Aucun message dans ce groupe</p>
            <p class="text-sm">Soyez le premier à écrire !</p>
          </div>
        </div>
      `;return}s.forEach(n=>{const o=Lt(n,e);t.appendChild(o)}),t.scrollTop=t.scrollHeight,console.log(`✅ ${s.length} messages de groupe affichés`)}catch(r){console.error("❌ Erreur rendu messages groupe:",r),t.innerHTML=`
      <div class="flex items-center justify-center h-full text-red-500">
        <div class="text-center">
          <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <p>Erreur de chargement des messages</p>
        </div>
      </div>
    `}}function Lt(e,t){const r=g(),s=e.senderId===r.id,n=document.createElement("div");n.className=`flex mb-4 ${s?"justify-end":"justify-start"}`,n.dataset.messageId=e.id;let o="";!s&&e.senderName&&(o=`<div class="text-xs text-gray-400 mb-1">${e.senderName}</div>`);let a="";switch(e.type){case"text":default:a=`<p class="text-sm">${e.text}</p>`;break}return n.innerHTML=`
    <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${s?"bg-[#005c4b] text-white":"bg-[#202c33] text-white"} shadow-md">
      ${o}
      ${a}
      <div class="flex justify-end items-center mt-1 space-x-1">
        <span class="text-xs text-gray-300">${e.time}</span>
        ${s?`<i class="fas fa-check-double text-xs ${e.status==="read"?"text-blue-400":"text-gray-400"}"></i>`:""}
      </div>
    </div>
  `,n}async function Mt(e,t,r){try{console.log("📤 === ENVOI MESSAGE GROUPE ==="),console.log("Expéditeur:",e),console.log("Groupe:",t),console.log("Message:",r.text);const{sendMessageToGroup:s}=await h(async()=>{const{sendMessageToGroup:o}=await import("./groups-C2Hc1Rjt.js");return{sendMessageToGroup:o}},[]),n=await s(e,t,r);return console.log("✅ Message de groupe envoyé:",n),n}catch(s){throw console.error("❌ Erreur envoi message groupe:",s),s}}function Tt(e){if(!e)return"";const t=new Date(e),s=new Date-t;return s<24*60*60*1e3?t.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}):s<7*24*60*60*1e3?t.toLocaleDateString("fr-FR",{weekday:"short"}):t.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"})}window.openGroupInfos=async()=>{console.log("🔘 Ouverture infos groupe");try{if(!p){c("Aucun groupe sélectionné","error");return}const{showGroupInfo:e}=await h(async()=>{const{showGroupInfo:t}=await import("./groups-C2Hc1Rjt.js");return{showGroupInfo:t}},[]);e(p)}catch(e){console.error("❌ Erreur ouverture infos:",e),c("Erreur lors de l'ouverture des infos","error")}};window.showSimpleGroups=k;export{h as _,At as c,c as s};
