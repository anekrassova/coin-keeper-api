import express from 'express';
import { IncomeExpenseCategoryService } from '../services/IncomeExpenseCategoryService.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

const router = express.Router();
const categoryService = new IncomeExpenseCategoryService();

// INCOME
router.post('/income/create', authMiddleware, async (req, res) => {
   try {
      const { title, amount } = req.body;
      const result = await categoryService.createIncomeCategory(
         title,
         amount,
         req.userId
      );
      res.status(result.status).json(result);
   } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
   }
});

router.get('/income', authMiddleware, async (req, res) => {
   try {
      const result = await categoryService.getIncomeCategories(req.userId);
      res.status(result.status).json(result);
   } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
   }
});

router.put('/income/:id', authMiddleware, async (req, res) => {
   try {
      const { title, amount } = req.body;
      const { id } = req.params;
      const result = await categoryService.updateIncomeCategory(
         id,
         title,
         amount,
         req.userId
      );
      res.status(result.status).json(result);
   } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
   }
});

router.delete('/income/:id', authMiddleware, async (req, res) => {
   try {
      const result = await categoryService.deleteIncomeCategory(req.params.id);
      res.status(result.status).json(result);
   } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
   }
});

// EXPENSE
router.post('/expense/create', authMiddleware, async (req, res) => {
   try {
      const { title, amount } = req.body;
      const result = await categoryService.createExpenseCategory(
         title,
         amount,
         req.userId
      );
      res.status(result.status).json(result);
   } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
   }
});

router.get('/expense', authMiddleware, async (req, res) => {
   try {
      const result = await categoryService.getExpenseCategories(req.userId);
      res.status(result.status).json(result);
   } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
   }
});

router.put('/expense/:id', authMiddleware, async (req, res) => {
   try {
      const { title, amount } = req.body;
      const { id } = req.params;
      const result = await categoryService.updateExpenseCategory(
         id,
         title,
         amount,
         req.userId
      );
      res.status(result.status).json(result);
   } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
   }
});

router.delete('/expense/:id', authMiddleware, async (req, res) => {
   try {
      const result = await categoryService.deleteExpenseCategory(req.params.id);
      res.status(result.status).json(result);
   } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
   }
});

export default router;
