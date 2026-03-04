import { useState } from "react"

const CATEGORY_OPTIONS = [
  {
    label: "Wanted a Password Reset",
    value: "PASSWORD_RESET",
    descriptionTemplate:
      "User requested a password reset. I reset the password and confirmed the user was able to sign in successfully."
  },
  {
    label: "Password Expired",
    value: "PASSWORD_EXPIRED",
    descriptionTemplate:
      "User’s password had expired. Password was reset and access was restored."
  },
  {
    label: "Student Password Reset",
    value: "STUDENT_PASSWORD_RESET",
    descriptionTemplate:
      "Student requested a password reset. Password was reset and verified with the user."
  },
  {
    label: "ESS Password",
    value: "ESS_PASSWORD",
    descriptionTemplate:
      "User needed assistance with ESS password access. Issue resolved successfully."
  },
  {
    label: "Bitlocker Recovery",
    value: "BITLOCKER_RECOVERY",
    descriptionTemplate:
      "Provided BitLocker recovery key and confirmed the device was unlocked."
  },
  {
    label: "AV Board Room Check",
    value: "AV_BOARDROOM_CHECK",
    descriptionTemplate:
      "Performed AV board room check. All equipment tested and functioning properly."
  },
  {
    label: "Other",
    value: "OTHER",
    descriptionTemplate: ""
  }
]

// Put code that checks for phone number automatically based on whats on the right monitor, Caller ID:

export default function TicketForm() {
  const [form, setForm] = useState({
    category: "",
    assignedTo: "",
    shortDescription: "",
    description: ""
  })

  //Provide category dropdown options and autofill Fields on category change
  const handleCategoryChange = (value: string) => {
    console.log("Category changed to:", value)
  
  const selected = CATEGORY_OPTIONS.find(
    option => option.value === value
  )

  if (!selected) return

    setForm(prev => ({
      ...prev,

      category: selected.value,
      description: selected.descriptionTemplate,
      shortDescription: selected.label
    }))
  }

  const log = document.getElementById('log-output') as HTMLPreElement;
  //Function for adding comments to the log
  function appendLog(message: string) {
    if (!log) return;
    const timestamp = new Date().toLocaleTimeString();
    log.textContent += `[${timestamp}] ${message}\n`;
    log.scrollTop = log.scrollHeight; // auto-scroll to bottom
  }
// Usage
// appendLog("Ticket submitted");

const clearLog = async () => {
  if (!log) return;

  appendLog(`Clearing log...`);
  console.log(`Clearing log...`);

  setTimeout(() => {
    log.textContent = ``;
  }, 1500); // 2000 milliseconds = 2 seconds

  }

  // Submit Button
  const [submitted, setSubmitted] = useState(false)

  const isCategoryInvalid = submitted && !form.category

  const handleSubmit = async () => {
    setSubmitted(true)

    if (!form.category) return

    appendLog(`Attempting to create ticket...`);
    console.log("Creating ticket...")
    await window.api.createTicket(form)
  }
//

  return (
    <main>
      <header className="ribbon">
        Ticket Automation
      </header>
      <div className="left">
        Left
      </div>

      <div className="center">
        {/* Category */}
        <label>
          Category <span className="required">*</span>
        </label>
        <div className={`box ${isCategoryInvalid ? "error" : ""}`}>
          <select
            value={form.category}
            onChange={e => 
              {
                handleCategoryChange(e.target.value);
                appendLog(`Category value changed to: "${e.target.value}"`);
              }
            }
          >
            <option value="" disabled>
              Select a ticket type
            </option>


            {CATEGORY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            </select>
          
          {isCategoryInvalid && (
            <span className="error-text">
              * Category is required *
            </span>
          )}
        </div>

        <input className="box" placeholder="Assigned To" />
        <input className="box" placeholder="Short Description" 
        value={form.shortDescription}     
        onChange={e => 
        {
          setForm({ ...form, shortDescription: e.target.value });
          //appendLog(`Short description changed to: "${e.target.value}"`);
          }
        }
        />

        <textarea className="box" placeholder="Description" 
          value={form.description}
          onChange={e =>
            setForm({ ...form, description: e.target.value })
          }
        />
        <button onClick={handleSubmit}>Create Ticket</button>
      </div>
      <div className="right">
          {/* Log */}
          <label>
            Log
          </label>
        <pre id="log-output" className="log-box">
        </pre>
        <button onClick={clearLog}>Clear Log</button>
      </div>

      <footer className="footer">
        - Designed by Victor Duchscherer - v0.1
      </footer>

    </main>

  )
}


/* Ideas: Password Generator, phone number reader */