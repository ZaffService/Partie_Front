import { getCurrentUser, createLoginForm, logout } from "./utils/auth.js"
import { getChats, updateChat, addMessage, getMessages } from "./utils/api.js"
import { showToast, showNotification, requestNotificationPermission } from "./utils/notifications.js"
import { initializeCall } from "./utils/webrtc.js"
import { initializeRealTimeSync } from "./utils/realtime.js"
import { handleSendMessage } from "./utils/chat-handler.js"
import { setupAudioRecorder } from "./utils/audio-recorder.js"
import { createAddContactModal } from "./utils/contacts.js"
import { createStoryModal, getStories, createStoryViewer } from "./utils/stories.js"
import { createGroupModal, getGroups } from "./utils/groups.js"

let chats = []
let currentChat = null
let currentView = "chats" // Variable pour tracker la vue actuelle
let isNavigating = false // Variable pour empêcher les conflits de navigation
// Rendre currentChat accessible globalement pour les modules
window.currentChat = null
const realTimeInterval = null
const typingTimeout = null

document.addEventListener("DOMContentLoaded", () => {
  console.log("Application démarrée")
  initApp()
})

async function initApp() {
  const mainContainer = document.getElementById("mainContainer")
  const loginContainer = document.getElementById("loginContainer")

  // Vérifier l'utilisateur connecté
  const currentUser = getCurrentUser()

  if (!currentUser) {
    console.log("Aucun utilisateur connecté")
    showLoginForm()
  } else {
    console.log("Utilisateur connecté:", currentUser.name)
    showMainApp()
  }

  function showLoginForm() {
    mainContainer.style.display = "none"
    loginContainer.style.display = "block"
    loginContainer.innerHTML = ""

    const loginForm = createLoginForm((user) => {
      console.log("Connexion réussie pour:", user.name)
      showMainApp()
    })

    loginContainer.appendChild(loginForm)
  }

  function showMainApp() {
    loginContainer.style.display = "none"
    mainContainer.style.display = "flex"
    initMainInterface()
  }
}

async function initMainInterface() {
  try {
    await loadChats()
    setupEventListeners()
    updateUserAvatar()
    showWelcomeMessage()
    initializeRealTimeSync(handleNewMessage, handleUserStatusUpdate)
    startAutoRefresh()
    setupAudioRecorder()
    console.log("Interface principale initialisée")
  } catch (error) {
    console.error("Erreur initialisation:", error)
    showToast("Erreur de chargement", "error")
  }
}

async function loadChats() {
  try {
    chats = await getChats()
    // Ne rendre la liste que si on est sur la vue chats
    if (currentView === "chats") {
      renderChatList()
    }

    // Si un chat est actuellement ouvert, rafraîchir ses messages
    if (currentChat) {
      const messages = await getMessages(currentChat.id)
      renderMessages(messages)
    }
  } catch (error) {
    console.error("Erreur chargement chats:", error)
    showToast("Impossible de charger les conversations", "error")
  }
}

function setupEventListeners() {
  // Avatar utilisateur pour ouvrir le profil
  const userAvatarButton = document.getElementById("userAvatarButton")
  if (userAvatarButton) {
    userAvatarButton.addEventListener("click", showProfile)
  }

  // Bouton retour du profil
  const backToChats = document.getElementById("backToChats")
  if (backToChats) {
    backToChats.addEventListener("click", hideProfile)
  }

  // Bouton de déconnexion
  const logoutButton = document.getElementById("logoutButton")
  if (logoutButton) {
    logoutButton.addEventListener("click", logout)
  }

  // Bouton retour
  const backButton = document.getElementById("backButton")
  if (backButton) {
    backButton.addEventListener("click", handleBackButton)
  }

  // Input de message
  setupMessageInput()

  // Navigation
  setupNavigation()

  // Search
  setupSearch()

  // Filter tabs
  setupFilterTabs()

  // Call buttons
  setupCallButtons()

  // File attachment
  setupFileAttachment()

  // Responsive
  window.addEventListener("resize", handleResize)

  // Notifications permission
  requestNotificationPermission()

  // Voice recording
  setupVoiceRecording()
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim()
      filterChats(query)
    })
  }
}

function setupFilterTabs() {
  const filterTabs = document.querySelectorAll(".filter-tab")
  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      filterTabs.forEach((t) => {
        t.classList.remove("active", "bg-green-600", "text-white")
        t.classList.add("text-gray-400")
      })

      // Add active class to clicked tab
      tab.classList.add("active", "bg-green-600", "text-white")
      tab.classList.remove("text-gray-400")

      const filter = tab.dataset.filter
      applyFilter(filter)
    })
  })
}

function setupCallButtons() {
  const voiceCallBtn = document.getElementById("voiceCallBtn")
  const videoCallBtn = document.getElementById("videoCallBtn")

  if (voiceCallBtn) {
    voiceCallBtn.addEventListener("click", async () => {
      if (currentChat) {
        await initializeCall(currentChat, "audio")
      }
    })
  }

  if (videoCallBtn) {
    videoCallBtn.addEventListener("click", async () => {
      if (currentChat) {
        await initializeCall(currentChat, "video")
      }
    })
  }
}

function setupFileAttachment() {
  const attachBtn = document.getElementById("attachBtn")
  const fileInput = document.getElementById("fileInput")

  if (attachBtn && fileInput) {
    attachBtn.addEventListener("click", () => {
      fileInput.click()
    })

    fileInput.addEventListener("change", handleFileUpload)
  }
}

async function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file || !currentChat) return

  try {
    // Convert file to base64
    const base64 = await fileToBase64(file)

    const message = {
      id: Date.now(),
      text: file.name,
      sent: true,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      timestamp: new Date().toISOString(),
      type: getFileType(file.type),
      fileData: base64,
      fileName: file.name,
      fileSize: file.size,
      status: "sent",
    }

    await sendMessage(message)
    event.target.value = "" // Reset file input
  } catch (error) {
    console.error("Erreur upload fichier:", error)
    showToast("Erreur lors de l'envoi du fichier", "error")
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

function getFileType(mimeType) {
  if (mimeType.startsWith("image/")) return "image"
  if (mimeType.startsWith("video/")) return "video"
  if (mimeType.startsWith("audio/")) return "audio"
  return "document"
}

function filterChats(query) {
  const chatItems = document.querySelectorAll(".chat-item")
  chatItems.forEach((item) => {
    const name = item.querySelector(".chat-name")?.textContent.toLowerCase() || ""
    const message = item.querySelector(".chat-message")?.textContent.toLowerCase() || ""

    if (name.includes(query) || message.includes(query)) {
      item.style.display = "block"
    } else {
      item.style.display = "none"
    }
  })
}

function applyFilter(filter) {
  const currentUser = getCurrentUser()
  if (!currentUser) return

  let filteredChats = chats.filter((chat) => chat.id !== currentUser.id)

  switch (filter) {
    case "unread":
      filteredChats = filteredChats.filter((chat) => chat.unread > 0)
      break
    case "favorites":
      filteredChats = filteredChats.filter((chat) => chat.isFavorite)
      break
    case "groups":
      filteredChats = filteredChats.filter((chat) => chat.isGroup)
      break
    default:
      // "all" - no additional filtering
      break
  }

  renderFilteredChatList(filteredChats)
}

function renderFilteredChatList(filteredChats) {
  const chatList = document.getElementById("chatList")
  if (!chatList) return

  chatList.innerHTML = ""

  filteredChats.forEach((chat) => {
    const chatItem = createChatItem(chat)
    chatList.appendChild(chatItem)
  })
}

function showProfile() {
  const sidebar = document.getElementById("sidebar")
  const profilePanel = document.getElementById("profilePanel")
  const chatArea = document.getElementById("chatArea")

  // Cacher la sidebar et la zone de chat
  sidebar.style.display = "none"
  chatArea.style.display = "none"

  // Afficher le panneau de profil
  profilePanel.style.display = "flex"

  // Mettre à jour les informations du profil
  updateProfileInfo()
}

function hideProfile() {
  const sidebar = document.getElementById("sidebar")
  const profilePanel = document.getElementById("profilePanel")
  const chatArea = document.getElementById("chatArea")

  // Cacher le panneau de profil
  profilePanel.style.display = "none"

  // Réafficher la sidebar
  sidebar.style.display = "flex"

  // Réafficher la zone de chat si un chat était ouvert
  if (currentChat) {
    chatArea.style.display = "flex"
  }
}

function updateProfileInfo() {
  const currentUser = getCurrentUser()
  if (currentUser) {
    const profileImage = document.getElementById("profileImage")
    const profileName = document.getElementById("profileName")

    if (profileImage) {
      profileImage.src = currentUser.avatar
      profileImage.alt = currentUser.name
    }

    if (profileName) {
      profileName.textContent = currentUser.name
    }
  }
}

function updateUserAvatar() {
  const currentUser = getCurrentUser()
  const userAvatars = document.querySelectorAll(".user-avatar img")

  if (currentUser && userAvatars.length > 0) {
    userAvatars.forEach((avatar) => {
      avatar.src = currentUser.avatar
      avatar.alt = currentUser.name
    })
  }
}

function showWelcomeMessage() {
  const messagesArea = document.getElementById("messagesArea")
  if (messagesArea) {
    messagesArea.innerHTML = `
      <div class="flex items-center justify-center h-full text-gray-500">
        <div class="text-center">
          <div class="text-8xl mb-4 opacity-30">
            <i class="fab fa-whatsapp text-green-500"></i>
          </div>
          <h2 class="text-3xl mb-4 font-light">WhatsApp Web</h2>
          <p class="text-gray-400 mb-2">Sélectionnez une conversation pour commencer</p>
          <div class="mt-8 flex justify-center">
            <div class="flex items-center text-gray-500 text-sm">
              <i class="fas fa-lock mr-2"></i>
              <span>Vos messages sont chiffrés de bout en bout</span>
            </div>
          </div>
        </div>
      </div>
    `
  }
}

function renderChatList() {
  const chatList = document.getElementById("chatList")
  if (!chatList) return

  const currentUser = getCurrentUser()
  if (!currentUser) return

  chatList.innerHTML = ""

  // Filtrer les chats (exclure l'utilisateur actuel)
  const filteredChats = chats.filter((chat) => chat.id !== currentUser.id)

  // Trier par dernière activité
  filteredChats.sort((a, b) => {
    const timeA = new Date(a.lastMessageTime || a.time)
    const timeB = new Date(b.lastMessageTime || b.time)
    return timeB - timeA
  })

  filteredChats.forEach((chat) => {
    const chatItem = createChatItem(chat)
    chatList.appendChild(chatItem)
  })
}

function createChatItem(chat) {
  const chatItem = document.createElement("div")
  chatItem.className =
    "chat-item px-4 py-3 cursor-pointer hover:bg-[#202c33] transition-colors border-b border-gray-700"
  chatItem.dataset.chatId = chat.id

  const hasUnread = chat.unread > 0
  const isOnline = chat.isOnline

  chatItem.innerHTML = `
    <div class="flex items-center space-x-3">
      <div class="relative">
        <img src="${chat.avatar}" alt="${chat.name}" class="w-12 h-12 rounded-full object-cover">
        ${isOnline ? '<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#222e35]"></div>' : ""}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start">
          <h3 class="chat-name font-medium text-white truncate ${hasUnread ? "font-semibold" : ""}">${chat.name}</h3>
          <div class="flex flex-col items-end space-y-1">
            <span class="text-xs ${hasUnread ? "text-green-400" : "text-gray-400"}">${chat.time}</span>
            ${hasUnread ? `<span class="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">${chat.unread}</span>` : ""}
          </div>
        </div>
        <div class="mt-1">
          <p class="chat-message text-sm ${hasUnread ? "text-white font-medium" : "text-gray-400"} truncate">${chat.lastMessage}</p>
        </div>
      </div>
    </div>
  `

  chatItem.addEventListener("click", () => openChat(chat.id))

  return chatItem
}

async function openChat(chatId) {
  hideProfile()

  currentChat = chats.find((chat) => chat.id === chatId)
  window.currentChat = currentChat

  if (!currentChat) return

  // Marquer comme lu
  if (currentChat.unread > 0) {
    currentChat.unread = 0
    await updateChat(currentChat)
  }

  // Mise à jour visuelle
  document.querySelectorAll(".chat-item").forEach((item) => {
    item.classList.remove("bg-[#202c33]")
  })
  document.querySelector(`[data-chat-id="${chatId}"]`)?.classList.add("bg-[#202c33]")

  // Responsive
  if (isMobile()) {
    document.getElementById("sidebar").style.display = "none"
    document.getElementById("chatArea").style.display = "flex"
  } else {
    document.getElementById("chatArea").style.display = "flex"
  }

  showChatHeader()
  await renderMessages()
  showMessageInput()

  // Ne recharger la liste que si on est sur la vue chats
  if (currentView === "chats") {
    renderChatList()
  }
}

function showChatHeader() {
  const chatHeader = document.getElementById("chatHeader")
  const chatAvatar = document.getElementById("chatAvatar")
  const chatName = document.getElementById("chatName")
  const chatStatus = document.getElementById("chatStatus")

  if (chatHeader && currentChat) {
    chatHeader.style.display = "flex"
    chatAvatar.innerHTML = `<img src="${currentChat.avatar}" alt="${currentChat.name}" class="w-10 h-10 rounded-full object-cover">`
    chatName.textContent = currentChat.name
    chatStatus.textContent = currentChat.isOnline ? "en ligne" : currentChat.status
  }
}

async function renderMessages() {
  const messagesArea = document.getElementById("messagesArea")
  if (!messagesArea || !currentChat) return

  try {
    // Récupérer les messages depuis l'API
    const messages = await getMessages(currentChat.id)
    currentChat.messages = messages

    messagesArea.innerHTML = ""

    messages.forEach((message) => {
      const messageElement = createMessageElement(message)
      messagesArea.appendChild(messageElement)
    })

    messagesArea.scrollTop = messagesArea.scrollHeight
  } catch (error) {
    console.error("Erreur lors du rendu des messages:", error)
    showToast("Erreur lors du chargement des messages", "error")
  }
}

function createMessageElement(message) {
  const currentUser = getCurrentUser()
  const isSentByMe = message.senderId === currentUser.id || message.sent === true

  const messageDiv = document.createElement("div")
  messageDiv.className = `flex mb-4 ${isSentByMe ? "justify-end" : "justify-start"}`
  messageDiv.dataset.messageId = message.id

  let messageContent = ""

  switch (message.type) {
    case "image":
      messageContent = `
        <img src="${message.fileData}" alt="${message.fileName}" class="max-w-xs rounded-lg mb-2 cursor-pointer" onclick="openImageModal('${message.fileData}')">
        <p class="text-sm">${message.text}</p>
      `
      break
    case "video":
      messageContent = `
        <video src="${message.fileData}" controls class="max-w-xs rounded-lg mb-2">
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
        <p class="text-sm">${message.text}</p>
      `
      break
    case "audio":
      messageContent = `
        <audio src="${message.fileData}" controls class="mb-2">
          Votre navigateur ne supporte pas la lecture audio.
        </audio>
        <p class="text-sm">${message.text}</p>
      `
      break
    case "document":
      messageContent = `
        <div class="flex items-center space-x-2 mb-2 p-2 bg-gray-700 rounded">
          <i class="fas fa-file text-blue-400"></i>
          <div>
            <p class="text-sm font-medium">${message.fileName}</p>
            <p class="text-xs text-gray-400">${formatFileSize(message.fileSize)}</p>
          </div>
        </div>
      `
      break
    case "voice":
      messageContent = `
        <div class="voice-message flex items-center gap-3 p-3 min-w-[200px]">
          <button class="play-button w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-colors">
            <i class="fas fa-play text-sm"></i>
          </button>
          <div class="voice-content flex-1">
            <div class="voice-waveform flex items-center gap-1 h-6 mb-1">
              ${Array(25)
                .fill()
                .map(
                  (_, i) => `
                <div class="waveform-bar bg-gray-400 rounded-full transition-all duration-200" 
                     style="width: 2px; height: ${Math.random() * 16 + 4}px;"></div>
              `,
                )
                .join("")}
            </div>
            <div class="flex justify-between items-center">
              <span class="duration text-xs text-gray-300">0:05</span>
            </div>
          </div>
        </div>
      `

      // Ajouter la gestion audio après le rendu
      setTimeout(() => {
        const messageEl = document.querySelector(`[data-message-id="${message.id}"]`)
        if (messageEl) {
          const playButton = messageEl.querySelector(".play-button")
          const waveformBars = messageEl.querySelectorAll(".waveform-bar")
          const duration = messageEl.querySelector(".duration")
          let isPlaying = false
          let animationInterval = null
          let audio = null

          // Fonction pour créer l'audio à partir des données base64
          function createAudioFromBase64() {
            if (!message.fileData) {
              console.error("Pas de données audio disponibles")
              return null
            }

            try {
              // Créer un nouvel élément audio
              audio = new Audio()
              audio.src = message.fileData
              audio.preload = "metadata"

              // Gérer les erreurs de chargement
              audio.onerror = (e) => {
                console.error("Erreur chargement audio:", e)
                duration.textContent = "Erreur"
              }

              // Quand les métadonnées sont chargées
              audio.onloadedmetadata = () => {
                if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
                  duration.textContent = formatTime(audio.duration)
                } else {
                  // Durée par défaut si impossible à déterminer
                  duration.textContent = "0:05"
                }
              }

              // Gestion de la fin de lecture
              audio.onended = () => {
                isPlaying = false
                playButton.innerHTML = '<i class="fas fa-play text-sm"></i>'
                clearInterval(animationInterval)
                waveformBars.forEach((bar) => {
                  bar.style.backgroundColor = "#9ca3af"
                })
              }

              // Gestion des erreurs de lecture
              audio.onpause = () => {
                isPlaying = false
                playButton.innerHTML = '<i class="fas fa-play text-sm"></i>'
                clearInterval(animationInterval)
              }

              return audio
            } catch (error) {
              console.error("Erreur création audio:", error)
              return null
            }
          }

          playButton.onclick = async () => {
            try {
              if (!audio) {
                audio = createAudioFromBase64()
                if (!audio) {
                  showToast("Impossible de lire le message vocal", "error")
                  return
                }
              }

              if (isPlaying) {
                audio.pause()
                playButton.innerHTML = '<i class="fas fa-play text-sm"></i>'
                clearInterval(animationInterval)
                // Reset waveform
                waveformBars.forEach((bar) => {
                  bar.style.backgroundColor = "#9ca3af"
                })
                isPlaying = false
              } else {
                // Essayer de jouer l'audio
                try {
                  await audio.play()
                  playButton.innerHTML = '<i class="fas fa-pause text-sm"></i>'
                  isPlaying = true

                  // Animer les barres
                  animationInterval = setInterval(() => {
                    waveformBars.forEach((bar) => {
                      const height = Math.random() * 16 + 4
                      bar.style.height = `${height}px`
                      bar.style.backgroundColor = "#10b981"
                    })
                  }, 100)
                } catch (playError) {
                  console.error("Erreur lecture:", playError)
                  showToast("Erreur de lecture audio", "error")
                  playButton.innerHTML = '<i class="fas fa-play text-sm"></i>'
                  isPlaying = false
                }
              }
            } catch (error) {
              console.error("Erreur gestion lecture:", error)
              showToast("Erreur de lecture audio", "error")
              playButton.innerHTML = '<i class="fas fa-play text-sm"></i>'
              isPlaying = false
            }
          }

          // Initialiser l'audio
          createAudioFromBase64()
        }
      }, 100)
      break
    default:
      messageContent = `<p class="text-sm">${message.text}</p>`
  }

  messageDiv.innerHTML = `
  <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
    isSentByMe ? "bg-[#005c4b] text-white" : "bg-[#202c33] text-white"
  } shadow-md">
    ${messageContent}
    <div class="flex justify-end items-center mt-1 space-x-1">
      <span class="text-xs text-gray-300">${message.time}</span>
      ${isSentByMe ? `<i class="fas fa-check-double text-xs ${message.status === "read" ? "text-blue-400" : "text-gray-400"}"></i>` : ""}
    </div>
  </div>
`

  return messageDiv
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function showMessageInput() {
  const messageInput = document.getElementById("messageInput")
  if (messageInput) {
    messageInput.style.display = "flex"
  }
}

function setupMessageInput() {
  const messageText = document.getElementById("messageText")
  const sendButton = document.getElementById("sendButton")
  const voiceBtn = document.getElementById("voiceBtn")

  if (!messageText || !sendButton) return

  async function sendTextMessage() {
    const text = messageText.value.trim()
    if (!text || !currentChat) return

    try {
      const currentUser = getCurrentUser()
      if (!currentUser) return

      const message = {
        id: Date.now(),
        senderId: currentUser.id,
        receiverId: currentChat.id,
        text: text,
        sent: true,
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        timestamp: new Date().toISOString(),
        type: "text",
        status: "sent",
      }

      // Vider le champ de message immédiatement
      messageText.value = ""

      // Ajouter le message localement pour l'affichage immédiat
      currentChat.messages = currentChat.messages || []
      currentChat.messages.push(message)
      currentChat.lastMessage = text
      currentChat.time = message.time
      currentChat.lastMessageTime = message.timestamp

      // Envoyer au serveur
      await handleSendMessage(currentUser.id, currentChat.id, message)
    } catch (error) {
      console.error("Erreur envoi message:", error)
      showToast("Erreur lors de l'envoi", "error")
    }
  }

  sendButton.addEventListener("click", sendTextMessage)
  messageText.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendTextMessage()
    }
  })

  // Voice message
  if (voiceBtn) {
    voiceBtn.addEventListener("click", startVoiceRecording)
  }
}

async function sendMessage(message) {
  if (!currentChat) return

  try {
    currentChat.messages.push(message)
    currentChat.lastMessage = message.type === "text" ? message.text : `📎 ${message.fileName || "Fichier"}`
    currentChat.time = message.time
    currentChat.lastMessageTime = message.timestamp

    await addMessage(currentChat.id, message)
    await updateChat(currentChat)

    renderMessages()

    // Ne recharger la liste que si on est sur la vue chats
    if (currentView === "chats") {
      renderChatList()
    }
  } catch (error) {
    console.error("Erreur envoi message:", error)
    showToast("Erreur lors de l'envoi", "error")
  }
}

function handleBackButton() {
  if (isMobile()) {
    document.getElementById("sidebar").style.display = "flex"
    document.getElementById("chatArea").style.display = "none"
  }

  currentChat = null
  window.currentChat = null
  document.getElementById("chatHeader").style.display = "none"
  document.getElementById("messageInput").style.display = "none"
  showWelcomeMessage()
}

function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item) => {
    item.addEventListener("click", async (e) => {
      e.preventDefault()
      e.stopPropagation()

      const view = item.dataset.view
      console.log("🔄 Navigation vers:", view, "| Vue actuelle:", currentView)

      // Empêcher la navigation si on est déjà en train de naviguer
      if (isNavigating) {
        console.log("⚠️ Navigation en cours, ignoré")
        return
      }

      // Empêcher le changement si on est déjà sur cette vue
      if (currentView === view) {
        console.log("✅ Déjà sur cette vue:", view)
        return
      }

      // Marquer qu'on est en train de naviguer
      isNavigating = true

      try {
        // Mettre à jour la vue actuelle IMMÉDIATEMENT
        currentView = view
        console.log("📍 Vue mise à jour vers:", currentView)

        // Remove active class from all nav items
        navItems.forEach((nav) => nav.classList.remove("active"))

        // Add active class to clicked item
        item.classList.add("active")

        // Handle navigation
        switch (view) {
          case "chats":
            await showChatsView()
            break
          case "status":
            await showStoriesView()
            break
          case "communities":
            await showGroupsView()
            break
          case "settings":
            showSettingsView()
            break
        }

        console.log("✅ Navigation terminée vers:", view)
      } catch (error) {
        console.error("❌ Erreur navigation:", error)
        // En cas d'erreur, revenir à la vue chats
        currentView = "chats"
        await showChatsView()
      } finally {
        // Libérer le verrou de navigation après un délai
        setTimeout(() => {
          isNavigating = false
          console.log("🔓 Navigation déverrouillée")
        }, 500)
      }
    })
  })
}

async function showChatsView() {
  console.log("📱 Affichage vue chats")
  const sidebar = document.getElementById("sidebar")
  const profilePanel = document.getElementById("profilePanel")

  profilePanel.style.display = "none"
  sidebar.style.display = "flex"

  // Recharger les chats
  await loadChats()
}

async function showStoriesView() {
  console.log("📖 Affichage vue stories")
  const sidebar = document.getElementById("sidebar")
  const profilePanel = document.getElementById("profilePanel")

  profilePanel.style.display = "none"
  sidebar.style.display = "flex"

  // Créer l'interface des stories
  await createStoriesInterface()
}

async function showGroupsView() {
  console.log("👥 Affichage vue groupes")
  const sidebar = document.getElementById("sidebar")
  const profilePanel = document.getElementById("profilePanel")

  profilePanel.style.display = "none"
  sidebar.style.display = "flex"

  // Créer l'interface des groupes
  await createGroupsInterface()
}

function showSettingsView() {
  console.log("⚙️ Affichage vue paramètres")
  const sidebar = document.getElementById("sidebar")
  const profilePanel = document.getElementById("profilePanel")

  profilePanel.style.display = "none"
  sidebar.style.display = "flex"

  // Créer l'interface des paramètres
  createSettingsInterface()
}

async function createStoriesInterface() {
  const chatList = document.getElementById("chatList")
  const currentUser = getCurrentUser()

  if (!chatList || !currentUser) return

  try {
    const stories = await getStories()

    chatList.innerHTML = `
      <div class="p-4">
        <!-- Bouton créer story -->
        <button id="createStoryBtn" class="w-full p-4 bg-[#202c33] hover:bg-[#2a3942] rounded-lg flex items-center space-x-3 mb-4 transition-colors">
          <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <i class="fas fa-plus text-white text-xl"></i>
          </div>
          <div class="text-left">
            <div class="text-white font-medium">Créer une story</div>
            <div class="text-gray-400 text-sm">Partagez un moment</div>
          </div>
        </button>
        
        <!-- Liste des stories -->
        <div class="space-y-2">
          ${
            stories.length === 0
              ? `
            <div class="text-center py-8 text-gray-400">
              <i class="fas fa-circle text-4xl mb-4 opacity-30"></i>
              <p>Aucune story disponible</p>
              <p class="text-sm">Soyez le premier à partager !</p>
            </div>
          `
              : stories
                  .map(
                    (story) => `
            <div class="story-item p-3 hover:bg-[#202c33] rounded-lg cursor-pointer transition-colors" data-story-id="${story.id}">
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <img src="${story.userAvatar}" alt="${story.userName}" class="w-12 h-12 rounded-full object-cover">
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#222e35]"></div>
                </div>
                <div class="flex-1">
                  <div class="text-white font-medium">${story.userName}</div>
                  <div class="text-gray-400 text-sm">${formatStoryTime(story.timestamp)}</div>
                </div>
                <div class="text-right">
                  <div class="text-gray-400 text-xs">${story.views.length} vues</div>
                  ${story.isMonetized ? `<div class="text-green-400 text-xs">💰 ${story.earnings} FCFA</div>` : ""}
                </div>
              </div>
            </div>
          `,
                  )
                  .join("")
          }
        </div>
      </div>
    `

    // Event listeners
    const createStoryBtn = document.getElementById("createStoryBtn")
    if (createStoryBtn) {
      createStoryBtn.addEventListener("click", () => {
        createStoryModal(async (story) => {
          if (currentView === "status") {
            await createStoriesInterface() // Recharger seulement si on est encore sur les stories
          }
        })
      })
    }

    // Stories click
    document.querySelectorAll(".story-item").forEach((item) => {
      item.addEventListener("click", () => {
        const storyId = item.dataset.storyId
        const storyIndex = stories.findIndex((s) => s.id === storyId)
        if (storyIndex !== -1) {
          createStoryViewer(stories, storyIndex)
        }
      })
    })
  } catch (error) {
    console.error("Erreur chargement stories:", error)
    chatList.innerHTML = `
      <div class="text-center py-8 text-red-400">
        <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
        <p>Erreur de chargement</p>
      </div>
    `
  }
}

async function createGroupsInterface() {
  const chatList = document.getElementById("chatList")
  const currentUser = getCurrentUser()

  if (!chatList || !currentUser) return

  try {
    const groups = await getGroups(currentUser.id)

    chatList.innerHTML = `
      <div class="p-4">
        <!-- Bouton créer groupe -->
        <button id="createGroupBtn" class="w-full p-4 bg-[#202c33] hover:bg-[#2a3942] rounded-lg flex items-center space-x-3 mb-4 transition-colors">
          <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <i class="fas fa-users text-white text-xl"></i>
          </div>
          <div class="text-left">
            <div class="text-white font-medium">Nouveau groupe</div>
            <div class="text-gray-400 text-sm">Créer un groupe</div>
          </div>
        </button>
        
        <!-- Liste des groupes -->
        <div class="space-y-2">
          ${
            groups.length === 0
              ? `
            <div class="text-center py-8 text-gray-400">
              <i class="fas fa-users text-4xl mb-4 opacity-30"></i>
              <p>Aucun groupe</p>
              <p class="text-sm">Créez votre premier groupe !</p>
            </div>
          `
              : groups
                  .map(
                    (group) => `
            <div class="group-item p-3 hover:bg-[#202c33] rounded-lg cursor-pointer transition-colors" data-group-id="${group.id}">
              <div class="flex items-center space-x-3">
                <img src="${group.avatar}" alt="${group.name}" class="w-12 h-12 rounded-full object-cover">
                <div class="flex-1">
                  <div class="text-white font-medium">${group.name}</div>
                  <div class="text-gray-400 text-sm">${group.members.length} membres</div>
                </div>
                <div class="text-right">
                  ${group.admins.includes(currentUser.id) ? `<div class="text-green-400 text-xs">Admin</div>` : ""}
                </div>
              </div>
            </div>
          `,
                  )
                  .join("")
          }
        </div>
      </div>
    `

    // Event listeners
    const createGroupBtn = document.getElementById("createGroupBtn")
    if (createGroupBtn) {
      createGroupBtn.addEventListener("click", () => {
        createGroupModal(async (group) => {
          if (currentView === "communities") {
            await createGroupsInterface() // Recharger seulement si on est encore sur les groupes
          }
        })
      })
    }
  } catch (error) {
    console.error("Erreur chargement groupes:", error)
    chatList.innerHTML = `
      <div class="text-center py-8 text-red-400">
        <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
        <p>Erreur de chargement</p>
      </div>
    `
  }
}

function createSettingsInterface() {
  const chatList = document.getElementById("chatList")
  const currentUser = getCurrentUser()

  if (!chatList || !currentUser) return

  chatList.innerHTML = `
    <div class="p-4 space-y-4">
      <!-- Profil -->
      <div class="bg-[#202c33] rounded-lg p-4">
        <div class="flex items-center space-x-3 mb-4">
          <img src="${currentUser.avatar}" alt="${currentUser.name}" class="w-16 h-16 rounded-full object-cover">
          <div>
            <div class="text-white font-medium text-lg">${currentUser.name}</div>
            <div class="text-gray-400">${currentUser.phone}</div>
          </div>
        </div>
        <div class="text-gray-300 text-sm">${currentUser.bio || "Aucune bio"}</div>
      </div>
      
      <!-- Portefeuille -->
      <div class="bg-[#202c33] rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-white font-medium">💰 Portefeuille</h3>
          <div class="text-green-400 font-bold">${currentUser.walletBalance || 0} FCFA</div>
        </div>
        <div class="text-gray-400 text-sm">
          Gains totaux: ${currentUser.totalEarnings || 0} FCFA
        </div>
        <div class="text-xs text-gray-500 mt-2">
          Gagnez de l'argent avec vos stories populaires !
        </div>
      </div>
      
      <!-- Actions -->
      <div class="space-y-2">
        <button id="addContactBtn" class="w-full p-3 bg-[#202c33] hover:bg-[#2a3942] rounded-lg flex items-center space-x-3 transition-colors">
          <i class="fas fa-user-plus text-green-400"></i>
          <span class="text-white">Ajouter un contact</span>
        </button>
        
        <button class="w-full p-3 bg-[#202c33] hover:bg-[#2a3942] rounded-lg flex items-center space-x-3 transition-colors">
          <i class="fas fa-bell text-blue-400"></i>
          <span class="text-white">Notifications</span>
        </button>
        
        <button class="w-full p-3 bg-[#202c33] hover:bg-[#2a3942] rounded-lg flex items-center space-x-3 transition-colors">
          <i class="fas fa-shield-alt text-purple-400"></i>
          <span class="text-white">Confidentialité</span>
        </button>
        
        <button id="logoutBtn" class="w-full p-3 bg-red-600 hover:bg-red-700 rounded-lg flex items-center space-x-3 transition-colors">
          <i class="fas fa-sign-out-alt text-white"></i>
          <span class="text-white">Se déconnecter</span>
        </button>
      </div>
    </div>
  `

  // Event listeners
  const addContactBtn = document.getElementById("addContactBtn")
  if (addContactBtn) {
    addContactBtn.addEventListener("click", () => {
      createAddContactModal(async (contact) => {
        await loadChats() // Recharger les chats
        showToast(`${contact.name} ajouté avec succès`, "success")
      })
    })
  }

  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout)
  }
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

function handleResize() {
  if (!isMobile() && currentChat) {
    document.getElementById("sidebar").style.display = "flex"
    document.getElementById("chatArea").style.display = "flex"
  }
}

function isMobile() {
  return window.innerWidth < 768
}

// Voice recording functions
let mediaRecorder = null
let audioChunks = []

async function startVoiceRecording() {
  try {
    if (!currentChat) {
      showToast("Sélectionnez une conversation d'abord", "error")
      return
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data)
    }

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/mp3" })
      await handleVoiceMessage(audioBlob, currentChat)
      stream.getTracks().forEach((track) => track.stop())
    }

    mediaRecorder.start()
    showToast("Enregistrement en cours... Cliquez à nouveau pour arrêter", "info")

    const voiceBtn = document.getElementById("voiceBtn")
    voiceBtn.innerHTML = '<i class="fas fa-stop text-xl text-red-500"></i>'
    voiceBtn.onclick = stopVoiceRecording
  } catch (error) {
    console.error("Erreur enregistrement vocal:", error)
    showToast("Impossible d'accéder au microphone", "error")
  }
}

function stopVoiceRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop()

    // Reset button
    const voiceBtn = document.getElementById("voiceBtn")
    voiceBtn.innerHTML = '<i class="fas fa-microphone text-xl"></i>'
    voiceBtn.onclick = startVoiceRecording

    showToast("Message vocal envoyé", "success")
  }
}

function createVoiceMessage(audioBlob, currentUser, isSent = true) {
  const container = document.createElement("div")
  container.className = `voice-message-container ${isSent ? "sent" : "received"}`

  const audioUrl = URL.createObjectURL(audioBlob)
  const audio = new Audio(audioUrl)

  container.innerHTML = `
    <div class="voice-message">
      ${
        !isSent
          ? `
        <div class="voice-avatar">
          <img src="${currentChat.avatar}" alt="Avatar" />
        </div>
      `
          : ""
      }
      <div class="voice-content">
        <div class="voice-controls">
          <button class="voice-play-button">
            <i class="fas fa-play"></i>
          </button>
          <div class="voice-progress">
            <div class="voice-progress-bar" style="width: 0%"></div>
          </div>
          <span class="voice-time">0:00</span>
        </div>
        <div class="voice-waveform">
          ${Array(20)
            .fill()
            .map(
              () => `
            <div class="voice-waveform-bar"></div>
          `,
            )
            .join("")}
        </div>
      </div>
    </div>
  `

  const playButton = container.querySelector(".voice-play-button")
  const progressBar = container.querySelector(".voice-progress-bar")
  const timeDisplay = container.querySelector(".voice-time")

  let isPlaying = false

  playButton.addEventListener("click", () => {
    if (isPlaying) {
      audio.pause()
      playButton.innerHTML = '<i class="fas fa-play"></i>'
    } else {
      audio.play()
      playButton.innerHTML = '<i class="fas fa-pause"></i>'
    }
    isPlaying = !isPlaying
  })

  audio.addEventListener("timeupdate", () => {
    const progress = (audio.currentTime / audio.duration) * 100
    progressBar.style.width = `${progress}%`
    timeDisplay.textContent = formatTime(audio.currentTime)
  })

  audio.addEventListener("ended", () => {
    isPlaying = false
    playButton.innerHTML = '<i class="fas fa-play"></i>'
    progressBar.style.width = "0%"
  })

  return container
}

function formatTime(seconds) {
  if (!seconds || !isFinite(seconds) || isNaN(seconds)) {
    return "0:05" // Durée par défaut
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

async function handleVoiceMessage(audioBlob, currentChat) {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser || !currentChat) return

    // Convertir en base64 pour le stockage
    const base64Audio = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(audioBlob)
    })

    const message = {
      id: Date.now(),
      senderId: currentUser.id,
      receiverId: currentChat.id,
      text: "Message vocal",
      sent: true, // Important: marquer comme envoyé
      time: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: new Date().toISOString(),
      type: "voice",
      fileData: base64Audio,
      status: "sent",
    }

    // Envoyer le message
    await sendMessage(message)
  } catch (error) {
    console.error("Erreur envoi message vocal:", error)
    showToast("Erreur lors de l'envoi du message vocal", "error")
  }
}

// Ajout de la fonction pour créer l'élément de message vocal
function createVoiceMessageElement(message) {
  const container = document.createElement("div")
  container.className = `message-bubble ${message.sent ? "sent" : "received"}`

  container.innerHTML = `
    <div class="voice-message">
      <button class="play-button">
        <i class="fas fa-play"></i>
      </button>
      <div class="voice-waveform">
        <div class="waveform-progress"></div>
      </div>
      <span class="duration">0:00</span>
      <span class="time">${message.time}</span>
      ${message.sent ? `<i class="fas fa-check-double message-status"></i>` : ""}
    </div>
  `

  // Gérer la lecture audio
  const audio = new Audio(message.audioUrl)
  const playButton = container.querySelector(".play-button")
  const waveform = container.querySelector(".waveform-progress")
  const duration = container.querySelector(".duration")

  playButton.addEventListener("click", () => {
    if (audio.paused) {
      audio.play()
      playButton.innerHTML = '<i class="fas fa-pause"></i>'
    } else {
      audio.pause()
      playButton.innerHTML = '<i class="fas fa-play"></i>'
    }
  })

  audio.addEventListener("timeupdate", () => {
    const progress = (audio.currentTime / audio.duration) * 100
    waveform.style.width = `${progress}%`
    duration.textContent = formatTime(audio.currentTime)
  })

  audio.addEventListener("ended", () => {
    playButton.innerHTML = '<i class="fas fa-play"></i>'
    waveform.style.width = "0%"
  })

  return container
}

function setupVoiceRecording() {
  const voiceBtn = document.getElementById("voiceBtn")
  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        stopVoiceRecording()
      } else {
        startVoiceRecording()
      }
    })
  }
}

// Ajouter ces fonctions après les imports et avant le reste du code

function handleNewMessage(message) {
  const currentUser = getCurrentUser()
  if (!currentUser) return

  try {
    // Trouver le chat concerné
    const chat = chats.find((c) => c.id === message.senderId || c.id === message.receiverId)
    if (!chat) return

    // Ajouter le message à la conversation
    chat.messages = chat.messages || []
    chat.messages.push(message)
    chat.lastMessage = message.text
    chat.time = message.time
    chat.lastMessageTime = message.timestamp

    // Si ce n'est pas un message envoyé par l'utilisateur actuel
    if (message.senderId !== currentUser.id) {
      // Incrémenter le compteur de messages non lus si la conversation n'est pas ouverte
      if (!currentChat || currentChat.id !== chat.id) {
        chat.unread = (chat.unread || 0) + 1
        showNotification(chat.name, message.text)
      }
    }

    // Mettre à jour l'interface
    if (currentChat && (currentChat.id === chat.id || currentChat.id === message.senderId)) {
      renderMessages()
    }

    // Ne recharger la liste que si on est sur la vue chats
    if (currentView === "chats") {
      renderChatList()
    }
  } catch (error) {
    console.error("Erreur lors du traitement du nouveau message:", error)
  }
}

function handleUserStatusUpdate(userId, isOnline) {
  try {
    // Mettre à jour le statut de l'utilisateur dans la liste des chats
    const chat = chats.find((c) => c.id === userId)
    if (chat) {
      chat.isOnline = isOnline
      chat.status = isOnline ? "en ligne" : "hors ligne"

      // Ne recharger la liste que si on est sur la vue chats
      if (currentView === "chats") {
        renderChatList()
      }

      // Mettre à jour le header du chat si c'est le chat actuel
      if (currentChat && currentChat.id === userId) {
        const chatStatus = document.getElementById("chatStatus")
        if (chatStatus) {
          chatStatus.textContent = chat.status
        }
      }
    }
  } catch (error) {
    console.error("Erreur mise à jour statut:", error)
  }
}

// Modification de la fonction startAutoRefresh
function startAutoRefresh() {
  // Arrêter l'ancien intervalle s'il existe
  if (window.refreshInterval) {
    clearInterval(window.refreshInterval)
  }

  // Démarrer un nouvel intervalle
  window.refreshInterval = setInterval(async () => {
    try {
      // Ne rafraîchir que si on est sur la vue chats
      if (currentView !== "chats") {
        return
      }

      // Récupérer les nouveaux messages
      if (currentChat) {
        const messages = await getMessages(currentChat.id)
        if (JSON.stringify(currentChat.messages) !== JSON.stringify(messages)) {
          currentChat.messages = messages
          renderMessages()
        }
      }

      // Mettre à jour la liste des chats seulement si on est sur la vue chats
      const updatedChats = await getChats()
      if (JSON.stringify(chats) !== JSON.stringify(updatedChats)) {
        chats = updatedChats
        if (currentView === "chats") {
          renderChatList()
        }
      }
    } catch (error) {
      console.error("Erreur rafraîchissement:", error)
    }
  }, 2000) // Toutes les 2 secondes
}

// Rendre les fonctions accessibles globalement
window.renderMessages = renderMessages
window.renderChatList = renderChatList
// Ajouter cette fonction après les autres fonctions de message
window.sendVoiceMessage = async (message) => {
  if (!currentChat) return

  try {
    const currentUser = getCurrentUser()
    if (!currentUser) return

    // Ajouter le message localement pour l'affichage immédiat
    currentChat.messages = currentChat.messages || []
    currentChat.messages.push(message)
    currentChat.lastMessage = "🎤 Message vocal"
    currentChat.time = message.time
    currentChat.lastMessageTime = message.timestamp

    // Rafraîchir l'interface immédiatement
    renderMessages()

    // Ne recharger la liste que si on est sur la vue chats
    if (currentView === "chats") {
      renderChatList()
    }

    // Envoyer au serveur (asynchrone)
    await handleSendMessage(currentUser.id, currentChat.id, message)
  } catch (error) {
    console.error("Erreur envoi message vocal:", error)
    showToast("Erreur lors de l'envoi du message vocal", "error")
  }
}
