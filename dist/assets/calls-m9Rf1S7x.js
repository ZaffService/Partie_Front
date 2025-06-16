let l=null,c=null,r=null;function v(e){if(l){o("Un appel est déjà en cours","error");return}console.log("📞 Initialisation appel audio avec:",e.name),d(e,"audio")}async function x(e){try{if(l){o("Un appel est déjà en cours","error");return}console.log("📹 Initialisation appel vidéo avec:",e.name),d(e,"video")}catch(t){console.error("Erreur appel vidéo:",t),o("Erreur: "+t.message,"error")}}async function d(e,t){if(l={contact:e,type:t,startTime:Date.now(),status:"calling"},t==="video")try{r=await navigator.mediaDevices.getUserMedia({video:!0,audio:!0})}catch(n){console.error("Erreur accès caméra:",n),o("Veuillez autoriser l'accès à la caméra","error"),l=null;return}u(e,t),c=setTimeout(()=>{l&&l.status==="calling"&&m()},3e3)}function u(e,t){const n=document.getElementById("callInterface");n&&n.remove();const a=document.createElement("div");if(a.id="callInterface",a.className="fixed inset-0 bg-gray-900 z-50",t==="video"?a.innerHTML=`
      <div class="w-full h-full relative">
        <!-- Vidéo principale -->
        <div class="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div class="text-center">
            <img src="${e.avatar}" alt="${e.name}" 
                 class="w-32 h-32 rounded-full mb-4 object-cover shadow-2xl mx-auto">
            <h2 class="text-3xl font-light mb-2 text-white">${e.name}</h2>
            <p id="callStatus" class="text-lg text-gray-300">📹 Appel vidéo en cours...</p>
          </div>
        </div>
        
        <!-- Votre vidéo -->
        <div class="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-white">
          <video id="localVideo" class="w-full h-full object-cover" autoplay muted playsinline></video>
        </div>
        
        <!-- Contrôles -->
        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-6">
          <button id="muteBtn" class="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center">
            <i class="fas fa-microphone text-xl text-white"></i>
          </button>
          <button id="cameraBtn" class="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center">
            <i class="fas fa-video text-xl text-white"></i>
          </button>
          <button id="hangupBtn" class="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center">
            <i class="fas fa-phone text-xl text-white transform rotate-135"></i>
          </button>
        </div>
        
        <!-- Durée -->
        <div id="callDuration" class="absolute top-4 left-4 bg-black bg-opacity-70 px-4 py-2 rounded-full text-white">
          00:00
        </div>
      </div>
    `:a.innerHTML=`
      <div class="w-full h-full flex items-center justify-center">
        <div class="text-center">
          <img src="${e.avatar}" alt="${e.name}" 
               class="w-40 h-40 rounded-full mb-6 object-cover shadow-2xl mx-auto">
          <h2 class="text-4xl font-light mb-4 text-white">${e.name}</h2>
          <p id="callStatus" class="text-xl text-gray-300 mb-8">📞 Appel en cours...</p>
          
          <div class="flex space-x-8 justify-center">
            <button id="muteBtn" class="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center">
              <i class="fas fa-microphone text-xl text-white"></i>
            </button>
            <button id="speakerBtn" class="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center">
              <i class="fas fa-volume-up text-xl text-white"></i>
            </button>
            <button id="hangupBtn" class="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center">
              <i class="fas fa-phone text-xl text-white transform rotate-135"></i>
            </button>
          </div>
          
          <div id="callDuration" class="mt-8 text-2xl text-gray-400">00:00</div>
        </div>
      </div>
    `,document.body.appendChild(a),t==="video"&&r){const i=document.getElementById("localVideo");i&&(i.srcObject=r)}f()}function f(){const e=document.getElementById("muteBtn"),t=document.getElementById("cameraBtn"),n=document.getElementById("speakerBtn"),a=document.getElementById("hangupBtn");let i=!1,s=!1;e&&e.addEventListener("click",()=>{i=!i,e.innerHTML=`<i class="fas fa-microphone${i?"-slash":""} text-xl text-white"></i>`,e.classList.toggle("bg-red-500",i),o(i?"🔇 Micro coupé":"🎤 Micro activé","info")}),t&&t.addEventListener("click",()=>{s=!s,t.innerHTML=`<i class="fas fa-video${s?"-slash":""} text-xl text-white"></i>`,t.classList.toggle("bg-red-500",s),o(s?"📹 Caméra désactivée":"📹 Caméra activée","info")}),n&&n.addEventListener("click",()=>{o("🔊 Haut-parleur","info")}),a&&a.addEventListener("click",g)}function m(){if(!l)return;l.status="connected",l.connectedTime=Date.now();const e=document.getElementById("callStatus");e&&(e.textContent=l.type==="video"?"📹 Appel vidéo connecté":"📞 Appel connecté"),p(),o("✅ Appel connecté","success")}function p(){const e=document.getElementById("callDuration");if(!e||!l)return;const t=()=>{if(!l||l.status!=="connected")return;const n=Math.floor((Date.now()-l.connectedTime)/1e3),a=Math.floor(n/60),i=n%60;e.textContent=`${a.toString().padStart(2,"0")}:${i.toString().padStart(2,"0")}`};t(),l.timerInterval=setInterval(t,1e3)}function g(){if(!l)return;const t=l.status==="connected"&&l.connectedTime?Math.floor((Date.now()-l.connectedTime)/1e3):0;c&&(clearTimeout(c),c=null),l.timerInterval&&clearInterval(l.timerInterval),r&&(r.getTracks().forEach(a=>a.stop()),r=null);const n=document.getElementById("callInterface");if(n&&n.remove(),t>0){const a=Math.floor(t/60),i=t%60;o(`📞 Appel terminé - ${a}:${i.toString().padStart(2,"0")}`,"info")}else o("📞 Appel annulé","info");l=null}function o(e,t){console.log(`[${t.toUpperCase()}] ${e}`);const n=document.createElement("div");n.className=`fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${t==="success"?"bg-green-500":t==="error"?"bg-red-500":"bg-blue-500"}`,n.textContent=e,document.body.appendChild(n),setTimeout(()=>{n.parentNode&&n.parentNode.removeChild(n)},3e3)}export{v as initializeAudioCall,x as startVideoCall};
