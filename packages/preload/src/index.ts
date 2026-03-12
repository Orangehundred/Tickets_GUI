import { contextBridge, ipcRenderer } from "electron"
import type { TicketData } from "../../shared/types.ts"

contextBridge.exposeInMainWorld("api", {
  createTicket: (ticket: TicketData) =>
    ipcRenderer.invoke("create-ticket", ticket)
})