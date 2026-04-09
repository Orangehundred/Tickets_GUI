import type { PasswordData, TicketData } from "../../../shared/types"

export {}

declare global {
  interface Window {
    api: {
      createTicket: (ticketData: TicketData) => Promise<any>,
      createPassword: (passwordData: PasswordData) => Promise<any>
    }
  }
}
