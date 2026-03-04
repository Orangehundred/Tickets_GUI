import type { TicketData } from "../../../shared/types"

export {}

declare global {
  interface Window {
    api: {
      createTicket: (ticketData: TicketData) => Promise<any>
    }
  }
}
