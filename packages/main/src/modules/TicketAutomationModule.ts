import { ipcMain } from "electron"
import type { AppModule } from "../AppModule.js"
import { createTicket } from "../../../automation/createTicket.js"

export class TicketAutomationModule implements AppModule {

  async enable(): Promise<void> {

    ipcMain.handle("create-ticket", async (_, ticket) => {
      await createTicket(ticket)
    })

  }

}

export function createTicketAutomationModule() {
  return new TicketAutomationModule()
}