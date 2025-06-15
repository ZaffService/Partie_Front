const API_URL = "https://mon-serveur-cub8.onrender.com"

export async function getChats() {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      console.error("Aucun utilisateur connecté")
      return []
    }

    console.log(`Récupération chats pour ${currentUser.name} (ID: ${currentUser.id})`)

    const response = await fetch(`${API_URL}/chats`)
    if (!response.ok) throw new Error("Erreur réseau")

    const allChats = await response.json()
    console.log(`Total chats dans la base:`, allChats.length)

    // IMPORTANT: Filtrer SEULEMENT les chats de cet utilisateur
    const userChats = allChats.filter((chat) => chat.ownerId === currentUser.id)

    console.log(`Chats de ${currentUser.name}:`, userChats.length)
    return userChats
  } catch (error) {
    console.error(" Erreur getChats:", error)
    return []
  }
}

export async function getMessages(chatId) {
  try {
    console.log(`Récupération messages pour chat:`, chatId)
    const response = await fetch(`${API_URL}/chats/${chatId}`)
    if (!response.ok) throw new Error("Erreur réseau")
    const chat = await response.json()
    return chat.messages || []
  } catch (error) {
    console.error("Erreur getMessages:", error)
    return []
  }
}

export async function addMessage(chatId, message) {
  try {
    console.log(`Ajout message au chat ${chatId}:`, message)

    const response = await fetch(`${API_URL}/chats/${chatId}`)
    if (!response.ok) {
      console.error(` Chat ${chatId} non trouvé pour addMessage`)
      throw new Error("Chat non trouvé")
    }

    const chat = await response.json()
    chat.messages = chat.messages || []

    // Vérifier si le message existe déjà pour éviter les doublons
    const existingMessage = chat.messages.find((m) => m.id === message.id)
    if (existingMessage) {
      console.log(` Message ${message.id} existe déjà`)
      return chat
    }

    chat.messages.push(message)

    // Mettre à jour les métadonnées du chat
    chat.lastMessage = message.type === "text" ? message.text : getMessagePreview(message)
    chat.time = message.time
    chat.lastMessageTime = message.timestamp

    const updateResponse = await fetch(`${API_URL}/chats/${chatId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chat),
    })

    if (!updateResponse.ok) throw new Error("Erreur mise à jour")
    console.log(` Message ajouté au chat ${chatId}`)
    return await updateResponse.json()
  } catch (error) {
    console.error(" Erreur addMessage:", error)
    throw error
  }
}

export async function updateChat(chatId, updates) {
  try {
    console.log(` Mise à jour chat ${chatId}:`, updates)

    const response = await fetch(`${API_URL}/chats/${chatId}`)
    if (!response.ok) {
      console.warn(` Chat ${chatId} non trouvé pour mise à jour`)
      return null
    }

    const chat = await response.json()
    Object.assign(chat, updates)

    const updateResponse = await fetch(`${API_URL}/chats/${chatId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chat),
    })

    if (!updateResponse.ok) throw new Error("Erreur mise à jour")
    console.log(`Chat ${chatId} mis à jour`)
    return await updateResponse.json()
  } catch (error) {
    console.error(" Erreur updateChat:", error)
    return null
  }
}

export async function createUser(userData) {
  try {
    console.log(`Création utilisateur:`, userData)

    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...userData,
        bio: "Salut ! J'utilise WhatsApp.",
        walletBalance: 0,
        totalEarnings: 0,
        isOnline: true,
        lastSeen: new Date().toISOString(),
        contacts: [],
        groups: [],
      }),
    })

    if (!response.ok) throw new Error("Erreur création utilisateur")
    console.log(`Utilisateur créé`)
    return await response.json()
  } catch (error) {
    console.error(" Erreur createUser:", error)
    throw error
  }
}

export async function updateUserStatus(userId, isOnline) {
  try {
    console.log(`Mise à jour statut utilisateur ${userId}:`, isOnline ? "en ligne" : "hors ligne")

    // Mettre à jour dans la table users
    const userResponse = await fetch(`${API_URL}/users/${userId}`)
    if (userResponse.ok) {
      const user = await userResponse.json()
      user.isOnline = isOnline
      user.lastSeen = new Date().toISOString()

      await fetch(`${API_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      })
    }

    // Mettre à jour dans tous les chats où cet utilisateur apparaît
    const chatsResponse = await fetch(`${API_URL}/chats`)
    if (chatsResponse.ok) {
      const allChats = await chatsResponse.json()
      const chatsToUpdate = allChats.filter((chat) => chat.contactId === userId)

      for (const chat of chatsToUpdate) {
        chat.isOnline = isOnline
        chat.lastSeen = new Date().toISOString()
        chat.status = isOnline ? "en ligne" : "hors ligne"

        await fetch(`${API_URL}/chats/${chat.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chat),
        })
      }
    }

    console.log(` Statut utilisateur ${userId} mis à jour`)
  } catch (error) {
    console.error(" Erreur updateUserStatus:", error)
  }
}

export async function createNotification(notification) {
  try {
    const response = await fetch(`${API_URL}/notifications`, {
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
    console.error(" Erreur createNotification:", error)
    throw error
  }
}

export async function getNotifications(userId) {
  try {
    const response = await fetch(`${API_URL}/notifications?userId=${userId}`)
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(" Erreur getNotifications:", error)
    return []
  }
}

export async function updateMessageStatus(messageId, chatId, status) {
  try {
    console.log(` Mise à jour statut message ${messageId} vers ${status}`)

    const chatResponse = await fetch(`${API_URL}/chats/${chatId}`)
    const chat = await chatResponse.json()

    const messageIndex = chat.messages.findIndex((m) => m.id === messageId)
    if (messageIndex !== -1) {
      chat.messages[messageIndex].status = status

      await fetch(`${API_URL}/chats/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chat),
      })

      console.log(` Statut message ${messageId} mis à jour`)
    }
  } catch (error) {
    console.error(" Erreur updateMessageStatus:", error)
  }
}

export async function markMessagesAsRead(currentUserId, contactId) {
  try {
    console.log(`Marquer messages comme lus entre ${currentUserId} et ${contactId}`)

    // Récupérer tous les chats
    const chatsResponse = await fetch(`${API_URL}/chats`)
    const allChats = await chatsResponse.json()

    // Trouver les chats concernés
    const currentUserChat = allChats.find((chat) => chat.ownerId === currentUserId && chat.contactId === contactId)
    const contactChat = allChats.find((chat) => chat.ownerId === contactId && chat.contactId === currentUserId)

    // Marquer les messages comme lus dans le chat de l'utilisateur actuel
    if (currentUserChat) {
      currentUserChat.unread = 0

      await fetch(`${API_URL}/chats/${currentUserChat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentUserChat),
      })
    }

    // Marquer les messages comme "read" dans le chat du contact
    if (contactChat && contactChat.messages) {
      contactChat.messages = contactChat.messages.map((msg) => {
        if (msg.senderId === currentUserId && msg.status !== "read") {
          return { ...msg, status: "read" }
        }
        return msg
      })

      await fetch(`${API_URL}/chats/${contactChat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactChat),
      })
    }

    console.log(`Messages marqués comme lus`)
  } catch (error) {
    console.error(" Erreur markMessagesAsRead:", error)
  }
}

// Fonction utilitaire pour obtenir l'utilisateur actuel
function getCurrentUser() {
  const userData = localStorage.getItem("currentUser")
  return userData ? JSON.parse(userData) : null
}

// Fonction utilitaire pour obtenir un aperçu du message
function getMessagePreview(message) {
  switch (message.type) {
    case "image":
      return " Photo"
    case "video":
      return " Vidéo"
    case "audio":
      return " Audio"
    case "voice":
      return " Message vocal"
    case "document":
      return ` ${message.fileName}`
    default:
      return message.text
  }
}

// Fonction pour créer tous les chats croisés (initialisation)
export async function initializeAllChats() {
  try {
    console.log(" Initialisation de tous les chats croisés...")

    // Récupérer tous les utilisateurs
    const usersResponse = await fetch(`${API_URL}/users`)
    const users = await usersResponse.json()

    console.log(` ${users.length} utilisateurs trouvés`)

    // Récupérer les chats existants
    const chatsResponse = await fetch(`${API_URL}/chats`)
    const existingChats = await chatsResponse.json()

    let chatsCreated = 0

    // Créer tous les chats croisés
    for (const user1 of users) {
      for (const user2 of users) {
        if (user1.id !== user2.id) {
          // Vérifier si le chat existe déjà
          const existingChat = existingChats.find((chat) => chat.ownerId === user1.id && chat.contactId === user2.id)

          if (!existingChat) {
            // Créer le chat
            const newChat = {
              id: `${user1.id}_${user2.id}_${Date.now() + Math.random()}`,
              ownerId: user1.id,
              contactId: user2.id,
              name: user2.name,
              phone: user2.phone,
              avatar: user2.avatar,
              status: "Hors ligne",
              isOnline: user2.isOnline || false,
              lastSeen: user2.lastSeen || new Date().toISOString(),
              unread: 0,
              time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
              lastMessage: "",
              lastMessageTime: new Date().toISOString(),
              messages: [],
            }

            await fetch(`${API_URL}/chats`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newChat),
            })

            chatsCreated++
            console.log(` Chat créé: ${user1.name} -> ${user2.name}`)
          }
        }
      }
    }

    console.log(` Initialisation terminée: ${chatsCreated} chats créés`)
    return { success: true, chatsCreated }
  } catch (error) {
    console.error("Erreur initialisation chats:", error)
    throw error
  }
}
