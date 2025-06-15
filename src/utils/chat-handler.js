const API_URL = "https://mon-serveur-cub8.onrender.com"

export async function handleSendMessage(senderId, receiverId, message) {
  try {
    console.log(" Envoi message:", { senderId, receiverId, message })

    // 1. Récupérer les informations des utilisateurs
    const usersResponse = await fetch(`${API_URL}/users`)
    const users = await usersResponse.json()

    const sender = users.find((u) => u.id === senderId)
    const receiver = users.find((u) => u.id === receiverId)

    if (!sender || !receiver) {
      console.error("Utilisateur non trouvé:", { sender, receiver })
      throw new Error("Utilisateur non trouvé")
    }

    // 2. Trouver les chats personnels des deux utilisateurs
    const chatsResponse = await fetch(`${API_URL}/chats`)
    const allChats = await chatsResponse.json()

    // Chat de l'expéditeur avec ce contact
    const senderChat = allChats.find((chat) => chat.ownerId === senderId && chat.contactId === receiverId)

    // Chat du destinataire avec ce contact
    const receiverChat = allChats.find((chat) => chat.ownerId === receiverId && chat.contactId === senderId)

    // 3. Ajouter le message au chat de l'expéditeur
    if (senderChat) {
      await addMessageToChat(senderChat.id, message)
    }

    // 4. Créer/Ajouter le message au chat du destinataire
    if (receiverChat) {
      const receiverMessage = {
        ...message,
        sent: false, // Pour le destinataire, c'est un message reçu
      }
      await addMessageToChat(receiverChat.id, receiverMessage)
    } else {
      // Créer un chat pour le destinataire s'il n'existe pas
      await createChatForReceiver(receiverId, senderId, sender, message)
    }

    console.log(" Message envoyé avec succès")
    return true
  } catch (error) {
    console.error("Erreur envoi message:", error)
    throw error
  }
}

async function createChatForReceiver(receiverId, senderId, sender, message) {
  try {
    const receiverMessage = {
      ...message,
      sent: false,
    }

    const newChat = {
      id: `${receiverId}_${senderId}_${Date.now()}`,
      ownerId: receiverId,
      contactId: senderId,
      name: sender.name,
      phone: sender.phone,
      avatar: sender.avatar,
      status: sender.status,
      isOnline: sender.isOnline,
      lastSeen: sender.lastSeen,
      unread: 1,
      time: message.time,
      lastMessage: message.type === "text" ? message.text : getMessagePreview(message),
      lastMessageTime: message.timestamp,
      messages: [receiverMessage],
    }

    await fetch(`${API_URL}/chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newChat),
    })

    console.log(`Chat créé pour le destinataire ${receiverId}`)
  } catch (error) {
    console.error(" Erreur création chat destinataire:", error)
  }
}

async function addMessageToChat(chatId, message) {
  try {
    const chatResponse = await fetch(`${API_URL}/chats/${chatId}`)

    if (!chatResponse.ok) {
      console.error(`Chat ${chatId} non trouvé`)
      throw new Error(`Chat ${chatId} non trouvé`)
    }

    const chat = await chatResponse.json()
    chat.messages = chat.messages || []

    // Vérifier si le message existe déjà
    const existingMessage = chat.messages.find((m) => m.id === message.id)
    if (existingMessage) {
      console.log(`Message ${message.id} existe déjà dans le chat ${chatId}`)
      return
    }

    chat.messages.push(message)

    // Mettre à jour les informations du chat
    chat.lastMessage = message.type === "text" ? message.text : getMessagePreview(message)
    chat.time = message.time
    chat.lastMessageTime = message.timestamp

    // Incrémenter les non lus si c'est un message reçu
    if (!message.sent) {
      chat.unread = (chat.unread || 0) + 1
    }

    const updateResponse = await fetch(`${API_URL}/chats/${chatId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chat),
    })

    if (!updateResponse.ok) {
      throw new Error("Erreur mise à jour chat")
    }

    console.log(` Message ajouté au chat ${chatId}`)
  } catch (error) {
    console.error(`Erreur ajout message au chat ${chatId}:`, error)
    throw error
  }
}

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
