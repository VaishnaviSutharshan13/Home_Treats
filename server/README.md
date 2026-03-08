# Server

Express + TypeScript API for the HostelMng application.

## Development

1. Copy `.env.example` to `.env` and populate `MONGO_URI`.
2. Install dependencies: `npm install`.
3. Run `npm run dev` to start the server with auto‑reload.

## Structure

```
server/src/
  config/        # db, other configuration
  controllers/   # request handlers
  models/        # Mongoose schemas
  routes/        # express routers
  middleware/    # custom middleware functions
  utils/         # helper utilities
  index.ts       # entry point
```
