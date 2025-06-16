import{s as u}from"./index-DNAVy5x_.js";const l="https://mon-serveur-cub8.onrender.com";async function U(t){try{console.log("🔍 Récupération des groupes pour l'utilisateur:",t);const e=await fetch(`${l}/users/${t}`);if(!e.ok)throw new Error("Utilisateur non trouvé");const i=await e.json();if(console.log("👤 Utilisateur récupéré:",i),!i.groups||i.groups.length===0)return console.log("📭 Aucun groupe pour cet utilisateur"),[];const a=await fetch(`${l}/groups`);if(!a.ok)throw new Error("Erreur récupération groupes");const r=await a.json();console.log("📋 Tous les groupes:",r);const o=r.filter(s=>i.groups.includes(s.id));return console.log("✅ Groupes de l'utilisateur:",o),o}catch(e){return console.error("❌ Erreur récupération groupes utilisateur:",e),[]}}async function y(t,e,i,a){try{console.log("🆕 Création groupe:",{name:t,description:e,members:i,creatorId:a});const r={id:`group_${Date.now()}`,name:t,description:e,avatar:"https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop",members:[a,...i],admins:[a],createdBy:a,createdAt:new Date().toISOString(),lastMessage:`Groupe "${t}" créé`,lastMessageTime:new Date().toISOString(),messages:[{id:Date.now(),type:"system",text:`Groupe "${t}" créé par vous`,senderId:"system",timestamp:new Date().toISOString(),time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}]},o=await fetch(`${l}/groups`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)});if(!o.ok)throw new Error("Erreur création groupe");for(const s of r.members)try{const n=await fetch(`${l}/users/${s}`);if(n.ok){const c=await n.json();c.groups=c.groups||[],c.groups.includes(r.id)||(c.groups.push(r.id),await fetch(`${l}/users/${s}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)}))}}catch(n){console.error(`Erreur ajout groupe à l'utilisateur ${s}:`,n)}return console.log("✅ Groupe créé avec succès:",r.name),u("Groupe créé avec succès","success"),window.showSimpleGroups&&setTimeout(()=>{window.showSimpleGroups()},500),await o.json()}catch(r){return console.error("❌ Erreur création groupe:",r),u("Erreur lors de la création du groupe","error"),null}}async function L(t){try{console.log("📨 Récupération messages groupe:",t);const e=await fetch(`${l}/groups/${t}`);if(!e.ok)throw new Error("Groupe non trouvé");return(await e.json()).messages||[]}catch(e){return console.error("❌ Erreur récupération messages groupe:",e),[]}}async function v(t){try{console.log("👥 Récupération membres groupe:",t);const e=await fetch(`${l}/groups/${t}`);if(!e.ok)throw new Error("Groupe non trouvé");const i=await e.json(),a=await fetch(`${l}/users`);if(!a.ok)throw new Error("Erreur récupération utilisateurs");const o=(await a.json()).filter(s=>i.members.includes(s.id));return console.log("✅ Membres récupérés:",o.length),o}catch(e){return console.error("❌ Erreur récupération membres:",e),[]}}async function G(t,e,i){try{console.log("📤 === DÉBUT ENVOI MESSAGE GROUPE ==="),console.log("Expéditeur:",t),console.log("Groupe:",e),console.log("Message:",i.text);const a=await fetch(`${l}/groups/${e}`);if(!a.ok)throw new Error("Groupe non trouvé");const r=await a.json();console.log("📋 Groupe récupéré:",r.name,"Membres:",r.members);const o=await fetch(`${l}/users/${t}`);if(!o.ok)throw new Error("Utilisateur non trouvé");const s=await o.json();console.log("👤 Expéditeur:",s.name);const n={...i,senderName:s.name,groupId:e,groupName:r.name};if(r.messages=r.messages||[],r.messages.push(n),r.lastMessage=i.type==="text"?i.text:j(i),r.lastMessageTime=i.timestamp,!(await fetch(`${l}/groups/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)})).ok)throw new Error("Erreur mise à jour groupe");return console.log("✅ Message ajouté au groupe"),console.log("📨 Début distribution aux membres..."),await x(r,n,t,s),console.log("✅ === FIN ENVOI MESSAGE GROUPE ==="),n}catch(a){throw console.error("❌ Erreur envoi message groupe:",a),a}}async function x(t,e,i,a){try{console.log("📨 === DÉBUT DISTRIBUTION MESSAGES GROUPE ==="),console.log("Groupe:",t.name),console.log("Membres:",t.members),console.log("Message:",e.text),console.log("Expéditeur:",a.name);const r=await fetch(`${l}/chats`);if(!r.ok){console.error("❌ Erreur récupération chats");return}const o=await r.json();for(const s of t.members){if(s===i){console.log(`⏭️ Ignorer expéditeur ${s}`);continue}try{console.log(`
📤 Distribution vers membre ${s}`);let n=o.find(p=>p.ownerId===s&&p.contactId===i);if(!n){if(console.log(`📝 Création nouveau chat pour membre ${s}`),n={id:`${s}_${i}_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,ownerId:s,contactId:i,name:a.name,phone:a.phone,avatar:a.avatar,status:a.status||"Hors ligne",isOnline:a.isOnline||!1,lastSeen:a.lastSeen||new Date().toISOString(),unread:0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),lastMessage:"",lastMessageTime:new Date().toISOString(),messages:[]},!(await fetch(`${l}/chats`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)})).ok){console.error(`❌ Erreur création chat pour membre ${s}`);continue}console.log(`✅ Chat créé pour membre ${s}`)}const c={...e,id:`${Date.now()}_${Math.random().toString(36).substr(2,9)}`,text:`[${t.name}] ${a.name}: ${e.text}`,sent:!1,isGroupMessage:!0,originalGroupId:t.id,originalGroupName:t.name,originalSender:a.name};n.messages=n.messages||[],n.messages.push(c),n.lastMessage=c.text,n.lastMessageTime=c.timestamp,n.unread=(n.unread||0)+1,(await fetch(`${l}/chats/${n.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)})).ok?console.log(`✅ Message distribué à membre ${s}`):console.error(`❌ Erreur mise à jour chat membre ${s}`)}catch(n){console.error(`❌ Erreur distribution membre ${s}:`,n)}}console.log("✅ === FIN DISTRIBUTION MESSAGES GROUPE ===")}catch(r){console.error("❌ Erreur distribution générale:",r)}}async function w(t,e,i){try{console.log("➕ Ajout membre au groupe:",{groupId:t,userId:e,adminId:i});const a=await fetch(`${l}/groups/${t}`);if(!a.ok)throw new Error("Groupe non trouvé");const r=await a.json();if(!r.admins.includes(i))return u("Seuls les administrateurs peuvent ajouter des membres","error"),!1;if(r.members.includes(e))return u("Ce membre fait déjà partie du groupe","warning"),!1;const o=await fetch(`${l}/users/${e}`);if(!o.ok)return u("Utilisateur non trouvé","error"),!1;const s=await o.json();r.members.push(e);const n={id:Date.now(),type:"system",text:`${s.name} a rejoint le groupe`,senderId:"system",timestamp:new Date().toISOString(),time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})};return r.messages=r.messages||[],r.messages.push(n),r.lastMessage=n.text,r.lastMessageTime=n.timestamp,await fetch(`${l}/groups/${t}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)}),s.groups=s.groups||[],s.groups.includes(t)||(s.groups.push(t),await fetch(`${l}/users/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)})),console.log("✅ Membre ajouté au groupe"),u(`${s.name} ajouté au groupe`,"success"),!0}catch(a){return console.error("❌ Erreur ajout membre:",a),u("Erreur lors de l'ajout du membre","error"),!1}}async function $(t,e,i){try{console.log("➖ Suppression membre du groupe:",{groupId:t,userId:e,adminId:i});const a=await fetch(`${l}/groups/${t}`);if(!a.ok)throw new Error("Groupe non trouvé");const r=await a.json();if(!r.admins.includes(i))return u("Seuls les administrateurs peuvent supprimer des membres","error"),!1;if(!r.members.includes(e))return u("Ce membre ne fait pas partie du groupe","warning"),!1;if(e===r.createdBy)return u("Impossible de supprimer le créateur du groupe","error"),!1;const o=await fetch(`${l}/users/${e}`);if(!o.ok)return u("Utilisateur non trouvé","error"),!1;const s=await o.json();r.members=r.members.filter(c=>c!==e),r.admins.includes(e)&&(r.admins=r.admins.filter(c=>c!==e));const n={id:Date.now(),type:"system",text:`${s.name} a quitté le groupe`,senderId:"system",timestamp:new Date().toISOString(),time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})};return r.messages=r.messages||[],r.messages.push(n),r.lastMessage=n.text,r.lastMessageTime=n.timestamp,await fetch(`${l}/groups/${t}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)}),s.groups=s.groups?s.groups.filter(c=>c!==t):[],await fetch(`${l}/users/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}),console.log("✅ Membre supprimé du groupe"),u(`${s.name} supprimé du groupe`,"success"),!0}catch(a){return console.error("❌ Erreur suppression membre:",a),u("Erreur lors de la suppression du membre","error"),!1}}async function S(t,e,i){try{console.log("👑 Promotion admin:",{groupId:t,userId:e,adminId:i});const a=await fetch(`${l}/groups/${t}`);if(!a.ok)throw new Error("Groupe non trouvé");const r=await a.json();if(!r.admins.includes(i))return u("Seuls les administrateurs peuvent promouvoir","error"),!1;if(!r.members.includes(e))return u("L'utilisateur n'est pas membre du groupe","error"),!1;if(r.admins.includes(e))return u("L'utilisateur est déjà administrateur","warning"),!1;const o=await fetch(`${l}/users/${e}`);if(!o.ok)return u("Utilisateur non trouvé","error"),!1;const s=await o.json();r.admins.push(e);const n={id:Date.now(),type:"system",text:`${s.name} a été promu administrateur`,senderId:"system",timestamp:new Date().toISOString(),time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})};return r.messages=r.messages||[],r.messages.push(n),r.lastMessage=n.text,r.lastMessageTime=n.timestamp,await fetch(`${l}/groups/${t}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)}),console.log("✅ Utilisateur promu administrateur"),u(`${s.name} promu administrateur`,"success"),!0}catch(a){return console.error("❌ Erreur promotion admin:",a),u("Erreur lors de la promotion","error"),!1}}function k(t){const e=document.createElement("div");e.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",e.innerHTML=`
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
  `,document.body.appendChild(e),s();const i=e.querySelector("#closeModal"),a=e.querySelector("#cancelBtn"),r=e.querySelector("#createGroupForm"),o=()=>document.body.removeChild(e);i.addEventListener("click",o),a.addEventListener("click",o),r.addEventListener("submit",async n=>{n.preventDefault();const c=e.querySelector("#groupName").value.trim(),g=e.querySelector("#groupDescription").value.trim();if(!c){u("Veuillez saisir un nom de groupe","error");return}const p=Array.from(e.querySelectorAll('input[type="checkbox"]:checked')).map(d=>d.value);if(p.length===0){u("Veuillez sélectionner au moins un membre","error");return}const f=JSON.parse(localStorage.getItem("currentUser"));if(!f){u("Erreur: utilisateur non connecté","error");return}const m=e.querySelector("#createBtn");m.disabled=!0,m.innerHTML=`
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Création...
      </div>
    `;try{const d=await y(c,g,p,f.id);d&&t&&t(d),o()}catch(d){console.error("Erreur création groupe:",d),u("Erreur lors de la création du groupe","error")}finally{m.disabled=!1,m.textContent="Créer"}});async function s(){try{const n=JSON.parse(localStorage.getItem("currentUser"));if(!n)return;const c=await fetch(`${l}/users`);if(!c.ok)throw new Error("Erreur récupération utilisateurs");const p=(await c.json()).filter(m=>m.id!==n.id),f=e.querySelector("#contactsList");if(p.length===0){f.innerHTML=`
          <div class="text-gray-400 text-center py-4">
            Aucun contact disponible
          </div>
        `;return}f.innerHTML=p.map(m=>`
        <label class="flex items-center space-x-3 p-2 hover:bg-[#374151] rounded cursor-pointer">
          <input type="checkbox" value="${m.id}" class="text-green-500 focus:ring-green-500">
          <img src="${m.avatar}" alt="${m.name}" class="w-8 h-8 rounded-full">
          <div class="flex-1">
            <div class="text-white font-medium">${m.name}</div>
            <div class="text-gray-400 text-sm">${m.phone}</div>
          </div>
        </label>
      `).join("")}catch(n){console.error("Erreur chargement contacts:",n);const c=e.querySelector("#contactsList");c.innerHTML=`
        <div class="text-red-400 text-center py-4">
          Erreur de chargement des contacts
        </div>
      `}}}function E(t){console.log("📋 Affichage infos groupe:",t.name);const e=document.createElement("div");e.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",e.innerHTML=`
    <div class="bg-[#222e35] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-white">Infos du groupe</h2>
        <button id="closeModal" class="text-gray-400 hover:text-white">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <div class="text-center mb-6">
        <img src="${t.avatar||"https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop"}" 
             alt="${t.name}" class="w-24 h-24 rounded-full mx-auto mb-4 object-cover">
        <h3 class="text-xl font-semibold text-white">${t.name}</h3>
        <p class="text-gray-400">${t.members?t.members.length:0} membres</p>
        ${t.description?`<p class="text-gray-300 mt-2 text-sm">${t.description}</p>`:""}
      </div>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-white font-medium">Membres</h4>
          <button id="addMemberBtn" class="text-green-400 hover:text-green-300 text-sm">
            <i class="fas fa-plus mr-1"></i>Ajouter
          </button>
        </div>
        <div id="membersList" class="space-y-2 max-h-48 overflow-y-auto">
          <!-- Les membres seront chargés ici -->
        </div>
      </div>
      
      <div class="mt-6 flex justify-end">
        <button id="closeBtn" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
          Fermer
        </button>
      </div>
    </div>
  `,document.body.appendChild(e),b(t,e.querySelector("#membersList"));const i=e.querySelector("#closeModal"),a=e.querySelector("#closeBtn"),r=e.querySelector("#addMemberBtn"),o=()=>document.body.removeChild(e);if(i.addEventListener("click",o),a.addEventListener("click",o),r){const s=h();t.admins&&t.admins.includes(s.id)?r.addEventListener("click",()=>{o(),M(t)}):r.style.display="none"}}async function b(t,e){try{const i=h(),a=t.admins&&t.admins.includes(i.id),r=await v(t.id);e.innerHTML=r.map(o=>{const s=t.admins&&t.admins.includes(o.id),n=o.id===t.createdBy,c=o.id===i.id;return`
        <div class="flex items-center space-x-3 p-3 bg-[#2a3942] rounded-lg">
          <img src="${o.avatar}" alt="${o.name}" class="w-10 h-10 rounded-full">
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <div class="text-white text-sm font-medium">${o.name}</div>
              ${n?'<span class="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Créateur</span>':""}
              ${s&&!n?'<span class="text-xs bg-green-600 text-white px-2 py-1 rounded">Admin</span>':""}
              ${c?'<span class="text-xs bg-blue-600 text-white px-2 py-1 rounded">Vous</span>':""}
            </div>
            <div class="text-gray-400 text-xs">${o.phone}</div>
          </div>
          
          ${a&&!c&&!n?`
            <div class="flex space-x-1">
              ${s?"":`<button class="promote-btn text-yellow-400 hover:text-yellow-300 p-1" data-user-id="${o.id}" title="Promouvoir admin">
                      <i class="fas fa-crown text-sm"></i>
                    </button>`}
              <button class="remove-btn text-red-400 hover:text-red-300 p-1" data-user-id="${o.id}" title="Supprimer">
                <i class="fas fa-trash text-sm"></i>
              </button>
            </div>
          `:""}
        </div>
      `}).join(""),e.querySelectorAll(".promote-btn").forEach(o=>{o.addEventListener("click",async()=>{const s=o.dataset.userId;await S(t.id,s,i.id)&&b(t,e)})}),e.querySelectorAll(".remove-btn").forEach(o=>{o.addEventListener("click",async()=>{const s=o.dataset.userId,n=r.find(c=>c.id===s);confirm(`Êtes-vous sûr de vouloir supprimer ${n.name} du groupe ?`)&&await $(t.id,s,i.id)&&b(t,e)})})}catch(i){console.error("Erreur chargement membres:",i),e.innerHTML='<div class="text-red-400 text-sm">Erreur de chargement</div>'}}function M(t){const e=document.createElement("div");e.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",e.innerHTML=`
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
  `,document.body.appendChild(e);let i=null;n();const a=e.querySelector("#closeModal"),r=e.querySelector("#cancelBtn"),o=e.querySelector("#addBtn"),s=()=>document.body.removeChild(e);a.addEventListener("click",s),r.addEventListener("click",s),o.addEventListener("click",async()=>{if(i){o.disabled=!0,o.textContent="Ajout...";try{const c=h();await w(t.id,i,c.id)&&(s(),setTimeout(()=>E(t),500))}finally{o.disabled=!1,o.textContent="Ajouter"}}});async function n(){try{const c=h(),g=await fetch(`${l}/users`);if(!g.ok)throw new Error("Erreur récupération utilisateurs");const f=(await g.json()).filter(d=>d.id!==c.id&&!t.members.includes(d.id)),m=e.querySelector("#availableUsersList");if(f.length===0){m.innerHTML=`
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
      `).join(""),m.querySelectorAll('input[name="selectedUser"]').forEach(d=>{d.addEventListener("change",()=>{i=d.value,o.disabled=!1})})}catch(c){console.error("Erreur chargement utilisateurs:",c);const g=e.querySelector("#availableUsersList");g.innerHTML=`
        <div class="text-red-400 text-center py-4">
          Erreur de chargement des utilisateurs
        </div>
      `}}}function j(t){switch(t.type){case"image":return"📷 Photo";case"video":return"🎥 Vidéo";case"audio":return"🎵 Audio";case"voice":return"🎤 Message vocal";case"document":return`📄 ${t.fileName}`;default:return t.text}}function h(){try{return JSON.parse(localStorage.getItem("currentUser"))}catch(t){return console.error("Erreur récupération currentUser:",t),null}}export{w as addMemberToGroup,y as createGroup,k as createGroupModal,v as getGroupMembers,L as getGroupMessages,U as getUserGroups,S as promoteToAdmin,$ as removeMemberFromGroup,G as sendMessageToGroup,M as showAddMemberModal,E as showGroupInfo};
