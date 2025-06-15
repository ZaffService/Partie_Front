const API_URL = "https://mon-serveur-cub8.onrender.com"

export async function cleanDuplicateChats() {
  try {
    console.log(" Nettoyage des chats dupliqués...")

    // Récupérer tous les chats
    const chatsResponse = await fetch(`${API_URL}/chats`)
    const chats = await chatsResponse.json()

    // Récupérer tous les utilisateurs
    const usersResponse = await fetch(`${API_URL}/users`)
    const users = await usersResponse.json()

    // Grouper les chats par nom pour détecter les doublons
    const chatsByName = {}
    const chatsToDelete = []
    const chatsToUpdate = []

    chats.forEach((chat) => {
      const name = chat.name
      if (!chatsByName[name]) {
        chatsByName[name] = []
      }
      chatsByName[name].push(chat)
    })

    // Traiter chaque groupe de chats
    for (const [name, duplicateChats] of Object.entries(chatsByName)) {
      if (duplicateChats.length > 1) {
        console.log(` Doublons trouvés pour ${name}:`, duplicateChats.length)

        // Trouver l'utilisateur correspondant
        const user = users.find((u) => u.name === name)
        if (!user) continue

        // Garder le chat avec l'ID correct (même ID que l'utilisateur)
        const correctChat = duplicateChats.find((chat) => chat.id === user.id)
        const incorrectChats = duplicateChats.filter((chat) => chat.id !== user.id)

        if (correctChat) {
          // Fusionner tous les messages dans le chat correct
          const allMessages = []
          duplicateChats.forEach((chat) => {
            if (chat.messages && chat.messages.length > 0) {
              allMessages.push(...chat.messages)
            }
          })

          // Supprimer les doublons de messages
          const uniqueMessages = allMessages.filter(
            (message, index, self) => index === self.findIndex((m) => m.id === message.id),
          )

          // Trier par timestamp
          uniqueMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

          // Mettre à jour le chat correct avec toutes les bonnes informations
          const updatedChat = {
            ...correctChat,
            name: user.name,
            phone: user.phone,
            avatar: user.avatar,
            status: user.status,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
            messages: uniqueMessages,
            lastMessage:
              uniqueMessages.length > 0
                ? uniqueMessages[uniqueMessages.length - 1].type === "text"
                  ? uniqueMessages[uniqueMessages.length - 1].text
                  : getMessagePreview(uniqueMessages[uniqueMessages.length - 1])
                : "",
            lastMessageTime:
              uniqueMessages.length > 0
                ? uniqueMessages[uniqueMessages.length - 1].timestamp
                : new Date().toISOString(),
          }

          chatsToUpdate.push(updatedChat)

          // Marquer les chats incorrects pour suppression
          incorrectChats.forEach((chat) => {
            chatsToDelete.push(chat.id)
          })
        } else {
          // Si aucun chat n'a l'ID correct, garder le premier et supprimer les autres
          const chatToKeep = duplicateChats[0]
          const updatedChat = {
            ...chatToKeep,
            id: user.id, // Corriger l'ID
            name: user.name,
            phone: user.phone,
            avatar: user.avatar,
            status: user.status,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
          }

          chatsToUpdate.push(updatedChat)

          // Supprimer l'ancien chat
          chatsToDelete.push(chatToKeep.id)

          // Marquer les autres pour suppression
          duplicateChats.slice(1).forEach((chat) => {
            chatsToDelete.push(chat.id)
          })
        }
      }
    }

    // Supprimer les chats dupliqués
    for (const chatId of chatsToDelete) {
      try {
        await fetch(`${API_URL}/chats/${chatId}`, {
          method: "DELETE",
        })
        console.log(` Chat ${chatId} supprimé`)
      } catch (error) {
        console.error(`Erreur suppression chat ${chatId}:`, error)
      }
    }

    // Mettre à jour les chats corrigés
    for (const chat of chatsToUpdate) {
      try {
        await fetch(`${API_URL}/chats/${chat.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chat),
        })
        console.log(` Chat ${chat.name} mis à jour`)
      } catch (error) {
        console.error(`Erreur mise à jour chat ${chat.name}:`, error)
      }
    }

    console.log(
      `Nettoyage terminé: ${chatsToDelete.length} chats supprimés, ${chatsToUpdate.length} chats mis à jour`,
    )

    return {
      deleted: chatsToDelete.length,
      updated: chatsToUpdate.length,
    }
  } catch (error) {
    console.error(" Erreur nettoyage chats:", error)
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
