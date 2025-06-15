const API_URL = 'http://localhost:5001'

export async function getChats() {
  try {
    const response = await fetch(`${API_URL}/chats`)
    if (!response.ok) throw new Error('Erreur réseau')
    return await response.json()
  } catch (error) {
    console.error('Erreur getChats:', error)
    throw error
  } 
}

export async function getMessages(userId) {
  try {
    const response = await fetch(`${API_URL}/chats/${userId}`)
    if (!response.ok) throw new Error('Erreur réseau')
    const chat = await response.json()
    return chat.messages || []
  } catch (error) {
    console.error('Erreur getMessages:', error)
    return []
  }
}

export async function addMessage(userId, message) {
  try {
    // Récupérer le chat actuel
    const response = await fetch(`${API_URL}/chats/${userId}`)
    if (!response.ok) {
      console.error(`Chat ${userId} non trouvé, création...`)
      // Si le chat n'existe pas, le créer
      return await createChatForUser(userId, message)
    }
    
    const chat = await response.json()
    chat.messages = chat.messages || []
    chat.messages.push(message)
    
    // Mettre à jour le chat
    const updateResponse = await fetch(`${API_URL}/chats/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chat)
    })
    
    if (!updateResponse.ok) throw new Error('Erreur mise à jour')
    return await updateResponse.json()
    
  } catch (error) {
    console.error('Erreur addMessage:', error)
    throw error
  }
}

export async function updateChat(userId, updates) {
  try {
    const response = await fetch(`${API_URL}/chats/${userId}`)
    if (!response.ok) {
      console.warn(`Chat ${userId} non trouvé pour mise à jour`)
      return null // Ne pas lancer d'erreur, juste ignorer
    }
    
    const chat = await response.json()
    Object.assign(chat, updates)
    
    const updateResponse = await fetch(`${API_URL}/chats/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chat)
    })
    
    if (!updateResponse.ok) throw new Error('Erreur mise à jour')
    return await updateResponse.json()
    
  } catch (error) {
    console.error('Erreur updateChat:', error)
    return null // Ne pas lancer d'erreur
  }
}

async function createChatForUser(userId, message) {
  try {
    const newChat = {
      id: userId,
      name: `User ${userId}`,
      avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
      messages: [message],
      lastMessage: message.text,
      time: message.time,
      lastMessageTime: message.timestamp,
      unread: 0,
      isOnline: false
    }
    
    const response = await fetch(`${API_URL}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newChat)
    })
    
    if (!response.ok) throw new Error('Erreur création chat')
    return await response.json()
    
  } catch (error) {
    console.error('Erreur createChatForUser:', error)
    throw error
  }
}

export async function createUser(userData) {
  try {
    const response = await fetch(`${API_URL}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...userData,
        messages: [],
        isOnline: true,
        lastSeen: new Date().toISOString()
      })
    })
    
    if (!response.ok) throw new Error('Erreur création utilisateur')
    return await response.json()
    
  } catch (error) {
    console.error('Erreur createUser:', error)
    throw error
  }
}

export async function updateUserStatus(userId, isOnline) {
  try {
    const response = await fetch(`${API_URL}/chats/${userId}`)
    if (!response.ok) return
    
    const chat = await response.json()
    chat.isOnline = isOnline
    chat.lastSeen = new Date().toISOString()
    
    await fetch(`${API_URL}/chats/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chat)
    })
    
  } catch (error) {
    console.error('Erreur updateUserStatus:', error)
  }
}

export async function createNotification(notification) {
  try {
    const response = await fetch(`${BASE_URL}/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notification),
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur createNotification:", error)
    throw error
  }
}

export async function getNotifications(userId) {
  try {
    const response = await fetch(`${BASE_URL}/notifications?userId=${userId}`)
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur getNotifications:", error)
    return []
  }
}

export async function updateMessageStatus(messageId, chatId, status) {
  try {
    const chatResponse = await fetch(`${BASE_URL}/chats/${chatId}`)
    const chat = await chatResponse.json()

    const messageIndex = chat.messages.findIndex((m) => m.id === messageId)
    if (messageIndex !== -1) {
      chat.messages[messageIndex].status = status

      await fetch(`${BASE_URL}/chats/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chat),
      })
    }
  } catch (error) {
    console.error("Erreur updateMessageStatus:", error)
  }
}

export async function markMessagesAsRead(currentUserId, otherUserId) {
  try {
    const [currentUserChat, otherUserChat] = await Promise.all([
      fetch(`${BASE_URL}/chats/${currentUserId}`).then((r) => r.json()),
      fetch(`${BASE_URL}/chats/${otherUserId}`).then((r) => r.json()),
    ])

    if (currentUserChat.messages) {
      currentUserChat.unread = 0

      otherUserChat.messages = otherUserChat.messages.map((msg) => {
        if (msg.senderId === currentUserId && msg.status !== "read") {
          return { ...msg, status: "read" }
        }
        return msg
      })
    }

    await Promise.all([
      fetch(`${BASE_URL}/chats/${currentUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentUserChat),
      }),
      fetch(`${BASE_URL}/chats/${otherUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(otherUserChat),
      }),
    ])
  } catch (error) {
    console.error("Erreur markMessagesAsRead:", error)
  }
}
