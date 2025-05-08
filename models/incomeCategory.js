import mongoose from 'mongoose';
const Schema = mongoose.Schema;

//базовая валюта в бд - KZT
const incomeCategorySchema = new Schema({
   title: { type: String, required: true },
   receiving_plan: { type: Number, required: true },
   user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export const IncomeCategory = mongoose.model(
   'IncomeCategory',
   incomeCategorySchema
);
