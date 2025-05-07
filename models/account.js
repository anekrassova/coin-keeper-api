import mongoose from 'mongoose';
const Schema = mongoose.Schema;

//базовая валюта в бд - KZT
const accountSchema = new Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  include_in_total: { type: Boolean, required: true, default: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export const Account = mongoose.model('Account', accountSchema);
