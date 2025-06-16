(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function s(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(r){if(r.ep)return;r.ep=!0;const o=s(r);fetch(r.href,o)}})();const se="modulepreload",re=function(e){return"/"+e},U={},p=function(t,s,n){let r=Promise.resolve();if(s&&s.length>0){document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),i=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));r=Promise.allSettled(s.map(l=>{if(l=re(l),l in U)return;U[l]=!0;const m=l.endsWith(".css"),v=m?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${v}`))return;const d=document.createElement("link");if(d.rel=m?"stylesheet":se,m||(d.as="script"),d.crossOrigin="",d.href=l,i&&d.setAttribute("nonce",i),document.head.appendChild(d),m)return new Promise((w,C)=>{d.addEventListener("load",w),d.addEventListener("error",()=>C(new Error(`Unable to preload CSS for ${l}`)))})}))}function o(a){const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=a,window.dispatchEvent(i),!i.defaultPrevented)throw a}return r.then(a=>{for(const i of a||[])i.status==="rejected"&&o(i.reason);return t().catch(o)})};function c(e,t="info"){document.querySelectorAll(".toast").forEach(o=>o.remove());const n=document.createElement("div"),r={success:"#25D366",error:"#ef4444",info:"#8696a0",warning:"#f59e0b"};n.className="toast fixed right-4 top-4 p-4 rounded-lg text-white shadow-lg transform translate-x-full transition-all duration-300 z-50",n.style.backgroundColor=r[t],n.innerHTML=`
    <div class="flex items-center">
      <i class="fas ${t==="success"?"fa-check-circle":t==="error"?"fa-exclamation-circle":t==="warning"?"fa-exclamation-triangle":"fa-info-circle"} mr-2"></i>
      <span>${e}</span>
    </div>
  `,document.body.appendChild(n),setTimeout(()=>{n.style.transform="translateX(0)"},100),setTimeout(()=>{n.style.transform="translateX(100%)",setTimeout(()=>n.remove(),300)},3e3)}async function ne(){try{return await Notification.requestPermission()==="granted"}catch(e){return console.error("Erreur permissions notifications:",e),!1}}const y="https://mon-serveur-cub8.onrender.com";async function oe(){try{const e=ce();if(!e)return console.error("Aucun utilisateur connecté"),[];console.log(`Récupération chats pour ${e.name} (ID: ${e.id})`);const t=await fetch(`${y}/chats`);if(!t.ok)throw new Error("Erreur réseau");const s=await t.json();console.log("Total chats dans la base:",s.length);const n=s.filter(r=>r.ownerId===e.id);return console.log(`Chats de ${e.name}:`,n.length),n}catch(e){return console.error(" Erreur getChats:",e),[]}}async function N(e){try{console.log("Récupération messages pour chat:",e);const t=await fetch(`${y}/chats/${e}`);if(!t.ok)throw new Error("Erreur réseau");return(await t.json()).messages||[]}catch(t){return console.error("Erreur getMessages:",t),[]}}async function ae(e,t){try{console.log(` Mise à jour chat ${e}:`,t);const s=await fetch(`${y}/chats/${e}`);if(!s.ok)return console.warn(` Chat ${e} non trouvé pour mise à jour`),null;const n=await s.json();Object.assign(n,t);const r=await fetch(`${y}/chats/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)});if(!r.ok)throw new Error("Erreur mise à jour");return console.log(`Chat ${e} mis à jour`),await r.json()}catch(s){return console.error(" Erreur updateChat:",s),null}}async function ie(e,t){try{console.log(`Mise à jour statut utilisateur ${e}:`,t?"en ligne":"hors ligne");const s=await fetch(`${y}/users/${e}`);if(s.ok){const r=await s.json();r.isOnline=t,r.lastSeen=new Date().toISOString(),await fetch(`${y}/users/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)})}const n=await fetch(`${y}/chats`);if(n.ok){const o=(await n.json()).filter(a=>a.contactId===e);for(const a of o)a.isOnline=t,a.lastSeen=new Date().toISOString(),a.status=t?"en ligne":"hors ligne",await fetch(`${y}/chats/${a.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)})}console.log(` Statut utilisateur ${e} mis à jour`)}catch(s){console.error(" Erreur updateUserStatus:",s)}}function ce(){const e=localStorage.getItem("currentUser");return e?JSON.parse(e):null}async function le(){try{console.log(" Initialisation de tous les chats croisés...");const t=await(await fetch(`${y}/users`)).json();console.log(` ${t.length} utilisateurs trouvés`);const n=await(await fetch(`${y}/chats`)).json();let r=0;for(const o of t)for(const a of t)if(o.id!==a.id&&!n.find(l=>l.ownerId===o.id&&l.contactId===a.id)){const l={id:`${o.id}_${a.id}_${Date.now()+Math.random()}`,ownerId:o.id,contactId:a.id,name:a.name,phone:a.phone,avatar:a.avatar,status:"Hors ligne",isOnline:a.isOnline||!1,lastSeen:a.lastSeen||new Date().toISOString(),unread:0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),lastMessage:"",lastMessageTime:new Date().toISOString(),messages:[]};await fetch(`${y}/chats`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(l)}),r++,console.log(` Chat créé: ${o.name} -> ${a.name}`)}return console.log(` Initialisation terminée: ${r} chats créés`),{success:!0,chatsCreated:r}}catch(e){throw console.error("Erreur initialisation chats:",e),e}}let H=null;function ue(){const e=localStorage.getItem("currentUser");if(e)try{const t=JSON.parse(e);return V(t),t}catch(t){console.error("Erreur parsing user:",t),localStorage.removeItem("currentUser")}return null}function g(){return H||ue()}function V(e){H=e,e?(localStorage.setItem("currentUser",JSON.stringify(e)),ie(e.id,"en ligne").catch(console.error)):localStorage.removeItem("currentUser")}function q(){window.refreshInterval&&clearInterval(window.refreshInterval),localStorage.removeItem("currentUser"),window.location.reload()}async function de(e,t){try{if(!e&&!t)return c(" Veuillez remplir tous les champs","error"),null;if(!e)return c(" Le nom est obligatoire","error"),null;if(!t)return c(" Le numéro de téléphone est obligatoire","error"),null;if(e.length<2)return c(" Le nom doit contenir au moins 2 caractères","error"),null;if(e.length>50)return c(" Le nom ne peut pas dépasser 50 caractères","error"),null;if(!/^\d+$/.test(t))return c(" Le numéro ne doit contenir que des chiffres","error"),null;if(t.length!==9)return c(" Le numéro doit contenir exactement 9 chiffres","error"),null;if(!t.startsWith("7"))return c(" Le numéro doit commencer par 7 (format sénégalais)","error"),null;const s=await fetch("https://mon-serveur-cub8.onrender.com/users");if(!s.ok)return c(" Erreur de connexion au serveur","error"),null;const n=await s.json(),r=n.find(o=>o.name.toLowerCase().trim()===e.toLowerCase().trim()&&o.phone.trim()===t.trim());if(r)return V(r),c(` Bienvenue ${r.name} !`,"success"),r;{const o=n.find(i=>i.name.toLowerCase().trim()===e.toLowerCase().trim()),a=n.find(i=>i.phone.trim()===t.trim());return c(o&&!a?" Ce nom existe mais avec un autre numéro de téléphone":!o&&a?"Ce numéro existe mais avec un autre nom":"Aucun compte trouvé avec ces informations","error"),null}}catch(s){return console.error("Erreur de connexion:",s),c(" Erreur de connexion au serveur. Vérifiez votre connexion internet.","error"),null}}function me(e){const t=document.createElement("div");t.className="min-h-screen flex items-center justify-center bg-[#111b21] px-4",t.innerHTML=`
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
  `;const s=t.querySelector("#loginForm"),n=t.querySelector("#nameInput"),r=t.querySelector("#phoneInput"),o=t.querySelector("#loginButton");return r.addEventListener("input",a=>{let i=a.target.value.replace(/[^0-9]/g,"");i.length>9&&(i=i.substring(0,9),c(" Maximum 9 chiffres autorisés","warning")),a.target.value=i}),n.addEventListener("input",a=>{let i=a.target.value;i.length>50&&(i=i.substring(0,50),c(" Maximum 50 caractères autorisés pour le nom","warning"),a.target.value=i)}),s.addEventListener("submit",async a=>{a.preventDefault();const i=n.value.trim(),l=r.value.trim();o.disabled=!0,o.innerHTML=`
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        Connexion en cours...
      </div>
    `;try{const m=await de(i,l);m&&e&&e(m)}finally{o.disabled=!1,o.textContent="Se connecter"}}),t}const O="https://mon-serveur-cub8.onrender.com",R=new Map;let M=null,T=null,A=null;function fe(e,t){console.log("Initialisation synchronisation temps réel..."),T=e,A=t,M&&clearInterval(M),M=setInterval(F,2e3),console.log(" Synchronisation temps réel activée")}async function F(){try{const e=pe();if(!e)return;const t=await fetch(`${O}/chats`);if(!t.ok){console.error(" Erreur API:",t.status);return}const s=await t.json();console.log(` Vérification ${s.length} chats...`);for(const n of s){const r=n.messages||[],o=R.get(n.id)||0;if(r.length>o){const a=r.slice(o);console.log(` ${a.length} nouveaux messages dans chat ${n.id}`);for(const i of a)ge(e.id,n,i)&&(console.log(` Notification pour message de ${i.senderId}`),T&&T(i,n));R.set(n.id,r.length)}}if(A){const n=await fetch(`${O}/users`);if(n.ok){const r=await n.json();for(const o of r)o.id!==e.id&&A(o.id,o.isOnline||!1)}}}catch(e){console.error("Erreur synchronisation temps réel:",e)}}function ge(e,t,s){return t.ownerId===e&&s.senderId!==e||t.contactId===e&&s.senderId!==e}function pe(){const e=localStorage.getItem("currentUser");return e?JSON.parse(e):null}function he(){console.log("⚡ Synchronisation forcée"),F()}const E="https://mon-serveur-cub8.onrender.com";async function z(e,t,s){try{console.log(" Envoi message:",{senderId:e,receiverId:t,message:s});const r=await(await fetch(`${E}/users`)).json(),o=r.find(d=>d.id===e),a=r.find(d=>d.id===t);if(!o||!a)throw console.error("Utilisateur non trouvé:",{sender:o,receiver:a}),new Error("Utilisateur non trouvé");const l=await(await fetch(`${E}/chats`)).json(),m=l.find(d=>d.ownerId===e&&d.contactId===t),v=l.find(d=>d.ownerId===t&&d.contactId===e);if(m&&await P(m.id,s),v){const d={...s,sent:!1};await P(v.id,d)}else await ve(t,e,o,s);return console.log(" Message envoyé avec succès"),!0}catch(n){throw console.error("Erreur envoi message:",n),n}}async function ve(e,t,s,n){try{const r={...n,sent:!1},o={id:`${e}_${t}_${Date.now()}`,ownerId:e,contactId:t,name:s.name,phone:s.phone,avatar:s.avatar,status:s.status,isOnline:s.isOnline,lastSeen:s.lastSeen,unread:1,time:n.time,lastMessage:n.type==="text"?n.text:J(n),lastMessageTime:n.timestamp,messages:[r]};await fetch(`${E}/chats`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)}),console.log(`Chat créé pour le destinataire ${e}`)}catch(r){console.error(" Erreur création chat destinataire:",r)}}async function P(e,t){try{const s=await fetch(`${E}/chats/${e}`);if(!s.ok)throw console.error(`Chat ${e} non trouvé`),new Error(`Chat ${e} non trouvé`);const n=await s.json();if(n.messages=n.messages||[],n.messages.find(a=>a.id===t.id)){console.log(`Message ${t.id} existe déjà dans le chat ${e}`);return}if(n.messages.push(t),n.lastMessage=t.type==="text"?t.text:J(t),n.time=t.time,n.lastMessageTime=t.timestamp,t.sent||(n.unread=(n.unread||0)+1),!(await fetch(`${E}/chats/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)})).ok)throw new Error("Erreur mise à jour chat");console.log(` Message ajouté au chat ${e}`)}catch(s){throw console.error(`Erreur ajout message au chat ${e}:`,s),s}}function J(e){switch(e.type){case"image":return" Photo";case"video":return" Vidéo";case"audio":return" Audio";case"voice":return" Message vocal";case"document":return` ${e.fileName}`;default:return e.text}}const nt=Object.freeze(Object.defineProperty({__proto__:null,handleSendMessage:z},Symbol.toStringTag,{value:"Module"})),I="https://mon-serveur-cub8.onrender.com";function ye(e,t=null){const s=["men","women"],n=t||s[Math.floor(Math.random()*s.length)],r=Math.floor(Math.random()*99)+1;return`https://randomuser.me/api/portraits/${n}/${r}.jpg`}async function xe(e,t,s){try{if(!s||!t)return c(" Veuillez remplir tous les champs","error"),null;if(s.length<2||s.length>50)return c(" Le nom doit contenir entre 2 et 50 caractères","error"),null;if(!/^\d{9}$/.test(t)||!t.startsWith("7"))return c(" Numéro invalide (9 chiffres commençant par 7)","error"),null;const n=await fetch(`${I}/users`);if(!n.ok)return c(" Erreur de connexion au serveur","error"),null;const r=await n.json();let o=r.find(a=>a.phone===t);return!o&&(o={id:(r.length+1).toString(),name:s,phone:t,avatar:ye(s),status:"Hors ligne",isOnline:!1,lastSeen:new Date().toISOString(),bio:"Salut ! J'utilise WhatsApp.",walletBalance:0,totalEarnings:0,contacts:[],groups:[]},!(await fetch(`${I}/users`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)})).ok)?(c(" Erreur lors de la création du contact","error"),null):o.id===e?(c(" Vous ne pouvez pas vous ajouter vous-même","error"),null):(await we(e,o),c(` ${o.name} ajouté à vos contacts`,"success"),o)}catch(n){return console.error("Erreur ajout contact:",n),c(" Erreur de connexion","error"),null}}async function we(e,t){try{if((await(await fetch(`${I}/chats`)).json()).find(a=>a.ownerId===e&&a.contactId===t.id)){console.log("Chat déjà existant pour cet utilisateur");return}const o={id:`${e}_${t.id}_${Date.now()}`,ownerId:e,contactId:t.id,name:t.name,phone:t.phone,avatar:t.avatar,status:t.status,isOnline:t.isOnline,lastSeen:t.lastSeen,unread:0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),lastMessage:"",lastMessageTime:new Date().toISOString(),messages:[]};await fetch(`${I}/chats`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)}),console.log(` Chat personnel créé pour ${e} avec ${t.name}`)}catch(s){console.error("Erreur création chat personnel:",s)}}function _(e){const t=document.createElement("div");t.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",t.innerHTML=`
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
  `;const s=t.querySelector("#closeModal"),n=t.querySelector("#cancelBtn"),r=t.querySelector("#addContactForm"),o=t.querySelector("#contactName"),a=t.querySelector("#contactPhone"),i=()=>{document.body.removeChild(t)};s.addEventListener("click",i),n.addEventListener("click",i),a.addEventListener("input",l=>{let m=l.target.value.replace(/[^0-9]/g,"");m.length>9&&(m=m.substring(0,9),c(" Maximum 9 chiffres autorisés","warning")),l.target.value=m}),o.addEventListener("input",l=>{let m=l.target.value;m.length>50&&(m=m.substring(0,50),c(" Maximum 50 caractères autorisés","warning"),l.target.value=m)}),r.addEventListener("submit",async l=>{l.preventDefault();const m=o.value.trim(),v=a.value.trim(),d=JSON.parse(localStorage.getItem("currentUser"));if(!d){c(" Erreur: utilisateur non connecté","error");return}const w=t.querySelector("#addBtn");w.disabled=!0,w.innerHTML=`
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Ajout...
      </div>
    `;try{const C=await xe(d.id,v,m);C&&e&&e(C),i()}finally{w.disabled=!1,w.textContent="Ajouter"}}),document.body.appendChild(t),o.focus()}const Q="https://mon-serveur-cub8.onrender.com";async function be(){try{const e=await fetch(`${Q}/stories`);if(!e.ok)throw new Error(`Erreur HTTP: ${e.status}`);return await e.json()}catch(e){return console.error("Erreur récupération stories:",e),[]}}function Ee(e){const t=document.createElement("div");t.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",t.innerHTML=`
    <div class="bg-[#222e35] rounded-lg p-6 w-full max-w-md">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-white">Créer une story</h2>
        <button id="closeModal" class="text-gray-400 hover:text-white">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="createStoryForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Contenu de la story (image ou vidéo)
          </label>
          <input 
            type="file" 
            id="storyContent"
            accept="image/*, video/*"
            class="w-full px-4 py-3 bg-[#2a3942] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
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
            id="createBtn"
            class="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Créer
          </button>
        </div>
      </form>
    </div>
  `;const s=t.querySelector("#closeModal"),n=t.querySelector("#cancelBtn"),r=t.querySelector("#createStoryForm"),o=t.querySelector("#storyContent"),a=()=>{document.body.removeChild(t)};s.addEventListener("click",a),n.addEventListener("click",a),r.addEventListener("submit",async i=>{if(i.preventDefault(),!o.files[0]){c("Veuillez sélectionner un fichier","error");return}const m=JSON.parse(localStorage.getItem("currentUser"));if(!m){c("Erreur: utilisateur non connecté","error");return}const v=t.querySelector("#createBtn");v.disabled=!0,v.innerHTML=`
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Création...
      </div>
    `;try{const d={id:Date.now(),userId:m.id,userName:m.name,userAvatar:m.avatar,contentUrl:"https://via.placeholder.com/300",timestamp:new Date().toISOString(),views:[],isMonetized:!1,earnings:0},w=await fetch(`${Q}/stories`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});if(!w.ok)throw new Error(`Erreur HTTP: ${w.status}`);c("Story créée avec succès","success"),e&&e(d),a()}catch(d){console.error("Erreur création story:",d),c("Erreur lors de la création de la story","error")}finally{v.disabled=!1,v.textContent="Créer"}}),document.body.appendChild(t)}function $e(e,t=0){let s=t;const n=document.createElement("div");n.className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4";function r(){const o=e[s];n.innerHTML=`
      <div class="bg-[#222e35] rounded-lg p-6 w-full max-w-md relative">
        <button id="closeModal" class="absolute top-4 right-4 text-gray-400 hover:text-white">
          <i class="fas fa-times text-xl"></i>
        </button>
        
        <img src="${o.contentUrl}" alt="Story" class="w-full rounded-lg object-cover max-h-[70vh]">
        
        <div class="mt-4 flex items-center space-x-3">
          <img src="${o.userAvatar}" alt="${o.userName}" class="w-10 h-10 rounded-full object-cover">
          <div>
            <div class="text-white font-medium">${o.userName}</div>
            <div class="text-gray-400 text-sm">${Ce(o.timestamp)}</div>
          </div>
        </div>
        
        <div class="absolute bottom-4 left-4 right-4 flex justify-between">
          <button id="prevBtn" class="text-gray-400 hover:text-white"><i class="fas fa-chevron-left text-2xl"></i></button>
          <button id="nextBtn" class="text-gray-400 hover:text-white"><i class="fas fa-chevron-right text-2xl"></i></button>
        </div>
      </div>
    `,n.querySelector("#closeModal").addEventListener("click",()=>{document.body.removeChild(n)});const i=n.querySelector("#prevBtn"),l=n.querySelector("#nextBtn");i.addEventListener("click",()=>{s=(s-1+e.length)%e.length,r()}),l.addEventListener("click",()=>{s=(s+1)%e.length,r()})}r(),document.body.appendChild(n)}function Ce(e){const t=new Date(e),n=new Date().getTime()-t.getTime(),r=Math.floor(n/6e4);return r<60?`${r} minutes`:r<1440?`${Math.floor(r/60)} heures`:`${Math.floor(r/1440)} jours`}let b=[],u=null,f=null,h="chats",S=!1,B=!1;window.currentChat=null;window.currentGroup=null;window.showSimpleGroups=null;document.addEventListener("DOMContentLoaded",()=>{console.log(" WhatsApp Web démarré"),Ie(),setTimeout(Ke,1e3)});async function Ie(){const e=document.getElementById("mainContainer"),t=document.getElementById("loginContainer"),s=g();s?(console.log("✅ Utilisateur connecté:",s.name),r()):(console.log("❌ Aucun utilisateur connecté"),n());function n(){e.style.display="none",t.style.display="block",t.innerHTML="";const o=me(a=>{console.log("✅ Connexion réussie pour:",a.name),r()});t.appendChild(o)}function r(){t.style.display="none",e.style.display="flex",Le()}}async function Le(){try{console.log("🔧 Initialisation de l'interface..."),await x(),Me(),qe(),te(),fe((e,t)=>{console.log("📨 Nouveau message reçu:",e),Je(e,t)},(e,t)=>{console.log(`👤 Statut utilisateur ${e}:`,t?"en ligne":"hors ligne"),Qe(e,t)}),ze(),await ne(),console.log("✅ Interface principale initialisée")}catch(e){console.error(" Erreur initialisation:",e),c("Erreur de chargement","error")}}async function x(){try{if(console.log("📂 Chargement des chats..."),b=await oe(),console.log(`📊 ${b.length} chats chargés`),h==="chats"&&j(),u){const e=await N(u.id);Z(e)}}catch(e){console.error("❌ Erreur chargement chats:",e),c("Impossible de charger les conversations","error")}}function Me(){console.log("🔧 Configuration des événements...");const e=document.getElementById("userAvatarButton");e&&e.addEventListener("click",He);const t=document.getElementById("backToChats");t&&t.addEventListener("click",ee);const s=document.getElementById("logoutButton");s&&s.addEventListener("click",q);const n=document.getElementById("backButton");n&&n.addEventListener("click",Ne),De(),Ae(),Be(),Te(),Se(),window.addEventListener("resize",Fe)}function Se(){const e=document.getElementById("newChatBtn");e&&e.addEventListener("click",()=>{if(!g()){c("❌ Erreur: utilisateur non connecté","error");return}_(async s=>{console.log("✅ Contact ajouté:",s.name),await x(),c(`${s.name} ajouté avec succès`,"success")})})}function Be(){const e=document.getElementById("searchInput");e&&e.addEventListener("input",t=>{const s=t.target.value.toLowerCase().trim();Ge(s)})}function Te(){const e=document.querySelectorAll(".filter-tab");e.forEach(t=>{t.addEventListener("click",()=>{e.forEach(r=>{r.classList.remove("active","bg-green-600","text-white"),r.classList.add("text-gray-400")}),t.classList.add("active","bg-green-600","text-white"),t.classList.remove("text-gray-400");const s=t.dataset.filter,n=t.textContent.trim().toLowerCase();n.includes("groupe")||n.includes("group")?(console.log("📱 Clic sur onglet Groupes"),h="groups",$()):(console.log("💬 Retour aux chats normaux"),h="chats",f=null,window.currentGroup=null,s==="all"||!s?j():Ue(s))})})}function Ae(){const e=document.querySelectorAll(".nav-item");e.forEach(t=>{t.addEventListener("click",async s=>{s.preventDefault(),s.stopPropagation();const n=t.dataset.view;if(console.log("🧭 Navigation vers:",n),!(S||h===n)){S=!0;try{switch(h=n,e.forEach(r=>r.classList.remove("active")),t.classList.add("active"),n){case"chats":await D();break;case"status":await _e();break;case"communities":c("📱 Groupes - Fonctionnalité en développement","info");break;case"settings":je();break}console.log("✅ Navigation terminée vers:",n)}catch(r){console.error("❌ Erreur navigation:",r),h="chats",await D()}finally{setTimeout(()=>{S=!1},500)}}})})}async function D(){console.log("💬 Affichage vue chats");const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel");t.style.display="none",e.style.display="flex",f=null,window.currentGroup=null,await x()}async function _e(){console.log("📸 Affichage vue stories");const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel");t.style.display="none",e.style.display="flex",await W()}function je(){console.log("⚙️ Affichage vue paramètres");const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel");t.style.display="none",e.style.display="flex",ke()}async function W(){const e=document.getElementById("chatList"),t=g();if(!(!e||!t))try{const s=await be();e.innerHTML=`
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
          ${s.length===0?`
            <div class="text-center py-8 text-gray-400">
              <i class="fas fa-circle text-4xl mb-4 opacity-30"></i>
              <p>Aucune story disponible</p>
              <p class="text-sm">Soyez le premier à partager !</p>
            </div>
          `:s.map(r=>`
            <div class="story-item p-3 hover:bg-[#202c33] rounded-lg cursor-pointer transition-colors" data-story-id="${r.id}">
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <img src="${r.userAvatar}" alt="${r.userName}" class="w-12 h-12 rounded-full object-cover">
                </div>
                <div class="flex-1">
                  <div class="text-white font-medium">${r.userName}</div>
                  <div class="text-gray-400 text-sm">${We(r.timestamp)}</div>
                </div>
                <div class="text-right">
                  <div class="text-gray-400 text-xs">${r.views.length} vues</div>
                  ${r.isMonetized?`<div class="text-green-400 text-xs">💰 ${r.earnings} FCFA</div>`:""}
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;const n=document.getElementById("createStoryBtn");n&&n.addEventListener("click",()=>{Ee(async r=>{h==="status"&&await W()})}),document.querySelectorAll(".story-item").forEach(r=>{r.addEventListener("click",()=>{const o=r.dataset.storyId,a=s.findIndex(i=>i.id===o);a!==-1&&$e(s,a)})})}catch(s){console.error("❌ Erreur chargement stories:",s),e.innerHTML=`
      <div class="text-center py-8 text-red-400">
        <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
        <p>Erreur de chargement</p>
      </div>
    `}}function ke(){const e=document.getElementById("chatList"),t=g();if(!e||!t)return;e.innerHTML=`
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
  `;const s=document.getElementById("addContactBtn");s&&s.addEventListener("click",()=>{_(async a=>{await x(),c(`${a.name} ajouté avec succès`,"success")})});const n=document.getElementById("initChatsBtn");n&&n.addEventListener("click",async()=>{try{c(" Initialisation de tous les chats...","info");const a=await le();c(`${a.chatsCreated} chats créés !`,"success"),await x()}catch(a){console.error("❌ Erreur initialisation:",a),c(" Erreur lors de l'initialisation","error")}});const r=document.getElementById("refreshBtn");r&&r.addEventListener("click",async()=>{c("Actualisation...","info"),await x(),he(),c(" Actualisé !","success")});const o=document.getElementById("logoutBtn");o&&o.addEventListener("click",q)}function Ge(e){document.querySelectorAll(".chat-item").forEach(s=>{var o,a;const n=((o=s.querySelector(".chat-name"))==null?void 0:o.textContent.toLowerCase())||"",r=((a=s.querySelector(".chat-message"))==null?void 0:a.textContent.toLowerCase())||"";n.includes(e)||r.includes(e)?s.style.display="block":s.style.display="none"})}function Ue(e){let t=[...b];switch(e){case"unread":t=t.filter(s=>s.unread>0);break;case"favorites":t=t.filter(s=>s.isFavorite);break;case"groups":t=t.filter(s=>s.isGroup);break}Oe(t)}function Oe(e){const t=document.getElementById("chatList");t&&(t.innerHTML="",e.forEach(s=>{const n=K(s);t.appendChild(n)}))}function j(){const e=document.getElementById("chatList");if(!e)return;const t=g();if(!t)return;if(console.log(`📊 Rendu de ${b.length} chats pour ${t.name}`),e.innerHTML="",b.length===0){e.innerHTML=`
      <div class="text-center py-8 text-gray-400">
        <i class="fas fa-comments text-4xl mb-4 opacity-30"></i>
        <p class="mb-2">Aucune conversation</p>
        <p class="text-sm">Ajoutez un contact pour commencer !</p>
        <button id="addFirstContact" class="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
          <i class="fas fa-user-plus mr-2"></i>
          Ajouter un contact
        </button>
      </div>
    `;const n=document.getElementById("addFirstContact");n&&n.addEventListener("click",()=>{_(async r=>{await x(),c(`${r.name} ajouté avec succès`,"success")})});return}[...b].sort((n,r)=>{const o=new Date(n.lastMessageTime||n.time);return new Date(r.lastMessageTime||r.time)-o}).forEach(n=>{const r=K(n);e.appendChild(r)})}function K(e){const t=document.createElement("div");t.className="chat-item px-4 py-3 cursor-pointer hover:bg-[#202c33] transition-colors border-b border-gray-700",t.dataset.chatId=e.id;const s=e.unread>0,n=e.isOnline;return t.innerHTML=`
    <div class="flex items-center space-x-3">
      <div class="relative">
        <img src="${e.avatar}" alt="${e.name}" class="w-12 h-12 rounded-full object-cover">
        ${n?'<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#222e35]"></div>':""}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start">
          <h3 class="chat-name font-medium text-white truncate ${s?"font-semibold":""}">${e.name}</h3>
          <div class="flex flex-col items-end space-y-1">
            <span class="text-xs ${s?"text-green-400":"text-gray-400"}">${e.time}</span>
            ${s?`<span class="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">${e.unread}</span>`:""}
          </div>
        </div>
        <div class="mt-1">
          <p class="chat-message text-sm ${s?"text-white font-medium":"text-gray-400"} truncate">${e.lastMessage||"Aucun message"}</p>
        </div>
      </div>
    </div>
  `,t.addEventListener("click",()=>{console.log("🔘 Clic sur chat:",e.name,"ID:",e.id),f=null,window.currentGroup=null,Re(e.id)}),t}async function Re(e){var t;try{if(console.log("💬 === OUVERTURE CHAT PERSONNEL ==="),console.log("Chat ID:",e),ee(),f=null,window.currentGroup=null,u=b.find(s=>s.id===e),window.currentChat=u,!u){console.error("❌ Chat non trouvé:",e),c("Chat non trouvé","error");return}console.log("✅ Chat personnel ouvert:",u.name),console.log("Contact ID:",u.contactId),u.unread>0&&(u.unread=0,await ae(u.id,{unread:0})),document.querySelectorAll(".chat-item").forEach(s=>{s.classList.remove("bg-[#202c33]")}),(t=document.querySelector(`[data-chat-id="${e}"]`))==null||t.classList.add("bg-[#202c33]"),L()&&(document.getElementById("sidebar").style.display="none"),document.getElementById("chatArea").style.display="flex",X(),await Z(),Y(),h==="chats"&&j()}catch(s){console.error("❌ Erreur ouverture chat:",s),c("Erreur lors de l'ouverture du chat","error")}}function X(){const e=document.getElementById("chatHeader"),t=document.getElementById("chatAvatar"),s=document.getElementById("chatName"),n=document.getElementById("chatStatus");if(e&&(u||f)){if(e.style.display="flex",f){console.log("📱 Affichage header GROUPE:",f.name),t.innerHTML=`
        <div class="relative">
          <img src="${f.avatar||"https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop"}" 
               alt="${f.name}" class="w-10 h-10 rounded-full object-cover">
          <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-600 rounded-full flex items-center justify-center">
            <i class="fas fa-users text-xs text-white"></i>
          </div>
        </div>
      `,s.textContent=f.name,Ye(f,n);const r=document.getElementById("callButtons");r&&(r.innerHTML=`
          <button onclick="openGroupInfos()" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors">
             Infos
          </button>
        `)}else if(u){console.log("💬 Affichage header CHAT PERSONNEL:",u.name),t.innerHTML=`<img src="${u.avatar}" alt="${u.name}" class="w-10 h-10 rounded-full object-cover">`,s.textContent=u.name,n.textContent=u.isOnline?"en ligne":u.status;const r=document.getElementById("callButtons");if(r){r.innerHTML=`
          <button id="audioCallBtn" class="p-2 text-gray-400 hover:text-white transition-colors">
            <i class="fas fa-phone text-lg"></i>
          </button>
          <button id="videoCallBtn" class="p-2 text-gray-400 hover:text-white transition-colors">
            <i class="fas fa-video text-lg"></i>
          </button>
        `;const o=document.getElementById("audioCallBtn"),a=document.getElementById("videoCallBtn");o&&o.addEventListener("click",async()=>{const{initializeAudioCall:i}=await p(async()=>{const{initializeAudioCall:l}=await import("./calls-m9Rf1S7x.js");return{initializeAudioCall:l}},[]);i(u)}),a&&a.addEventListener("click",async()=>{const{startVideoCall:i}=await p(async()=>{const{startVideoCall:l}=await import("./calls-m9Rf1S7x.js");return{startVideoCall:l}},[]);i(u)})}}}}async function Z(){const e=document.getElementById("messagesArea");if(!(!e||!u))try{console.log("📨 Rendu des messages pour:",u.name);const t=await N(u.id);if(u.messages=t,e.innerHTML="",t.length===0){e.innerHTML=`
        <div class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <i class="fas fa-comments text-4xl mb-4 opacity-30"></i>
            <p>Aucun message</p>
            <p class="text-sm">Envoyez votre premier message !</p>
          </div>
        </div>
      `;return}t.forEach(s=>{const n=k(s);e.appendChild(n)}),e.scrollTop=e.scrollHeight,console.log(`✅ ${t.length} messages affichés`)}catch(t){console.error(" Erreur lors du rendu des messages:",t),c("Erreur lors du chargement des messages","error")}}function k(e){const t=g(),s=e.senderId===t.id,n=document.createElement("div");n.className=`flex mb-4 ${s?"justify-end":"justify-start"}`,n.dataset.messageId=e.id;let r="";switch(e.type){case"voice":r=`
        <div class="flex items-center space-x-3">
          ${s?"":`
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
      `;break;case"text":default:r=`<p class="text-sm">${e.text}</p>`;break}if(n.innerHTML=`
    <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${s?"bg-[#005c4b] text-white":"bg-[#202c33] text-white"} shadow-md">
      ${r}
      <div class="flex justify-end items-center mt-1 space-x-1">
        <span class="text-xs text-gray-300">${e.time}</span>
        ${s?`<i class="fas fa-check-double text-xs ${e.status==="read"?"text-blue-400":"text-gray-400"}"></i>`:""}
      </div>
    </div>
  `,e.type==="voice"){const o=n.querySelector(".voice-play-btn");o&&o.addEventListener("click",()=>Pe(o))}return n}function Pe(e){e.dataset.messageId;const t=e.dataset.audioData;if(!t){c("Données audio manquantes","error");return}try{const s=new Audio(t),n=e.querySelector("i"),r=e.closest(".max-w-xs, .max-w-md").querySelector(".voice-duration");let o=!1;s.addEventListener("timeupdate",()=>{if(r&&s.duration){const a=Math.ceil(s.duration-s.currentTime);r.textContent=`${a}s`}}),s.addEventListener("ended",()=>{n.className="fas fa-play text-sm",r&&s.duration&&(r.textContent=`${Math.ceil(s.duration)}s`),o=!1}),s.addEventListener("error",a=>{console.error("Erreur lecture audio:",a),c("Erreur lecture audio","error"),n.className="fas fa-play text-sm",o=!1}),o?(s.pause(),n.className="fas fa-play text-sm",o=!1):s.play().then(()=>{n.className="fas fa-pause text-sm",o=!0}).catch(a=>{console.error("Erreur démarrage audio:",a),c("Impossible de lire l'audio","error")})}catch(s){console.error("Erreur création audio:",s),c("Erreur lecture message vocal","error")}}function Y(){const e=document.getElementById("messageInput");e&&(e.style.display="flex")}function De(){const e=document.getElementById("messageText"),t=document.getElementById("sendButton"),s=document.getElementById("voiceBtn");if(!e||!t)return;if(s){let r=!1;s.addEventListener("click",async()=>{if(r){const{stopVoiceRecording:o}=await p(async()=>{const{stopVoiceRecording:a}=await import("./audio-recorder-CKCvPvqR.js");return{stopVoiceRecording:a}},[]);o(),r=!1}else{const{startVoiceRecording:o}=await p(async()=>{const{startVoiceRecording:i}=await import("./audio-recorder-CKCvPvqR.js");return{startVoiceRecording:i}},[]);await o()&&(r=!0)}})}async function n(){if(B){console.log("⏳ Envoi déjà en cours, ignoré");return}const r=e.value.trim();if(r&&!(!u&&!f))try{B=!0;const o=g();if(!o)return;console.log("📤 Envoi message:",r);const a={id:Date.now(),senderId:o.id,receiverId:f?f.id:u.contactId,text:r,sent:!0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),timestamp:new Date().toISOString(),type:"text",status:"sent"};e.value="";const i=k(a),l=document.getElementById("messagesArea");l&&(l.appendChild(i),l.scrollTop=l.scrollHeight),f?await st(o.id,f.id,a):await z(o.id,u.contactId,a),h==="chats"&&await x(),console.log("✅ Message envoyé avec succès")}catch(o){console.error("❌ Erreur envoi message:",o),c("Erreur lors de l'envoi","error")}finally{B=!1}}t.addEventListener("click",n),e.addEventListener("keypress",r=>{r.key==="Enter"&&!r.shiftKey&&(r.preventDefault(),n())})}function Ne(){L()&&(document.getElementById("sidebar").style.display="flex",document.getElementById("chatArea").style.display="none"),u=null,f=null,window.currentChat=null,window.currentGroup=null,document.getElementById("chatHeader").style.display="none",document.getElementById("messageInput").style.display="none",te()}function He(){const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel"),s=document.getElementById("chatArea");e.style.display="none",s.style.display="none",t.style.display="flex",Ve()}function ee(){const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel"),s=document.getElementById("chatArea");t.style.display="none",e.style.display="flex",(u||f)&&(s.style.display="flex")}function Ve(){const e=g();if(e){const t=document.getElementById("profileImage"),s=document.getElementById("profileName");t&&(t.src=e.avatar,t.alt=e.name),s&&(s.textContent=e.name)}}function qe(){const e=g(),t=document.querySelectorAll(".user-avatar img");e&&t.length>0&&t.forEach(s=>{s.src=e.avatar,s.alt=e.name})}function te(){const e=document.getElementById("messagesArea");e&&(e.innerHTML=`
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
    `)}function Fe(){!L()&&(u||f)&&(document.getElementById("sidebar").style.display="flex",document.getElementById("chatArea").style.display="flex")}function L(){return window.innerWidth<768}function ze(){setInterval(async()=>{h==="chats"&&await x()},1e4)}function Je(e,t){const s=g();if(s){if(u&&u.id===t.id){const n=k(e),r=document.getElementById("messagesArea");r&&(r.appendChild(n),r.scrollTop=r.scrollHeight)}h==="chats"&&x(),e.senderId!==s.id&&c(` Nouveau message de ${t.name}`,"info")}}function Qe(e,t){if(document.querySelectorAll(".chat-item").forEach(n=>{const r=b.find(o=>o.id===n.dataset.chatId);if(r&&r.contactId===e){const o=n.querySelector(".online-indicator");if(t&&!o){const a=n.querySelector(".relative");a.innerHTML+='<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#222e35]"></div>'}else!t&&o&&o.remove()}}),u&&u.contactId===e){const n=document.getElementById("chatStatus");n&&(n.textContent=t?"en ligne":"hors ligne")}}function We(e){const t=new Date(e),n=new Date().getTime()-t.getTime(),r=Math.floor(n/6e4);return r<60?`${r} minutes`:r<1440?`${Math.floor(r/60)} heures`:`${Math.floor(r/1440)} jours`}function Ke(){console.log("🚀 Initialisation simple des groupes..."),setTimeout(()=>{document.querySelectorAll(".filter-tab").forEach((t,s)=>{const n=t.textContent.trim().toLowerCase();if(n.includes("groupe")||n.includes("group")||s===3){console.log("📱 Onglet Groupes trouvé:",n);const r=t.cloneNode(!0);t.parentNode.replaceChild(r,t),r.addEventListener("click",$)}})},1e3)}async function $(){console.log("📱 Affichage des groupes avec boutons d'action...");const e=document.getElementById("chatList");if(e){h="groups";try{const t=g();if(!t){c("Vous devez être connecté","error");return}const{getUserGroups:s}=await p(async()=>{const{getUserGroups:o}=await import("./groups-CxY0TTta.js");return{getUserGroups:o}},[]),n=await s(t.id);e.innerHTML=`
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
          ${n.length===0?`
            <div class="text-center py-8 text-gray-400">
              <div class="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                <i class="fas fa-users text-2xl text-gray-400"></i>
              </div>
              <h3 class="text-lg font-medium text-white mb-2">Aucun groupe</h3>
              <p class="text-gray-400 text-sm max-w-xs mx-auto">
                Vous n'avez pas encore de groupes. Créez-en un pour commencer !
              </p>
            </div>
          `:n.map(o=>`
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
                    <span class="text-xs text-gray-400">${rt(o.lastMessageTime)}</span>
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
                   Ouvrir
                </button>
                
                <button onclick="showGroupInfoQuick('${o.id}')" 
                        class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors">
                   Infos
                </button>
                
                ${o.admins&&o.admins.includes(t.id)?`
                  <button onclick="showAddMemberQuick('${o.id}')" 
                          class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors">
                     Membre
                  </button>
                  
                  <button onclick="showManageMembersQuick('${o.id}')" 
                          class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition-colors">
                     Gérer
                  </button>
                `:""}
                
                <button onclick="leaveGroupQuick('${o.id}')" 
                        class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors">
                   Quitter
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;const r=document.getElementById("createGroupBtn");r&&r.addEventListener("click",async()=>{try{const{createGroupModal:o}=await p(async()=>{const{createGroupModal:a}=await import("./groups-CxY0TTta.js");return{createGroupModal:a}},[]);o(a=>{a&&(c(`Groupe "${a.name}" créé avec succès`,"success"),$())})}catch(o){console.error("Erreur chargement module groupes:",o),c("Erreur lors du chargement du module groupes","error")}}),console.log(`✅ ${n.length} groupe(s) affiché(s) avec boutons d'action`)}catch(t){console.error(" Erreur affichage groupes:",t),e.innerHTML=`
      <div class="text-center py-8 text-red-400">
        <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
        <p>Erreur de chargement des groupes</p>
        <button onclick="showSimpleGroups()" class="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
          Réessayer
        </button>
      </div>
    `}}}window.openGroupChat=async e=>{try{console.log("💬 Ouverture groupe depuis bouton:",e);const{getUserGroups:t}=await p(async()=>{const{getUserGroups:o}=await import("./groups-CxY0TTta.js");return{getUserGroups:o}},[]),s=g(),r=(await t(s.id)).find(o=>o.id===e);r?await Ze(r):c("Groupe non trouvé","error")}catch(t){console.error("Erreur ouverture groupe:",t),c("Erreur lors de l'ouverture du groupe","error")}};window.showGroupInfoQuick=async e=>{try{console.log("📋 Infos groupe depuis bouton:",e);const{getUserGroups:t,showGroupInfo:s}=await p(async()=>{const{getUserGroups:a,showGroupInfo:i}=await import("./groups-CxY0TTta.js");return{getUserGroups:a,showGroupInfo:i}},[]),n=g(),o=(await t(n.id)).find(a=>a.id===e);o?s(o):c("Groupe non trouvé","error")}catch(t){console.error("Erreur infos groupe:",t),c("Erreur lors de l'affichage des infos","error")}};window.showAddMemberQuick=async e=>{try{console.log("➕ Ajout membre depuis bouton:",e);const{getUserGroups:t,showAddMemberModal:s}=await p(async()=>{const{getUserGroups:a,showAddMemberModal:i}=await import("./groups-CxY0TTta.js");return{getUserGroups:a,showAddMemberModal:i}},[]),n=g(),o=(await t(n.id)).find(a=>a.id===e);o?s(o):c("Groupe non trouvé","error")}catch(t){console.error("Erreur ajout membre:",t),c("Erreur lors de l'ajout de membre","error")}};window.showManageMembersQuick=async e=>{try{console.log("👥 Gestion membres depuis bouton:",e);const{getUserGroups:t}=await p(async()=>{const{getUserGroups:o}=await import("./groups-CxY0TTta.js");return{getUserGroups:o}},[]),s=g(),r=(await t(s.id)).find(o=>o.id===e);r?Xe(r):c("Groupe non trouvé","error")}catch(t){console.error("Erreur gestion membres:",t),c("Erreur lors de la gestion des membres","error")}};window.leaveGroupQuick=async e=>{try{console.log("🚪 Quitter groupe depuis bouton:",e);const{getUserGroups:t,leaveGroup:s}=await p(async()=>{const{getUserGroups:a,leaveGroup:i}=await import("./groups-CxY0TTta.js");return{getUserGroups:a,leaveGroup:i}},[]),n=g(),o=(await t(n.id)).find(a=>a.id===e);o?confirm(`Êtes-vous sûr de vouloir quitter le groupe "${o.name}" ?`)&&await s(o.id,n.id)&&(c(`Vous avez quitté le groupe "${o.name}"`,"success"),$()):c("Groupe non trouvé","error")}catch(t){console.error("Erreur quitter groupe:",t),c("Erreur lors de la sortie du groupe","error")}};function Xe(e){const t=document.createElement("div");t.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",t.innerHTML=`
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
  `,document.body.appendChild(t),G(e);const s=t.querySelector("#closeModal"),n=t.querySelector("#closeBtn"),r=()=>document.body.removeChild(t);s.addEventListener("click",r),n.addEventListener("click",r)}async function G(e){try{const t=g(),{getGroupMembers:s}=await p(async()=>{const{getGroupMembers:o}=await import("./groups-CxY0TTta.js");return{getGroupMembers:o}},[]),n=await s(e.id),r=document.getElementById("membersList");if(!r)return;r.innerHTML=n.map(o=>{const a=e.admins&&e.admins.includes(o.id),i=o.id===e.createdBy,l=o.id===t.id;return`
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
      `}).join("")}catch(t){console.error("Erreur chargement membres:",t);const s=document.getElementById("membersList");s&&(s.innerHTML='<div class="text-red-400 text-sm p-3">Erreur de chargement</div>')}}window.promoteToAdminQuick=async(e,t)=>{try{const{promoteToAdmin:s}=await p(async()=>{const{promoteToAdmin:o}=await import("./groups-CxY0TTta.js");return{promoteToAdmin:o}},[]),n=g();if(await s(e,t,n.id)){const{getUserGroups:o}=await p(async()=>{const{getUserGroups:l}=await import("./groups-CxY0TTta.js");return{getUserGroups:l}},[]),i=(await o(n.id)).find(l=>l.id===e);i&&G(i)}}catch(s){console.error("Erreur promotion admin:",s),c("Erreur lors de la promotion","error")}};window.removeMemberQuick=async(e,t)=>{try{const{removeMemberFromGroup:s}=await p(async()=>{const{removeMemberFromGroup:r}=await import("./groups-CxY0TTta.js");return{removeMemberFromGroup:r}},[]),n=g();if(confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")&&await s(e,t,n.id)){const{getUserGroups:o}=await p(async()=>{const{getUserGroups:l}=await import("./groups-CxY0TTta.js");return{getUserGroups:l}},[]),i=(await o(n.id)).find(l=>l.id===e);i&&G(i)}}catch(s){console.error("Erreur suppression membre:",s),c("Erreur lors de la suppression","error")}};async function Ze(e){try{console.log("💬 === OUVERTURE CHAT GROUPE DIRECT ==="),console.log("Groupe:",e.name,"ID:",e.id),u=null,window.currentChat=null,f=e,window.currentGroup=e,L()&&(document.getElementById("sidebar").style.display="none"),document.getElementById("chatArea").style.display="flex",X(),await et(e),Y(),c(`Groupe "${e.name}" ouvert`,"success")}catch(t){console.error("❌ Erreur ouverture groupe:",t),c("Erreur lors de l'ouverture du groupe","error")}}async function Ye(e,t){try{const s=g(),{getGroupMembers:n}=await p(async()=>{const{getGroupMembers:l}=await import("./groups-CxY0TTta.js");return{getGroupMembers:l}},[]),r=await n(e.id);if(r.length===0){t.textContent="Aucun membre";return}const o=r.find(l=>l.id===s.id),a=r.filter(l=>l.id!==s.id);let i="";o?(i="Vous",a.length>0&&(a.length===1?i+=`, ${a[0].name}`:a.length===2?i+=`, ${a[0].name}, ${a[1].name}`:i+=`, ${a[0].name} et ${a.length-1} autre${a.length-1>1?"s":""}`)):r.length===1?i=r[0].name:r.length===2?i=`${r[0].name}, ${r[1].name}`:i=`${r[0].name} et ${r.length-1} autres`,t.textContent=i,console.log("✅ Membres affichés:",i)}catch(s){console.error("Erreur affichage membres:",s),t.textContent=`${e.members?e.members.length:0} membres`}}async function et(e){const t=document.getElementById("messagesArea");if(!(!t||!e))try{console.log("📱 Rendu des messages du groupe:",e.name);const{getGroupMessages:s}=await p(async()=>{const{getGroupMessages:r}=await import("./groups-CxY0TTta.js");return{getGroupMessages:r}},[]),n=await s(e.id);if(t.innerHTML="",n.length===0){t.innerHTML=`
        <div class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <i class="fas fa-users text-4xl mb-4 opacity-30"></i>
            <p>Aucun message dans ce groupe</p>
            <p class="text-sm">Soyez le premier à écrire !</p>
          </div>
        </div>
      `;return}n.forEach(r=>{const o=tt(r,e);t.appendChild(o)}),t.scrollTop=t.scrollHeight,console.log(`✅ ${n.length} messages de groupe affichés`)}catch(s){console.error("❌ Erreur rendu messages groupe:",s),t.innerHTML=`
      <div class="flex items-center justify-center h-full text-red-500">
        <div class="text-center">
          <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <p>Erreur de chargement des messages</p>
        </div>
      </div>
    `}}function tt(e,t){const s=g(),n=e.senderId===s.id,r=document.createElement("div");r.className=`flex mb-4 ${n?"justify-end":"justify-start"}`,r.dataset.messageId=e.id;let o="";!n&&e.senderName&&(o=`<div class="text-xs text-gray-400 mb-1">${e.senderName}</div>`);let a="";switch(e.type){case"text":default:a=`<p class="text-sm">${e.text}</p>`;break}return r.innerHTML=`
    <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${n?"bg-[#005c4b] text-white":"bg-[#202c33] text-white"} shadow-md">
      ${o}
      ${a}
      <div class="flex justify-end items-center mt-1 space-x-1">
        <span class="text-xs text-gray-300">${e.time}</span>
        ${n?`<i class="fas fa-check-double text-xs ${e.status==="read"?"text-blue-400":"text-gray-400"}"></i>`:""}
      </div>
    </div>
  `,r}async function st(e,t,s){try{console.log(" === ENVOI MESSAGE GROUPE ==="),console.log("Expéditeur:",e),console.log("Groupe:",t),console.log("Message:",s.text);const{sendMessageToGroup:n}=await p(async()=>{const{sendMessageToGroup:o}=await import("./groups-CxY0TTta.js");return{sendMessageToGroup:o}},[]),r=await n(e,t,s);return console.log("✅ Message de groupe envoyé:",r),r}catch(n){throw console.error("❌ Erreur envoi message groupe:",n),n}}function rt(e){if(!e)return"";const t=new Date(e),n=new Date-t;return n<24*60*60*1e3?t.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}):n<7*24*60*60*1e3?t.toLocaleDateString("fr-FR",{weekday:"short"}):t.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"})}window.openGroupInfos=async()=>{console.log("🔘 Ouverture infos groupe");try{if(!f){c("Aucun groupe sélectionné","error");return}const{showGroupInfo:e}=await p(async()=>{const{showGroupInfo:t}=await import("./groups-CxY0TTta.js");return{showGroupInfo:t}},[]);e(f)}catch(e){console.error("❌ Erreur ouverture infos:",e),c("Erreur lors de l'ouverture des infos","error")}};window.showSimpleGroups=$;export{p as _,nt as c,c as s};
