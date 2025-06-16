import { getCurrentUser, createLoginForm, logout } from "./utils/auth.js"
import { getChats, updateChat, getMessages, initializeAllChats } from "./utils/api.js"
import { showToast, requestNotificationPermission } from "./utils/notifications.js"
import { initializeRealTimeSync, forceSyncNow } from "./utils/realtime.js"
import { handleSendMessage } from "./utils/chat-handler.js"
import { createAddContactModal } from "./utils/contacts.js"
import { getStories, createStoryModal, createStoryViewer } from "./utils/stories.js"

let chats = []
let currentChat = null
let currentGroup = null // Nouveau: pour gérer les groupes
let currentView = "chats"
let isNavigating = false
let isSending = false

// Ajouter cette ligne après la déclaration des variables globales
window.showSimpleGroups = null // Sera définie plus tard

// Variables globales pour l'application
window.currentChat = null
window.currentGroup = null

document.addEventListener("DOMContentLoaded", () => {
  console.log(" WhatsApp Web démarré")
  initApp()
})

async function initApp() {
  const mainContainer = document.getElementById("mainContainer")
  const loginContainer = document.getElementById("loginContainer")

  const currentUser = getCurrentUser()

  if (!currentUser) {
    console.log(" Aucun utilisateur connecté")
    showLoginForm()
  } else {
    console.log(" Utilisateur connecté:", currentUser.name)
    showMainApp()
  }

  function showLoginForm() {
    mainContainer.style.display = "none"
    loginContainer.style.display = "block"
    loginContainer.innerHTML = ""

    const loginForm = createLoginForm((user) => {
      console.log(" Connexion réussie pour:", user.name)
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
    console.log(" Initialisation de l'interface...")

    // Charger les chats
    await loadChats()

    // Configurer les événements
    setupEventListeners()

    // Mettre à jour l'avatar utilisateur
    updateUserAvatar()

    // Afficher le message de bienvenue
    showWelcomeMessage()

    // Initialiser la synchronisation temps réel
    initializeRealTimeSync(
      (message, chat) => {
        console.log(" Nouveau message reçu:", message)
        handleNewMessage(message, chat)
      },
      (userId, isOnline) => {
        console.log(` Statut utilisateur ${userId}:`, isOnline ? "en ligne" : "hors ligne")
        updateUserStatus(userId, isOnline)
      },
    )

    // Démarrer le rafraîchissement automatique
    startAutoRefresh()

    // Demander les permissions de notification
    await requestNotificationPermission()

    console.log(" Interface principale initialisée")
  } catch (error) {
    console.error(" Erreur initialisation:", error)
    showToast("Erreur de chargement", "error")
  }
}

async function loadChats() {
  try {
    console.log(" Chargement des chats...")
    chats = await getChats()
    console.log(`${chats.length} chats chargés`)

    if (currentView === "chats") {
      renderChatList()
    }

    // Si un chat est ouvert, recharger ses messages
    if (currentChat) {
      const messages = await getMessages(currentChat.id)
      renderMessages(messages)
    }
  } catch (error) {
    console.error(" Erreur chargement chats:", error)
    showToast("Impossible de charger les conversations", "error")
  }
}

function setupEventListeners() {
  console.log(" Configuration des événements...")

  // Avatar utilisateur
  const userAvatarButton = document.getElementById("userAvatarButton")
  if (userAvatarButton) {
    userAvatarButton.addEventListener("click", showProfile)
  }

  // Boutons de profil
  const backToChats = document.getElementById("backToChats")
  if (backToChats) {
    backToChats.addEventListener("click", hideProfile)
  }

  const logoutButton = document.getElementById("logoutButton")
  if (logoutButton) {
    logoutButton.addEventListener("click", logout)
  }

  // Bouton retour mobile
  const backButton = document.getElementById("backButton")
  if (backButton) {
    backButton.addEventListener("click", handleBackButton)
  }

  // Configuration des autres composants
  setupMessageInput()
  setupNavigation()
  setupSearch()
  setupFilterTabs()
  setupNewChatButton()

  // Responsive
  window.addEventListener("resize", handleResize)
}

function setupNewChatButton() {
  const newChatBtn = document.getElementById("newChatBtn")
  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        showToast(" Erreur: utilisateur non connecté", "error")
        return
      }

      createAddContactModal(async (contact) => {
        console.log(" Contact ajouté:", contact.name)
        await loadChats()
        showToast(`${contact.name} ajouté avec succès`, "success")
      })
    })
  }
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
      // Retirer la classe active de tous les onglets
      filterTabs.forEach((t) => {
        t.classList.remove("active", "bg-green-600", "text-white")
        t.classList.add("text-gray-400")
      })

      // Ajouter la classe active à l'onglet cliqué
      tab.classList.add("active", "bg-green-600", "text-white")
      tab.classList.remove("text-gray-400")

      const filter = tab.dataset.filter

      // Si c'est l'onglet "Tous", revenir à la vue chats normale
      if (filter === "all" || !filter) {
        currentView = "chats"
        renderChatList()
      } else {
        applyFilter(filter)
      }
    })
  })
}

function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item) => {
    item.addEventListener("click", async (e) => {
      e.preventDefault()
      e.stopPropagation()

      const view = item.dataset.view
      console.log(" Navigation vers:", view)

      if (isNavigating || currentView === view) {
        return
      }

      isNavigating = true

      try {
        currentView = view

        // Mettre à jour l'état visuel de la navigation
        navItems.forEach((nav) => nav.classList.remove("active"))
        item.classList.add("active")

        switch (view) {
          case "chats":
            await showChatsView()
            break
          case "status":
            await showStoriesView()
            break
          case "communities":
            showToast(" Groupes - Fonctionnalité en développement", "info")
            break
          case "settings":
            showSettingsView()
            break
        }

        console.log("Navigation terminée vers:", view)
      } catch (error) {
        console.error(" Erreur navigation:", error)
        currentView = "chats"
        await showChatsView()
      } finally {
        setTimeout(() => {
          isNavigating = false
        }, 500)
      }
    })
  })
}

async function showChatsView() {
  console.log(" Affichage vue chats")
  const sidebar = document.getElementById("sidebar")
  const profilePanel = document.getElementById("profilePanel")

  profilePanel.style.display = "none"
  sidebar.style.display = "flex"

  await loadChats()
}

async function showStoriesView() {
  console.log(" Affichage vue stories")
  const sidebar = document.getElementById("sidebar")
  const profilePanel = document.getElementById("profilePanel")

  profilePanel.style.display = "none"
  sidebar.style.display = "flex"

  await createStoriesInterface()
}

function showSettingsView() {
  console.log(" Affichage vue paramètres")
  const sidebar = document.getElementById("sidebar")
  const profilePanel = document.getElementById("profilePanel")

  profilePanel.style.display = "none"
  sidebar.style.display = "flex"

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
        <button id="createStoryBtn" class="w-full p-4 bg-[#202c33] hover:bg-[#2a3942] rounded-lg flex items-center space-x-3 mb-4 transition-colors">
          <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <i class="fas fa-plus text-white text-xl"></i>
          </div>
          <div class="text-left">
            <div class="text-white font-medium">Créer une story</div>
            <div class="text-gray-400 text-sm">Partagez un moment</div>
          </div>
        </button>
        
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

    const createStoryBtn = document.getElementById("createStoryBtn")
    if (createStoryBtn) {
      createStoryBtn.addEventListener("click", () => {
        createStoryModal(async (story) => {
          if (currentView === "status") {
            await createStoriesInterface()
          }
        })
      })
    }

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

function createSettingsInterface() {
  const chatList = document.getElementById("chatList")
  const currentUser = getCurrentUser()

  if (!chatList || !currentUser) return

  chatList.innerHTML = `
    <div class="p-4 space-y-4">
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
      
      <div class="space-y-2">
        <button id="addContactBtn" class="w-full p-3 bg-[#202c33] hover:bg-[#2a3942] rounded-lg flex items-center space-x-3 transition-colors">
          <i class="fas fa-user-plus text-green-400"></i>
          <span class="text-white">Ajouter un contact</span>
        </button>
        
        <button id="initChatsBtn" class="w-full p-3 bg-green-600 hover:bg-green-700 rounded-lg flex items-center space-x-3 transition-colors">
          <i class="fas fa-rocket text-white"></i>
          <span class="text-white">Initialiser tous les chats</span>
        </button>
        
        <button id="refreshBtn" class="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-3 transition-colors">
          <i class="fas fa-sync text-white"></i>
          <span class="text-white">Actualiser</span>
        </button>
        
        <button id="logoutBtn" class="w-full p-3 bg-red-600 hover:bg-red-700 rounded-lg flex items-center space-x-3 transition-colors">
          <i class="fas fa-sign-out-alt text-white"></i>
          <span class="text-white">Se déconnecter</span>
        </button>
      </div>
    </div>
  `

  // Event listeners pour les boutons
  const addContactBtn = document.getElementById("addContactBtn")
  if (addContactBtn) {
    addContactBtn.addEventListener("click", () => {
      createAddContactModal(async (contact) => {
        await loadChats()
        showToast(`${contact.name} ajouté avec succès`, "success")
      })
    })
  }

  const initChatsBtn = document.getElementById("initChatsBtn")
  if (initChatsBtn) {
    initChatsBtn.addEventListener("click", async () => {
      try {
        showToast(" Initialisation de tous les chats...", "info")
        const result = await initializeAllChats()
        showToast(`${result.chatsCreated} chats créés !`, "success")
        await loadChats()
      } catch (error) {
        console.error(" Erreur initialisation:", error)
        showToast(" Erreur lors de l'initialisation", "error")
      }
    })
  }

  const refreshBtn = document.getElementById("refreshBtn")
  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      showToast(" Actualisation...", "info")
      await loadChats()
      forceSyncNow()
      showToast(" Actualisé !", "success")
    })
  }

  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout)
  }
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
  let filteredChats = [...chats]

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

function renderChatList() {
  const chatList = document.getElementById("chatList")
  if (!chatList) return

  const currentUser = getCurrentUser()
  if (!currentUser) return

  console.log(` Rendu de ${chats.length} chats pour ${currentUser.name}`)

  chatList.innerHTML = ""

  if (chats.length === 0) {
    chatList.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <i class="fas fa-comments text-4xl mb-4 opacity-30"></i>
        <p class="mb-2">Aucune conversation</p>
        <p class="text-sm">Ajoutez un contact pour commencer !</p>
        <button id="addFirstContact" class="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
          <i class="fas fa-user-plus mr-2"></i>
          Ajouter un contact
        </button>
      </div>
    `

    const addFirstContact = document.getElementById("addFirstContact")
    if (addFirstContact) {
      addFirstContact.addEventListener("click", () => {
        createAddContactModal(async (contact) => {
          await loadChats()
          showToast(`${contact.name} ajouté avec succès`, "success")
        })
      })
    }
    return
  }

  // Trier par dernière activité
  const sortedChats = [...chats].sort((a, b) => {
    const timeA = new Date(a.lastMessageTime || a.time)
    const timeB = new Date(b.lastMessageTime || b.time)
    return timeB - timeA
  })

  sortedChats.forEach((chat) => {
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
          <p class="chat-message text-sm ${hasUnread ? "text-white font-medium" : "text-gray-400"} truncate">${chat.lastMessage || "Aucun message"}</p>
        </div>
      </div>
    </div>
  `

  chatItem.addEventListener("click", () => openChat(chat.id))

  return chatItem
}

async function openChat(chatId) {
  try {
    console.log(" Ouverture chat:", chatId)

    hideProfile()

    currentChat = chats.find((chat) => chat.id === chatId)
    window.currentChat = currentChat

    if (!currentChat) {
      console.error(" Chat non trouvé:", chatId)
      return
    }

    console.log("Chat ouvert:", currentChat.name)

    // Marquer comme lu
    if (currentChat.unread > 0) {
      currentChat.unread = 0
      await updateChat(currentChat.id, { unread: 0 })
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

    // Recharger la liste des chats pour mettre à jour les compteurs
    if (currentView === "chats") {
      renderChatList()
    }
  } catch (error) {
    console.error(" Erreur ouverture chat:", error)
    showToast("Erreur lors de l'ouverture du chat", "error")
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

    // Ajouter les boutons d'appel
    const callButtons = document.getElementById("callButtons")
    if (callButtons) {
      callButtons.innerHTML = `
        <button id="audioCallBtn" class="p-2 text-gray-400 hover:text-white transition-colors">
          <i class="fas fa-phone text-lg"></i>
        </button>
        <button id="videoCallBtn" class="p-2 text-gray-400 hover:text-white transition-colors">
          <i class="fas fa-video text-lg"></i>
        </button>
      `

      // Événements pour les appels
      const audioCallBtn = document.getElementById("audioCallBtn")
      const videoCallBtn = document.getElementById("videoCallBtn")

      if (audioCallBtn) {
        audioCallBtn.addEventListener("click", async () => {
          const { initializeAudioCall } = await import("./utils/calls.js")
          initializeAudioCall(currentChat)
        })
      }

      if (videoCallBtn) {
        videoCallBtn.addEventListener("click", async () => {
          const { startVideoCall } = await import("./utils/calls.js")
          startVideoCall(currentChat)
        })
      }
    }
  }
}

async function renderMessages() {
  const messagesArea = document.getElementById("messagesArea")
  if (!messagesArea || !currentChat) return

  try {
    console.log(" Rendu des messages pour:", currentChat.name)
    const messages = await getMessages(currentChat.id)
    currentChat.messages = messages

    messagesArea.innerHTML = ""

    if (messages.length === 0) {
      messagesArea.innerHTML = `
        <div class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <i class="fas fa-comments text-4xl mb-4 opacity-30"></i>
            <p>Aucun message</p>
            <p class="text-sm">Envoyez votre premier message !</p>
          </div>
        </div>
      `
      return
    }

    messages.forEach((message) => {
      const messageElement = createMessageElement(message)
      messagesArea.appendChild(messageElement)
    })

    messagesArea.scrollTop = messagesArea.scrollHeight
    console.log(` ${messages.length} messages affichés`)
  } catch (error) {
    console.error(" Erreur lors du rendu des messages:", error)
    showToast("Erreur lors du chargement des messages", "error")
  }
}

function createMessageElement(message) {
  const currentUser = getCurrentUser()
  const isSentByMe = message.senderId === currentUser.id

  const messageDiv = document.createElement("div")
  messageDiv.className = `flex mb-4 ${isSentByMe ? "justify-end" : "justify-start"}`
  messageDiv.dataset.messageId = message.id

  let messageContent = ""

  switch (message.type) {
    case "text":
    default:
      messageContent = `<p class="text-sm">${message.text}</p>`
      break
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

  // Gestion du bouton vocal
  if (voiceBtn) {
    let isRecording = false

    voiceBtn.addEventListener("click", async () => {
      if (!isRecording) {
        // Démarrer l'enregistrement
        const { startVoiceRecording } = await import("./utils/audio-recorder.js")
        const success = await startVoiceRecording()
        if (success) {
          isRecording = true
        }
      } else {
        // Arrêter l'enregistrement
        const { stopVoiceRecording } = await import("./utils/audio-recorder.js")
        stopVoiceRecording()
        isRecording = false
      }
    })
  }

  async function sendTextMessage() {
    if (isSending) {
      console.log("⏳ Envoi déjà en cours, ignoré")
      return
    }

    const text = messageText.value.trim()
    if (!text) return

    // Vérifier si on est dans un chat normal ou un groupe
    if (!currentChat && !currentGroup) return

    try {
      isSending = true
      const currentUser = getCurrentUser()
      if (!currentUser) return

      console.log("📤 Envoi message:", text)

      const message = {
        id: Date.now(),
        senderId: currentUser.id,
        receiverId: currentGroup ? currentGroup.id : currentChat.contactId,
        text: text,
        sent: true,
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        timestamp: new Date().toISOString(),
        type: "text",
        status: "sent",
      }

      // Vider le champ de message immédiatement
      messageText.value = ""

      // Affichage immédiat du message
      const messageElement = createMessageElement(message)
      const messagesArea = document.getElementById("messagesArea")
      if (messagesArea) {
        messagesArea.appendChild(messageElement)
        messagesArea.scrollTop = messagesArea.scrollHeight
      }

      // Envoyer au serveur
      if (currentGroup) {
        await sendGroupMessage(currentUser.id, currentGroup.id, message)
      } else {
        await handleSendMessage(currentUser.id, currentChat.contactId, message)
      }

      // Mettre à jour la liste des chats
      if (currentView === "chats") {
        await loadChats()
      }

      console.log("✅ Message envoyé avec succès")
    } catch (error) {
      console.error("❌ Erreur envoi message:", error)
      showToast("Erreur lors de l'envoi", "error")
    } finally {
      isSending = false
    }
  }

  sendButton.addEventListener("click", sendTextMessage)
  messageText.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendTextMessage()
    }
  })
}

function handleBackButton() {
  if (isMobile()) {
    document.getElementById("sidebar").style.display = "flex"
    document.getElementById("chatArea").style.display = "none"
  }

  currentChat = null
  currentGroup = null
  window.currentChat = null
  window.currentGroup = null
  document.getElementById("chatHeader").style.display = "none"
  document.getElementById("messageInput").style.display = "none"
  showWelcomeMessage()
}

function showProfile() {
  const sidebar = document.getElementById("sidebar")
  const profilePanel = document.getElementById("profilePanel")
  const chatArea = document.getElementById("chatArea")

  sidebar.style.display = "none"
  chatArea.style.display = "none"
  profilePanel.style.display = "flex"

  updateProfileInfo()
}

function hideProfile() {
  const sidebar = document.getElementById("sidebar")
  const profilePanel = document.getElementById("profilePanel")
  const chatArea = document.getElementById("chatArea")

  profilePanel.style.display = "none"
  sidebar.style.display = "flex"

  if (currentChat || currentGroup) {
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

function handleResize() {
  if (!isMobile() && (currentChat || currentGroup)) {
    document.getElementById("sidebar").style.display = "flex"
    document.getElementById("chatArea").style.display = "flex"
  }
}

function isMobile() {
  return window.innerWidth < 768
}

function startAutoRefresh() {
  // Rafraîchir les chats toutes les 10 secondes SEULEMENT si on est sur la vue chats
  setInterval(async () => {
    if (currentView === "chats") {
      await loadChats()
    }
    // NE PAS recharger si on est sur la vue groupes
  }, 10000)
}

function handleNewMessage(message, chat) {
  const currentUser = getCurrentUser()
  if (!currentUser) return

  // Si c'est le chat actuellement ouvert, ajouter le message
  if (currentChat && currentChat.id === chat.id) {
    const messageElement = createMessageElement(message)
    const messagesArea = document.getElementById("messagesArea")
    if (messagesArea) {
      messagesArea.appendChild(messageElement)
      messagesArea.scrollTop = messagesArea.scrollHeight
    }
  }

  // Recharger la liste des chats pour mettre à jour les compteurs
  if (currentView === "chats") {
    loadChats()
  }

  // Afficher une notification
  if (message.senderId !== currentUser.id) {
    showToast(` Nouveau message de ${chat.name}`, "info")
  }
}

function updateUserStatus(userId, isOnline) {
  // Mettre à jour le statut dans la liste des chats
  const chatItems = document.querySelectorAll(".chat-item")
  chatItems.forEach((item) => {
    const chat = chats.find((c) => c.id === item.dataset.chatId)
    if (chat && chat.contactId === userId) {
      const indicator = item.querySelector(".online-indicator")
      if (isOnline && !indicator) {
        const avatar = item.querySelector(".relative")
        avatar.innerHTML +=
          '<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#222e35]"></div>'
      } else if (!isOnline && indicator) {
        indicator.remove()
      }
    }
  })

  // Mettre à jour le statut dans l'en-tête du chat actuel
  if (currentChat && currentChat.contactId === userId) {
    const chatStatus = document.getElementById("chatStatus")
    if (chatStatus) {
      chatStatus.textContent = isOnline ? "en ligne" : "hors ligne"
    }
  }
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

// GESTION COMPLÈTE DES GROUPES
function initializeSimpleGroups() {
  console.log("🚀 Initialisation simple des groupes...")

  // Attendre que le DOM soit prêt
  setTimeout(() => {
    const filterTabs = document.querySelectorAll(".filter-tab")

    filterTabs.forEach((tab, index) => {
      const text = tab.textContent.trim().toLowerCase()

      // Si c'est l'onglet groupes (généralement le 4ème)
      if (text.includes("groupe") || text.includes("group") || index === 3) {
        console.log("📱 Onglet Groupes trouvé:", text)

        // Supprimer les anciens événements
        const newTab = tab.cloneNode(true)
        tab.parentNode.replaceChild(newTab, tab)

        // Ajouter le nouvel événement
        newTab.addEventListener("click", showSimpleGroups)
      }
    })
  }, 1000)
}

async function showSimpleGroups() {
  console.log("📱 Affichage des groupes...")

  // Exposer la fonction globalement pour le rechargement automatique
  window.showSimpleGroups = showSimpleGroups

  const chatList = document.getElementById("chatList")
  if (!chatList) return

  // Marquer l'onglet comme actif
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.classList.remove("active", "bg-green-600", "text-white")
    tab.classList.add("text-gray-400")
  })

  event.target.classList.add("active", "bg-green-600", "text-white")
  event.target.classList.remove("text-gray-400")

  // IMPORTANT: Changer la vue actuelle pour éviter le retour automatique
  currentView = "groups"

  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      showToast("Vous devez être connecté", "error")
      return
    }

    // Récupérer les groupes de l'utilisateur
    const { getUserGroups } = await import("./utils/groups.js")
    const userGroups = await getUserGroups(currentUser.id)

    // Afficher l'interface des groupes
    chatList.innerHTML = `
      <div class="p-4">
        <button id="createGroupBtn" class="w-full p-4 bg-green-600 hover:bg-green-700 rounded-lg flex items-center space-x-3 mb-4 transition-colors">
          <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <i class="fas fa-users text-green-600 text-xl"></i>
          </div>
          <div class="text-left">
            <div class="text-white font-medium">Nouveau groupe</div>
            <div class="text-gray-200 text-sm">Créer un groupe avec vos contacts</div>
          </div>
        </button>
        
        <div class="space-y-2">
          ${
            userGroups.length === 0
              ? `
            <div class="text-center py-8 text-gray-400">
              <div class="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                <i class="fas fa-users text-2xl text-gray-400"></i>
              </div>
              <h3 class="text-lg font-medium text-white mb-2">Aucun groupe</h3>
              <p class="text-gray-400 text-sm max-w-xs mx-auto">
                Vous n'avez pas encore de groupes. Créez-en un pour commencer !
              </p>
            </div>
          `
              : userGroups
                  .map(
                    (group) => `
            <div class="group-item p-4 hover:bg-[#2a3942] cursor-pointer border-b border-gray-800 transition-colors" data-group-id="${group.id}">
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <img src="${group.avatar || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop"}" 
                       alt="${group.name}" 
                       class="w-12 h-12 rounded-full object-cover">
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                    <i class="fas fa-users text-xs text-white"></i>
                  </div>
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <h3 class="font-medium text-white truncate">${group.name}</h3>
                    <span class="text-xs text-gray-400">${formatTime(group.lastMessageTime)}</span>
                  </div>
                  
                  <div class="flex items-center justify-between mt-1">
                    <p class="text-sm text-gray-400 truncate">
                      ${group.lastMessage || "Aucun message"}
                    </p>
                    <div class="flex items-center space-x-2">
                      ${
                        group.admins && group.admins.includes(currentUser.id)
                          ? '<i class="fas fa-crown text-yellow-500 text-xs" title="Administrateur"></i>'
                          : ""
                      }
                      <span class="text-xs text-gray-500">${group.members ? group.members.length : 0} membres</span>
                    </div>
                  </div>
                  
                  ${group.description ? `<p class="text-xs text-gray-500 mt-1 truncate">${group.description}</p>` : ""}
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

    // Événement pour créer un groupe (UTILISER LE CODE EXISTANT)
    const createGroupBtn = document.getElementById("createGroupBtn")
    if (createGroupBtn) {
      createGroupBtn.addEventListener("click", async () => {
        try {
          const { createGroupModal } = await import("./utils/groups.js")
          createGroupModal((newGroup) => {
            if (newGroup) {
              showToast(`Groupe "${newGroup.name}" créé avec succès`, "success")
              // Le rechargement se fait automatiquement dans createGroup()
            }
          })
        } catch (error) {
          console.error("Erreur chargement module groupes:", error)
          showToast("Erreur lors du chargement du module groupes", "error")
        }
      })
    }

    // Événements pour ouvrir les groupes
    document.querySelectorAll(".group-item").forEach((item) => {
      item.addEventListener("click", () => {
        const groupId = item.dataset.groupId
        const group = userGroups.find((g) => g.id === groupId)
        if (group) {
          openGroupChat(group)
        }
      })
    })

    console.log(`✅ ${userGroups.length} groupe(s) affiché(s)`)
  } catch (error) {
    console.error("❌ Erreur affichage groupes:", error)
    chatList.innerHTML = `
      <div class="text-center py-8 text-red-400">
        <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
        <p>Erreur de chargement des groupes</p>
        <button onclick="showSimpleGroups()" class="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
          Réessayer
        </button>
      </div>
    `
  }
}

async function openGroupChat(group) {
  try {
    console.log("💬 Ouverture du chat de groupe:", group.name)

    // Fermer le chat normal s'il est ouvert
    currentChat = null
    window.currentChat = null

    // Définir le groupe actuel
    currentGroup = group
    window.currentGroup = group

    // Responsive
    if (isMobile()) {
      document.getElementById("sidebar").style.display = "none"
      document.getElementById("chatArea").style.display = "flex"
    } else {
      document.getElementById("chatArea").style.display = "flex"
    }

    showGroupHeader(group)
    await renderGroupMessages(group)
    showMessageInput()

    showToast(`Groupe "${group.name}" ouvert`, "success")
  } catch (error) {
    console.error("❌ Erreur ouverture groupe:", error)
    showToast("Erreur lors de l'ouverture du groupe", "error")
  }
}

function showGroupHeader(group) {
  const chatHeader = document.getElementById("chatHeader")
  const chatAvatar = document.getElementById("chatAvatar")
  const chatName = document.getElementById("chatName")
  const chatStatus = document.getElementById("chatStatus")

  if (chatHeader && group) {
    chatHeader.style.display = "flex"
    chatAvatar.innerHTML = `
      <div class="relative">
        <img src="${group.avatar || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop"}" 
             alt="${group.name}" class="w-10 h-10 rounded-full object-cover">
        <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-600 rounded-full flex items-center justify-center">
          <i class="fas fa-users text-xs text-white"></i>
        </div>
      </div>
    `
    chatName.textContent = group.name

    // NOUVEAU: Afficher "Vous" et les noms des autres membres
    displayGroupMembersInHeader(group, chatStatus)

    // NOUVEAU: Ajouter le menu des trois points avec toutes les options
    const callButtons = document.getElementById("callButtons")
    if (callButtons) {
      const currentUser = getCurrentUser()
      const isAdmin = group.admins && group.admins.includes(currentUser.id)

      callButtons.innerHTML = `
        <div class="relative">
          <button id="groupMenuBtn" class="p-2 text-gray-400 hover:text-white transition-colors" title="Options du groupe">
            <i class="fas fa-ellipsis-v text-lg"></i>
          </button>
          
          <!-- Menu déroulant -->
          <div id="groupMenu" class="absolute right-0 top-full mt-2 w-64 bg-[#222e35] rounded-lg shadow-xl border border-gray-600 z-50 hidden">
            <div class="py-2">
              <button id="groupInfoBtn" class="w-full px-4 py-3 text-left text-white hover:bg-[#2a3942] flex items-center space-x-3">
                <i class="fas fa-info-circle text-blue-400"></i>
                <span>Infos du groupe</span>
              </button>
              
              ${
                isAdmin
                  ? `
                <button id="addMemberBtn" class="w-full px-4 py-3 text-left text-white hover:bg-[#2a3942] flex items-center space-x-3">
                  <i class="fas fa-user-plus text-green-400"></i>
                  <span>Ajouter un membre</span>
                </button>
                
                <button id="manageMembersBtn" class="w-full px-4 py-3 text-left text-white hover:bg-[#2a3942] flex items-center space-x-3">
                  <i class="fas fa-users-cog text-yellow-400"></i>
                  <span>Gérer les membres</span>
                </button>
                
                <div class="border-t border-gray-600 my-2"></div>
                
                <button id="groupSettingsBtn" class="w-full px-4 py-3 text-left text-white hover:bg-[#2a3942] flex items-center space-x-3">
                  <i class="fas fa-cog text-gray-400"></i>
                  <span>Paramètres du groupe</span>
                </button>
              `
                  : ""
              }
              
              <div class="border-t border-gray-600 my-2"></div>
              
              <button id="leaveGroupBtn" class="w-full px-4 py-3 text-left text-red-400 hover:bg-[#2a3942] flex items-center space-x-3">
                <i class="fas fa-sign-out-alt"></i>
                <span>Quitter le groupe</span>
              </button>
            </div>
          </div>
        </div>
      `

      // Gestion du menu déroulant
      const groupMenuBtn = document.getElementById("groupMenuBtn")
      const groupMenu = document.getElementById("groupMenu")

      if (groupMenuBtn && groupMenu) {
        groupMenuBtn.addEventListener("click", (e) => {
          e.stopPropagation()
          groupMenu.classList.toggle("hidden")
        })

        // Fermer le menu en cliquant ailleurs
        document.addEventListener("click", () => {
          groupMenu.classList.add("hidden")
        })

        groupMenu.addEventListener("click", (e) => {
          e.stopPropagation()
        })
      }

      // Événements pour les boutons du menu
      const groupInfoBtn = document.getElementById("groupInfoBtn")
      const addMemberBtn = document.getElementById("addMemberBtn")
      const manageMembersBtn = document.getElementById("manageMembersBtn")
      const groupSettingsBtn = document.getElementById("groupSettingsBtn")
      const leaveGroupBtn = document.getElementById("leaveGroupBtn")

      if (groupInfoBtn) {
        groupInfoBtn.addEventListener("click", async () => {
          groupMenu.classList.add("hidden")
          const { showGroupInfo } = await import("./utils/groups.js")
          showGroupInfo(group)
        })
      }

      if (addMemberBtn) {
        addMemberBtn.addEventListener("click", async () => {
          groupMenu.classList.add("hidden")
          const { showAddMemberModal } = await import("./utils/groups.js")
          showAddMemberModal(group)
        })
      }

      if (manageMembersBtn) {
        manageMembersBtn.addEventListener("click", async () => {
          groupMenu.classList.add("hidden")
          const { showGroupInfo } = await import("./utils/groups.js")
          showGroupInfo(group) // Utilise la même modal avec les options de gestion
        })
      }

      if (groupSettingsBtn) {
        groupSettingsBtn.addEventListener("click", () => {
          groupMenu.classList.add("hidden")
          showToast("Paramètres du groupe - En développement", "info")
        })
      }

      if (leaveGroupBtn) {
        leaveGroupBtn.addEventListener("click", () => {
          groupMenu.classList.add("hidden")
          if (confirm(`Êtes-vous sûr de vouloir quitter le groupe "${group.name}" ?`)) {
            showToast("Fonctionnalité en développement", "info")
          }
        })
      }
    }
  }
}

// AJOUTER cette fonction dans script.js
async function displayGroupMembersInHeader(group, statusElement) {
  try {
    const currentUser = getCurrentUser()

    // Récupérer les membres du groupe
    const { getGroupMembers } = await import("./utils/groups.js")
    const members = await getGroupMembers(group.id)

    if (members.length === 0) {
      statusElement.textContent = "Aucun membre"
      return
    }

    // Séparer l'utilisateur actuel des autres
    const currentUserInGroup = members.find((m) => m.id === currentUser.id)
    const otherMembers = members.filter((m) => m.id !== currentUser.id)

    let statusText = ""

    if (currentUserInGroup) {
      statusText = "Vous"
      if (otherMembers.length > 0) {
        if (otherMembers.length === 1) {
          statusText += `, ${otherMembers[0].name}`
        } else if (otherMembers.length === 2) {
          statusText += `, ${otherMembers[0].name}, ${otherMembers[1].name}`
        } else {
          statusText += `, ${otherMembers[0].name} et ${otherMembers.length - 1} autre${otherMembers.length - 1 > 1 ? "s" : ""}`
        }
      }
    } else {
      // Si l'utilisateur actuel n'est pas dans le groupe (cas rare)
      if (members.length === 1) {
        statusText = members[0].name
      } else if (members.length === 2) {
        statusText = `${members[0].name}, ${members[1].name}`
      } else {
        statusText = `${members[0].name} et ${members.length - 1} autres`
      }
    }

    statusElement.textContent = statusText
    console.log("✅ Membres affichés:", statusText)
  } catch (error) {
    console.error("Erreur affichage membres:", error)
    statusElement.textContent = `${group.members ? group.members.length : 0} membres`
  }
}

async function renderGroupMessages(group) {
  const messagesArea = document.getElementById("messagesArea")
  if (!messagesArea || !group) return

  try {
    console.log("📱 Rendu des messages du groupe:", group.name)

    // Récupérer les messages du groupe
    const { getGroupMessages } = await import("./utils/groups.js")
    const messages = await getGroupMessages(group.id)

    messagesArea.innerHTML = ""

    if (messages.length === 0) {
      messagesArea.innerHTML = `
        <div class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <i class="fas fa-users text-4xl mb-4 opacity-30"></i>
            <p>Aucun message dans ce groupe</p>
            <p class="text-sm">Soyez le premier à écrire !</p>
          </div>
        </div>
      `
      return
    }

    messages.forEach((message) => {
      const messageElement = createGroupMessageElement(message, group)
      messagesArea.appendChild(messageElement)
    })

    messagesArea.scrollTop = messagesArea.scrollHeight
    console.log(`✅ ${messages.length} messages de groupe affichés`)
  } catch (error) {
    console.error("❌ Erreur rendu messages groupe:", error)
    messagesArea.innerHTML = `
      <div class="flex items-center justify-center h-full text-red-500">
        <div class="text-center">
          <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <p>Erreur de chargement des messages</p>
        </div>
      </div>
    `
  }
}

function createGroupMessageElement(message, group) {
  const currentUser = getCurrentUser()
  const isSentByMe = message.senderId === currentUser.id

  const messageDiv = document.createElement("div")
  messageDiv.className = `flex mb-4 ${isSentByMe ? "justify-end" : "justify-start"}`
  messageDiv.dataset.messageId = message.id

  // Pour les messages de groupe, afficher le nom de l'expéditeur
  let senderName = ""
  if (!isSentByMe && message.senderName) {
    senderName = `<div class="text-xs text-gray-400 mb-1">${message.senderName}</div>`
  }

  let messageContent = ""
  switch (message.type) {
    case "text":
    default:
      messageContent = `<p class="text-sm">${message.text}</p>`
      break
  }

  messageDiv.innerHTML = `
    <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
      isSentByMe ? "bg-[#005c4b] text-white" : "bg-[#202c33] text-white"
    } shadow-md">
      ${senderName}
      ${messageContent}
      <div class="flex justify-end items-center mt-1 space-x-1">
        <span class="text-xs text-gray-300">${message.time}</span>
        ${isSentByMe ? `<i class="fas fa-check-double text-xs ${message.status === "read" ? "text-blue-400" : "text-gray-400"}"></i>` : ""}
      </div>
    </div>
  `

  return messageDiv
}

async function sendGroupMessage(senderId, groupId, message) {
  try {
    console.log("📤 === ENVOI MESSAGE GROUPE ===")
    console.log("Expéditeur:", senderId)
    console.log("Groupe:", groupId)
    console.log("Message:", message.text)

    const { sendMessageToGroup } = await import("./utils/groups.js")
    const result = await sendMessageToGroup(senderId, groupId, message)

    console.log("✅ Message de groupe envoyé:", result)
    return result
  } catch (error) {
    console.error("❌ Erreur envoi message groupe:", error)
    throw error
  }
}

// Fonction utilitaire pour formater l'heure
function formatTime(timestamp) {
  if (!timestamp) return ""

  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString("fr-FR", { weekday: "short" })
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  })
}

// Initialiser les groupes au chargement
document.addEventListener("DOMContentLoaded", () => {
  initializeSimpleGroups()
})
