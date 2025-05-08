import express from 'express';
import { authMiddleware } from '../middleware/AuthMiddleware.js';
import { TransactionService } from '../services/TransactionService.js';

const router = express.Router();
const transactionService = new TransactionService();

router.post('/create', authMiddleware, async (req, res) => {});

export default router;
