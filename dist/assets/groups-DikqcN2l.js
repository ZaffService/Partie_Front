import{s as m}from"./index-BoT3uGHK.js";const l="https://mon-serveur-cub8.onrender.com";async function L(t){try{console.log("🔍 Récupération des groupes pour l'utilisateur:",t);const e=await fetch(`${l}/users/${t}`);if(!e.ok)throw new Error("Utilisateur non trouvé");const a=await e.json();if(console.log("👤 Utilisateur récupéré:",a),!a.groups||a.groups.length===0)return console.log("📭 Aucun groupe pour cet utilisateur"),[];const o=await fetch(`${l}/groups`);if(!o.ok)throw new Error("Erreur récupération groupes");const s=await o.json();console.log("📋 Tous les groupes:",s);const r=s.filter(n=>a.groups.includes(n.id));return console.log("✅ Groupes de l'utilisateur:",r),r}catch(e){return console.error("❌ Erreur récupération groupes utilisateur:",e),[]}}async function y(t,e,a,o){try{console.log("🆕 Création groupe:",{name:t,description:e,members:a,creatorId:o});const s={id:`group_${Date.now()}`,name:t,description:e,avatar:"https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop",members:[o,...a],admins:[o],createdBy:o,createdAt:new Date().toISOString(),lastMessage:`Groupe "${t}" créé`,lastMessageTime:new Date().toISOString(),messages:[{id:Date.now(),type:"system",text:`Groupe "${t}" créé par vous`,senderId:"system",timestamp:new Date().toISOString(),time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}]},r=await fetch(`${l}/groups`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(!r.ok)throw new Error("Erreur création groupe");for(const n of s.members)try{const c=await fetch(`${l}/users/${n}`);if(c.ok){const i=await c.json();i.groups=i.groups||[],i.groups.includes(s.id)||(i.groups.push(s.id),await fetch(`${l}/users/${n}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)}))}}catch(c){console.error(`Erreur ajout groupe à l'utilisateur ${n}:`,c)}return console.log("✅ Groupe créé avec succès:",s.name),m("Groupe créé avec succès","success"),window.showSimpleGroups&&setTimeout(()=>{window.showSimpleGroups()},500),await r.json()}catch(s){return console.error("❌ Erreur création groupe:",s),m("Erreur lors de la création du groupe","error"),null}}async function U(t){try{console.log("📨 Récupération messages groupe:",t);const e=await fetch(`${l}/groups/${t}`);if(!e.ok)throw new Error("Groupe non trouvé");return(await e.json()).messages||[]}catch(e){return console.error("❌ Erreur récupération messages groupe:",e),[]}}async function v(t){try{console.log("👥 Récupération membres groupe:",t);const e=await fetch(`${l}/groups/${t}`);if(!e.ok)throw new Error("Groupe non trouvé");const a=await e.json(),o=await fetch(`${l}/users`);if(!o.ok)throw new Error("Erreur récupération utilisateurs");const r=(await o.json()).filter(n=>a.members.includes(n.id));return console.log("✅ Membres récupérés:",r.length),r}catch(e){return console.error("❌ Erreur récupération membres:",e),[]}}async function k(t,e,a){try{console.log("📤 === DÉBUT ENVOI MESSAGE GROUPE ==="),console.log("Expéditeur:",t),console.log("Groupe:",e),console.log("Message:",a.text);const o=await fetch(`${l}/groups/${e}`);if(!o.ok)throw new Error("Groupe non trouvé");const s=await o.json();console.log("📋 Groupe récupéré:",s.name,"Membres:",s.members);const r=await fetch(`${l}/users/${t}`);if(!r.ok)throw new Error("Utilisateur non trouvé");const n=await r.json();console.log("👤 Expéditeur:",n.name);const c={...a,senderName:n.name,groupId:e,groupName:s.name};if(s.messages=s.messages||[],s.messages.push(c),s.lastMessage=a.type==="text"?a.text:T(a),s.lastMessageTime=a.timestamp,!(await fetch(`${l}/groups/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)})).ok)throw new Error("Erreur mise à jour groupe");return console.log("✅ Message ajouté au groupe"),console.log("📨 Début distribution aux membres..."),await x(s,c,t,n),console.log("✅ === FIN ENVOI MESSAGE GROUPE ==="),c}catch(o){throw console.error("❌ Erreur envoi message groupe:",o),o}}async function x(t,e,a,o){try{console.log("📨 === DÉBUT DISTRIBUTION DÉTAILLÉE ==="),console.log("Groupe:",t.name),console.log("Membres du groupe:",t.members),console.log("Message à distribuer:",e.text),console.log("Expéditeur:",o.name,"(ID:",a,")");const s=await fetch(`${l}/chats`);if(!s.ok){console.error("❌ Erreur récupération chats");return}const r=await s.json();console.log("📋 Total chats dans la base:",r.length);const n=await fetch(`${l}/users`);if(!n.ok){console.error("❌ Erreur récupération utilisateurs");return}const c=await n.json();for(const i of t.members){if(i===a){console.log(`⏭️ Ignorer l'expéditeur ${i} (${o.name})`);continue}try{console.log(`
📤 === DISTRIBUTION VERS MEMBRE ${i} ===`);const g=c.find(u=>u.id===i);if(!g){console.error(`❌ Membre ${i} non trouvé dans les utilisateurs`);continue}console.log(`👤 Membre cible: ${g.name}`);let d=r.find(u=>u.ownerId===i&&u.contactId===a);if(d)console.log(`📋 Chat existant trouvé: ${d.id}`);else{if(console.log(`📝 Aucun chat existant entre ${g.name} et ${o.name}`),console.log("📝 Création d'un nouveau chat..."),d={id:`${i}_${a}_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,ownerId:i,contactId:a,name:o.name,phone:o.phone,avatar:o.avatar,status:o.status||"Hors ligne",isOnline:o.isOnline||!1,lastSeen:o.lastSeen||new Date().toISOString(),unread:0,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),lastMessage:"",lastMessageTime:new Date().toISOString(),messages:[]},!(await fetch(`${l}/chats`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)})).ok){console.error(`❌ Erreur création chat pour ${g.name}`);continue}console.log(`✅ Nouveau chat créé pour ${g.name}`)}const f={...e,id:`${Date.now()}_${Math.random().toString(36).substr(2,9)}`,text:`[${t.name}] ${o.name}: ${e.text}`,sent:!1,isGroupMessage:!0,originalGroupId:t.id,originalGroupName:t.name,originalSender:o.name};console.log("💬 Message personnel créé:",f.text),d.messages=d.messages||[],d.messages.push(f),d.lastMessage=f.text,d.lastMessageTime=f.timestamp,d.unread=(d.unread||0)+1,console.log("📊 Chat mis à jour:"),console.log(`   - Messages: ${d.messages.length}`),console.log(`   - Non lus: ${d.unread}`),console.log(`   - Dernier message: ${d.lastMessage}`);const p=await fetch(`${l}/chats/${d.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});p.ok?console.log(`✅ Message distribué avec succès à ${g.name}`):(console.error(`❌ Erreur mise à jour chat pour ${g.name}`),console.error(`   Status: ${p.status}`))}catch(g){console.error(`❌ Erreur distribution au membre ${i}:`,g)}}console.log("✅ === FIN DISTRIBUTION DÉTAILLÉE ===")}catch(s){console.error("❌ Erreur distribution générale:",s)}}async function w(t,e,a){try{console.log("➕ Ajout membre au groupe:",{groupId:t,userId:e,adminId:a});const o=await fetch(`${l}/groups/${t}`);if(!o.ok)throw new Error("Groupe non trouvé");const s=await o.json();if(!s.admins.includes(a))return m("Seuls les administrateurs peuvent ajouter des membres","error"),!1;if(s.members.includes(e))return m("Ce membre fait déjà partie du groupe","warning"),!1;const r=await fetch(`${l}/users/${e}`);if(!r.ok)return m("Utilisateur non trouvé","error"),!1;const n=await r.json();s.members.push(e);const c={id:Date.now(),type:"system",text:`${n.name} a rejoint le groupe`,senderId:"system",timestamp:new Date().toISOString(),time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})};return s.messages=s.messages||[],s.messages.push(c),s.lastMessage=c.text,s.lastMessageTime=c.timestamp,await fetch(`${l}/groups/${t}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}),n.groups=n.groups||[],n.groups.includes(t)||(n.groups.push(t),await fetch(`${l}/users/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)})),console.log("✅ Membre ajouté au groupe"),m(`${n.name} ajouté au groupe`,"success"),!0}catch(o){return console.error("❌ Erreur ajout membre:",o),m("Erreur lors de l'ajout du membre","error"),!1}}async function $(t,e,a){try{console.log("➖ Suppression membre du groupe:",{groupId:t,userId:e,adminId:a});const o=await fetch(`${l}/groups/${t}`);if(!o.ok)throw new Error("Groupe non trouvé");const s=await o.json();if(!s.admins.includes(a))return m("Seuls les administrateurs peuvent supprimer des membres","error"),!1;if(!s.members.includes(e))return m("Ce membre ne fait pas partie du groupe","warning"),!1;if(e===s.createdBy)return m("Impossible de supprimer le créateur du groupe","error"),!1;const r=await fetch(`${l}/users/${e}`);if(!r.ok)return m("Utilisateur non trouvé","error"),!1;const n=await r.json();s.members=s.members.filter(i=>i!==e),s.admins.includes(e)&&(s.admins=s.admins.filter(i=>i!==e));const c={id:Date.now(),type:"system",text:`${n.name} a quitté le groupe`,senderId:"system",timestamp:new Date().toISOString(),time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})};return s.messages=s.messages||[],s.messages.push(c),s.lastMessage=c.text,s.lastMessageTime=c.timestamp,await fetch(`${l}/groups/${t}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}),n.groups=n.groups?n.groups.filter(i=>i!==t):[],await fetch(`${l}/users/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}),console.log("✅ Membre supprimé du groupe"),m(`${n.name} supprimé du groupe`,"success"),!0}catch(o){return console.error("❌ Erreur suppression membre:",o),m("Erreur lors de la suppression du membre","error"),!1}}async function E(t,e,a){try{console.log("👑 Promotion admin:",{groupId:t,userId:e,adminId:a});const o=await fetch(`${l}/groups/${t}`);if(!o.ok)throw new Error("Groupe non trouvé");const s=await o.json();if(!s.admins.includes(a))return m("Seuls les administrateurs peuvent promouvoir","error"),!1;if(!s.members.includes(e))return m("L'utilisateur n'est pas membre du groupe","error"),!1;if(s.admins.includes(e))return m("L'utilisateur est déjà administrateur","warning"),!1;const r=await fetch(`${l}/users/${e}`);if(!r.ok)return m("Utilisateur non trouvé","error"),!1;const n=await r.json();s.admins.push(e);const c={id:Date.now(),type:"system",text:`${n.name} a été promu administrateur`,senderId:"system",timestamp:new Date().toISOString(),time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})};return s.messages=s.messages||[],s.messages.push(c),s.lastMessage=c.text,s.lastMessageTime=c.timestamp,await fetch(`${l}/groups/${t}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}),console.log("✅ Utilisateur promu administrateur"),m(`${n.name} promu administrateur`,"success"),!0}catch(o){return console.error("❌ Erreur promotion admin:",o),m("Erreur lors de la promotion","error"),!1}}function R(t){const e=document.createElement("div");e.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",e.innerHTML=`
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
  `,document.body.appendChild(e),n();const a=e.querySelector("#closeModal"),o=e.querySelector("#cancelBtn"),s=e.querySelector("#createGroupForm"),r=()=>document.body.removeChild(e);a.addEventListener("click",r),o.addEventListener("click",r),s.addEventListener("submit",async c=>{c.preventDefault();const i=e.querySelector("#groupName").value.trim(),g=e.querySelector("#groupDescription").value.trim();if(!i){m("Veuillez saisir un nom de groupe","error");return}const d=Array.from(e.querySelectorAll('input[type="checkbox"]:checked')).map(u=>u.value);if(d.length===0){m("Veuillez sélectionner au moins un membre","error");return}const f=JSON.parse(localStorage.getItem("currentUser"));if(!f){m("Erreur: utilisateur non connecté","error");return}const p=e.querySelector("#createBtn");p.disabled=!0,p.innerHTML=`
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Création...
      </div>
    `;try{const u=await y(i,g,d,f.id);u&&t&&t(u),r()}catch(u){console.error("Erreur création groupe:",u),m("Erreur lors de la création du groupe","error")}finally{p.disabled=!1,p.textContent="Créer"}});async function n(){try{const c=JSON.parse(localStorage.getItem("currentUser"));if(!c)return;const i=await fetch(`${l}/users`);if(!i.ok)throw new Error("Erreur récupération utilisateurs");const d=(await i.json()).filter(p=>p.id!==c.id),f=e.querySelector("#contactsList");if(d.length===0){f.innerHTML=`
          <div class="text-gray-400 text-center py-4">
            Aucun contact disponible
          </div>
        `;return}f.innerHTML=d.map(p=>`
        <label class="flex items-center space-x-3 p-2 hover:bg-[#374151] rounded cursor-pointer">
          <input type="checkbox" value="${p.id}" class="text-green-500 focus:ring-green-500">
          <img src="${p.avatar}" alt="${p.name}" class="w-8 h-8 rounded-full">
          <div class="flex-1">
            <div class="text-white font-medium">${p.name}</div>
            <div class="text-gray-400 text-sm">${p.phone}</div>
          </div>
        </label>
      `).join("")}catch(c){console.error("Erreur chargement contacts:",c);const i=e.querySelector("#contactsList");i.innerHTML=`
        <div class="text-red-400 text-center py-4">
          Erreur de chargement des contacts
        </div>
      `}}}function S(t){console.log("📋 Affichage infos groupe:",t.name);const e=document.createElement("div");e.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",e.innerHTML=`
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
  `,document.body.appendChild(e),b(t,e.querySelector("#membersList"));const a=e.querySelector("#closeModal"),o=e.querySelector("#closeBtn"),s=e.querySelector("#addMemberBtn"),r=()=>document.body.removeChild(e);if(a.addEventListener("click",r),o.addEventListener("click",r),s){const n=h();t.admins&&t.admins.includes(n.id)?s.addEventListener("click",()=>{r(),M(t)}):s.style.display="none"}}async function b(t,e){try{const a=h(),o=t.admins&&t.admins.includes(a.id),s=await v(t.id);e.innerHTML=s.map(r=>{const n=t.admins&&t.admins.includes(r.id),c=r.id===t.createdBy,i=r.id===a.id;return`
        <div class="flex items-center space-x-3 p-3 bg-[#2a3942] rounded-lg">
          <img src="${r.avatar}" alt="${r.name}" class="w-10 h-10 rounded-full">
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <div class="text-white text-sm font-medium">${r.name}</div>
              ${c?'<span class="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Créateur</span>':""}
              ${n&&!c?'<span class="text-xs bg-green-600 text-white px-2 py-1 rounded">Admin</span>':""}
              ${i?'<span class="text-xs bg-blue-600 text-white px-2 py-1 rounded">Vous</span>':""}
            </div>
            <div class="text-gray-400 text-xs">${r.phone}</div>
          </div>
          
          ${o&&!i&&!c?`
            <div class="flex space-x-1">
              ${n?"":`<button class="promote-btn text-yellow-400 hover:text-yellow-300 p-1" data-user-id="${r.id}" title="Promouvoir admin">
                      <i class="fas fa-crown text-sm"></i>
                    </button>`}
              <button class="remove-btn text-red-400 hover:text-red-300 p-1" data-user-id="${r.id}" title="Supprimer">
                <i class="fas fa-trash text-sm"></i>
              </button>
            </div>
          `:""}
        </div>
      `}).join(""),e.querySelectorAll(".promote-btn").forEach(r=>{r.addEventListener("click",async()=>{const n=r.dataset.userId;await E(t.id,n,a.id)&&b(t,e)})}),e.querySelectorAll(".remove-btn").forEach(r=>{r.addEventListener("click",async()=>{const n=r.dataset.userId,c=s.find(i=>i.id===n);confirm(`Êtes-vous sûr de vouloir supprimer ${c.name} du groupe ?`)&&await $(t.id,n,a.id)&&b(t,e)})})}catch(a){console.error("Erreur chargement membres:",a),e.innerHTML='<div class="text-red-400 text-sm">Erreur de chargement</div>'}}function M(t){const e=document.createElement("div");e.className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",e.innerHTML=`
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
  `,document.body.appendChild(e);let a=null;c();const o=e.querySelector("#closeModal"),s=e.querySelector("#cancelBtn"),r=e.querySelector("#addBtn"),n=()=>document.body.removeChild(e);o.addEventListener("click",n),s.addEventListener("click",n),r.addEventListener("click",async()=>{if(a){r.disabled=!0,r.textContent="Ajout...";try{const i=h();await w(t.id,a,i.id)&&(n(),setTimeout(()=>S(t),500))}finally{r.disabled=!1,r.textContent="Ajouter"}}});async function c(){try{const i=h(),g=await fetch(`${l}/users`);if(!g.ok)throw new Error("Erreur récupération utilisateurs");const f=(await g.json()).filter(u=>u.id!==i.id&&!t.members.includes(u.id)),p=e.querySelector("#availableUsersList");if(f.length===0){p.innerHTML=`
          <div class="text-gray-400 text-center py-4">
            Tous les utilisateurs sont déjà membres du groupe
          </div>
        `;return}p.innerHTML=f.map(u=>`
        <label class="flex items-center space-x-3 p-2 hover:bg-[#374151] rounded cursor-pointer user-option">
          <input type="radio" name="selectedUser" value="${u.id}" class="text-green-500 focus:ring-green-500">
          <img src="${u.avatar}" alt="${u.name}" class="w-8 h-8 rounded-full">
          <div class="flex-1">
            <div class="text-white font-medium">${u.name}</div>
            <div class="text-gray-400 text-sm">${u.phone}</div>
          </div>
        </label>
      `).join(""),p.querySelectorAll('input[name="selectedUser"]').forEach(u=>{u.addEventListener("change",()=>{a=u.value,r.disabled=!1})})}catch(i){console.error("Erreur chargement utilisateurs:",i);const g=e.querySelector("#availableUsersList");g.innerHTML=`
        <div class="text-red-400 text-center py-4">
          Erreur de chargement des utilisateurs
        </div>
      `}}}function T(t){switch(t.type){case"image":return"📷 Photo";case"video":return"🎥 Vidéo";case"audio":return"🎵 Audio";case"voice":return"🎤 Message vocal";case"document":return`📄 ${t.fileName}`;default:return t.text}}function h(){try{return JSON.parse(localStorage.getItem("currentUser"))}catch(t){return console.error("Erreur récupération currentUser:",t),null}}export{w as addMemberToGroup,y as createGroup,R as createGroupModal,v as getGroupMembers,U as getGroupMessages,L as getUserGroups,E as promoteToAdmin,$ as removeMemberFromGroup,k as sendMessageToGroup,M as showAddMemberModal,S as showGroupInfo};
