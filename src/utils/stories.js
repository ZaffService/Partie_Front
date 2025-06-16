import { showToast } from "./notifications.js"

const API_URL = "https://mon-serveur-cub8.onrender.com"

export async function getStories() {
  try {
    const response = await fetch(`${API_URL}/stories`)
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Erreur récupération stories:", error)
    return []
  }
}

export function createStoryModal(onStoryCreated) {
  const modal = document.createElement("div")
  modal.className = "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"

  modal.innerHTML = `
    <div class="bg-[#222e35] rounded-lg p-6 w-full max-w-md">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-white">Créer une story</h2>
        <button id="closeModal" class="text-gray-400 hover:text-white">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="createStoryForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Contenu de la story (image ou vidéo)
          </label>
          <input 
            type="file" 
            id="storyContent"
            accept="image/*, video/*"
            class="w-full px-4 py-3 bg-[#2a3942] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
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

  const closeModal = modal.querySelector("#closeModal")
  const cancelBtn = modal.querySelector("#cancelBtn")
  const form = modal.querySelector("#createStoryForm")
  const storyContentInput = modal.querySelector("#storyContent")

  const closeModalFn = () => {
    document.body.removeChild(modal)
  }

  closeModal.addEventListener("click", closeModalFn)
  cancelBtn.addEventListener("click", closeModalFn)

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const file = storyContentInput.files[0]
    if (!file) {
      showToast("Veuillez sélectionner un fichier", "error")
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
      // Simuler l'upload et la création de la story
      const story = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        contentUrl: "https://via.placeholder.com/300", // URL simulée
        timestamp: new Date().toISOString(),
        views: [],
        isMonetized: false,
        earnings: 0,
      }

      // Envoyer la story au serveur
      const response = await fetch(`${API_URL}/stories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(story),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      showToast("Story créée avec succès", "success")
      if (onStoryCreated) {
        onStoryCreated(story)
      }
      closeModalFn()
    } catch (error) {
      console.error("Erreur création story:", error)
      showToast("Erreur lors de la création de la story", "error")
    } finally {
      createBtn.disabled = false
      createBtn.textContent = "Créer"
    }
  })

  document.body.appendChild(modal)
}

export function createStoryViewer(stories, startIndex = 0) {
  let currentIndex = startIndex
  const modal = document.createElement("div")
  modal.className = "fixed inset-0 bg-black z-50 flex items-center justify-center p-4"

  function renderStory() {
    const story = stories[currentIndex]

    modal.innerHTML = `
      <div class="bg-[#222e35] rounded-lg p-6 w-full max-w-md relative">
        <button id="closeModal" class="absolute top-4 right-4 text-gray-400 hover:text-white">
          <i class="fas fa-times text-xl"></i>
        </button>
        
        <img src="${story.contentUrl}" alt="Story" class="w-full rounded-lg object-cover max-h-[70vh]">
        
        <div class="mt-4 flex items-center space-x-3">
          <img src="${story.userAvatar}" alt="${story.userName}" class="w-10 h-10 rounded-full object-cover">
          <div>
            <div class="text-white font-medium">${story.userName}</div>
            <div class="text-gray-400 text-sm">${formatStoryTime(story.timestamp)}</div>
          </div>
        </div>
        
        <div class="absolute bottom-4 left-4 right-4 flex justify-between">
          <button id="prevBtn" class="text-gray-400 hover:text-white"><i class="fas fa-chevron-left text-2xl"></i></button>
          <button id="nextBtn" class="text-gray-400 hover:text-white"><i class="fas fa-chevron-right text-2xl"></i></button>
        </div>
      </div>
    `

    const closeModal = modal.querySelector("#closeModal")
    closeModal.addEventListener("click", () => {
      document.body.removeChild(modal)
    })

    const prevBtn = modal.querySelector("#prevBtn")
    const nextBtn = modal.querySelector("#nextBtn")

    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + stories.length) % stories.length
      renderStory()
    })

    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % stories.length
      renderStory()
    })
  }

  renderStory()
  document.body.appendChild(modal)
}

function formatStoryTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()

  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 60) {
    return `${minutes} minutes`
  } else if (minutes < 1440) {
    return `${Math.floor(minutes / 60)} heures`
  } else {
    return `${Math.floor(minutes / 1440)} jours`
  }
}
