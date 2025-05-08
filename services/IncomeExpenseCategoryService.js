import { IncomeCategory } from '../models/incomeCategory.js';
import { ExpenseCategory } from '../models/expenseCategory.js';
import { convertCurrency, currencyInSign } from '../libs/convertCurrency.js';
import { User } from '../models/user.js';
import { Transaction } from '../models/transaction.js';
import dayjs from 'dayjs';

export class IncomeExpenseCategoryService {
   async createIncomeCategory(title, amount, user_id) {
      const user = await User.findById(user_id);
      if (!user) throw { status: 404, message: 'User not found' };

      const amountInKZT = convertCurrency(
         user.preffered_currency,
         amount,
         'KZT'
      );
      const newCategory = new IncomeCategory({
         title,
         receiving_plan: amountInKZT,
         user_id,
      });
      await newCategory.save();

      return {
         status: 200,
         message: 'Income category created',
         data: newCategory,
      };
   }

   async createExpenseCategory(title, amount, user_id) {
      const user = await User.findById(user_id);
      if (!user) throw { status: 404, message: 'User not found' };

      const amountInKZT = convertCurrency(
         user.preffered_currency,
         amount,
         'KZT'
      );
      const newCategory = new ExpenseCategory({
         title,
         spending_plan: amountInKZT,
         user_id,
      });
      await newCategory.save();

      return {
         status: 200,
         message: 'Expense category created',
         data: newCategory,
      };
   }

   async getIncomeCategories(user_id) {
      const user = await User.findById(user_id);
      if (!user) throw { status: 404, message: 'User not found' };

      const categories = await IncomeCategory.find({ user_id });

      const totalPlan = categories.reduce(
         (sum, c) => sum + c.receiving_plan,
         0
      );

      const startOfMonth = dayjs().startOf('month').toDate();
      const endOfMonth = dayjs().endOf('month').toDate();
      const transactions = await Transaction.find({
         user_id,
         date: { $gte: startOfMonth, $lte: endOfMonth },
         type: 'income',
      });

      const totalReceived = transactions.reduce((sum, t) => sum + t.amount, 0);

      const planConverted = parseFloat(
         convertCurrency('KZT', totalPlan, user.preffered_currency).toFixed(2)
      );
      const totalConverted = parseFloat(
         convertCurrency('KZT', totalReceived, user.preffered_currency).toFixed(
            2
         )
      );

      const convertedCategories = categories.map((c) => ({
         _id: c._id,
         title: c.title,
         receiving_plan:
            String(
               parseFloat(
                  convertCurrency(
                     'KZT',
                     c.receiving_plan,
                     user.preffered_currency
                  ).toFixed(2)
               )
            ) + currencyInSign[user.preffered_currency],
      }));

      return {
         status: 200,
         data: {
            budget:
               String(planConverted) + currencyInSign[user.preffered_currency],
            total:
               String(totalConverted) + currencyInSign[user.preffered_currency],
            categories: convertedCategories,
         },
      };
   }

   async getExpenseCategories(user_id) {
      const user = await User.findById(user_id);
      if (!user) throw { status: 404, message: 'User not found' };

      const categories = await ExpenseCategory.find({ user_id });

      const totalPlan = categories.reduce((sum, c) => sum + c.spending_plan, 0);

      const startOfMonth = dayjs().startOf('month').toDate();
      const endOfMonth = dayjs().endOf('month').toDate();
      const transactions = await Transaction.find({
         user_id,
         date: { $gte: startOfMonth, $lte: endOfMonth },
         type: 'expense',
      });

      const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

      const planConverted = parseFloat(
         convertCurrency('KZT', totalPlan, user.preffered_currency).toFixed(2)
      );
      const totalConverted = parseFloat(
         convertCurrency('KZT', totalSpent, user.preffered_currency).toFixed(2)
      );

      const convertedCategories = categories.map((c) => ({
         _id: c._id,
         title: c.title,
         spending_plan:
            String(
               parseFloat(
                  convertCurrency(
                     'KZT',
                     c.spending_plan,
                     user.preffered_currency
                  ).toFixed(2)
               )
            ) + currencyInSign[user.preffered_currency],
      }));

      return {
         status: 200,
         data: {
            budget:
               String(planConverted) + currencyInSign[user.preffered_currency],
            total:
               String(totalConverted) + currencyInSign[user.preffered_currency],
            categories: convertedCategories,
         },
      };
   }

   async updateIncomeCategory(id, title, amount, user_id) {
      const user = await User.findById(user_id);
      if (!user) throw { status: 404, message: 'User not found' };

      const receiving_plan = convertCurrency(
         user.preffered_currency,
         amount,
         'KZT'
      );

      const updatedCategory = await IncomeCategory.findByIdAndUpdate(
         id,
         { title, receiving_plan },
         { new: true }
      );

      return {
         status: 200,
         data: updatedCategory,
         message: 'Income category updated',
      };
   }

   async updateExpenseCategory(id, title, amount, user_id) {
      const user = await User.findById(user_id);
      if (!user) throw { status: 404, message: 'User not found' };

      const spending_plan = convertCurrency(
         user.preffered_currency,
         amount,
         'KZT'
      );

      const updatedCategory = await ExpenseCategory.findByIdAndUpdate(
         id,
         { title, spending_plan },
         { new: true }
      );

      return {
         status: 200,
         data: updatedCategory,
         message: 'Expense category updated',
      };
   }

   async deleteIncomeCategory(id) {
      await IncomeCategory.findByIdAndDelete(id);
      return { status: 200, message: 'Income category deleted' };
   }

   async deleteExpenseCategory(id) {
      await ExpenseCategory.findByIdAndDelete(id);
      return { status: 200, message: 'Expense category deleted' };
   }
}
