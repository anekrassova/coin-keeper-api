import express from 'express';
import { AccountService } from '../services/AccountService.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

const router = express.Router();
const accountService = new AccountService();

router.get('/', authMiddleware, async (req, res) => {
   const userId = req.userId;

   try {
      const result = await accountService.getAllAccounts(userId);
      res.status(result.status).json(result.data);
   } catch (err) {
      console.error('Error while fetching accounts: ', err);
      res.status(err.status || 500).json({
         message: err.message || 'Internal server error.',
      });
   }
});

router.post('/create', authMiddleware, async (req, res) => {
   const { title, amount, include_in_total } = req.body;
   const userId = req.userId;

   try {
      const result = await accountService.createAccount(
         title,
         amount,
         include_in_total,
         userId
      );
      res.status(result.status).json({
         message: result.message,
         account: result.data,
      });
   } catch (err) {
      console.error('Error while creating account: ', err);
      res.status(err.status || 500).json({
         message: err.message || 'Internal server error.',
      });
   }
});

router.put('/:id', authMiddleware, async (req, res) => {
   try {
      const { id } = req.params;
      const userId = req.userId;
      const { title, amount, include_in_total } = req.body;

      const result = await accountService.updateAccount(
         id,
         title,
         amount,
         include_in_total,
         userId
      );

      res.status(result.status).json({
         message: result.message,
         account: result.data,
      });
   } catch (err) {
      console.error('Error while deleting account: ', err);
      res.status(err.status || 500).json({
         message: err.message || 'Internal server error.',
      });
   }
});

router.delete('/:accountId', authMiddleware, async (req, res) => {
   const { accountId } = req.params;

   try {
      const result = await accountService.deleteAccount(accountId);
      res.status(result.status).json({ message: result.message });
   } catch (err) {
      console.error('Error while deleting account: ', err);
      res.status(err.status || 500).json({
         message: err.message || 'Internal server error.',
      });
   }
});

export default router;
