import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

export class UserService {
   constructor() {
      if (!process.env.JWT_SECRET) {
         throw new Error('JWT_SECRET is not defined in environment variables');
      }
      this.jwtSecret = process.env.JWT_SECRET;
   }

   isValidEmail(email) {
      const regex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/;
      return regex.test(email);
   }

   // метод для регистрации пользователей
   async register(email, password) {
      try {
         // проверка email и пароля
         if (
            !email ||
            !password ||
            password.length < 6 ||
            !this.isValidEmail(email)
         ) {
            throw {
               status: 400,
               message: 'Invalid email or password provided.',
            };
         }

         // проверка существования пользователя в базе данных
         const existingUser = await User.findOne({ email });
         if (existingUser) {
            throw {
               status: 400,
               message: 'Provided email already exists in the system.',
            };
         }

         const hashedPassword = await bcrypt.hash(password, 10);

         const newUser = new User({ email, password: hashedPassword });
         await newUser.save();

         return {
            status: 200,
            message: 'A user was successfully registered.',
         };
      } catch (error) {
         console.error('Error in register method:', error);
         return {
            status: error.status || 500,
            message: error.message || 'Internal server error.',
         };
      }
   }

   // метод для логина пользователй
   async login(email, password) {
      try {
         // если email или пароль не переданы
         if (!email || !password) {
            throw {
               status: 400,
               message: 'Email and password fields should not be empty.',
            };
         }

         // если передан не валидный email
         if (!this.isValidEmail(email)) {
            throw { status: 400, message: 'Invalid email format.' };
         }

         // поиск пользователя в базе
         const existingUser = await User.findOne({ email });
         if (!existingUser) {
            throw {
               status: 400,
               message:
                  'User with provided email does not exists in the system.',
            };
         }

         // проверка совпадений пароля
         const isPasswordCorrect = await bcrypt.compare(
            password,
            existingUser.password
         );
         if (!isPasswordCorrect) {
            throw { status: 400, message: 'Incorrect password provided.' };
         }

         // создание jwt токена
         const token = jwt.sign(
            { id: existingUser._id, email: existingUser.email },
            this.jwtSecret,
            { expiresIn: '7d' }
         );

         // возвращение токена и объекта пользователя без пароля
         const userWithoutPassword = {
            email: existingUser.email,
            prefferedCurrency: existingUser.preffered_currency,
         };

         return {
            status: 200,
            message: 'A user was successfully logged in.',
            token,
            user: userWithoutPassword,
         };
      } catch (err) {
         throw {
            status: 500,
            message: 'Internal server error.',
            error: err.message,
         };
      }
   }

   // метод для изменения email
   async changeEmail(userId, newEmail) {
      try {
         if (!newEmail || !this.isValidEmail(newEmail)) {
            throw { status: 400, message: 'Invalid email format.' };
         }

         const existingUser = await User.findOne({ email: newEmail });
         if (existingUser) {
            throw {
               status: 400,
               message: 'Provided email already exists in the system.',
            };
         }

         const updatedUser = await User.findByIdAndUpdate(
            userId,
            { email: newEmail },
            { new: true }
         );

         if (!updatedUser) {
            throw { status: 404, message: 'User not found.' };
         }

         const token = jwt.sign(
            { id: updatedUser._id, email: updatedUser.email },
            this.jwtSecret,
            { expiresIn: '7d' }
         );

         return {
            status: 200,
            message: 'Email successfully updated.',
            token,
            user: {
               email: updatedUser.email,
               prefferedCurrency: updatedUser.preffered_currency,
            },
         };
      } catch (err) {
         return {
            status: err.status || 500,
            message: err.message || 'Failed to update email.',
         };
      }
   }

   // метод для изменения пароля
   async changePassword(userId, oldPassword, newPassword) {
      try {
         if (!newPassword || newPassword.length < 6) {
            throw {
               status: 400,
               message: 'Password must be at least 6 characters long.',
            };
         }

         const existingUser = await User.findById(userId);

         const isPasswordCorrect = await bcrypt.compare(
            oldPassword,
            existingUser.password
         );
         if (!isPasswordCorrect) {
            throw { status: 400, message: 'Incorrect old password provided.' };
         }

         const hashedPassword = await bcrypt.hash(newPassword, 10);

         const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            { new: true }
         );

         if (!updatedUser) {
            throw { status: 404, message: 'User not found.' };
         }

         const token = jwt.sign(
            { id: updatedUser._id, email: updatedUser.email },
            this.jwtSecret,
            { expiresIn: '7d' }
         );

         return {
            status: 200,
            message: 'Password successfully updated.',
            token,
            user: {
               email: updatedUser.email,
               prefferedCurrency: existingUser.preffered_currency,
            },
         };
      } catch (err) {
         return {
            status: err.status || 500,
            message: err.message || 'Failed to update password.',
         };
      }
   }

   // UserService.js
   async changeCurrency(userId, newCurrency) {
      try {
         if (!newCurrency || typeof newCurrency !== 'string') {
            throw {
               status: 400,
               message: 'Invalid currency provided.',
            };
         }

         const updatedUser = await User.findByIdAndUpdate(
            userId,
            { preffered_currency: newCurrency },
            { new: true }
         );

         if (!updatedUser) {
            throw { status: 404, message: 'User not found.' };
         }

         return {
            status: 200,
            message: 'Preferred currency successfully updated.',
            user: {
               email: updatedUser.email,
               prefferedCurrency: updatedUser.preffered_currency,
            },
         };
      } catch (err) {
         return {
            status: err.status || 500,
            message: err.message || 'Failed to update preferred currency.',
         };
      }
   }
}
