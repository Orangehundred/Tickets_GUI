import type { PasswordData, TicketData } from "../../../shared/types"

export {}

declare global {
  interface Window {
    api: {
      createTicket: (ticketData: TicketData) => Promise<any>,
      createPassword: (passwordData: PasswordData) => Promise<any>,
      getPhoneConfigStatus: () => Promise<{ exists: boolean; displayLeft?: number; displayTop?: number }>;
      extractPhoneNumber: () => Promise<string>,
      resetPhoneRegion: () => Promise<boolean>;
    }
  }
}
