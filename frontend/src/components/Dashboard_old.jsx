import React, { useState, useEffect } from 'react';
import Toast from './Toast';

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [userBalance, setUserBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // Add Money Form State
  const [addMoneyData, setAddMoneyData] = useState({
    amount: '',
    description: 'Nạp tiền vào tài khoản'
  });

  // Transaction Form State
  const [transactionData, setTransactionData] = useState({
    type: 'expense',
    amount: '',
    category: 'other',
    description: ''
  });

  // Categories
  const expenseCategories = ['food', 'transport', 'entertainment', 'bills', 'shopping', 'health', 'education', 'other'];
  const incomeCategories = ['salary', 'freelance', 'investment', 'gift', 'other'];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch user profile
      const profileRes = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          setUserBalance(profileData.data.totalBalance || 0);
        }
      }

      // Fetch transactions
      const transactionsRes = await fetch('http://localhost:5000/api/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        if (transactionsData.success) {
          setTransactions(transactionsData.data.transactions || []);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
      setToast({ message: 'Không thể tải dữ liệu', type: 'error' });
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();

    // Client-side validation
    const amount = parseFloat(addMoneyData.amount);
    if (!addMoneyData.amount || isNaN(amount) || amount <= 0) {
      setToast({ message: 'Vui lòng nhập số tiền hợp lệ', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({ message: 'Vui lòng đăng nhập lại', type: 'error' });
        return;
      }

      console.log('Sending add money request:', addMoneyData);

      const res = await fetch('http://localhost:5000/api/transactions/add-money', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          description: addMoneyData.description || 'Nạp tiền vào tài khoản'
        })
      });

      const data = await res.json();
      console.log('Add money response:', data);

      if (res.ok && data.success) {
        setToast({ message: data.message, type: 'success' });
        setUserBalance(data.data.newBalance);
        setAddMoneyData({ amount: '', description: 'Nạp tiền vào tài khoản' });
        fetchUserData(); // Refresh data
      } else {
        if (res.status === 401) {
          setToast({ message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', type: 'error' });
        } else {
          setToast({ message: data.message || 'Có lỗi xảy ra', type: 'error' });
        }
      }
    } catch (err) {
      console.error('Add money error:', err);
      setToast({ message: 'Đã xảy ra lỗi khi nạp tiền: ' + err.message, type: 'error' });
    }
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToast({ message: data.message, type: 'success' });
        setTransactionData({
          type: 'expense',
          amount: '',
          category: 'other',
          description: ''
        });
        fetchUserData(); // Refresh data
      } else {
        setToast({ message: data.message, type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Đã xảy ra lỗi khi tạo giao dịch', type: 'error' });
    }
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN') + ' VNĐ';
  };

  const categoryLabels = {
    food: 'Ăn uống',
    transport: 'Di chuyển',
    entertainment: 'Giải trí',
    bills: 'Hóa đơn',
    shopping: 'Mua sắm',
    health: 'Sức khỏe',
    education: 'Giáo dục',
    salary: 'Lương',
    freelance: 'Freelance',
    investment: 'Đầu tư',
    gift: 'Quà tặng',
    other: 'Khác'
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Xin chào, {user.name}!</span>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-6 text-white mb-8 shadow-lg">
          <h2 className="text-lg font-medium opacity-90">Số dư hiện tại</h2>
          <p className={`text-3xl font-bold mt-2 ${userBalance >= 0 ? 'text-white' : 'text-red-300'}`}>
            {formatCurrency(userBalance)}
          </p>
          <button
            onClick={fetchUserData}
            className="mt-4 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
          >
            Làm mới
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg mb-6">
          {[
            { id: 'overview', label: 'Tổng quan' },
            { id: 'add-money', label: 'Nạp tiền' },
            { id: 'transaction', label: 'Thêm giao dịch' },
            { id: 'history', label: 'Lịch sử' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                  ? 'bg-gray-700 text-white shadow'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 rounded-xl shadow-sm p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">Tổng quan tài khoản</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg border border-green-700">
                  <h4 className="font-medium text-green-300">Thu nhập tháng này</h4>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(
                      transactions
                        .filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth())
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </p>
                </div>
                <div className="bg-red-900 bg-opacity-50 p-4 rounded-lg border border-red-700">
                  <h4 className="font-medium text-red-300">Chi tiêu tháng này</h4>
                  <p className="text-2xl font-bold text-red-400">
                    {formatCurrency(
                      transactions
                        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </p>
                </div>
                <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg border border-blue-700">
                  <h4 className="font-medium text-blue-300">Tổng giao dịch</h4>
                  <p className="text-2xl font-bold text-blue-400">{transactions.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'add-money' && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">Nạp tiền vào tài khoản</h3>
              <form onSubmit={handleAddMoney} className="max-w-md">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Số tiền (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={addMoneyData.amount}
                    onChange={(e) => setAddMoneyData({ ...addMoneyData, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập số tiền cần nạp"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ghi chú (không bắt buộc)
                  </label>
                  <input
                    type="text"
                    value={addMoneyData.description}
                    onChange={(e) => setAddMoneyData({ ...addMoneyData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ví dụ: Nạp tiền từ thẻ ngân hàng"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Nạp tiền
                </button>
              </form>
            </div>
          )}

          {activeTab === 'transaction' && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">Thêm giao dịch mới</h3>
              <form onSubmit={handleCreateTransaction} className="max-w-md">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Loại giao dịch
                  </label>
                  <select
                    value={transactionData.type}
                    onChange={(e) => setTransactionData({
                      ...transactionData,
                      type: e.target.value,
                      category: e.target.value === 'income' ? 'salary' : 'other'
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="expense">Chi tiêu</option>
                    <option value="income">Thu nhập</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Số tiền (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={transactionData.amount}
                    onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập số tiền"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Danh mục
                  </label>
                  <select
                    value={transactionData.category}
                    onChange={(e) => setTransactionData({ ...transactionData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {(transactionData.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                      <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mô tả
                  </label>
                  <input
                    type="text"
                    value={transactionData.description}
                    onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mô tả giao dịch"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-2 px-4 font-medium rounded-lg transition-colors ${transactionData.type === 'income'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                >
                  {transactionData.type === 'income' ? 'Thêm thu nhập' : 'Thêm chi tiêu'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">Lịch sử giao dịch</h3>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex justify-between items-center p-4 bg-gray-700 rounded-lg border border-gray-600"
                    >
                      <div>
                        <p className="font-medium text-white">{transaction.description}</p>
                        <p className="text-sm text-gray-400">
                          {categoryLabels[transaction.category]} • {new Date(transaction.date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                          }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">Chưa có giao dịch nào</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
    </div>
  );
}