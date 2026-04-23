import { firefox } from "playwright"

import type { PasswordData, TicketData } from "../shared/types.js"
import * as fs from 'fs';

// Auth file for logging in
const AUTH_PATH = "playwright/.auth/admanager-auth.json" 

//Credentials logic
import * as dotenv from 'dotenv';
dotenv.config({ path: './creds.env' });

const username = process.env.ADMANAGER_USER
const password = process.env.ADMANAGER_PASS

if (!username || !password) {
  throw new Error("Missing USERNAME or PASSWORD in creds.env")
}
//

export async function createPassword(passwordInfo: PasswordData) {
  const browser = await firefox.launch({ headless: false })

  let context

  // 1. Try to load existing session
  if (fs.existsSync(AUTH_PATH)) {
    console.log("Loading saved session...")
    context = await browser.newContext({
      ignoreHTTPSErrors: true, //Was getting error "Warning: Potential Security Risk Ahead" when navigating to webpage
      storageState: AUTH_PATH
    })
  } else {
    console.log("No saved session found. Creating new session...")
    context = await browser.newContext({
      ignoreHTTPSErrors: true, //Was getting error "Warning: Potential Security Risk Ahead" when navigating to webpage
    })
    
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
      .linput {
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

  async function isVisible(selector: string): Promise<boolean> {
    return page.locator(selector).waitFor({ state: "visible", timeout: 10000 }).then(() => true).catch(() => false);
  }

  const page = await context.newPage()

  await page.goto("https://spsadmanager.sps.org/AppsHome.do?LogoutFromSSO=true#/mgmt?reportCategory=51")

  // 2. Check if already logged in
  await page.waitForTimeout(3000);
  const locator = page.locator(".admp-icon.icn-login-user")
  const isLoggedIn = await locator.count() > 0

  //console.log("isLoggedIn:", isLoggedIn) // DEBUG
  if (!isLoggedIn) {
    console.log("Admanager session invalid or expired. Logging in...")

    await page.locator('#j_username').first().fill(username as string)
    await page.locator('#j_password').first().fill(password as string)
    await page.locator('#loginButton').click()

    if (await isVisible("text=Log in using Google Authenticator")) {
      console.log("Website prompting for 2FA, waiting for user to input code...");
      await page.locator('#TFA_GOOGLE_AUTHENTICATOR_SECRET_KEY').click();
      await page.waitForFunction(
        () => {
          const value = (document.querySelector('#TFA_GOOGLE_AUTHENTICATOR_SECRET_KEY') as HTMLInputElement)?.value;
          if (!value) return false;
          const hasNumbers = /\d/.test(value);
          return hasNumbers && value.length == 6;
        },
        { timeout: 120000 }
      );
      console.log("2FA Code entered, continuing...");
      await page.getByRole("button", { name: "Verify code" }).click();
    }

    // Wait for successful login indicator
    await page.waitForTimeout(3000);
    await page.locator(".admp-icon.icn-login-user").waitFor({ state: "visible", timeout: 15000 })

    // 3. After successful login, save the storage state to a file
    await context.storageState({ path: AUTH_PATH })
    console.log("Authentication state saved.")
    //console.log(fs.readFileSync(AUTH_PATH, "utf-8")) //DEBUG
  } else {
    console.log("Using existing authenticated session.")
  }

  // Continue Automation
  await page.getByText('Modify Single User', { exact: true }).nth(1).click();

  await page.waitForTimeout(3000);
  console.log("Trying to click");
  await page.locator('#searchBox_').click();

  console.log(passwordInfo.password)
  console.log(passwordInfo.staffID)
  console.log(passwordInfo.staff_username)
  /*
  await page.locator('#searchBox_').fill(passwordInfo.staffID) //Search by staffID or username
  await page.locator('#searchBox_').press('Enter');

  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('cell', { name: passwordInfo.staffID }).click(); //Click on matching staffID or staff username cell
  const page1 = await page1Promise;

  await page1.getByTitle('Custom Attributes').click();
  await page1.locator('#selectedDate11016').click() //Check expiration, if expired then print out that staff's password was expired

  await page1.getByTitle('Account').click();
  //Need to see if 'Change password at next logon' is checked, if it is, uncheck it with the next code line
  await page1.getByRole('cell', { name: 'User must change password at next logon', exact: true }).getByRole('insertion').click();

  await page1.locator('#enterPassword_2515').fill(passwordInfo.password);
  await page1.locator('#confirmPassword_2515').fill(passwordInfo.password);

  await page1.getByRole('button', { name: 'Update User' }).click(); //Updates password
  */
  //await page.waitForTimeout(5000);
  //await browser.close();
}
