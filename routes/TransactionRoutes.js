import express from 'express';
import { authMiddleware } from '../middleware/AuthMiddleware.js';
import { TransactionService } from '../services/TransactionService.js';

const router = express.Router();
const transactionService = new TransactionService();

router.post('/create', authMiddleware, async (req, res) => {
   try {
      const { type, from, to, amount, date, comment } = req.body;
      const userId = req.userId;

      const result = await transactionService.createTransaction(
         type,
         from,
         to,
         amount,
         date,
         comment,
         userId
      );

      res.status(result.status).json({
         message: result.message,
         transaction: result.data,
      });
   } catch (err) {
      console.error('Error while deleting account: ', err);
      res.status(err.status || 500).json({
         message: err.message || 'Internal server error.',
      });
   }
});

router.get('/', authMiddleware, async (req, res) => {
   try {
      const userId = req.userId;

      const result = await transactionService.getTransactions(userId);

      res.status(result.status).json({
         transactions: result.data,
      });
   } catch (err) {
      console.error('Error while deleting account: ', err);
      res.status(err.status || 500).json({
         message: err.message || 'Internal server error.',
      });
   }
});

router.put('/:id', authMiddleware, async (req, res) => {
   try {
      const transactionId = req.params.id;
      const userId = req.userId;
      const { from, to, amount, date, comment } = req.body;

      const result = await transactionService.updateTransaction(
         transactionId,
         from,
         to,
         amount,
         date,
         comment,
         userId
      );

      res.status(result.status).json({
         message: result.message,
         transaction: result.data,
      });
   } catch (err) {
      console.error('Error while deleting account: ', err);
      res.status(err.status || 500).json({
         message: err.message || 'Internal server error.',
      });
   }
});

router.delete('/:id', authMiddleware, async (req, res) => {
   try {
      const transactionId = req.params.id;

      const result = await transactionService.deleteTransaction(transactionId);

      res.status(result.status).json({ message: result.message });
   } catch (err) {
      console.error('Error while deleting account: ', err);
      res.status(err.status || 500).json({
         message: err.message || 'Internal server error.',
      });
   }
});

export default router;
