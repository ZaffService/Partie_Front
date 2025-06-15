import { showToast } from "./notifications.js"

let localStream = null
let remoteStream = null
let peerConnection = null
let currentCall = null

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
}

export async function initializeCall(contact, type) {
  try {
    console.log(`Initialisation appel ${type} avec ${contact.name}`)

    // Créer la connexion peer
    peerConnection = new RTCPeerConnection(configuration)

    // Obtenir le stream local
    const constraints = {
      audio: true,
      video: type === "video",
    }

    localStream = await navigator.mediaDevices.getUserMedia(constraints)
    console.log("✅ Stream local obtenu:", localStream)

    // Ajouter le stream local à la connexion
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream)
      console.log("Track ajouté:", track.kind)
    })

    // Gérer le stream distant
    peerConnection.ontrack = (event) => {
      console.log("Stream distant reçu:", event.streams[0])
      remoteStream = event.streams[0]
      const remoteVideo = document.getElementById("remoteVideo")
      if (remoteVideo) {
        remoteVideo.srcObject = remoteStream
      }
    }

    // Gérer les candidats ICE
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE candidate:", event.candidate)
      }
    }

    currentCall = {
      contact,
      type,
      status: "calling",
      startTime: Date.now(),
    }

    // Créer l'interface d'appel
    createCallInterface(contact, type)

    // Simuler la connexion après 2-3 secondes
    setTimeout(
      () => {
        if (currentCall && currentCall.status === "calling") {
          simulateCallAnswer()
        }
      },
      2000 + Math.random() * 1000,
    )

    return true
  } catch (error) {
    console.error("Erreur initialisation appel:", error)

    if (error.name === "NotAllowedError") {
      showToast("Veuillez autoriser l'accès à la caméra/microphone", "error")
    } else if (error.name === "NotFoundError") {
      showToast("Aucun périphérique audio/vidéo détecté", "error")
    } else {
      showToast("Erreur lors de l'initialisation de l'appel", "error")
    }

    return false
  }
}

function createCallInterface(contact, type) {
  // Supprimer l'interface existante
  const existingInterface = document.getElementById("callInterface")
  if (existingInterface) {
    existingInterface.remove()
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
        
        <!-- Placeholder si pas de vidéo distante -->
        <div id="remotePlaceholder" class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div class="text-center">
            <img src="${contact.avatar}" alt="${contact.name}" 
                 class="w-32 h-32 rounded-full mb-4 object-cover shadow-2xl mx-auto">
            <h2 class="text-3xl font-light mb-2 text-white">${contact.name}</h2>
            <p id="callStatus" class="text-lg text-gray-300">Appel vidéo en cours...</p>
          </div>
        </div>
        
        <!-- Vidéo locale (coin) -->
        <div class="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-white shadow-xl">
          <video id="localVideo" 
                 class="w-full h-full object-cover" 
                 autoplay 
                 muted 
                 playsinline>
          </video>
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
    // Interface appel audio
    callInterface.innerHTML = `
      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
        <div class="text-center">
          <img src="${contact.avatar}" alt="${contact.name}" 
               class="w-40 h-40 rounded-full mb-6 object-cover shadow-2xl mx-auto">
          <h2 class="text-4xl font-light mb-4 text-white">${contact.name}</h2>
          <p id="callStatus" class="text-xl text-gray-300 mb-8">Appel en cours...</p>
          
          <!-- Visualiseur audio -->
          <div id="audioVisualizer" class="mb-8">
            <canvas id="visualizerCanvas" width="300" height="100" class="mx-auto"></canvas>
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

  // Configurer la vidéo locale IMMÉDIATEMENT
  if (type === "video") {
    setupLocalVideo()
  }

  // Configurer les contrôles
  setupCallControls(type)

  // Démarrer le visualiseur audio pour les appels audio
  if (type === "audio") {
    startAudioVisualizer()
  }
}

function setupLocalVideo() {
  const localVideo = document.getElementById("localVideo")

  if (localVideo && localStream) {
    console.log("🎥 Configuration vidéo locale...")

    // Assigner le stream directement
    localVideo.srcObject = localStream

    // Forcer le démarrage
    localVideo
      .play()
      .then(() => {
        console.log("✅ Vidéo locale active")
      })
      .catch((error) => {
        console.error("❌ Erreur démarrage vidéo locale:", error)
      })

    // Vérifier que la vidéo fonctionne
    localVideo.onloadedmetadata = () => {
      console.log("✅ Métadonnées vidéo chargées")
      console.log("Dimensions:", localVideo.videoWidth, "x", localVideo.videoHeight)
    }

    localVideo.onplay = () => {
      console.log("✅ Vidéo locale en lecture")
    }

    localVideo.onerror = (error) => {
      console.error("❌ Erreur vidéo locale:", error)
    }
  } else {
    console.error("❌ Élément vidéo ou stream manquant")
    console.log("localVideo:", localVideo)
    console.log("localStream:", localStream)
  }
}

function setupCallControls(callType) {
  const muteBtn = document.getElementById("muteBtn")
  const cameraBtn = document.getElementById("cameraBtn")
  const speakerBtn = document.getElementById("speakerBtn")
  const hangupBtn = document.getElementById("hangupBtn")

  let isMuted = false
  let cameraOff = false
  let speakerOn = false

  // Bouton muet
  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      isMuted = !isMuted

      if (localStream) {
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = !isMuted
        })
      }

      muteBtn.innerHTML = `<i class="fas fa-microphone${isMuted ? "-slash" : ""} text-xl text-white"></i>`
      muteBtn.classList.toggle("bg-red-500", isMuted)

      showToast(isMuted ? "🔇 Micro coupé" : "🎤 Micro activé", "info")
    })
  }

  // Bouton caméra (vidéo seulement)
  if (cameraBtn && callType === "video") {
    cameraBtn.addEventListener("click", () => {
      cameraOff = !cameraOff

      if (localStream) {
        localStream.getVideoTracks().forEach((track) => {
          track.enabled = !cameraOff
        })
      }

      cameraBtn.innerHTML = `<i class="fas fa-video${cameraOff ? "-slash" : ""} text-xl text-white"></i>`
      cameraBtn.classList.toggle("bg-red-500", cameraOff)

      showToast(cameraOff ? "📹 Caméra désactivée" : "🎥 Caméra activée", "info")
    })
  }

  // Bouton haut-parleur (audio seulement)
  if (speakerBtn && callType === "audio") {
    speakerBtn.addEventListener("click", () => {
      speakerOn = !speakerOn
      speakerBtn.classList.toggle("bg-green-500", speakerOn)
      showToast(speakerOn ? "🔊 Haut-parleur activé" : "🔇 Haut-parleur désactivé", "info")
    })
  }

  // Bouton raccrocher
  if (hangupBtn) {
    hangupBtn.addEventListener("click", endCall)
  }
}

function simulateCallAnswer() {
  if (!currentCall) return

  currentCall.status = "connected"
  currentCall.connectedTime = Date.now()

  const callStatus = document.getElementById("callStatus")
  if (callStatus) {
    callStatus.textContent = currentCall.type === "video" ? "📹 Appel vidéo connecté" : "📞 Appel connecté"
  }

  // Cacher le placeholder pour la vidéo
  if (currentCall.type === "video") {
    const placeholder = document.getElementById("remotePlaceholder")
    if (placeholder) {
      placeholder.style.display = "none"
    }

    // Simuler une vidéo distante
    simulateRemoteVideo()
  }

  startCallTimer()
  showToast("✅ Appel connecté", "success")
}

function simulateRemoteVideo() {
  // Créer un canvas pour simuler une vidéo distante
  const remoteVideo = document.getElementById("remoteVideo")
  if (remoteVideo) {
    const canvas = document.createElement("canvas")
    canvas.width = 640
    canvas.height = 480
    const ctx = canvas.getContext("2d")

    // Animation simple
    let hue = 0
    const animate = () => {
      if (!currentCall || currentCall.status !== "connected") return

      ctx.fillStyle = `hsl(${hue}, 50%, 30%)`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "white"
      ctx.font = "24px Arial"
      ctx.textAlign = "center"
      ctx.fillText("Simulation vidéo distante", canvas.width / 2, canvas.height / 2)

      hue = (hue + 1) % 360
      requestAnimationFrame(animate)
    }

    animate()

    // Convertir le canvas en stream
    const stream = canvas.captureStream(30)
    remoteVideo.srcObject = stream
  }
}

function startAudioVisualizer() {
  const canvas = document.getElementById("visualizerCanvas")
  if (!canvas || !localStream) return

  const ctx = canvas.getContext("2d")
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const analyser = audioContext.createAnalyser()
  const source = audioContext.createMediaStreamSource(localStream)

  source.connect(analyser)
  analyser.fftSize = 256

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  const draw = () => {
    if (!currentCall || currentCall.status !== "connected") return

    requestAnimationFrame(draw)

    analyser.getByteFrequencyData(dataArray)

    ctx.fillStyle = "rgb(17, 27, 33)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const barWidth = (canvas.width / bufferLength) * 2.5
    let barHeight
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * canvas.height * 0.8

      ctx.fillStyle = `rgb(37, 211, 102)`
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

      x += barWidth + 1
    }
  }

  draw()
}

function startCallTimer() {
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

export async function endCall() {
  if (!currentCall) return

  const wasConnected = currentCall.status === "connected"
  const duration =
    wasConnected && currentCall.connectedTime ? Math.floor((Date.now() - currentCall.connectedTime) / 1000) : 0

  // Nettoyer les timers
  if (currentCall.timerInterval) {
    clearInterval(currentCall.timerInterval)
  }

  // Fermer la connexion peer
  if (peerConnection) {
    peerConnection.close()
    peerConnection = null
  }

  // Arrêter les streams
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      track.stop()
      console.log("Track arrêté:", track.kind)
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

  // Enregistrer l'appel
  if (wasConnected) {
    await recordCall(currentCall.contact, currentCall.type, duration)
  }

  // Message de fin
  if (duration > 0) {
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    showToast(`📞 Appel terminé - ${minutes}:${seconds.toString().padStart(2, "0")}`, "info")
  } else {
    showToast("📞 Appel annulé", "info")
  }

  currentCall = null
}

async function recordCall(contact, type, duration) {
  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    if (!currentUser) return

    const callRecord = {
      id: `call_${Date.now()}`,
      participants: [currentUser.id, contact.id],
      type: type,
      status: "ended",
      startTime: new Date(currentCall.connectedTime).toISOString(),
      endTime: new Date().toISOString(),
      duration: duration,
      initiator: currentUser.id,
    }

    await fetch("http://localhost:5001/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(callRecord),
    })

    // Ajouter un message dans le chat
    if (window.sendMessage) {
      const minutes = Math.floor(duration / 60)
      const seconds = duration % 60
      const durationText = `${minutes}:${seconds.toString().padStart(2, "0")}`

      const callMessage = {
        id: Date.now(),
        senderId: currentUser.id,
        receiverId: contact.id,
        text: `${type === "video" ? "📹 Appel vidéo" : "📞 Appel vocal"} - ${durationText}`,
        sent: true,
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        timestamp: new Date().toISOString(),
        type: "call",
        callType: type,
        duration: duration,
        status: "sent",
      }

      await window.sendMessage(callMessage)
    }
  } catch (error) {
    console.error("Erreur enregistrement appel:", error)
  }
}

export function isCallActive() {
  return currentCall !== null
}
