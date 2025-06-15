export function createElement(tag, props = {}, children = []) {
  const element = document.createElement(tag)

  // Gestion des propriétés
  Object.entries(props).forEach(([key, value]) => {
    if (key === "className") {
      element.className = value
    } else if (key.startsWith("on")) {
      element.addEventListener(key.toLowerCase().slice(2), value)
    } else {
      element.setAttribute(key, value)
    }
  }) 

  // Gestion des enfants
  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (child !== null && child !== undefined) {
        if (typeof child === "string") {
          element.appendChild(document.createTextNode(child))
        } else if (child instanceof Node) {
          element.appendChild(child)
        }
      }
    })
  } else if (typeof children === "string") {
    element.textContent = children
  } else if (children instanceof Node) {
    element.appendChild(children)
  }

  return element
}
