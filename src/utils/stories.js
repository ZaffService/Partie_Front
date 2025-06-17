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
  modal.className = "fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"

  modal.innerHTML = `
    <div class="bg-[#1f2937] rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-gray-700">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-white">Créer une story</h2>
        <button id="closeModal" class="text-gray-400 hover:text-white transition-colors p-2">
          <i class="fas fa-times text-2xl"></i>
        </button>
      </div>
      
      <form id="createStoryForm" class="space-y-6">
        <!-- Zone de drop pour fichier -->
        <div id="dropZone" class="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-green-500 transition-colors cursor-pointer">
          <div id="dropContent">
            <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
            <p class="text-white font-medium mb-2">Glissez votre photo/vidéo ici</p>
            <p class="text-gray-400 text-sm mb-4">ou cliquez pour sélectionner</p>
            <input 
              type="file" 
              id="storyContent"
              accept="image/*,video/*"
              class="hidden"
              required
            >
            <button type="button" id="selectFileBtn" class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Choisir un fichier
            </button>
          </div>
          
          <!-- Prévisualisation -->
          <div id="previewContainer" class="hidden">
            <div class="relative">
              <img id="imagePreview" class="hidden w-full h-48 object-cover rounded-lg mb-4">
              <video id="videoPreview" class="hidden w-full h-48 object-cover rounded-lg mb-4" controls></video>
              <button type="button" id="removeFile" class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <p id="fileName" class="text-white text-sm"></p>
          </div>
        </div>
        
        <!-- Options de story -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Texte sur la story (optionnel)
            </label>
            <input 
              type="text" 
              id="storyText"
              placeholder="Ajoutez du texte..."
              class="w-full px-4 py-3 bg-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-600"
            >
          </div>
          
          <div class="flex items-center space-x-3">
            <input type="checkbox" id="allowReplies" class="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500">
            <label for="allowReplies" class="text-gray-300">Autoriser les réponses</label>
          </div>
        </div>
        
        <div class="flex space-x-4">
          <button 
            type="button"
            id="cancelBtn"
            class="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
          >
            Annuler
          </button>
          <button 
            type="submit"
            id="createBtn"
            class="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          >
            Publier la story
          </button>
        </div>
      </form>
    </div>
  `

  document.body.appendChild(modal)
  setupStoryModal(modal, onStoryCreated)
}

function setupStoryModal(modal, onStoryCreated) {
  const closeModal = modal.querySelector("#closeModal")
  const cancelBtn = modal.querySelector("#cancelBtn")
  const form = modal.querySelector("#createStoryForm")
  const dropZone = modal.querySelector("#dropZone")
  const fileInput = modal.querySelector("#storyContent")
  const selectFileBtn = modal.querySelector("#selectFileBtn")
  const dropContent = modal.querySelector("#dropContent")
  const previewContainer = modal.querySelector("#previewContainer")
  const imagePreview = modal.querySelector("#imagePreview")
  const videoPreview = modal.querySelector("#videoPreview")
  const fileName = modal.querySelector("#fileName")
  const removeFile = modal.querySelector("#removeFile")

  const closeModalFn = () => document.body.removeChild(modal)

  closeModal.addEventListener("click", closeModalFn)
  cancelBtn.addEventListener("click", closeModalFn)
  selectFileBtn.addEventListener("click", () => fileInput.click())

  // Drag & Drop
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault()
    dropZone.classList.add("border-green-500")
  })

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("border-green-500")
  })

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault()
    dropZone.classList.remove("border-green-500")
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  })

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0])
    }
  })

  removeFile.addEventListener("click", () => {
    fileInput.value = ""
    dropContent.classList.remove("hidden")
    previewContainer.classList.add("hidden")
    imagePreview.classList.add("hidden")
    videoPreview.classList.add("hidden")
  })

  function handleFileSelect(file) {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      showToast("Veuillez sélectionner une image ou une vidéo", "error")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      dropContent.classList.add("hidden")
      previewContainer.classList.remove("hidden")
      fileName.textContent = file.name

      if (file.type.startsWith("image/")) {
        imagePreview.src = e.target.result
        imagePreview.classList.remove("hidden")
        videoPreview.classList.add("hidden")
      } else {
        videoPreview.src = e.target.result
        videoPreview.classList.remove("hidden")
        imagePreview.classList.add("hidden")
      }
    }
    reader.readAsDataURL(file)
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const file = fileInput.files[0]
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
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        Publication...
      </div>
    `

    try {
      // Convertir le fichier en base64
      const base64Content = await fileToBase64(file)
      const storyText = modal.querySelector("#storyText").value.trim()
      const allowReplies = modal.querySelector("#allowReplies").checked

      const story = {
        id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        contentUrl: base64Content,
        contentType: file.type,
        text: storyText,
        allowReplies: allowReplies,
        timestamp: new Date().toISOString(),
        views: [],
        replies: [],
        isMonetized: false,
        earnings: 0,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
      }

      // Envoyer au serveur
      const response = await fetch(`${API_URL}/stories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(story),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      showToast("✅ Story publiée avec succès", "success")
      if (onStoryCreated) {
        onStoryCreated(story)
      }
      closeModalFn()
    } catch (error) {
      console.error("Erreur création story:", error)
      showToast("❌ Erreur lors de la publication", "error")
    } finally {
      createBtn.disabled = false
      createBtn.textContent = "Publier la story"
    }
  })
}

export function createWhatsAppStoryViewer(stories, startIndex = 0) {
  if (!stories || stories.length === 0) {
    showToast("Aucune story à afficher", "error")
    return
  }

  let currentIndex = startIndex
  let progressInterval = null
  let currentStory = stories[currentIndex]
  let startTime = Date.now()

  // Créer l'interface plein écran comme WhatsApp
  const storyViewer = document.createElement("div")
  storyViewer.id = "storyViewer"
  storyViewer.className = "fixed inset-0 bg-black z-50 flex flex-col"

  function renderCurrentStory() {
    currentStory = stories[currentIndex]
    const isVideo = currentStory.contentType?.startsWith("video/")
    const storyDuration = isVideo ? 15000 : 5000 // 15s pour vidéo, 5s pour image

    storyViewer.innerHTML = `
      <!-- Barres de progression en haut -->
      <div class="absolute top-4 left-4 right-4 z-20">
        <div class="flex space-x-1">
          ${stories
            .map(
              (_, index) => `
            <div class="flex-1 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <div class="progress-bar h-full bg-white transition-all duration-100 ${
                index < currentIndex ? "w-full" : index === currentIndex ? "w-0" : "w-0"
              }" data-story-index="${index}"></div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>

      <!-- Header avec info utilisateur -->
      <div class="absolute top-12 left-4 right-4 z-20 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <img src="${currentStory.userAvatar}" alt="${currentStory.userName}" 
               class="w-10 h-10 rounded-full border-2 border-white object-cover">
          <div>
            <div class="text-white font-medium text-sm">${currentStory.userName}</div>
            <div class="text-white text-opacity-80 text-xs">${formatStoryTime(currentStory.timestamp)}</div>
          </div>
        </div>
        
        <button id="closeStoryViewer" class="text-white text-opacity-80 hover:text-white p-2">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Contenu principal -->
      <div class="flex-1 relative flex items-center justify-center">
        ${
          isVideo
            ? `
          <video id="storyVideo" class="max-w-full max-h-full object-contain" autoplay muted>
            <source src="${currentStory.contentUrl}" type="${currentStory.contentType}">
          </video>
        `
            : `
          <img id="storyImage" src="${currentStory.contentUrl}" alt="Story" 
               class="max-w-full max-h-full object-contain">
        `
        }
        
        <!-- Texte sur la story -->
        ${
          currentStory.text
            ? `
          <div class="absolute bottom-20 left-4 right-4 text-center">
            <div class="bg-black bg-opacity-50 rounded-lg px-4 py-2 inline-block">
              <p class="text-white text-lg font-medium">${currentStory.text}</p>
            </div>
          </div>
        `
            : ""
        }

        <!-- Zones de navigation invisibles -->
        <div class="absolute inset-0 flex">
          <div id="prevArea" class="w-1/3 h-full cursor-pointer"></div>
          <div id="pauseArea" class="w-1/3 h-full cursor-pointer"></div>
          <div id="nextArea" class="w-1/3 h-full cursor-pointer"></div>
        </div>
      </div>

      <!-- Footer avec actions -->
      <div class="absolute bottom-4 left-4 right-4 z-20">
        ${
          currentStory.allowReplies
            ? `
          <div class="flex items-center space-x-3">
            <input type="text" placeholder="Répondre à ${currentStory.userName}..." 
                   class="flex-1 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 px-4 py-2 rounded-full focus:outline-none focus:bg-opacity-30">
            <button class="text-white text-opacity-80 hover:text-white p-2">
              <i class="fas fa-heart text-xl"></i>
            </button>
            <button class="text-white text-opacity-80 hover:text-white p-2">
              <i class="fas fa-share text-xl"></i>
            </button>
          </div>
        `
            : `
          <div class="flex justify-center space-x-6">
            <button class="text-white text-opacity-80 hover:text-white p-2">
              <i class="fas fa-heart text-xl"></i>
            </button>
            <button class="text-white text-opacity-80 hover:text-white p-2">
              <i class="fas fa-share text-xl"></i>
            </button>
          </div>
        `
        }
      </div>
    `

    // Démarrer la progression automatique
    startStoryProgress(storyDuration)
    setupStoryNavigation()
  }

  function startStoryProgress(duration) {
    clearInterval(progressInterval)
    startTime = Date.now()

    const progressBar = storyViewer.querySelector(`[data-story-index="${currentIndex}"]`)
    if (!progressBar) return

    progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / duration) * 100, 100)

      progressBar.style.width = `${progress}%`

      if (progress >= 100) {
        clearInterval(progressInterval)
        nextStory()
      }
    }, 50)
  }

  function setupStoryNavigation() {
    const closeBtn = storyViewer.querySelector("#closeStoryViewer")
    const prevArea = storyViewer.querySelector("#prevArea")
    const pauseArea = storyViewer.querySelector("#pauseArea")
    const nextArea = storyViewer.querySelector("#nextArea")

    closeBtn?.addEventListener("click", closeStoryViewer)
    prevArea?.addEventListener("click", prevStory)
    nextArea?.addEventListener("click", nextStory)

    // Pause/Resume sur tap au centre
    let isPaused = false
    pauseArea?.addEventListener("click", () => {
      if (isPaused) {
        resumeStory()
      } else {
        pauseStory()
      }
      isPaused = !isPaused
    })

    // Navigation clavier
    document.addEventListener("keydown", handleKeyNavigation)
  }

  function nextStory() {
    if (currentIndex < stories.length - 1) {
      currentIndex++
      renderCurrentStory()
    } else {
      closeStoryViewer()
    }
  }

  function prevStory() {
    if (currentIndex > 0) {
      currentIndex--
      renderCurrentStory()
    }
  }

  function pauseStory() {
    clearInterval(progressInterval)
    const video = storyViewer.querySelector("#storyVideo")
    if (video) video.pause()
  }

  function resumeStory() {
    const elapsed = Date.now() - startTime
    const isVideo = currentStory.contentType?.startsWith("video/")
    const storyDuration = isVideo ? 15000 : 5000
    const remaining = storyDuration - elapsed

    if (remaining > 0) {
      startStoryProgress(remaining)
    }

    const video = storyViewer.querySelector("#storyVideo")
    if (video) video.play()
  }

  function handleKeyNavigation(e) {
    switch (e.key) {
      case "ArrowLeft":
        prevStory()
        break
      case "ArrowRight":
      case " ":
        nextStory()
        break
      case "Escape":
        closeStoryViewer()
        break
    }
  }

  function closeStoryViewer() {
    clearInterval(progressInterval)
    document.removeEventListener("keydown", handleKeyNavigation)
    document.body.removeChild(storyViewer)
  }

  // Initialiser
  document.body.appendChild(storyViewer)
  renderCurrentStory()

  // Marquer comme vue
  markStoryAsViewed(currentStory.id)
}

// Fonction pour marquer une story comme vue
async function markStoryAsViewed(storyId) {
  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    if (!currentUser) return

    await fetch(`${API_URL}/stories/${storyId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id }),
    })
  } catch (error) {
    console.error("Erreur marquage vue story:", error)
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatStoryTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `${minutes} min`
  if (hours < 24) return `${hours}h`
  return `${days}j`
}

// Fonction pour créer l'interface de stories dans la sidebar
export function createStoriesInterface() {
  return `
    <div class="p-4">
      <!-- Votre story -->
      <div id="myStoryContainer" class="mb-4">
        <div class="flex items-center space-x-3 p-3 hover:bg-[#202c33] rounded-lg cursor-pointer transition-colors">
          <div class="relative">
            <img id="myStoryAvatar" src="/placeholder.svg" alt="Votre story" class="w-14 h-14 rounded-full object-cover border-2 border-dashed border-gray-500">
            <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#111b21]">
              <i class="fas fa-plus text-white text-xs"></i>
            </div>
          </div>
          <div>
            <div class="text-white font-medium">Mon statut</div>
            <div class="text-gray-400 text-sm">Appuyez pour ajouter</div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-gray-700 mb-4"></div>

      <!-- Stories des autres -->
      <div id="storiesList" class="space-y-2">
        <!-- Les stories seront chargées ici -->
      </div>
    </div>
  `
}

// Export de la fonction principale pour remplacer l'ancienne
export const createStoryViewer = createWhatsAppStoryViewer
