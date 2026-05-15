const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {validateTransaction} = require('../middleware/validation');
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getTransactionsById,
  getMonthlySummary
} = require("../controllers/transactionController");

router.use(authMiddleware);

router.post("/", validateTransaction, createTransaction);
router.get("/", getTransactions);
router.get("/:id", getTransactionsById);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);
router.get("/summary/monthly", getMonthlySummary);

module.exports = router;