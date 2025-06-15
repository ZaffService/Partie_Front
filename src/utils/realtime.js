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
   
  // Démarrer la synchronisation toutes les 2 secondes
  syncInterval = setInterval(checkForUpdates, 2000)
  console.log("Synchronisation temps réel initialisée")
}

async function checkForUpdates() {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) return

    // Vérifier les nouveaux messages pour tous les chats
    const response = await fetch('http://localhost:5001/chats')
    const allChats = await response.json()
    
    for (const chat of allChats) {
      if (chat.id === currentUser.id) continue // Ignorer ses propres données
      
      const messages = chat.messages || []
      const lastCount = lastMessageCounts.get(chat.id) || 0
      
      if (messages.length > lastCount) {
        // Il y a de nouveaux messages
        const newMessages = messages.slice(lastCount)
        
        for (const message of newMessages) {
          // Vérifier si le message nous est destiné
          if (message.receiverId === currentUser.id && message.senderId === chat.id) {
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
  const userData = localStorage.getItem('currentUser')
  return userData ? JSON.parse(userData) : null
}

export function stopRealTimeSync() {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
}
