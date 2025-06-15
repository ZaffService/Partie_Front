export function showToast(message, type = "info") {
  // Supprime les toasts existants
  const existingToasts = document.querySelectorAll(".toast")
  existingToasts.forEach((toast) => toast.remove())

  // Crée le nouveau toast
  const toast = document.createElement("div")
  const colors = {
    success: "#25D366",
    error: "#ef4444",
    info: "#8696a0",
    warning: "#f59e0b",
  } 

  toast.className =
    "toast fixed right-4 top-4 p-4 rounded-lg text-white shadow-lg transform translate-x-full transition-all duration-300 z-50"
  toast.style.backgroundColor = colors[type]

  toast.innerHTML = `
    <div class="flex items-center">
      <i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : type === "warning" ? "fa-exclamation-triangle" : "fa-info-circle"} mr-2"></i>
      <span>${message}</span>
    </div>
  `

  document.body.appendChild(toast)

  // Animation d'entrée
  setTimeout(() => {
    toast.style.transform = "translateX(0)"
  }, 100)

  // Animation de sortie et suppression
  setTimeout(() => {
    toast.style.transform = "translateX(100%)"
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

export function showNotification(title, body, icon = null) {
  // Vérifier si les notifications sont supportées et autorisées
  if (!("Notification" in window)) {
    console.log("Ce navigateur ne supporte pas les notifications")
    return
  }

  if (Notification.permission === "granted") {
    // Créer la notification
    const notification = new Notification(title, {
      body: body,
      icon: icon || "/placeholder.svg?height=64&width=64",
      badge: "/placeholder.svg?height=32&width=32",
      tag: "whatsapp-message",
      requireInteraction: false,
      silent: false,
    })

    // Auto-fermer après 5 secondes
    setTimeout(() => {
      notification.close()
    }, 5000)

    // Gérer le clic sur la notification
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  } else if (Notification.permission !== "denied") {
    // Demander la permission
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        showNotification(title, body, icon)
      }
    })
  }

  // Afficher aussi une notification dans l'interface
  showInAppNotification(title, body, icon)
}

function showInAppNotification(title, body, icon) {
  const container = document.getElementById("notificationContainer")
  if (!container) return

  const notification = document.createElement("div")
  notification.className =
    "bg-[#202c33] border border-gray-600 rounded-lg p-4 shadow-lg max-w-sm transform translate-x-full transition-all duration-300"

  notification.innerHTML = `
    <div class="flex items-start space-x-3">
      ${icon ? `<img src="${icon}" alt="Avatar" class="w-10 h-10 rounded-full object-cover flex-shrink-0">` : '<div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-comment text-white"></i></div>'}
      <div class="flex-1 min-w-0">
        <h4 class="text-white font-medium text-sm truncate">${title}</h4>
        <p class="text-gray-400 text-sm mt-1 line-clamp-2">${body}</p>
      </div>
      <button class="text-gray-400 hover:text-white flex-shrink-0" onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times text-sm"></i>
      </button>
    </div>
  `

  container.appendChild(notification)

  // Animation d'entrée
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  // Auto-suppression après 5 secondes
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 300)
  }, 5000)

  // Jouer un son de notification (optionnel)
  playNotificationSound()
}

function playNotificationSound() {
  try {
    // Créer un son de notification simple
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  } catch (error) {
    console.log("Impossible de jouer le son de notification:", error)
  }
}

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Erreur permissions notifications:', error);
    return false;
  }
}
