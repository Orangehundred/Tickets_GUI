import { contextBridge, ipcRenderer } from "electron"
import type { TicketData } from "../../shared/types.ts"

contextBridge.exposeInMainWorld("api", {
  createTicket: (ticketData: TicketData) =>
    ipcRenderer.invoke("create-ticket", ticketData)
})
