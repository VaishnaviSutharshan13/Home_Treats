ITPM - Hostel Management Project

This repository is a simple **MERN** (MongoDB, Express, React, Node) starter
for managing hostels. The workspace is split into `client/` (React + Vite) and
`server/` (Express + TypeScript).

## Highlights

- **Client**: TailwindCSS with global responsive breakpoints, MUI icons,
  organized `src` folders with path aliases, and Vite configuration.
- **Server**: Clean folder structure (`controllers`, `routes`, `models`, etc.),
  environment-based configuration, and TypeScript backing.

## Running

From the root you can start both services at once using **concurrently**:

```bash
npm install           # installs root dev deps (concurrently)
npm run dev           # launches server and client in parallel
```

Alternatively start each side individually as described below.

### Server

```bash
cd server
npm install
npm run dev       # start development server with ts-node-dev
```

### Client

```bash
cd client
npm install
npm run dev       # launch Vite dev server
```

Feel free to adapt or extend the structure to fit your application needs.