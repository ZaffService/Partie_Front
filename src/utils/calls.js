let currentCall = null
let callTimeout = null
let localStream = null

export function initializeAudioCall(contact) {
  if (currentCall) {
    showSimpleToast("Un appel est déjà en cours", "error")
    return
  }

  console.log("📞 Initialisation appel audio avec:", contact.name)
  startSimpleCall(contact, "audio")
}

export async function startVideoCall(contact) {
  try {
    if (currentCall) {
      showSimpleToast("Un appel est déjà en cours", "error")
      return
    }

    console.log("📹 Initialisation appel vidéo avec:", contact.name)
    startSimpleCall(contact, "video")
  } catch (error) {
    console.error("Erreur appel vidéo:", error)
    showSimpleToast("Erreur: " + error.message, "error")
  }
}

async function startSimpleCall(contact, type) {
  currentCall = {
    contact: contact,
    type: type,
    startTime: Date.now(),
    status: "calling",
  }

  // Demander accès à la caméra/micro si vidéo
  if (type === "video") {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
    } catch (error) {
      console.error("Erreur accès caméra:", error)
      showSimpleToast("Veuillez autoriser l'accès à la caméra", "error")
      currentCall = null
      return
    }
  }

  // Créer l'interface d'appel
  createSimpleCallInterface(contact, type)

  // Simuler la réponse après 3 secondes
  callTimeout = setTimeout(() => {
    if (currentCall && currentCall.status === "calling") {
      answerSimpleCall()
    }
  }, 3000)
}

function createSimpleCallInterface(contact, type) {
  // Supprimer l'interface existante
  const existingCall = document.getElementById("callInterface")
  if (existingCall) {
    existingCall.remove()
  }

  const callInterface = document.createElement("div")
  callInterface.id = "callInterface"
  callInterface.className = "fixed inset-0 bg-gray-900 z-50"

  if (type === "video") {
    callInterface.innerHTML = `
      <div class="w-full h-full relative">
        <!-- Vidéo principale -->
        <div class="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div class="text-center">
            <img src="${contact.avatar}" alt="${contact.name}" 
                 class="w-32 h-32 rounded-full mb-4 object-cover shadow-2xl mx-auto">
            <h2 class="text-3xl font-light mb-2 text-white">${contact.name}</h2>
            <p id="callStatus" class="text-lg text-gray-300">📹 Appel vidéo en cours...</p>
          </div>
        </div>
        
        <!-- Votre vidéo -->
        <div class="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-white">
          <video id="localVideo" class="w-full h-full object-cover" autoplay muted playsinline></video>
        </div>
        
        <!-- Contrôles -->
        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-6">
          <button id="muteBtn" class="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center">
            <i class="fas fa-microphone text-xl text-white"></i>
          </button>
          <button id="cameraBtn" class="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center">
            <i class="fas fa-video text-xl text-white"></i>
          </button>
          <button id="hangupBtn" class="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center">
            <i class="fas fa-phone text-xl text-white transform rotate-135"></i>
          </button>
        </div>
        
        <!-- Durée -->
        <div id="callDuration" class="absolute top-4 left-4 bg-black bg-opacity-70 px-4 py-2 rounded-full text-white">
          00:00
        </div>
      </div>
    `
  } else {
    // Interface appel audio
    callInterface.innerHTML = `
      <div class="w-full h-full flex items-center justify-center">
        <div class="text-center">
          <img src="${contact.avatar}" alt="${contact.name}" 
               class="w-40 h-40 rounded-full mb-6 object-cover shadow-2xl mx-auto">
          <h2 class="text-4xl font-light mb-4 text-white">${contact.name}</h2>
          <p id="callStatus" class="text-xl text-gray-300 mb-8">📞 Appel en cours...</p>
          
          <div class="flex space-x-8 justify-center">
            <button id="muteBtn" class="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center">
              <i class="fas fa-microphone text-xl text-white"></i>
            </button>
            <button id="speakerBtn" class="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center">
              <i class="fas fa-volume-up text-xl text-white"></i>
            </button>
            <button id="hangupBtn" class="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center">
              <i class="fas fa-phone text-xl text-white transform rotate-135"></i>
            </button>
          </div>
          
          <div id="callDuration" class="mt-8 text-2xl text-gray-400">00:00</div>
        </div>
      </div>
    `
  }

  document.body.appendChild(callInterface)

  // Si vidéo, configurer la caméra locale
  if (type === "video" && localStream) {
    const localVideo = document.getElementById("localVideo")
    if (localVideo) {
      localVideo.srcObject = localStream
    }
  }

  setupSimpleCallControls()
}

function setupSimpleCallControls() {
  const muteBtn = document.getElementById("muteBtn")
  const cameraBtn = document.getElementById("cameraBtn")
  const speakerBtn = document.getElementById("speakerBtn")
  const hangupBtn = document.getElementById("hangupBtn")

  let isMuted = false
  let cameraOff = false

  // Bouton muet
  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      isMuted = !isMuted
      muteBtn.innerHTML = `<i class="fas fa-microphone${isMuted ? "-slash" : ""} text-xl text-white"></i>`
      muteBtn.classList.toggle("bg-red-500", isMuted)
      showSimpleToast(isMuted ? "🔇 Micro coupé" : "🎤 Micro activé", "info")
    })
  }

  // Bouton caméra
  if (cameraBtn) {
    cameraBtn.addEventListener("click", () => {
      cameraOff = !cameraOff
      cameraBtn.innerHTML = `<i class="fas fa-video${cameraOff ? "-slash" : ""} text-xl text-white"></i>`
      cameraBtn.classList.toggle("bg-red-500", cameraOff)
      showSimpleToast(cameraOff ? "📹 Caméra désactivée" : "📹 Caméra activée", "info")
    })
  }

  // Bouton haut-parleur
  if (speakerBtn) {
    speakerBtn.addEventListener("click", () => {
      showSimpleToast("🔊 Haut-parleur", "info")
    })
  }

  // Bouton raccrocher
  if (hangupBtn) {
    hangupBtn.addEventListener("click", endSimpleCall)
  }
}

function answerSimpleCall() {
  if (!currentCall) return

  currentCall.status = "connected"
  currentCall.connectedTime = Date.now()

  const callStatus = document.getElementById("callStatus")
  if (callStatus) {
    callStatus.textContent = currentCall.type === "video" ? "📹 Appel vidéo connecté" : "📞 Appel connecté"
  }

  startSimpleCallTimer()
  showSimpleToast("✅ Appel connecté", "success")
}

function startSimpleCallTimer() {
  const durationElement = document.getElementById("callDuration")
  if (!durationElement || !currentCall) return

  const updateTimer = () => {
    if (!currentCall || currentCall.status !== "connected") return

    const elapsed = Math.floor((Date.now() - currentCall.connectedTime) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60

    durationElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  updateTimer()
  currentCall.timerInterval = setInterval(updateTimer, 1000)
}

function endSimpleCall() {
  if (!currentCall) return

  const wasConnected = currentCall.status === "connected"
  const duration =
    wasConnected && currentCall.connectedTime ? Math.floor((Date.now() - currentCall.connectedTime) / 1000) : 0

  // Nettoyer les timers
  if (callTimeout) {
    clearTimeout(callTimeout)
    callTimeout = null
  }

  if (currentCall.timerInterval) {
    clearInterval(currentCall.timerInterval)
  }

  // Arrêter la caméra/micro
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop())
    localStream = null
  }

  // Supprimer l'interface
  const callInterface = document.getElementById("callInterface")
  if (callInterface) {
    callInterface.remove()
  }

  // Message de fin
  if (duration > 0) {
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    showSimpleToast(`📞 Appel terminé - ${minutes}:${seconds.toString().padStart(2, "0")}`, "info")
  } else {
    showSimpleToast("📞 Appel annulé", "info")
  }

  currentCall = null
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

export function isCallActive() {
  return currentCall !== null
}

export function terminateCall() {
  endSimpleCall()
}
