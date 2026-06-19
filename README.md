# Tickets Automation GUI
<p align="center">
  <img width="1464" height="813" alt="image" src="https://github.com/user-attachments/assets/31ed67e1-c31c-4101-8761-198658ec3aa1" />
</p>

## Quick Start Guide
1. Check current Node version with: node -v
Ensure it is Node 23 or newer, if its not, Download and install Node 23+: https://nodejs.org/en/download

2. To begin testing application: npm start



This project was built on top of a Vite Electron Builder Boilerplate [template](https://github.com/cawa-93/vite-electron-builder).

### NPM Scripts

```sh
npm start
```
Start application in development more with hot-reload.

---
```sh
npm run build
```
Runs the `build` command in all workspaces if present.

---
```sh
npm run compile
```
First runs the `build` script,
then compiles the project into executable using `electron-builder` with the specified configuration.

---
```sh
npm run compile -- --dir -c.asar=false
```
Same as `npm run compile` but pass to `electron-builder` additional parameters to disable asar archive and installer
creating.
Useful for debugging compiled application.

---
```sh
npm run test
```
Executes end-to-end tests on **compiled app** using Playwright.

---
```sh
npm run typecheck
```
Runs the `typecheck` command in all workspaces if present.

---
```sh
npm run create-renderer
```
Initializes a new Vite project named `renderer`. Basically same as `npm create vite`.

---
```sh
npm run integrate-renderer
```
Starts the integration process of the renderer using the Vite Electron builder.

---
```sh
npm run init
```
Set up the initial environment by creating a new renderer, integrating it, and installing the necessary packages.
