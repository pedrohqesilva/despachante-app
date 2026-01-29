import express, { Router } from 'express';

const router: Router = express.Router();

// Placeholder route
router.get('/status', (_req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

export default router;
