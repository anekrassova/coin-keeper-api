import mongoose from 'mongoose';
const Schema = mongoose.Schema;

//базовая валюта в бд - KZT
const expenseCategorySchema = new Schema({
   title: { type: String, required: true },
   spending_plan: { type: Number, required: true },
   user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export const ExpenseCategory = mongoose.model(
   'ExpenseCategory',
   expenseCategorySchema
);
