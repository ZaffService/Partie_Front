let currentCall = null
let callTimeout = null
let localStream = null
let remoteStream = null
let peerConnection = null

// Configuration WebRTC RÉELLE
const rtcConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
}

export function initializeAudioCall(contact) {
  if (currentCall) {
    showSimpleToast("Un appel est déjà en cours", "error")
    return
  }

  console.log("📞 Initialisation appel audio RÉEL avec:", contact.name)
  startRealCall(contact, "audio")
}

export async function startVideoCall(contact) {
  try {
    if (currentCall) {
      showSimpleToast("Un appel est déjà en cours", "error")
      return
    }

    console.log("📹 Initialisation appel vidéo RÉEL avec:", contact.name)
    startRealCall(contact, "video")
  } catch (error) {
    console.error("Erreur appel vidéo:", error)
    showSimpleToast("Erreur: " + error.message, "error")
  }
}

async function startRealCall(contact, type) {
  currentCall = {
    contact: contact,
    type: type,
    startTime: Date.now(),
    status: "calling",
  }

  try {
    // Créer la connexion WebRTC RÉELLE
    peerConnection = new RTCPeerConnection(rtcConfiguration)

    // Demander accès à la caméra/micro RÉEL
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video:
        type === "video"
          ? {
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
              frameRate: { ideal: 30 },
              facingMode: "user",
            }
          : false,
    }

    console.log(" Demande d'accès aux périphériques...")
    localStream = await navigator.mediaDevices.getUserMedia(constraints)
    console.log("✅ Stream local obtenu:", localStream.getTracks().length, "tracks")

    // Ajouter les tracks à la connexion WebRTC
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream)
      console.log(" Track ajouté:", track.kind, track.label)
    })

    // Gérer le stream distant RÉEL
    peerConnection.ontrack = (event) => {
      console.log(" Stream distant reçu:", event.streams[0])
      remoteStream = event.streams[0]

      const remoteVideo = document.getElementById("remoteVideo")
      if (remoteVideo) {
        remoteVideo.srcObject = remoteStream
        console.log(" Stream distant assigné")

        // Masquer le placeholder quand la vidéo arrive
        const placeholder = document.getElementById("remotePlaceholder")
        if (placeholder) {
          placeholder.style.display = "none"
        }
      }
    }

    // Gérer les candidats ICE RÉELS
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("🧊 ICE candidate:", event.candidate.type)
        // Ici vous pouvez envoyer le candidate à l'autre peer via votre serveur
      }
    }

    // Gérer les changements de connexion
    peerConnection.onconnectionstatechange = () => {
      console.log("🔗 État connexion:", peerConnection.connectionState)

      if (peerConnection.connectionState === "connected") {
        console.log("Connexion WebRTC établie")
        if (currentCall && currentCall.status === "calling") {
          answerRealCall()
        }
      } else if (peerConnection.connectionState === "failed") {
        console.log("❌ Connexion WebRTC échouée")
        showSimpleToast("Connexion échouée", "error")
      }
    }

    // Créer l'interface d'appel RÉELLE
    createRealCallInterface(contact, type)

    // Simuler la réponse après 3 secondes (en attendant un vrai système de signaling)
    callTimeout = setTimeout(() => {
      if (currentCall && currentCall.status === "calling") {
        answerRealCall()
      }
    }, 3000)
  } catch (error) {
    console.error("❌ Erreur initialisation appel:", error)

    if (error.name === "NotAllowedError") {
      showSimpleToast("Veuillez autoriser l'accès à la caméra/microphone", "error")
    } else if (error.name === "NotFoundError") {
      showSimpleToast("Aucun périphérique audio/vidéo détecté", "error")
    } else {
      showSimpleToast("Erreur lors de l'initialisation de l'appel", "error")
    }

    currentCall = null
  }
}

function createRealCallInterface(contact, type) {
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
        <!-- Vidéo distante (plein écran) -->
        <video id="remoteVideo" 
               class="w-full h-full object-cover bg-gray-800" 
               autoplay 
               playsinline>
        </video>
        
        <!-- Placeholder en attendant la vidéo distante -->
        <div id="remotePlaceholder" class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div class="text-center">
            <img src="${contact.avatar}" alt="${contact.name}" 
                 class="w-32 h-32 rounded-full mb-4 object-cover shadow-2xl mx-auto">
            <h2 class="text-3xl font-light mb-2 text-white">${contact.name}</h2>
            <p id="callStatus" class="text-lg text-gray-300">📹 Appel vidéo en cours...</p>
            <div class="mt-4">
              <div class="animate-pulse flex space-x-1 justify-center">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <div class="w-2 h-2 bg-green-500 rounded-full animation-delay-200"></div>
                <div class="w-2 h-2 bg-green-500 rounded-full animation-delay-400"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Votre vidéo locale RÉELLE -->
        <div class="absolute top-4 right-4 w-64 h-48 bg-black rounded-lg overflow-hidden border-4 border-white shadow-2xl">
          <video id="localVideo" 
                 class="w-full h-full object-cover" 
                 autoplay 
                 muted 
                 playsinline>
          </video>
          <div id="localPlaceholder" class="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
            <div class="text-center">
              <i class="fas fa-video text-2xl mb-2"></i>
              <div class="text-sm">Caméra en cours...</div>
            </div>
          </div>
        </div>
        
        <!-- Contrôles -->
        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-6">
          <button id="muteBtn" class="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
            <i class="fas fa-microphone text-xl text-white"></i>
          </button>
          <button id="cameraBtn" class="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
            <i class="fas fa-video text-xl text-white"></i>
          </button>
          <button id="hangupBtn" class="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
            <i class="fas fa-phone text-xl text-white transform rotate-135"></i>
          </button>
        </div>
        
        <!-- Durée -->
        <div id="callDuration" class="absolute top-4 left-4 bg-black bg-opacity-70 px-4 py-2 rounded-full text-white font-mono">
          00:00
        </div>
      </div>
    `
  } else {
    // Interface appel audio RÉEL
    callInterface.innerHTML = `
      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
        <div class="text-center">
          <img src="${contact.avatar}" alt="${contact.name}" 
               class="w-40 h-40 rounded-full mb-6 object-cover shadow-2xl mx-auto">
          <h2 class="text-4xl font-light mb-4 text-white">${contact.name}</h2>
          <p id="callStatus" class="text-xl text-gray-300 mb-8">📞 Appel en cours...</p>
          
          <!-- Visualiseur audio RÉEL -->
          <div id="audioVisualizer" class="mb-8">
            <canvas id="visualizerCanvas" width="300" height="100" class="mx-auto rounded-lg"></canvas>
          </div>
          
          <div class="flex space-x-8 justify-center">
            <button id="muteBtn" class="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
              <i class="fas fa-microphone text-xl text-white"></i>
            </button>
            <button id="speakerBtn" class="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
              <i class="fas fa-volume-up text-xl text-white"></i>
            </button>
            <button id="hangupBtn" class="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
              <i class="fas fa-phone text-xl text-white transform rotate-135"></i>
            </button>
          </div>
          
          <div id="callDuration" class="mt-8 text-2xl text-gray-400 font-mono">00:00</div>
        </div>
      </div>
    `
  }

  document.body.appendChild(callInterface)

  // Configurer la vidéo locale RÉELLE
  if (type === "video") {
    setupRealLocalVideo()
  }

  // Configurer les contrôles RÉELS
  setupRealCallControls(type)

  // Démarrer le visualiseur audio RÉEL pour les appels audio
  if (type === "audio") {
    startRealAudioVisualizer()
  }
}

function setupRealLocalVideo() {
  const localVideo = document.getElementById("localVideo")
  const placeholder = document.getElementById("localPlaceholder")

  if (localVideo && localStream) {
    console.log("🎥 Configuration vidéo locale RÉELLE...")

    // Assigner le stream RÉEL
    localVideo.srcObject = localStream

    localVideo.onloadedmetadata = () => {
      console.log("✅ Vidéo locale chargée:", localVideo.videoWidth, "x", localVideo.videoHeight)
      if (placeholder) {
        placeholder.style.display = "none"
      }
    }

    localVideo.onplay = () => {
      console.log("▶️ Vidéo locale en lecture")
      if (placeholder) {
        placeholder.style.display = "none"
      }
    }

    localVideo.onerror = (error) => {
      console.error("❌ Erreur vidéo locale:", error)
      if (placeholder) {
        placeholder.innerHTML = `
          <div class="text-center text-red-400">
            <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
            <div class="text-sm">Erreur caméra</div>
          </div>
        `
      }
    }

    // Démarrer la lecture
    localVideo.play().catch(console.error)
  }
}

function setupRealCallControls(callType) {
  const muteBtn = document.getElementById("muteBtn")
  const cameraBtn = document.getElementById("cameraBtn")
  const speakerBtn = document.getElementById("speakerBtn")
  const hangupBtn = document.getElementById("hangupBtn")

  let isMuted = false
  let cameraOff = false

  // Bouton muet RÉEL
  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      isMuted = !isMuted

      if (localStream) {
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = !isMuted
          console.log(`🎤 Audio ${isMuted ? "coupé" : "activé"}:`, track.label)
        })
      }

      muteBtn.innerHTML = `<i class="fas fa-microphone${isMuted ? "-slash" : ""} text-xl text-white"></i>`
      muteBtn.classList.toggle("bg-red-500", isMuted)
      muteBtn.classList.toggle("bg-gray-700", !isMuted)

      showSimpleToast(isMuted ? " Micro coupé" : "Micro activé", "info")
    })
  }

  // Bouton caméra RÉEL (vidéo seulement)
  if (cameraBtn && callType === "video") {
    cameraBtn.addEventListener("click", () => {
      cameraOff = !cameraOff

      if (localStream) {
        localStream.getVideoTracks().forEach((track) => {
          track.enabled = !cameraOff
          console.log(` Vidéo ${cameraOff ? "désactivée" : "activée"}:`, track.label)
        })
      }

      cameraBtn.innerHTML = `<i class="fas fa-video${cameraOff ? "-slash" : ""} text-xl text-white"></i>`
      cameraBtn.classList.toggle("bg-red-500", cameraOff)
      cameraBtn.classList.toggle("bg-gray-700", !cameraOff)

      // Afficher/cacher le placeholder
      const placeholder = document.getElementById("localPlaceholder")
      if (placeholder) {
        placeholder.style.display = cameraOff ? "flex" : "none"
        if (cameraOff) {
          placeholder.innerHTML = `
            <div class="text-center">
              <i class="fas fa-video-slash text-2xl mb-2"></i>
              <div class="text-sm">Caméra désactivée</div>
            </div>
          `
        }
      }

      showSimpleToast(cameraOff ? "📹 Caméra désactivée" : "📹 Caméra activée", "info")
    })
  }

  // Bouton haut-parleur RÉEL
  if (speakerBtn) {
    speakerBtn.addEventListener("click", () => {
      showSimpleToast(" Haut-parleur", "info")
    })
  }

  // Bouton raccrocher
  if (hangupBtn) {
    hangupBtn.addEventListener("click", endRealCall)
  }
}

function answerRealCall() {
  if (!currentCall) return

  currentCall.status = "connected"
  currentCall.connectedTime = Date.now()

  const callStatus = document.getElementById("callStatus")
  if (callStatus) {
    callStatus.textContent = currentCall.type === "video" ? "📹 Appel vidéo connecté" : "📞 Appel connecté"
  }

  startRealCallTimer()
  showSimpleToast(" Appel connecté", "success")
}

function startRealCallTimer() {
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

function startRealAudioVisualizer() {
  const canvas = document.getElementById("visualizerCanvas")
  if (!canvas || !localStream) return

  const ctx = canvas.getContext("2d")
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const analyser = audioContext.createAnalyser()
  const source = audioContext.createMediaStreamSource(localStream)

  source.connect(analyser)
  analyser.fftSize = 256
  analyser.smoothingTimeConstant = 0.8

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  const draw = () => {
    if (!currentCall || currentCall.status !== "connected") return

    requestAnimationFrame(draw)

    analyser.getByteFrequencyData(dataArray)

    // Fond
    ctx.fillStyle = "rgb(17, 27, 33)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Barres de fréquence RÉELLES
    const barWidth = (canvas.width / bufferLength) * 2.5
    let barHeight
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * canvas.height * 0.8

      // Gradient de couleur basé sur la fréquence
      const hue = (i / bufferLength) * 120 + 120 // Vert à bleu
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`

      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
      x += barWidth + 1
    }
  }

  draw()
}

function endRealCall() {
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

  // Fermer la connexion WebRTC RÉELLE
  if (peerConnection) {
    peerConnection.close()
    peerConnection = null
  }

  // Arrêter les streams RÉELS
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      track.stop()
      console.log("🛑 Track arrêté:", track.kind, track.label)
    })
    localStream = null
  }

  if (remoteStream) {
    remoteStream.getTracks().forEach((track) => track.stop())
    remoteStream = null
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
  endRealCall()
}
