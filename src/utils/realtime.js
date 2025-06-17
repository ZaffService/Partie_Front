const API_URL = "https://mon-serveur-cub8.onrender.com"
const lastMessageCounts = new Map()
const lastSeenMessages = new Map()
let syncInterval = null
let onNewMessageCallback = null
let onUserStatusCallback = null
let isOnline = true

export function initializeRealTimeSync(onNewMessage, onUserStatus) {
  console.log("🚀 Initialisation synchronisation temps réel AMÉLIORÉE...")

  onNewMessageCallback = onNewMessage
  onUserStatusCallback = onUserStatus

  // Arrêter l'ancien intervalle s'il existe
  if (syncInterval) {
    clearInterval(syncInterval)
  }

  // Synchronisation ULTRA RAPIDE pour une expérience temps réel
  syncInterval = setInterval(checkForUpdates, 1000) // Toutes les 1 seconde !

  // Marquer l'utilisateur comme en ligne
  markUserOnline()

  // Gérer la déconnexion
  window.addEventListener("beforeunload", markUserOffline)
  window.addEventListener("visibilitychange", handleVisibilityChange)

  console.log("✅ Synchronisation temps réel ULTRA-RAPIDE activée")
}

async function checkForUpdates() {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) return

    // Vérifier les nouveaux messages avec détection intelligente
    await checkForNewMessages(currentUser)

    // Vérifier les statuts utilisateurs
    await checkUserStatuses(currentUser)
  } catch (error) {
    console.error("❌ Erreur synchronisation temps réel:", error)
  }
}

async function checkForNewMessages(currentUser) {
  try {
    const response = await fetch(`${API_URL}/chats`)
    if (!response.ok) return

    const allChats = await response.json()

    // Vérifier TOUS les chats pour détecter les nouveaux messages
    for (const chat of allChats) {
      const messages = chat.messages || []
      const chatKey = chat.id
      const lastCount = lastMessageCounts.get(chatKey) || 0
      const lastSeenMessageId = lastSeenMessages.get(chatKey) || null

      if (messages.length > lastCount) {
        // Il y a de nouveaux messages
        const newMessages = messages.slice(lastCount)

        for (const message of newMessages) {
          // Éviter les doublons
          if (lastSeenMessageId && message.id === lastSeenMessageId) {
            continue
          }

          // Vérifier si le message nous concerne
          if (shouldNotifyUser(currentUser.id, chat, message)) {
            console.log("📨 NOUVEAU MESSAGE DÉTECTÉ:", {
              from: message.senderName || message.senderId,
              to: currentUser.name,
              type: message.type,
              chat: chat.name,
            })

            // Notification temps réel
            if (onNewMessageCallback) {
              onNewMessageCallback(message, chat)
            }

            // Notification système si l'onglet n'est pas actif
            if (document.hidden) {
              showSystemNotification(message, chat)
            }

            // Marquer comme vu
            lastSeenMessages.set(chatKey, message.id)
          }
        }

        lastMessageCounts.set(chatKey, messages.length)
      }
    }
  } catch (error) {
    console.error("❌ Erreur vérification messages:", error)
  }
}

async function checkUserStatuses(currentUser) {
  try {
    if (!onUserStatusCallback) return

    const usersResponse = await fetch(`${API_URL}/users`)
    if (!usersResponse.ok) return

    const users = await usersResponse.json()

    for (const user of users) {
      if (user.id !== currentUser.id) {
        // Déterminer si l'utilisateur est en ligne (dernière activité < 2 minutes)
        const lastSeen = new Date(user.lastSeen || 0)
        const now = new Date()
        const diffMinutes = (now - lastSeen) / (1000 * 60)
        const isUserOnline = diffMinutes < 2

        onUserStatusCallback(user.id, isUserOnline)
      }
    }
  } catch (error) {
    console.error("❌ Erreur vérification statuts:", error)
  }
}

function shouldNotifyUser(currentUserId, chat, message) {
  // Notifier si :
  // 1. C'est un chat qui appartient à l'utilisateur actuel ET le message vient d'un autre
  // 2. OU c'est un message dans un chat où l'utilisateur actuel est le contact
  // 3. ET ce n'est pas un message que l'utilisateur a envoyé lui-même

  const isMyChat = chat.ownerId === currentUserId
  const isMessageForMe = chat.contactId === currentUserId
  const isNotFromMe = message.senderId !== currentUserId

  return (isMyChat || isMessageForMe) && isNotFromMe
}

async function markUserOnline() {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) return

    await fetch(`${API_URL}/users/${currentUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...currentUser,
        isOnline: true,
        lastSeen: new Date().toISOString(),
      }),
    })

    isOnline = true
    console.log("🟢 Utilisateur marqué en ligne")
  } catch (error) {
    console.error("❌ Erreur marquage en ligne:", error)
  }
}

async function markUserOffline() {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) return

    await fetch(`${API_URL}/users/${currentUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...currentUser,
        isOnline: false,
        lastSeen: new Date().toISOString(),
      }),
    })

    isOnline = false
    console.log("🔴 Utilisateur marqué hors ligne")
  } catch (error) {
    console.error("❌ Erreur marquage hors ligne:", error)
  }
}

function handleVisibilityChange() {
  if (document.hidden) {
    console.log("👁️ Onglet masqué")
  } else {
    console.log("👁️ Onglet visible")
    // Forcer une synchronisation quand l'utilisateur revient
    forceSyncNow()
  }
}

function showSystemNotification(message, chat) {
  try {
    if (!("Notification" in window)) return
    if (Notification.permission !== "granted") return

    const title = message.senderName || chat.name || "Nouveau message"
    let body = ""

    switch (message.type) {
      case "voice":
        body = "🎤 Message vocal"
        break
      case "image":
        body = "📷 Photo"
        break
      case "video":
        body = "🎥 Vidéo"
        break
      default:
        body = message.text || "Nouveau message"
        break
    }

    const notification = new Notification(title, {
      body: body,
      icon: chat.avatar || "/placeholder.svg?height=64&width=64",
      badge: "/placeholder.svg?height=32&width=32",
      tag: `whatsapp-${message.id}`,
      requireInteraction: false,
      silent: false,
    })

    // Auto-fermer après 5 secondes
    setTimeout(() => notification.close(), 5000)

    // Gérer le clic
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  } catch (error) {
    console.error("❌ Erreur notification système:", error)
  }
}

function getCurrentUser() {
  const userData = localStorage.getItem("currentUser")
  return userData ? JSON.parse(userData) : null
}

export function stopRealTimeSync() {
  console.log("🛑 Arrêt synchronisation temps réel")

  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }

  // Marquer comme hors ligne
  markUserOffline()

  // Nettoyer les event listeners
  window.removeEventListener("beforeunload", markUserOffline)
  window.removeEventListener("visibilitychange", handleVisibilityChange)
}

// Fonction pour forcer une synchronisation immédiate
export function forceSyncNow() {
  console.log("⚡ Synchronisation forcée IMMÉDIATE")
  checkForUpdates()
}

// Fonction pour marquer un message comme lu en temps réel
export async function markMessageAsRead(messageId, chatId) {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) return

    console.log("👁️ Marquage message comme lu:", messageId)

    // Marquer localement
    lastSeenMessages.set(chatId, messageId)

    // Envoyer au serveur (optionnel)
    // Ici vous pouvez implémenter l'API pour marquer comme lu
  } catch (error) {
    console.error("❌ Erreur marquage lu:", error)
  }
}

// Fonction pour envoyer un signal de frappe en temps réel
export async function sendTypingIndicator(chatId, isTyping) {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) return

    console.log(`⌨️ ${isTyping ? "Début" : "Fin"} de frappe dans chat:`, chatId)

    // Ici vous pouvez implémenter WebSocket ou SSE pour envoyer
    // l'indicateur de frappe en temps réel
  } catch (error) {
    console.error("❌ Erreur indicateur frappe:", error)
  }
}

// Fonction pour obtenir le statut de connexion
export function getConnectionStatus() {
  return {
    isOnline: isOnline,
    syncActive: syncInterval !== null,
    lastSync: new Date().toISOString(),
  }
}

// Fonction pour ajuster la fréquence de synchronisation
export function setSyncFrequency(milliseconds) {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = setInterval(checkForUpdates, milliseconds)
    console.log(`🔄 Fréquence de sync ajustée à ${milliseconds}ms`)
  }
}

// Auto-ajustement de la fréquence selon l'activité
let lastActivity = Date.now()

export function updateActivity() {
  lastActivity = Date.now()

  // Si l'utilisateur est actif, synchroniser plus souvent
  if (syncInterval) {
    setSyncFrequency(1000) // 1 seconde
  }
}

// Réduire la fréquence si inactif
setInterval(() => {
  const inactiveTime = Date.now() - lastActivity

  if (inactiveTime > 30000 && syncInterval) {
    // 30 secondes d'inactivité
    setSyncFrequency(5000) // Réduire à 5 secondes
    console.log("😴 Utilisateur inactif, réduction de la fréquence de sync")
  }
}, 10000)

// Détecter l'activité utilisateur
document.addEventListener("click", updateActivity)
document.addEventListener("keypress", updateActivity)
document.addEventListener("scroll", updateActivity)
