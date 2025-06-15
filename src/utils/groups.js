import { showToast } from "./notifications.js"

const API_URL = "http://localhost:5001"

export async function createGroup(name, description, members, creatorId) {
  try {
    const group = {
      id: `group_${Date.now()}`,
      name: name,
      description: description,
      avatar: `https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop`,
      members: [creatorId, ...members],
      admins: [creatorId],
      createdBy: creatorId,
      createdAt: new Date().toISOString(),
      lastMessage: `${name} créé`,
      lastMessageTime: new Date().toISOString(),
      messages: [],
    }

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
      } catch (error) {
        console.error(`Erreur ajout groupe à l'utilisateur ${memberId}:`, error)
      }
    }

    showToast("Groupe créé avec succès", "success")
    return await response.json()
  } catch (error) {
    console.error("Erreur création groupe:", error)
    showToast("Erreur lors de la création du groupe", "error")
    return null
  }
}

export async function addMemberToGroup(groupId, userId, adminId) {
  try {
    const groupResponse = await fetch(`${API_URL}/groups/${groupId}`)
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

    // Ajouter le membre
    group.members.push(userId)

    await fetch(`${API_URL}/groups/${groupId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(group),
    })

    // Ajouter le groupe à l'utilisateur
    const userResponse = await fetch(`${API_URL}/users/${userId}`)
    const user = await userResponse.json()

    user.groups = user.groups || []
    user.groups.push(groupId)

    await fetch(`${API_URL}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })

    showToast("Membre ajouté au groupe", "success")
    return true
  } catch (error) {
    console.error("Erreur ajout membre:", error)
    showToast("Erreur lors de l'ajout du membre", "error")
    return false
  }
}

export async function promoteToAdmin(groupId, userId, adminId) {
  try {
    const groupResponse = await fetch(`${API_URL}/groups/${groupId}`)
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

    // Promouvoir
    group.admins.push(userId)

    await fetch(`${API_URL}/groups/${groupId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(group),
    })

    showToast("Utilisateur promu administrateur", "success")
    return true
  } catch (error) {
    console.error("Erreur promotion admin:", error)
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
    if (!currentUser) return

    const createBtn = modal.querySelector("#createBtn")
    createBtn.disabled = true
    createBtn.textContent = "Création..."

    try {
      const group = await createGroup(name, description, selectedMembers, currentUser.id)
      if (group && onGroupCreated) {
        onGroupCreated(group)
      }
      closeModalFn()
    } finally {
      createBtn.disabled = false
      createBtn.textContent = "Créer"
    }
  })

  async function loadContactsForGroup() {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"))
      if (!currentUser) return

      const usersResponse = await fetch(`${API_URL}/users`)
      const users = await usersResponse.json()

      const contacts = users.filter(
        (user) => user.id !== currentUser.id && currentUser.contacts && currentUser.contacts.includes(user.id),
      )

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
    }
  }
}

export async function getGroups(userId) {
  try {
    const userResponse = await fetch(`${API_URL}/users/${userId}`)
    const user = await userResponse.json()

    if (!user.groups || user.groups.length === 0) {
      return []
    }

    const groupsResponse = await fetch(`${API_URL}/groups`)
    const allGroups = await groupsResponse.json()

    return allGroups.filter((group) => user.groups.includes(group.id))
  } catch (error) {
    console.error("Erreur récupération groupes:", error)
    return []
  }
}
