import express from 'express';
import { UserService } from '../services/UserService.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

const router = express.Router();
const userService = new UserService();

router.post('/register', async (req, res) => {
   const { email, password } = req.body;

   try {
      const result = await userService.register(email, password);
      res.status(result.status).json({ message: result.message });
   } catch (err) {
      console.error('Error while user registration: ', err);

      res.status(err.status || 500).json({
         message: err.message || 'Internal server error.',
      });
   }
});

router.post('/login', async (req, res) => {
   const { email, password } = req.body;

   try {
      const result = await userService.login(email, password);
      res.status(result.status).json({
         message: result.message,
         token: result.token,
         user: result.user,
      });
   } catch (err) {
      console.error('Error while user login: ', err);

      res.status(err.status || 500).json({
         message: err.message || 'Internal server error.',
      });
   }
});

router.post('/changeEmail', authMiddleware, async (req, res) => {
   try {
      const { email } = req.body;
      const userId = req.userId;

      const result = await userService.changeEmail(userId, email);

      res.status(result.status).json({
         message: result.message,
         token: result.token,
         user: result.user,
      });
   } catch (err) {
      console.error('Error while user login: ', err);

      res.status(err.status || 500).json({
         message: err.message || 'Internal server error.',
      });
   }
});

router.post('/changePassword', authMiddleware, async (req, res) => {
   try {
      const { password } = req.body;
      const userId = req.userId;

      const result = await userService.changePassword(userId, password);

      res.status(result.status).json({
         message: result.message,
         token: result.token,
         user: result.user,
      });
   } catch (err) {
      console.error('Error while user login: ', err);

      res.status(err.status || 500).json({
         message: err.message || 'Internal server error.',
      });
   }
});

router.post('/changeCurrency', authMiddleware, async (req, res) => {
   try {
      const { currency } = req.body;
      const userId = req.userId;

      const result = await userService.changeCurrency(userId, currency);

      res.status(result.status).json({
         message: result.message,
         user: result.user,
      });
   } catch (err) {
      console.error('Error while updating preferred currency: ', err);

      res.status(err.status || 500).json({
         message: err.message || 'Internal server error.',
      });
   }
});

export default router;
