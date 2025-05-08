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

      switch (type) {
         case 'income':
            const incomeAccount = await Account.findByIdAndUpdate(
               to,
               { $inc: { amount: amountInKZT } },
               { new: true }
            );
            break;
         case 'expense':
            const expenseAccount = await Account.findByIdAndUpdate(
               from,
               { $inc: { amount: -amountInKZT } },
               { new: true }
            );
            break;
         case 'transfer':
            const fromAccount = await Account.findByIdAndUpdate(
               from,
               { $inc: { amount: -amountInKZT } },
               { new: true }
            );
            const toAccount = await Account.findByIdAndUpdate(
               to,
               { $inc: { amount: amountInKZT } },
               { new: true }
            );
            break;
      }

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

      const transformedTransaction = {
         id: transaction._id,
         type: transaction.type,
         from: transaction.from,
         to: transaction.to,
         date: transaction.date,
         amount: String(amount) + currencyInSign[currency],
         comment: transaction.comment,
         current_balance: String(current_balance) + currencyInSign[currency],
      };

      return {
         status: 201,
         message: 'Transaction created successfully',
         data: transformedTransaction,
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

      const transactionToUpdate = await Transaction.findById(id);
      if (!transactionToUpdate)
         throw { status: 404, message: 'Transaction not found.' };

      const prevTransactionAmount = transactionToUpdate.amount;
      const newTransactionAmount = amountInKZT;

      switch (transactionToUpdate.type) {
         case 'income':
            const incomeAccount = await Account.findByIdAndUpdate(
               to,
               {
                  $inc: {
                     amount: newTransactionAmount - prevTransactionAmount,
                  },
               },
               { new: true }
            );
            break;
         case 'expense':
            const expenseAccount = await Account.findByIdAndUpdate(
               from,
               {
                  $inc: {
                     amount: prevTransactionAmount - newTransactionAmount,
                  },
               },
               { new: true }
            );
            break;
         case 'transfer':
            const fromAccount = await Account.findByIdAndUpdate(
               from,
               {
                  $inc: {
                     amount: prevTransactionAmount - newTransactionAmount,
                  },
               },
               { new: true }
            );
            const toAccount = await Account.findByIdAndUpdate(
               to,
               {
                  $inc: {
                     amount: newTransactionAmount - prevTransactionAmount,
                  },
               },
               { new: true }
            );
            break;
      }

      const updatedTransaction = await Transaction.findByIdAndUpdate(id, {
         from,
         to,
         amount: amountInKZT,
         date,
         comment,
      });

      const transformedTransaction = {
         id: updatedTransaction._id,
         type: updatedTransaction.type,
         from: updatedTransaction.from,
         to: updatedTransaction.to,
         date: updatedTransaction.date,
         amount: String(amount) + currencyInSign[updatedTransaction.currency],
         comment: updatedTransaction.comment,
         current_balance:
            String(updatedTransaction.current_balance) +
            currencyInSign[updatedTransaction.currency],
      };

      return {
         status: 200,
         message: 'Transaction updated successfully',
         data: transformedTransaction,
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

      const formattedTransactions = transactions.map((t) => {
         const obj = t.toObject();
         const { _id, ...rest } = obj;

         return {
            id: _id,
            ...rest,
            amount: String(t.amount) + currencyInSign[t.currency],
            current_balance:
               String(t.current_balance) + currencyInSign[t.currency],
         };
      });

      return {
         status: 200,
         data: formattedTransactions,
      };
   }

   async deleteTransaction(id) {
      const transactionToDelete = await Transaction.findById(id);
      if (!transactionToDelete) {
         throw { status: 404, message: 'Transaction not found' };
      }

      const transactionAmount = transactionToDelete.amount;

      switch (transactionToDelete.type) {
         case 'income':
            const incomeAccount = await Account.findByIdAndUpdate(
               transactionToDelete.to,
               { $inc: { amount: -transactionAmount } },
               { new: true }
            );
            break;
         case 'expense':
            const expenseAccount = await Account.findByIdAndUpdate(
               transactionToDelete.from,
               { $inc: { amount: transactionAmount } },
               { new: true }
            );
            break;
         case 'transfer':
            const fromAccount = await Account.findByIdAndUpdate(
               transactionToDelete.from,
               { $inc: { amount: transactionAmount } },
               { new: true }
            );
            const toAccount = await Account.findByIdAndUpdate(
               transactionToDelete.to,
               { $inc: { amount: -transactionAmount } },
               { new: true }
            );
            break;
      }

      await Transaction.findByIdAndDelete(id);

      return {
         status: 200,
         message: 'Transaction deleted',
      };
   }
}
