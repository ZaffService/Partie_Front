(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function n(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(r){if(r.ep)return;r.ep=!0;const o=n(r);fetch(r.href,o)}})();function i(e,t="info"){document.querySelectorAll(".toast").forEach(o=>o.remove());const s=document.createElement("div"),r={success:"#25D366",error:"#ef4444",info:"#8696a0",warning:"#f59e0b"};s.className="toast fixed right-4 top-4 p-4 rounded-lg text-white shadow-lg transform translate-x-full transition-all duration-300 z-50",s.style.backgroundColor=r[t],s.innerHTML=`
    <div class="flex items-center">
      <i class="fas ${t==="success"?"fa-check-circle":t==="error"?"fa-exclamation-circle":t==="warning"?"fa-exclamation-triangle":"fa-info-circle"} mr-2"></i>
      <span>${e}</span>
    </div>
  `,document.body.appendChild(s),setTimeout(()=>{s.style.transform="translateX(0)"},100),setTimeout(()=>{s.style.transform="translateX(100%)",setTimeout(()=>s.remove(),300)},3e3)}async function le(){try{return await Notification.requestPermission()==="granted"}catch(e){return console.error("Erreur permissions notifications:",e),!1}}const w="https://mon-serveur-cub8.onrender.com";async function ue(){try{const e=me();if(!e)return console.error("❌ Aucun utilisateur connecté"),[];console.log(`🔍 Récupération chats pour ${e.name} (ID: ${e.id})`);const t=await fetch(`${w}/chats`);if(!t.ok)throw new Error("Erreur réseau");const n=await t.json();console.log("📋 Total chats dans la base:",n.length);const s=n.filter(r=>r.ownerId===e.id);return console.log(`✅ Chats de ${e.name}:`,s.length),s}catch(e){return console.error("❌ Erreur getChats:",e),[]}}async function K(e){try{console.log("📨 Récupération messages pour chat:",e);const t=await fetch(`${w}/chats/${e}`);if(!t.ok)throw new Error("Erreur réseau");return(await t.json()).messages||[]}catch(t){return console.error("❌ Erreur getMessages:",t),[]}}async function de(e,t){try{console.log(`🔄 Mise à jour chat ${e}:`,t);const n=await fetch(`${w}/chats/${e}`);if(!n.ok)return console.warn(`⚠️ Chat ${e} non trouvé pour mise à jour`),null;const s=await n.json();Object.assign(s,t);const r=await fetch(`${w}/chats/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(!r.ok)throw new Error("Erreur mise à jour");return console.log(`✅ Chat ${e} mis à jour`),await r.json()}catch(n){return console.error("❌ Erreur updateChat:",n),null}}async function fe(e,t){try{console.log(`🔄 Mise à jour statut utilisateur ${e}:`,t?"en ligne":"hors ligne");const n=await fetch(`${w}/users/${e}`);if(n.ok){const r=await n.json();r.isOnline=t,r.lastSeen=new Date().toISOString(),await fetch(`${w}/users/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)})}const s=await fetch(`${w}/chats`);if(s.ok){const o=(await s.json()).filter(a=>a.contactId===e);for(const a of o)a.isOnline=t,a.lastSeen=new Date().toISOString(),a.status=t?"en ligne":"hors ligne",await fetch(`${w}/chats/${a.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)})}console.log(`✅ Statut utilisateur ${e} mis à jour`)}catch(n){console.error("❌ Erreur updateUserStatus:",n)}}function me(){const e=localStorage.getItem("currentUser");return e?JSON.parse(e):null}async function ge(){try{console.log("🚀 Initialisation de tous les chats croisés...");const t=await(await fetch(`${w}/users`)).json();console.log(`👥 ${t.length} utilisateurs trouvés`);const s=await(await fetch(`${w}/chats`)).json();let r=0;for(const o of t)for(const a of t)if(o.id!==a.id&&!s.find(l=>l.ownerId===o.id&&l.contactId===a.id)){const l={id:`${o.id}_${a.id}_${Date.now()+Math.random()}`,ownerId:o.id,contactId:a.id,name:a.name,phone:a.phone,avatar:a.avatar,status:"Hors ligne",isOnline:a.isOnline||!1,lastSeen:a.lastSeen||new Date().toISOString(),unread:0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),lastMessage:"",lastMessageTime:new Date().toISOString(),messages:[]};await fetch(`${w}/chats`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(l)}),r++,console.log(`✅ Chat créé: ${o.name} -> ${a.name}`)}return console.log(`🎉 Initialisation terminée: ${r} chats créés`),{success:!0,chatsCreated:r}}catch(e){throw console.error("❌ Erreur initialisation chats:",e),e}}let X=null;function he(){const e=localStorage.getItem("currentUser");if(e)try{const t=JSON.parse(e);return Y(t),t}catch(t){console.error("Erreur parsing user:",t),localStorage.removeItem("currentUser")}return null}function $(){return X||he()}function Y(e){X=e,e?(localStorage.setItem("currentUser",JSON.stringify(e)),fe(e.id,"en ligne").catch(console.error)):localStorage.removeItem("currentUser")}function Q(){window.refreshInterval&&clearInterval(window.refreshInterval),localStorage.removeItem("currentUser"),window.location.reload()}async function pe(e,t){try{if(!e&&!t)return i(" Veuillez remplir tous les champs","error"),null;if(!e)return i(" Le nom est obligatoire","error"),null;if(!t)return i(" Le numéro de téléphone est obligatoire","error"),null;if(e.length<2)return i(" Le nom doit contenir au moins 2 caractères","error"),null;if(e.length>50)return i(" Le nom ne peut pas dépasser 50 caractères","error"),null;if(!/^\d+$/.test(t))return i(" Le numéro ne doit contenir que des chiffres","error"),null;if(t.length!==9)return i(" Le numéro doit contenir exactement 9 chiffres","error"),null;if(!t.startsWith("7"))return i(" Le numéro doit commencer par 7 (format sénégalais)","error"),null;const n=await fetch("https://mon-serveur-cub8.onrender.com/users");if(!n.ok)return i(" Erreur de connexion au serveur","error"),null;const s=await n.json(),r=s.find(o=>o.name.toLowerCase().trim()===e.toLowerCase().trim()&&o.phone.trim()===t.trim());if(r)return Y(r),i(` Bienvenue ${r.name} !`,"success"),r;{const o=s.find(c=>c.name.toLowerCase().trim()===e.toLowerCase().trim()),a=s.find(c=>c.phone.trim()===t.trim());return i(o&&!a?" Ce nom existe mais avec un autre numéro de téléphone":!o&&a?"Ce numéro existe mais avec un autre nom":"Aucun compte trouvé avec ces informations","error"),null}}catch(n){return console.error("Erreur de connexion:",n),i(" Erreur de connexion au serveur. Vérifiez votre connexion internet.","error"),null}}function ye(e){const t=document.createElement("div");t.className="min-h-screen flex items-center justify-center bg-[#111b21] px-4",t.innerHTML=`
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
  `;const n=t.querySelector("#loginForm"),s=t.querySelector("#nameInput"),r=t.querySelector("#phoneInput"),o=t.querySelector("#loginButton");return r.addEventListener("input",a=>{let c=a.target.value.replace(/[^0-9]/g,"");c.length>9&&(c=c.substring(0,9),i(" Maximum 9 chiffres autorisés","warning")),a.target.value=c}),s.addEventListener("input",a=>{let c=a.target.value;c.length>50&&(c=c.substring(0,50),i(" Maximum 50 caractères autorisés pour le nom","warning"),a.target.value=c)}),n.addEventListener("submit",async a=>{a.preventDefault();const c=s.value.trim(),l=r.value.trim();o.disabled=!0,o.innerHTML=`
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        Connexion en cours...
      </div>
    `;try{const d=await pe(c,l);d&&e&&e(d)}finally{o.disabled=!1,o.textContent="Se connecter"}}),t}const z="https://mon-serveur-cub8.onrender.com",H=new Map;let A=null,q=null,D=null;function ve(e,t){console.log("🔄 Initialisation synchronisation temps réel..."),q=e,D=t,A&&clearInterval(A),A=setInterval(ee,2e3),console.log("✅ Synchronisation temps réel activée")}async function ee(){try{const e=we();if(!e)return;const t=await fetch(`${z}/chats`);if(!t.ok){console.error("❌ Erreur API:",t.status);return}const n=await t.json();console.log(`🔍 Vérification ${n.length} chats...`);for(const s of n){const r=s.messages||[],o=H.get(s.id)||0;if(r.length>o){const a=r.slice(o);console.log(`📨 ${a.length} nouveaux messages dans chat ${s.id}`);for(const c of a)xe(e.id,s,c)&&(console.log(`🔔 Notification pour message de ${c.senderId}`),q&&q(c,s));H.set(s.id,r.length)}}if(D){const s=await fetch(`${z}/users`);if(s.ok){const r=await s.json();for(const o of r)o.id!==e.id&&D(o.id,o.isOnline||!1)}}}catch(e){console.error("❌ Erreur synchronisation temps réel:",e)}}function xe(e,t,n){return t.ownerId===e&&n.senderId!==e||t.contactId===e&&n.senderId!==e}function we(){const e=localStorage.getItem("currentUser");return e?JSON.parse(e):null}function be(){console.log("⚡ Synchronisation forcée"),ee()}const T="https://mon-serveur-cub8.onrender.com";async function Ee(e,t,n){try{console.log("📤 Envoi message:",{senderId:e,receiverId:t,message:n});const r=await(await fetch(`${T}/users`)).json(),o=r.find(p=>p.id===e),a=r.find(p=>p.id===t);if(!o||!a)throw console.error("Utilisateur non trouvé:",{sender:o,receiver:a}),new Error("Utilisateur non trouvé");const l=await(await fetch(`${T}/chats`)).json(),d=l.find(p=>p.ownerId===e&&p.contactId===t),x=l.find(p=>p.ownerId===t&&p.contactId===e);if(d&&await V(d.id,n),x){const p={...n,sent:!1};await V(x.id,p)}else await $e(t,e,o,n);return console.log("✅ Message envoyé avec succès"),!0}catch(s){throw console.error("❌ Erreur envoi message:",s),s}}async function $e(e,t,n,s){try{const r={...s,sent:!1},o={id:`${e}_${t}_${Date.now()}`,ownerId:e,contactId:t,name:n.name,phone:n.phone,avatar:n.avatar,status:n.status,isOnline:n.isOnline,lastSeen:n.lastSeen,unread:1,time:s.time,lastMessage:s.type==="text"?s.text:te(s),lastMessageTime:s.timestamp,messages:[r]};await fetch(`${T}/chats`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)}),console.log(`✅ Chat créé pour le destinataire ${e}`)}catch(r){console.error("❌ Erreur création chat destinataire:",r)}}async function V(e,t){try{const n=await fetch(`${T}/chats/${e}`);if(!n.ok)throw console.error(`Chat ${e} non trouvé`),new Error(`Chat ${e} non trouvé`);const s=await n.json();if(s.messages=s.messages||[],s.messages.find(a=>a.id===t.id)){console.log(`Message ${t.id} existe déjà dans le chat ${e}`);return}if(s.messages.push(t),s.lastMessage=t.type==="text"?t.text:te(t),s.time=t.time,s.lastMessageTime=t.timestamp,t.sent||(s.unread=(s.unread||0)+1),!(await fetch(`${T}/chats/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)})).ok)throw new Error("Erreur mise à jour chat");console.log(`✅ Message ajouté au chat ${e}`)}catch(n){throw console.error(`❌ Erreur ajout message au chat ${e}:`,n),n}}function te(e){switch(e.type){case"image":return"📷 Photo";case"video":return"🎥 Vidéo";case"audio":return"🎵 Audio";case"voice":return"🎤 Message vocal";case"document":return`📎 ${e.fileName}`;default:return e.text}}const M="https://mon-serveur-cub8.onrender.com";function Se(e,t=null){const n=["men","women"],s=t||n[Math.floor(Math.random()*n.length)],r=Math.floor(Math.random()*99)+1;return`https://randomuser.me/api/portraits/${s}/${r}.jpg`}async function Ce(e,t,n){try{if(!n||!t)return i("❌ Veuillez remplir tous les champs","error"),null;if(n.length<2||n.length>50)return i("❌ Le nom doit contenir entre 2 et 50 caractères","error"),null;if(!/^\d{9}$/.test(t)||!t.startsWith("7"))return i("❌ Numéro invalide (9 chiffres commençant par 7)","error"),null;const s=await fetch(`${M}/users`);if(!s.ok)return i("❌ Erreur de connexion au serveur","error"),null;const r=await s.json();let o=r.find(a=>a.phone===t);return!o&&(o={id:(r.length+1).toString(),name:n,phone:t,avatar:Se(n),status:"Hors ligne",isOnline:!1,lastSeen:new Date().toISOString(),bio:"Salut ! J'utilise WhatsApp.",walletBalance:0,totalEarnings:0,contacts:[],groups:[]},!(await fetch(`${M}/users`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)})).ok)?(i("❌ Erreur lors de la création du contact","error"),null):o.id===e?(i("❌ Vous ne pouvez pas vous ajouter vous-même","error"),null):(await Ie(e,o),i(`✅ ${o.name} ajouté à vos contacts`,"success"),o)}catch(s){return console.error("Erreur ajout contact:",s),i("❌ Erreur de connexion","error"),null}}async function Ie(e,t){try{if((await(await fetch(`${M}/chats`)).json()).find(a=>a.ownerId===e&&a.contactId===t.id)){console.log("Chat déjà existant pour cet utilisateur");return}const o={id:`${e}_${t.id}_${Date.now()}`,ownerId:e,contactId:t.id,name:t.name,phone:t.phone,avatar:t.avatar,status:t.status,isOnline:t.isOnline,lastSeen:t.lastSeen,unread:0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),lastMessage:"",lastMessageTime:new Date().toISOString(),messages:[]};await fetch(`${M}/chats`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)}),console.log(`✅ Chat personnel créé pour ${e} avec ${t.name}`)}catch(n){console.error("Erreur création chat personnel:",n)}}function P(e){const t=document.createElement("div");t.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",t.innerHTML=`
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
          💡 Ce contact sera ajouté UNIQUEMENT à votre liste personnelle.
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
  `;const n=t.querySelector("#closeModal"),s=t.querySelector("#cancelBtn"),r=t.querySelector("#addContactForm"),o=t.querySelector("#contactName"),a=t.querySelector("#contactPhone"),c=()=>{document.body.removeChild(t)};n.addEventListener("click",c),s.addEventListener("click",c),a.addEventListener("input",l=>{let d=l.target.value.replace(/[^0-9]/g,"");d.length>9&&(d=d.substring(0,9),i("⚠️ Maximum 9 chiffres autorisés","warning")),l.target.value=d}),o.addEventListener("input",l=>{let d=l.target.value;d.length>50&&(d=d.substring(0,50),i("⚠️ Maximum 50 caractères autorisés","warning"),l.target.value=d)}),r.addEventListener("submit",async l=>{l.preventDefault();const d=o.value.trim(),x=a.value.trim(),p=JSON.parse(localStorage.getItem("currentUser"));if(!p){i("❌ Erreur: utilisateur non connecté","error");return}const b=t.querySelector("#addBtn");b.disabled=!0,b.innerHTML=`
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Ajout...
      </div>
    `;try{const f=await Ce(p.id,x,d);f&&e&&e(f),c()}finally{b.disabled=!1,b.textContent="Ajouter"}}),document.body.appendChild(t),o.focus()}const v="https://mon-serveur-cub8.onrender.com";async function J(e,t,n,s="",r=null){try{if(!n)return i(t==="text"?"❌ Veuillez saisir du texte pour votre story":"❌ Veuillez sélectionner une image pour votre story","error"),null;if(t==="text"){if(n.length<1)return i("❌ Votre story ne peut pas être vide","error"),null;if(n.length>200)return i("❌ Votre story ne peut pas dépasser 200 caractères","error"),null}if(s&&s.length>100)return i("❌ La légende ne peut pas dépasser 100 caractères","error"),null;const o=await fetch(`${v}/users/${e}`);if(!o.ok)return i("❌ Erreur lors de la récupération de vos informations","error"),null;const a=await o.json(),c={id:`story_${Date.now()}`,userId:e,userName:a.name,userAvatar:a.avatar,type:t,content:n,caption:s,backgroundColor:r,timestamp:new Date().toISOString(),expiresAt:new Date(Date.now()+24*60*60*1e3).toISOString(),views:[],likes:[],comments:[],isMonetized:!1,earnings:0},l=await fetch(`${v}/stories`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)});return l.ok?(i("✅ Story publiée avec succès ! 🎉","success"),await l.json()):(i("❌ Erreur lors de la publication de votre story","error"),null)}catch(o){return console.error("Erreur création story:",o),i("❌ Erreur de connexion. Vérifiez votre connexion internet.","error"),null}}async function Le(){try{const t=await(await fetch(`${v}/stories`)).json(),n=new Date,s=t.filter(o=>new Date(o.expiresAt)>n),r=t.filter(o=>new Date(o.expiresAt)<=n);for(const o of r)await fetch(`${v}/stories/${o.id}`,{method:"DELETE"});return s}catch(e){return console.error("Erreur récupération stories:",e),[]}}async function _(e,t){try{const s=await(await fetch(`${v}/stories/${e}`)).json();return s.views.includes(t)||(s.views.push(t),await fetch(`${v}/stories/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)})),s}catch(n){return console.error("Erreur vue story:",n),null}}async function Be(e,t){try{console.log(`💖 Tentative de like story ${e} par user ${t}`);const n=await fetch(`${v}/stories/${e}`);if(!n.ok)throw new Error(`Erreur récupération story: ${n.status}`);const s=await n.json();console.log("📖 Story récupérée:",s);const r=s.likes.findIndex(a=>a.userId===t);r===-1?(s.likes.push({userId:t,timestamp:new Date().toISOString()}),console.log(`✅ Like ajouté ! Total: ${s.likes.length} likes`),i("❤️ Story likée !","success")):(s.likes.splice(r,1),console.log(`❌ Like retiré ! Total: ${s.likes.length} likes`),i("💔 Like retiré","info"));const o=await fetch(`${v}/stories/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(!o.ok)throw new Error(`Erreur sauvegarde story: ${o.status}`);return console.log(`💾 Story sauvegardée avec ${s.likes.length} likes`),await ke(s),s}catch(n){return console.error("❌ Erreur like story:",n),i("❌ Erreur lors du like. Réessayez.","error"),null}}async function ke(e){try{console.log(`🔍 Vérification monétisation pour story ${e.id}`);const t=await fetch(`${v}/monetization`);if(!t.ok)throw new Error(`Erreur récupération monétisation: ${t.status}`);const n=await t.json(),{likesThreshold:s,timeWindow:r,rewardAmount:o}=n.settings,a=(Date.now()-new Date(e.timestamp).getTime())/(1e3*60*60);if(console.log(`📊 Story ${e.id}:`),console.log(`   - Likes: ${e.likes.length}/${s}`),console.log(`   - Âge: ${a.toFixed(1)}h/${r}h`),console.log(`   - Déjà monétisée: ${e.isMonetized}`),e.likes.length>=s&&a<=r&&!e.isMonetized){console.log("🎉 MONÉTISATION DÉCLENCHÉE !"),e.isMonetized=!0,e.earnings=o;const c=await fetch(`${v}/stories/${e.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!c.ok)throw new Error(`Erreur sauvegarde story monétisée: ${c.status}`);await Me(e.userId,o)&&(await je(e.userId,e.id,o),i(`🎉 FÉLICITATIONS ! ${e.userName} a gagné ${o} FCFA pour sa story !`,"success"),Te(),console.log(`💰 ${e.userName} a gagné ${o} FCFA !`))}else console.log(`⏳ Pas encore de monétisation (${e.likes.length}/${s} likes)`)}catch(t){console.error("❌ Erreur vérification monétisation:",t)}}function Te(){try{const e=new(window.AudioContext||window.webkitAudioContext),t=e.createOscillator(),n=e.createGain();t.connect(n),n.connect(e.destination),t.frequency.setValueAtTime(800,e.currentTime),t.frequency.setValueAtTime(1e3,e.currentTime+.1),t.frequency.setValueAtTime(1200,e.currentTime+.2),n.gain.setValueAtTime(.3,e.currentTime),n.gain.exponentialRampToValueAtTime(.01,e.currentTime+.3),t.start(e.currentTime),t.stop(e.currentTime+.3)}catch(e){console.log("Impossible de jouer le son de monétisation:",e)}}async function Me(e,t){try{console.log(`💳 Crédit de ${t} FCFA pour user ${e}`);const n=await fetch(`${v}/users/${e}`);if(!n.ok)throw new Error(`Erreur récupération user: ${n.status}`);const s=await n.json(),r=s.walletBalance||0,o=s.totalEarnings||0;s.walletBalance=r+t,s.totalEarnings=o+t;const a=await fetch(`${v}/users/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(!a.ok)throw new Error(`Erreur mise à jour user: ${a.status}`);console.log(`✅ Utilisateur ${s.name} crédité:`),console.log(`   - Ancien solde: ${r} FCFA`),console.log(`   - Nouveau solde: ${s.walletBalance} FCFA`),console.log(`   - Gains totaux: ${s.totalEarnings} FCFA`);const c=JSON.parse(localStorage.getItem("currentUser")||"{}");return c.id===e&&(c.walletBalance=s.walletBalance,c.totalEarnings=s.totalEarnings,localStorage.setItem("currentUser",JSON.stringify(c)),console.log("🔄 Utilisateur local mis à jour")),!0}catch(n){return console.error("❌ Erreur crédit utilisateur:",n),!1}}async function je(e,t,n){try{const s=await fetch(`${v}/monetization`);if(!s.ok)throw new Error(`Erreur récupération monétisation: ${s.status}`);const r=await s.json(),o={id:`tx_${Date.now()}`,userId:e,storyId:t,amount:n,type:"story_reward",timestamp:new Date().toISOString()};r.transactions.push(o);const a=await fetch(`${v}/monetization`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)});if(!a.ok)throw new Error(`Erreur sauvegarde transaction: ${a.status}`);console.log("📝 Transaction enregistrée:",o)}catch(s){console.error("❌ Erreur enregistrement transaction:",s)}}function Ae(e){const t=document.createElement("div");t.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",t.innerHTML=`
    <div class="bg-[#222e35] rounded-lg p-6 w-full max-w-md">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-white">Créer une story</h2>
        <button id="closeModal" class="text-gray-400 hover:text-white">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <div class="space-y-4">
        <!-- Type de story -->
        <div class="flex space-x-2">
          <button id="textStoryBtn" class="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg story-type-btn active">
            <i class="fas fa-font mr-2"></i>Texte
          </button>
          <button id="imageStoryBtn" class="flex-1 py-3 px-4 bg-gray-600 text-white rounded-lg story-type-btn">
            <i class="fas fa-image mr-2"></i>Image
          </button>
        </div>
        
        <!-- Zone de contenu -->
        <div id="textStoryContent" class="story-content">
          <textarea 
            id="storyText"
            placeholder="Écrivez votre story..."
            class="w-full h-32 px-4 py-3 bg-[#2a3942] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          ></textarea>
          
          <div class="text-right text-xs text-gray-400 mt-1">
            <span id="textCounter">0/200 caractères</span>
          </div>
          
          <div class="flex space-x-2 mt-3">
            <button class="color-btn w-8 h-8 rounded-full bg-green-500 ring-2 ring-white" data-color="#25D366"></button>
            <button class="color-btn w-8 h-8 rounded-full bg-blue-500" data-color="#3B82F6"></button>
            <button class="color-btn w-8 h-8 rounded-full bg-purple-500" data-color="#8B5CF6"></button>
            <button class="color-btn w-8 h-8 rounded-full bg-red-500" data-color="#EF4444"></button>
            <button class="color-btn w-8 h-8 rounded-full bg-yellow-500" data-color="#F59E0B"></button>
          </div>
        </div>
        
        <div id="imageStoryContent" class="story-content hidden">
          <input type="file" id="storyImage" accept="image/*" class="hidden">
          <button id="selectImageBtn" class="w-full py-8 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors">
            <i class="fas fa-cloud-upload-alt text-3xl mb-2"></i>
            <div>Sélectionner une image</div>
            <div class="text-xs mt-1">JPG, PNG, GIF (max 5MB)</div>
          </button>
          <div id="imagePreview" class="hidden mt-4">
            <img id="previewImg" class="w-full h-48 object-cover rounded-lg">
          </div>
          <input 
            type="text" 
            id="imageCaption"
            placeholder="Ajouter une légende..."
            class="w-full mt-3 px-4 py-2 bg-[#2a3942] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
          <div class="text-right text-xs text-gray-400 mt-1">
            <span id="captionCounter">0/100 caractères</span>
          </div>
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
            type="button"
            id="publishBtn"
            class="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Publier
          </button>
        </div>
      </div>
    </div>
  `,document.body.appendChild(t);let n="#25D366",s=null,r="text";const o=t.querySelector("#closeModal"),a=t.querySelector("#cancelBtn"),c=t.querySelector("#publishBtn"),l=t.querySelector("#textStoryBtn"),d=t.querySelector("#imageStoryBtn"),x=t.querySelector("#textStoryContent"),p=t.querySelector("#imageStoryContent"),b=t.querySelector("#storyImage"),f=t.querySelector("#selectImageBtn"),m=t.querySelector("#imagePreview"),g=t.querySelector("#previewImg"),I=t.querySelector("#storyText"),R=t.querySelector("#imageCaption"),B=t.querySelector("#textCounter"),k=t.querySelector("#captionCounter"),j=()=>document.body.removeChild(t);o.addEventListener("click",j),a.addEventListener("click",j),I.addEventListener("input",y=>{const h=y.target.value.length;B.textContent=`${h}/200 caractères`,h>200&&(y.target.value=y.target.value.substring(0,200),B.textContent="200/200 caractères",i("⚠️ Maximum 200 caractères autorisés","warning")),h>180?B.style.color="#ef4444":h>150?B.style.color="#f59e0b":B.style.color="#9ca3af"}),R.addEventListener("input",y=>{const h=y.target.value.length;k.textContent=`${h}/100 caractères`,h>100&&(y.target.value=y.target.value.substring(0,100),k.textContent="100/100 caractères",i("⚠️ Maximum 100 caractères autorisés pour la légende","warning")),h>80?k.style.color="#ef4444":h>60?k.style.color="#f59e0b":k.style.color="#9ca3af"}),l.addEventListener("click",()=>{r="text",l.classList.add("active","bg-green-600"),l.classList.remove("bg-gray-600"),d.classList.remove("active","bg-green-600"),d.classList.add("bg-gray-600"),x.classList.remove("hidden"),p.classList.add("hidden")}),d.addEventListener("click",()=>{r="image",d.classList.add("active","bg-green-600"),d.classList.remove("bg-gray-600"),l.classList.remove("active","bg-green-600"),l.classList.add("bg-gray-600"),p.classList.remove("hidden"),x.classList.add("hidden")}),t.querySelectorAll(".color-btn").forEach(y=>{y.addEventListener("click",()=>{t.querySelectorAll(".color-btn").forEach(h=>h.classList.remove("ring-2","ring-white")),y.classList.add("ring-2","ring-white"),n=y.dataset.color})}),f.addEventListener("click",()=>b.click()),b.addEventListener("change",y=>{const h=y.target.files[0];if(h){if(!h.type.startsWith("image/")){i("❌ Veuillez sélectionner un fichier image valide","error");return}if(h.size>5*1024*1024){i("❌ L'image ne doit pas dépasser 5MB","error");return}const L=new FileReader;L.onload=ce=>{s=ce.target.result,g.src=s,m.classList.remove("hidden"),f.classList.add("hidden"),i("✅ Image sélectionnée avec succès","success")},L.readAsDataURL(h)}}),c.addEventListener("click",async()=>{const y=JSON.parse(localStorage.getItem("currentUser"));if(!y){i("❌ Erreur: utilisateur non connecté","error");return}c.disabled=!0,c.innerHTML=`
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Publication...
      </div>
    `;try{let h=null;if(r==="text"){const L=I.value.trim();h=await J(y.id,"text",L,"",n)}else{const L=R.value.trim();h=await J(y.id,"image",s,L)}h&&e&&e(h),j()}finally{c.disabled=!1,c.textContent="Publier"}})}function Ne(e,t=0){const n=document.createElement("div");n.className="fixed inset-0 bg-black z-50 flex items-center justify-center";let s=t,r=e[s];const o=JSON.parse(localStorage.getItem("currentUser"));n.innerHTML=`
    <div class="relative w-full h-full max-w-md mx-auto">
      <!-- Header -->
      <div class="absolute top-0 left-0 right-0 z-10 p-4">
        <div class="flex items-center justify-between text-white">
          <div class="flex items-center space-x-3">
            <img src="${r.userAvatar}" alt="${r.userName}" class="w-10 h-10 rounded-full">
            <div>
              <div class="font-medium">${r.userName}</div>
              <div class="text-sm text-gray-300">${G(r.timestamp)}</div>
            </div>
          </div>
          <button id="closeViewer" class="text-white hover:text-gray-300">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <!-- Progress bars -->
        <div class="flex space-x-1 mt-4">
          ${e.map((f,m)=>`
            <div class="flex-1 h-1 bg-gray-600 rounded">
              <div class="progress-bar h-full bg-white rounded transition-all duration-300" style="width: ${m<s?"100%":"0%"}"></div>
            </div>
          `).join("")}
        </div>
      </div>
      
      <!-- Content -->
      <div id="storyContent" class="w-full h-full flex items-center justify-center">
        ${W(r)}
      </div>
      
      <!-- Navigation -->
      <div class="absolute inset-0 flex">
        <button id="prevStory" class="flex-1 z-20"></button>
        <button id="nextStory" class="flex-1 z-20"></button>
      </div>
      
      <!-- Actions -->
      <div class="absolute bottom-0 left-0 right-0 p-4">
        <div class="flex items-center justify-between text-white">
          <div class="flex items-center space-x-4">
            <button id="likeBtn" class="like-button flex items-center space-x-2 transition-all duration-200 transform hover:scale-110 ${r.likes.some(f=>f.userId===(o==null?void 0:o.id))?"text-red-500 scale-110":"text-white hover:text-red-300"}">
              <i class="fas fa-heart text-3xl drop-shadow-lg"></i>
              <span class="font-bold text-lg">${r.likes.length}</span>
            </button>
            <button class="flex items-center space-x-2 text-blue-400">
              <i class="fas fa-eye text-xl"></i>
              <span>${r.views.length}</span>
            </button>
          </div>
          
          <div class="flex items-center space-x-2">
            ${r.isMonetized?`
              <div class="bg-green-500 px-3 py-1 rounded-full text-sm animate-pulse flex items-center space-x-1">
                <i class="fas fa-coins text-yellow-300"></i>
                <span class="font-bold">${r.earnings} FCFA</span>
              </div>
            `:`
              <div class="bg-gray-700 px-3 py-1 rounded-full text-xs">
                ${r.likes.length}/3 ❤️
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `,document.body.appendChild(n),o&&_(r.id,o.id),n.querySelector("#closeViewer").addEventListener("click",()=>{document.body.removeChild(n)}),n.querySelector("#likeBtn").addEventListener("click",async()=>{if(o){const f=n.querySelector("#likeBtn");f.style.transform="scale(1.5)",f.style.transition="transform 0.2s ease",a(f),setTimeout(()=>{f.style.transform="scale(1.1)"},200),console.log(`🔄 Clic sur like pour story ${r.id}`);const m=await Be(r.id,o.id);m&&(r=m,e[s]=m,c(),l())}else i("❌ Connectez-vous pour liker les stories","error")});function a(f){for(let m=0;m<5;m++){const g=document.createElement("div");g.innerHTML="❤️",g.style.position="absolute",g.style.fontSize="20px",g.style.pointerEvents="none",g.style.zIndex="1000";const I=f.getBoundingClientRect();g.style.left=I.left+Math.random()*I.width+"px",g.style.top=I.top+"px",document.body.appendChild(g),g.animate([{transform:"translateY(0px) scale(1)",opacity:1},{transform:"translateY(-50px) scale(0.5)",opacity:0}],{duration:1e3,easing:"ease-out"}).onfinish=()=>g.remove()}}function c(){const f=n.querySelector("#likeBtn"),m=r.likes.some(g=>g.userId===(o==null?void 0:o.id));f.className=`like-button flex items-center space-x-2 transition-all duration-200 transform hover:scale-110 ${m?"text-red-500 scale-110":"text-white hover:text-red-300"}`,f.querySelector("span").textContent=r.likes.length,console.log(`💖 Bouton like mis à jour: ${r.likes.length} likes, isLiked: ${m}`)}function l(){const f=n.querySelector(".absolute.bottom-0 .flex.items-center.justify-between .flex.items-center.space-x-2");r.isMonetized?f.innerHTML=`
        <div class="bg-green-500 px-3 py-1 rounded-full text-sm animate-pulse flex items-center space-x-1">
          <i class="fas fa-coins text-yellow-300"></i>
          <span class="font-bold">${r.earnings} FCFA</span>
        </div>
      `:f.innerHTML=`
        <div class="bg-gray-700 px-3 py-1 rounded-full text-xs">
          ${r.likes.length}/3 ❤️
        </div>
      `}let d=setInterval(()=>{const f=n.querySelector(".progress-bar");let m=Number.parseFloat(f.style.width)||0;m+=.5,f.style.width=m+"%",m>=100&&x()},200);function x(){clearInterval(d),s<e.length-1?(s++,b()):document.body.removeChild(n)}function p(){clearInterval(d),s>0&&(s--,b())}function b(){r=e[s],n.querySelector("#storyContent").innerHTML=W(r),n.querySelectorAll(".progress-bar").forEach((m,g)=>{g<s?m.style.width="100%":m.style.width="0%"});const f=n.querySelector(".flex.items-center.space-x-3");f.innerHTML=`
      <img src="${r.userAvatar}" alt="${r.userName}" class="w-10 h-10 rounded-full">
      <div>
        <div class="font-medium">${r.userName}</div>
        <div class="text-sm text-gray-300">${G(r.timestamp)}</div>
      </div>
    `,c(),l(),d=setInterval(()=>{const m=n.querySelectorAll(".progress-bar")[s];let g=Number.parseFloat(m.style.width)||0;g+=.5,m.style.width=g+"%",g>=100&&x()},200),o&&_(r.id,o.id)}n.querySelector("#nextStory").addEventListener("click",x),n.querySelector("#prevStory").addEventListener("click",p)}function W(e){return e.type==="text"?`
      <div class="w-full h-full flex items-center justify-center p-8" style="background: ${e.backgroundColor}">
        <div class="text-white text-2xl font-medium text-center leading-relaxed">
          ${e.content}
        </div>
      </div>
    `:e.type==="image"?`
      <div class="w-full h-full relative">
        <img src="${e.content}" alt="Story" class="w-full h-full object-cover">
        ${e.caption?`
          <div class="absolute bottom-20 left-0 right-0 p-4">
            <div class="bg-black bg-opacity-50 rounded-lg p-3 text-white">
              ${e.caption}
            </div>
          </div>
        `:""}
      </div>
    `:""}function G(e){const t=new Date,n=new Date(e),s=Math.floor((t-n)/(1e3*60*60));return s<1?`il y a ${Math.floor((t-n)/6e4)}m`:`il y a ${s}h`}let C=[],u=null,S="chats",N=!1,O=!1;window.currentChat=null;document.addEventListener("DOMContentLoaded",()=>{console.log("🚀 WhatsApp Web démarré"),Oe()});async function Oe(){const e=document.getElementById("mainContainer"),t=document.getElementById("loginContainer"),n=$();n?(console.log("✅ Utilisateur connecté:",n.name),r()):(console.log("❌ Aucun utilisateur connecté"),s());function s(){e.style.display="none",t.style.display="block",t.innerHTML="";const o=ye(a=>{console.log("✅ Connexion réussie pour:",a.name),r()});t.appendChild(o)}function r(){t.style.display="none",e.style.display="flex",qe()}}async function qe(){try{console.log("🔧 Initialisation de l'interface..."),await E(),De(),tt(),ie(),ve((e,t)=>{console.log("📨 Nouveau message reçu:",e),rt(e,t)},(e,t)=>{console.log(`👤 Statut utilisateur ${e}:`,t?"en ligne":"hors ligne"),ot(e,t)}),st(),await le(),console.log("✅ Interface principale initialisée")}catch(e){console.error("❌ Erreur initialisation:",e),i("Erreur de chargement","error")}}async function E(){try{if(console.log("📱 Chargement des chats..."),C=await ue(),console.log(`✅ ${C.length} chats chargés`),S==="chats"&&se(),u){const e=await K(u.id);oe(e)}}catch(e){console.error("❌ Erreur chargement chats:",e),i("Impossible de charger les conversations","error")}}function De(){console.log("🔧 Configuration des événements...");const e=document.getElementById("userAvatarButton");e&&e.addEventListener("click",Qe);const t=document.getElementById("backToChats");t&&t.addEventListener("click",ae);const n=document.getElementById("logoutButton");n&&n.addEventListener("click",Q);const s=document.getElementById("backButton");s&&s.addEventListener("click",Ye),Xe(),Re(),Ue(),Fe(),Pe(),window.addEventListener("resize",nt)}function Pe(){const e=document.getElementById("newChatBtn");e&&e.addEventListener("click",()=>{if(!$()){i("❌ Erreur: utilisateur non connecté","error");return}P(async n=>{console.log("✅ Contact ajouté:",n.name),await E(),i(`${n.name} ajouté avec succès`,"success")})})}function Ue(){const e=document.getElementById("searchInput");e&&e.addEventListener("input",t=>{const n=t.target.value.toLowerCase().trim();Je(n)})}function Fe(){const e=document.querySelectorAll(".filter-tab");e.forEach(t=>{t.addEventListener("click",()=>{e.forEach(s=>{s.classList.remove("active","bg-green-600","text-white"),s.classList.add("text-gray-400")}),t.classList.add("active","bg-green-600","text-white"),t.classList.remove("text-gray-400");const n=t.dataset.filter;_e(n)})})}function Re(){const e=document.querySelectorAll(".nav-item");e.forEach(t=>{t.addEventListener("click",async n=>{n.preventDefault(),n.stopPropagation();const s=t.dataset.view;if(console.log("🔄 Navigation vers:",s),!(N||S===s)){N=!0;try{switch(S=s,e.forEach(r=>r.classList.remove("active")),t.classList.add("active"),s){case"chats":await Z();break;case"status":await ze();break;case"communities":i("👥 Groupes - Fonctionnalité en développement","info");break;case"settings":He();break}console.log("✅ Navigation terminée vers:",s)}catch(r){console.error("❌ Erreur navigation:",r),S="chats",await Z()}finally{setTimeout(()=>{N=!1},500)}}})})}async function Z(){console.log("📱 Affichage vue chats");const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel");t.style.display="none",e.style.display="flex",await E()}async function ze(){console.log("📖 Affichage vue stories");const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel");t.style.display="none",e.style.display="flex",await ne()}function He(){console.log("⚙️ Affichage vue paramètres");const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel");t.style.display="none",e.style.display="flex",Ve()}async function ne(){const e=document.getElementById("chatList"),t=$();if(!(!e||!t))try{const n=await Le();e.innerHTML=`
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
          ${n.length===0?`
            <div class="text-center py-8 text-gray-400">
              <i class="fas fa-circle text-4xl mb-4 opacity-30"></i>
              <p>Aucune story disponible</p>
              <p class="text-sm">Soyez le premier à partager !</p>
            </div>
          `:n.map(r=>`
            <div class="story-item p-3 hover:bg-[#202c33] rounded-lg cursor-pointer transition-colors" data-story-id="${r.id}">
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <img src="${r.userAvatar}" alt="${r.userName}" class="w-12 h-12 rounded-full object-cover">
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#222e35]"></div>
                </div>
                <div class="flex-1">
                  <div class="text-white font-medium">${r.userName}</div>
                  <div class="text-gray-400 text-sm">${at(r.timestamp)}</div>
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
    `;const s=document.getElementById("createStoryBtn");s&&s.addEventListener("click",()=>{Ae(async r=>{S==="status"&&await ne()})}),document.querySelectorAll(".story-item").forEach(r=>{r.addEventListener("click",()=>{const o=r.dataset.storyId,a=n.findIndex(c=>c.id===o);a!==-1&&Ne(n,a)})})}catch(n){console.error("Erreur chargement stories:",n),e.innerHTML=`
      <div class="text-center py-8 text-red-400">
        <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
        <p>Erreur de chargement</p>
      </div>
    `}}function Ve(){const e=document.getElementById("chatList"),t=$();if(!e||!t)return;e.innerHTML=`
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
  `;const n=document.getElementById("addContactBtn");n&&n.addEventListener("click",()=>{P(async a=>{await E(),i(`${a.name} ajouté avec succès`,"success")})});const s=document.getElementById("initChatsBtn");s&&s.addEventListener("click",async()=>{try{i("🚀 Initialisation de tous les chats...","info");const a=await ge();i(`✅ ${a.chatsCreated} chats créés !`,"success"),await E()}catch(a){console.error("❌ Erreur initialisation:",a),i("❌ Erreur lors de l'initialisation","error")}});const r=document.getElementById("refreshBtn");r&&r.addEventListener("click",async()=>{i("🔄 Actualisation...","info"),await E(),be(),i("✅ Actualisé !","success")});const o=document.getElementById("logoutBtn");o&&o.addEventListener("click",Q)}function Je(e){document.querySelectorAll(".chat-item").forEach(n=>{var o,a;const s=((o=n.querySelector(".chat-name"))==null?void 0:o.textContent.toLowerCase())||"",r=((a=n.querySelector(".chat-message"))==null?void 0:a.textContent.toLowerCase())||"";s.includes(e)||r.includes(e)?n.style.display="block":n.style.display="none"})}function _e(e){let t=[...C];switch(e){case"unread":t=t.filter(n=>n.unread>0);break;case"favorites":t=t.filter(n=>n.isFavorite);break;case"groups":t=t.filter(n=>n.isGroup);break}We(t)}function We(e){const t=document.getElementById("chatList");t&&(t.innerHTML="",e.forEach(n=>{const s=re(n);t.appendChild(s)}))}function se(){const e=document.getElementById("chatList");if(!e)return;const t=$();if(!t)return;if(console.log(`📱 Rendu de ${C.length} chats pour ${t.name}`),e.innerHTML="",C.length===0){e.innerHTML=`
      <div class="text-center py-8 text-gray-400">
        <i class="fas fa-comments text-4xl mb-4 opacity-30"></i>
        <p class="mb-2">Aucune conversation</p>
        <p class="text-sm">Ajoutez un contact pour commencer !</p>
        <button id="addFirstContact" class="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
          <i class="fas fa-user-plus mr-2"></i>
          Ajouter un contact
        </button>
      </div>
    `;const s=document.getElementById("addFirstContact");s&&s.addEventListener("click",()=>{P(async r=>{await E(),i(`${r.name} ajouté avec succès`,"success")})});return}[...C].sort((s,r)=>{const o=new Date(s.lastMessageTime||s.time);return new Date(r.lastMessageTime||r.time)-o}).forEach(s=>{const r=re(s);e.appendChild(r)})}function re(e){const t=document.createElement("div");t.className="chat-item px-4 py-3 cursor-pointer hover:bg-[#202c33] transition-colors border-b border-gray-700",t.dataset.chatId=e.id;const n=e.unread>0,s=e.isOnline;return t.innerHTML=`
    <div class="flex items-center space-x-3">
      <div class="relative">
        <img src="${e.avatar}" alt="${e.name}" class="w-12 h-12 rounded-full object-cover">
        ${s?'<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#222e35]"></div>':""}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start">
          <h3 class="chat-name font-medium text-white truncate ${n?"font-semibold":""}">${e.name}</h3>
          <div class="flex flex-col items-end space-y-1">
            <span class="text-xs ${n?"text-green-400":"text-gray-400"}">${e.time}</span>
            ${n?`<span class="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">${e.unread}</span>`:""}
          </div>
        </div>
        <div class="mt-1">
          <p class="chat-message text-sm ${n?"text-white font-medium":"text-gray-400"} truncate">${e.lastMessage||"Aucun message"}</p>
        </div>
      </div>
    </div>
  `,t.addEventListener("click",()=>Ge(e.id)),t}async function Ge(e){var t;try{if(console.log("💬 Ouverture chat:",e),ae(),u=C.find(n=>n.id===e),window.currentChat=u,!u){console.error("❌ Chat non trouvé:",e);return}console.log("✅ Chat ouvert:",u.name),u.unread>0&&(u.unread=0,await de(u.id,{unread:0})),document.querySelectorAll(".chat-item").forEach(n=>{n.classList.remove("bg-[#202c33]")}),(t=document.querySelector(`[data-chat-id="${e}"]`))==null||t.classList.add("bg-[#202c33]"),F()&&(document.getElementById("sidebar").style.display="none"),document.getElementById("chatArea").style.display="flex",Ze(),await oe(),Ke(),S==="chats"&&se()}catch(n){console.error("❌ Erreur ouverture chat:",n),i("Erreur lors de l'ouverture du chat","error")}}function Ze(){const e=document.getElementById("chatHeader"),t=document.getElementById("chatAvatar"),n=document.getElementById("chatName"),s=document.getElementById("chatStatus");e&&u&&(e.style.display="flex",t.innerHTML=`<img src="${u.avatar}" alt="${u.name}" class="w-10 h-10 rounded-full object-cover">`,n.textContent=u.name,s.textContent=u.isOnline?"en ligne":u.status)}async function oe(){const e=document.getElementById("messagesArea");if(!(!e||!u))try{console.log("📨 Rendu des messages pour:",u.name);const t=await K(u.id);if(u.messages=t,e.innerHTML="",t.length===0){e.innerHTML=`
        <div class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <i class="fas fa-comments text-4xl mb-4 opacity-30"></i>
            <p>Aucun message</p>
            <p class="text-sm">Envoyez votre premier message !</p>
          </div>
        </div>
      `;return}t.forEach(n=>{const s=U(n);e.appendChild(s)}),e.scrollTop=e.scrollHeight,console.log(`✅ ${t.length} messages affichés`)}catch(t){console.error("❌ Erreur lors du rendu des messages:",t),i("Erreur lors du chargement des messages","error")}}function U(e){const t=$(),n=e.senderId===t.id,s=document.createElement("div");s.className=`flex mb-4 ${n?"justify-end":"justify-start"}`,s.dataset.messageId=e.id;let r="";switch(e.type){case"text":default:r=`<p class="text-sm">${e.text}</p>`;break}return s.innerHTML=`
    <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${n?"bg-[#005c4b] text-white":"bg-[#202c33] text-white"} shadow-md">
      ${r}
      <div class="flex justify-end items-center mt-1 space-x-1">
        <span class="text-xs text-gray-300">${e.time}</span>
        ${n?`<i class="fas fa-check-double text-xs ${e.status==="read"?"text-blue-400":"text-gray-400"}"></i>`:""}
      </div>
    </div>
  `,s}function Ke(){const e=document.getElementById("messageInput");e&&(e.style.display="flex")}function Xe(){const e=document.getElementById("messageText"),t=document.getElementById("sendButton");if(!e||!t)return;async function n(){if(O){console.log("⚠️ Envoi déjà en cours, ignoré");return}const s=e.value.trim();if(!(!s||!u))try{O=!0;const r=$();if(!r)return;console.log("📤 Envoi message:",s);const o={id:Date.now(),senderId:r.id,receiverId:u.contactId,text:s,sent:!0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),timestamp:new Date().toISOString(),type:"text",status:"sent"};e.value="";const a=U(o),c=document.getElementById("messagesArea");c&&(c.appendChild(a),c.scrollTop=c.scrollHeight),await Ee(r.id,u.contactId,o),S==="chats"&&await E(),console.log("✅ Message envoyé avec succès")}catch(r){console.error("❌ Erreur envoi message:",r),i("Erreur lors de l'envoi","error")}finally{O=!1}}t.addEventListener("click",n),e.addEventListener("keypress",s=>{s.key==="Enter"&&!s.shiftKey&&(s.preventDefault(),n())})}function Ye(){F()&&(document.getElementById("sidebar").style.display="flex",document.getElementById("chatArea").style.display="none"),u=null,window.currentChat=null,document.getElementById("chatHeader").style.display="none",document.getElementById("messageInput").style.display="none",ie()}function Qe(){const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel"),n=document.getElementById("chatArea");e.style.display="none",n.style.display="none",t.style.display="flex",et()}function ae(){const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel"),n=document.getElementById("chatArea");t.style.display="none",e.style.display="flex",u&&(n.style.display="flex")}function et(){const e=$();if(e){const t=document.getElementById("profileImage"),n=document.getElementById("profileName");t&&(t.src=e.avatar,t.alt=e.name),n&&(n.textContent=e.name)}}function tt(){const e=$(),t=document.querySelectorAll(".user-avatar img");e&&t.length>0&&t.forEach(n=>{n.src=e.avatar,n.alt=e.name})}function ie(){const e=document.getElementById("messagesArea");e&&(e.innerHTML=`
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
    `)}function nt(){!F()&&u&&(document.getElementById("sidebar").style.display="flex",document.getElementById("chatArea").style.display="flex")}function F(){return window.innerWidth<768}function st(){setInterval(async()=>{S==="chats"&&await E()},1e4)}function rt(e,t){const n=$();if(n){if(u&&u.id===t.id){const s=U(e),r=document.getElementById("messagesArea");r&&(r.appendChild(s),r.scrollTop=r.scrollHeight)}S==="chats"&&E(),e.senderId!==n.id&&i(`💬 Nouveau message de ${t.name}`,"info")}}function ot(e,t){if(document.querySelectorAll(".chat-item").forEach(s=>{const r=C.find(o=>o.id===s.dataset.chatId);if(r&&r.contactId===e){const o=s.querySelector(".online-indicator");if(t&&!o){const a=s.querySelector(".relative");a.innerHTML+='<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#222e35]"></div>'}else!t&&o&&o.remove()}}),u&&u.contactId===e){const s=document.getElementById("chatStatus");s&&(s.textContent=t?"en ligne":"hors ligne")}}function at(e){const t=new Date(e),s=new Date().getTime()-t.getTime(),r=Math.floor(s/6e4);return r<60?`${r} minutes`:r<1440?`${Math.floor(r/60)} heures`:`${Math.floor(r/1440)} jours`}
