const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Loại giao dịch là bắt buộc']
  },
  amount: {
    type: Number,
    required: [true, 'Số tiền là bắt buộc'],
    min: [0.01, 'Số tiền phải lớn hơn 0']
  },
  category: {
    type: String,
    required: [true, 'Danh mục là bắt buộc'],
    enum: {
      values: ['food', 'transport', 'entertainment', 'bills', 'shopping', 'health', 'education', 'salary', 'freelance', 'investment', 'gift', 'other'],
      message: 'Danh mục không hợp lệ'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Mô tả không được quá 200 ký tự']
  },
  date: {
    type: Date,
    default: Date.now
  },
  tags: [String],
  isRecurring: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);