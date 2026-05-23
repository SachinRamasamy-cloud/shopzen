import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocket(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`[server] running on port ${PORT} (${process.env.NODE_ENV})`);
  });
});

server.on('unhandledRejection', (err) => {
  console.error('[server] unhandledRejection:', err.message);
  server.close(() => process.exit(1));
});
