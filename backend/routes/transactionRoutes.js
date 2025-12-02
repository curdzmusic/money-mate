const express = require('express');
const { body, param } = require('express-validator');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getStatistics,
  addMoney
} = require('../controllers/transactionController');
const authMiddleware = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const transactionValidation = [
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Loại giao dịch phải là income hoặc expense'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Số tiền phải lớn hơn 0'),
  body('category')
    .isIn(['food', 'transport', 'entertainment', 'bills', 'shopping', 'health', 'education', 'salary', 'freelance', 'investment', 'gift', 'other'])
    .withMessage('Danh mục không hợp lệ'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Mô tả không được quá 200 ký tự')
];

// ID validation
const idValidation = [
  param('id').isMongoId().withMessage('ID không hợp lệ')
];

// Add money validation
const addMoneyValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Số tiền phải lớn hơn 0'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Mô tả không được quá 200 ký tự')
];

// Apply auth middleware to all routes
router.use(authMiddleware);

// Routes với path đúng format
router.get('/', getTransactions);
router.get('/statistics', getStatistics);
router.post('/', transactionValidation, validateRequest, createTransaction);
router.post('/add-money', addMoneyValidation, validateRequest, addMoney);
router.put('/:id', idValidation, transactionValidation, validateRequest, updateTransaction);
router.delete('/:id', idValidation, validateRequest, deleteTransaction);

module.exports = router;