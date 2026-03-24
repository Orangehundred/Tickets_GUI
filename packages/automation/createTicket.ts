import { firefox } from "playwright"
import type { TicketData } from "../shared/types.js"
import * as fs from 'fs';

// Auth file for logging in
const AUTH_PATH = "playwright/.auth/google-auth.json" 

//Credentials logic
import * as dotenv from 'dotenv';
dotenv.config({ path: './creds.env' });

const username = process.env.FMX_USERNAME
const password = process.env.FMX_PASSWORD

console.log('dotenv parsed:', {
  //USERNAME: process.env.FMX_USERNAME,
  //PASSWORD: process.env.FMX_PASSWORD
});

if (!username || !password) {
  throw new Error("Missing USERNAME or PASSWORD in creds.env")
}
//

export async function createTicket(ticket: TicketData) {
  const browser = await firefox.launch({ headless: false })

  let context

  // 1. Try to load existing session
  if (fs.existsSync(AUTH_PATH)) {
    console.log("Loading saved session...")
    context = await browser.newContext({
      storageState: AUTH_PATH
    })
  } else {
    console.log("No saved session found. Creating new session...")
    context = await browser.newContext()
  }

  const page = await context.newPage()

  await page.goto("https://sps.gofmx.com/technology-requests/new")

  // 2. Check if already logged in
  const locator = page.locator(".user-avatar")
  const isLoggedIn = await locator.count() > 0

  console.log("isLoggedIn:", isLoggedIn)
  if (!isLoggedIn) {
    console.log("Session invalid or expired. Logging in...")

    await page.locator('.button2.button2--secondary.button2--block.login-page__login-button').click()

    await page.getByRole('textbox', { name: 'Email or phone' }).fill(username as string)
    await page.getByRole('button', { name: 'Next' }).click()

    await page.getByRole('textbox', { name: 'Enter your password' }).fill(password as string)
    await page.getByRole('button', { name: 'Next' }).click()

    // Wait for successful login indicator
    await page.waitForURL("**sps.gofmx.com/**", { timeout: 15000 })
    await page.waitForLoadState("networkidle")

    await page.locator(".user-avatar").waitFor({ state: "visible", timeout: 15000 })

    // 3. After successful login, save the storage state to a file
    await context.storageState({ path: AUTH_PATH })
    console.log("Authentication state saved.")
    console.log(fs.readFileSync(AUTH_PATH, "utf-8"))
  } else {
    console.log("Using existing authenticated session.")
  }

  // --- Continue automation ---
  await page.locator('.selectize-input').first().click();
  await page.getByRole('option', { name: ticket.request_type }).click();

  await page.getByRole('textbox', { name: 'Request' }).fill(ticket.request_title);

  await page.getByRole('textbox', { name: 'Description' }).fill(ticket.descriptionTemplate);

  console.log("Assigned: " + ticket.assigned_to)
  console.log("Building: " + ticket.building)
  //if (ticket.building != "") {
  //  console.log("building exists")
  //  await page.locator('.selectize-dropdown-content').getByText(ticket.building).click();
  //}

  //await page.fill("#assigned_to", ticket.assignedTo)
  const selectize = page.locator('.selectize-input.items')

  // Remove existing selections
  const items = selectize.locator('.item')
  console.log("Items: " + items.count())

  while (await items.count() > 0) {
    await items.first().click()
    await page.keyboard.press('Backspace')
    //await page.getByRole('link', { name: '×' }).click();
  }

  // Type search
  //await page.getByRole('combobox', { name: 'Assigned to' }).fill(ticket.assigned_to);
  //await page.getByRole('option', { name: ticket.assigned_to }).click();

  // Wait and select first result
  //const firstOption = page.locator('.selectize-dropdown .option').first()
  //await firstOption.waitFor({ state: 'visible' })
  //await firstOption.click()

  
  //await page.click("button[type=submit]")
  //await browser.close()
}
