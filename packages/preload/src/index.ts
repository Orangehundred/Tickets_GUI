import { contextBridge, ipcRenderer } from "electron"
import type { PasswordData, TicketData } from "../../shared/types.ts"

contextBridge.exposeInMainWorld("api", {
  createTicket:   (ticket:   TicketData)   => ipcRenderer.invoke("create-ticket",   ticket),
  createPassword: (passInfo: PasswordData) => ipcRenderer.invoke("create-password", passInfo),
  extractPhoneNumber: () => ipcRenderer.invoke("extract-phone-number"),
  resetPhoneRegion: () => ipcRenderer.invoke("reset-phone-region"),
})