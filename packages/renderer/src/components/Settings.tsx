import { useEffect } from "react"

type SettingsProps = {
  appendLog: (message: string) => void
  theme: string
  setTheme: (theme: string) => void
}

export default function Settings({ appendLog, theme, setTheme }: SettingsProps) {


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
  }, [theme])

  return (
    <div>
      <label>Settings</label>
      <div style={{ marginTop: "20px" }}>
        <label style={{ fontSize: "16px" }}>UI Theme</label>
        <br />
        <select
          value={theme}
          onChange={e => {
            setTheme(e.target.value)
            appendLog(`UI theme changed to: ${e.target.value} mode`)
          }}
          style={{ marginTop: "8px" }}
        >
          <option value="dark">Dark (Default)</option>
          <option value="light">Light</option>
        </select>
      </div>

      <div style={{ marginTop: "30px" }}>
        <label style={{ fontSize: "16px" }}>Phone Capture Region</label>
        <br />
        <button
          className="submit-btn"
          style={{ marginTop: "8px" }}
          onClick={async () => {
            if (!window.api?.resetPhoneRegion) {
              appendLog("Reset phone region API not available")
              return
            }
            await window.api.resetPhoneRegion()
            appendLog("Phone capture region reset. You will be prompted to re-select on next use.")
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
