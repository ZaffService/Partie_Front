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
  }
 
  toast.className =
    "toast fixed right-4 top-4 p-4 rounded-lg text-white shadow-lg transform translate-x-full transition-all duration-300"
  toast.style.backgroundColor = colors[type]
  toast.style.zIndex = "9999"

  toast.innerHTML = `
    <div class="flex items-center">
      <i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle"} mr-2"></i>
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
    toast.style.transform = "translateX(full)"
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}
