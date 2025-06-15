import { showToast } from "./notifications.js"

const API_URL = "http://localhost:5001"

// Fonction pour générer un avatar aléatoire
function generateRandomAvatar(name, gender = null) {
  const genders = ["men", "women"]
  const selectedGender = gender || genders[Math.floor(Math.random() * genders.length)]
  const avatarNumber = Math.floor(Math.random() * 99) + 1
  return `https://randomuser.me/api/portraits/${selectedGender}/${avatarNumber}.jpg`
}

export async function addContact(currentUserId, phone, name) {
  try {
    // Validation personnalisée avec toasts
    if (!name && !phone) {
      showToast("❌ Veuillez remplir tous les champs", "error")
      return null
    }

    if (!name) {
      showToast("❌ Le nom du contact est obligatoire", "error")
      return null
    }

    if (!phone) {
      showToast("❌ Le numéro de téléphone est obligatoire", "error")
      return null
    }

    // Validation du nom
    if (name.length < 2) {
      showToast("❌ Le nom doit contenir au moins 2 caractères", "error")
      return null
    }

    if (name.length > 50) {
      showToast("❌ Le nom ne peut pas dépasser 50 caractères", "error")
      return null
    }

    // Validation du téléphone
    if (!/^\d+$/.test(phone)) {
      showToast("❌ Le numéro ne doit contenir que des chiffres", "error")
      return null
    }

    if (phone.length !== 9) {
      showToast("❌ Le numéro doit contenir exactement 9 chiffres", "error")
      return null
    }

    if (!phone.startsWith("7")) {
      showToast("❌ Le numéro doit commencer par 7 (format sénégalais)", "error")
      return null
    }

    // Vérifier si l'utilisateur existe déjà
    const usersResponse = await fetch(`${API_URL}/users`)

    if (!usersResponse.ok) {
      showToast("❌ Erreur de connexion au serveur", "error")
      return null
    }

    const users = await usersResponse.json()

    let targetUser = users.find((user) => user.phone === phone)

    if (targetUser) {
      // L'utilisateur existe déjà
      if (targetUser.id === currentUserId) {
        showToast("❌ Vous ne pouvez pas vous ajouter vous-même comme contact", "error")
        return null
      }
    } else {
      // Créer un nouvel utilisateur
      const newUserId = `user_${Date.now()}`

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

      // Ajouter le nouvel utilisateur à la base
      const createUserResponse = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetUser),
      })

      if (!createUserResponse.ok) {
        showToast("❌ Erreur lors de la création du nouveau contact", "error")
        return null
      }

      showToast(`✅ Nouveau contact créé pour ${name}`, "success")
      console.log("Nouvel utilisateur créé:", targetUser)
    }

    // Récupérer l'utilisateur actuel
    const currentUserResponse = await fetch(`${API_URL}/users/${currentUserId}`)

    if (!currentUserResponse.ok) {
      showToast("❌ Erreur lors de la récupération de vos informations", "error")
      return null
    }

    const currentUser = await currentUserResponse.json()

    // Vérifier si le contact existe déjà dans la liste
    if (currentUser.contacts && currentUser.contacts.includes(targetUser.id)) {
      showToast("⚠️ Ce contact existe déjà dans votre liste", "warning")
      return null
    }

    // Ajouter le contact à l'utilisateur actuel
    currentUser.contacts = currentUser.contacts || []
    currentUser.contacts.push(targetUser.id)

    // Mettre à jour l'utilisateur actuel
    const updateResponse = await fetch(`${API_URL}/users/${currentUserId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentUser),
    })

    if (!updateResponse.ok) {
      showToast("❌ Erreur lors de l'ajout du contact", "error")
      return null
    }

    // Créer un chat pour ce contact
    await createChatIfNotExists(currentUserId, targetUser)

    showToast(`✅ ${targetUser.name} ajouté à vos contacts avec succès`, "success")
    return targetUser
  } catch (error) {
    console.error("Erreur ajout contact:", error)
    showToast("❌ Erreur de connexion. Vérifiez votre connexion internet.", "error")
    return null
  }
}

async function createChatIfNotExists(currentUserId, targetUser) {
  try {
    // Vérifier si le chat existe déjà
    const chatsResponse = await fetch(`${API_URL}/chats`)
    const chats = await chatsResponse.json()

    const existingChat = chats.find((chat) => chat.id === targetUser.id)

    if (!existingChat) {
      // Créer un nouveau chat
      const newChat = {
        id: targetUser.id,
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
        body: JSON.stringify(newChat),
      })

      console.log("Chat créé pour:", targetUser.name)
    }
  } catch (error) {
    console.error("Erreur création chat:", error)
  }
}

export async function getContacts(userId) {
  try {
    const userResponse = await fetch(`${API_URL}/users/${userId}`)
    const user = await userResponse.json()

    if (!user.contacts || user.contacts.length === 0) {
      return []
    }

    const usersResponse = await fetch(`${API_URL}/users`)
    const allUsers = await usersResponse.json()

    return allUsers.filter((u) => user.contacts.includes(u.id))
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
          💡 Si ce numéro n'existe pas encore, un nouveau compte sera créé automatiquement.
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

  // Validation en temps réel du téléphone
  phoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "")

    if (value.length > 9) {
      value = value.substring(0, 9)
      showToast("⚠️ Maximum 9 chiffres autorisés", "warning")
    }

    e.target.value = value
  })

  // Validation en temps réel du nom
  nameInput.addEventListener("input", (e) => {
    let value = e.target.value

    if (value.length > 50) {
      value = value.substring(0, 50)
      showToast("⚠️ Maximum 50 caractères autorisés pour le nom", "warning")
      e.target.value = value
    }
  })

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const name = nameInput.value.trim()
    const phone = phoneInput.value.trim()

    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    if (!currentUser) {
      showToast("❌ Erreur: utilisateur non connecté", "error")
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
