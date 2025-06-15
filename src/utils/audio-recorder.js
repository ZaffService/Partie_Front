let mediaRecorder = null
let audioChunks = []
let isRecording = false
let recordingStartTime = null

export function setupAudioRecorder() {
  console.log("Audio recorder configuré")
} 

export async function startVoiceRecording() {
  try {
    console.log("Démarrage enregistrement vocal...")
    
    // Vérifier si on a un chat actuel
    if (!window.currentChat) {
      showToast("Sélectionnez une conversation d'abord", "error")
      return false
    }
    
    // Demander permission microphone
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      } 
    })
    
    // Créer MediaRecorder avec un format supporté
    let mimeType = 'audio/webm;codecs=opus'
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'audio/webm'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '' // Laisser le navigateur choisir
        }
      }
    }
    
    mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
    audioChunks = []
    recordingStartTime = Date.now()
    
    // Événements MediaRecorder
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
        console.log("Données audio reçues:", event.data.size, "bytes")
      }
    }
    
    mediaRecorder.onstop = async () => {
      console.log("Arrêt enregistrement, traitement...")
      
      // Arrêter le stream
      stream.getTracks().forEach(track => track.stop())
      
      // Vérifier qu'on a des données
      if (audioChunks.length === 0) {
        console.error("Aucune donnée audio enregistrée")
        showToast("Erreur: aucune donnée audio", "error")
        resetVoiceButton()
        return
      }
      
      // Créer le blob audio
      const audioBlob = new Blob(audioChunks, { 
        type: mimeType || 'audio/webm' 
      })
      
      console.log("Blob audio créé:", audioBlob.size, "bytes, type:", audioBlob.type)
      
      if (audioBlob.size === 0) {
        console.error("Blob audio vide")
        showToast("Erreur: enregistrement vide", "error")
        resetVoiceButton()
        return
      }
      
      const duration = Math.round((Date.now() - recordingStartTime) / 1000)
      
      // Envoyer le message vocal
      await handleVoiceMessage(audioBlob, duration)
      
      // Reset
      isRecording = false
      resetVoiceButton()
    }
    
    mediaRecorder.onerror = (event) => {
      console.error("Erreur MediaRecorder:", event.error)
      showToast("Erreur d'enregistrement", "error")
      resetVoiceButton()
    }
    
    // Démarrer l'enregistrement
    mediaRecorder.start(100) // Collecter les données toutes les 100ms
    isRecording = true
    
    // Mettre à jour l'interface
    updateVoiceButton(true)
    showToast("🎤 Enregistrement en cours...", "info")
    
    return true
    
  } catch (error) {
    console.error("Erreur accès microphone:", error)
    
    if (error.name === 'NotAllowedError') {
      showToast("Veuillez autoriser l'accès au microphone", "error")
    } else if (error.name === 'NotFoundError') {
      showToast("Aucun microphone détecté", "error")
    } else {
      showToast("Erreur d'enregistrement vocal", "error")
    }
    
    resetVoiceButton()
    return false
  }
}

export function stopVoiceRecording() {
  if (mediaRecorder && isRecording) {
    console.log("Arrêt de l'enregistrement...")
    mediaRecorder.stop()
    showToast("📤 Envoi du message vocal...", "info")
  }
}

function updateVoiceButton(recording) {
  const voiceBtn = document.getElementById("voiceBtn")
  if (voiceBtn) {
    if (recording) {
      voiceBtn.innerHTML = '<i class="fas fa-stop text-xl text-red-500"></i>'
      voiceBtn.classList.add('recording', 'animate-pulse')
    } else {
      voiceBtn.innerHTML = '<i class="fas fa-microphone text-xl"></i>'
      voiceBtn.classList.remove('recording', 'animate-pulse')
    }
  }
}

function resetVoiceButton() {
  updateVoiceButton(false)
  isRecording = false
}

async function handleVoiceMessage(audioBlob, duration) {
  try {
    const currentUser = getCurrentUser()
    const currentChat = window.currentChat
    
    if (!currentUser || !currentChat) {
      showToast("Erreur: utilisateur ou chat non défini", "error")
      return
    }
    
    console.log("Traitement message vocal...")
    console.log("Blob size:", audioBlob.size, "Duration:", duration)
    
    // Convertir en base64
    const base64Audio = await blobToBase64(audioBlob)
    
    if (!base64Audio || base64Audio === 'data:') {
      console.error("Erreur conversion base64")
      showToast("Erreur de traitement audio", "error")
      return
    }
    
    console.log("Base64 créé, taille:", base64Audio.length)
    
    const message = {
      id: Date.now(),
      senderId: currentUser.id,
      receiverId: currentChat.id,
      text: "Message vocal",
      sent: true,
      time: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: new Date().toISOString(),
      type: "voice",
      fileData: base64Audio,
      duration: duration,
      status: "sent",
    }
    
    // Envoyer le message
    if (window.sendVoiceMessage) {
      await window.sendVoiceMessage(message)
      showToast("✅ Message vocal envoyé", "success")
    } else {
      console.error("Fonction sendVoiceMessage non trouvée")
      showToast("Erreur: fonction d'envoi non disponible", "error")
    }
    
  } catch (error) {
    console.error("Erreur traitement message vocal:", error)
    showToast("Erreur lors de l'envoi du message vocal", "error")
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result
      console.log("Base64 conversion result:", result ? result.substring(0, 50) + "..." : "null")
      resolve(result)
    }
    reader.onerror = (error) => {
      console.error("Erreur lecture fichier:", error)
      reject(error)
    }
    reader.readAsDataURL(blob)
  })
}

function getCurrentUser() {
  const userData = localStorage.getItem('currentUser')
  return userData ? JSON.parse(userData) : null
}

function showToast(message, type) {
  console.log(`[${type.toUpperCase()}] ${message}`)
  
  // Créer une notification toast simple
  const toast = document.createElement('div')
  toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 transition-all duration-300 ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  }`
  toast.textContent = message
  
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, 3000)
}

export function isCurrentlyRecording() {
  return isRecording
}
