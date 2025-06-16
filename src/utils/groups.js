import { showToast } from "./notifications.js"

const API_URL = "https://mon-serveur-cub8.onrender.com"

// Fonction pour récupérer les groupes d'un utilisateur
export async function getUserGroups(userId) {
  try {
    console.log("🔍 Récupération des groupes pour l'utilisateur:", userId)

    // Récupérer l'utilisateur pour voir ses groupes
    const userResponse = await fetch(`${API_URL}/users/${userId}`)
    if (!userResponse.ok) {
      throw new Error("Utilisateur non trouvé")
    }

    const user = await userResponse.json()
    console.log("👤 Utilisateur récupéré:", user)

    if (!user.groups || user.groups.length === 0) {
      console.log("📭 Aucun groupe pour cet utilisateur")
      return []
    }

    // Récupérer tous les groupes
    const groupsResponse = await fetch(`${API_URL}/groups`)
    if (!groupsResponse.ok) {
      throw new Error("Erreur récupération groupes")
    }

    const allGroups = await groupsResponse.json()
    console.log("📋 Tous les groupes:", allGroups)

    // Filtrer les groupes de l'utilisateur
    const userGroups = allGroups.filter((group) => user.groups.includes(group.id))
    console.log("✅ Groupes de l'utilisateur:", userGroups)

    return userGroups
  } catch (error) {
    console.error("❌ Erreur récupération groupes utilisateur:", error)
    return []
  }
}

// Fonction pour récupérer tous les groupes
export async function getGroups(userId) {
  return await getUserGroups(userId)
}

export async function createGroup(name, description, members, creatorId) {
  try {
    console.log("🆕 Création groupe:", { name, description, members, creatorId })

    const group = {
      id: `group_${Date.now()}`,
      name: name,
      description: description,
      avatar: `https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop`,
      members: [creatorId, ...members], // Le créateur est automatiquement membre
      admins: [creatorId], // Le créateur est automatiquement admin
      createdBy: creatorId,
      createdAt: new Date().toISOString(),
      lastMessage: `Groupe "${name}" créé`,
      lastMessageTime: new Date().toISOString(),
      messages: [
        {
          id: Date.now(),
          type: "system",
          text: `Groupe "${name}" créé par vous`,
          senderId: "system",
          timestamp: new Date().toISOString(),
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    }

    // Créer le groupe sur le serveur
    const response = await fetch(`${API_URL}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(group),
    })

    if (!response.ok) throw new Error("Erreur création groupe")

    // Ajouter le groupe aux utilisateurs membres
    for (const memberId of group.members) {
      try {
        const userResponse = await fetch(`${API_URL}/users/${memberId}`)
        if (userResponse.ok) {
          const user = await userResponse.json()

          user.groups = user.groups || []
          if (!user.groups.includes(group.id)) {
            user.groups.push(group.id)

            await fetch(`${API_URL}/users/${memberId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(user),
            })
          }
        }
      } catch (error) {
        console.error(`Erreur ajout groupe à l'utilisateur ${memberId}:`, error)
      }
    }

    console.log("✅ Groupe créé avec succès:", group.name)
    showToast("Groupe créé avec succès", "success")

    // NOUVEAU: Recharger automatiquement l'affichage des groupes
    if (window.showSimpleGroups) {
      setTimeout(() => {
        window.showSimpleGroups()
      }, 500)
    }

    return await response.json()
  } catch (error) {
    console.error("❌ Erreur création groupe:", error)
    showToast("Erreur lors de la création du groupe", "error")
    return null
  }
}

export async function getGroupMessages(groupId) {
  try {
    console.log("📨 Récupération messages groupe:", groupId)

    const response = await fetch(`${API_URL}/groups/${groupId}`)
    if (!response.ok) {
      throw new Error("Groupe non trouvé")
    }

    const group = await response.json()
    return group.messages || []
  } catch (error) {
    console.error("❌ Erreur récupération messages groupe:", error)
    return []
  }
}

export async function getGroupMembers(groupId) {
  try {
    console.log("👥 Récupération membres groupe:", groupId)

    // Récupérer le groupe
    const groupResponse = await fetch(`${API_URL}/groups/${groupId}`)
    if (!groupResponse.ok) {
      throw new Error("Groupe non trouvé")
    }

    const group = await groupResponse.json()

    // Récupérer tous les utilisateurs
    const usersResponse = await fetch(`${API_URL}/users`)
    if (!usersResponse.ok) {
      throw new Error("Erreur récupération utilisateurs")
    }

    const allUsers = await usersResponse.json()

    // Filtrer les membres du groupe
    const members = allUsers.filter((user) => group.members.includes(user.id))

    console.log("✅ Membres récupérés:", members.length)
    return members
  } catch (error) {
    console.error("❌ Erreur récupération membres:", error)
    return []
  }
}

export async function sendMessageToGroup(senderId, groupId, message) {
  try {
    console.log("📤 === DÉBUT ENVOI MESSAGE GROUPE ===")
    console.log("Expéditeur:", senderId)
    console.log("Groupe:", groupId)
    console.log("Message:", message.text)

    // Récupérer le groupe
    const groupResponse = await fetch(`${API_URL}/groups/${groupId}`)
    if (!groupResponse.ok) {
      throw new Error("Groupe non trouvé")
    }

    const group = await groupResponse.json()
    console.log("📋 Groupe récupéré:", group.name, "Membres:", group.members)

    // Récupérer les infos de l'expéditeur
    const userResponse = await fetch(`${API_URL}/users/${senderId}`)
    if (!userResponse.ok) {
      throw new Error("Utilisateur non trouvé")
    }

    const sender = await userResponse.json()
    console.log("👤 Expéditeur:", sender.name)

    // Ajouter le nom de l'expéditeur au message
    const groupMessage = {
      ...message,
      senderName: sender.name,
      groupId: groupId,
      groupName: group.name,
    }

    // Ajouter le message au groupe
    group.messages = group.messages || []
    group.messages.push(groupMessage)

    // Mettre à jour les métadonnées du groupe
    group.lastMessage = message.type === "text" ? message.text : getMessagePreview(message)
    group.lastMessageTime = message.timestamp

    // Sauvegarder le groupe
    const updateResponse = await fetch(`${API_URL}/groups/${groupId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(group),
    })

    if (!updateResponse.ok) {
      throw new Error("Erreur mise à jour groupe")
    }

    console.log("✅ Message ajouté au groupe")

    // CORRIGER: Distribuer le message à tous les chats personnels des membres
    console.log("📨 Début distribution aux membres...")
    await distributeGroupMessageToMembers(group, groupMessage, senderId, sender)

    console.log("✅ === FIN ENVOI MESSAGE GROUPE ===")
    return groupMessage
  } catch (error) {
    console.error("❌ Erreur envoi message groupe:", error)
    throw error
  }
}

// FONCTION CORRIGÉE pour la distribution des messages
async function distributeGroupMessageToMembers(group, message, senderId, sender) {
  try {
    console.log("📨 === DÉBUT DISTRIBUTION MESSAGES GROUPE ===")
    console.log("Groupe:", group.name)
    console.log("Membres:", group.members)
    console.log("Message:", message.text)
    console.log("Expéditeur:", sender.name)

    // Récupérer tous les chats existants
    const chatsResponse = await fetch(`${API_URL}/chats`)
    if (!chatsResponse.ok) {
      console.error("❌ Erreur récupération chats")
      return
    }

    const allChats = await chatsResponse.json()

    // Pour chaque membre du groupe (SAUF l'expéditeur)
    for (const memberId of group.members) {
      if (memberId === senderId) {
        console.log(`⏭️ Ignorer expéditeur ${memberId}`)
        continue
      }

      try {
        console.log(`\n📤 Distribution vers membre ${memberId}`)

        // Trouver le chat personnel de ce membre avec l'expéditeur
        let memberChat = allChats.find((chat) => chat.ownerId === memberId && chat.contactId === senderId)

        if (!memberChat) {
          console.log(`📝 Création nouveau chat pour membre ${memberId}`)

          // Créer un nouveau chat personnel
          memberChat = {
            id: `${memberId}_${senderId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ownerId: memberId,
            contactId: senderId,
            name: sender.name,
            phone: sender.phone,
            avatar: sender.avatar,
            status: sender.status || "Hors ligne",
            isOnline: sender.isOnline || false,
            lastSeen: sender.lastSeen || new Date().toISOString(),
            unread: 0,
            time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            lastMessage: "",
            lastMessageTime: new Date().toISOString(),
            messages: [],
          }

          // Créer le chat sur le serveur
          const createResponse = await fetch(`${API_URL}/chats`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(memberChat),
          })

          if (!createResponse.ok) {
            console.error(`❌ Erreur création chat pour membre ${memberId}`)
            continue
          }

          console.log(`✅ Chat créé pour membre ${memberId}`)
        }

        // Créer le message personnel avec format [GROUPE]
        const personalMessage = {
          ...message,
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text: `[${group.name}] ${sender.name}: ${message.text}`,
          sent: false, // Message reçu pour ce membre
          isGroupMessage: true,
          originalGroupId: group.id,
          originalGroupName: group.name,
          originalSender: sender.name,
        }

        // Ajouter le message au chat
        memberChat.messages = memberChat.messages || []
        memberChat.messages.push(personalMessage)
        memberChat.lastMessage = personalMessage.text
        memberChat.lastMessageTime = personalMessage.timestamp
        memberChat.unread = (memberChat.unread || 0) + 1

        // Sauvegarder le chat mis à jour
        const updateResponse = await fetch(`${API_URL}/chats/${memberChat.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(memberChat),
        })

        if (updateResponse.ok) {
          console.log(`✅ Message distribué à membre ${memberId}`)
        } else {
          console.error(`❌ Erreur mise à jour chat membre ${memberId}`)
        }
      } catch (error) {
        console.error(`❌ Erreur distribution membre ${memberId}:`, error)
      }
    }

    console.log("✅ === FIN DISTRIBUTION MESSAGES GROUPE ===")
  } catch (error) {
    console.error("❌ Erreur distribution générale:", error)
  }
}

export async function addMemberToGroup(groupId, userId, adminId) {
  try {
    console.log("➕ Ajout membre au groupe:", { groupId, userId, adminId })

    const groupResponse = await fetch(`${API_URL}/groups/${groupId}`)
    if (!groupResponse.ok) {
      throw new Error("Groupe non trouvé")
    }

    const group = await groupResponse.json()

    // Vérifier que l'utilisateur est admin
    if (!group.admins.includes(adminId)) {
      showToast("Seuls les administrateurs peuvent ajouter des membres", "error")
      return false
    }

    // Vérifier que le membre n'est pas déjà dans le groupe
    if (group.members.includes(userId)) {
      showToast("Ce membre fait déjà partie du groupe", "warning")
      return false
    }

    // Récupérer les infos du nouvel utilisateur
    const userResponse = await fetch(`${API_URL}/users/${userId}`)
    if (!userResponse.ok) {
      showToast("Utilisateur non trouvé", "error")
      return false
    }

    const newUser = await userResponse.json()

    // Ajouter le membre
    group.members.push(userId)

    // Ajouter un message système
    const systemMessage = {
      id: Date.now(),
      type: "system",
      text: `${newUser.name} a rejoint le groupe`,
      senderId: "system",
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    }

    group.messages = group.messages || []
    group.messages.push(systemMessage)
    group.lastMessage = systemMessage.text
    group.lastMessageTime = systemMessage.timestamp

    // Sauvegarder le groupe
    await fetch(`${API_URL}/groups/${groupId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(group),
    })

    // Ajouter le groupe à l'utilisateur
    newUser.groups = newUser.groups || []
    if (!newUser.groups.includes(groupId)) {
      newUser.groups.push(groupId)

      await fetch(`${API_URL}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })
    }

    console.log("✅ Membre ajouté au groupe")
    showToast(`${newUser.name} ajouté au groupe`, "success")
    return true
  } catch (error) {
    console.error("❌ Erreur ajout membre:", error)
    showToast("Erreur lors de l'ajout du membre", "error")
    return false
  }
}

export async function removeMemberFromGroup(groupId, userId, adminId) {
  try {
    console.log("➖ Suppression membre du groupe:", { groupId, userId, adminId })

    const groupResponse = await fetch(`${API_URL}/groups/${groupId}`)
    if (!groupResponse.ok) {
      throw new Error("Groupe non trouvé")
    }

    const group = await groupResponse.json()

    // Vérifier que l'utilisateur est admin
    if (!group.admins.includes(adminId)) {
      showToast("Seuls les administrateurs peuvent supprimer des membres", "error")
      return false
    }

    // Vérifier que le membre est dans le groupe
    if (!group.members.includes(userId)) {
      showToast("Ce membre ne fait pas partie du groupe", "warning")
      return false
    }

    // Ne pas permettre de supprimer le créateur
    if (userId === group.createdBy) {
      showToast("Impossible de supprimer le créateur du groupe", "error")
      return false
    }

    // Récupérer les infos de l'utilisateur à supprimer
    const userResponse = await fetch(`${API_URL}/users/${userId}`)
    if (!userResponse.ok) {
      showToast("Utilisateur non trouvé", "error")
      return false
    }

    const userToRemove = await userResponse.json()

    // Supprimer le membre
    group.members = group.members.filter((id) => id !== userId)

    // Supprimer des admins si nécessaire
    if (group.admins.includes(userId)) {
      group.admins = group.admins.filter((id) => id !== userId)
    }

    // Ajouter un message système
    const systemMessage = {
      id: Date.now(),
      type: "system",
      text: `${userToRemove.name} a quitté le groupe`,
      senderId: "system",
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    }

    group.messages = group.messages || []
    group.messages.push(systemMessage)
    group.lastMessage = systemMessage.text
    group.lastMessageTime = systemMessage.timestamp

    // Sauvegarder le groupe
    await fetch(`${API_URL}/groups/${groupId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(group),
    })

    // Supprimer le groupe de l'utilisateur
    userToRemove.groups = userToRemove.groups ? userToRemove.groups.filter((id) => id !== groupId) : []

    await fetch(`${API_URL}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userToRemove),
    })

    console.log("✅ Membre supprimé du groupe")
    showToast(`${userToRemove.name} supprimé du groupe`, "success")
    return true
  } catch (error) {
    console.error("❌ Erreur suppression membre:", error)
    showToast("Erreur lors de la suppression du membre", "error")
    return false
  }
}

export async function promoteToAdmin(groupId, userId, adminId) {
  try {
    console.log("👑 Promotion admin:", { groupId, userId, adminId })

    const groupResponse = await fetch(`${API_URL}/groups/${groupId}`)
    if (!groupResponse.ok) {
      throw new Error("Groupe non trouvé")
    }

    const group = await groupResponse.json()

    // Vérifier que l'utilisateur est admin
    if (!group.admins.includes(adminId)) {
      showToast("Seuls les administrateurs peuvent promouvoir", "error")
      return false
    }

    // Vérifier que l'utilisateur est membre
    if (!group.members.includes(userId)) {
      showToast("L'utilisateur n'est pas membre du groupe", "error")
      return false
    }

    // Vérifier qu'il n'est pas déjà admin
    if (group.admins.includes(userId)) {
      showToast("L'utilisateur est déjà administrateur", "warning")
      return false
    }

    // Récupérer les infos de l'utilisateur à promouvoir
    const userResponse = await fetch(`${API_URL}/users/${userId}`)
    if (!userResponse.ok) {
      showToast("Utilisateur non trouvé", "error")
      return false
    }

    const userToPromote = await userResponse.json()

    // Promouvoir
    group.admins.push(userId)

    // Ajouter un message système
    const systemMessage = {
      id: Date.now(),
      type: "system",
      text: `${userToPromote.name} a été promu administrateur`,
      senderId: "system",
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    }

    group.messages = group.messages || []
    group.messages.push(systemMessage)
    group.lastMessage = systemMessage.text
    group.lastMessageTime = systemMessage.timestamp

    // Sauvegarder le groupe
    await fetch(`${API_URL}/groups/${groupId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(group),
    })

    console.log("✅ Utilisateur promu administrateur")
    showToast(`${userToPromote.name} promu administrateur`, "success")
    return true
  } catch (error) {
    console.error("❌ Erreur promotion admin:", error)
    showToast("Erreur lors de la promotion", "error")
    return false
  }
}

export function createGroupModal(onGroupCreated) {
  const modal = document.createElement("div")
  modal.className = "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"

  modal.innerHTML = `
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
  `

  document.body.appendChild(modal)

  // Charger les contacts
  loadContactsForGroup()

  // Event listeners
  const closeModal = modal.querySelector("#closeModal")
  const cancelBtn = modal.querySelector("#cancelBtn")
  const form = modal.querySelector("#createGroupForm")

  const closeModalFn = () => document.body.removeChild(modal)

  closeModal.addEventListener("click", closeModalFn)
  cancelBtn.addEventListener("click", closeModalFn)

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const name = modal.querySelector("#groupName").value.trim()
    const description = modal.querySelector("#groupDescription").value.trim()

    if (!name) {
      showToast("Veuillez saisir un nom de groupe", "error")
      return
    }

    // Récupérer les membres sélectionnés
    const selectedMembers = Array.from(modal.querySelectorAll('input[type="checkbox"]:checked')).map(
      (checkbox) => checkbox.value,
    )

    if (selectedMembers.length === 0) {
      showToast("Veuillez sélectionner au moins un membre", "error")
      return
    }

    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    if (!currentUser) {
      showToast("Erreur: utilisateur non connecté", "error")
      return
    }

    const createBtn = modal.querySelector("#createBtn")
    createBtn.disabled = true
    createBtn.innerHTML = `
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Création...
      </div>
    `

    try {
      const group = await createGroup(name, description, selectedMembers, currentUser.id)
      if (group && onGroupCreated) {
        onGroupCreated(group)
      }
      closeModalFn()
    } catch (error) {
      console.error("Erreur création groupe:", error)
      showToast("Erreur lors de la création du groupe", "error")
    } finally {
      createBtn.disabled = false
      createBtn.textContent = "Créer"
    }
  })

  async function loadContactsForGroup() {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"))
      if (!currentUser) return

      // Récupérer tous les utilisateurs sauf l'utilisateur actuel
      const usersResponse = await fetch(`${API_URL}/users`)
      if (!usersResponse.ok) {
        throw new Error("Erreur récupération utilisateurs")
      }

      const users = await usersResponse.json()
      const contacts = users.filter((user) => user.id !== currentUser.id)

      const contactsList = modal.querySelector("#contactsList")

      if (contacts.length === 0) {
        contactsList.innerHTML = `
          <div class="text-gray-400 text-center py-4">
            Aucun contact disponible
          </div>
        `
        return
      }

      contactsList.innerHTML = contacts
        .map(
          (contact) => `
        <label class="flex items-center space-x-3 p-2 hover:bg-[#374151] rounded cursor-pointer">
          <input type="checkbox" value="${contact.id}" class="text-green-500 focus:ring-green-500">
          <img src="${contact.avatar}" alt="${contact.name}" class="w-8 h-8 rounded-full">
          <div class="flex-1">
            <div class="text-white font-medium">${contact.name}</div>
            <div class="text-gray-400 text-sm">${contact.phone}</div>
          </div>
        </label>
      `,
        )
        .join("")
    } catch (error) {
      console.error("Erreur chargement contacts:", error)
      const contactsList = modal.querySelector("#contactsList")
      contactsList.innerHTML = `
        <div class="text-red-400 text-center py-4">
          Erreur de chargement des contacts
        </div>
      `
    }
  }
}

// NOUVELLE FONCTION AMÉLIORÉE: Afficher les infos du groupe avec gestion des membres
export function showGroupInfo(group) {
  console.log("📋 Affichage infos groupe:", group.name)

  const modal = document.createElement("div")
  modal.className = "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"

  modal.innerHTML = `
    <div class="bg-[#222e35] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-white">Infos du groupe</h2>
        <button id="closeModal" class="text-gray-400 hover:text-white">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <div class="text-center mb-6">
        <img src="${group.avatar || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop"}" 
             alt="${group.name}" class="w-24 h-24 rounded-full mx-auto mb-4 object-cover">
        <h3 class="text-xl font-semibold text-white">${group.name}</h3>
        <p class="text-gray-400">${group.members ? group.members.length : 0} membres</p>
        ${group.description ? `<p class="text-gray-300 mt-2 text-sm">${group.description}</p>` : ""}
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
  `

  document.body.appendChild(modal)

  // Charger les membres
  loadGroupMembersWithActions(group, modal.querySelector("#membersList"))

  // Event listeners
  const closeModal = modal.querySelector("#closeModal")
  const closeBtn = modal.querySelector("#closeBtn")
  const addMemberBtn = modal.querySelector("#addMemberBtn")

  const closeModalFn = () => document.body.removeChild(modal)

  closeModal.addEventListener("click", closeModalFn)
  closeBtn.addEventListener("click", closeModalFn)

  // Bouton ajouter membre (seulement pour les admins)
  if (addMemberBtn) {
    const currentUser = getCurrentUser()
    const isAdmin = group.admins && group.admins.includes(currentUser.id)

    if (isAdmin) {
      addMemberBtn.addEventListener("click", () => {
        closeModalFn()
        showAddMemberModal(group)
      })
    } else {
      addMemberBtn.style.display = "none"
    }
  }
}

// NOUVELLE FONCTION: Charger les membres avec actions
async function loadGroupMembersWithActions(group, container) {
  try {
    const currentUser = getCurrentUser()
    const isCurrentUserAdmin = group.admins && group.admins.includes(currentUser.id)
    const members = await getGroupMembers(group.id)

    container.innerHTML = members
      .map((member) => {
        const isAdmin = group.admins && group.admins.includes(member.id)
        const isCreator = member.id === group.createdBy
        const isCurrentUser = member.id === currentUser.id

        return `
        <div class="flex items-center space-x-3 p-3 bg-[#2a3942] rounded-lg">
          <img src="${member.avatar}" alt="${member.name}" class="w-10 h-10 rounded-full">
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <div class="text-white text-sm font-medium">${member.name}</div>
              ${isCreator ? '<span class="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Créateur</span>' : ""}
              ${isAdmin && !isCreator ? '<span class="text-xs bg-green-600 text-white px-2 py-1 rounded">Admin</span>' : ""}
              ${isCurrentUser ? '<span class="text-xs bg-blue-600 text-white px-2 py-1 rounded">Vous</span>' : ""}
            </div>
            <div class="text-gray-400 text-xs">${member.phone}</div>
          </div>
          
          ${
            isCurrentUserAdmin && !isCurrentUser && !isCreator
              ? `
            <div class="flex space-x-1">
              ${
                !isAdmin
                  ? `<button class="promote-btn text-yellow-400 hover:text-yellow-300 p-1" data-user-id="${member.id}" title="Promouvoir admin">
                      <i class="fas fa-crown text-sm"></i>
                    </button>`
                  : ""
              }
              <button class="remove-btn text-red-400 hover:text-red-300 p-1" data-user-id="${member.id}" title="Supprimer">
                <i class="fas fa-trash text-sm"></i>
              </button>
            </div>
          `
              : ""
          }
        </div>
      `
      })
      .join("")

    // Ajouter les événements pour les boutons d'action
    container.querySelectorAll(".promote-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const userId = btn.dataset.userId
        const success = await promoteToAdmin(group.id, userId, currentUser.id)
        if (success) {
          // Recharger les membres
          loadGroupMembersWithActions(group, container)
        }
      })
    })

    container.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const userId = btn.dataset.userId
        const member = members.find((m) => m.id === userId)

        if (confirm(`Êtes-vous sûr de vouloir supprimer ${member.name} du groupe ?`)) {
          const success = await removeMemberFromGroup(group.id, userId, currentUser.id)
          if (success) {
            // Recharger les membres
            loadGroupMembersWithActions(group, container)
          }
        }
      })
    })
  } catch (error) {
    console.error("Erreur chargement membres:", error)
    container.innerHTML = '<div class="text-red-400 text-sm">Erreur de chargement</div>'
  }
}

// NOUVELLE FONCTION: Modal pour ajouter un membre
export function showAddMemberModal(group) {
  const modal = document.createElement("div")
  modal.className = "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"

  modal.innerHTML = `
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
  `

  document.body.appendChild(modal)

  let selectedUserId = null

  // Charger les utilisateurs disponibles
  loadAvailableUsers()

  // Event listeners
  const closeModal = modal.querySelector("#closeModal")
  const cancelBtn = modal.querySelector("#cancelBtn")
  const addBtn = modal.querySelector("#addBtn")

  const closeModalFn = () => document.body.removeChild(modal)

  closeModal.addEventListener("click", closeModalFn)
  cancelBtn.addEventListener("click", closeModalFn)

  addBtn.addEventListener("click", async () => {
    if (!selectedUserId) return

    addBtn.disabled = true
    addBtn.textContent = "Ajout..."

    try {
      const currentUser = getCurrentUser()
      const success = await addMemberToGroup(group.id, selectedUserId, currentUser.id)
      if (success) {
        closeModalFn()
        // Recharger les infos du groupe
        setTimeout(() => showGroupInfo(group), 500)
      }
    } finally {
      addBtn.disabled = false
      addBtn.textContent = "Ajouter"
    }
  })

  async function loadAvailableUsers() {
    try {
      const currentUser = getCurrentUser()

      // Récupérer tous les utilisateurs
      const usersResponse = await fetch(`${API_URL}/users`)
      if (!usersResponse.ok) {
        throw new Error("Erreur récupération utilisateurs")
      }

      const allUsers = await usersResponse.json()

      // Filtrer les utilisateurs qui ne sont pas dans le groupe
      const availableUsers = allUsers.filter((user) => user.id !== currentUser.id && !group.members.includes(user.id))

      const usersList = modal.querySelector("#availableUsersList")

      if (availableUsers.length === 0) {
        usersList.innerHTML = `
          <div class="text-gray-400 text-center py-4">
            Tous les utilisateurs sont déjà membres du groupe
          </div>
        `
        return
      }

      usersList.innerHTML = availableUsers
        .map(
          (user) => `
        <label class="flex items-center space-x-3 p-2 hover:bg-[#374151] rounded cursor-pointer user-option">
          <input type="radio" name="selectedUser" value="${user.id}" class="text-green-500 focus:ring-green-500">
          <img src="${user.avatar}" alt="${user.name}" class="w-8 h-8 rounded-full">
          <div class="flex-1">
            <div class="text-white font-medium">${user.name}</div>
            <div class="text-gray-400 text-sm">${user.phone}</div>
          </div>
        </label>
      `,
        )
        .join("")

      // Gérer la sélection
      usersList.querySelectorAll('input[name="selectedUser"]').forEach((radio) => {
        radio.addEventListener("change", () => {
          selectedUserId = radio.value
          addBtn.disabled = false
        })
      })
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error)
      const usersList = modal.querySelector("#availableUsersList")
      usersList.innerHTML = `
        <div class="text-red-400 text-center py-4">
          Erreur de chargement des utilisateurs
        </div>
      `
    }
  }
}

function getMessagePreview(message) {
  switch (message.type) {
    case "image":
      return "📷 Photo"
    case "video":
      return "🎥 Vidéo"
    case "audio":
      return "🎵 Audio"
    case "voice":
      return "🎤 Message vocal"
    case "document":
      return `📄 ${message.fileName}`
    default:
      return message.text
  }
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser"))
  } catch (error) {
    console.error("Erreur récupération currentUser:", error)
    return null
  }
}
