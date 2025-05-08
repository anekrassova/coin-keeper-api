// базовая валюта в бд - KZT
const exchangeRatesToKZT = {
   USD: 450,
   EUR: 490,
   KZT: 1,
};

export function convertCurrency(fromCurrency, fromAmount, toCurrency) {
   console.log('fromCurrency: ', fromCurrency, 'tocurrency: ', toCurrency);
   if (!exchangeRatesToKZT[fromCurrency] || !exchangeRatesToKZT[toCurrency]) {
      throw new Error('Unsupported currency.');
   }

   const amountInKZT = fromAmount * exchangeRatesToKZT[fromCurrency];

   const convertedAmount = amountInKZT / exchangeRatesToKZT[toCurrency];

   return parseFloat(convertedAmount.toFixed(2));
}

export const currencyInSign = {
   USD: '$',
   EUR: '€',
   KZT: '₸',
};
