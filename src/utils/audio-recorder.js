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
    const currentGroup = window.currentGroup

    if (!currentUser) {
      showSimpleToast("Erreur: utilisateur non connecté", "error")
      return
    }

    if (!currentChat && !currentGroup) {
      showSimpleToast("Erreur: aucune conversation sélectionnée", "error")
      return
    }

    console.log("📤 Envoi message vocal...")

    // Convertir en base64
    const base64Audio = await blobToBase64(audioBlob)

    const message = {
      id: `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: currentUser.id,
      receiverId: currentGroup ? currentGroup.id : currentChat.contactId,
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

    // Envoyer au serveur
    if (currentGroup) {
      // Message de groupe
      const { sendMessageToGroup } = await import("./groups.js")
      await sendMessageToGroup(currentUser.id, currentGroup.id, message)
    } else {
      // Message personnel
      const { handleSendMessage } = await import("./chat-handler.js")
      await handleSendMessage(currentUser.id, currentChat.contactId, message)
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
  messageDiv.dataset.messageId = message.id

  // Design WhatsApp pour message vocal
  messageDiv.innerHTML = `
    <div class="max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
      isSentByMe ? "bg-[#005c4b] text-white" : "bg-[#202c33] text-white"
    } shadow-md">
      <div class="flex items-center space-x-3">
        <!-- Avatar pour messages reçus -->
        ${
          !isSentByMe
            ? `
          <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <img src="${currentUser.avatar}" alt="Avatar" class="w-full h-full object-cover">
          </div>
        `
            : ""
        }
        
        <!-- Bouton play/pause -->
        <button class="voice-play-btn w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all" 
                data-message-id="${message.id}" 
                data-audio-data="${message.fileData}">
          <i class="fas fa-play text-sm"></i>
        </button>
        
        <!-- Forme d'onde et durée -->
        <div class="flex-1 min-w-0">
          <!-- Forme d'onde stylisée -->
          <div class="flex items-center space-x-1 mb-1">
            ${Array.from({ length: 20 }, (_, i) => {
              const height = Math.random() * 16 + 4 // Hauteur aléatoire entre 4 et 20px
              return `<div class="bg-white bg-opacity-60 rounded-full" style="width: 2px; height: ${height}px;"></div>`
            }).join("")}
          </div>
          
          <!-- Durée -->
          <div class="text-xs text-gray-300">
            <span class="voice-duration">${message.duration || 0}s</span>
          </div>
        </div>
      </div>
      
      <!-- Heure et statut -->
      <div class="flex justify-end items-center mt-1 space-x-1">
        <span class="text-xs text-gray-300">${message.time}</span>
        ${isSentByMe ? `<i class="fas fa-check-double text-xs ${message.status === "read" ? "text-blue-400" : "text-gray-400"}"></i>` : ""}
      </div>
    </div>
  `

  // Ajouter l'événement de lecture
  const playBtn = messageDiv.querySelector(".voice-play-btn")
  if (playBtn) {
    playBtn.addEventListener("click", () => playVoiceMessage(playBtn))
  }

  return messageDiv
}

// Nouvelle fonction pour lire les messages vocaux
function playVoiceMessage(button) {
  const messageId = button.dataset.messageId
  const audioData = button.dataset.audioData

  if (!audioData) {
    showSimpleToast("Données audio manquantes", "error")
    return
  }

  try {
    // Créer un élément audio
    const audio = new Audio(audioData)
    const icon = button.querySelector("i")
    const durationSpan = button.closest(".max-w-xs, .max-w-md").querySelector(".voice-duration")

    // État initial
    let isPlaying = false
    const currentTime = 0

    audio.addEventListener("loadedmetadata", () => {
      console.log("Audio chargé, durée:", audio.duration)
    })

    audio.addEventListener("timeupdate", () => {
      if (durationSpan && audio.duration) {
        const remaining = Math.ceil(audio.duration - audio.currentTime)
        durationSpan.textContent = `${remaining}s`
      }
    })

    audio.addEventListener("ended", () => {
      icon.className = "fas fa-play text-sm"
      if (durationSpan) {
        const originalDuration = button
          .closest(".max-w-xs, .max-w-md")
          .querySelector("[data-message-id]")
          .closest("[data-message-id]")
        durationSpan.textContent = `${audio.duration ? Math.ceil(audio.duration) : 0}s`
      }
      isPlaying = false
    })

    audio.addEventListener("error", (e) => {
      console.error("Erreur lecture audio:", e)
      showSimpleToast("Erreur lecture audio", "error")
      icon.className = "fas fa-play text-sm"
      isPlaying = false
    })

    // Toggle play/pause
    if (!isPlaying) {
      audio
        .play()
        .then(() => {
          icon.className = "fas fa-pause text-sm"
          isPlaying = true
        })
        .catch((error) => {
          console.error("Erreur démarrage audio:", error)
          showSimpleToast("Impossible de lire l'audio", "error")
        })
    } else {
      audio.pause()
      icon.className = "fas fa-play text-sm"
      isPlaying = false
    }
  } catch (error) {
    console.error("Erreur création audio:", error)
    showSimpleToast("Erreur lecture message vocal", "error")
  }
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
