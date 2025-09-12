import 'dotenv/config';
import { setupServer } from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';

const bootstrap = async () => {
    await initMongoConnection();
    await setupServer(); 
};

bootstrap().catch((error) => {
    console.error('Bootstrap failed:', error);
    process.exit(1);
});