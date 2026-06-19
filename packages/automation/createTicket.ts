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
  
  const darkModeCSS  = `
      * {
        background-color: #1a1a1a !important;
        color: #e0e0e0 !important;
        border-color: #666f77 !important;
      }
      input, textarea, select {
        background-color: #2a2a2a !important;
        color: #e0e0e0 !important;
      }

      button {
        background-color: #0394f7 !important;
        color: #2a2a2a !important;
      }
      .selectize-input.input-active,
      .selectize-input.input-active:hover {
        background-color: #000000 !important;
        color: #e0e0e0 !important;
      }   

      .selectize-dropdown .option.active {
        background-color: #0394f7 !important;
        color: #2a2a2a !important;
      }
    `
  // Injects dark mode on every new page/navigation automatically
  await context.addInitScript((css) => {
    const applyDarkMode = () => {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    };
    // Apply immediately and on any DOM changes
    if (document.head) {
      applyDarkMode();
    } else {
      document.addEventListener('DOMContentLoaded', applyDarkMode);
    }
  }, darkModeCSS);

  const page = await context.newPage()

  await page.goto("https://sps.gofmx.com/technology-requests/new")

  // 2. Check if already logged in
  const locator = page.locator(".user-avatar")
  const isLoggedIn = await locator.count() > 0

  //console.log("isLoggedIn:", isLoggedIn) // DEBUG
  if (!isLoggedIn) {
    console.log("Session invalid or expired. Logging in...")

    await page.locator('.button2.button2--secondary.button2--block.login-page__login-button').click()

  // Wait to see if google button auto-logs us in
  const saveSession = async () => {
    await context.storageState({ path: AUTH_PATH });
    console.log("Authentication state saved.");
  };
  
  async function isVisible(selector: string): Promise<boolean> {
    return page.locator(selector).waitFor({ state: "visible", timeout: 10000 }).then(() => true).catch(() => false);
  }

  if (await isVisible(".user-avatar")) {
    console.log("Logged in automatically with Google button, saving session...");
    await saveSession();

  } else if (await isVisible("text=Choose an account")) {
    console.log("Found account selection screen, trying to click on email...");
    await page.getByRole("link", { name: username as string }).click();
    await page.getByRole("textbox", { name: "Enter your password" }).fill(password as string);
    await page.getByRole("button", { name: "Next" }).click();
    await saveSession();

  } else {
    console.log("Auto-login failed, proceeding with manual login...");
    await page.getByRole("textbox", { name: "Email or phone" }).fill(username as string);
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("textbox", { name: "Enter your password" }).fill(password as string);
    await page.getByRole("button", { name: "Next" }).click();
  }

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
  // Click the request type selectize and wait for dropdown
  const requestTypeSelectize = page.locator('.selectize-input').first();
  await requestTypeSelectize.waitFor({ state: 'visible', timeout: 30000 });
  await requestTypeSelectize.click();

  if (ticket.request_type != "Other") {
      await page.getByRole('option', { name: ticket.request_type }).click();
  } else {
    // Wait for user to manually select a Request type
    console.log("Other Request Type - waiting for manual selection...");
    await page.locator('.selectize-input div.item').first().waitFor({ state: 'visible', timeout: 180000 }); //2 Min wait time
    console.log("Request type selected, continuing...");
  }

  await page.getByRole('textbox', { name: 'Request' }).fill(ticket.request_title);

  await page.getByRole('textbox', { name: 'Description' }).fill(ticket.descriptionTemplate);

  // BUILDING
  if (ticket.building != "") {
    await page.locator('[data-placeholder-key="building"] .selectize-input').click();
    await page.locator('[data-placeholder-key="building"] .selectize-dropdown-content').getByText(ticket.building ?? "").click();
  } else {
    //Make it highlighted red, or insert red text, or all caps text saying 'BUILDING NEEDED' or insert popup that says Building needs to be filled out

    // Wait for user to manually select a building
    console.log("No building specified - waiting for manual selection...");
    await page.locator('[data-placeholder-key="building"] .selectize-input').click();
    await page.locator('[data-placeholder-key="building"] .selectize-input div.item').first().waitFor({ state: 'visible', timeout: 180000 }); //2 Min wait time
    console.log("Building selected, continuing...");
  }

  // ON BEHALF OF
  if (ticket.request_type != "Issue - Audio Visual Equipment") {
    console.log("No on behalf of selected - waiting for manual entry...");
    await page.waitForTimeout(1500);

    const selectize = page.locator('.control-group').filter({ hasText: 'On behalf of' })
    .locator('.selectize-input');
    await selectize.waitFor({ state: 'visible', timeout: 180000 });
    await selectize.click();

    //Detects when an item populates in the div by detecting when div changes to a div labeled .has-items
    await page.locator('.control-group').filter({ hasText: 'On behalf of' })
      .locator('.selectize-input.has-items')
      .waitFor({ state: 'visible', timeout: 180000 });
    
    console.log("On behalf of selected, continuing...");
  }

  // PHONE: Wait for the user to type a phone number
  console.log("No phone number specified - waiting for manual entry...");

  const phoneLocator = page.locator('#Request_CustomFields_0__Value');

    if (ticket.phoneNumber  != "") {
      await phoneLocator.fill(ticket.phoneNumber  as string);
    } else {
      await phoneLocator.fill('');
      await page.waitForFunction(
        () => {
          const value = (document.querySelector('#Request_CustomFields_0__Value') as HTMLInputElement)?.value;
          if (!value) return false;
          const hasNumbers = /\d/.test(value);
          return hasNumbers && value.length >= 10;
        },
        { timeout: 180000 }
      );
    }
  console.log("Phone number entered, continuing...");

  // ASSIGNED_TO: Wait until at least one item is present under Assigned to dropdown
  await page.locator('.js-work-request-new-assignment-editor .selectize-input div.item').first().waitFor({ state: 'visible', timeout: 180000 });

  const selectize2 = page.locator('.js-work-request-new-assignment-editor .selectize-input')

  // Remove existing selections
  const items = selectize2.locator('div.item');

  while (await items.count() > 0) {
    await items.first().locator('a.remove').click(); // click the × button
  }

  // Open dropdown and select the assignee
  if (ticket.assigned_to != "") {
    await page.locator('.js-work-request-new-assignment-editor .selectize-dropdown-content').getByText(ticket.assigned_to).click();
  } else {
    console.log("No Assignee - waiting for manual selection...");
    await page.locator('.js-work-request-new-assignment-editor .selectize-input div.item').first().waitFor({ state: 'visible', timeout: 180000 });
  }
  console.log("Assignee selected, continuing...");

  await page.waitForTimeout(2000);

  const currentUrl = page.url();

  // Retry submit btn until URL changes
  while (page.url() === currentUrl) {
    let submitBtn = page.locator(".form-actions button[type=submit]");
    await submitBtn.waitFor({ state: 'visible' });
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    
    console.log('Submit clicked, waiting for page to change...');
    await page.waitForTimeout(3000);
  }

  // Wait for the alert to appear after submission before clicking
  await page.locator('.alert__text a.hyperlink[href^="/technology-requests/"]').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('.alert__text a.hyperlink[href^="/technology-requests/"]').first().click();

  await page.getByRole('link', { name: ' Resolve' }).click();
  await page.getByRole('textbox', { name: 'Resolution' }).fill(ticket.descriptionTemplate);

  await page.getByRole('button', { name: 'Resolve' }).click();
  
  const resolvedMessage = await page.locator('.alert__text a.hyperlink[href^="/technology-requests/"]').textContent()
  const ticketHref = await page.locator('.alert__text .hyperlink').first().getAttribute('href');
  
  console.log(resolvedMessage?.trim());
  const ticketNum = resolvedMessage?.replace(/\D/g, "")
  console.log('Ticket link: ' + 'https://sps.gofmx.com/technology-requests/' + ticketNum);

  await page.waitForTimeout(6000);
  await browser.close();
}
