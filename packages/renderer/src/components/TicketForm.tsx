import { useState } from "react"

const CATEGORY_OPTIONS = [
  {
    request_type: "Issue - User Accounts",
    request: "Staff Password Reset",
    descriptionTemplate:
      "User requested a password reset. I reset the password and confirmed the user was able to sign in successfully."
  },
  {
    request_type: "Issue - User Accounts",
    request: "Password Expired",
    descriptionTemplate:
      "User’s password had expired. Password was reset and access was restored."
  },
  {
    request_type: "Issue - User Accounts",
    request: "Student Password Reset",
    descriptionTemplate:
      "Student requested a password reset. Password was reset and verified with the user."
  },
  {
    request_type: "Parent HAC Password Reset",
    request: "Parent HAC Password Reset",
    descriptionTemplate:
      "Parent called and requested a password reset. I reset their password after confirming their identity with their student's ID number. I then confirmed the user was able to sign in successfully."
  },
  {
    request_type: "Issue - Staff Device",
    request: "Bitlocker Recovery",
    descriptionTemplate:
      "Provided BitLocker recovery key and confirmed the device was unlocked."
  },
  {
    request_type: "Issue - Audio Visual Equipment",
    request: "AV Board Room Check",
    descriptionTemplate:
      "Performed AV board room check. All equipment tested and functioning properly.",
    building: "Kraft Administration Center"
  },
  {
    request_type: "Other",
    request: "OTHER",
    descriptionTemplate: ""
  }
]

// Calls appendLog in App.tsx through props
type TicketFormProps = {
  appendLog: (message: string) => void
}

export default function TicketForm({ appendLog }: TicketFormProps) {

  const [form, setForm] = useState({
    category: "",
    assignedTo: "",
    shortDescription: "",
    description: ""
  })

  //Provide category dropdown options and autofill Fields on category change
  const handleCategoryChange = (value: string) => {
    console.log("Category changed to:", value)
    appendLog(`Category changed to: "${value}"`)
  
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


    // Create Ticket Button
    const [submitted, setSubmitted] = useState(false)

    const isCategoryInvalid = submitted && !form.category
  
    const handleSubmit = async () => {
      setSubmitted(true)
  
      if (!form.category) {
        appendLog("Ticket creation failed: Category missing")
        return
      }
  
      appendLog(`Attempting to create ticket...`);
      console.log("Creating ticket...")

      await window.api.createTicket(form)
      appendLog("Ticket creation request sent")
    }
  //


  return (
    <center>
        {/* Category */}
        <label>
          Ticket Info <span className="required"></span>
        </label>
        <div className={`box ${isCategoryInvalid ? "error" : ""}`}>
          <select
            value={form.category}
            onChange={e => 
              {
                handleCategoryChange(e.target.value);
                //appendLog(`Category value changed to: "${e.target.value}"`);
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
        <button className="submit-btn" onClick={handleSubmit}>Create Ticket</button>

    </center>

  )
}