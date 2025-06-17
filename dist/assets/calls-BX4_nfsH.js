let l=null,v=null,i=null,m=null,c=null;const w={iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun1.l.google.com:19302"},{urls:"stun:stun2.l.google.com:19302"}]};function L(e){if(l){r("Un appel est déjà en cours","error");return}console.log("📞 Initialisation appel audio RÉEL avec:",e.name),b(e,"audio")}async function j(e){try{if(l){r("Un appel est déjà en cours","error");return}console.log("📹 Initialisation appel vidéo RÉEL avec:",e.name),b(e,"video")}catch(t){console.error("Erreur appel vidéo:",t),r("Erreur: "+t.message,"error")}}async function b(e,t){l={contact:e,type:t,startTime:Date.now(),status:"calling"};try{c=new RTCPeerConnection(w);const n={audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0},video:t==="video"?{width:{ideal:1280,max:1920},height:{ideal:720,max:1080},frameRate:{ideal:30},facingMode:"user"}:!1};console.log(" Demande d'accès aux périphériques..."),i=await navigator.mediaDevices.getUserMedia(n),console.log("✅ Stream local obtenu:",i.getTracks().length,"tracks"),i.getTracks().forEach(o=>{c.addTrack(o,i),console.log(" Track ajouté:",o.kind,o.label)}),c.ontrack=o=>{console.log(" Stream distant reçu:",o.streams[0]),m=o.streams[0];const d=document.getElementById("remoteVideo");if(d){d.srcObject=m,console.log(" Stream distant assigné");const a=document.getElementById("remotePlaceholder");a&&(a.style.display="none")}},c.onicecandidate=o=>{o.candidate&&console.log("🧊 ICE candidate:",o.candidate.type)},c.onconnectionstatechange=()=>{console.log("🔗 État connexion:",c.connectionState),c.connectionState==="connected"?(console.log("Connexion WebRTC établie"),l&&l.status==="calling"&&p()):c.connectionState==="failed"&&(console.log("❌ Connexion WebRTC échouée"),r("Connexion échouée","error"))},C(e,t),v=setTimeout(()=>{l&&l.status==="calling"&&p()},3e3)}catch(n){console.error("❌ Erreur initialisation appel:",n),n.name==="NotAllowedError"?r("Veuillez autoriser l'accès à la caméra/microphone","error"):n.name==="NotFoundError"?r("Aucun périphérique audio/vidéo détecté","error"):r("Erreur lors de l'initialisation de l'appel","error"),l=null}}function C(e,t){const n=document.getElementById("callInterface");n&&n.remove();const o=document.createElement("div");o.id="callInterface",o.className="fixed inset-0 bg-gray-900 z-50",t==="video"?o.innerHTML=`
      <div class="w-full h-full relative">
        <!-- Vidéo distante (plein écran) -->
        <video id="remoteVideo" 
               class="w-full h-full object-cover bg-gray-800" 
               autoplay 
               playsinline>
        </video>
        
        <!-- Placeholder en attendant la vidéo distante -->
        <div id="remotePlaceholder" class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div class="text-center">
            <img src="${e.avatar}" alt="${e.name}" 
                 class="w-32 h-32 rounded-full mb-4 object-cover shadow-2xl mx-auto">
            <h2 class="text-3xl font-light mb-2 text-white">${e.name}</h2>
            <p id="callStatus" class="text-lg text-gray-300">📹 Appel vidéo en cours...</p>
            <div class="mt-4">
              <div class="animate-pulse flex space-x-1 justify-center">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <div class="w-2 h-2 bg-green-500 rounded-full animation-delay-200"></div>
                <div class="w-2 h-2 bg-green-500 rounded-full animation-delay-400"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Votre vidéo locale RÉELLE -->
        <div class="absolute top-4 right-4 w-64 h-48 bg-black rounded-lg overflow-hidden border-4 border-white shadow-2xl">
          <video id="localVideo" 
                 class="w-full h-full object-cover" 
                 autoplay 
                 muted 
                 playsinline>
          </video>
          <div id="localPlaceholder" class="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
            <div class="text-center">
              <i class="fas fa-video text-2xl mb-2"></i>
              <div class="text-sm">Caméra en cours...</div>
            </div>
          </div>
        </div>
        
        <!-- Contrôles -->
        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-6">
          <button id="muteBtn" class="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
            <i class="fas fa-microphone text-xl text-white"></i>
          </button>
          <button id="cameraBtn" class="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
            <i class="fas fa-video text-xl text-white"></i>
          </button>
          <button id="hangupBtn" class="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
            <i class="fas fa-phone text-xl text-white transform rotate-135"></i>
          </button>
        </div>
        
        <!-- Durée -->
        <div id="callDuration" class="absolute top-4 left-4 bg-black bg-opacity-70 px-4 py-2 rounded-full text-white font-mono">
          00:00
        </div>
      </div>
    `:o.innerHTML=`
      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
        <div class="text-center">
          <img src="${e.avatar}" alt="${e.name}" 
               class="w-40 h-40 rounded-full mb-6 object-cover shadow-2xl mx-auto">
          <h2 class="text-4xl font-light mb-4 text-white">${e.name}</h2>
          <p id="callStatus" class="text-xl text-gray-300 mb-8">📞 Appel en cours...</p>
          
          <!-- Visualiseur audio RÉEL -->
          <div id="audioVisualizer" class="mb-8">
            <canvas id="visualizerCanvas" width="300" height="100" class="mx-auto rounded-lg"></canvas>
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
    `,document.body.appendChild(o),t==="video"&&E(),T(t),t==="audio"&&I()}function E(){const e=document.getElementById("localVideo"),t=document.getElementById("localPlaceholder");e&&i&&(console.log("🎥 Configuration vidéo locale RÉELLE..."),e.srcObject=i,e.onloadedmetadata=()=>{console.log("✅ Vidéo locale chargée:",e.videoWidth,"x",e.videoHeight),t&&(t.style.display="none")},e.onplay=()=>{console.log("▶️ Vidéo locale en lecture"),t&&(t.style.display="none")},e.onerror=n=>{console.error("❌ Erreur vidéo locale:",n),t&&(t.innerHTML=`
          <div class="text-center text-red-400">
            <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
            <div class="text-sm">Erreur caméra</div>
          </div>
        `)},e.play().catch(console.error))}function T(e){const t=document.getElementById("muteBtn"),n=document.getElementById("cameraBtn"),o=document.getElementById("speakerBtn"),d=document.getElementById("hangupBtn");let a=!1,s=!1;t&&t.addEventListener("click",()=>{a=!a,i&&i.getAudioTracks().forEach(u=>{u.enabled=!a,console.log(`🎤 Audio ${a?"coupé":"activé"}:`,u.label)}),t.innerHTML=`<i class="fas fa-microphone${a?"-slash":""} text-xl text-white"></i>`,t.classList.toggle("bg-red-500",a),t.classList.toggle("bg-gray-700",!a),r(a?" Micro coupé":"Micro activé","info")}),n&&e==="video"&&n.addEventListener("click",()=>{s=!s,i&&i.getVideoTracks().forEach(f=>{f.enabled=!s,console.log(` Vidéo ${s?"désactivée":"activée"}:`,f.label)}),n.innerHTML=`<i class="fas fa-video${s?"-slash":""} text-xl text-white"></i>`,n.classList.toggle("bg-red-500",s),n.classList.toggle("bg-gray-700",!s);const u=document.getElementById("localPlaceholder");u&&(u.style.display=s?"flex":"none",s&&(u.innerHTML=`
            <div class="text-center">
              <i class="fas fa-video-slash text-2xl mb-2"></i>
              <div class="text-sm">Caméra désactivée</div>
            </div>
          `)),r(s?"📹 Caméra désactivée":"📹 Caméra activée","info")}),o&&o.addEventListener("click",()=>{r(" Haut-parleur","info")}),d&&d.addEventListener("click",S)}function p(){if(!l)return;l.status="connected",l.connectedTime=Date.now();const e=document.getElementById("callStatus");e&&(e.textContent=l.type==="video"?"📹 Appel vidéo connecté":"📞 Appel connecté"),B(),r(" Appel connecté","success")}function B(){const e=document.getElementById("callDuration");if(!e||!l)return;const t=()=>{if(!l||l.status!=="connected")return;const n=Math.floor((Date.now()-l.connectedTime)/1e3),o=Math.floor(n/60),d=n%60;e.textContent=`${o.toString().padStart(2,"0")}:${d.toString().padStart(2,"0")}`};t(),l.timerInterval=setInterval(t,1e3)}function I(){const e=document.getElementById("visualizerCanvas");if(!e||!i)return;const t=e.getContext("2d"),n=new(window.AudioContext||window.webkitAudioContext),o=n.createAnalyser();n.createMediaStreamSource(i).connect(o),o.fftSize=256,o.smoothingTimeConstant=.8;const a=o.frequencyBinCount,s=new Uint8Array(a),u=()=>{if(!l||l.status!=="connected")return;requestAnimationFrame(u),o.getByteFrequencyData(s),t.fillStyle="rgb(17, 27, 33)",t.fillRect(0,0,e.width,e.height);const f=e.width/a*2.5;let h,x=0;for(let g=0;g<a;g++){h=s[g]/255*e.height*.8;const y=g/a*120+120;t.fillStyle=`hsl(${y}, 70%, 50%)`,t.fillRect(x,e.height-h,f,h),x+=f+1}};u()}function S(){if(!l)return;const t=l.status==="connected"&&l.connectedTime?Math.floor((Date.now()-l.connectedTime)/1e3):0;v&&(clearTimeout(v),v=null),l.timerInterval&&clearInterval(l.timerInterval),c&&(c.close(),c=null),i&&(i.getTracks().forEach(o=>{o.stop(),console.log("🛑 Track arrêté:",o.kind,o.label)}),i=null),m&&(m.getTracks().forEach(o=>o.stop()),m=null);const n=document.getElementById("callInterface");if(n&&n.remove(),t>0){const o=Math.floor(t/60),d=t%60;r(`📞 Appel terminé - ${o}:${d.toString().padStart(2,"0")}`,"info")}else r("📞 Appel annulé","info");l=null}function r(e,t){console.log(`[${t.toUpperCase()}] ${e}`);const n=document.createElement("div");n.className=`fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${t==="success"?"bg-green-500":t==="error"?"bg-red-500":"bg-blue-500"}`,n.textContent=e,document.body.appendChild(n),setTimeout(()=>{n.parentNode&&n.parentNode.removeChild(n)},3e3)}export{L as initializeAudioCall,j as startVideoCall};
