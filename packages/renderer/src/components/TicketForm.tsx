import { useState } from "react"

import dataList from '../../../../data.json';

const assigneeList = dataList.assignees;
const buildingList = dataList.buildings;
const phoneList = dataList.phone;

const TYPE_OPTIONS = [
  {
    request_type: "Other",
    request_title: "OTHER",
    descriptionTemplate: "",
    assigned_to: ""
  },
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
      "User requested a password reset for a student. I verified their ID, and their password was reset.",
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
    request_type: "Issue - Audio Visual Equipment",
    request_title: "Cleartouch board connectivity Issues",
    descriptionTemplate:
      "Cleartouch board in the room is experiencing issues with connectivity.",
    assigned_to: ""
  },
  {
    request_type: "Issue - Staff Device",
    request_title: "Remoted into device to diagnose problem",
    descriptionTemplate:
      "I remoted into the staff's device to help troubleshoot. After making the proper fixes or workaround, the user is able to work again normally.",
    assigned_to: assigneeList[0]
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
      appendLog("Ticket creation request sent & finished")
    }

  //
const ticketTypeSelected = form.request_type !== "" && form.request_type !== undefined;

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
          disabled={!ticketTypeSelected}
          value={form.assigned_to}     
          onChange={e => 
        {
          setForm({ ...form, assigned_to: e.target.value });
          //appendLog(`Assigned to changed to: "${e.target.value}"`);
          }
        }
        />
        
        <div className="phone-row">
          <input className="box" placeholder="Phone Number" 
            disabled={!ticketTypeSelected}
            value={form.phoneNumber}     
            onChange={e => {
              const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
              setForm({ ...form, phoneNumber: cleaned });
            }}
          />
          <button className="submit-btn" style={{ margin: "0px 0px 10px 0px"}}
            disabled={!ticketTypeSelected}
            onClick={async () => {
              try {
                appendLog("Trying to extract phone number from screen...");
                const number = await window.api.extractPhoneNumber();
                setForm(prev => ({ ...prev, phoneNumber: number }));
                console.log(`Extracted phone number: ${number}`)
                appendLog(`Extracted phone number: ${number}`);
              } catch (err) {
                appendLog("Failed to extract phone number — try re-selecting the region");
              }
            }}
          >
            Get #
          </button>
        </div>

        <input className="box" placeholder="Short Description"
          disabled={!ticketTypeSelected}
          value={form.request_title}     
          onChange={e => {
            setForm({ ...form, request_title: e.target.value });
          }}
          //If request_title input field is clicked off of with new typed value, it updates request_type if it matches 
          onBlur={e => {
            const match = TYPE_OPTIONS.find(t => t.request_title === e.target.value);
            if (match) {
              handleTypeChange(e.target.value);
            } else {
              // Only update request_type, keep request_title as whatever was typed
              setForm(prev => ({ ...prev, request_type: "OTHER" }));
            }
          }}
        />

        <textarea className="box" placeholder="Description"
          disabled={!ticketTypeSelected}
          value={form.descriptionTemplate}
          onChange={e =>
            setForm({ ...form, descriptionTemplate: e.target.value })
          }
        />
        <button className="submit-btn" onClick={handleSubmit}>Create Ticket</button>
    </center>
  )
}