import express from 'express';

// TODO (Workstream 1): Replace this placeholder app with the configured app from lib/canister.ts
// import app from './lib/canister.js';

const app = express();

app.use(express.json());

// Placeholder health check — swap this entire file once lib/canister.ts is complete
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', canister: 'medvault_backend' });
});

// Azle experimental HTTP server — do NOT call app.listen() with a port.
// Azle intercepts the listen() call and handles the ICP HTTP gateway internally.
app.listen();