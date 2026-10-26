import 'dotenv/config';
import { app } from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.info(`HaatGo API listening on http://localhost:${env.PORT}`);
});

function stopServer(signal: NodeJS.Signals): void {
  console.info(`Received ${signal}; closing API server.`);
  server.close(() => {
    console.info('API server closed.');
    process.exit(0);
  });
}

process.on('SIGINT', stopServer);
process.on('SIGTERM', stopServer);
