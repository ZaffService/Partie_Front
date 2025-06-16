import { getCurrentUser, createLoginForm, logout } from "./utils/auth.js"
import { getChats, updateChat, getMessages, initializeAllChats } from "./utils/api.js"
import { showToast, requestNotificationPermission } from "./utils/notifications.js"
import { initializeRealTimeSync, forceSyncNow } from "./utils/realtime.js"
import { handleSendMessage } from "./utils/chat-handler.js"
import { createAddContactModal } from "./utils/contacts.js"
import { getStories, createStoryModal, createStoryViewer } from "./utils/stories.js"

let chats = []
let currentChat = null
let currentGroup = null
let currentView = "chats"
let isNavigating = false
let isSending = false

// Variables globales pour l'application
window.currentChat = null
window.currentGroup = null
window.showSimpleGroups = null

document.addEventListener("DOMContentLoaded", () => {
  console.log(" WhatsApp Web démarré")
  initApp()
  // Initialiser les groupes après le chargement
  setTimeout(initializeSimpleGroups, 1000)
})

async function initApp() {
  const mainContainer = document.getElementById("mainContainer")
  const loginContainer = document.getElementById("loginContainer")

  const currentUser = getCurrentUser()

  if (!currentUser) {
    console.log("❌ Aucun utilisateur connecté")
    showLoginForm()
  } else {
    console.log("✅ Utilisateur connecté:", currentUser.name)
    showMainApp()
  }

  function showLoginForm() {
    mainContainer.style.display = "none"
    loginContainer.style.display = "block"
    loginContainer.innerHTML = ""

    const loginForm = createLoginForm((user) => {
      console.log("✅ Connexion réussie pour:", user.name)
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
    console.log("🔧 Initialisation de l'interface...")

    await loadChats()
    setupEventListeners()
    updateUserAvatar()
    showWelcomeMessage()

    initializeRealTimeSync(
      (message, chat) => {
        console.log("📨 Nouveau message reçu:", message)
        handleNewMessage(message, chat)
      },
      (userId, isOnline) => {
        console.log(`👤 Statut utilisateur ${userId}:`, isOnline ? "en ligne" : "hors ligne")
        updateUserStatus(userId, isOnline)
      },
    )

    startAutoRefresh()
    await requestNotificationPermission()

    console.log("✅ Interface principale initialisée")
  } catch (error) {
    console.error(" Erreur initialisation:", error)
    showToast("Erreur de chargement", "error")
  }
}

async function loadChats() {
  try {
    console.log("📂 Chargement des chats...")
    chats = await getChats()
    console.log(`📊 ${chats.length} chats chargés`)

    if (currentView === "chats") {
      renderChatList()
    }

    if (currentChat) {
      const messages = await getMessages(currentChat.id)
      renderMessages(messages)
    }
  } catch (error) {
    console.error("❌ Erreur chargement chats:", error)
    showToast("Impossible de charger les conversations", "error")
  }
}

function setupEventListeners() {
  console.log("🔧 Configuration des événements...")

  const userAvatarButton = document.getElementById("userAvatarButton")
  if (userAvatarButton) {
    userAvatarButton.addEventListener("click", showProfile)
  }

  const backToChats = document.getElementById("backToChats")
  if (backToChats) {
    backToChats.addEventListener("click", hideProfile)
  }

  const logoutButton = document.getElementById("logoutButton")
  if (logoutButton) {
    logoutButton.addEventListener("click", logout)
  }

  const backButton = document.getElementById("backButton")
  if (backButton) {
    backButton.addEventListener("click", handleBackButton)
  }

  setupMessageInput()
  setupNavigation()
  setupSearch()
  setupFilterTabs()
  setupNewChatButton()

  window.addEventListener("resize", handleResize)
}

function setupNewChatButton() {
  const newChatBtn = document.getElementById("newChatBtn")
  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        showToast("❌ Erreur: utilisateur non connecté", "error")
        return
      }

      createAddContactModal(async (contact) => {
        console.log("✅ Contact ajouté:", contact.name)
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
      // Réinitialiser tous les onglets
      filterTabs.forEach((t) => {
        t.classList.remove("active", "bg-green-600", "text-white")
        t.classList.add("text-gray-400")
      })

      // Activer l'onglet cliqué
      tab.classList.add("active", "bg-green-600", "text-white")
      tab.classList.remove("text-gray-400")

      const filter = tab.dataset.filter
      const text = tab.textContent.trim().toLowerCase()

      // Vérifier si c'est l'onglet groupes
      if (text.includes("groupe") || text.includes("group")) {
        console.log("📱 Clic sur onglet Groupes")
        currentView = "groups"
        showSimpleGroups()
      } else {
        // Pour tous les autres onglets, revenir aux chats normaux
        console.log("💬 Retour aux chats normaux")
        currentView = "chats"

        // IMPORTANT: Réinitialiser les variables de groupe
        currentGroup = null
        window.currentGroup = null

        if (filter === "all" || !filter) {
          renderChatList()
        } else {
          applyFilter(filter)
        }
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
      console.log("🧭 Navigation vers:", view)

      if (isNavigating || currentView === view) {
        return
      }

      isNavigating = true

      try {
        currentView = view

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
            showToast("📱 Groupes - Fonctionnalité en développement", "info")
            break
          case "settings":
            showSettingsView()
            break
        }

        console.log("✅ Navigation terminée vers:", view)
      } catch (error) {
        console.error("❌ Erreur navigation:", error)
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
  console.log("💬 Affichage vue chats")
  const sidebar = document.getElementById("sidebar")
  const profilePanel = document.getElementById("profilePanel")

  profilePanel.style.display = "none"
  sidebar.style.display = "flex"

  // IMPORTANT: Réinitialiser les variables de groupe
  currentGroup = null
  window.currentGroup = null

  await loadChats()
}

async function showStoriesView() {
  console.log("📸 Affichage vue stories")
  const sidebar = document.getElementById("sidebar")
  const profilePanel = document.getElementById("profilePanel")

  profilePanel.style.display = "none"
  sidebar.style.display = "flex"

  await createStoriesInterface()
}

function showSettingsView() {
  console.log("⚙️ Affichage vue paramètres")
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
    console.error("❌ Erreur chargement stories:", error)
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
        console.error("❌ Erreur initialisation:", error)
        showToast(" Erreur lors de l'initialisation", "error")
      }
    })
  }

  const refreshBtn = document.getElementById("refreshBtn")
  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      showToast("Actualisation...", "info")
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

  console.log(`📊 Rendu de ${chats.length} chats pour ${currentUser.name}`)

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

  // CORRECTION IMPORTANTE: S'assurer qu'on ouvre bien un CHAT et pas un groupe
  chatItem.addEventListener("click", () => {
    console.log("🔘 Clic sur chat:", chat.name, "ID:", chat.id)

    // Réinitialiser les variables de groupe
    currentGroup = null
    window.currentGroup = null

    // Ouvrir le chat personnel
    openChat(chat.id)
  })

  return chatItem
}

async function openChat(chatId) {
  try {
    console.log("💬 === OUVERTURE CHAT PERSONNEL ===")
    console.log("Chat ID:", chatId)

    hideProfile()

    // IMPORTANT: Réinitialiser les variables de groupe
    currentGroup = null
    window.currentGroup = null

    // Trouver le chat dans la liste des chats PERSONNELS
    currentChat = chats.find((chat) => chat.id === chatId)
    window.currentChat = currentChat

    if (!currentChat) {
      console.error("❌ Chat non trouvé:", chatId)
      showToast("Chat non trouvé", "error")
      return
    }

    console.log("✅ Chat personnel ouvert:", currentChat.name)
    console.log("Contact ID:", currentChat.contactId)

    if (currentChat.unread > 0) {
      currentChat.unread = 0
      await updateChat(currentChat.id, { unread: 0 })
    }

    document.querySelectorAll(".chat-item").forEach((item) => {
      item.classList.remove("bg-[#202c33]")
    })
    document.querySelector(`[data-chat-id="${chatId}"]`)?.classList.add("bg-[#202c33]")

    if (isMobile()) {
      document.getElementById("sidebar").style.display = "none"
      document.getElementById("chatArea").style.display = "flex"
    } else {
      document.getElementById("chatArea").style.display = "flex"
    }

    showChatHeader()
    await renderMessages()
    showMessageInput()

    if (currentView === "chats") {
      renderChatList()
    }
  } catch (error) {
    console.error("❌ Erreur ouverture chat:", error)
    showToast("Erreur lors de l'ouverture du chat", "error")
  }
}

function showChatHeader() {
  const chatHeader = document.getElementById("chatHeader")
  const chatAvatar = document.getElementById("chatAvatar")
  const chatName = document.getElementById("chatName")
  const chatStatus = document.getElementById("chatStatus")

  if (chatHeader && (currentChat || currentGroup)) {
    chatHeader.style.display = "flex"

    // Si c'est un groupe
    if (currentGroup) {
      console.log("📱 Affichage header GROUPE:", currentGroup.name)
      chatAvatar.innerHTML = `
        <div class="relative">
          <img src="${currentGroup.avatar || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop"}" 
               alt="${currentGroup.name}" class="w-10 h-10 rounded-full object-cover">
          <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-600 rounded-full flex items-center justify-center">
            <i class="fas fa-users text-xs text-white"></i>
          </div>
        </div>
      `
      chatName.textContent = currentGroup.name
      displayGroupMembersInHeader(currentGroup, chatStatus)

      // Bouton simple et direct pour les infos du groupe
      const callButtons = document.getElementById("callButtons")
      if (callButtons) {
        callButtons.innerHTML = `
          <button onclick="openGroupInfos()" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors">
             Infos
          </button>
        `
      }
    }
    // Si c'est un chat normal
    else if (currentChat) {
      console.log("💬 Affichage header CHAT PERSONNEL:", currentChat.name)
      chatAvatar.innerHTML = `<img src="${currentChat.avatar}" alt="${currentChat.name}" class="w-10 h-10 rounded-full object-cover">`
      chatName.textContent = currentChat.name
      chatStatus.textContent = currentChat.isOnline ? "en ligne" : currentChat.status

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
}

async function renderMessages() {
  const messagesArea = document.getElementById("messagesArea")
  if (!messagesArea || !currentChat) return

  try {
    console.log("📨 Rendu des messages pour:", currentChat.name)
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
    console.log(`✅ ${messages.length} messages affichés`)
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
    case "voice":
      messageContent = `
        <div class="flex items-center space-x-3">
          ${
            !isSentByMe
              ? `
            <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img src="${currentUser.avatar}" alt="Avatar" class="w-full h-full object-cover">
            </div>
          `
              : ""
          }
          
          <button class="voice-play-btn w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all" 
                  data-message-id="${message.id}" 
                  data-audio-data="${message.fileData}">
            <i class="fas fa-play text-sm"></i>
          </button>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-1 mb-1">
              ${Array.from({ length: 20 }, (_, i) => {
                const height = Math.random() * 16 + 4
                return `<div class="bg-white bg-opacity-60 rounded-full" style="width: 2px; height: ${height}px;"></div>`
              }).join("")}
            </div>
            <div class="text-xs text-gray-300">
              <span class="voice-duration">${message.duration || 0}s</span>
            </div>
          </div>
        </div>
      `
      break
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

  if (message.type === "voice") {
    const playBtn = messageDiv.querySelector(".voice-play-btn")
    if (playBtn) {
      playBtn.addEventListener("click", () => playVoiceMessage(playBtn))
    }
  }

  return messageDiv
}

function playVoiceMessage(button) {
  const messageId = button.dataset.messageId
  const audioData = button.dataset.audioData

  if (!audioData) {
    showToast("Données audio manquantes", "error")
    return
  }

  try {
    const audio = new Audio(audioData)
    const icon = button.querySelector("i")
    const durationSpan = button.closest(".max-w-xs, .max-w-md").querySelector(".voice-duration")

    let isPlaying = false

    audio.addEventListener("timeupdate", () => {
      if (durationSpan && audio.duration) {
        const remaining = Math.ceil(audio.duration - audio.currentTime)
        durationSpan.textContent = `${remaining}s`
      }
    })

    audio.addEventListener("ended", () => {
      icon.className = "fas fa-play text-sm"
      if (durationSpan && audio.duration) {
        durationSpan.textContent = `${Math.ceil(audio.duration)}s`
      }
      isPlaying = false
    })

    audio.addEventListener("error", (e) => {
      console.error("Erreur lecture audio:", e)
      showToast("Erreur lecture audio", "error")
      icon.className = "fas fa-play text-sm"
      isPlaying = false
    })

    if (!isPlaying) {
      audio
        .play()
        .then(() => {
          icon.className = "fas fa-pause text-sm"
          isPlaying = true
        })
        .catch((error) => {
          console.error("Erreur démarrage audio:", error)
          showToast("Impossible de lire l'audio", "error")
        })
    } else {
      audio.pause()
      icon.className = "fas fa-play text-sm"
      isPlaying = false
    }
  } catch (error) {
    console.error("Erreur création audio:", error)
    showToast("Erreur lecture message vocal", "error")
  }
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

  if (voiceBtn) {
    let isRecording = false

    voiceBtn.addEventListener("click", async () => {
      if (!isRecording) {
        const { startVoiceRecording } = await import("./utils/audio-recorder.js")
        const success = await startVoiceRecording()
        if (success) {
          isRecording = true
        }
      } else {
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

      messageText.value = ""

      const messageElement = createMessageElement(message)
      const messagesArea = document.getElementById("messagesArea")
      if (messagesArea) {
        messagesArea.appendChild(messageElement)
        messagesArea.scrollTop = messagesArea.scrollHeight
      }

      if (currentGroup) {
        await sendGroupMessage(currentUser.id, currentGroup.id, message)
      } else {
        await handleSendMessage(currentUser.id, currentChat.contactId, message)
      }

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
  setInterval(async () => {
    if (currentView === "chats") {
      await loadChats()
    }
  }, 10000)
}

function handleNewMessage(message, chat) {
  const currentUser = getCurrentUser()
  if (!currentUser) return

  if (currentChat && currentChat.id === chat.id) {
    const messageElement = createMessageElement(message)
    const messagesArea = document.getElementById("messagesArea")
    if (messagesArea) {
      messagesArea.appendChild(messageElement)
      messagesArea.scrollTop = messagesArea.scrollHeight
    }
  }

  if (currentView === "chats") {
    loadChats()
  }

  if (message.senderId !== currentUser.id) {
    showToast(` Nouveau message de ${chat.name}`, "info")
  }
}

function updateUserStatus(userId, isOnline) {
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

// ===== GESTION COMPLÈTE DES GROUPES AVEC BOUTONS D'ACTION =====

function initializeSimpleGroups() {
  console.log("🚀 Initialisation simple des groupes...")

  setTimeout(() => {
    const filterTabs = document.querySelectorAll(".filter-tab")

    filterTabs.forEach((tab, index) => {
      const text = tab.textContent.trim().toLowerCase()

      if (text.includes("groupe") || text.includes("group") || index === 3) {
        console.log("📱 Onglet Groupes trouvé:", text)

        const newTab = tab.cloneNode(true)
        tab.parentNode.replaceChild(newTab, tab)

        newTab.addEventListener("click", showSimpleGroups)
      }
    })
  }, 1000)
}

async function showSimpleGroups() {
  console.log("📱 Affichage des groupes avec boutons d'action...")

  const chatList = document.getElementById("chatList")
  if (!chatList) return

  currentView = "groups"

  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      showToast("Vous devez être connecté", "error")
      return
    }

    const { getUserGroups } = await import("./utils/groups.js")
    const userGroups = await getUserGroups(currentUser.id)

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
        
        <div class="space-y-3">
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
            <div class="bg-[#202c33] rounded-lg p-4 hover:bg-[#2a3942] transition-colors">
              <!-- En-tête du groupe -->
              <div class="flex items-center space-x-3 mb-3">
                <div class="relative cursor-pointer" onclick="openGroupChat('${group.id}')">
                  <img src="${group.avatar || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop"}" 
                       alt="${group.name}" 
                       class="w-12 h-12 rounded-full object-cover">
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                    <i class="fas fa-users text-xs text-white"></i>
                  </div>
                </div>
                
                <div class="flex-1 min-w-0 cursor-pointer" onclick="openGroupChat('${group.id}')">
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
              
              <!-- Boutons d'action -->
              <div class="flex flex-wrap gap-2 pt-3 border-t border-gray-600">
                <button onclick="openGroupChat('${group.id}')" 
                        class="flex-1 min-w-0 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors">
                   Ouvrir
                </button>
                
                <button onclick="showGroupInfoQuick('${group.id}')" 
                        class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors">
                   Infos
                </button>
                
                ${
                  group.admins && group.admins.includes(currentUser.id)
                    ? `
                  <button onclick="showAddMemberQuick('${group.id}')" 
                          class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors">
                     Membre
                  </button>
                  
                  <button onclick="showManageMembersQuick('${group.id}')" 
                          class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition-colors">
                     Gérer
                  </button>
                `
                    : ""
                }
                
                <button onclick="leaveGroupQuick('${group.id}')" 
                        class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors">
                   Quitter
                </button>
              </div>
            </div>
          `,
                  )
                  .join("")
          }
        </div>
      </div>
    `

    const createGroupBtn = document.getElementById("createGroupBtn")
    if (createGroupBtn) {
      createGroupBtn.addEventListener("click", async () => {
        try {
          const { createGroupModal } = await import("./utils/groups.js")
          createGroupModal((newGroup) => {
            if (newGroup) {
              showToast(`Groupe "${newGroup.name}" créé avec succès`, "success")
              showSimpleGroups() // Recharger la liste
            }
          })
        } catch (error) {
          console.error("Erreur chargement module groupes:", error)
          showToast("Erreur lors du chargement du module groupes", "error")
        }
      })
    }

    console.log(`✅ ${userGroups.length} groupe(s) affiché(s) avec boutons d'action`)
  } catch (error) {
    console.error(" Erreur affichage groupes:", error)
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

// Fonctions globales pour les boutons d'action des groupes
window.openGroupChat = async (groupId) => {
  try {
    console.log("💬 Ouverture groupe depuis bouton:", groupId)

    const { getUserGroups } = await import("./utils/groups.js")
    const currentUser = getCurrentUser()
    const userGroups = await getUserGroups(currentUser.id)
    const group = userGroups.find((g) => g.id === groupId)

    if (group) {
      await openGroupChatDirect(group)
    } else {
      showToast("Groupe non trouvé", "error")
    }
  } catch (error) {
    console.error("Erreur ouverture groupe:", error)
    showToast("Erreur lors de l'ouverture du groupe", "error")
  }
}

window.showGroupInfoQuick = async (groupId) => {
  try {
    console.log("📋 Infos groupe depuis bouton:", groupId)

    const { getUserGroups, showGroupInfo } = await import("./utils/groups.js")
    const currentUser = getCurrentUser()
    const userGroups = await getUserGroups(currentUser.id)
    const group = userGroups.find((g) => g.id === groupId)

    if (group) {
      showGroupInfo(group)
    } else {
      showToast("Groupe non trouvé", "error")
    }
  } catch (error) {
    console.error("Erreur infos groupe:", error)
    showToast("Erreur lors de l'affichage des infos", "error")
  }
}

window.showAddMemberQuick = async (groupId) => {
  try {
    console.log("➕ Ajout membre depuis bouton:", groupId)

    const { getUserGroups, showAddMemberModal } = await import("./utils/groups.js")
    const currentUser = getCurrentUser()
    const userGroups = await getUserGroups(currentUser.id)
    const group = userGroups.find((g) => g.id === groupId)

    if (group) {
      showAddMemberModal(group)
    } else {
      showToast("Groupe non trouvé", "error")
    }
  } catch (error) {
    console.error("Erreur ajout membre:", error)
    showToast("Erreur lors de l'ajout de membre", "error")
  }
}

window.showManageMembersQuick = async (groupId) => {
  try {
    console.log("👥 Gestion membres depuis bouton:", groupId)

    const { getUserGroups } = await import("./utils/groups.js")
    const currentUser = getCurrentUser()
    const userGroups = await getUserGroups(currentUser.id)
    const group = userGroups.find((g) => g.id === groupId)

    if (group) {
      showMembersManagementModal(group)
    } else {
      showToast("Groupe non trouvé", "error")
    }
  } catch (error) {
    console.error("Erreur gestion membres:", error)
    showToast("Erreur lors de la gestion des membres", "error")
  }
}

window.leaveGroupQuick = async (groupId) => {
  try {
    console.log("🚪 Quitter groupe depuis bouton:", groupId)

    const { getUserGroups, leaveGroup } = await import("./utils/groups.js")
    const currentUser = getCurrentUser()
    const userGroups = await getUserGroups(currentUser.id)
    const group = userGroups.find((g) => g.id === groupId)

    if (group) {
      if (confirm(`Êtes-vous sûr de vouloir quitter le groupe "${group.name}" ?`)) {
        const success = await leaveGroup(group.id, currentUser.id)
        if (success) {
          showToast(`Vous avez quitté le groupe "${group.name}"`, "success")
          showSimpleGroups() // Recharger la liste
        }
      }
    } else {
      showToast("Groupe non trouvé", "error")
    }
  } catch (error) {
    console.error("Erreur quitter groupe:", error)
    showToast("Erreur lors de la sortie du groupe", "error")
  }
}

// Modal de gestion des membres
function showMembersManagementModal(group) {
  const modal = document.createElement("div")
  modal.className = "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"

  modal.innerHTML = `
    <div class="bg-[#222e35] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-white">Gérer les membres</h2>
        <button id="closeModal" class="text-gray-400 hover:text-white">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <div class="mb-4">
        <h3 class="text-lg font-medium text-white mb-2">${group.name}</h3>
        <p class="text-gray-400 text-sm">${group.members ? group.members.length : 0} membres</p>
      </div>
      
      <div id="membersList" class="space-y-3 max-h-96 overflow-y-auto">
        <!-- Les membres seront chargés ici -->
      </div>
      
      <div class="mt-6 flex justify-end">
        <button id="closeBtn" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
          Fermer
        </button>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // Charger les membres
  loadMembersForManagement(group)

  // Event listeners
  const closeModal = modal.querySelector("#closeModal")
  const closeBtn = modal.querySelector("#closeBtn")

  const closeModalFn = () => document.body.removeChild(modal)

  closeModal.addEventListener("click", closeModalFn)
  closeBtn.addEventListener("click", closeModalFn)
}

async function loadMembersForManagement(group) {
  try {
    const currentUser = getCurrentUser()
    const { getGroupMembers } = await import("./utils/groups.js")
    const members = await getGroupMembers(group.id)

    const membersList = document.getElementById("membersList")
    if (!membersList) return

    membersList.innerHTML = members
      .map((member) => {
        const isAdmin = group.admins && group.admins.includes(member.id)
        const isCreator = member.id === group.createdBy
        const isCurrentUser = member.id === currentUser.id

        return `
        <div class="bg-[#2a3942] rounded-lg p-3">
          <div class="flex items-center space-x-3 mb-2">
            <img src="${member.avatar}" alt="${member.name}" class="w-10 h-10 rounded-full object-cover">
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <div class="text-white font-medium">${isCurrentUser ? "Vous" : member.name}</div>
                ${isCreator ? '<span class="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Créateur</span>' : ""}
                ${isAdmin && !isCreator ? '<span class="text-xs bg-green-600 text-white px-2 py-1 rounded">Admin</span>' : ""}
              </div>
              <div class="text-gray-400 text-sm">${member.phone}</div>
            </div>
          </div>
          
          ${
            !isCurrentUser && !isCreator
              ? `
            <div class="flex gap-2">
              ${
                !isAdmin
                  ? `<button onclick="promoteToAdminQuick('${group.id}', '${member.id}')" 
                            class="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                       Promouvoir Admin
                    </button>`
                  : ""
              }
              
              <button onclick="removeMemberQuick('${group.id}', '${member.id}')" 
                      class="flex-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
                 Supprimer
              </button>
            </div>
          `
              : ""
          }
        </div>
      `
      })
      .join("")
  } catch (error) {
    console.error("Erreur chargement membres:", error)
    const membersList = document.getElementById("membersList")
    if (membersList) {
      membersList.innerHTML = '<div class="text-red-400 text-sm p-3">Erreur de chargement</div>'
    }
  }
}

// Fonctions globales pour la gestion des membres
window.promoteToAdminQuick = async (groupId, userId) => {
  try {
    const { promoteToAdmin } = await import("./utils/groups.js")
    const currentUser = getCurrentUser()
    const success = await promoteToAdmin(groupId, userId, currentUser.id)

    if (success) {
      // Recharger la modal
      const { getUserGroups } = await import("./utils/groups.js")
      const userGroups = await getUserGroups(currentUser.id)
      const group = userGroups.find((g) => g.id === groupId)
      if (group) {
        loadMembersForManagement(group)
      }
    }
  } catch (error) {
    console.error("Erreur promotion admin:", error)
    showToast("Erreur lors de la promotion", "error")
  }
}

window.removeMemberQuick = async (groupId, userId) => {
  try {
    const { removeMemberFromGroup } = await import("./utils/groups.js")
    const currentUser = getCurrentUser()

    if (confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) {
      const success = await removeMemberFromGroup(groupId, userId, currentUser.id)

      if (success) {
        // Recharger la modal
        const { getUserGroups } = await import("./utils/groups.js")
        const userGroups = await getUserGroups(currentUser.id)
        const group = userGroups.find((g) => g.id === groupId)
        if (group) {
          loadMembersForManagement(group)
        }
      }
    }
  } catch (error) {
    console.error("Erreur suppression membre:", error)
    showToast("Erreur lors de la suppression", "error")
  }
}

async function openGroupChatDirect(group) {
  try {
    console.log("💬 === OUVERTURE CHAT GROUPE DIRECT ===")
    console.log("Groupe:", group.name, "ID:", group.id)

    // IMPORTANT: Réinitialiser les variables de chat personnel
    currentChat = null
    window.currentChat = null

    currentGroup = group
    window.currentGroup = group

    if (isMobile()) {
      document.getElementById("sidebar").style.display = "none"
      document.getElementById("chatArea").style.display = "flex"
    } else {
      document.getElementById("chatArea").style.display = "flex"
    }

    showChatHeader()
    await renderGroupMessages(group)
    showMessageInput()

    showToast(`Groupe "${group.name}" ouvert`, "success")
  } catch (error) {
    console.error("❌ Erreur ouverture groupe:", error)
    showToast("Erreur lors de l'ouverture du groupe", "error")
  }
}

async function openGroupChat(group) {
  return openGroupChatDirect(group)
}

async function displayGroupMembersInHeader(group, statusElement) {
  try {
    const currentUser = getCurrentUser()

    const { getGroupMembers } = await import("./utils/groups.js")
    const members = await getGroupMembers(group.id)

    if (members.length === 0) {
      statusElement.textContent = "Aucun membre"
      return
    }

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
    console.log(" === ENVOI MESSAGE GROUPE ===")
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

// Fonction globale pour ouvrir les infos du groupe
window.openGroupInfos = async () => {
  console.log("🔘 Ouverture infos groupe")
  try {
    if (!currentGroup) {
      showToast("Aucun groupe sélectionné", "error")
      return
    }

    const { showGroupInfo } = await import("./utils/groups.js")
    showGroupInfo(currentGroup)
  } catch (error) {
    console.error("❌ Erreur ouverture infos:", error)
    showToast("Erreur lors de l'ouverture des infos", "error")
  }
}

// Exposer la fonction showSimpleGroups globalement
window.showSimpleGroups = showSimpleGroups
