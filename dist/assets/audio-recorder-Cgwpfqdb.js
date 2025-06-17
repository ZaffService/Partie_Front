const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/groups-C2Hc1Rjt.js","assets/index-hxawXOcC.js","assets/index-DM3hezou.css"])))=>i.map(i=>d[i]);
import{_ as S}from"./index-hxawXOcC.js";let v=null,y=[],l=!1,E=null,p=null,m=null,b=null,w=null;async function H(){try{if(console.log(" Démarrage enregistrement vocal RÉEL..."),l)return console.log("Enregistrement déjà en cours"),!1;if(!window.currentChat&&!window.currentGroup)return i("Sélectionnez une conversation d'abord","error"),!1;const e=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0,sampleRate:44100}}),r={mimeType:"audio/webm;codecs=opus",audioBitsPerSecond:128e3};return MediaRecorder.isTypeSupported(r.mimeType)||(r.mimeType="audio/webm"),v=new MediaRecorder(e,r),y=[],E=Date.now(),l=!0,C(e),v.ondataavailable=t=>{t.data.size>0&&y.push(t.data)},v.onstop=async()=>{if(console.log("🛑 Arrêt enregistrement"),D(),e.getTracks().forEach(n=>n.stop()),y.length===0){i("Erreur: aucune donnée audio","error"),x();return}const t=new Blob(y,{type:r.mimeType}),o=Math.round((Date.now()-E)/1e3);await _(t,o),l=!1,x()},v.start(100),T(!0),B(),i("🎤 Enregistrement en cours...","info"),!0}catch(e){return console.error("❌ Erreur enregistrement:",e),i("Erreur: "+e.message,"error"),l=!1,x(),!1}}function C(e){try{p=new(window.AudioContext||window.webkitAudioContext),m=p.createAnalyser(),b=p.createMediaStreamSource(e),m.fftSize=256,m.smoothingTimeConstant=.8,b.connect(m),I()}catch(r){console.error("Erreur setup analyseur audio:",r)}}function I(){if(!l||!m)return;const e=m.frequencyBinCount,r=new Uint8Array(e);m.getByteFrequencyData(r);let t=0;for(let n=0;n<e;n++)t+=r[n];const o=t/e;R(o,r),w=requestAnimationFrame(I)}function R(e,r){const t=document.getElementById("recordingInterface");if(!t)return;const o=t.querySelector(".waveform-container");if(!o)return;const n=o.querySelectorAll(".wave-bar");n.forEach((s,u)=>{const c=Math.floor(u/n.length*r.length),d=Math.max(4,r[c]/255*40);s.style.height=`${d}px`,s.style.backgroundColor=`hsl(${120+d*2}, 70%, 50%)`});const a=t.querySelector(".level-indicator");if(a){const s=Math.min(100,e/255*100);a.style.width=`${s}%`}}function B(){const e=document.getElementById("recordingInterface");e&&e.remove();const r=document.createElement("div");r.id="recordingInterface",r.className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-[#202c33] rounded-lg p-4 shadow-lg z-50",r.innerHTML=`
    <div class="flex items-center space-x-4">
      <!-- Bouton stop -->
      <button id="stopRecordingBtn" class="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center">
        <i class="fas fa-stop text-white text-lg"></i>
      </button>
      
      <!-- Ondes audio temps réel -->
      <div class="waveform-container flex items-center space-x-1 h-10">
        ${Array.from({length:20},()=>'<div class="wave-bar bg-green-500 rounded-full transition-all duration-100" style="width: 3px; height: 4px;"></div>').join("")}
      </div>
      
      <!-- Durée -->
      <div id="recordingDuration" class="text-white font-mono text-lg min-w-[60px]">0:00</div>
    </div>
    
    <!-- Niveau audio -->
    <div class="mt-2 bg-gray-700 rounded-full h-1 overflow-hidden">
      <div class="level-indicator bg-green-500 h-full transition-all duration-100" style="width: 0%"></div>
    </div>
    
    <div class="text-center mt-2 text-gray-400 text-sm">
      Enregistrement en cours...
    </div>
  `,document.body.appendChild(r),r.querySelector("#stopRecordingBtn").addEventListener("click",q),L()}function L(){const e=()=>{if(!l)return;const r=Math.floor((Date.now()-E)/1e3),t=Math.floor(r/60),o=r%60,n=document.getElementById("recordingDuration");n&&(n.textContent=`${t}:${o.toString().padStart(2,"0")}`),l&&setTimeout(e,1e3)};e()}function D(){w&&(cancelAnimationFrame(w),w=null),p&&p.state!=="closed"&&p.close(),p=null,m=null,b=null}function q(){if(v&&l){console.log("🛑 Arrêt de l'enregistrement..."),v.stop(),i(" Envoi du message vocal...","info");const e=document.getElementById("recordingInterface");e&&e.remove()}}async function _(e,r){try{const t=M(),o=window.currentChat,n=window.currentGroup;if(!t){i("Erreur: utilisateur non connecté","error");return}if(!o&&!n){i("Erreur: aucune conversation sélectionnée","error");return}console.log(" Envoi message vocal RÉEL...");const a=await G(e),s={id:`voice_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,senderId:t.id,senderName:t.name,receiverId:n?n.id:o.contactId,text:" Message vocal",sent:!0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),timestamp:new Date().toISOString(),type:"voice",fileData:a,duration:r,status:"sent",isRealTime:!0},u=k(s),c=document.getElementById("messagesArea");if(c&&(c.appendChild(u),c.scrollTop=c.scrollHeight),n){const{sendMessageToGroup:d}=await S(async()=>{const{sendMessageToGroup:f}=await import("./groups-C2Hc1Rjt.js");return{sendMessageToGroup:f}},__vite__mapDeps([0,1,2]));await d(t.id,n.id,s)}else{const{handleSendMessage:d}=await S(async()=>{const{handleSendMessage:f}=await import("./index-hxawXOcC.js").then(g=>g.c);return{handleSendMessage:f}},__vite__mapDeps([1,2]));await d(t.id,o.contactId,s)}await z(s,o||n),i(" Message vocal envoyé","success")}catch(t){console.error("❌ Erreur envoi message vocal:",t),i(" Erreur lors de l'envoi","error")}}function k(e){const r=M(),t=e.senderId===r.id,o=document.createElement("div");return o.className=`flex mb-4 ${t?"justify-end":"justify-start"}`,o.dataset.messageId=e.id,o.innerHTML=`
    <div class="max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${t?"bg-[#005c4b] text-white":"bg-[#202c33] text-white"} shadow-md">
      <div class="flex items-center space-x-3">
        ${t?"":`
          <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <img src="${e.senderAvatar||"/placeholder.svg?height=32&width=32"}" alt="Avatar" class="w-full h-full object-cover">
          </div>
        `}
        
        <button class="voice-play-btn w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all" 
                data-message-id="${e.id}" 
                data-audio-data="${e.fileData}">
          <i class="fas fa-play text-sm"></i>
        </button>
        
        <div class="flex-1 min-w-0">
          <!-- Ondes audio interactives avec progression RÉELLE -->
          <div class="voice-waveform flex items-center space-x-1 mb-1 cursor-pointer" data-message-id="${e.id}">
            ${Array.from({length:25},(n,a)=>`<div class="wave-bar bg-white bg-opacity-60 rounded-full transition-all duration-200" style="width: 2px; height: ${Math.random()*16+4}px;" data-index="${a}"></div>`).join("")}
          </div>
          
          <div class="flex items-center justify-between text-xs text-gray-300">
            <span class="voice-duration">${e.duration||0}s</span>
            <span class="voice-progress">0:00</span>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end items-center mt-1 space-x-1">
        <span class="text-xs text-gray-300">${e.time}</span>
        ${t?`<i class="fas fa-check-double text-xs ${e.status==="read"?"text-blue-400":"text-gray-400"}"></i>`:""}
      </div>
    </div>
  `,N(o,e),o}function N(e,r){const t=e.querySelector(".voice-play-btn"),o=e.querySelector(".voice-waveform");t&&t.addEventListener("click",()=>V(t,r)),o&&o.addEventListener("click",n=>{const a=o.getBoundingClientRect(),u=(n.clientX-a.left)/a.width;U(r.id,u)})}function V(e,r){const t=r.id,o=r.fileData;if(!o){i("Données audio manquantes","error");return}try{const n=document.querySelector(`[data-audio-id="${t}"]`);if(n){n.paused?(n.play(),h(e,!0)):(n.pause(),h(e,!1));return}const a=new Audio(o);a.dataset.audioId=t,a.style.display="none",document.body.appendChild(a);const s=e.querySelector("i"),u=e.closest(".max-w-xs, .max-w-md").querySelector(".voice-duration"),c=e.closest(".max-w-xs, .max-w-md").querySelector(".voice-progress"),d=e.closest(".max-w-xs, .max-w-md").querySelector(".voice-waveform");let f=!1;a.addEventListener("loadedmetadata",()=>{console.log("🎵 Audio RÉEL chargé, durée:",a.duration),u&&(u.textContent=`${Math.ceil(a.duration)}s`)}),a.addEventListener("timeupdate",()=>{if(a.duration){const g=a.currentTime/a.duration,O=Math.ceil(a.duration-a.currentTime);if(c){const $=Math.floor(a.currentTime/60),A=Math.floor(a.currentTime%60);c.textContent=`${$}:${A.toString().padStart(2,"0")}`}j(d,g)}}),a.addEventListener("ended",()=>{h(e,!1),P(d),c&&(c.textContent="0:00"),a.remove(),f=!1}),a.addEventListener("error",g=>{console.error("❌ Erreur lecture audio:",g),i("Erreur lecture audio","error"),h(e,!1),a.remove(),f=!1}),a.play().then(()=>{h(e,!0),f=!0}).catch(g=>{console.error("❌ Erreur démarrage audio:",g),i("Impossible de lire l'audio","error"),a.remove()})}catch(n){console.error("❌ Erreur création audio:",n),i("Erreur lecture message vocal","error")}}function h(e,r){const t=e.querySelector("i");t&&(t.className=`fas fa-${r?"pause":"play"} text-sm`)}function j(e,r){if(!e)return;const t=e.querySelectorAll(".wave-bar"),o=Math.floor(r*t.length);t.forEach((n,a)=>{a<=o?(n.style.backgroundColor="#00a884",n.style.opacity="1"):(n.style.backgroundColor="rgba(255, 255, 255, 0.6)",n.style.opacity="0.6")})}function P(e){if(!e)return;e.querySelectorAll(".wave-bar").forEach(t=>{t.style.backgroundColor="rgba(255, 255, 255, 0.6)",t.style.opacity="0.6"})}function U(e,r){const t=document.querySelector(`[data-audio-id="${e}"]`);t&&t.duration&&(t.currentTime=r*t.duration)}async function z(e,r){try{const t={type:"voice_message",messageId:e.id,senderId:e.senderId,senderName:e.senderName,chatId:r.id,timestamp:e.timestamp,duration:e.duration};console.log("📡 Notification temps réel envoyée:",t)}catch(t){console.error("❌ Erreur notification temps réel:",t)}}function T(e){const r=document.getElementById("voiceBtn");r&&(e?(r.innerHTML='<i class="fas fa-stop text-xl text-red-500"></i>',r.classList.add("recording")):(r.innerHTML='<i class="fas fa-microphone text-xl"></i>',r.classList.remove("recording")))}function x(){T(!1),l=!1}function G(e){return new Promise((r,t)=>{const o=new FileReader;o.onloadend=()=>r(o.result),o.onerror=t,o.readAsDataURL(e)})}function M(){const e=localStorage.getItem("currentUser");return e?JSON.parse(e):null}function i(e,r){console.log(`[${r.toUpperCase()}] ${e}`);const t=document.createElement("div");t.className=`fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${r==="success"?"bg-green-500":r==="error"?"bg-red-500":"bg-blue-500"}`,t.textContent=e,document.body.appendChild(t),setTimeout(()=>{t.parentNode&&t.parentNode.removeChild(t)},3e3)}export{H as startVoiceRecording,q as stopVoiceRecording};
