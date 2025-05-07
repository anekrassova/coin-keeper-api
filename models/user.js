import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  preffered_currency: { type: String, required: true, default: 'KZT' },
});

export const User = mongoose.model('User', userSchema);
