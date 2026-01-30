import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '5000', 10),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    isProduction: process.env.NODE_ENV === 'production',
};
