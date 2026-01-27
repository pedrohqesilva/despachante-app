import express from 'express';

const router = express.Router();

// Placeholder route
router.get('/status', (_req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

export default router;
