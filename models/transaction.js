import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  type: {
    type: String,
    enum: ['income', 'expense', 'transfer'],
    required: true,
  },
  from: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'fromModel',
  },
  fromModel: {
    type: String,
    required: true,
    enum: ['Account', 'IncomeCategory'],
  },
  to: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'toModel',
  },
  toModel: {
    type: String,
    required: true,
    enum: ['Account', 'ExpenseCategory'],
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  comment: {
    type: String,
    default: '',
  },
  currency: {
    type: String,
    required: true,
  },
  current_balance: {
    type: Number,
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

export const Transaction = mongoose.model('Transaction', transactionSchema);
