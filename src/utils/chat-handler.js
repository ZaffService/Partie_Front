import { updateChat } from "./api.js"

const API_URL = "https://mon-serveur-cub8.onrender.com"

export async function handleSendMessage(senderId, receiverId, message) {
  try {
    console.log("📤 Envoi message:", { senderId, receiverId, message })

    // 1. Récupérer les informations des utilisateurs depuis la table users
    const usersResponse = await fetch(`${API_URL}/users`)
    const users = await usersResponse.json()

    const sender = users.find((u) => u.id === senderId)
    const receiver = users.find((u) => u.id === receiverId)

    if (!sender || !receiver) {
      console.error("Utilisateur non trouvé:", { sender, receiver })
      throw new Error("Utilisateur non trouvé")
    }

    // 2. Ajouter le message à l'expéditeur (senderId)
    await addMessageToChat(senderId, message)

    // 3. Créer une copie du message pour le destinataire
    const receiverMessage = {
      ...message,
      sent: false, // Pour le destinataire, c'est un message reçu
    }

    // 4. Ajouter le message au destinataire (receiverId)
    await addMessageToChat(receiverId, receiverMessage)

    // 5. Mettre à jour les informations de dernière activité
    const chatUpdate = {
      lastMessage: message.type === "text" ? message.text : getMessagePreview(message),
      time: message.time,
      lastMessageTime: message.timestamp,
    }

    // Mettre à jour le chat de l'expéditeur
    await updateChat(senderId, chatUpdate)

    // Mettre à jour le chat du destinataire avec notification
    await updateChat(receiverId, {
      ...chatUpdate,
      unread: 1, // Incrémenter les non lus pour le destinataire
    })

    console.log("✅ Message envoyé avec succès")
    return true
  } catch (error) {
    console.error("❌ Erreur envoi message:", error)
    throw error
  }
}

async function addMessageToChat(chatId, message) {
  try {
    // Vérifier si le chat existe
    const chatResponse = await fetch(`${API_URL}/chats/${chatId}`)

    if (!chatResponse.ok) {
      console.error(`Chat ${chatId} non trouvé`)
      throw new Error(`Chat ${chatId} non trouvé`)
    }

    const chat = await chatResponse.json()
    chat.messages = chat.messages || []

    // Vérifier si le message existe déjà pour éviter les doublons
    const existingMessage = chat.messages.find((m) => m.id === message.id)
    if (existingMessage) {
      console.log(`Message ${message.id} existe déjà dans le chat ${chatId}`)
      return
    }

    chat.messages.push(message)

    // Mettre à jour le chat
    const updateResponse = await fetch(`${API_URL}/chats/${chatId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chat),
    })

    if (!updateResponse.ok) {
      throw new Error("Erreur mise à jour chat")
    }

    console.log(`✅ Message ajouté au chat ${chatId}`)
  } catch (error) {
    console.error(`❌ Erreur ajout message au chat ${chatId}:`, error)
    throw error
  }
}

function getMessagePreview(message) {
  switch (message.type) {
    case "image":
      return "📷 Photo"
    case "video":
      return "🎥 Vidéo"
    case "audio":
      return "🎵 Audio"
    case "voice":
      return "🎤 Message vocal"
    case "document":
      return `📎 ${message.fileName}`
    default:
      return message.text
  }
}
