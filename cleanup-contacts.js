// Script temporaire pour nettoyer les contacts undefined
const API_URL = "https://mon-serveur-cub8.onrender.com"

async function cleanupUndefinedContacts() {
  try {
    // 1. Récupérer tous les utilisateurs
    const usersResponse = await fetch(`${API_URL}/users`)
    const users = await usersResponse.json()
    
    console.log(' Total utilisateurs:', users.length)
    
    // 2. Trouver les utilisateurs avec des données undefined/null
    const problematicUsers = users.filter(user => 
      !user.name || 
      user.name === 'undefined' || 
      user.name === 'null' ||
      !user.phone ||
      user.phone === 'undefined'
    )
    
    console.log('❌ Utilisateurs problématiques:', problematicUsers)
    
    // 3. Supprimer ces utilisateurs
    for (const user of problematicUsers) {
      console.log(`🗑️ Suppression de l'utilisateur:`, user)
      
      await fetch(`${API_URL}/users/${user.id}`, {
        method: 'DELETE'
      })
    }
    
    // 4. Nettoyer les chats associés
    const chatsResponse = await fetch(`${API_URL}/chats`)
    const chats = await chatsResponse.json()
    
    const problematicChats = chats.filter(chat => 
      !chat.contactName || 
      chat.contactName === 'undefined' ||
      chat.contactName === 'null'
    )
    
    for (const chat of problematicChats) {
      console.log(`🗑️ Suppression du chat:`, chat)
      
      await fetch(`${API_URL}/chats/${chat.id}`, {
        method: 'DELETE'
      })
    }
    
    console.log('✅ Nettoyage terminé!')
    
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error)
  }
}

// Exécuter le nettoyage
cleanupUndefinedContacts()