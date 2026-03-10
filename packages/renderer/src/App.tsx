import { useState } from "react"
import TicketForm from "./components/TicketForm"

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
  }, 1500); // 2000 milliseconds = 2 seconds

  }

  return (
    <main>
      <header className="ribbon">
        Ticket Automation
      </header>
      <div className="left">
      <nav>
        <label onClick={() => setActiveTab(1)}>Ticket Form</label>
        <label onClick={() => setActiveTab(2)}>Password Generator</label>
      </nav>

      </div>

      <div className="center">
        {activeTab === 1 && <TicketForm appendLog={appendLog} />}
        {activeTab === 2 && <div>PasswordGenerator</div>}
      </div>
      <div className="right">
          {/* Log */}
          <label>Log</label>
          <pre className="log-box">
          {logs.join("\n")}
        </pre>
        <button onClick={clearLog}>Clear Log</button>
      </div>

      <footer className="footer">
        - Designed by Victor Duchscherer - v0.1
      </footer>

    </main>

  )
}


/* Ideas: Password Generator that runs playwright script to change password in Active Directory, 
checks for phone number automatically based on whats on the right monitor, Caller ID: */