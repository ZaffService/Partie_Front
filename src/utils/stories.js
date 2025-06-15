import { showToast } from "./notifications.js"

const API_URL = "https://mon-serveur-cub8.onrender.com"

export async function createStory(userId, type, content, caption = "", backgroundColor = null) {
  try {
    // Validation personnalisée
    if (!content) {
      if (type === "text") {
        showToast("❌ Veuillez saisir du texte pour votre story", "error")
      } else {
        showToast("❌ Veuillez sélectionner une image pour votre story", "error")
      }
      return null
    }

    if (type === "text") {
      if (content.length < 1) {
        showToast("❌ Votre story ne peut pas être vide", "error")
        return null
      }

      if (content.length > 200) {
        showToast("❌ Votre story ne peut pas dépasser 200 caractères", "error")
        return null
      }
    }

    if (caption && caption.length > 100) {
      showToast("❌ La légende ne peut pas dépasser 100 caractères", "error")
      return null
    }

    const userResponse = await fetch(`${API_URL}/users/${userId}`)

    if (!userResponse.ok) {
      showToast("❌ Erreur lors de la récupération de vos informations", "error")
      return null
    }

    const user = await userResponse.json()

    const story = {
      id: `story_${Date.now()}`,
      userId: userId,
      userName: user.name,
      userAvatar: user.avatar,
      type: type, // 'text', 'image', 'video'
      content: content,
      caption: caption,
      backgroundColor: backgroundColor,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
      views: [],
      likes: [],
      comments: [],
      isMonetized: false,
      earnings: 0,
    }

    const response = await fetch(`${API_URL}/stories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(story),
    })

    if (!response.ok) {
      showToast("❌ Erreur lors de la publication de votre story", "error")
      return null
    }

    showToast("✅ Story publiée avec succès ! 🎉", "success")
    return await response.json()
  } catch (error) {
    console.error("Erreur création story:", error)
    showToast("❌ Erreur de connexion. Vérifiez votre connexion internet.", "error")
    return null
  }
}

export async function getStories() {
  try {
    const response = await fetch(`${API_URL}/stories`)
    const stories = await response.json()

    // Filtrer les stories expirées
    const now = new Date()
    const activeStories = stories.filter((story) => new Date(story.expiresAt) > now)

    // Supprimer les stories expirées de la base
    const expiredStories = stories.filter((story) => new Date(story.expiresAt) <= now)
    for (const story of expiredStories) {
      await fetch(`${API_URL}/stories/${story.id}`, { method: "DELETE" })
    }

    return activeStories
  } catch (error) {
    console.error("Erreur récupération stories:", error)
    return []
  }
}

export async function viewStory(storyId, viewerId) {
  try {
    const response = await fetch(`${API_URL}/stories/${storyId}`)
    const story = await response.json()

    if (!story.views.includes(viewerId)) {
      story.views.push(viewerId)

      await fetch(`${API_URL}/stories/${storyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(story),
      })
    }

    return story
  } catch (error) {
    console.error("Erreur vue story:", error)
    return null
  }
}

export async function likeStory(storyId, userId) {
  try {
    console.log(`💖 Tentative de like story ${storyId} par user ${userId}`)

    const response = await fetch(`${API_URL}/stories/${storyId}`)
    if (!response.ok) {
      throw new Error(`Erreur récupération story: ${response.status}`)
    }

    const story = await response.json()
    console.log(`📖 Story récupérée:`, story)

    const likeIndex = story.likes.findIndex((like) => like.userId === userId)

    if (likeIndex === -1) {
      // Ajouter le like
      story.likes.push({
        userId: userId,
        timestamp: new Date().toISOString(),
      })
      console.log(`✅ Like ajouté ! Total: ${story.likes.length} likes`)
      showToast("❤️ Story likée !", "success")
    } else {
      // Retirer le like
      story.likes.splice(likeIndex, 1)
      console.log(`❌ Like retiré ! Total: ${story.likes.length} likes`)
      showToast("💔 Like retiré", "info")
    }

    // Sauvegarder la story mise à jour
    const updateResponse = await fetch(`${API_URL}/stories/${storyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(story),
    })

    if (!updateResponse.ok) {
      throw new Error(`Erreur sauvegarde story: ${updateResponse.status}`)
    }

    console.log(`💾 Story sauvegardée avec ${story.likes.length} likes`)

    // Vérifier la monétisation
    await checkMonetization(story)

    return story
  } catch (error) {
    console.error("❌ Erreur like story:", error)
    showToast("❌ Erreur lors du like. Réessayez.", "error")
    return null
  }
}

async function checkMonetization(story) {
  try {
    console.log(`🔍 Vérification monétisation pour story ${story.id}`)

    // Récupérer les paramètres de monétisation
    const monetizationResponse = await fetch(`${API_URL}/monetization`)
    if (!monetizationResponse.ok) {
      throw new Error(`Erreur récupération monétisation: ${monetizationResponse.status}`)
    }

    const monetization = await monetizationResponse.json()
    const { likesThreshold, timeWindow, rewardAmount } = monetization.settings

    // Vérifier si la story a atteint le seuil dans les 24h
    const storyAge = (Date.now() - new Date(story.timestamp).getTime()) / (1000 * 60 * 60)

    console.log(`📊 Story ${story.id}:`)
    console.log(`   - Likes: ${story.likes.length}/${likesThreshold}`)
    console.log(`   - Âge: ${storyAge.toFixed(1)}h/${timeWindow}h`)
    console.log(`   - Déjà monétisée: ${story.isMonetized}`)

    if (story.likes.length >= likesThreshold && storyAge <= timeWindow && !story.isMonetized) {
      console.log(`🎉 MONÉTISATION DÉCLENCHÉE !`)

      // Marquer comme monétisée
      story.isMonetized = true
      story.earnings = rewardAmount

      // Sauvegarder la story monétisée
      const storyUpdateResponse = await fetch(`${API_URL}/stories/${story.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(story),
      })

      if (!storyUpdateResponse.ok) {
        throw new Error(`Erreur sauvegarde story monétisée: ${storyUpdateResponse.status}`)
      }

      // Créditer l'utilisateur
      const creditSuccess = await creditUser(story.userId, rewardAmount)

      if (creditSuccess) {
        // Enregistrer la transaction
        await recordTransaction(story.userId, story.id, rewardAmount)

        // Notification spéciale
        showToast(`🎉 FÉLICITATIONS ! ${story.userName} a gagné ${rewardAmount} FCFA pour sa story !`, "success")

        // Notification sonore
        playMonetizationSound()

        console.log(`💰 ${story.userName} a gagné ${rewardAmount} FCFA !`)
      }
    } else {
      console.log(`⏳ Pas encore de monétisation (${story.likes.length}/${likesThreshold} likes)`)
    }
  } catch (error) {
    console.error("❌ Erreur vérification monétisation:", error)
  }
}

function playMonetizationSound() {
  try {
    // Créer un son de célébration
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()

    // Son de pièce qui tombe
    const oscillator1 = audioContext.createOscillator()
    const gainNode1 = audioContext.createGain()

    oscillator1.connect(gainNode1)
    gainNode1.connect(audioContext.destination)

    oscillator1.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator1.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
    oscillator1.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2)

    gainNode1.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

    oscillator1.start(audioContext.currentTime)
    oscillator1.stop(audioContext.currentTime + 0.3)
  } catch (error) {
    console.log("Impossible de jouer le son de monétisation:", error)
  }
}

async function creditUser(userId, amount) {
  try {
    console.log(`💳 Crédit de ${amount} FCFA pour user ${userId}`)

    const userResponse = await fetch(`${API_URL}/users/${userId}`)
    if (!userResponse.ok) {
      throw new Error(`Erreur récupération user: ${userResponse.status}`)
    }

    const user = await userResponse.json()

    const oldBalance = user.walletBalance || 0
    const oldEarnings = user.totalEarnings || 0

    user.walletBalance = oldBalance + amount
    user.totalEarnings = oldEarnings + amount

    const updateResponse = await fetch(`${API_URL}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })

    if (!updateResponse.ok) {
      throw new Error(`Erreur mise à jour user: ${updateResponse.status}`)
    }

    console.log(`✅ Utilisateur ${user.name} crédité:`)
    console.log(`   - Ancien solde: ${oldBalance} FCFA`)
    console.log(`   - Nouveau solde: ${user.walletBalance} FCFA`)
    console.log(`   - Gains totaux: ${user.totalEarnings} FCFA`)

    // Mettre à jour l'utilisateur local si c'est lui
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
    if (currentUser.id === userId) {
      currentUser.walletBalance = user.walletBalance
      currentUser.totalEarnings = user.totalEarnings
      localStorage.setItem("currentUser", JSON.stringify(currentUser))
      console.log(`🔄 Utilisateur local mis à jour`)
    }

    return true
  } catch (error) {
    console.error("❌ Erreur crédit utilisateur:", error)
    return false
  }
}

async function recordTransaction(userId, storyId, amount) {
  try {
    const monetizationResponse = await fetch(`${API_URL}/monetization`)
    if (!monetizationResponse.ok) {
      throw new Error(`Erreur récupération monétisation: ${monetizationResponse.status}`)
    }

    const monetization = await monetizationResponse.json()

    const transaction = {
      id: `tx_${Date.now()}`,
      userId: userId,
      storyId: storyId,
      amount: amount,
      type: "story_reward",
      timestamp: new Date().toISOString(),
    }

    monetization.transactions.push(transaction)

    const updateResponse = await fetch(`${API_URL}/monetization`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(monetization),
    })

    if (!updateResponse.ok) {
      throw new Error(`Erreur sauvegarde transaction: ${updateResponse.status}`)
    }

    console.log(`📝 Transaction enregistrée:`, transaction)
  } catch (error) {
    console.error("❌ Erreur enregistrement transaction:", error)
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
      
      <div class="space-y-4">
        <!-- Type de story -->
        <div class="flex space-x-2">
          <button id="textStoryBtn" class="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg story-type-btn active">
            <i class="fas fa-font mr-2"></i>Texte
          </button>
          <button id="imageStoryBtn" class="flex-1 py-3 px-4 bg-gray-600 text-white rounded-lg story-type-btn">
            <i class="fas fa-image mr-2"></i>Image
          </button>
        </div>
        
        <!-- Zone de contenu -->
        <div id="textStoryContent" class="story-content">
          <textarea 
            id="storyText"
            placeholder="Écrivez votre story..."
            class="w-full h-32 px-4 py-3 bg-[#2a3942] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          ></textarea>
          
          <div class="text-right text-xs text-gray-400 mt-1">
            <span id="textCounter">0/200 caractères</span>
          </div>
          
          <div class="flex space-x-2 mt-3">
            <button class="color-btn w-8 h-8 rounded-full bg-green-500 ring-2 ring-white" data-color="#25D366"></button>
            <button class="color-btn w-8 h-8 rounded-full bg-blue-500" data-color="#3B82F6"></button>
            <button class="color-btn w-8 h-8 rounded-full bg-purple-500" data-color="#8B5CF6"></button>
            <button class="color-btn w-8 h-8 rounded-full bg-red-500" data-color="#EF4444"></button>
            <button class="color-btn w-8 h-8 rounded-full bg-yellow-500" data-color="#F59E0B"></button>
          </div>
        </div>
        
        <div id="imageStoryContent" class="story-content hidden">
          <input type="file" id="storyImage" accept="image/*" class="hidden">
          <button id="selectImageBtn" class="w-full py-8 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors">
            <i class="fas fa-cloud-upload-alt text-3xl mb-2"></i>
            <div>Sélectionner une image</div>
            <div class="text-xs mt-1">JPG, PNG, GIF (max 5MB)</div>
          </button>
          <div id="imagePreview" class="hidden mt-4">
            <img id="previewImg" class="w-full h-48 object-cover rounded-lg">
          </div>
          <input 
            type="text" 
            id="imageCaption"
            placeholder="Ajouter une légende..."
            class="w-full mt-3 px-4 py-2 bg-[#2a3942] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
          <div class="text-right text-xs text-gray-400 mt-1">
            <span id="captionCounter">0/100 caractères</span>
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
            id="publishBtn"
            class="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Publier
          </button>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // Variables
  let selectedColor = "#25D366"
  let selectedImage = null
  let storyType = "text"

  // Elements
  const closeModal = modal.querySelector("#closeModal")
  const cancelBtn = modal.querySelector("#cancelBtn")
  const publishBtn = modal.querySelector("#publishBtn")
  const textStoryBtn = modal.querySelector("#textStoryBtn")
  const imageStoryBtn = modal.querySelector("#imageStoryBtn")
  const textContent = modal.querySelector("#textStoryContent")
  const imageContent = modal.querySelector("#imageStoryContent")
  const storyImage = modal.querySelector("#storyImage")
  const selectImageBtn = modal.querySelector("#selectImageBtn")
  const imagePreview = modal.querySelector("#imagePreview")
  const previewImg = modal.querySelector("#previewImg")
  const storyText = modal.querySelector("#storyText")
  const imageCaption = modal.querySelector("#imageCaption")
  const textCounter = modal.querySelector("#textCounter")
  const captionCounter = modal.querySelector("#captionCounter")

  // Event listeners
  const closeModalFn = () => document.body.removeChild(modal)

  closeModal.addEventListener("click", closeModalFn)
  cancelBtn.addEventListener("click", closeModalFn)

  // Compteurs de caractères
  storyText.addEventListener("input", (e) => {
    const length = e.target.value.length
    textCounter.textContent = `${length}/200 caractères`

    if (length > 200) {
      e.target.value = e.target.value.substring(0, 200)
      textCounter.textContent = "200/200 caractères"
      showToast("⚠️ Maximum 200 caractères autorisés", "warning")
    }

    if (length > 180) {
      textCounter.style.color = "#ef4444"
    } else if (length > 150) {
      textCounter.style.color = "#f59e0b"
    } else {
      textCounter.style.color = "#9ca3af"
    }
  })

  imageCaption.addEventListener("input", (e) => {
    const length = e.target.value.length
    captionCounter.textContent = `${length}/100 caractères`

    if (length > 100) {
      e.target.value = e.target.value.substring(0, 100)
      captionCounter.textContent = "100/100 caractères"
      showToast("⚠️ Maximum 100 caractères autorisés pour la légende", "warning")
    }

    if (length > 80) {
      captionCounter.style.color = "#ef4444"
    } else if (length > 60) {
      captionCounter.style.color = "#f59e0b"
    } else {
      captionCounter.style.color = "#9ca3af"
    }
  })

  // Type de story
  textStoryBtn.addEventListener("click", () => {
    storyType = "text"
    textStoryBtn.classList.add("active", "bg-green-600")
    textStoryBtn.classList.remove("bg-gray-600")
    imageStoryBtn.classList.remove("active", "bg-green-600")
    imageStoryBtn.classList.add("bg-gray-600")
    textContent.classList.remove("hidden")
    imageContent.classList.add("hidden")
  })

  imageStoryBtn.addEventListener("click", () => {
    storyType = "image"
    imageStoryBtn.classList.add("active", "bg-green-600")
    imageStoryBtn.classList.remove("bg-gray-600")
    textStoryBtn.classList.remove("active", "bg-green-600")
    textStoryBtn.classList.add("bg-gray-600")
    imageContent.classList.remove("hidden")
    textContent.classList.add("hidden")
  })

  // Couleurs
  modal.querySelectorAll(".color-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      modal.querySelectorAll(".color-btn").forEach((b) => b.classList.remove("ring-2", "ring-white"))
      btn.classList.add("ring-2", "ring-white")
      selectedColor = btn.dataset.color
    })
  })

  // Image
  selectImageBtn.addEventListener("click", () => storyImage.click())

  storyImage.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validation de l'image
      if (!file.type.startsWith("image/")) {
        showToast("❌ Veuillez sélectionner un fichier image valide", "error")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        showToast("❌ L'image ne doit pas dépasser 5MB", "error")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        selectedImage = e.target.result
        previewImg.src = selectedImage
        imagePreview.classList.remove("hidden")
        selectImageBtn.classList.add("hidden")
        showToast("✅ Image sélectionnée avec succès", "success")
      }
      reader.readAsDataURL(file)
    }
  })

  // Publier
  publishBtn.addEventListener("click", async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    if (!currentUser) {
      showToast("❌ Erreur: utilisateur non connecté", "error")
      return
    }

    publishBtn.disabled = true
    publishBtn.innerHTML = `
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Publication...
      </div>
    `

    try {
      let story = null

      if (storyType === "text") {
        const text = storyText.value.trim()
        story = await createStory(currentUser.id, "text", text, "", selectedColor)
      } else {
        const caption = imageCaption.value.trim()
        story = await createStory(currentUser.id, "image", selectedImage, caption)
      }

      if (story && onStoryCreated) {
        onStoryCreated(story)
      }

      closeModalFn()
    } finally {
      publishBtn.disabled = false
      publishBtn.textContent = "Publier"
    }
  })
}

export function createStoryViewer(stories, initialIndex = 0) {
  const viewer = document.createElement("div")
  viewer.className = "fixed inset-0 bg-black z-50 flex items-center justify-center"

  let currentIndex = initialIndex
  let currentStory = stories[currentIndex]
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  viewer.innerHTML = `
    <div class="relative w-full h-full max-w-md mx-auto">
      <!-- Header -->
      <div class="absolute top-0 left-0 right-0 z-10 p-4">
        <div class="flex items-center justify-between text-white">
          <div class="flex items-center space-x-3">
            <img src="${currentStory.userAvatar}" alt="${currentStory.userName}" class="w-10 h-10 rounded-full">
            <div>
              <div class="font-medium">${currentStory.userName}</div>
              <div class="text-sm text-gray-300">${formatStoryTime(currentStory.timestamp)}</div>
            </div>
          </div>
          <button id="closeViewer" class="text-white hover:text-gray-300">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <!-- Progress bars -->
        <div class="flex space-x-1 mt-4">
          ${stories
            .map(
              (_, index) => `
            <div class="flex-1 h-1 bg-gray-600 rounded">
              <div class="progress-bar h-full bg-white rounded transition-all duration-300" style="width: ${index < currentIndex ? "100%" : index === currentIndex ? "0%" : "0%"}"></div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
      
      <!-- Content -->
      <div id="storyContent" class="w-full h-full flex items-center justify-center">
        ${renderStoryContent(currentStory)}
      </div>
      
      <!-- Navigation -->
      <div class="absolute inset-0 flex">
        <button id="prevStory" class="flex-1 z-20"></button>
        <button id="nextStory" class="flex-1 z-20"></button>
      </div>
      
      <!-- Actions -->
      <div class="absolute bottom-0 left-0 right-0 p-4">
        <div class="flex items-center justify-between text-white">
          <div class="flex items-center space-x-4">
            <button id="likeBtn" class="like-button flex items-center space-x-2 transition-all duration-200 transform hover:scale-110 ${currentStory.likes.some((like) => like.userId === currentUser?.id) ? "text-red-500 scale-110" : "text-white hover:text-red-300"}">
              <i class="fas fa-heart text-3xl drop-shadow-lg"></i>
              <span class="font-bold text-lg">${currentStory.likes.length}</span>
            </button>
            <button class="flex items-center space-x-2 text-blue-400">
              <i class="fas fa-eye text-xl"></i>
              <span>${currentStory.views.length}</span>
            </button>
          </div>
          
          <div class="flex items-center space-x-2">
            ${
              currentStory.isMonetized
                ? `
              <div class="bg-green-500 px-3 py-1 rounded-full text-sm animate-pulse flex items-center space-x-1">
                <i class="fas fa-coins text-yellow-300"></i>
                <span class="font-bold">${currentStory.earnings} FCFA</span>
              </div>
            `
                : `
              <div class="bg-gray-700 px-3 py-1 rounded-full text-xs">
                ${currentStory.likes.length}/3 ❤️
              </div>
            `
            }
          </div>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(viewer)

  // Marquer comme vue
  if (currentUser) {
    viewStory(currentStory.id, currentUser.id)
  }

  // Event listeners
  viewer.querySelector("#closeViewer").addEventListener("click", () => {
    document.body.removeChild(viewer)
  })

  viewer.querySelector("#likeBtn").addEventListener("click", async () => {
    if (currentUser) {
      const likeBtn = viewer.querySelector("#likeBtn")

      // Animation de like plus visible
      likeBtn.style.transform = "scale(1.5)"
      likeBtn.style.transition = "transform 0.2s ease"

      // Effet de particules
      createHeartParticles(likeBtn)

      setTimeout(() => {
        likeBtn.style.transform = "scale(1.1)"
      }, 200)

      console.log(`🔄 Clic sur like pour story ${currentStory.id}`)

      const updatedStory = await likeStory(currentStory.id, currentUser.id)
      if (updatedStory) {
        currentStory = updatedStory
        stories[currentIndex] = updatedStory // Mettre à jour dans le tableau
        updateLikeButton()
        updateMonetizationDisplay()
      }
    } else {
      showToast("❌ Connectez-vous pour liker les stories", "error")
    }
  })

  function createHeartParticles(button) {
    for (let i = 0; i < 5; i++) {
      const heart = document.createElement("div")
      heart.innerHTML = "❤️"
      heart.style.position = "absolute"
      heart.style.fontSize = "20px"
      heart.style.pointerEvents = "none"
      heart.style.zIndex = "1000"

      const rect = button.getBoundingClientRect()
      heart.style.left = rect.left + Math.random() * rect.width + "px"
      heart.style.top = rect.top + "px"

      document.body.appendChild(heart)

      // Animation
      heart.animate(
        [
          { transform: "translateY(0px) scale(1)", opacity: 1 },
          { transform: "translateY(-50px) scale(0.5)", opacity: 0 },
        ],
        {
          duration: 1000,
          easing: "ease-out",
        },
      ).onfinish = () => heart.remove()
    }
  }

  function updateLikeButton() {
    const likeBtn = viewer.querySelector("#likeBtn")
    const isLiked = currentStory.likes.some((like) => like.userId === currentUser?.id)

    likeBtn.className = `like-button flex items-center space-x-2 transition-all duration-200 transform hover:scale-110 ${isLiked ? "text-red-500 scale-110" : "text-white hover:text-red-300"}`
    likeBtn.querySelector("span").textContent = currentStory.likes.length

    console.log(`💖 Bouton like mis à jour: ${currentStory.likes.length} likes, isLiked: ${isLiked}`)
  }

  function updateMonetizationDisplay() {
    const actionsDiv = viewer.querySelector(
      ".absolute.bottom-0 .flex.items-center.justify-between .flex.items-center.space-x-2",
    )

    if (currentStory.isMonetized) {
      actionsDiv.innerHTML = `
        <div class="bg-green-500 px-3 py-1 rounded-full text-sm animate-pulse flex items-center space-x-1">
          <i class="fas fa-coins text-yellow-300"></i>
          <span class="font-bold">${currentStory.earnings} FCFA</span>
        </div>
      `
    } else {
      actionsDiv.innerHTML = `
        <div class="bg-gray-700 px-3 py-1 rounded-full text-xs">
          ${currentStory.likes.length}/3 ❤️
        </div>
      `
    }
  }

  // Auto-progress (plus lent pour permettre l'interaction)
  let progressInterval = setInterval(() => {
    const progressBar = viewer.querySelector(".progress-bar")
    let width = Number.parseFloat(progressBar.style.width) || 0
    width += 0.5 // Plus lent pour tester
    progressBar.style.width = width + "%"

    if (width >= 100) {
      nextStory()
    }
  }, 200) // Plus lent

  function nextStory() {
    clearInterval(progressInterval)
    if (currentIndex < stories.length - 1) {
      currentIndex++
      updateStory()
    } else {
      document.body.removeChild(viewer)
    }
  }

  function prevStory() {
    clearInterval(progressInterval)
    if (currentIndex > 0) {
      currentIndex--
      updateStory()
    }
  }

  function updateStory() {
    currentStory = stories[currentIndex]
    viewer.querySelector("#storyContent").innerHTML = renderStoryContent(currentStory)

    // Update progress bars
    viewer.querySelectorAll(".progress-bar").forEach((bar, index) => {
      if (index < currentIndex) {
        bar.style.width = "100%"
      } else if (index === currentIndex) {
        bar.style.width = "0%"
      } else {
        bar.style.width = "0%"
      }
    })

    // Update header
    const header = viewer.querySelector(".flex.items-center.space-x-3")
    header.innerHTML = `
      <img src="${currentStory.userAvatar}" alt="${currentStory.userName}" class="w-10 h-10 rounded-full">
      <div>
        <div class="font-medium">${currentStory.userName}</div>
        <div class="text-sm text-gray-300">${formatStoryTime(currentStory.timestamp)}</div>
      </div>
    `

    updateLikeButton()
    updateMonetizationDisplay()

    // Restart progress
    progressInterval = setInterval(() => {
      const progressBar = viewer.querySelectorAll(".progress-bar")[currentIndex]
      let width = Number.parseFloat(progressBar.style.width) || 0
      width += 0.5
      progressBar.style.width = width + "%"

      if (width >= 100) {
        nextStory()
      }
    }, 200)

    // Mark as viewed
    if (currentUser) {
      viewStory(currentStory.id, currentUser.id)
    }
  }

  viewer.querySelector("#nextStory").addEventListener("click", nextStory)
  viewer.querySelector("#prevStory").addEventListener("click", prevStory)
}

function renderStoryContent(story) {
  if (story.type === "text") {
    return `
      <div class="w-full h-full flex items-center justify-center p-8" style="background: ${story.backgroundColor}">
        <div class="text-white text-2xl font-medium text-center leading-relaxed">
          ${story.content}
        </div>
      </div>
    `
  } else if (story.type === "image") {
    return `
      <div class="w-full h-full relative">
        <img src="${story.content}" alt="Story" class="w-full h-full object-cover">
        ${
          story.caption
            ? `
          <div class="absolute bottom-20 left-0 right-0 p-4">
            <div class="bg-black bg-opacity-50 rounded-lg p-3 text-white">
              ${story.caption}
            </div>
          </div>
        `
            : ""
        }
      </div>
    `
  }
  return ""
}

function formatStoryTime(timestamp) {
  const now = new Date()
  const storyTime = new Date(timestamp)
  const diffInHours = Math.floor((now - storyTime) / (1000 * 60 * 60))

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - storyTime) / (1000 * 60))
    return `il y a ${diffInMinutes}m`
  } else {
    return `il y a ${diffInHours}h`
  }
}
