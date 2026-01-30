import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import apiRoutes from './routes/api.js';

const app = express();

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://*.convex.cloud"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS configurado com origens permitidas
const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = config.corsOrigin.split(',').map(o => o.trim());

        // Permitir requisições sem origin (ex: mobile apps, Postman em dev)
        if (!origin && !config.isProduction) {
            return callback(null, true);
        }

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Origem não permitida pelo CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Error handling middleware - sempre retorna JSON
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[ERRO] Erro não tratado:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Erro interno do servidor'
    });
});

// 404 handler - sempre retorna JSON
app.use((req: express.Request, res: express.Response) => {
    res.status(404).json({
        success: false,
        error: `Rota não encontrada: ${req.method} ${req.path}`
    });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`[INFO] Server started on port ${PORT}`);
});
