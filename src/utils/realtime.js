const API_URL = "https://mon-serveur-cub8.onrender.com"
const lastMessageCounts = new Map()
let syncInterval = null
let onNewMessageCallback = null
let onUserStatusCallback = null

export function initializeRealTimeSync(onNewMessage, onUserStatus) {
  console.log("Initialisation synchronisation temps réel...")

  onNewMessageCallback = onNewMessage
  onUserStatusCallback = onUserStatus

  // Arrêter l'ancien intervalle s'il existe
  if (syncInterval) {
    clearInterval(syncInterval)
  }

  // Synchronisation plus rapide pour une expérience temps réel
  syncInterval = setInterval(checkForUpdates, 2000) // Toutes les 2 secondes
  console.log(" Synchronisation temps réel activée")
}

async function checkForUpdates() {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) return

    // Récupérer tous les chats
    const response = await fetch(`${API_URL}/chats`)
    if (!response.ok) {
      console.error(" Erreur API:", response.status)
      return
    }

    const allChats = await response.json()
    console.log(` Vérification ${allChats.length} chats...`)

    // Vérifier les nouveaux messages dans TOUS les chats
    for (const chat of allChats) {
      const messages = chat.messages || []
      const lastCount = lastMessageCounts.get(chat.id) || 0

      if (messages.length > lastCount) {
        // Il y a de nouveaux messages
        const newMessages = messages.slice(lastCount)
        console.log(` ${newMessages.length} nouveaux messages dans chat ${chat.id}`)

        for (const message of newMessages) {
          // Vérifier si le message nous concerne
          if (shouldNotifyUser(currentUser.id, chat, message)) {
            console.log(` Notification pour message de ${message.senderId}`)
            if (onNewMessageCallback) {
              onNewMessageCallback(message, chat)
            }
          }
        }

        lastMessageCounts.set(chat.id, messages.length)
      }
    }

    // Vérifier les statuts utilisateurs
    if (onUserStatusCallback) {
      const usersResponse = await fetch(`${API_URL}/users`)
      if (usersResponse.ok) {
        const users = await usersResponse.json()

        for (const user of users) {
          if (user.id !== currentUser.id) {
            onUserStatusCallback(user.id, user.isOnline || false)
          }
        }
      }
    }
  } catch (error) {
    console.error("Erreur synchronisation temps réel:", error)
  }
}

function shouldNotifyUser(currentUserId, chat, message) {
  // Notifier si :
  // 1. C'est un chat qui appartient à l'utilisateur actuel ET le message vient d'un autre
  // 2. OU c'est un message dans un chat où l'utilisateur actuel est le contact

  return (
    (chat.ownerId === currentUserId && message.senderId !== currentUserId) ||
    (chat.contactId === currentUserId && message.senderId !== currentUserId)
  )
}

function getCurrentUser() {
  const userData = localStorage.getItem("currentUser")
  return userData ? JSON.parse(userData) : null
}

export function stopRealTimeSync() {
  console.log(" Arrêt synchronisation temps réel")
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
}

// Fonction pour forcer une synchronisation immédiate
export function forceSyncNow() {
  console.log("⚡ Synchronisation forcée")
  checkForUpdates()
}
