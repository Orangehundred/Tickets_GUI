import { useState } from "react"
import TicketForm from "./components/TicketForm"
import PasswordInfo from "./components/PasswordInfo"

export default function App() {
  const [activeTab, setActiveTab] = useState(1)
  const [logs, setLogs] = useState<string[]>([])

  //Function for adding comments to the log
  function appendLog(message: string) {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }
// appendLog("Ticket submitted");

const clearLog = async () => {

  appendLog(`Clearing log...`);
  console.log(`Clearing log...`);

  setTimeout(() => {
      setLogs([])
  }, 1500); 

  }
  return (
    <main>
      <header className="ribbon">
        Ticket Automation
      </header>
      <div className="left">
        <nav>
          <button onClick={() => setActiveTab(1)} title="Ticket Form"><img src="/assets/ticketform.svg" alt="Ticket Form icon" /></button> 
          <button onClick={() => setActiveTab(2)} title="Password Generator"><img src="/assets/passwordgen.svg" alt="Password Generator icon" /></button>
          <button onClick={() => setActiveTab(3)} title="Settings"><img src="/assets/settings.svg" alt="Settings icon" /></button>
        </nav>

      </div>

      <div className="center">
        {activeTab === 1 && <TicketForm appendLog={appendLog} />}
        {activeTab === 2 && <PasswordInfo appendLog={appendLog} />}
        {activeTab === 3 && <label>Settings</label>}
      </div>
      <div className="right">
          {/* Log */}
          <label>Log</label>
          <pre className="log-box">
          {logs.join("\n")}
        </pre>
        <button className="submit-btn" onClick={clearLog}>Clear Log</button>
      </div>

      <footer className="footer">
        - Designed by Victor Duchscherer - v0.1
      </footer>

    </main>

  )
}


/* Ideas: Password Generator that runs playwright script to change password in Active Directory, 
checks for phone number automatically based on whats on the right monitor, Caller ID: 
Settings: Dark mode/light mode that changes UI look and web page UI look*/