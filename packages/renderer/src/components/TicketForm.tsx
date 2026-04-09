import { useState } from "react"

import dataList from '../../../../data.json';

const assigneeList = dataList.assignees;
const buildingList = dataList.buildings;
const phoneList = dataList.phone;

const TYPE_OPTIONS = [
  {
    request_type: "Issue - User Accounts",
    request_title: "Staff Password Reset",
    descriptionTemplate:
      "User requested a password reset. I reset the password and confirmed the user was able to sign in successfully.",
    assigned_to: assigneeList[0]
  },
  {
    request_type: "Issue - User Accounts",
    request_title: "Password Expired",
    descriptionTemplate:
      "User’s password had expired. Password was reset and access was restored.",
    assigned_to: assigneeList[0]
  },
  {
    request_type: "Issue - User Accounts",
    request_title: "Student Password Reset",
    descriptionTemplate:
      "Student requested a password reset. Password was reset and verified with the user.",
    assigned_to: assigneeList[0]
  },
  {
    request_type: "Issue - User Accounts",
    request_title: "Parent HAC Password Reset",
    descriptionTemplate:
      "Parent called and requested a password reset. I reset their password after confirming their identity with their student's ID number. I then confirmed the user was able to sign in successfully.",
    assigned_to: assigneeList[0]
  },
  {
    request_type: "Issue - Staff Device",
    request_title: "Bitlocker Recovery",
    descriptionTemplate:
      "Provided BitLocker recovery key and confirmed the device was unlocked.",
    assigned_to: assigneeList[0]
  },
  {
    request_type: "Issue - Audio Visual Equipment",
    request_title: "AV Board Room Check",
    descriptionTemplate:
      "Performed AV board room check. All equipment tested and functioning properly.",
    assigned_to: assigneeList[0],
    phoneNumber: phoneList[0],
    building: buildingList[0],
  },
  {
    request_type: "Other",
    request_title: "OTHER",
    descriptionTemplate: "",
    assigned_to: ""
  }
]

// Calls appendLog in App.tsx through props
type AppendLogProps = {
  appendLog: (message: string) => void
}

export default function TicketForm({ appendLog }: AppendLogProps) {

  const [form, setForm] = useState({
    request_type: "",
    request_title: "",
    descriptionTemplate: "",
    assigned_to: "",
    phoneNumber: "",
    building: ""
  })

  //Provide ticket type dropdown options and autofill Fields on ticket type change
  const handleTypeChange = (value: string) => {
    console.log("Ticket type changed to:", value)
    appendLog(`Ticket type changed to: "${value}"`)
  
  const selected = TYPE_OPTIONS.find(
    option => option.request_title === value
  )

  if (!selected) return

    setForm(prev => ({
      ...prev,

      request_type: selected.request_type,
      request_title: selected.request_title,
      descriptionTemplate: selected.descriptionTemplate,
      assigned_to: selected.assigned_to,
      phoneNumber: selected.phoneNumber ?? "",
      building: selected.building ?? "" //Fallback to empty string if undefined

    }))
  }


    // Create Ticket Button
    const [submitted, setSubmitted] = useState(false)

    const isTicketTypeInvalid = submitted && !form.request_type
  
    const handleSubmit = async () => {
      setSubmitted(true)
  
      if (!form.request_type) {
        appendLog("Ticket creation failed: Ticket type missing")
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
        {/* Ticket Info */}
        <label>
          Ticket Info <span className="required"></span>
        </label>
        <div className={`box ${isTicketTypeInvalid ? "error" : ""}`}>
          <select
            value={form.request_title}
            onChange={e => 
              {
                handleTypeChange(e.target.value);
                //appendLog(`Ticket type value changed to: "${e.target.value}"`);
              }
            }
          >
            <option value="" disabled>
              Select a ticket type
            </option>


            {TYPE_OPTIONS.map(option => (
              <option key={option.request_title} value={option.request_title}>
                {option.request_title}
              </option>
            ))}
            </select>
          
          {isTicketTypeInvalid && (
            <span className="error-text">
              * Ticket type is required *
            </span>
          )}
        </div>

        <input className="box" placeholder="Assigned To"
        value={form.assigned_to}     
        onChange={e => 
        {
          setForm({ ...form, assigned_to: e.target.value });
          //appendLog(`Assigned to changed to: "${e.target.value}"`);
          }
        }
        />
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