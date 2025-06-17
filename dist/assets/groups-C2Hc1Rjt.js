import{s as l}from"./index-hxawXOcC.js";const u="https://mon-serveur-cub8.onrender.com";async function T(s){try{console.log("🔍 Récupération des groupes pour l'utilisateur:",s);const e=await fetch(`${u}/users/${s}`);if(!e.ok)throw new Error("Utilisateur non trouvé");const n=await e.json();if(console.log("👤 Utilisateur récupéré:",n),!n.groups||n.groups.length===0)return console.log("📭 Aucun groupe pour cet utilisateur"),[];const r=await fetch(`${u}/groups`);if(!r.ok)throw new Error("Erreur récupération groupes");const t=await r.json();console.log("📋 Tous les groupes:",t);const a=t.filter(o=>n.groups.includes(o.id));return console.log("✅ Groupes de l'utilisateur:",a),a}catch(e){return console.error("❌ Erreur récupération groupes utilisateur:",e),[]}}async function h(s,e,n,r){try{console.log("🆕 Création groupe:",{name:s,description:e,members:n,creatorId:r});const t={id:`group_${Date.now()}`,name:s,description:e,avatar:"https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop",members:[r,...n],admins:[r],createdBy:r,createdAt:new Date().toISOString(),lastMessage:`Groupe "${s}" créé`,lastMessageTime:new Date().toISOString(),messages:[{id:Date.now(),type:"system",text:`Groupe "${s}" créé par vous`,senderId:"system",timestamp:new Date().toISOString(),time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}]},a=await fetch(`${u}/groups`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)});if(!a.ok)throw new Error("Erreur création groupe");for(const o of t.members)try{const i=await fetch(`${u}/users/${o}`);if(i.ok){const c=await i.json();c.groups=c.groups||[],c.groups.includes(t.id)||(c.groups.push(t.id),await fetch(`${u}/users/${o}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)}))}}catch(i){console.error(`Erreur ajout groupe à l'utilisateur ${o}:`,i)}return console.log("✅ Groupe créé avec succès:",t.name),l("Groupe créé avec succès","success"),window.showSimpleGroups&&setTimeout(()=>{window.showSimpleGroups()},500),await a.json()}catch(t){return console.error("❌ Erreur création groupe:",t),l("Erreur lors de la création du groupe","error"),null}}async function L(s){try{console.log("📨 Récupération messages groupe:",s);const e=await fetch(`${u}/groups/${s}`);if(!e.ok)throw new Error("Groupe non trouvé");return(await e.json()).messages||[]}catch(e){return console.error("❌ Erreur récupération messages groupe:",e),[]}}async function b(s){try{console.log("👥 Récupération membres groupe:",s);const e=await fetch(`${u}/groups/${s}`);if(!e.ok)throw new Error("Groupe non trouvé");const n=await e.json(),r=await fetch(`${u}/users`);if(!r.ok)throw new Error("Erreur récupération utilisateurs");const a=(await r.json()).filter(o=>n.members.includes(o.id));return console.log("✅ Membres récupérés:",a.length),a}catch(e){return console.error("❌ Erreur récupération membres:",e),[]}}async function U(s,e,n){try{console.log("📤 === DÉBUT ENVOI MESSAGE GROUPE ==="),console.log("Expéditeur:",s),console.log("Groupe:",e),console.log("Message:",n.text);const r=await fetch(`${u}/groups/${e}`);if(!r.ok)throw new Error("Groupe non trouvé");const t=await r.json();console.log("📋 Groupe récupéré:",t.name,"Membres:",t.members);const a=await fetch(`${u}/users/${s}`);if(!a.ok)throw new Error("Utilisateur non trouvé");const o=await a.json();console.log("👤 Expéditeur:",o.name);const i={...n,senderName:o.name,groupId:e,groupName:t.name};if(t.messages=t.messages||[],t.messages.push(i),t.lastMessage=n.type==="text"?n.text:E(n),t.lastMessageTime=n.timestamp,!(await fetch(`${u}/groups/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)})).ok)throw new Error("Erreur mise à jour groupe");return console.log("✅ Message ajouté au groupe"),console.log("📨 Début distribution aux membres..."),await y(t,i,s,o),console.log("✅ === FIN ENVOI MESSAGE GROUPE ==="),i}catch(r){throw console.error("❌ Erreur envoi message groupe:",r),r}}async function y(s,e,n,r){try{console.log("📨 === DÉBUT DISTRIBUTION MESSAGES GROUPE ==="),console.log("Groupe:",s.name),console.log("Membres:",s.members),console.log("Message:",e.text),console.log("Expéditeur:",r.name);const t=await fetch(`${u}/chats`);if(!t.ok){console.error("❌ Erreur récupération chats");return}const a=await t.json();for(const o of s.members){if(o===n){console.log(`⏭️ Ignorer expéditeur ${o}`);continue}try{console.log(`
📤 Distribution vers membre ${o}`);let i=a.find(g=>g.ownerId===o&&g.contactId===n);if(!i){if(console.log(`📝 Création nouveau chat pour membre ${o}`),i={id:`${o}_${n}_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,ownerId:o,contactId:n,name:r.name,phone:r.phone,avatar:r.avatar,status:r.status||"Hors ligne",isOnline:r.isOnline||!1,lastSeen:r.lastSeen||new Date().toISOString(),unread:0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),lastMessage:"",lastMessageTime:new Date().toISOString(),messages:[]},!(await fetch(`${u}/chats`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)})).ok){console.error(`❌ Erreur création chat pour membre ${o}`);continue}console.log(`✅ Chat créé pour membre ${o}`)}const c={...e,id:`${Date.now()}_${Math.random().toString(36).substr(2,9)}`,text:`[${s.name}] ${r.name}: ${e.text}`,sent:!1,isGroupMessage:!0,originalGroupId:s.id,originalGroupName:s.name,originalSender:r.name};i.messages=i.messages||[],i.messages.push(c),i.lastMessage=c.text,i.lastMessageTime=c.timestamp,i.unread=(i.unread||0)+1,(await fetch(`${u}/chats/${i.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)})).ok?console.log(`✅ Message distribué à membre ${o}`):console.error(`❌ Erreur mise à jour chat membre ${o}`)}catch(i){console.error(`❌ Erreur distribution membre ${o}:`,i)}}console.log("✅ === FIN DISTRIBUTION MESSAGES GROUPE ===")}catch(t){console.error("❌ Erreur distribution générale:",t)}}async function x(s,e,n){try{console.log("➕ Ajout membre au groupe:",{groupId:s,userId:e,adminId:n});const r=await fetch(`${u}/groups/${s}`);if(!r.ok)throw new Error("Groupe non trouvé");const t=await r.json();if(!t.admins.includes(n))return l("Seuls les administrateurs peuvent ajouter des membres","error"),!1;if(t.members.includes(e))return l("Ce membre fait déjà partie du groupe","warning"),!1;const a=await fetch(`${u}/users/${e}`);if(!a.ok)return l("Utilisateur non trouvé","error"),!1;const o=await a.json();t.members.push(e);const i={id:Date.now(),type:"system",text:`${o.name} a rejoint le groupe`,senderId:"system",timestamp:new Date().toISOString(),time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})};return t.messages=t.messages||[],t.messages.push(i),t.lastMessage=i.text,t.lastMessageTime=i.timestamp,await fetch(`${u}/groups/${s}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),o.groups=o.groups||[],o.groups.includes(s)||(o.groups.push(s),await fetch(`${u}/users/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)})),console.log("✅ Membre ajouté au groupe"),l(`${o.name} ajouté au groupe`,"success"),!0}catch(r){return console.error("❌ Erreur ajout membre:",r),l("Erreur lors de l'ajout du membre","error"),!1}}async function G(s,e,n){try{console.log("➖ Suppression membre du groupe:",{groupId:s,userId:e,adminId:n});const r=await fetch(`${u}/groups/${s}`);if(!r.ok)throw new Error("Groupe non trouvé");const t=await r.json();if(!t.admins.includes(n))return l("Seuls les administrateurs peuvent supprimer des membres","error"),!1;if(!t.members.includes(e))return l("Ce membre ne fait pas partie du groupe","warning"),!1;if(e===t.createdBy)return l("Impossible de supprimer le créateur du groupe","error"),!1;const a=await fetch(`${u}/users/${e}`);if(!a.ok)return l("Utilisateur non trouvé","error"),!1;const o=await a.json();t.members=t.members.filter(c=>c!==e),t.admins.includes(e)&&(t.admins=t.admins.filter(c=>c!==e));const i={id:Date.now(),type:"system",text:`${o.name} a quitté le groupe`,senderId:"system",timestamp:new Date().toISOString(),time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})};return t.messages=t.messages||[],t.messages.push(i),t.lastMessage=i.text,t.lastMessageTime=i.timestamp,await fetch(`${u}/groups/${s}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),o.groups=o.groups?o.groups.filter(c=>c!==s):[],await fetch(`${u}/users/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)}),console.log("✅ Membre supprimé du groupe"),l(`${o.name} supprimé du groupe`,"success"),!0}catch(r){return console.error("❌ Erreur suppression membre:",r),l("Erreur lors de la suppression du membre","error"),!1}}async function k(s,e,n){try{console.log("👑 Promotion admin:",{groupId:s,userId:e,adminId:n});const r=await fetch(`${u}/groups/${s}`);if(!r.ok)throw new Error("Groupe non trouvé");const t=await r.json();if(!t.admins.includes(n))return l("Seuls les administrateurs peuvent promouvoir","error"),!1;if(!t.members.includes(e))return l("L'utilisateur n'est pas membre du groupe","error"),!1;if(t.admins.includes(e))return l("L'utilisateur est déjà administrateur","warning"),!1;const a=await fetch(`${u}/users/${e}`);if(!a.ok)return l("Utilisateur non trouvé","error"),!1;const o=await a.json();t.admins.push(e);const i={id:Date.now(),type:"system",text:`${o.name} a été promu administrateur`,senderId:"system",timestamp:new Date().toISOString(),time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})};return t.messages=t.messages||[],t.messages.push(i),t.lastMessage=i.text,t.lastMessageTime=i.timestamp,await fetch(`${u}/groups/${s}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),console.log("✅ Utilisateur promu administrateur"),l(`${o.name} promu administrateur`,"success"),!0}catch(r){return console.error("❌ Erreur promotion admin:",r),l("Erreur lors de la promotion","error"),!1}}function C(s){const e=document.createElement("div");e.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",e.innerHTML=`
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
            maxlength="50"
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
            maxlength="200"
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
        
        <div class="text-xs text-gray-500 bg-[#2a3942] p-3 rounded-lg">
          <i class="fas fa-info-circle mr-2"></i>
          Vous serez automatiquement administrateur du groupe.
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
  `,document.body.appendChild(e),o();const n=e.querySelector("#closeModal"),r=e.querySelector("#cancelBtn"),t=e.querySelector("#createGroupForm"),a=()=>document.body.removeChild(e);n.addEventListener("click",a),r.addEventListener("click",a),t.addEventListener("submit",async i=>{i.preventDefault();const c=e.querySelector("#groupName").value.trim(),p=e.querySelector("#groupDescription").value.trim();if(!c){l("Veuillez saisir un nom de groupe","error");return}const g=Array.from(e.querySelectorAll('input[type="checkbox"]:checked')).map(d=>d.value);if(g.length===0){l("Veuillez sélectionner au moins un membre","error");return}const f=JSON.parse(localStorage.getItem("currentUser"));if(!f){l("Erreur: utilisateur non connecté","error");return}const m=e.querySelector("#createBtn");m.disabled=!0,m.innerHTML=`
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Création...
      </div>
    `;try{const d=await h(c,p,g,f.id);d&&s&&s(d),a()}catch(d){console.error("Erreur création groupe:",d),l("Erreur lors de la création du groupe","error")}finally{m.disabled=!1,m.textContent="Créer"}});async function o(){try{const i=JSON.parse(localStorage.getItem("currentUser"));if(!i)return;const c=await fetch(`${u}/users`);if(!c.ok)throw new Error("Erreur récupération utilisateurs");const g=(await c.json()).filter(m=>m.id!==i.id),f=e.querySelector("#contactsList");if(g.length===0){f.innerHTML=`
          <div class="text-gray-400 text-center py-4">
            Aucun contact disponible
          </div>
        `;return}f.innerHTML=g.map(m=>`
        <label class="flex items-center space-x-3 p-2 hover:bg-[#374151] rounded cursor-pointer">
          <input type="checkbox" value="${m.id}" class="text-green-500 focus:ring-green-500">
          <img src="${m.avatar}" alt="${m.name}" class="w-8 h-8 rounded-full">
          <div class="flex-1">
            <div class="text-white font-medium">${m.name}</div>
            <div class="text-gray-400 text-sm">${m.phone}</div>
          </div>
        </label>
      `).join("")}catch(i){console.error("Erreur chargement contacts:",i);const c=e.querySelector("#contactsList");c.innerHTML=`
        <div class="text-red-400 text-center py-4">
          Erreur de chargement des contacts
        </div>
      `}}}function w(s){console.log("📋 Affichage infos complètes du groupe:",s.name);const e=document.createElement("div");e.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",e.innerHTML=`
    <div class="bg-[#111b21] rounded-lg w-full max-w-md max-h-[95vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-700">
        <button id="closeModal" class="text-gray-400 hover:text-white p-2">
          <i class="fas fa-times text-xl"></i>
        </button>
        <h2 class="text-lg font-medium text-white">Infos du groupe</h2>
        <div class="w-10"></div> <!-- Spacer -->
      </div>
      
      <!-- Content -->
      <div class="p-4 space-y-6">
        
        <!-- Section Sécurité -->
        <div class="space-y-4">
          <div class="flex items-start space-x-3 p-3 hover:bg-[#202c33] rounded-lg cursor-pointer">
            <div class="w-8 h-8 flex items-center justify-center">
              <i class="fas fa-lock text-gray-400"></i>
            </div>
            <div class="flex-1">
              <div class="text-white font-medium">Chiffrement</div>
              <div class="text-gray-400 text-sm">Les messages sont chiffrés de bout en bout. Cliquez pour plus d'informations.</div>
            </div>
          </div>
          
          <div class="flex items-center justify-between p-3 hover:bg-[#202c33] rounded-lg cursor-pointer">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 flex items-center justify-center">
                <i class="fas fa-clock text-gray-400"></i>
              </div>
              <div>
                <div class="text-white font-medium">Messages éphémères</div>
                <div class="text-gray-400 text-sm">Non</div>
              </div>
            </div>
          </div>
          
          <div class="flex items-center justify-between p-3 hover:bg-[#202c33] rounded-lg cursor-pointer">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 flex items-center justify-center">
                <i class="fas fa-shield-alt text-gray-400"></i>
              </div>
              <div>
                <div class="text-white font-medium">Confidentialité avancée de la discussion</div>
                <div class="text-gray-400 text-sm">Désactivée</div>
              </div>
            </div>
          </div>
          
          <div class="flex items-center justify-between p-3 hover:bg-[#202c33] rounded-lg cursor-pointer">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 flex items-center justify-center">
                <i class="fas fa-cog text-gray-400"></i>
              </div>
              <div class="text-white font-medium">Autorisations du groupe</div>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </div>
        </div>
        
        <!-- Section Communauté -->
        <div class="border-t border-gray-700 pt-4">
          <div class="flex items-center justify-between p-3 hover:bg-[#202c33] rounded-lg cursor-pointer">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <i class="fas fa-users text-white"></i>
              </div>
              <div>
                <div class="text-white font-medium">Ajouter à une nouvelle communauté</div>
                <div class="text-gray-400 text-sm">Rassemblez des membres dans des groupes spécifiques</div>
              </div>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </div>
        </div>
        
        <!-- Section Membres -->
        <div class="border-t border-gray-700 pt-4">
          <div class="flex items-center justify-between mb-4">
            <div class="text-white font-medium" id="membersCount">Chargement...</div>
            <button class="text-gray-400 hover:text-white">
              <i class="fas fa-search"></i>
            </button>
          </div>
          
          <!-- Boutons d'action -->
          <div class="space-y-2 mb-4">
            <button id="addMemberBtn" class="w-full flex items-center space-x-3 p-3 hover:bg-[#202c33] rounded-lg">
              <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <i class="fas fa-plus text-white"></i>
              </div>
              <div class="text-white font-medium">Ajouter un membre</div>
            </button>
            
            <button id="inviteLinkBtn" class="w-full flex items-center space-x-3 p-3 hover:bg-[#202c33] rounded-lg">
              <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <i class="fas fa-link text-white"></i>
              </div>
              <div class="text-white font-medium">Inviter à rejoindre le groupe via un lien</div>
            </button>
          </div>
          
          <!-- Liste des membres -->
          <div id="membersList" class="space-y-2">
            <!-- Les membres seront chargés ici -->
          </div>
        </div>
        
        <!-- Section Actions -->
        <div class="border-t border-gray-700 pt-4 space-y-2">
          <button id="addToFavoritesBtn" class="w-full flex items-center space-x-3 p-3 hover:bg-[#202c33] rounded-lg">
            <div class="w-8 h-8 flex items-center justify-center">
              <i class="fas fa-heart text-gray-400"></i>
            </div>
            <div class="text-white font-medium">Ajouter aux Favoris</div>
          </button>
          
          <button id="leaveGroupBtn" class="w-full flex items-center space-x-3 p-3 hover:bg-[#202c33] rounded-lg">
            <div class="w-8 h-8 flex items-center justify-center">
              <i class="fas fa-sign-out-alt text-red-400"></i>
            </div>
            <div class="text-red-400 font-medium">Quitter le groupe</div>
          </button>
          
          <button id="reportGroupBtn" class="w-full flex items-center space-x-3 p-3 hover:bg-[#202c33] rounded-lg">
            <div class="w-8 h-8 flex items-center justify-center">
              <i class="fas fa-flag text-red-400"></i>
            </div>
            <div class="text-red-400 font-medium">Signaler le groupe</div>
          </button>
        </div>
        
      </div>
    </div>
  `,document.body.appendChild(e),S(s);const n=e.querySelector("#closeModal"),r=e.querySelector("#addMemberBtn"),t=e.querySelector("#inviteLinkBtn"),a=e.querySelector("#addToFavoritesBtn"),o=e.querySelector("#leaveGroupBtn"),i=e.querySelector("#reportGroupBtn"),c=()=>document.body.removeChild(e);n.addEventListener("click",c);const p=v(),g=s.admins&&s.admins.includes(p.id);r&&(g?r.addEventListener("click",()=>{c(),$(s)}):(r.style.opacity="0.5",r.style.cursor="not-allowed",r.addEventListener("click",()=>{l("Seuls les administrateurs peuvent ajouter des membres","error")}))),t&&t.addEventListener("click",()=>{l("Lien d'invitation généré (fonctionnalité simulée)","info")}),a&&a.addEventListener("click",()=>{l("Groupe ajouté aux favoris","success")}),o&&o.addEventListener("click",async()=>{confirm(`Êtes-vous sûr de vouloir quitter le groupe "${s.name}" ?`)&&await j(s.id,p.id)&&(c(),l("Vous avez quitté le groupe","success"),window.showSimpleGroups&&window.showSimpleGroups())}),i&&i.addEventListener("click",()=>{confirm("Signaler ce groupe ?")&&l("Groupe signalé","success")})}async function S(s){try{const e=v(),n=await b(s.id),r=document.getElementById("membersCount");r&&(r.textContent=`${n.length} membre${n.length>1?"s":""}`);const t=document.getElementById("membersList");if(!t)return;t.innerHTML=n.map(a=>{const o=s.admins&&s.admins.includes(a.id),i=a.id===s.createdBy,c=a.id===e.id;return`
        <div class="flex items-center space-x-3 p-3 hover:bg-[#202c33] rounded-lg">
          <img src="${a.avatar}" alt="${a.name}" class="w-10 h-10 rounded-full object-cover">
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <div class="text-white font-medium">${c?"Vous":a.name}</div>
              ${i?'<span class="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Créateur</span>':""}
              ${o&&!i?'<span class="text-xs bg-green-600 text-white px-2 py-1 rounded">Admin du groupe</span>':""}
            </div>
            <div class="text-gray-400 text-sm">${a.bio||"Fullstack JS Developer — passionate about everything JavaScript"}</div>
          </div>
        </div>
      `}).join("")}catch(e){console.error("Erreur chargement membres:",e);const n=document.getElementById("membersList");n&&(n.innerHTML='<div class="text-red-400 text-sm p-3">Erreur de chargement</div>')}}function $(s){const e=document.createElement("div");e.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",e.innerHTML=`
    <div class="bg-[#222e35] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-white">Ajouter un membre</h2>
        <button id="closeModal" class="text-gray-400 hover:text-white">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Sélectionner un utilisateur
          </label>
          <div id="availableUsersList" class="space-y-2 max-h-64 overflow-y-auto bg-[#2a3942] rounded-lg p-3">
            <!-- Les utilisateurs disponibles seront chargés ici -->
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
            id="addBtn"
            class="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            disabled
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  `,document.body.appendChild(e);let n=null;i();const r=e.querySelector("#closeModal"),t=e.querySelector("#cancelBtn"),a=e.querySelector("#addBtn"),o=()=>document.body.removeChild(e);r.addEventListener("click",o),t.addEventListener("click",o),a.addEventListener("click",async()=>{if(n){a.disabled=!0,a.textContent="Ajout...";try{const c=v();await x(s.id,n,c.id)&&(o(),setTimeout(()=>w(s),500))}finally{a.disabled=!1,a.textContent="Ajouter"}}});async function i(){try{const c=v(),p=await fetch(`${u}/users`);if(!p.ok)throw new Error("Erreur récupération utilisateurs");const f=(await p.json()).filter(d=>d.id!==c.id&&!s.members.includes(d.id)),m=e.querySelector("#availableUsersList");if(f.length===0){m.innerHTML=`
          <div class="text-gray-400 text-center py-4">
            Tous les utilisateurs sont déjà membres du groupe
          </div>
        `;return}m.innerHTML=f.map(d=>`
        <label class="flex items-center space-x-3 p-2 hover:bg-[#374151] rounded cursor-pointer user-option">
          <input type="radio" name="selectedUser" value="${d.id}" class="text-green-500 focus:ring-green-500">
          <img src="${d.avatar}" alt="${d.name}" class="w-8 h-8 rounded-full">
          <div class="flex-1">
            <div class="text-white font-medium">${d.name}</div>
            <div class="text-gray-400 text-sm">${d.phone}</div>
          </div>
        </label>
      `).join(""),m.querySelectorAll('input[name="selectedUser"]').forEach(d=>{d.addEventListener("change",()=>{n=d.value,a.disabled=!1})})}catch(c){console.error("Erreur chargement utilisateurs:",c);const p=e.querySelector("#availableUsersList");p.innerHTML=`
        <div class="text-red-400 text-center py-4">
          Erreur de chargement des utilisateurs
        </div>
      `}}}function E(s){switch(s.type){case"image":return"📷 Photo";case"video":return"🎥 Vidéo";case"audio":return"🎵 Audio";case"voice":return"🎤 Message vocal";case"document":return`📄 ${s.fileName}`;default:return s.text}}function v(){try{return JSON.parse(localStorage.getItem("currentUser"))}catch(s){return console.error("Erreur récupération currentUser:",s),null}}async function j(s,e){try{console.log("🚪 Utilisateur quitte le groupe:",{groupId:s,userId:e});const n=await fetch(`${u}/groups/${s}`);if(!n.ok)throw new Error("Groupe non trouvé");const r=await n.json();if(!r.members.includes(e))return l("Vous n'êtes pas membre de ce groupe","error"),!1;if(e===r.createdBy)return l("Le créateur ne peut pas quitter le groupe. Transférez d'abord la propriété.","error"),!1;const t=await fetch(`${u}/users/${e}`);if(!t.ok)throw new Error("Utilisateur non trouvé");const a=await t.json();r.members=r.members.filter(i=>i!==e),r.admins.includes(e)&&(r.admins=r.admins.filter(i=>i!==e));const o={id:Date.now(),type:"system",text:`${a.name} a quitté le groupe`,senderId:"system",timestamp:new Date().toISOString(),time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})};return r.messages=r.messages||[],r.messages.push(o),r.lastMessage=o.text,r.lastMessageTime=o.timestamp,await fetch(`${u}/groups/${s}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)}),a.groups=a.groups?a.groups.filter(i=>i!==s):[],await fetch(`${u}/users/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}),console.log("✅ Utilisateur a quitté le groupe"),!0}catch(n){return console.error("❌ Erreur quitter groupe:",n),l("Erreur lors de la sortie du groupe","error"),!1}}export{x as addMemberToGroup,h as createGroup,C as createGroupModal,b as getGroupMembers,L as getGroupMessages,T as getUserGroups,j as leaveGroup,k as promoteToAdmin,G as removeMemberFromGroup,U as sendMessageToGroup,$ as showAddMemberModal,w as showGroupInfo};
