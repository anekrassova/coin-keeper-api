import { Account } from '../models/account.js';
import { convertCurrency, currencyInSign } from '../libs/convertCurrency.js';
import { User } from '../models/user.js';

export class AccountService {
   // создание
   async createAccount(title, amount, include_in_total, user_id) {
      const user = await User.findById(user_id);

      if (!user) {
         throw { status: 404, message: 'User not found' };
      }

      const amountInKZT = convertCurrency(
         user.preffered_currency,
         amount,
         'KZT'
      );

      const newAccount = new Account({
         title,
         amount: amountInKZT,
         include_in_total,
         user_id,
      });

      await newAccount.save();

      return {
         status: 200,
         message: 'Account created successfully',
         data: {
            id: newAccount._id,
            title: newAccount.title,
            amount,
            include_in_total,
            user_id,
         },
      };
   }

   // удаление
   async deleteAccount(accountId) {
      await Account.findByIdAndDelete(accountId);
      return { status: 200, message: 'Account deleted successfully' };
   }

   // получение
   async getAllAccounts(userId) {
      const user = await User.findById(userId);
      if (!user) {
         throw { status: 404, message: 'User not found' };
      }

      const accounts = await Account.find({ user_id: userId });

      let total = 0;
      accounts.forEach((account) => {
         if (account.include_in_total) {
            total += convertCurrency(
               'KZT',
               account.amount,
               user.preffered_currency
            );
         }
      });

      const convertedAccounts = accounts.map((account) => {
         const convertedAmount = convertCurrency(
            'KZT',
            account.amount,
            user.preffered_currency
         );
         return {
            id: account._id,
            title: account.title,
            amount:
               String(parseFloat(convertedAmount.toFixed(2))) +
               currencyInSign[user.preffered_currency],
            include_in_total: account.include_in_total,
         };
      });

      return {
         status: 200,
         data: {
            total:
               String(parseFloat(total.toFixed(2))) +
               currencyInSign[user.preffered_currency],
            currency: user.preffered_currency,
            accounts: convertedAccounts,
         },
      };
   }

   async updateAccount(id, title, amount, include_in_total, user_id) {
      const user = await User.findById(user_id);
      if (!user) throw { status: 404, message: 'User not found' };

      const amountInKZT = convertCurrency(
         user.preffered_currency,
         amount,
         'KZT'
      );

      const updatedAccount = await Account.findByIdAndUpdate(
         id,
         { title, amountInKZT, include_in_total },
         { new: true }
      );

      const transformedAccount = {
         id: updatedAccount._id,
         title: updatedAccount.title,
         amount: updatedAccount.amount,
         include_in_total: updatedAccount.include_in_total,
         user_id: updatedAccount.user_id,
      };

      return {
         status: 200,
         data: transformedAccount,
         message: 'Account updated',
      };
   }
}
