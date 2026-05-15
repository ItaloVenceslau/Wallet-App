const Transaction = require("../models/Transaction");
const getMonthlySummaryService = async (userId, month, year) => {
    const startDate = new Date(year, month -1, 1);
    const endDate = new Date(year, month, 1);

    const transactions = await Transaction.find({
        user: userId,
        date: { $gte: startDate, $lt: endDate }
    });

    let income = 0;
    let expenses = 0;
    const byCategory = {};

    transactions.forEach((transaction) => {
        if (transaction.type === "income") {
            income += transaction.amount;
        } else {
            expenses += transaction.amount;
            byCategory[transaction.category] = (byCategory[transaction.category] || 0) + transaction.amount;
        }
    });
      return {
    month,
    year,
    totalIncome: income,
    totalExpenses: expenses,
    balance: income - expenses,
    expensesByCategory: byCategory,
    totalTransactions: transactions.length
  };
};

module.exports = getMonthlySummaryService;