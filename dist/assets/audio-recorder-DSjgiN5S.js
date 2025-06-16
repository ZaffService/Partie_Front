const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/groups-QY9C0_t6.js","assets/index-DNAVy5x_.js","assets/index-BdqHdrjq.css"])))=>i.map(i=>d[i]);
import{_ as v}from"./index-DNAVy5x_.js";let c=null,m=[],d=!1,x=null;async function S(){try{if(console.log("🎤 Démarrage enregistrement vocal..."),d)return console.log("Enregistrement déjà en cours"),!1;if(!window.currentChat)return o("Sélectionnez une conversation d'abord","error"),!1;const t=await navigator.mediaDevices.getUserMedia({audio:!0});return c=new MediaRecorder(t),m=[],x=Date.now(),d=!0,c.ondataavailable=r=>{r.data.size>0&&m.push(r.data)},c.onstop=async()=>{if(console.log("Arrêt enregistrement"),t.getTracks().forEach(a=>a.stop()),m.length===0){o("Erreur: aucune donnée audio","error"),p();return}const r=new Blob(m,{type:"audio/webm"}),e=Math.round((Date.now()-x)/1e3);await E(r,e),d=!1,p()},c.start(),h(!0),o("🎤 Enregistrement en cours...","info"),!0}catch(t){return console.error("Erreur enregistrement:",t),o("Erreur: "+t.message,"error"),d=!1,p(),!1}}function T(){c&&d&&(console.log("Arrêt de l'enregistrement..."),c.stop(),o("📤 Envoi du message vocal...","info"))}function h(t){const r=document.getElementById("voiceBtn");r&&(t?(r.innerHTML='<i class="fas fa-stop text-xl text-red-500"></i>',r.classList.add("recording")):(r.innerHTML='<i class="fas fa-microphone text-xl"></i>',r.classList.remove("recording")))}function p(){h(!1),d=!1}async function E(t,r){try{const e=w(),a=window.currentChat,s=window.currentGroup;if(!e){o("Erreur: utilisateur non connecté","error");return}if(!a&&!s){o("Erreur: aucune conversation sélectionnée","error");return}console.log("📤 Envoi message vocal...");const i=await D(t),l={id:`voice_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,senderId:e.id,receiverId:s?s.id:a.contactId,text:"🎤 Message vocal",sent:!0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),timestamp:new Date().toISOString(),type:"voice",fileData:i,duration:r,status:"sent"},n=b(l),u=document.getElementById("messagesArea");if(u&&(u.appendChild(n),u.scrollTop=u.scrollHeight),s){const{sendMessageToGroup:f}=await v(async()=>{const{sendMessageToGroup:g}=await import("./groups-QY9C0_t6.js");return{sendMessageToGroup:g}},__vite__mapDeps([0,1,2]));await f(e.id,s.id,l)}else{const{handleSendMessage:f}=await v(async()=>{const{handleSendMessage:g}=await import("./index-DNAVy5x_.js").then(y=>y.c);return{handleSendMessage:g}},__vite__mapDeps([1,2]));await f(e.id,a.contactId,l)}o("✅ Message vocal envoyé","success")}catch(e){console.error("Erreur envoi message vocal:",e),o("❌ Erreur lors de l'envoi","error")}}function b(t){const r=w(),e=t.senderId===r.id,a=document.createElement("div");a.className=`flex mb-4 ${e?"justify-end":"justify-start"}`,a.dataset.messageId=t.id,a.innerHTML=`
    <div class="max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${e?"bg-[#005c4b] text-white":"bg-[#202c33] text-white"} shadow-md">
      <div class="flex items-center space-x-3">
        <!-- Avatar pour messages reçus -->
        ${e?"":`
          <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <img src="${r.avatar}" alt="Avatar" class="w-full h-full object-cover">
          </div>
        `}
        
        <!-- Bouton play/pause -->
        <button class="voice-play-btn w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all" 
                data-message-id="${t.id}" 
                data-audio-data="${t.fileData}">
          <i class="fas fa-play text-sm"></i>
        </button>
        
        <!-- Forme d'onde et durée -->
        <div class="flex-1 min-w-0">
          <!-- Forme d'onde stylisée -->
          <div class="flex items-center space-x-1 mb-1">
            ${Array.from({length:20},(i,l)=>`<div class="bg-white bg-opacity-60 rounded-full" style="width: 2px; height: ${Math.random()*16+4}px;"></div>`).join("")}
          </div>
          
          <!-- Durée -->
          <div class="text-xs text-gray-300">
            <span class="voice-duration">${t.duration||0}s</span>
          </div>
        </div>
      </div>
      
      <!-- Heure et statut -->
      <div class="flex justify-end items-center mt-1 space-x-1">
        <span class="text-xs text-gray-300">${t.time}</span>
        ${e?`<i class="fas fa-check-double text-xs ${t.status==="read"?"text-blue-400":"text-gray-400"}"></i>`:""}
      </div>
    </div>
  `;const s=a.querySelector(".voice-play-btn");return s&&s.addEventListener("click",()=>M(s)),a}function M(t){t.dataset.messageId;const r=t.dataset.audioData;if(!r){o("Données audio manquantes","error");return}try{const e=new Audio(r),a=t.querySelector("i"),s=t.closest(".max-w-xs, .max-w-md").querySelector(".voice-duration");let i=!1;const l=0;e.addEventListener("loadedmetadata",()=>{console.log("Audio chargé, durée:",e.duration)}),e.addEventListener("timeupdate",()=>{if(s&&e.duration){const n=Math.ceil(e.duration-e.currentTime);s.textContent=`${n}s`}}),e.addEventListener("ended",()=>{if(a.className="fas fa-play text-sm",s){const n=t.closest(".max-w-xs, .max-w-md").querySelector("[data-message-id]").closest("[data-message-id]");s.textContent=`${e.duration?Math.ceil(e.duration):0}s`}i=!1}),e.addEventListener("error",n=>{console.error("Erreur lecture audio:",n),o("Erreur lecture audio","error"),a.className="fas fa-play text-sm",i=!1}),i?(e.pause(),a.className="fas fa-play text-sm",i=!1):e.play().then(()=>{a.className="fas fa-pause text-sm",i=!0}).catch(n=>{console.error("Erreur démarrage audio:",n),o("Impossible de lire l'audio","error")})}catch(e){console.error("Erreur création audio:",e),o("Erreur lecture message vocal","error")}}function D(t){return new Promise((r,e)=>{const a=new FileReader;a.onloadend=()=>r(a.result),a.onerror=e,a.readAsDataURL(t)})}function w(){const t=localStorage.getItem("currentUser");return t?JSON.parse(t):null}function o(t,r){console.log(`[${r.toUpperCase()}] ${t}`);const e=document.createElement("div");e.className=`fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${r==="success"?"bg-green-500":r==="error"?"bg-red-500":"bg-blue-500"}`,e.textContent=t,document.body.appendChild(e),setTimeout(()=>{e.parentNode&&e.parentNode.removeChild(e)},3e3)}export{S as startVoiceRecording,T as stopVoiceRecording};
