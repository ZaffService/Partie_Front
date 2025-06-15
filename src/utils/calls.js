import { showToast } from "./notifications.js"

import { getCurrentUser } from "./auth.js"

let currentCall = null
let callTimeout = null
let localStream = null

export function initializeAudioCall(contact) {
  if (currentCall) {
    showToast("Un appel est déjà en cours", "error")
    return
  }
  
  console.log("Initialisation appel audio avec:", contact.name)
  startCall(contact, 'audio')
} 

export function initializeVideoCall(contact) {
  if (currentCall) {
    showToast("Un appel est déjà en cours", "error")
    return
  }
  
  console.log("Initialisation appel vidéo avec:", contact.name)
  startCall(contact, 'video')
}

async function startCall(contact, type) {
  currentCall = {
    contact: contact,
    type: type,
    startTime: Date.now(),
    status: 'calling'
  }
  

  // Demander accès à la caméra/micro
  if (type === 'video') {
    try {
      console.log("Demande d'accès à la caméra...")
      localStream = await navigator.mediaDevices.getUserMedia({ 





        video: true, 
        audio: true 
      })

      console.log("Accès caméra accordé")
    } catch (error) {








      console.error(" Erreur accès caméra:", error)
      showToast("Veuillez autoriser l'accès à la caméra", "error")
      return
    }










  }
  
  // Créer l'interface d'appel
  createCallInterface(contact, type)
  
  // Si vidéo, configurer immédiatement la caméra locale
  if (type === 'video' && localStream) {
    setupLocalVideo()
  }
  
  // Simuler la sonnerie
  playRingtone()
  


  // Simuler la réponse après 3-5 secondes
  const responseTime = Math.random() * 3000 + 2000
  callTimeout = setTimeout(() => {
    if (currentCall && currentCall.status === 'calling') {
      answerCall()
    }
  }, responseTime)
}

function createCallInterface(contact, type) {

  // Supprimer l'interface existante
  const existingCall = document.getElementById('callInterface')
  if (existingCall) {
    existingCall.remove()
  }
  
  const callInterface = document.createElement('div')
  callInterface.id = 'callInterface'

  callInterface.className = 'fixed inset-0 bg-gray-900 z-50'
  
  if (type === 'video') {
    callInterface.innerHTML = `
      <div class="w-full h-full relative">
        <!-- Vidéo principale (contact) -->






        <div class="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
          <!-- Placeholder du contact -->
          <div class="text-center">
            <img src="${contact.avatar}" alt="${contact.name}" 


                 class="w-32 h-32 rounded-full mb-4 object-cover shadow-2xl mx-auto">
            <h2 class="text-3xl font-light mb-2 text-white">${contact.name}</h2>
            <p id="callStatus" class="text-lg text-gray-300">Appel vidéo en cours...</p>
          </div>
        </div>
        



        <!-- VOTRE VIDÉO (caméra locale) -->
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


      <div class="w-full h-full flex items-center justify-center">
        <div class="text-center">
          <img src="${contact.avatar}" alt="${contact.name}" 










               class="w-40 h-40 rounded-full mb-6 object-cover shadow-2xl mx-auto">
          <h2 class="text-4xl font-light mb-4 text-white">${contact.name}</h2>
          <p id="callStatus" class="text-xl text-gray-300 mb-8">Appel en cours...</p>
          



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









  setupCallControls()
}

function setupLocalVideo() {
  const localVideo = document.getElementById('localVideo')

  
  if (localVideo && localStream) {

    console.log("🎥 Configuration de votre caméra...")
    

    // Assigner directement le stream
    localVideo.srcObject = localStream
    


















    // Forcer le démarrage


    localVideo.play().then(() => {
      console.log("Votre caméra est active")
    }).catch(error => {
      console.error(" Erreur démarrage caméra:", error)
    })
  } else {

    console.error(" Vidéo ou stream manquant")
  }
}

function setupCallControls() {
  const muteBtn = document.getElementById('muteBtn')
  const cameraBtn = document.getElementById('cameraBtn')
  const speakerBtn = document.getElementById('speakerBtn')
  const hangupBtn = document.getElementById('hangupBtn')
  
  let isMuted = false
  let cameraOff = false

  
  // Bouton muet
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      isMuted = !isMuted
      
      if (localStream) {


        localStream.getAudioTracks().forEach(track => {
          track.enabled = !isMuted
        })
      }
      

      muteBtn.innerHTML = `<i class="fas fa-microphone${isMuted ? '-slash' : ''} text-xl text-white"></i>`
      muteBtn.classList.toggle('bg-red-500', isMuted)

      showToast(isMuted ? " Micro coupé" : " Micro activé", "info")
    })
  }
  

  // Bouton caméra
  if (cameraBtn) {
    cameraBtn.addEventListener('click', () => {
      cameraOff = !cameraOff
      
      if (localStream) {


        localStream.getVideoTracks().forEach(track => {
          track.enabled = !cameraOff
        })
      }
      







      cameraBtn.innerHTML = `<i class="fas fa-video${cameraOff ? '-slash' : ''} text-xl text-white"></i>`
      cameraBtn.classList.toggle('bg-red-500', cameraOff)

      showToast(cameraOff ? "Caméra désactivée" : " Caméra activée", "info")
    })
  }
  

  // Bouton haut-parleur
  if (speakerBtn) {
    speakerBtn.addEventListener('click', () => {



      showToast(" Haut-parleur", "info")
    })
  }
  
  // Bouton raccrocher
  if (hangupBtn) {
    hangupBtn.addEventListener('click', endCall)
  }
}


function answerCall() {
  if (!currentCall) return
  
  currentCall.status = 'connected'
  currentCall.connectedTime = Date.now()
  

  stopRingtone()
  

  const callStatus = document.getElementById('callStatus')
  if (callStatus) {

    callStatus.textContent = currentCall.type === 'video' ? ' Appel vidéo connecté' : ' Appel connecté'
  }
  

  startCallTimer()







  showToast("Appel connecté", "success")
}
















































































function startCallTimer() {
  const durationElement = document.getElementById('callDuration')
  if (!durationElement || !currentCall) return
  
  const updateTimer = () => {
    if (!currentCall || currentCall.status !== 'connected') return
    
    const elapsed = Math.floor((Date.now() - currentCall.connectedTime) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    
    durationElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  
  updateTimer()
  currentCall.timerInterval = setInterval(updateTimer, 1000)
}

function playRingtone() {





























  console.log(" Sonnerie...")
}

function stopRingtone() {


  console.log("Arrêt sonnerie")
}


async function endCall() {
  if (!currentCall) return
  
  const wasConnected = currentCall.status === 'connected'
  const duration = wasConnected && currentCall.connectedTime 
    ? Math.floor((Date.now() - currentCall.connectedTime) / 1000)
    : 0
  
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
    localStream.getTracks().forEach(track => {
      track.stop()
    })
    localStream = null
  }
  
  // Envoyer message d'appel dans le chat
  if (wasConnected) {
    await sendCallMessage(currentCall.contact, currentCall.type, duration)
  }
  
  // Supprimer l'interface
  const callInterface = document.getElementById('callInterface')
  if (callInterface) {
    callInterface.remove()
  }
  

  // Message de fin
  if (duration > 0) {
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60

    showToast(` Appel terminé - ${minutes}:${seconds.toString().padStart(2, '0')}`, "info")
  } else {

    showToast(" Appel annulé", "info")
  }
  

  currentCall = null
}


async function sendCallMessage(contact, callType, duration) {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser || !window.currentChat) return
    
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`
    
    const callMessage = {
      id: Date.now(),
      senderId: currentUser.id,
      receiverId: contact.id,
      text: `${callType === 'video' ? 'Appel vidéo' : 'Appel vocal'} - ${durationText}`,
      sent: true,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      timestamp: new Date().toISOString(),
      type: "call",
      callType: callType,
      duration: duration,
      status: "sent",
    }
    
    // Ajouter le message au chat
    if (window.sendMessage) {
      await window.sendMessage(callMessage)
    }
    
  } catch (error) {
    console.error("Erreur envoi message d'appel:", error)
  }
}

export function isCallActive() {
  return currentCall !== null
}


export function terminateCall() {
  endCall()
}
