import { firefox } from "playwright"
import type { TicketData } from "../shared/types.js"

export async function createTicket(ticket: TicketData) {
  const browser = await firefox.launch({ headless: false })
  const page = await browser.newPage()

  await page.goto("https://your-ticket-system/new_ticket")

  await page.fill("#category", ticket.category)
  await page.fill("#assigned_to", ticket.assignedTo)

  await page.fill("#short_description", ticket.shortDescription)
  await page.fill("#description", ticket.description)

  await page.click("button[type=submit]")

  await browser.close()
}
