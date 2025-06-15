import { showToast } from "./notifications.js"
import { updateUserStatus } from "./api.js"

let currentUser = null

function checkSession() {
  const savedUser = localStorage.getItem("currentUser")
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
      return user
    } catch (error) {
      console.error("Erreur parsing user:", error)
      localStorage.removeItem("currentUser")
    }
  }
  return null
}

export function getCurrentUser() {
  return currentUser || checkSession()
}

export function setCurrentUser(user) {
  currentUser = user
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user))
    updateUserStatus(user.id, "en ligne").catch(console.error)
  } else {
    localStorage.removeItem("currentUser")
  }
}

export function logout() {
  // Nettoyer l'intervalle de rafraîchissement
  if (window.refreshInterval) {
    clearInterval(window.refreshInterval)
  }

  // Nettoyer le stockage
  localStorage.removeItem("currentUser")

  // Recharger la page
  window.location.reload()
}

export async function login(name, phone) {
  try {
    // Validation personnalisée avec toasts
    if (!name && !phone) {
      showToast("❌ Veuillez remplir tous les champs", "error")
      return null
    }

    if (!name) {
      showToast("❌ Le nom est obligatoire", "error")
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

    // Récupération des utilisateurs depuis la table users
    const response = await fetch("http://localhost:5001/users")

    if (!response.ok) {
      showToast("❌ Erreur de connexion au serveur", "error")
      return null
    }

    const users = await response.json()

    const user = users.find(
      (u) => u.name.toLowerCase().trim() === name.toLowerCase().trim() && u.phone.trim() === phone.trim(),
    )

    if (user) {
      setCurrentUser(user)
      showToast(`✅ Bienvenue ${user.name} !`, "success")
      return user
    } else {
      // Vérifier si le nom existe avec un autre numéro
      const nameExists = users.find((u) => u.name.toLowerCase().trim() === name.toLowerCase().trim())
      const phoneExists = users.find((u) => u.phone.trim() === phone.trim())

      if (nameExists && !phoneExists) {
        showToast("❌ Ce nom existe mais avec un autre numéro de téléphone", "error")
      } else if (!nameExists && phoneExists) {
        showToast("❌ Ce numéro existe mais avec un autre nom", "error")
      } else {
        showToast("❌ Aucun compte trouvé avec ces informations", "error")
      }
      return null
    }
  } catch (error) {
    console.error("Erreur de connexion:", error)
    showToast("❌ Erreur de connexion au serveur. Vérifiez votre connexion internet.", "error")
    return null
  }
}

export function createLoginForm(onSuccess) {
  const container = document.createElement("div")
  container.className = "min-h-screen flex items-center justify-center bg-[#111b21] px-4"

  container.innerHTML = `
    <div class="max-w-md w-full bg-[#222e35] rounded-lg shadow-xl p-8">
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fab fa-whatsapp text-3xl text-white"></i>
        </div>
        <h1 class="text-2xl font-bold text-white mb-2">WhatsApp Web</h1>
        <p class="text-gray-400">Connectez-vous pour continuer</p>
      </div>
      
      <form id="loginForm" class="space-y-4">
        <div>
          <input 
            type="text" 
            id="nameInput"
            placeholder="Votre nom" 
            class="w-full px-4 py-3 bg-[#2a3942] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all"
          >
        </div>
        
        <div>
          <input 
            type="tel" 
            id="phoneInput"
            placeholder="Numéro de téléphone (9 chiffres)" 
            class="w-full px-4 py-3 bg-[#2a3942] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all"
          >
        </div>
        
        <button 
          type="submit"
          id="loginButton"
          class="w-full py-3 bg-[#25D366] hover:bg-[#1ea952] text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Se connecter
        </button>
      </form>
      
      <div class="mt-6 p-4 bg-[#2a3942] rounded-lg">
        <p class="text-sm text-gray-400 mb-2">💡 Comptes de test disponibles :</p>
        <div class="space-y-1 text-xs text-gray-500">
          <div>• Zafe - 777867740</div>
          <div>• Abdallah - 778123456</div>
          <div>• Ousmane Marra - 776543210</div>
          <div>• Maman Dié ODC - 775555555</div>
          <div>• Zeynabe Ba - 774444444</div>
        </div>
      </div>
    </div>
  `

  // Gestionnaires d'événements
  const form = container.querySelector("#loginForm")
  const nameInput = container.querySelector("#nameInput")
  const phoneInput = container.querySelector("#phoneInput")
  const loginButton = container.querySelector("#loginButton")

  // Validation en temps réel du téléphone (sans bloquer)
  phoneInput.addEventListener("input", (e) => {
    // Permettre seulement les chiffres
    let value = e.target.value.replace(/[^0-9]/g, "")

    // Limiter à 9 chiffres
    if (value.length > 9) {
      value = value.substring(0, 9)
      showToast("⚠️ Maximum 9 chiffres autorisés", "warning")
    }

    e.target.value = value
  })

  // Validation en temps réel du nom
  nameInput.addEventListener("input", (e) => {
    let value = e.target.value

    // Limiter à 50 caractères
    if (value.length > 50) {
      value = value.substring(0, 50)
      showToast("⚠️ Maximum 50 caractères autorisés pour le nom", "warning")
      e.target.value = value
    }
  })

  // Soumission du formulaire
  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const name = nameInput.value.trim()
    const phone = phoneInput.value.trim()

    loginButton.disabled = true
    loginButton.innerHTML = `
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        Connexion en cours...
      </div>
    `

    try {
      const user = await login(name, phone)

      if (user && onSuccess) {
        onSuccess(user)
      }
    } finally {
      loginButton.disabled = false
      loginButton.textContent = "Se connecter"
    }
  })

  return container
}
