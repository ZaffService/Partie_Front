import { showToast } from "./notifications.js"

const API_URL = "https://mon-serveur-cub8.onrender.com"

// Fonction pour générer un avatar aléatoire
function generateRandomAvatar(name, gender = null) {
  const genders = ["men", "women"]
  const selectedGender = gender || genders[Math.floor(Math.random() * genders.length)]
  const avatarNumber = Math.floor(Math.random() * 99) + 1
  return `https://randomuser.me/api/portraits/${selectedGender}/${avatarNumber}.jpg`
}

export async function addContact(currentUserId, phone, name) {
  try {
    // Validation
    if (!name || !phone) {
      showToast(" Veuillez remplir tous les champs", "error")
      return null
    }

    if (name.length < 2 || name.length > 50) {
      showToast(" Le nom doit contenir entre 2 et 50 caractères", "error")
      return null
    }

    if (!/^\d{9}$/.test(phone) || !phone.startsWith("7")) {
      showToast(" Numéro invalide (9 chiffres commençant par 7)", "error")
      return null
    }

    // Vérifier si l'utilisateur cible existe
    const usersResponse = await fetch(`${API_URL}/users`)
    if (!usersResponse.ok) {
      showToast(" Erreur de connexion au serveur", "error")
      return null
    }

    const users = await usersResponse.json()
    let targetUser = users.find((user) => user.phone === phone)

    if (!targetUser) {
      // Créer un nouvel utilisateur
      const newUserId = (users.length + 1).toString()
      targetUser = {
        id: newUserId,
        name: name,
        phone: phone,
        avatar: generateRandomAvatar(name),
        status: "Hors ligne",
        isOnline: false,
        lastSeen: new Date().toISOString(),
        bio: "Salut ! J'utilise WhatsApp.",
        walletBalance: 0,
        totalEarnings: 0,
        contacts: [],
        groups: [],
      }

      const createUserResponse = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetUser),
      })

      if (!createUserResponse.ok) {
        showToast(" Erreur lors de la création du contact", "error")
        return null
      }
    }

    if (targetUser.id === currentUserId) {
      showToast(" Vous ne pouvez pas vous ajouter vous-même", "error")
      return null
    }

    // Créer un chat UNIQUEMENT pour l'utilisateur actuel
    await createPersonalChat(currentUserId, targetUser)

    showToast(` ${targetUser.name} ajouté à vos contacts`, "success")
    return targetUser
  } catch (error) {
    console.error("Erreur ajout contact:", error)
    showToast(" Erreur de connexion", "error")
    return null
  }
}

async function createPersonalChat(currentUserId, targetUser) {
  try {
    // Vérifier si ce chat existe déjà pour cet utilisateur
    const chatsResponse = await fetch(`${API_URL}/chats`)
    const allChats = await chatsResponse.json()

    // Chercher un chat existant pour cet utilisateur avec ce contact
    const existingChat = allChats.find((chat) => chat.ownerId === currentUserId && chat.contactId === targetUser.id)

    if (existingChat) {
      console.log("Chat déjà existant pour cet utilisateur")
      return
    }

    // Créer un nouveau chat personnel
    const personalChat = {
      id: `${currentUserId}_${targetUser.id}_${Date.now()}`, // ID unique
      ownerId: currentUserId, // IMPORTANT: Propriétaire du chat
      contactId: targetUser.id, // ID du contact
      name: targetUser.name,
      phone: targetUser.phone,
      avatar: targetUser.avatar,
      status: targetUser.status,
      isOnline: targetUser.isOnline,
      lastSeen: targetUser.lastSeen,
      unread: 0,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      lastMessage: "",
      lastMessageTime: new Date().toISOString(),
      messages: [],
    }

    await fetch(`${API_URL}/chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(personalChat),
    })

    console.log(` Chat personnel créé pour ${currentUserId} avec ${targetUser.name}`)
  } catch (error) {
    console.error("Erreur création chat personnel:", error)
  }
}

export async function getContacts(userId) {
  try {
    // Récupérer SEULEMENT les chats de cet utilisateur
    const chatsResponse = await fetch(`${API_URL}/chats`)
    const allChats = await chatsResponse.json()

    // Filtrer les chats qui appartiennent à cet utilisateur
    const userChats = allChats.filter((chat) => chat.ownerId === userId)

    return userChats
  } catch (error) {
    console.error("Erreur récupération contacts:", error)
    return []
  }
}

export function createAddContactModal(onContactAdded) {
  const modal = document.createElement("div")
  modal.className = "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"

  modal.innerHTML = `
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
           Ce contact sera ajouté UNIQUEMENT à votre liste personnelle.
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
  `

  // Event listeners
  const closeModal = modal.querySelector("#closeModal")
  const cancelBtn = modal.querySelector("#cancelBtn")
  const form = modal.querySelector("#addContactForm")
  const nameInput = modal.querySelector("#contactName")
  const phoneInput = modal.querySelector("#contactPhone")

  const closeModalFn = () => {
    document.body.removeChild(modal)
  }

  closeModal.addEventListener("click", closeModalFn)
  cancelBtn.addEventListener("click", closeModalFn)

  // Validation en temps réel
  phoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "")
    if (value.length > 9) {
      value = value.substring(0, 9)
      showToast(" Maximum 9 chiffres autorisés", "warning")
    }
    e.target.value = value
  })

  nameInput.addEventListener("input", (e) => {
    let value = e.target.value
    if (value.length > 50) {
      value = value.substring(0, 50)
      showToast(" Maximum 50 caractères autorisés", "warning")
      e.target.value = value
    }
  })

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const name = nameInput.value.trim()
    const phone = phoneInput.value.trim()

    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    if (!currentUser) {
      showToast(" Erreur: utilisateur non connecté", "error")
      return
    }

    const addBtn = modal.querySelector("#addBtn")
    addBtn.disabled = true
    addBtn.innerHTML = `
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Ajout...
      </div>
    `

    try {
      const contact = await addContact(currentUser.id, phone, name)
      if (contact && onContactAdded) {
        onContactAdded(contact)
      }
      closeModalFn()
    } finally {
      addBtn.disabled = false
      addBtn.textContent = "Ajouter"
    }
  })

  document.body.appendChild(modal)
  nameInput.focus()
}
