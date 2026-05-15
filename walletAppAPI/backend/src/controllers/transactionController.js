const Transaction = require("../models/Transaction");
const getMonthlySummaryService = require("../services/summaryService");

const createTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const transaction = await Transaction.create({...req.body, user: userId});

        res.status(201).json({message: 'New transaction created successfully', transaction});
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
            
        const transactions = await Transaction.find({user: userId}).sort({ date: -1 });

        return res.status(200).json({transactions});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
};

const getTransactionsById = async (req, res) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        const transaction = await Transaction.findOne({_id: id, user: userId});

        if (!transaction) return res.status(404).json({error: 'Transaction not found'});

        return res.status(200).json({transaction});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
};

const updateTransaction = async (req, res) => {
    try {
    const id = req.params.id;
    const userId = req.user.id;
    
    const updateTransaction = await Transaction.findOneAndUpdate({_id: id, user: userId}, req.body, {new: true});

    if (!updateTransaction) return res.status(404).json({ error: "Transaction not found" });
    

    return res.status(200).json({transaction: updateTransaction});

    } catch (e) {
        return res.status(500).json({error: e.message});
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;

        const delTransaction = await Transaction.findOneAndDelete({_id: id, user: userId});

        if (!delTransaction) return res.status(404).json({ error: "Transaction not found" });

        return res.status(200).json({message: 'Transaction deleted successfully'});

    } catch (e) {
        return res.status(500).json({error: e.message});
    }
};

const getMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.query;

    const summary = await getMonthlySummaryService(
      req.user.id,
      Number(month),
      Number(year)
    );

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTransaction, getTransactions, getTransactionsById, updateTransaction, deleteTransaction, getMonthlySummary };