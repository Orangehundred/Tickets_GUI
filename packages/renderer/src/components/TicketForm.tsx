import { useState } from "react"

const CATEGORY_OPTIONS = [
  {
    request_type: "Issue - User Accounts",
    request_title: "Staff Password Reset",
    descriptionTemplate:
      "User requested a password reset. I reset the password and confirmed the user was able to sign in successfully."
  },
  {
    request_type: "Issue - User Accounts",
    request_title: "Password Expired",
    descriptionTemplate:
      "User’s password had expired. Password was reset and access was restored."
  },
  {
    request_type: "Issue - User Accounts",
    request_title: "Student Password Reset",
    descriptionTemplate:
      "Student requested a password reset. Password was reset and verified with the user."
  },
  {
    request_type: "Issue - User Accounts",
    request_title: "Parent HAC Password Reset",
    descriptionTemplate:
      "Parent called and requested a password reset. I reset their password after confirming their identity with their student's ID number. I then confirmed the user was able to sign in successfully."
  },
  {
    request_type: "Issue - Staff Device",
    request_title: "Bitlocker Recovery",
    descriptionTemplate:
      "Provided BitLocker recovery key and confirmed the device was unlocked."
  },
  {
    request_type: "Issue - Audio Visual Equipment",
    request_title: "AV Board Room Check",
    descriptionTemplate:
      "Performed AV board room check. All equipment tested and functioning properly.",
    building: "Kraft Administration Center"
  },
  {
    request_type: "Other",
    request_title: "OTHER",
    descriptionTemplate: ""
  }
]

// Calls appendLog in App.tsx through props
type TicketFormProps = {
  appendLog: (message: string) => void
}

export default function TicketForm({ appendLog }: TicketFormProps) {

  const [form, setForm] = useState({
    request_type: "",
    request_title: "",
    descriptionTemplate: "",
    building: ""
  })

  //Provide category dropdown options and autofill Fields on category change
  const handleCategoryChange = (value: string) => {
    console.log("Category changed to:", value)
    appendLog(`Category changed to: "${value}"`)
  
  const selected = CATEGORY_OPTIONS.find(
    option => option.request_title === value
  )

  if (!selected) return

    setForm(prev => ({
      ...prev,

      request_type: selected.request_type,
      request_title: selected.request_title,
      descriptionTemplate: selected.descriptionTemplate,

    }))
  }


    // Create Ticket Button
    const [submitted, setSubmitted] = useState(false)

    const isCategoryInvalid = submitted && !form.request_type
  
    const handleSubmit = async () => {
      setSubmitted(true)
  
      if (!form.request_type) {
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
            value={form.request_title}
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
              <option key={option.request_title} value={option.request_title}>
                {option.request_title}
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
        value={form.request_title}     
        onChange={e => 
        {
          setForm({ ...form, request_title: e.target.value });
          //appendLog(`Short description changed to: "${e.target.value}"`);
          }
        }
        />

        <textarea className="box" placeholder="Description"
          value={form.descriptionTemplate}
          onChange={e =>
            setForm({ ...form, descriptionTemplate: e.target.value })
          }
        />
        <button className="submit-btn" onClick={handleSubmit}>Create Ticket</button>

    </center>

  )
}