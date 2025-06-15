import { addMessage, updateChat } from './api.js';

export async function handleSendMessage(senderId, receiverId, message) {
  try {
    // 1. Ajouter le message à l'expéditeur
    await addMessage(senderId, message)
    
    // 2. Créer une copie du message pour le destinataire
    const receiverMessage = {
      ...message,
      sent: false, // Pour le destinataire, c'est un message reçu
      senderId: senderId,
      receiverId: receiverId
    }
    
    // 3. Ajouter le message au destinataire
    await addMessage(receiverId, receiverMessage)
     
    // 4. Mettre à jour le dernier message pour les deux utilisateurs
    const chatUpdate = {
      lastMessage: message.type === 'text' ? message.text : getMessagePreview(message),
      time: message.time,
      lastMessageTime: message.timestamp
    }
    
    await updateChat(senderId, chatUpdate)
    await updateChat(receiverId, chatUpdate)
    
    console.log("Message envoyé avec succès")
    return true
    
  } catch (error) {
    console.error("Erreur envoi message:", error)
    throw error
  }
}

function getMessagePreview(message) {
  switch (message.type) {
    case 'image':
      return '📷 Photo'
    case 'video':
      return '🎥 Vidéo'
    case 'audio':
      return '🎵 Audio'
    case 'voice':
      return '🎤 Message vocal'
    case 'document':
      return `📎 ${message.fileName}`
    default:
      return message.text
  }
}