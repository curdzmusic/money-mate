const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Get all transactions for user
// Add money to user account
const addMoney = async (req, res, next) => {
  try {
    const { amount, description = 'Nạp tiền vào tài khoản' } = req.body;
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền phải lớn hơn 0'
      });
    }

    // Create income transaction
    const transaction = new Transaction({
      userId: req.user._id,
      type: 'income',
      amount: numAmount,
      category: 'other',
      description: description
    });
    
    await transaction.save();

    // Update user balance
    const user = await User.findById(req.user._id);
    user.totalBalance += numAmount;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Nạp tiền thành công',
      data: {
        transaction,
        newBalance: user.totalBalance
      }
    });
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, type, startDate, endDate } = req.query;
    
    // Build filter
    const filter = { userId: req.user._id };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new transaction
const createTransaction = async (req, res, next) => {
  try {
    const transactionData = {
      ...req.body,
      userId: req.user._id
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();

    // Update user balance
    const user = await User.findById(req.user._id);
    if (transaction.type === 'income') {
      user.totalBalance += transaction.amount;
    } else {
      user.totalBalance -= transaction.amount;
    }
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Tạo giao dịch thành công',
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// Update transaction
const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const oldTransaction = await Transaction.findOne({ _id: id, userId: req.user._id });
    
    if (!oldTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }

    // Update transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    // Update user balance
    const user = await User.findById(req.user._id);
    
    // Revert old transaction
    if (oldTransaction.type === 'income') {
      user.totalBalance -= oldTransaction.amount;
    } else {
      user.totalBalance += oldTransaction.amount;
    }
    
    // Apply new transaction
    if (updatedTransaction.type === 'income') {
      user.totalBalance += updatedTransaction.amount;
    } else {
      user.totalBalance -= updatedTransaction.amount;
    }
    
    await user.save();

    res.json({
      success: true,
      message: 'Cập nhật giao dịch thành công',
      data: updatedTransaction
    });
  } catch (error) {
    next(error);
  }
};

// Delete transaction
const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOne({ _id: id, userId: req.user._id });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }

    // Update user balance
    const user = await User.findById(req.user._id);
    if (transaction.type === 'income') {
      user.totalBalance -= transaction.amount;
    } else {
      user.totalBalance += transaction.amount;
    }
    await user.save();

    // Delete transaction
    await Transaction.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Xóa giao dịch thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Get transaction statistics
const getStatistics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchFilter = { userId: req.user._id };
    if (startDate || endDate) {
      matchFilter.date = {};
      if (startDate) matchFilter.date.$gte = new Date(startDate);
      if (endDate) matchFilter.date.$lte = new Date(endDate);
    }

    const stats = await Transaction.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Transaction.aggregate([
      { $match: { ...matchFilter, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats,
        categoryBreakdown: categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getStatistics,
  addMoney
};