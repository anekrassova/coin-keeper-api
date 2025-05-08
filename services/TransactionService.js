import { Transaction } from '../models/transaction.js';
import { Account } from '../models/account.js';
import { User } from '../models/user.js';
import { convertCurrency, currencyInSign } from '../libs/convertCurrency.js';
import dayjs from 'dayjs';

export class TransactionService {
   async createTransaction(type, from, to, amount, date, comment, user_id) {
      const validTypes = ['income', 'expense', 'transfer'];
      if (!validTypes.includes(type)) {
         throw { status: 400, message: 'Invalid transaction type' };
      }

      const user = await User.findById(user_id);
      if (!user) throw { status: 404, message: 'User not found' };

      const amountInKZT = convertCurrency(
         user.preffered_currency,
         amount,
         'KZT'
      );
      const currency = user.preffered_currency;

      const accounts = await Account.find({ user_id });
      let current_balance = 0;
      accounts.forEach((account) => {
         if (account.include_in_total) {
            current_balance += convertCurrency(
               'KZT',
               account.amount,
               user.preffered_currency
            );
         }
      });

      const transaction = await Transaction.create({
         type,
         from,
         fromModel: type === 'income' ? 'IncomeCategory' : 'Account',
         to,
         toModel: type === 'expense' ? 'ExpenseCategory' : 'Account',
         amount: amountInKZT,
         date,
         comment,
         currency,
         current_balance,
         user_id,
      });

      return {
         status: 201,
         message: 'Transaction created successfully',
         data: transaction,
      };
   }

   async updateTransaction(id, from, to, amount, date, comment, user_id) {
      const user = await User.findById(user_id);
      if (!user) throw { status: 404, message: 'User not found' };

      const amountInKZT = convertCurrency(
         user.preffered_currency,
         amount,
         'KZT'
      );

      const updatedTransaction = await Transaction.findByIdAndUpdate(id, {
         from,
         to,
         amount: amountInKZT,
         date,
         comment,
      });

      return {
         status: 200,
         message: 'Transaction updated successfully',
         data: updatedTransaction,
      };
   }

   async getTransactions(user_id) {
      const user = await User.findById(user_id);
      if (!user) throw { status: 404, message: 'User not found' };

      const startOfMonth = dayjs().startOf('month').toDate();
      const endOfMonth = dayjs().endOf('month').toDate();

      const transactions = await Transaction.find({
         user_id,
         date: { $gte: startOfMonth, $lte: endOfMonth },
      });

      const formattedTransactions = transactions.map((t) => ({
         ...t.toObject(),
         amount: String(t.amount) + currencyInSign[t.currency],
         current_balance:
            String(t.current_balance) + currencyInSign[t.currency],
      }));

      return {
         status: 200,
         data: transactions,
      };
   }

   async deleteTransaction(id) {
      const deleted = await Transaction.findOneAndDelete({ _id: id });
      if (!deleted) throw { status: 404, message: 'Transaction not found' };

      return {
         status: 200,
         message: 'Transaction deleted',
      };
   }
}
