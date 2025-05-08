import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/UserRoutes.js';
import accountRoutes from './routes/AccountRoutes.js';
import categoryRoutes from './routes/CategoryRoutes.js';
import transactionRoutes from './routes/TransactionRoutes.js';

const app = express();
dotenv.config();

app.use(cors());

app.use(express.json());

app.use('/api/auth', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 3000;

const db = process.env.MONGO_URI.replace(
   '${DB_PASSWORD}',
   process.env.DB_PASSWORD
);

mongoose
   .connect(db)
   .then((res) => console.log('Connected to DB'))
   .catch((error) => console.log(error));

app.listen(PORT, () => {
   console.log(`Server is running on http://localhost:${PORT}`);
});
