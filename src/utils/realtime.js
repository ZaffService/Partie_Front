const API_URL = "https://mon-serveur-cub8.onrender.com"
const lastMessageCounts = new Map()
let syncInterval = null
let onNewMessageCallback = null
let onUserStatusCallback = null

export function initializeRealTimeSync(onNewMessage, onUserStatus) {
  onNewMessageCallback = onNewMessage
  onUserStatusCallback = onUserStatus

  // Arrêter l'ancien intervalle s'il existe
  if (syncInterval) {
    clearInterval(syncInterval)
  }

  // Démarrer la synchronisation toutes les 3 secondes (plus lent pour éviter la surcharge)
  syncInterval = setInterval(checkForUpdates, 3000)
  console.log("Synchronisation temps réel initialisée avec", API_URL)
}

async function checkForUpdates() {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) return

    // Vérifier les nouveaux messages pour tous les chats
    const response = await fetch(`${API_URL}/chats`)
    if (!response.ok) {
      console.error("Erreur API:", response.status)
      return
    }

    const allChats = await response.json()

    for (const chat of allChats) {
      if (chat.id === currentUser.id) continue // Ignorer ses propres données

      const messages = chat.messages || []
      const lastCount = lastMessageCounts.get(chat.id) || 0

      if (messages.length > lastCount) {
        // Il y a de nouveaux messages
        const newMessages = messages.slice(lastCount)

        for (const message of newMessages) {
          // Vérifier si le message nous est destiné ET qu'il n'a pas été envoyé par nous
          if (message.receiverId === currentUser.id && message.senderId !== currentUser.id) {
            if (onNewMessageCallback) {
              onNewMessageCallback(message)
            }
          }
        }

        lastMessageCounts.set(chat.id, messages.length)
      }
    }

    // Vérifier les statuts utilisateurs
    if (onUserStatusCallback) {
      for (const chat of allChats) {
        if (chat.id !== currentUser.id) {
          onUserStatusCallback(chat.id, chat.isOnline || false)
        }
      }
    }
  } catch (error) {
    console.error("Erreur synchronisation temps réel:", error)
  }
}

function getCurrentUser() {
  const userData = localStorage.getItem("currentUser")
  return userData ? JSON.parse(userData) : null
}

export function stopRealTimeSync() {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
}
