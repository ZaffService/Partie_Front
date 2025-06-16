let mediaRecorder = null
let audioChunks = []
let isRecording = false
let recordingStartTime = null

// Fonction simple pour démarrer l'enregistrement
export async function startVoiceRecording() {
  try {
    console.log("🎤 Démarrage enregistrement vocal...")

    if (isRecording) {
      console.log("Enregistrement déjà en cours")
      return false
    }

    // Vérifier qu'on a un chat actuel
    if (!window.currentChat) {
      showSimpleToast("Sélectionnez une conversation d'abord", "error")
      return false
    }

    // Demander permission microphone
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })

    // Créer MediaRecorder
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []
    recordingStartTime = Date.now()
    isRecording = true

    // Événements
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      console.log("Arrêt enregistrement")

      // Arrêter le stream
      stream.getTracks().forEach((track) => track.stop())

      if (audioChunks.length === 0) {
        showSimpleToast("Erreur: aucune donnée audio", "error")
        resetVoiceButton()
        return
      }

      // Créer le blob audio
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" })
      const duration = Math.round((Date.now() - recordingStartTime) / 1000)

      // Envoyer le message vocal
      await sendSimpleVoiceMessage(audioBlob, duration)

      isRecording = false
      resetVoiceButton()
    }

    // Démarrer l'enregistrement
    mediaRecorder.start()

    // Mettre à jour l'interface
    updateVoiceButton(true)
    showSimpleToast("🎤 Enregistrement en cours...", "info")

    return true
  } catch (error) {
    console.error("Erreur enregistrement:", error)
    showSimpleToast("Erreur: " + error.message, "error")
    isRecording = false
    resetVoiceButton()
    return false
  }
}

export function stopVoiceRecording() {
  if (mediaRecorder && isRecording) {
    console.log("Arrêt de l'enregistrement...")
    mediaRecorder.stop()
    showSimpleToast("📤 Envoi du message vocal...", "info")
  }
}

function updateVoiceButton(recording) {
  const voiceBtn = document.getElementById("voiceBtn")
  if (voiceBtn) {
    if (recording) {
      voiceBtn.innerHTML = '<i class="fas fa-stop text-xl text-red-500"></i>'
      voiceBtn.classList.add("recording")
    } else {
      voiceBtn.innerHTML = '<i class="fas fa-microphone text-xl"></i>'
      voiceBtn.classList.remove("recording")
    }
  }
}

function resetVoiceButton() {
  updateVoiceButton(false)
  isRecording = false
}

async function sendSimpleVoiceMessage(audioBlob, duration) {
  try {
    const currentUser = getCurrentUser()
    const currentChat = window.currentChat

    if (!currentUser || !currentChat) {
      showSimpleToast("Erreur: utilisateur ou chat non défini", "error")
      return
    }

    console.log("📤 Envoi message vocal...")

    // Convertir en base64
    const base64Audio = await blobToBase64(audioBlob)

    const message = {
      id: Date.now(),
      senderId: currentUser.id,
      receiverId: currentChat.contactId,
      text: "🎤 Message vocal",
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

    // Afficher immédiatement le message
    const messageElement = createVoiceMessageElement(message)
    const messagesArea = document.getElementById("messagesArea")
    if (messagesArea) {
      messagesArea.appendChild(messageElement)
      messagesArea.scrollTop = messagesArea.scrollHeight
    }

    // Envoyer au serveur (utiliser la fonction existante)
    if (window.handleSendMessage) {
      await window.handleSendMessage(currentUser.id, currentChat.contactId, message)
    }

    showSimpleToast("✅ Message vocal envoyé", "success")
  } catch (error) {
    console.error("Erreur envoi message vocal:", error)
    showSimpleToast("❌ Erreur lors de l'envoi", "error")
  }
}

function createVoiceMessageElement(message) {
  const currentUser = getCurrentUser()
  const isSentByMe = message.senderId === currentUser.id

  const messageDiv = document.createElement("div")
  messageDiv.className = `flex mb-4 ${isSentByMe ? "justify-end" : "justify-start"}`

  messageDiv.innerHTML = `
    <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
      isSentByMe ? "bg-[#005c4b] text-white" : "bg-[#202c33] text-white"
    } shadow-md">
      <div class="flex items-center space-x-2">
        <button class="voice-play-btn w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <i class="fas fa-play text-xs text-white"></i>
        </button>
        <div class="flex-1">
          <div class="text-sm">🎤 Message vocal</div>
          <div class="text-xs text-gray-300">${message.duration}s</div>
        </div>
      </div>
      <div class="flex justify-end items-center mt-1">
        <span class="text-xs text-gray-300">${message.time}</span>
      </div>
    </div>
  `

  return messageDiv
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function getCurrentUser() {
  const userData = localStorage.getItem("currentUser")
  return userData ? JSON.parse(userData) : null
}

function showSimpleToast(message, type) {
  console.log(`[${type.toUpperCase()}] ${message}`)

  const toast = document.createElement("div")
  toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
    type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"
  }`
  toast.textContent = message

  document.body.appendChild(toast)

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast)
    }
  }, 3000)
}

export function isCurrentlyRecording() {
  return isRecording
}

export function setupAudioRecorder() {
  console.log("🎤 Audio recorder configuré")
}
