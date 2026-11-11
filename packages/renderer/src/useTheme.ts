import { useState, useEffect } from "react"
import darkCSS from "./index.css?inline"
import lightCSS from "./index-light.css?inline"

const STYLE_TAG_ID = "app-theme"

function applyTheme(theme: string) {
  let tag = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement

  // Create the tag if it doesn't exist yet
  if (!tag) {
    tag = document.createElement("style")
    tag.id = STYLE_TAG_ID
    document.head.appendChild(tag)
  }

  tag.textContent = theme === "light" ? lightCSS : darkCSS
  localStorage.setItem("ui-theme", theme)
}

export function useTheme() {
  const [theme, setTheme] = useState<string>(
    () => localStorage.getItem("ui-theme") ?? "dark"
  )

  // Apply on startup and whenever theme changes
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return { theme, setTheme }
}