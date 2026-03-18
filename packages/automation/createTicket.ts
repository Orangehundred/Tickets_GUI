import { firefox } from "playwright"
import type { TicketData } from "../shared/types.js"
import * as fs from 'fs';

// Auth file for logging in
const AUTH_PATH = "playwright/.auth/google-auth.json" 

//Credentials logic
import * as dotenv from 'dotenv';
dotenv.config({ path: './creds.env' });

const username = process.env.USERNAME
const password = process.env.PASSWORD

console.log('dotenv parsed:', {
  //USERNAME: process.env.USERNAME,
 //PASSWORD: process.env.PASSWORD
});
console.log(fs.readFileSync('./creds.env', 'utf-8'))

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
  const username = process.env.USERNAME

  console.log("isLoggedIn:", isLoggedIn)
  if (!isLoggedIn) {
    console.log("Session invalid or expired. Logging in...")

    await page.locator('.button2.button2--secondary.button2--block.login-page__login-button').click()

    await page.getByRole('textbox', { name: 'Email or phone' }).fill(username as string)
    await page.getByRole('button', { name: 'Next' }).click()

    await page.getByRole('textbox', { name: 'Enter your password' }).fill(password as string)
    await page.getByRole('button', { name: 'Next' }).click()

    // Wait for successful login indicator
    await page.locator(".user-avatar").isVisible()

    // 3. After successful login, save the storage state to a file
    await context.storageState({ path: AUTH_PATH })
    console.log("Authentication state saved.")
  } else {
    console.log("Using existing authenticated session.")
  }

  // --- Continue automation ---
  await page.fill("#category", ticket.category)
  await page.fill("#assigned_to", ticket.assignedTo)
  await page.fill("#short_description", ticket.shortDescription)
  await page.fill("#description", ticket.description)

  //await page.click("button[type=submit]")

  //await browser.close()
}
