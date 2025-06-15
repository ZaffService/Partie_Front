(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function r(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(s){if(s.ep)return;s.ep=!0;const o=r(s);fetch(s.href,o)}})();function c(e,t="info"){document.querySelectorAll(".toast").forEach(o=>o.remove());const n=document.createElement("div"),s={success:"#25D366",error:"#ef4444",info:"#8696a0",warning:"#f59e0b"};n.className="toast fixed right-4 top-4 p-4 rounded-lg text-white shadow-lg transform translate-x-full transition-all duration-300 z-50",n.style.backgroundColor=s[t],n.innerHTML=`
    <div class="flex items-center">
      <i class="fas ${t==="success"?"fa-check-circle":t==="error"?"fa-exclamation-circle":t==="warning"?"fa-exclamation-triangle":"fa-info-circle"} mr-2"></i>
      <span>${e}</span>
    </div>
  `,document.body.appendChild(n),setTimeout(()=>{n.style.transform="translateX(0)"},100),setTimeout(()=>{n.style.transform="translateX(100%)",setTimeout(()=>n.remove(),300)},3e3)}function de(e,t,r=null){if(!("Notification"in window)){console.log("Ce navigateur ne supporte pas les notifications");return}if(Notification.permission==="granted"){const n=new Notification(e,{body:t,icon:r||"/placeholder.svg?height=64&width=64",badge:"/placeholder.svg?height=32&width=32",tag:"whatsapp-message",requireInteraction:!1,silent:!1});setTimeout(()=>{n.close()},5e3),n.onclick=()=>{window.focus(),n.close()}}else Notification.permission!=="denied"&&Notification.requestPermission().then(n=>{n==="granted"&&de(e,t,r)});Ce(e,t,r)}function Ce(e,t,r){const n=document.getElementById("notificationContainer");if(!n)return;const s=document.createElement("div");s.className="bg-[#202c33] border border-gray-600 rounded-lg p-4 shadow-lg max-w-sm transform translate-x-full transition-all duration-300",s.innerHTML=`
    <div class="flex items-start space-x-3">
      ${r?`<img src="${r}" alt="Avatar" class="w-10 h-10 rounded-full object-cover flex-shrink-0">`:'<div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-comment text-white"></i></div>'}
      <div class="flex-1 min-w-0">
        <h4 class="text-white font-medium text-sm truncate">${e}</h4>
        <p class="text-gray-400 text-sm mt-1 line-clamp-2">${t}</p>
      </div>
      <button class="text-gray-400 hover:text-white flex-shrink-0" onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times text-sm"></i>
      </button>
    </div>
  `,n.appendChild(s),setTimeout(()=>{s.style.transform="translateX(0)"},100),setTimeout(()=>{s.style.transform="translateX(100%)",setTimeout(()=>{s.parentElement&&s.remove()},300)},5e3),Ie()}function Ie(){try{const e=new(window.AudioContext||window.webkitAudioContext),t=e.createOscillator(),r=e.createGain();t.connect(r),r.connect(e.destination),t.frequency.setValueAtTime(800,e.currentTime),t.frequency.setValueAtTime(600,e.currentTime+.1),r.gain.setValueAtTime(.1,e.currentTime),r.gain.exponentialRampToValueAtTime(.01,e.currentTime+.2),t.start(e.currentTime),t.stop(e.currentTime+.2)}catch(e){console.log("Impossible de jouer le son de notification:",e)}}async function Le(){try{return await Notification.requestPermission()==="granted"}catch(e){return console.error("Erreur permissions notifications:",e),!1}}const N="https://mon-serveur-cub8.onrender.com";async function ue(){try{const e=await fetch(`${N}/chats`);if(!e.ok)throw new Error("Erreur réseau");return await e.json()}catch(e){throw console.error("Erreur getChats:",e),e}}async function X(e){try{const t=await fetch(`${N}/chats/${e}`);if(!t.ok)throw new Error("Erreur réseau");return(await t.json()).messages||[]}catch(t){return console.error("Erreur getMessages:",t),[]}}async function G(e,t){try{const r=await fetch(`${N}/chats/${e}`);if(!r.ok)return console.warn(`Chat ${e} non trouvé pour mise à jour`),null;const n=await r.json();Object.assign(n,t);const s=await fetch(`${N}/chats/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)});if(!s.ok)throw new Error("Erreur mise à jour");return await s.json()}catch(r){return console.error("Erreur updateChat:",r),null}}async function Be(e,t){try{const r=await fetch(`${N}/chats/${e}`);if(!r.ok)return;const n=await r.json();n.isOnline=t,n.lastSeen=new Date().toISOString(),await fetch(`${N}/chats/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)})}catch(r){console.error("Erreur updateUserStatus:",r)}}let fe=null;function Te(){const e=localStorage.getItem("currentUser");if(e)try{const t=JSON.parse(e);return me(t),t}catch(t){console.error("Erreur parsing user:",t),localStorage.removeItem("currentUser")}return null}function $(){return fe||Te()}function me(e){fe=e,e?(localStorage.setItem("currentUser",JSON.stringify(e)),Be(e.id,"en ligne").catch(console.error)):localStorage.removeItem("currentUser")}function ge(){window.refreshInterval&&clearInterval(window.refreshInterval),localStorage.removeItem("currentUser"),window.location.reload()}async function ke(e,t){try{if(!e&&!t)return c(" Veuillez remplir tous les champs","error"),null;if(!e)return c(" Le nom est obligatoire","error"),null;if(!t)return c(" Le numéro de téléphone est obligatoire","error"),null;if(e.length<2)return c(" Le nom doit contenir au moins 2 caractères","error"),null;if(e.length>50)return c(" Le nom ne peut pas dépasser 50 caractères","error"),null;if(!/^\d+$/.test(t))return c(" Le numéro ne doit contenir que des chiffres","error"),null;if(t.length!==9)return c(" Le numéro doit contenir exactement 9 chiffres","error"),null;if(!t.startsWith("7"))return c(" Le numéro doit commencer par 7 (format sénégalais)","error"),null;const r=await fetch("https://mon-serveur-cub8.onrender.com/users");if(!r.ok)return c(" Erreur de connexion au serveur","error"),null;const n=await r.json(),s=n.find(o=>o.name.toLowerCase().trim()===e.toLowerCase().trim()&&o.phone.trim()===t.trim());if(s)return me(s),c(` Bienvenue ${s.name} !`,"success"),s;{const o=n.find(a=>a.name.toLowerCase().trim()===e.toLowerCase().trim()),i=n.find(a=>a.phone.trim()===t.trim());return c(o&&!i?" Ce nom existe mais avec un autre numéro de téléphone":!o&&i?"Ce numéro existe mais avec un autre nom":"Aucun compte trouvé avec ces informations","error"),null}}catch(r){return console.error("Erreur de connexion:",r),c(" Erreur de connexion au serveur. Vérifiez votre connexion internet.","error"),null}}function Me(e){const t=document.createElement("div");t.className="min-h-screen flex items-center justify-center bg-[#111b21] px-4",t.innerHTML=`
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
  `;const r=t.querySelector("#loginForm"),n=t.querySelector("#nameInput"),s=t.querySelector("#phoneInput"),o=t.querySelector("#loginButton");return s.addEventListener("input",i=>{let a=i.target.value.replace(/[^0-9]/g,"");a.length>9&&(a=a.substring(0,9),c(" Maximum 9 chiffres autorisés","warning")),i.target.value=a}),n.addEventListener("input",i=>{let a=i.target.value;a.length>50&&(a=a.substring(0,50),c(" Maximum 50 caractères autorisés pour le nom","warning"),i.target.value=a)}),r.addEventListener("submit",async i=>{i.preventDefault();const a=n.value.trim(),l=s.value.trim();o.disabled=!0,o.innerHTML=`
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        Connexion en cours...
      </div>
    `;try{const d=await ke(a,l);d&&e&&e(d)}finally{o.disabled=!1,o.textContent="Se connecter"}}),t}let w=null,P=null,T=null,v=null;const Ae={iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun1.l.google.com:19302"}]};async function te(e,t){try{console.log(`🎥 Initialisation appel ${t} avec ${e.name}`),T=new RTCPeerConnection(Ae);const r={audio:!0,video:t==="video"?{width:{ideal:1280},height:{ideal:720},facingMode:"user"}:!1};return console.log("📹 Demande d'accès à la caméra/micro..."),w=await navigator.mediaDevices.getUserMedia(r),console.log("✅ Stream local obtenu:",w),console.log("📊 Tracks vidéo:",w.getVideoTracks().length),console.log("📊 Tracks audio:",w.getAudioTracks().length),w.getTracks().forEach(n=>{T.addTrack(n,w),console.log("✅ Track ajouté:",n.kind,n.label)}),T.ontrack=n=>{console.log("📡 Stream distant reçu:",n.streams[0]),P=n.streams[0];const s=document.getElementById("remoteVideo");s&&(s.srcObject=P,console.log("✅ Stream distant assigné à la vidéo"))},T.onicecandidate=n=>{n.candidate&&console.log("🧊 ICE candidate:",n.candidate)},v={contact:e,type:t,status:"calling",startTime:Date.now()},je(e,t),setTimeout(()=>{v&&v.status==="calling"&&qe()},2e3+Math.random()*1e3),!0}catch(r){return console.error("❌ Erreur initialisation appel:",r),r.name==="NotAllowedError"?c("❌ Veuillez autoriser l'accès à la caméra/microphone","error"):r.name==="NotFoundError"?c("❌ Aucun périphérique audio/vidéo détecté","error"):c("❌ Erreur lors de l'initialisation de l'appel","error"),!1}}function je(e,t){const r=document.getElementById("callInterface");r&&r.remove();const n=document.createElement("div");n.id="callInterface",n.className="fixed inset-0 bg-gray-900 z-50",t==="video"?n.innerHTML=`
      <div class="w-full h-full relative">
        <!-- Vidéo distante (plein écran) -->
        <video id="remoteVideo" 
               class="w-full h-full object-cover bg-gray-800" 
               autoplay 
               playsinline
               muted>
        </video>
        
        <!-- Placeholder si pas de vidéo distante -->
        <div id="remotePlaceholder" class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div class="text-center">
            <img src="${e.avatar}" alt="${e.name}" 
                 class="w-32 h-32 rounded-full mb-4 object-cover shadow-2xl mx-auto">
            <h2 class="text-3xl font-light mb-2 text-white">${e.name}</h2>
            <p id="callStatus" class="text-lg text-gray-300">Appel vidéo en cours...</p>
          </div>
        </div>
        
        <!-- Vidéo locale (coin) - PLUS GRANDE -->
        <div class="absolute top-4 right-4 w-64 h-48 bg-black rounded-lg overflow-hidden border-4 border-white shadow-2xl">
          <video id="localVideo" 
                 class="w-full h-full object-cover" 
                 autoplay 
                 muted 
                 playsinline>
          </video>
          <div id="localVideoPlaceholder" class="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
            <div class="text-center">
              <i class="fas fa-video-slash text-2xl mb-2"></i>
              <div class="text-sm">Caméra en cours...</div>
            </div>
          </div>
        </div>
        
        <!-- Contrôles -->
        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-6">
          <button id="muteBtn" class="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors shadow-lg">
            <i class="fas fa-microphone text-xl text-white"></i>
          </button>
          
          <button id="cameraBtn" class="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors shadow-lg">
            <i class="fas fa-video text-xl text-white"></i>
          </button>
          
          <button id="hangupBtn" class="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg">
            <i class="fas fa-phone text-xl text-white transform rotate-135"></i>
          </button>
        </div>
        
        <!-- Durée -->
        <div id="callDuration" class="absolute top-4 left-4 bg-black bg-opacity-70 px-4 py-2 rounded-full text-white font-mono text-lg">
          00:00
        </div>
      </div>
    `:n.innerHTML=`
      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
        <div class="text-center">
          <img src="${e.avatar}" alt="${e.name}" 
               class="w-40 h-40 rounded-full mb-6 object-cover shadow-2xl mx-auto">
          <h2 class="text-4xl font-light mb-4 text-white">${e.name}</h2>
          <p id="callStatus" class="text-xl text-gray-300 mb-8">Appel en cours...</p>
          
          <!-- Visualiseur audio -->
          <div id="audioVisualizer" class="mb-8">
            <canvas id="visualizerCanvas" width="300" height="100" class="mx-auto"></canvas>
          </div>
          
          <div class="flex space-x-8 justify-center">
            <button id="muteBtn" class="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
              <i class="fas fa-microphone text-xl text-white"></i>
            </button>
            
            <button id="speakerBtn" class="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
              <i class="fas fa-volume-up text-xl text-white"></i>
            </button>
            
            <button id="hangupBtn" class="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
              <i class="fas fa-phone text-xl text-white transform rotate-135"></i>
            </button>
          </div>
          
          <div id="callDuration" class="mt-8 text-2xl text-gray-400 font-mono">00:00</div>
        </div>
      </div>
    `,document.body.appendChild(n),t==="video"&&Ne(),De(t),t==="audio"&&Pe()}function Ne(){const e=document.getElementById("localVideo"),t=document.getElementById("localVideoPlaceholder");if(e&&w){console.log("🎥 Configuration vidéo locale..."),console.log("📊 Stream disponible:",w),console.log("📊 Tracks vidéo:",w.getVideoTracks()),e.srcObject=w,e.onloadedmetadata=()=>{console.log("✅ Métadonnées vidéo chargées"),console.log("📐 Dimensions:",e.videoWidth,"x",e.videoHeight),t&&(t.style.display="none")},e.onplay=()=>{console.log("▶️ Vidéo locale en lecture"),t&&(t.style.display="none")},e.onerror=n=>{console.error("❌ Erreur vidéo locale:",n),t&&(t.innerHTML=`
          <div class="text-center text-red-400">
            <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
            <div class="text-sm">Erreur caméra</div>
          </div>
        `)},e.play().then(()=>{console.log("✅ Vidéo locale démarrée avec succès")}).catch(n=>{console.error("❌ Erreur démarrage vidéo locale:",n)});const r=setInterval(()=>{e.videoWidth>0&&e.videoHeight>0&&(console.log("✅ Vidéo locale active:",e.videoWidth,"x",e.videoHeight),t&&(t.style.display="none"),clearInterval(r))},500);setTimeout(()=>{clearInterval(r)},1e4)}else console.error("❌ Élément vidéo ou stream manquant"),console.log("localVideo:",e),console.log("localStream:",w),t&&(t.innerHTML=`
        <div class="text-center text-red-400">
          <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
          <div class="text-sm">Caméra indisponible</div>
        </div>
      `)}function De(e){const t=document.getElementById("muteBtn"),r=document.getElementById("cameraBtn"),n=document.getElementById("speakerBtn"),s=document.getElementById("hangupBtn");let o=!1,i=!1,a=!1;t&&t.addEventListener("click",()=>{o=!o,w&&w.getAudioTracks().forEach(l=>{l.enabled=!o,console.log(`🎤 Audio ${o?"coupé":"activé"}:`,l.label)}),t.innerHTML=`<i class="fas fa-microphone${o?"-slash":""} text-xl text-white"></i>`,t.classList.toggle("bg-red-500",o),t.classList.toggle("bg-gray-700",!o),c(o?"🔇 Micro coupé":"🎤 Micro activé","info")}),r&&e==="video"&&r.addEventListener("click",()=>{i=!i,w&&w.getVideoTracks().forEach(d=>{d.enabled=!i,console.log(`📹 Vidéo ${i?"désactivée":"activée"}:`,d.label)}),r.innerHTML=`<i class="fas fa-video${i?"-slash":""} text-xl text-white"></i>`,r.classList.toggle("bg-red-500",i),r.classList.toggle("bg-gray-700",!i);const l=document.getElementById("localVideoPlaceholder");l&&(l.style.display=i?"flex":"none",i&&(l.innerHTML=`
            <div class="text-center">
              <i class="fas fa-video-slash text-2xl mb-2"></i>
              <div class="text-sm">Caméra désactivée</div>
            </div>
          `)),c(i?"📹 Caméra désactivée":"🎥 Caméra activée","info")}),n&&e==="audio"&&n.addEventListener("click",()=>{a=!a,n.classList.toggle("bg-green-500",a),n.classList.toggle("bg-gray-700",!a),c(a?"🔊 Haut-parleur activé":"🔇 Haut-parleur désactivé","info")}),s&&s.addEventListener("click",Ve)}function qe(){if(!v)return;v.status="connected",v.connectedTime=Date.now();const e=document.getElementById("callStatus");if(e&&(e.textContent=v.type==="video"?"📹 Appel vidéo connecté":"📞 Appel connecté"),v.type==="video"){const t=document.getElementById("remotePlaceholder");t&&(t.style.opacity="0.3"),Oe()}Ue(),c("✅ Appel connecté","success")}function Oe(){const e=document.getElementById("remoteVideo");if(e){const t=document.createElement("canvas");t.width=640,t.height=480;const r=t.getContext("2d");let n=0,s=0;const o=()=>{if(!v||v.status!=="connected")return;const i=r.createLinearGradient(0,0,t.width,t.height);i.addColorStop(0,`hsl(${n}, 50%, 20%)`),i.addColorStop(.5,`hsl(${(n+60)%360}, 50%, 30%)`),i.addColorStop(1,`hsl(${(n+120)%360}, 50%, 25%)`),r.fillStyle=i,r.fillRect(0,0,t.width,t.height),r.fillStyle="rgba(255, 255, 255, 0.8)",r.font="24px Arial",r.textAlign="center",r.fillText("Simulation vidéo distante",t.width/2,t.height/2-20),r.font="16px Arial",r.fillStyle="rgba(255, 255, 255, 0.6)",r.fillText(`${v.contact.name} en appel`,t.width/2,t.height/2+20);for(let a=0;a<3;a++){const l=t.width/2+Math.cos(s+a*2)*50,d=t.height/2+Math.sin(s+a*2)*30,h=10+Math.sin(s*2+a)*5;r.beginPath(),r.arc(l,d,h,0,Math.PI*2),r.fillStyle=`hsla(${(n+a*120)%360}, 70%, 60%, 0.7)`,r.fill()}n=(n+1)%360,s+=.05,requestAnimationFrame(o)};o();try{const i=t.captureStream(30);e.srcObject=i,console.log("✅ Vidéo distante simulée créée")}catch(i){console.error("❌ Erreur création vidéo simulée:",i)}}}function Pe(){const e=document.getElementById("visualizerCanvas");if(!e||!w)return;const t=e.getContext("2d"),r=new(window.AudioContext||window.webkitAudioContext),n=r.createAnalyser();r.createMediaStreamSource(w).connect(n),n.fftSize=256;const o=n.frequencyBinCount,i=new Uint8Array(o),a=()=>{if(!v||v.status!=="connected")return;requestAnimationFrame(a),n.getByteFrequencyData(i),t.fillStyle="rgb(17, 27, 33)",t.fillRect(0,0,e.width,e.height);const l=e.width/o*2.5;let d,h=0;for(let y=0;y<o;y++)d=i[y]/255*e.height*.8,t.fillStyle="rgb(37, 211, 102)",t.fillRect(h,e.height-d,l,d),h+=l+1};a()}function Ue(){const e=document.getElementById("callDuration");if(!e||!v)return;const t=()=>{if(!v||v.status!=="connected")return;const r=Math.floor((Date.now()-v.connectedTime)/1e3),n=Math.floor(r/60),s=r%60;e.textContent=`${n.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`};t(),v.timerInterval=setInterval(t,1e3)}async function Ve(){if(!v)return;const e=v.status==="connected",t=e&&v.connectedTime?Math.floor((Date.now()-v.connectedTime)/1e3):0;v.timerInterval&&clearInterval(v.timerInterval),T&&(T.close(),T=null),w&&(w.getTracks().forEach(n=>{n.stop(),console.log("🛑 Track arrêté:",n.kind,n.label)}),w=null),P&&(P.getTracks().forEach(n=>n.stop()),P=null);const r=document.getElementById("callInterface");if(r&&r.remove(),e&&await Fe(v.contact,v.type,t),t>0){const n=Math.floor(t/60),s=t%60;c(`📞 Appel terminé - ${n}:${s.toString().padStart(2,"0")}`,"info")}else c("📞 Appel annulé","info");v=null}async function Fe(e,t,r){try{const n=JSON.parse(localStorage.getItem("currentUser"));if(!n)return;const s={id:`call_${Date.now()}`,participants:[n.id,e.id],type:t,status:"ended",startTime:new Date(v.connectedTime).toISOString(),endTime:new Date().toISOString(),duration:r,initiator:n.id};if(await fetch("https://mon-serveur-cub8.onrender.com/calls",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}),window.sendMessage){const o=Math.floor(r/60),i=r%60,a=`${o}:${i.toString().padStart(2,"0")}`,l={id:Date.now(),senderId:n.id,receiverId:e.id,text:`${t==="video"?"📹 Appel vidéo":"📞 Appel vocal"} - ${a}`,sent:!0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),timestamp:new Date().toISOString(),type:"call",callType:t,duration:r,status:"sent"};await window.sendMessage(l)}}catch(n){console.error("Erreur enregistrement appel:",n)}}const pe="https://mon-serveur-cub8.onrender.com",ne=new Map;let z=null,W=null,_=null;function Re(e,t){W=e,_=t,z&&clearInterval(z),z=setInterval(ze,3e3),console.log("Synchronisation temps réel initialisée avec",pe)}async function ze(){try{const e=He();if(!e)return;const t=await fetch(`${pe}/chats`);if(!t.ok){console.error("Erreur API:",t.status);return}const r=await t.json();for(const n of r){if(n.id===e.id)continue;const s=n.messages||[],o=ne.get(n.id)||0;if(s.length>o){const i=s.slice(o);for(const a of i)a.receiverId===e.id&&a.senderId!==e.id&&W&&W(a);ne.set(n.id,s.length)}}if(_)for(const n of r)n.id!==e.id&&_(n.id,n.isOnline||!1)}catch(e){console.error("Erreur synchronisation temps réel:",e)}}function He(){const e=localStorage.getItem("currentUser");return e?JSON.parse(e):null}const K="https://mon-serveur-cub8.onrender.com";async function Z(e,t,r){try{console.log("📤 Envoi message:",{senderId:e,receiverId:t,message:r});const s=await(await fetch(`${K}/users`)).json(),o=s.find(d=>d.id===e),i=s.find(d=>d.id===t);if(!o||!i)throw console.error("Utilisateur non trouvé:",{sender:o,receiver:i}),new Error("Utilisateur non trouvé");await re(e,r);const a={...r,sent:!1};await re(t,a);const l={lastMessage:r.type==="text"?r.text:Je(r),time:r.time,lastMessageTime:r.timestamp};return await G(e,l),await G(t,{...l,unread:1}),console.log("✅ Message envoyé avec succès"),!0}catch(n){throw console.error("❌ Erreur envoi message:",n),n}}async function re(e,t){try{const r=await fetch(`${K}/chats/${e}`);if(!r.ok)throw console.error(`Chat ${e} non trouvé`),new Error(`Chat ${e} non trouvé`);const n=await r.json();if(n.messages=n.messages||[],n.messages.find(i=>i.id===t.id)){console.log(`Message ${t.id} existe déjà dans le chat ${e}`);return}if(n.messages.push(t),!(await fetch(`${K}/chats/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)})).ok)throw new Error("Erreur mise à jour chat");console.log(`✅ Message ajouté au chat ${e}`)}catch(r){throw console.error(`❌ Erreur ajout message au chat ${e}:`,r),r}}function Je(e){switch(e.type){case"image":return"📷 Photo";case"video":return"🎥 Vidéo";case"audio":return"🎵 Audio";case"voice":return"🎤 Message vocal";case"document":return`📎 ${e.fileName}`;default:return e.text}}function Ge(){console.log("Audio recorder configuré")}const F="https://mon-serveur-cub8.onrender.com";function We(e,t=null){const r=["men","women"],n=t||r[Math.floor(Math.random()*r.length)],s=Math.floor(Math.random()*99)+1;return`https://randomuser.me/api/portraits/${n}/${s}.jpg`}async function _e(e,t,r){try{if(!r&&!t)return c("❌ Veuillez remplir tous les champs","error"),null;if(!r)return c("❌ Le nom du contact est obligatoire","error"),null;if(!t)return c("❌ Le numéro de téléphone est obligatoire","error"),null;if(r.length<2)return c("❌ Le nom doit contenir au moins 2 caractères","error"),null;if(r.length>50)return c("❌ Le nom ne peut pas dépasser 50 caractères","error"),null;if(!/^\d+$/.test(t))return c("❌ Le numéro ne doit contenir que des chiffres","error"),null;if(t.length!==9)return c("❌ Le numéro doit contenir exactement 9 chiffres","error"),null;if(!t.startsWith("7"))return c("❌ Le numéro doit commencer par 7 (format sénégalais)","error"),null;const n=await fetch(`${F}/users`);if(!n.ok)return c("❌ Erreur de connexion au serveur","error"),null;const s=await n.json();let o=s.find(i=>i.phone===t);return o?o.id===e?(c("❌ Vous ne pouvez pas vous ajouter vous-même comme contact","error"),null):(await se(o),c(`✅ ${o.name} ajouté à vos contacts avec succès`,"success"),o):(o={id:(s.length+1).toString(),name:r,phone:t,avatar:We(r),status:"Hors ligne",isOnline:!1,lastSeen:new Date().toISOString(),bio:"Salut ! J'utilise WhatsApp.",walletBalance:0,totalEarnings:0,contacts:[],groups:[]},(await fetch(`${F}/users`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)})).ok?(await se(o),c(`✅ Nouveau contact ${r} créé et ajouté avec succès`,"success"),o):(c("❌ Erreur lors de la création du nouveau contact","error"),null))}catch(n){return console.error("Erreur ajout contact:",n),c("❌ Erreur de connexion. Vérifiez votre connexion internet.","error"),null}}async function se(e){try{if(!(await(await fetch(`${F}/chats`)).json()).find(s=>s.id===e.id)){const s={id:e.id,name:e.name,phone:e.phone,avatar:e.avatar,status:e.status,isOnline:e.isOnline,lastSeen:e.lastSeen,unread:0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),lastMessage:"",lastMessageTime:new Date().toISOString(),messages:[]};await fetch(`${F}/chats`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}),console.log("Chat créé pour:",e.name)}}catch(t){console.error("Erreur création chat:",t)}}function Ke(e){const t=document.createElement("div");t.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",t.innerHTML=`
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
          💡 Si ce numéro n'existe pas encore, un nouveau compte sera créé automatiquement.
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
  `;const r=t.querySelector("#closeModal"),n=t.querySelector("#cancelBtn"),s=t.querySelector("#addContactForm"),o=t.querySelector("#contactName"),i=t.querySelector("#contactPhone"),a=()=>{document.body.removeChild(t)};r.addEventListener("click",a),n.addEventListener("click",a),i.addEventListener("input",l=>{let d=l.target.value.replace(/[^0-9]/g,"");d.length>9&&(d=d.substring(0,9),c("⚠️ Maximum 9 chiffres autorisés","warning")),l.target.value=d}),o.addEventListener("input",l=>{let d=l.target.value;d.length>50&&(d=d.substring(0,50),c("⚠️ Maximum 50 caractères autorisés pour le nom","warning"),l.target.value=d)}),s.addEventListener("submit",async l=>{l.preventDefault();const d=o.value.trim(),h=i.value.trim(),y=JSON.parse(localStorage.getItem("currentUser"));if(!y){c("❌ Erreur: utilisateur non connecté","error");return}const u=t.querySelector("#addBtn");u.disabled=!0,u.innerHTML=`
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Ajout...
      </div>
    `;try{const f=await _e(y.id,h,d);f&&e&&e(f),a()}finally{u.disabled=!1,u.textContent="Ajouter"}}),document.body.appendChild(t),o.focus()}const S="https://mon-serveur-cub8.onrender.com";async function oe(e,t,r,n="",s=null){try{if(!r)return c(t==="text"?"❌ Veuillez saisir du texte pour votre story":"❌ Veuillez sélectionner une image pour votre story","error"),null;if(t==="text"){if(r.length<1)return c("❌ Votre story ne peut pas être vide","error"),null;if(r.length>200)return c("❌ Votre story ne peut pas dépasser 200 caractères","error"),null}if(n&&n.length>100)return c("❌ La légende ne peut pas dépasser 100 caractères","error"),null;const o=await fetch(`${S}/users/${e}`);if(!o.ok)return c("❌ Erreur lors de la récupération de vos informations","error"),null;const i=await o.json(),a={id:`story_${Date.now()}`,userId:e,userName:i.name,userAvatar:i.avatar,type:t,content:r,caption:n,backgroundColor:s,timestamp:new Date().toISOString(),expiresAt:new Date(Date.now()+24*60*60*1e3).toISOString(),views:[],likes:[],comments:[],isMonetized:!1,earnings:0},l=await fetch(`${S}/stories`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)});return l.ok?(c("✅ Story publiée avec succès ! 🎉","success"),await l.json()):(c("❌ Erreur lors de la publication de votre story","error"),null)}catch(o){return console.error("Erreur création story:",o),c("❌ Erreur de connexion. Vérifiez votre connexion internet.","error"),null}}async function Xe(){try{const t=await(await fetch(`${S}/stories`)).json(),r=new Date,n=t.filter(o=>new Date(o.expiresAt)>r),s=t.filter(o=>new Date(o.expiresAt)<=r);for(const o of s)await fetch(`${S}/stories/${o.id}`,{method:"DELETE"});return n}catch(e){return console.error("Erreur récupération stories:",e),[]}}async function ae(e,t){try{const n=await(await fetch(`${S}/stories/${e}`)).json();return n.views.includes(t)||(n.views.push(t),await fetch(`${S}/stories/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)})),n}catch(r){return console.error("Erreur vue story:",r),null}}async function Ze(e,t){try{console.log(`💖 Tentative de like story ${e} par user ${t}`);const r=await fetch(`${S}/stories/${e}`);if(!r.ok)throw new Error(`Erreur récupération story: ${r.status}`);const n=await r.json();console.log("📖 Story récupérée:",n);const s=n.likes.findIndex(i=>i.userId===t);s===-1?(n.likes.push({userId:t,timestamp:new Date().toISOString()}),console.log(`✅ Like ajouté ! Total: ${n.likes.length} likes`),c("❤️ Story likée !","success")):(n.likes.splice(s,1),console.log(`❌ Like retiré ! Total: ${n.likes.length} likes`),c("💔 Like retiré","info"));const o=await fetch(`${S}/stories/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)});if(!o.ok)throw new Error(`Erreur sauvegarde story: ${o.status}`);return console.log(`💾 Story sauvegardée avec ${n.likes.length} likes`),await Ye(n),n}catch(r){return console.error("❌ Erreur like story:",r),c("❌ Erreur lors du like. Réessayez.","error"),null}}async function Ye(e){try{console.log(`🔍 Vérification monétisation pour story ${e.id}`);const t=await fetch(`${S}/monetization`);if(!t.ok)throw new Error(`Erreur récupération monétisation: ${t.status}`);const r=await t.json(),{likesThreshold:n,timeWindow:s,rewardAmount:o}=r.settings,i=(Date.now()-new Date(e.timestamp).getTime())/(1e3*60*60);if(console.log(`📊 Story ${e.id}:`),console.log(`   - Likes: ${e.likes.length}/${n}`),console.log(`   - Âge: ${i.toFixed(1)}h/${s}h`),console.log(`   - Déjà monétisée: ${e.isMonetized}`),e.likes.length>=n&&i<=s&&!e.isMonetized){console.log("🎉 MONÉTISATION DÉCLENCHÉE !"),e.isMonetized=!0,e.earnings=o;const a=await fetch(`${S}/stories/${e.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!a.ok)throw new Error(`Erreur sauvegarde story monétisée: ${a.status}`);await et(e.userId,o)&&(await tt(e.userId,e.id,o),c(`🎉 FÉLICITATIONS ! ${e.userName} a gagné ${o} FCFA pour sa story !`,"success"),Qe(),console.log(`💰 ${e.userName} a gagné ${o} FCFA !`))}else console.log(`⏳ Pas encore de monétisation (${e.likes.length}/${n} likes)`)}catch(t){console.error("❌ Erreur vérification monétisation:",t)}}function Qe(){try{const e=new(window.AudioContext||window.webkitAudioContext),t=e.createOscillator(),r=e.createGain();t.connect(r),r.connect(e.destination),t.frequency.setValueAtTime(800,e.currentTime),t.frequency.setValueAtTime(1e3,e.currentTime+.1),t.frequency.setValueAtTime(1200,e.currentTime+.2),r.gain.setValueAtTime(.3,e.currentTime),r.gain.exponentialRampToValueAtTime(.01,e.currentTime+.3),t.start(e.currentTime),t.stop(e.currentTime+.3)}catch(e){console.log("Impossible de jouer le son de monétisation:",e)}}async function et(e,t){try{console.log(`💳 Crédit de ${t} FCFA pour user ${e}`);const r=await fetch(`${S}/users/${e}`);if(!r.ok)throw new Error(`Erreur récupération user: ${r.status}`);const n=await r.json(),s=n.walletBalance||0,o=n.totalEarnings||0;n.walletBalance=s+t,n.totalEarnings=o+t;const i=await fetch(`${S}/users/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)});if(!i.ok)throw new Error(`Erreur mise à jour user: ${i.status}`);console.log(`✅ Utilisateur ${n.name} crédité:`),console.log(`   - Ancien solde: ${s} FCFA`),console.log(`   - Nouveau solde: ${n.walletBalance} FCFA`),console.log(`   - Gains totaux: ${n.totalEarnings} FCFA`);const a=JSON.parse(localStorage.getItem("currentUser")||"{}");return a.id===e&&(a.walletBalance=n.walletBalance,a.totalEarnings=n.totalEarnings,localStorage.setItem("currentUser",JSON.stringify(a)),console.log("🔄 Utilisateur local mis à jour")),!0}catch(r){return console.error("❌ Erreur crédit utilisateur:",r),!1}}async function tt(e,t,r){try{const n=await fetch(`${S}/monetization`);if(!n.ok)throw new Error(`Erreur récupération monétisation: ${n.status}`);const s=await n.json(),o={id:`tx_${Date.now()}`,userId:e,storyId:t,amount:r,type:"story_reward",timestamp:new Date().toISOString()};s.transactions.push(o);const i=await fetch(`${S}/monetization`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(!i.ok)throw new Error(`Erreur sauvegarde transaction: ${i.status}`);console.log("📝 Transaction enregistrée:",o)}catch(n){console.error("❌ Erreur enregistrement transaction:",n)}}function nt(e){const t=document.createElement("div");t.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",t.innerHTML=`
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
  `,document.body.appendChild(t);let r="#25D366",n=null,s="text";const o=t.querySelector("#closeModal"),i=t.querySelector("#cancelBtn"),a=t.querySelector("#publishBtn"),l=t.querySelector("#textStoryBtn"),d=t.querySelector("#imageStoryBtn"),h=t.querySelector("#textStoryContent"),y=t.querySelector("#imageStoryContent"),u=t.querySelector("#storyImage"),f=t.querySelector("#selectImageBtn"),g=t.querySelector("#imagePreview"),p=t.querySelector("#previewImg"),C=t.querySelector("#storyText"),U=t.querySelector("#imageCaption"),B=t.querySelector("#textCounter"),O=t.querySelector("#captionCounter"),R=()=>document.body.removeChild(t);o.addEventListener("click",R),i.addEventListener("click",R),C.addEventListener("input",b=>{const x=b.target.value.length;B.textContent=`${x}/200 caractères`,x>200&&(b.target.value=b.target.value.substring(0,200),B.textContent="200/200 caractères",c("⚠️ Maximum 200 caractères autorisés","warning")),x>180?B.style.color="#ef4444":x>150?B.style.color="#f59e0b":B.style.color="#9ca3af"}),U.addEventListener("input",b=>{const x=b.target.value.length;O.textContent=`${x}/100 caractères`,x>100&&(b.target.value=b.target.value.substring(0,100),O.textContent="100/100 caractères",c("⚠️ Maximum 100 caractères autorisés pour la légende","warning")),x>80?O.style.color="#ef4444":x>60?O.style.color="#f59e0b":O.style.color="#9ca3af"}),l.addEventListener("click",()=>{s="text",l.classList.add("active","bg-green-600"),l.classList.remove("bg-gray-600"),d.classList.remove("active","bg-green-600"),d.classList.add("bg-gray-600"),h.classList.remove("hidden"),y.classList.add("hidden")}),d.addEventListener("click",()=>{s="image",d.classList.add("active","bg-green-600"),d.classList.remove("bg-gray-600"),l.classList.remove("active","bg-green-600"),l.classList.add("bg-gray-600"),y.classList.remove("hidden"),h.classList.add("hidden")}),t.querySelectorAll(".color-btn").forEach(b=>{b.addEventListener("click",()=>{t.querySelectorAll(".color-btn").forEach(x=>x.classList.remove("ring-2","ring-white")),b.classList.add("ring-2","ring-white"),r=b.dataset.color})}),f.addEventListener("click",()=>u.click()),u.addEventListener("change",b=>{const x=b.target.files[0];if(x){if(!x.type.startsWith("image/")){c("❌ Veuillez sélectionner un fichier image valide","error");return}if(x.size>5*1024*1024){c("❌ L'image ne doit pas dépasser 5MB","error");return}const M=new FileReader;M.onload=$e=>{n=$e.target.result,p.src=n,g.classList.remove("hidden"),f.classList.add("hidden"),c("✅ Image sélectionnée avec succès","success")},M.readAsDataURL(x)}}),a.addEventListener("click",async()=>{const b=JSON.parse(localStorage.getItem("currentUser"));if(!b){c("❌ Erreur: utilisateur non connecté","error");return}a.disabled=!0,a.innerHTML=`
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Publication...
      </div>
    `;try{let x=null;if(s==="text"){const M=C.value.trim();x=await oe(b.id,"text",M,"",r)}else{const M=U.value.trim();x=await oe(b.id,"image",n,M)}x&&e&&e(x),R()}finally{a.disabled=!1,a.textContent="Publier"}})}function rt(e,t=0){const r=document.createElement("div");r.className="fixed inset-0 bg-black z-50 flex items-center justify-center";let n=t,s=e[n];const o=JSON.parse(localStorage.getItem("currentUser"));r.innerHTML=`
    <div class="relative w-full h-full max-w-md mx-auto">
      <!-- Header -->
      <div class="absolute top-0 left-0 right-0 z-10 p-4">
        <div class="flex items-center justify-between text-white">
          <div class="flex items-center space-x-3">
            <img src="${s.userAvatar}" alt="${s.userName}" class="w-10 h-10 rounded-full">
            <div>
              <div class="font-medium">${s.userName}</div>
              <div class="text-sm text-gray-300">${ce(s.timestamp)}</div>
            </div>
          </div>
          <button id="closeViewer" class="text-white hover:text-gray-300">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <!-- Progress bars -->
        <div class="flex space-x-1 mt-4">
          ${e.map((f,g)=>`
            <div class="flex-1 h-1 bg-gray-600 rounded">
              <div class="progress-bar h-full bg-white rounded transition-all duration-300" style="width: ${g<n?"100%":"0%"}"></div>
            </div>
          `).join("")}
        </div>
      </div>
      
      <!-- Content -->
      <div id="storyContent" class="w-full h-full flex items-center justify-center">
        ${ie(s)}
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
            <button id="likeBtn" class="like-button flex items-center space-x-2 transition-all duration-200 transform hover:scale-110 ${s.likes.some(f=>f.userId===(o==null?void 0:o.id))?"text-red-500 scale-110":"text-white hover:text-red-300"}">
              <i class="fas fa-heart text-3xl drop-shadow-lg"></i>
              <span class="font-bold text-lg">${s.likes.length}</span>
            </button>
            <button class="flex items-center space-x-2 text-blue-400">
              <i class="fas fa-eye text-xl"></i>
              <span>${s.views.length}</span>
            </button>
          </div>
          
          <div class="flex items-center space-x-2">
            ${s.isMonetized?`
              <div class="bg-green-500 px-3 py-1 rounded-full text-sm animate-pulse flex items-center space-x-1">
                <i class="fas fa-coins text-yellow-300"></i>
                <span class="font-bold">${s.earnings} FCFA</span>
              </div>
            `:`
              <div class="bg-gray-700 px-3 py-1 rounded-full text-xs">
                ${s.likes.length}/3 ❤️
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `,document.body.appendChild(r),o&&ae(s.id,o.id),r.querySelector("#closeViewer").addEventListener("click",()=>{document.body.removeChild(r)}),r.querySelector("#likeBtn").addEventListener("click",async()=>{if(o){const f=r.querySelector("#likeBtn");f.style.transform="scale(1.5)",f.style.transition="transform 0.2s ease",i(f),setTimeout(()=>{f.style.transform="scale(1.1)"},200),console.log(`🔄 Clic sur like pour story ${s.id}`);const g=await Ze(s.id,o.id);g&&(s=g,e[n]=g,a(),l())}else c("❌ Connectez-vous pour liker les stories","error")});function i(f){for(let g=0;g<5;g++){const p=document.createElement("div");p.innerHTML="❤️",p.style.position="absolute",p.style.fontSize="20px",p.style.pointerEvents="none",p.style.zIndex="1000";const C=f.getBoundingClientRect();p.style.left=C.left+Math.random()*C.width+"px",p.style.top=C.top+"px",document.body.appendChild(p),p.animate([{transform:"translateY(0px) scale(1)",opacity:1},{transform:"translateY(-50px) scale(0.5)",opacity:0}],{duration:1e3,easing:"ease-out"}).onfinish=()=>p.remove()}}function a(){const f=r.querySelector("#likeBtn"),g=s.likes.some(p=>p.userId===(o==null?void 0:o.id));f.className=`like-button flex items-center space-x-2 transition-all duration-200 transform hover:scale-110 ${g?"text-red-500 scale-110":"text-white hover:text-red-300"}`,f.querySelector("span").textContent=s.likes.length,console.log(`💖 Bouton like mis à jour: ${s.likes.length} likes, isLiked: ${g}`)}function l(){const f=r.querySelector(".absolute.bottom-0 .flex.items-center.justify-between .flex.items-center.space-x-2");s.isMonetized?f.innerHTML=`
        <div class="bg-green-500 px-3 py-1 rounded-full text-sm animate-pulse flex items-center space-x-1">
          <i class="fas fa-coins text-yellow-300"></i>
          <span class="font-bold">${s.earnings} FCFA</span>
        </div>
      `:f.innerHTML=`
        <div class="bg-gray-700 px-3 py-1 rounded-full text-xs">
          ${s.likes.length}/3 ❤️
        </div>
      `}let d=setInterval(()=>{const f=r.querySelector(".progress-bar");let g=Number.parseFloat(f.style.width)||0;g+=.5,f.style.width=g+"%",g>=100&&h()},200);function h(){clearInterval(d),n<e.length-1?(n++,u()):document.body.removeChild(r)}function y(){clearInterval(d),n>0&&(n--,u())}function u(){s=e[n],r.querySelector("#storyContent").innerHTML=ie(s),r.querySelectorAll(".progress-bar").forEach((g,p)=>{p<n?g.style.width="100%":g.style.width="0%"});const f=r.querySelector(".flex.items-center.space-x-3");f.innerHTML=`
      <img src="${s.userAvatar}" alt="${s.userName}" class="w-10 h-10 rounded-full">
      <div>
        <div class="font-medium">${s.userName}</div>
        <div class="text-sm text-gray-300">${ce(s.timestamp)}</div>
      </div>
    `,a(),l(),d=setInterval(()=>{const g=r.querySelectorAll(".progress-bar")[n];let p=Number.parseFloat(g.style.width)||0;p+=.5,g.style.width=p+"%",p>=100&&h()},200),o&&ae(s.id,o.id)}r.querySelector("#nextStory").addEventListener("click",h),r.querySelector("#prevStory").addEventListener("click",y)}function ie(e){return e.type==="text"?`
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
    `:""}function ce(e){const t=new Date,r=new Date(e),n=Math.floor((t-r)/(1e3*60*60));return n<1?`il y a ${Math.floor((t-r)/6e4)}m`:`il y a ${n}h`}const A="https://mon-serveur-cub8.onrender.com";async function st(e,t,r,n){try{const s={id:`group_${Date.now()}`,name:e,description:t,avatar:"https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop",members:[n,...r],admins:[n],createdBy:n,createdAt:new Date().toISOString(),lastMessage:`${e} créé`,lastMessageTime:new Date().toISOString(),messages:[]},o=await fetch(`${A}/groups`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(!o.ok)throw new Error("Erreur création groupe");for(const i of s.members)try{const l=await(await fetch(`${A}/users/${i}`)).json();l.groups=l.groups||[],l.groups.includes(s.id)||(l.groups.push(s.id),await fetch(`${A}/users/${i}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(l)}))}catch(a){console.error(`Erreur ajout groupe à l'utilisateur ${i}:`,a)}return c("Groupe créé avec succès","success"),await o.json()}catch(s){return console.error("Erreur création groupe:",s),c("Erreur lors de la création du groupe","error"),null}}function ot(e){const t=document.createElement("div");t.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",t.innerHTML=`
    <div class="bg-[#222e35] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-white">Créer un groupe</h2>
        <button id="closeModal" class="text-gray-400 hover:text-white">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="createGroupForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Nom du groupe
          </label>
          <input 
            type="text" 
            id="groupName"
            placeholder="Ex: Équipe projet"
            class="w-full px-4 py-3 bg-[#2a3942] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Description (optionnel)
          </label>
          <textarea 
            id="groupDescription"
            placeholder="Description du groupe..."
            class="w-full px-4 py-3 bg-[#2a3942] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            rows="3"
          ></textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Sélectionner les membres
          </label>
          <div id="contactsList" class="space-y-2 max-h-48 overflow-y-auto bg-[#2a3942] rounded-lg p-3">
            <!-- Les contacts seront chargés ici -->
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
            type="submit"
            id="createBtn"
            class="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Créer
          </button>
        </div>
      </form>
    </div>
  `,document.body.appendChild(t),i();const r=t.querySelector("#closeModal"),n=t.querySelector("#cancelBtn"),s=t.querySelector("#createGroupForm"),o=()=>document.body.removeChild(t);r.addEventListener("click",o),n.addEventListener("click",o),s.addEventListener("submit",async a=>{a.preventDefault();const l=t.querySelector("#groupName").value.trim(),d=t.querySelector("#groupDescription").value.trim();if(!l){c("Veuillez saisir un nom de groupe","error");return}const h=Array.from(t.querySelectorAll('input[type="checkbox"]:checked')).map(f=>f.value);if(h.length===0){c("Veuillez sélectionner au moins un membre","error");return}const y=JSON.parse(localStorage.getItem("currentUser"));if(!y)return;const u=t.querySelector("#createBtn");u.disabled=!0,u.textContent="Création...";try{const f=await st(l,d,h,y.id);f&&e&&e(f),o()}finally{u.disabled=!1,u.textContent="Créer"}});async function i(){try{const a=JSON.parse(localStorage.getItem("currentUser"));if(!a)return;const h=(await(await fetch(`${A}/users`)).json()).filter(u=>u.id!==a.id&&a.contacts&&a.contacts.includes(u.id)),y=t.querySelector("#contactsList");if(h.length===0){y.innerHTML=`
          <div class="text-gray-400 text-center py-4">
            Aucun contact disponible
          </div>
        `;return}y.innerHTML=h.map(u=>`
        <label class="flex items-center space-x-3 p-2 hover:bg-[#374151] rounded cursor-pointer">
          <input type="checkbox" value="${u.id}" class="text-green-500 focus:ring-green-500">
          <img src="${u.avatar}" alt="${u.name}" class="w-8 h-8 rounded-full">
          <div class="flex-1">
            <div class="text-white font-medium">${u.name}</div>
            <div class="text-gray-400 text-sm">${u.phone}</div>
          </div>
        </label>
      `).join("")}catch(a){console.error("Erreur chargement contacts:",a)}}}async function at(e){try{const r=await(await fetch(`${A}/users/${e}`)).json();return!r.groups||r.groups.length===0?[]:(await(await fetch(`${A}/groups`)).json()).filter(o=>r.groups.includes(o.id))}catch(t){return console.error("Erreur récupération groupes:",t),[]}}const V="https://mon-serveur-cub8.onrender.com";async function he(){try{console.log("🧹 Nettoyage des chats dupliqués...");const t=await(await fetch(`${V}/chats`)).json(),n=await(await fetch(`${V}/users`)).json(),s={},o=[],i=[];t.forEach(a=>{const l=a.name;s[l]||(s[l]=[]),s[l].push(a)});for(const[a,l]of Object.entries(s))if(l.length>1){console.log(`🔍 Doublons trouvés pour ${a}:`,l.length);const d=n.find(u=>u.name===a);if(!d)continue;const h=l.find(u=>u.id===d.id),y=l.filter(u=>u.id!==d.id);if(h){const u=[];l.forEach(p=>{p.messages&&p.messages.length>0&&u.push(...p.messages)});const f=u.filter((p,C,U)=>C===U.findIndex(B=>B.id===p.id));f.sort((p,C)=>new Date(p.timestamp)-new Date(C.timestamp));const g={...h,name:d.name,phone:d.phone,avatar:d.avatar,status:d.status,isOnline:d.isOnline,lastSeen:d.lastSeen,messages:f,lastMessage:f.length>0?f[f.length-1].type==="text"?f[f.length-1].text:it(f[f.length-1]):"",lastMessageTime:f.length>0?f[f.length-1].timestamp:new Date().toISOString()};i.push(g),y.forEach(p=>{o.push(p.id)})}else{const u=l[0],f={...u,id:d.id,name:d.name,phone:d.phone,avatar:d.avatar,status:d.status,isOnline:d.isOnline,lastSeen:d.lastSeen};i.push(f),o.push(u.id),l.slice(1).forEach(g=>{o.push(g.id)})}}for(const a of o)try{await fetch(`${V}/chats/${a}`,{method:"DELETE"}),console.log(`🗑️ Chat ${a} supprimé`)}catch(l){console.error(`Erreur suppression chat ${a}:`,l)}for(const a of i)try{await fetch(`${V}/chats/${a.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}),console.log(`✅ Chat ${a.name} mis à jour`)}catch(l){console.error(`Erreur mise à jour chat ${a.name}:`,l)}return console.log(`🧹 Nettoyage terminé: ${o.length} chats supprimés, ${i.length} chats mis à jour`),{deleted:o.length,updated:i.length}}catch(e){throw console.error("❌ Erreur nettoyage chats:",e),e}}function it(e){switch(e.type){case"image":return"📷 Photo";case"video":return"🎥 Vidéo";case"audio":return"🎵 Audio";case"voice":return"🎤 Message vocal";case"document":return`📎 ${e.fileName}`;default:return e.text}}let L=[],m=null,E="chats",H=!1,j=!1;window.currentChat=null;document.addEventListener("DOMContentLoaded",()=>{console.log("Application démarrée"),ct()});async function ct(){const e=document.getElementById("mainContainer"),t=document.getElementById("loginContainer"),r=$();r?(console.log("Utilisateur connecté:",r.name),s()):(console.log("Aucun utilisateur connecté"),n());function n(){e.style.display="none",t.style.display="block",t.innerHTML="";const o=Me(i=>{console.log("Connexion réussie pour:",i.name),s()});t.appendChild(o)}function s(){t.style.display="none",e.style.display="flex",lt()}}async function lt(){try{await he(),await D(),dt(),St(),ye(),Re(Vt,Ft),Rt(),Ge(),console.log("Interface principale initialisée")}catch(e){console.error("Erreur initialisation:",e),c("Erreur de chargement","error")}}async function D(){try{if(L=await ue(),E==="chats"&&k(),m){const e=await X(m.id);q(e)}}catch(e){console.error("Erreur chargement chats:",e),c("Impossible de charger les conversations","error")}}function dt(){const e=document.getElementById("userAvatarButton");e&&e.addEventListener("click",bt);const t=document.getElementById("backToChats");t&&t.addEventListener("click",ve);const r=document.getElementById("logoutButton");r&&r.addEventListener("click",ge);const n=document.getElementById("backButton");n&&n.addEventListener("click",Tt),Bt(),kt(),ut(),ft(),mt(),gt(),window.addEventListener("resize",qt),Le(),Ut()}function ut(){const e=document.getElementById("searchInput");e&&e.addEventListener("input",t=>{const r=t.target.value.toLowerCase().trim();yt(r)})}function ft(){const e=document.querySelectorAll(".filter-tab");e.forEach(t=>{t.addEventListener("click",()=>{e.forEach(n=>{n.classList.remove("active","bg-green-600","text-white"),n.classList.add("text-gray-400")}),t.classList.add("active","bg-green-600","text-white"),t.classList.remove("text-gray-400");const r=t.dataset.filter;xt(r)})})}function mt(){const e=document.getElementById("voiceCallBtn"),t=document.getElementById("videoCallBtn");e&&e.addEventListener("click",async()=>{m&&await te(m,"audio")}),t&&t.addEventListener("click",async()=>{m&&await te(m,"video")})}function gt(){const e=document.getElementById("attachBtn"),t=document.getElementById("fileInput");e&&t&&(e.addEventListener("click",()=>{t.click()}),t.addEventListener("change",pt))}async function pt(e){const t=e.target.files[0];if(!(!t||!m))try{const r=await ht(t),n={id:Date.now(),text:t.name,sent:!0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),timestamp:new Date().toISOString(),type:vt(t.type),fileData:r,fileName:t.name,fileSize:t.size,status:"sent"};await we(n),e.target.value=""}catch(r){console.error("Erreur upload fichier:",r),c("Erreur lors de l'envoi du fichier","error")}}function ht(e){return new Promise((t,r)=>{const n=new FileReader;n.readAsDataURL(e),n.onload=()=>t(n.result),n.onerror=s=>r(s)})}function vt(e){return e.startsWith("image/")?"image":e.startsWith("video/")?"video":e.startsWith("audio/")?"audio":"document"}function yt(e){document.querySelectorAll(".chat-item").forEach(r=>{var o,i;const n=((o=r.querySelector(".chat-name"))==null?void 0:o.textContent.toLowerCase())||"",s=((i=r.querySelector(".chat-message"))==null?void 0:i.textContent.toLowerCase())||"";n.includes(e)||s.includes(e)?r.style.display="block":r.style.display="none"})}function xt(e){const t=$();if(!t)return;let r=L.filter(n=>n.id!==t.id);switch(e){case"unread":r=r.filter(n=>n.unread>0);break;case"favorites":r=r.filter(n=>n.isFavorite);break;case"groups":r=r.filter(n=>n.isGroup);break}wt(r)}function wt(e){const t=document.getElementById("chatList");t&&(t.innerHTML="",e.forEach(r=>{const n=xe(r);t.appendChild(n)}))}function bt(){const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel"),r=document.getElementById("chatArea");e.style.display="none",r.style.display="none",t.style.display="flex",Et()}function ve(){const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel"),r=document.getElementById("chatArea");t.style.display="none",e.style.display="flex",m&&(r.style.display="flex")}function Et(){const e=$();if(e){const t=document.getElementById("profileImage"),r=document.getElementById("profileName");t&&(t.src=e.avatar,t.alt=e.name),r&&(r.textContent=e.name)}}function St(){const e=$(),t=document.querySelectorAll(".user-avatar img");e&&t.length>0&&t.forEach(r=>{r.src=e.avatar,r.alt=e.name})}function ye(){const e=document.getElementById("messagesArea");e&&(e.innerHTML=`
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
    `)}function k(){const e=document.getElementById("chatList");if(!e)return;const t=$();if(!t)return;console.log("🔍 Utilisateur actuel:",t.name,t.id),console.log("📋 Tous les chats:",L.map(n=>({id:n.id,name:n.name}))),e.innerHTML="";const r=L.filter(n=>n.id!==t.id);console.log("✅ Chats filtrés:",r.map(n=>({id:n.id,name:n.name}))),r.sort((n,s)=>{const o=new Date(n.lastMessageTime||n.time);return new Date(s.lastMessageTime||s.time)-o}),r.forEach(n=>{const s=xe(n);e.appendChild(s)})}function xe(e){const t=document.createElement("div");t.className="chat-item px-4 py-3 cursor-pointer hover:bg-[#202c33] transition-colors border-b border-gray-700",t.dataset.chatId=e.id;const r=e.unread>0,n=e.isOnline;return t.innerHTML=`
    <div class="flex items-center space-x-3">
      <div class="relative">
        <img src="${e.avatar}" alt="${e.name}" class="w-12 h-12 rounded-full object-cover">
        ${n?'<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#222e35]"></div>':""}
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
          <p class="chat-message text-sm ${r?"text-white font-medium":"text-gray-400"} truncate">${e.lastMessage}</p>
        </div>
      </div>
    </div>
  `,t.addEventListener("click",()=>$t(e.id)),t}async function $t(e){var t;ve(),m=L.find(r=>r.id===e),window.currentChat=m,m&&(m.unread>0&&(m.unread=0,await G(m.id,{unread:0})),document.querySelectorAll(".chat-item").forEach(r=>{r.classList.remove("bg-[#202c33]")}),(t=document.querySelector(`[data-chat-id="${e}"]`))==null||t.classList.add("bg-[#202c33]"),Q()&&(document.getElementById("sidebar").style.display="none"),document.getElementById("chatArea").style.display="flex",Ct(),await q(),Lt(),E==="chats"&&k())}function Ct(){const e=document.getElementById("chatHeader"),t=document.getElementById("chatAvatar"),r=document.getElementById("chatName"),n=document.getElementById("chatStatus");e&&m&&(e.style.display="flex",t.innerHTML=`<img src="${m.avatar}" alt="${m.name}" class="w-10 h-10 rounded-full object-cover">`,r.textContent=m.name,n.textContent=m.isOnline?"en ligne":m.status)}async function q(){const e=document.getElementById("messagesArea");if(!(!e||!m))try{const t=await X(m.id);m.messages=t,e.innerHTML="",t.forEach(r=>{const n=Y(r);e.appendChild(n)}),e.scrollTop=e.scrollHeight}catch(t){console.error("Erreur lors du rendu des messages:",t),c("Erreur lors du chargement des messages","error")}}function Y(e){const t=$(),r=e.senderId===t.id,n=document.createElement("div");n.className=`flex mb-4 ${r?"justify-end":"justify-start"}`,n.dataset.messageId=e.id;let s="";switch(e.type){case"image":s=`
        <img src="${e.fileData}" alt="${e.fileName}" class="max-w-xs rounded-lg mb-2 cursor-pointer" onclick="openImageModal('${e.fileData}')">
        <p class="text-sm">${e.text}</p>
      `;break;case"video":s=`
        <video src="${e.fileData}" controls class="max-w-xs rounded-lg mb-2">
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
        <p class="text-sm">${e.text}</p>
      `;break;case"audio":s=`
        <audio src="${e.fileData}" controls class="mb-2">
          Votre navigateur ne supporte pas la lecture audio.
        </audio>
        <p class="text-sm">${e.text}</p>
      `;break;case"document":s=`
        <div class="flex items-center space-x-2 mb-2 p-2 bg-gray-700 rounded">
          <i class="fas fa-file text-blue-400"></i>
          <div>
            <p class="text-sm font-medium">${e.fileName}</p>
            <p class="text-xs text-gray-400">${It(e.fileSize)}</p>
          </div>
        </div>
      `;break;case"voice":s=`
        <div class="voice-message flex items-center gap-3 p-3 min-w-[200px]">
          <button class="play-button w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-colors">
            <i class="fas fa-play text-sm"></i>
          </button>
          <div class="voice-content flex-1">
            <div class="voice-waveform flex items-center gap-1 h-6 mb-1">
              ${Array(25).fill().map((o,i)=>`
                <div class="waveform-bar bg-gray-400 rounded-full transition-all duration-200" 
                     style="width: 2px; height: ${Math.random()*16+4}px;"></div>
              `).join("")}
            </div>
            <div class="flex justify-between items-center">
              <span class="duration text-xs text-gray-300">0:05</span>
            </div>
          </div>
        </div>
      `,setTimeout(()=>{const o=document.querySelector(`[data-message-id="${e.id}"]`);if(o){let f=function(){if(!e.fileData)return console.error("Pas de données audio disponibles"),null;try{return u=new Audio,u.src=e.fileData,u.preload="metadata",u.onerror=g=>{console.error("Erreur chargement audio:",g),d.textContent="Erreur"},u.onloadedmetadata=()=>{u.duration&&!isNaN(u.duration)&&isFinite(u.duration)?d.textContent=Ot(u.duration):d.textContent="0:05"},u.onended=()=>{h=!1,a.innerHTML='<i class="fas fa-play text-sm"></i>',clearInterval(y),l.forEach(g=>{g.style.backgroundColor="#9ca3af"})},u.onpause=()=>{h=!1,a.innerHTML='<i class="fas fa-play text-sm"></i>',clearInterval(y)},u}catch(g){return console.error("Erreur création audio:",g),null}};var i=f;const a=o.querySelector(".play-button"),l=o.querySelectorAll(".waveform-bar"),d=o.querySelector(".duration");let h=!1,y=null,u=null;a.onclick=async()=>{try{if(!u&&(u=f(),!u)){c("Impossible de lire le message vocal","error");return}if(h)u.pause(),a.innerHTML='<i class="fas fa-play text-sm"></i>',clearInterval(y),l.forEach(g=>{g.style.backgroundColor="#9ca3af"}),h=!1;else try{await u.play(),a.innerHTML='<i class="fas fa-pause text-sm"></i>',h=!0,y=setInterval(()=>{l.forEach(g=>{const p=Math.random()*16+4;g.style.height=`${p}px`,g.style.backgroundColor="#10b981"})},100)}catch(g){console.error("Erreur lecture:",g),c("Erreur de lecture audio","error"),a.innerHTML='<i class="fas fa-play text-sm"></i>',h=!1}}catch(g){console.error("Erreur gestion lecture:",g),c("Erreur de lecture audio","error"),a.innerHTML='<i class="fas fa-play text-sm"></i>',h=!1}},f()}},100);break;default:s=`<p class="text-sm">${e.text}</p>`}return n.innerHTML=`
  <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${r?"bg-[#005c4b] text-white":"bg-[#202c33] text-white"} shadow-md">
    ${s}
    <div class="flex justify-end items-center mt-1 space-x-1">
      <span class="text-xs text-gray-300">${e.time}</span>
      ${r?`<i class="fas fa-check-double text-xs ${e.status==="read"?"text-blue-400":"text-gray-400"}"></i>`:""}
    </div>
  </div>
`,n}function It(e){if(e===0)return"0 Bytes";const t=1024,r=["Bytes","KB","MB","GB"],n=Math.floor(Math.log(e)/Math.log(t));return Number.parseFloat((e/Math.pow(t,n)).toFixed(2))+" "+r[n]}function Lt(){const e=document.getElementById("messageInput");e&&(e.style.display="flex")}function Bt(){const e=document.getElementById("messageText"),t=document.getElementById("sendButton"),r=document.getElementById("voiceBtn");if(!e||!t)return;async function n(){if(j){console.log("⚠️ Envoi déjà en cours, ignoré");return}const s=e.value.trim();if(!(!s||!m))try{j=!0;const o=$();if(!o)return;const i={id:Date.now(),senderId:o.id,receiverId:m.id,text:s,sent:!0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),timestamp:new Date().toISOString(),type:"text",status:"sent"};e.value="";const a=Y(i),l=document.getElementById("messagesArea");l&&(l.appendChild(a),l.scrollTop=l.scrollHeight),await Z(o.id,m.id,i),E==="chats"&&await D()}catch(o){console.error("Erreur envoi message:",o),c("Erreur lors de l'envoi","error")}finally{j=!1}}t.addEventListener("click",n),e.addEventListener("keypress",s=>{s.key==="Enter"&&!s.shiftKey&&(s.preventDefault(),n())}),r&&r.addEventListener("click",ee)}async function we(e){if(!(!m||j))try{j=!0;const t=$();if(!t)return;const r=Y(e),n=document.getElementById("messagesArea");n&&(n.appendChild(r),n.scrollTop=n.scrollHeight),await Z(t.id,m.id,e),E==="chats"&&await D()}catch(t){console.error("Erreur envoi message:",t),c("Erreur lors de l'envoi","error")}finally{j=!1}}function Tt(){Q()&&(document.getElementById("sidebar").style.display="flex",document.getElementById("chatArea").style.display="none"),m=null,window.currentChat=null,document.getElementById("chatHeader").style.display="none",document.getElementById("messageInput").style.display="none",ye()}function kt(){const e=document.querySelectorAll(".nav-item");e.forEach(t=>{t.addEventListener("click",async r=>{r.preventDefault(),r.stopPropagation();const n=t.dataset.view;if(console.log("🔄 Navigation vers:",n,"| Vue actuelle:",E),H){console.log("⚠️ Navigation en cours, ignoré");return}if(E===n){console.log("✅ Déjà sur cette vue:",n);return}H=!0;try{switch(E=n,console.log("📍 Vue mise à jour vers:",E),e.forEach(s=>s.classList.remove("active")),t.classList.add("active"),n){case"chats":await le();break;case"status":await Mt();break;case"communities":await At();break;case"settings":jt();break}console.log("✅ Navigation terminée vers:",n)}catch(s){console.error("❌ Erreur navigation:",s),E="chats",await le()}finally{setTimeout(()=>{H=!1,console.log("🔓 Navigation déverrouillée")},500)}})})}async function le(){console.log("📱 Affichage vue chats");const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel");t.style.display="none",e.style.display="flex",await D()}async function Mt(){console.log("📖 Affichage vue stories");const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel");t.style.display="none",e.style.display="flex",await be()}async function At(){console.log("👥 Affichage vue groupes");const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel");t.style.display="none",e.style.display="flex",await Ee()}function jt(){console.log("⚙️ Affichage vue paramètres");const e=document.getElementById("sidebar"),t=document.getElementById("profilePanel");t.style.display="none",e.style.display="flex",Nt()}async function be(){const e=document.getElementById("chatList"),t=$();if(!(!e||!t))try{const r=await Xe();e.innerHTML=`
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
          `:r.map(s=>`
            <div class="story-item p-3 hover:bg-[#202c33] rounded-lg cursor-pointer transition-colors" data-story-id="${s.id}">
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <img src="${s.userAvatar}" alt="${s.userName}" class="w-12 h-12 rounded-full object-cover">
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#222e35]"></div>
                </div>
                <div class="flex-1">
                  <div class="text-white font-medium">${s.userName}</div>
                  <div class="text-gray-400 text-sm">${Dt(s.timestamp)}</div>
                </div>
                <div class="text-right">
                  <div class="text-gray-400 text-xs">${s.views.length} vues</div>
                  ${s.isMonetized?`<div class="text-green-400 text-xs">💰 ${s.earnings} FCFA</div>`:""}
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;const n=document.getElementById("createStoryBtn");n&&n.addEventListener("click",()=>{nt(async s=>{E==="status"&&await be()})}),document.querySelectorAll(".story-item").forEach(s=>{s.addEventListener("click",()=>{const o=s.dataset.storyId,i=r.findIndex(a=>a.id===o);i!==-1&&rt(r,i)})})}catch(r){console.error("Erreur chargement stories:",r),e.innerHTML=`
      <div class="text-center py-8 text-red-400">
        <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
        <p>Erreur de chargement</p>
      </div>
    `}}async function Ee(){const e=document.getElementById("chatList"),t=$();if(!(!e||!t))try{const r=await at(t.id);e.innerHTML=`
      <div class="p-4">
        <button id="createGroupBtn" class="w-full p-4 bg-[#202c33] hover:bg-[#2a3942] rounded-lg flex items-center space-x-3 mb-4 transition-colors">
          <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <i class="fas fa-users text-white text-xl"></i>
          </div>
          <div class="text-left">
            <div class="text-white font-medium">Nouveau groupe</div>
            <div class="text-gray-400 text-sm">Créer un groupe</div>
          </div>
        </button>
        
        <div class="space-y-2">
          ${r.length===0?`
            <div class="text-center py-8 text-gray-400">
              <i class="fas fa-users text-4xl mb-4 opacity-30"></i>
              <p>Aucun groupe</p>
              <p class="text-sm">Créez votre premier groupe !</p>
            </div>
          `:r.map(s=>`
            <div class="group-item p-3 hover:bg-[#202c33] rounded-lg cursor-pointer transition-colors" data-group-id="${s.id}">
              <div class="flex items-center space-x-3">
                <img src="${s.avatar}" alt="${s.name}" class="w-12 h-12 rounded-full object-cover">
                <div class="flex-1">
                  <div class="text-white font-medium">${s.name}</div>
                  <div class="text-gray-400 text-sm">${s.members.length} membres</div>
                </div>
                <div class="text-right">
                  ${s.admins.includes(t.id)?'<div class="text-green-400 text-xs">Admin</div>':""}
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;const n=document.getElementById("createGroupBtn");n&&n.addEventListener("click",()=>{ot(async s=>{E==="communities"&&await Ee()})})}catch(r){console.error("Erreur chargement groupes:",r),e.innerHTML=`
      <div class="text-center py-8 text-red-400">
        <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
        <p>Erreur de chargement</p>
      </div>
    `}}function Nt(){const e=document.getElementById("chatList"),t=$();if(!e||!t)return;e.innerHTML=`
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
      
      <div class="bg-[#202c33] rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-white font-medium">💰 Portefeuille</h3>
          <div class="text-green-400 font-bold">${t.walletBalance||0} FCFA</div>
        </div>
        <div class="text-gray-400 text-sm">
          Gains totaux: ${t.totalEarnings||0} FCFA
        </div>
        <div class="text-xs text-gray-500 mt-2">
          Gagnez de l'argent avec vos stories populaires !
        </div>
      </div>
      
      <div class="space-y-2">
        <button id="addContactBtn" class="w-full p-3 bg-[#202c33] hover:bg-[#2a3942] rounded-lg flex items-center space-x-3 transition-colors">
          <i class="fas fa-user-plus text-green-400"></i>
          <span class="text-white">Ajouter un contact</span>
        </button>
        
        <button id="cleanChatsBtn" class="w-full p-3 bg-[#202c33] hover:bg-[#2a3942] rounded-lg flex items-center space-x-3 transition-colors">
          <i class="fas fa-broom text-yellow-400"></i>
          <span class="text-white">Nettoyer les doublons</span>
        </button>
        
        <button class="w-full p-3 bg-[#202c33] hover:bg-[#2a3942] rounded-lg flex items-center space-x-3 transition-colors">
          <i class="fas fa-bell text-blue-400"></i>
          <span class="text-white">Notifications</span>
        </button>
        
        <button class="w-full p-3 bg-[#202c33] hover:bg-[#2a3942] rounded-lg flex items-center space-x-3 transition-colors">
          <i class="fas fa-shield-alt text-purple-400"></i>
          <span class="text-white">Confidentialité</span>
        </button>
        
        <button id="logoutBtn" class="w-full p-3 bg-red-600 hover:bg-red-700 rounded-lg flex items-center space-x-3 transition-colors">
          <i class="fas fa-sign-out-alt text-white"></i>
          <span class="text-white">Se déconnecter</span>
        </button>
      </div>
    </div>
  `;const r=document.getElementById("addContactBtn");r&&r.addEventListener("click",()=>{Ke(async o=>{await D(),c(`${o.name} ajouté avec succès`,"success")})});const n=document.getElementById("cleanChatsBtn");n&&n.addEventListener("click",async()=>{try{c("Nettoyage en cours...","info");const o=await he();c(`Nettoyage terminé: ${o.deleted} supprimés, ${o.updated} mis à jour`,"success"),await D()}catch{c("Erreur lors du nettoyage","error")}});const s=document.getElementById("logoutBtn");s&&s.addEventListener("click",ge)}function Dt(e){const t=new Date,r=new Date(e),n=Math.floor((t-r)/(1e3*60*60));return n<1?`il y a ${Math.floor((t-r)/6e4)}m`:`il y a ${n}h`}function qt(){!Q()&&m&&(document.getElementById("sidebar").style.display="flex",document.getElementById("chatArea").style.display="flex")}function Q(){return window.innerWidth<768}let I=null,J=[];async function ee(){try{if(!m){c("Sélectionnez une conversation d'abord","error");return}const e=await navigator.mediaDevices.getUserMedia({audio:!0});I=new MediaRecorder(e),J=[],I.ondataavailable=r=>{J.push(r.data)},I.onstop=async()=>{const r=new Blob(J,{type:"audio/mp3"});await Pt(r,m),e.getTracks().forEach(n=>n.stop())},I.start(),c("Enregistrement en cours... Cliquez à nouveau pour arrêter","info");const t=document.getElementById("voiceBtn");t.innerHTML='<i class="fas fa-stop text-xl text-red-500"></i>',t.onclick=Se}catch(e){console.error("Erreur enregistrement vocal:",e),c("Impossible d'accéder au microphone","error")}}function Se(){if(I&&I.state==="recording"){I.stop();const e=document.getElementById("voiceBtn");e.innerHTML='<i class="fas fa-microphone text-xl"></i>',e.onclick=ee,c("Message vocal envoyé","success")}}function Ot(e){if(!e||!isFinite(e)||isNaN(e))return"0:05";const t=Math.floor(e/60),r=Math.floor(e%60);return`${t}:${r.toString().padStart(2,"0")}`}async function Pt(e,t){try{const r=$();if(!r||!t)return;const n=await new Promise(o=>{const i=new FileReader;i.onloadend=()=>o(i.result),i.readAsDataURL(e)}),s={id:Date.now(),senderId:r.id,receiverId:t.id,text:"Message vocal",sent:!0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),timestamp:new Date().toISOString(),type:"voice",fileData:n,status:"sent"};await we(s)}catch(r){console.error("Erreur envoi message vocal:",r),c("Erreur lors de l'envoi du message vocal","error")}}function Ut(){const e=document.getElementById("voiceBtn");e&&e.addEventListener("click",()=>{I&&I.state==="recording"?Se():ee()})}function Vt(e){var r;const t=$();if(t)try{if(e.senderId===t.id)return;const n=L.find(o=>o.id===e.senderId);if(!n||((r=n.messages)==null?void 0:r.find(o=>o.id===e.id)))return;n.messages=n.messages||[],n.messages.push(e),n.lastMessage=e.text,n.time=e.time,n.lastMessageTime=e.timestamp,(!m||m.id!==n.id)&&(n.unread=(n.unread||0)+1,de(n.name,e.text)),m&&m.id===e.senderId&&q(),E==="chats"&&k()}catch(n){console.error("Erreur lors du traitement du nouveau message:",n)}}function Ft(e,t){try{const r=L.find(n=>n.id===e);if(r&&(r.isOnline=t,r.status=t?"en ligne":"hors ligne",E==="chats"&&k(),m&&m.id===e)){const n=document.getElementById("chatStatus");n&&(n.textContent=r.status)}}catch(r){console.error("Erreur mise à jour statut:",r)}}function Rt(){window.refreshInterval&&clearInterval(window.refreshInterval),window.refreshInterval=setInterval(async()=>{try{if(E!=="chats")return;if(m){const t=await X(m.id);JSON.stringify(m.messages)!==JSON.stringify(t)&&(m.messages=t,q())}const e=await ue();JSON.stringify(L)!==JSON.stringify(e)&&(L=e,E==="chats"&&k())}catch(e){console.error("Erreur rafraîchissement:",e)}},2e3)}function zt(){q()}window.renderMessages=zt;window.renderChatList=k;window.sendVoiceMessage=async e=>{if(m)try{const t=$();if(!t)return;m.messages=m.messages||[],m.messages.push(e),m.lastMessage="🎤 Message vocal",m.time=e.time,m.lastMessageTime=e.timestamp,q(),E==="chats"&&k(),await Z(t.id,m.id,e)}catch(t){console.error("Erreur envoi message vocal:",t),c("Erreur lors de l'envoi du message vocal","error")}};
