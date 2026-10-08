import { useState, useEffect } from "react"

type AppendLogProps = {
  appendLog: (message: string) => void
}

export default function Settings({ appendLog }: AppendLogProps) {
  // Read saved theme from localStorage, default to "dark" if nothing saved
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("ui-theme") as "dark" | "light") ?? "dark"
  )

  // Whenever theme changes, swap the stylesheet and save the choice
  useEffect(() => {
    const link = document.getElementById("theme-stylesheet") as HTMLLinkElement

    if (theme === "light") {
      link.href = "/index-light.css"
    } else { //Default == dark theme
      link.href = "/index.css"
    }

    // Persist choice across sessions
    localStorage.setItem("ui-theme", theme)
    appendLog(`UI theme changed to: ${theme} mode`)
  }, [theme])

  return (
    <div>
      <label>Settings</label>

      <div style={{ marginTop: "20px" }}>
        <label style={{ fontSize: "16px" }}>UI Theme</label>
        <br />
        <select
            value={theme}
            onChange={e => setTheme(e.target.value as "dark" | "light")}
            >
            <option value="dark">Dark (Default)</option>
            <option value="light">Light</option>
        </select>
      </div>

      {/* Reset phone capture region config */}
      <div style={{ marginTop: "30px" }}>
        <label style={{ fontSize: "16px" }}>Phone Capture Region</label>
        <br />
        <button
          className="submit-btn"
          style={{ marginTop: "8px" }}
          onClick={async () => {
            await window.api.resetPhoneRegion()
            appendLog("Phone capture region reset. You will be prompted to re-select it on next use.")
          }}
        >
          Reset Capture Region
        </button>
      </div>
    </div>
  )
}
