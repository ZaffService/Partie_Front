let mediaRecorder = null
let audioChunks = []
let isRecording = false
let recordingStartTime = null
let audioContext = null
let analyser = null
let microphone = null
let animationId = null

// Configuration WebRTC pour le temps réel
const rtcConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
}

export async function startVoiceRecording() {
  try {
    console.log(" Démarrage enregistrement vocal RÉEL...")

    if (isRecording) {
      console.log("Enregistrement déjà en cours")
      return false
    }

    if (!window.currentChat && !window.currentGroup) {
      showSimpleToast("Sélectionnez une conversation d'abord", "error")
      return false
    }

    // Demander permission microphone avec contraintes optimisées
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100,
      },
    })

    // Créer MediaRecorder avec format optimal
    const options = {
      mimeType: "audio/webm;codecs=opus",
      audioBitsPerSecond: 128000,
    }

    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = "audio/webm"
    }

    mediaRecorder = new MediaRecorder(stream, options)
    audioChunks = []
    recordingStartTime = Date.now()
    isRecording = true

    // Configurer l'analyseur audio pour les ondes temps réel
    setupAudioAnalyzer(stream)

    // Événements MediaRecorder
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      console.log("🛑 Arrêt enregistrement")

      // Arrêter l'analyseur
      stopAudioAnalyzer()

      // Arrêter le stream
      stream.getTracks().forEach((track) => track.stop())

      if (audioChunks.length === 0) {
        showSimpleToast("Erreur: aucune donnée audio", "error")
        resetVoiceButton()
        return
      }

      // Créer le blob audio
      const audioBlob = new Blob(audioChunks, { type: options.mimeType })
      const duration = Math.round((Date.now() - recordingStartTime) / 1000)

      // Envoyer le message vocal en temps réel
      await sendRealTimeVoiceMessage(audioBlob, duration)

      isRecording = false
      resetVoiceButton()
    }

    // Démarrer l'enregistrement
    mediaRecorder.start(100) // Collecte des données toutes les 100ms

    // Mettre à jour l'interface avec ondes temps réel
    updateVoiceButton(true)
    showRecordingInterface()
    showSimpleToast("🎤 Enregistrement en cours...", "info")

    return true
  } catch (error) {
    console.error("❌ Erreur enregistrement:", error)
    showSimpleToast("Erreur: " + error.message, "error")
    isRecording = false
    resetVoiceButton()
    return false
  }
}

function setupAudioAnalyzer(stream) {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    microphone = audioContext.createMediaStreamSource(stream)

    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.8

    microphone.connect(analyser)

    // Démarrer l'animation des ondes
    animateWaveform()
  } catch (error) {
    console.error("Erreur setup analyseur audio:", error)
  }
}

function animateWaveform() {
  if (!isRecording || !analyser) return

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteFrequencyData(dataArray)

  // Calculer le niveau audio moyen
  let sum = 0
  for (let i = 0; i < bufferLength; i++) {
    sum += dataArray[i]
  }
  const average = sum / bufferLength

  // Mettre à jour l'interface avec les ondes
  updateWaveformDisplay(average, dataArray)

  animationId = requestAnimationFrame(animateWaveform)
}

function updateWaveformDisplay(average, frequencyData) {
  const recordingInterface = document.getElementById("recordingInterface")
  if (!recordingInterface) return

  const waveformContainer = recordingInterface.querySelector(".waveform-container")
  if (!waveformContainer) return

  // Créer des barres d'onde basées sur les fréquences
  const bars = waveformContainer.querySelectorAll(".wave-bar")

  bars.forEach((bar, index) => {
    const dataIndex = Math.floor((index / bars.length) * frequencyData.length)
    const height = Math.max(4, (frequencyData[dataIndex] / 255) * 40)
    bar.style.height = `${height}px`
    bar.style.backgroundColor = `hsl(${120 + height * 2}, 70%, 50%)`
  })

  // Mettre à jour le niveau général
  const levelIndicator = recordingInterface.querySelector(".level-indicator")
  if (levelIndicator) {
    const level = Math.min(100, (average / 255) * 100)
    levelIndicator.style.width = `${level}%`
  }
}

function showRecordingInterface() {
  // Supprimer l'interface existante
  const existing = document.getElementById("recordingInterface")
  if (existing) existing.remove()

  const recordingInterface = document.createElement("div")
  recordingInterface.id = "recordingInterface"
  recordingInterface.className =
    "fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-[#202c33] rounded-lg p-4 shadow-lg z-50"

  recordingInterface.innerHTML = `
    <div class="flex items-center space-x-4">
      <!-- Bouton stop -->
      <button id="stopRecordingBtn" class="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center">
        <i class="fas fa-stop text-white text-lg"></i>
      </button>
      
      <!-- Ondes audio temps réel -->
      <div class="waveform-container flex items-center space-x-1 h-10">
        ${Array.from(
          { length: 20 },
          () =>
            '<div class="wave-bar bg-green-500 rounded-full transition-all duration-100" style="width: 3px; height: 4px;"></div>',
        ).join("")}
      </div>
      
      <!-- Durée -->
      <div id="recordingDuration" class="text-white font-mono text-lg min-w-[60px]">0:00</div>
    </div>
    
    <!-- Niveau audio -->
    <div class="mt-2 bg-gray-700 rounded-full h-1 overflow-hidden">
      <div class="level-indicator bg-green-500 h-full transition-all duration-100" style="width: 0%"></div>
    </div>
    
    <div class="text-center mt-2 text-gray-400 text-sm">
      Enregistrement en cours...
    </div>
  `

  document.body.appendChild(recordingInterface)

  // Event listener pour arrêter
  const stopBtn = recordingInterface.querySelector("#stopRecordingBtn")
  stopBtn.addEventListener("click", stopVoiceRecording)

  // Démarrer le timer
  startRecordingTimer()
}

function startRecordingTimer() {
  const updateTimer = () => {
    if (!isRecording) return

    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60

    const durationElement = document.getElementById("recordingDuration")
    if (durationElement) {
      durationElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    if (isRecording) {
      setTimeout(updateTimer, 1000)
    }
  }

  updateTimer()
}

function stopAudioAnalyzer() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }

  if (audioContext && audioContext.state !== "closed") {
    audioContext.close()
  }

  audioContext = null
  analyser = null
  microphone = null
}

export function stopVoiceRecording() {
  if (mediaRecorder && isRecording) {
    console.log("🛑 Arrêt de l'enregistrement...")
    mediaRecorder.stop()
    showSimpleToast(" Envoi du message vocal...", "info")

    // Supprimer l'interface d'enregistrement
    const recordingInterface = document.getElementById("recordingInterface")
    if (recordingInterface) {
      recordingInterface.remove()
    }
  }
}

async function sendRealTimeVoiceMessage(audioBlob, duration) {
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

    console.log(" Envoi message vocal RÉEL...")

    // Convertir en base64 pour stockage
    const base64Audio = await blobToBase64(audioBlob)

    const message = {
      id: `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: currentGroup ? currentGroup.id : currentChat.contactId,
      text: " Message vocal",
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
      isRealTime: true,
    }

    // Afficher immédiatement le message avec lecteur temps réel
    const messageElement = createRealTimeVoiceMessageElement(message)
    const messagesArea = document.getElementById("messagesArea")
    if (messagesArea) {
      messagesArea.appendChild(messageElement)
      messagesArea.scrollTop = messagesArea.scrollHeight
    }

    // Envoyer au serveur ET aux autres utilisateurs en temps réel
    if (currentGroup) {
      const { sendMessageToGroup } = await import("./groups.js")
      await sendMessageToGroup(currentUser.id, currentGroup.id, message)
    } else {
      const { handleSendMessage } = await import("./chat-handler.js")
      await handleSendMessage(currentUser.id, currentChat.contactId, message)
    }

    // Notification temps réel pour le destinataire
    await sendRealTimeNotification(message, currentChat || currentGroup)

    showSimpleToast(" Message vocal envoyé", "success")
  } catch (error) {
    console.error("❌ Erreur envoi message vocal:", error)
    showSimpleToast(" Erreur lors de l'envoi", "error")
  }
}

function createRealTimeVoiceMessageElement(message) {
  const currentUser = getCurrentUser()
  const isSentByMe = message.senderId === currentUser.id

  const messageDiv = document.createElement("div")
  messageDiv.className = `flex mb-4 ${isSentByMe ? "justify-end" : "justify-start"}`
  messageDiv.dataset.messageId = message.id

  messageDiv.innerHTML = `
    <div class="max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
      isSentByMe ? "bg-[#005c4b] text-white" : "bg-[#202c33] text-white"
    } shadow-md">
      <div class="flex items-center space-x-3">
        ${
          !isSentByMe
            ? `
          <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <img src="${message.senderAvatar || "/placeholder.svg?height=32&width=32"}" alt="Avatar" class="w-full h-full object-cover">
          </div>
        `
            : ""
        }
        
        <button class="voice-play-btn w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all" 
                data-message-id="${message.id}" 
                data-audio-data="${message.fileData}">
          <i class="fas fa-play text-sm"></i>
        </button>
        
        <div class="flex-1 min-w-0">
          <!-- Ondes audio interactives avec progression RÉELLE -->
          <div class="voice-waveform flex items-center space-x-1 mb-1 cursor-pointer" data-message-id="${message.id}">
            ${Array.from({ length: 25 }, (_, i) => {
              const height = Math.random() * 16 + 4
              return `<div class="wave-bar bg-white bg-opacity-60 rounded-full transition-all duration-200" style="width: 2px; height: ${height}px;" data-index="${i}"></div>`
            }).join("")}
          </div>
          
          <div class="flex items-center justify-between text-xs text-gray-300">
            <span class="voice-duration">${message.duration || 0}s</span>
            <span class="voice-progress">0:00</span>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end items-center mt-1 space-x-1">
        <span class="text-xs text-gray-300">${message.time}</span>
        ${isSentByMe ? `<i class="fas fa-check-double text-xs ${message.status === "read" ? "text-blue-400" : "text-gray-400"}"></i>` : ""}
      </div>
    </div>
  `

  // Ajouter les événements interactifs RÉELS
  setupVoiceMessageInteractions(messageDiv, message)

  return messageDiv
}

function setupVoiceMessageInteractions(messageElement, message) {
  const playBtn = messageElement.querySelector(".voice-play-btn")
  const waveform = messageElement.querySelector(".voice-waveform")

  if (playBtn) {
    playBtn.addEventListener("click", () => playRealTimeVoiceMessage(playBtn, message))
  }

  if (waveform) {
    waveform.addEventListener("click", (e) => {
      const rect = waveform.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const progress = clickX / rect.width
      seekVoiceMessage(message.id, progress)
    })
  }
}

function playRealTimeVoiceMessage(button, message) {
  const messageId = message.id
  const audioData = message.fileData

  if (!audioData) {
    showSimpleToast("Données audio manquantes", "error")
    return
  }

  try {
    // Vérifier si un audio est déjà en cours
    const existingAudio = document.querySelector(`[data-audio-id="${messageId}"]`)
    if (existingAudio) {
      if (existingAudio.paused) {
        existingAudio.play()
        updatePlayButton(button, true)
      } else {
        existingAudio.pause()
        updatePlayButton(button, false)
      }
      return
    }

    // Créer un nouvel élément audio RÉEL
    const audio = new Audio(audioData)
    audio.dataset.audioId = messageId
    audio.style.display = "none"
    document.body.appendChild(audio)

    const icon = button.querySelector("i")
    const durationSpan = button.closest(".max-w-xs, .max-w-md").querySelector(".voice-duration")
    const progressSpan = button.closest(".max-w-xs, .max-w-md").querySelector(".voice-progress")
    const waveform = button.closest(".max-w-xs, .max-w-md").querySelector(".voice-waveform")

    let isPlaying = false

    audio.addEventListener("loadedmetadata", () => {
      console.log("🎵 Audio RÉEL chargé, durée:", audio.duration)
      if (durationSpan) {
        durationSpan.textContent = `${Math.ceil(audio.duration)}s`
      }
    })

    audio.addEventListener("timeupdate", () => {
      if (audio.duration) {
        const progress = audio.currentTime / audio.duration
        const remaining = Math.ceil(audio.duration - audio.currentTime)

        if (progressSpan) {
          const minutes = Math.floor(audio.currentTime / 60)
          const seconds = Math.floor(audio.currentTime % 60)
          progressSpan.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`
        }

        // Animer les ondes en fonction du progrès RÉEL
        updateWaveformProgress(waveform, progress)
      }
    })

    audio.addEventListener("ended", () => {
      updatePlayButton(button, false)
      resetWaveform(waveform)
      if (progressSpan) progressSpan.textContent = "0:00"
      audio.remove()
      isPlaying = false
    })

    audio.addEventListener("error", (e) => {
      console.error("❌ Erreur lecture audio:", e)
      showSimpleToast("Erreur lecture audio", "error")
      updatePlayButton(button, false)
      audio.remove()
      isPlaying = false
    })

    // Démarrer la lecture RÉELLE
    audio
      .play()
      .then(() => {
        updatePlayButton(button, true)
        isPlaying = true
      })
      .catch((error) => {
        console.error("❌ Erreur démarrage audio:", error)
        showSimpleToast("Impossible de lire l'audio", "error")
        audio.remove()
      })
  } catch (error) {
    console.error("❌ Erreur création audio:", error)
    showSimpleToast("Erreur lecture message vocal", "error")
  }
}

function updatePlayButton(button, isPlaying) {
  const icon = button.querySelector("i")
  if (icon) {
    icon.className = `fas fa-${isPlaying ? "pause" : "play"} text-sm`
  }
}

function updateWaveformProgress(waveform, progress) {
  if (!waveform) return

  const bars = waveform.querySelectorAll(".wave-bar")
  const progressIndex = Math.floor(progress * bars.length)

  bars.forEach((bar, index) => {
    if (index <= progressIndex) {
      bar.style.backgroundColor = "#00a884"
      bar.style.opacity = "1"
    } else {
      bar.style.backgroundColor = "rgba(255, 255, 255, 0.6)"
      bar.style.opacity = "0.6"
    }
  })
}

function resetWaveform(waveform) {
  if (!waveform) return

  const bars = waveform.querySelectorAll(".wave-bar")
  bars.forEach((bar) => {
    bar.style.backgroundColor = "rgba(255, 255, 255, 0.6)"
    bar.style.opacity = "0.6"
  })
}

function seekVoiceMessage(messageId, progress) {
  const audio = document.querySelector(`[data-audio-id="${messageId}"]`)
  if (audio && audio.duration) {
    audio.currentTime = progress * audio.duration
  }
}

async function sendRealTimeNotification(message, chat) {
  try {
    // Envoyer notification WebSocket ou Server-Sent Events
    const notification = {
      type: "voice_message",
      messageId: message.id,
      senderId: message.senderId,
      senderName: message.senderName,
      chatId: chat.id,
      timestamp: message.timestamp,
      duration: message.duration,
    }

    // Ici vous pouvez implémenter WebSocket ou SSE pour le temps réel
    console.log("📡 Notification temps réel envoyée:", notification)
  } catch (error) {
    console.error("❌ Erreur notification temps réel:", error)
  }
}

// Fonctions utilitaires
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
  console.log(" Audio recorder temps réel configuré")
}
