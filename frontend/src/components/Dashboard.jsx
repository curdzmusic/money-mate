import React, { useState, useEffect } from 'react';
import Toast from './Toast';

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [userBalance, setUserBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Money Form State
  const [addMoneyData, setAddMoneyData] = useState({
    amount: '',
    description: 'Nạp tiền vào tài khoản'
  });

  // Transaction Form State
  const [transactionData, setTransactionData] = useState({
    type: 'expense',
    amount: '',
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Categories
  const expenseCategories = ['food', 'transport', 'entertainment', 'bills', 'shopping', 'health', 'education', 'other'];
  const incomeCategories = ['salary', 'freelance', 'investment', 'gift', 'other'];

  // Add these new states near the top with other state declarations
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({ message: 'Vui lòng đăng nhập lại', type: 'error' });
        return;
      }

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
          // Update user in localStorage with latest data
          localStorage.setItem('user', JSON.stringify(profileData.data));
        }
      } else if (profileRes.status === 401) {
        setToast({ message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', type: 'error' });
        onLogout();
        return;
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
      } else if (transactionsRes.status === 401) {
        setToast({ message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', type: 'error' });
        onLogout();
        return;
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
      setToast({ message: 'Không thể tải dữ liệu người dùng', type: 'error' });
    }
  };
  const handleAddMoney = async (e) => {
    e.preventDefault();

    // Client-side validation
    const amount = parseFloat(addMoneyData.amount);
    if (!addMoneyData.amount || isNaN(amount) || amount <= 0) {
      setToast({ message: 'Vui lòng nhập số tiền hợp lệ (lớn hơn 0)', type: 'error' });
      return;
    }

    if (amount > 999999999) {
      setToast({ message: 'Số tiền quá lớn', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({ message: 'Vui lòng đăng nhập lại', type: 'error' });
        onLogout();
        return;
      }

      console.log('Sending add money request:', {
        amount: amount,
        description: addMoneyData.description || 'Nạp tiền vào tài khoản'
      });

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
        setToast({ message: data.message || 'Nạp tiền thành công', type: 'success' });
        setUserBalance(data.data.newBalance);
        setAddMoneyData({ amount: '', description: 'Nạp tiền vào tài khoản' });
        fetchUserData(); // Refresh data
      } else {
        if (res.status === 401) {
          setToast({ message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', type: 'error' });
          onLogout();
        } else {
          setToast({ message: data.message || 'Có lỗi xảy ra khi nạp tiền', type: 'error' });
        }
      }
    } catch (err) {
      console.error('Add money error:', err);
      setToast({ message: 'Đã xảy ra lỗi khi nạp tiền: ' + err.message, type: 'error' });
    }
  };
  const handleCreateTransaction = async (e) => {
    e.preventDefault();

    // Validation
    const amount = parseFloat(transactionData.amount);
    if (!transactionData.amount || isNaN(amount) || amount <= 0) {
      setToast({ message: 'Vui lòng nhập số tiền hợp lệ', type: 'error' });
      return;
    }

    if (!transactionData.description.trim()) {
      setToast({ message: 'Vui lòng nhập mô tả giao dịch', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({ message: 'Vui lòng đăng nhập lại', type: 'error' });
        return;
      }

      const res = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: transactionData.type,
          amount: amount,
          category: transactionData.category,
          description: transactionData.description.trim(),
          date: new Date(transactionData.date).toISOString()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToast({ message: data.message || 'Thêm giao dịch thành công', type: 'success' });
        
        // Reset form
        setTransactionData({
          type: 'expense',
          amount: '',
          category: 'food',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });

        // Update transactions list with the new transaction
        setTransactions(prevTransactions => [data.data, ...prevTransactions]);

        // Fetch user profile to update balance
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
      } else {
        if (res.status === 401) {
          setToast({ message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', type: 'error' });
          onLogout();
        } else {
          setToast({ message: data.message || 'Có lỗi xảy ra khi thêm giao dịch', type: 'error' });
        }
      }
    } catch (err) {
      console.error('Create transaction error:', err);
      setToast({ message: 'Đã xảy ra lỗi khi tạo giao dịch: ' + err.message, type: 'error' });
    }
  };

  // Edit Transaction Handler
  const handleEditTransaction = async (e) => {
    e.preventDefault();

    // Validation
    const amount = parseFloat(editingTransaction.amount);
    if (!editingTransaction.amount || isNaN(amount) || amount <= 0) {
      setToast({ message: 'Vui lòng nhập số tiền hợp lệ', type: 'error' });
      return;
    }

    if (!editingTransaction.description.trim()) {
      setToast({ message: 'Vui lòng nhập mô tả giao dịch', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({ message: 'Vui lòng đăng nhập lại', type: 'error' });
        return;
      }

      const res = await fetch(`http://localhost:5000/api/transactions/${editingTransaction._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: editingTransaction.type,
          amount: amount,
          category: editingTransaction.category,
          description: editingTransaction.description.trim(),
          date: new Date(editingTransaction.date).toISOString()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToast({ message: data.message || 'Cập nhật giao dịch thành công', type: 'success' });
        
        // Close edit mode
        setEditingTransaction(null);

        // Refresh data
        await fetchUserData();

        // Set active tab to history
        setActiveTab('history');
      } else {
        if (res.status === 401) {
          setToast({ message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', type: 'error' });
          onLogout();
        } else {
          setToast({ message: data.message || 'Có lỗi xảy ra khi cập nhật giao dịch', type: 'error' });
        }
      }
    } catch (err) {
      console.error('Edit transaction error:', err);
      setToast({ message: 'Đã xảy ra lỗi khi cập nhật giao dịch: ' + err.message, type: 'error' });
    }
  };

  // Add this new function before the return statement
  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giao dịch này không?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({ message: 'Vui lòng đăng nhập lại', type: 'error' });
        return;
      }

      const res = await fetch(`http://localhost:5000/api/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToast({ message: 'Xóa giao dịch thành công', type: 'success' });
        
        // Close edit mode
        setEditingTransaction(null);

        // Refresh data
        await fetchUserData();
      } else {
        if (res.status === 401) {
          setToast({ message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', type: 'error' });
          onLogout();
        } else {
          setToast({ message: data.message || 'Có lỗi xảy ra khi xóa giao dịch', type: 'error' });
        }
      }
    } catch (err) {
      console.error('Delete transaction error:', err);
      setToast({ message: 'Đã xảy ra lỗi khi xóa giao dịch: ' + err.message, type: 'error' });
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
    <div className="min-h-screen bg-black flex">
      {/* Sidebar Navigation */}
      <div className="w-80 bg-gray-800 shadow-lg flex flex-col border-r border-gray-700">
        {/* User Info Section */}
        <div className="p-6 border-b border-gray-700">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
            <p className="text-sm text-gray-400 mb-4">{user.email}</p>

            {/* Balance Display */}
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg p-4 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-1">Số dư hiện tại</h3>
              <p className={`text-2xl font-bold ${userBalance >= 0 ? 'text-white' : 'text-red-300'}`}>
                {formatCurrency(userBalance)}
              </p>
              <button
                onClick={fetchUserData}
                className="mt-3 w-full py-2 px-3 bg-white bg-opacity-20 text-white text-sm rounded-md hover:bg-opacity-30 transition-colors"
              >
                🔄 Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-4">
          <nav className="space-y-3">
            {[
              { id: 'overview', label: 'Tổng quan', icon: '📊', desc: 'Xem tổng quan tài chính' },
              { id: 'transaction', label: 'Giao dịch', icon: '➕', desc: 'Thêm giao dịch mới' },
              { id: 'history', label: 'Lịch sử', icon: '📝', desc: 'Xem lịch sử giao dịch' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700 hover:shadow-md'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{tab.icon}</span>
                  <div>
                    <div className="font-semibold">{tab.label}</div>
                    <div className="text-xs opacity-75">{tab.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-green-900 bg-opacity-50 p-3 rounded-lg border border-green-700">
              <div className="text-xs text-green-400 mb-1">Thu nhập tháng</div>
              <div className="text-sm font-bold text-green-300">
                {formatCurrency(
                  transactions
                    .filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth())
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </div>
            </div>
            <div className="bg-red-900 bg-opacity-50 p-3 rounded-lg border border-red-700">
              <div className="text-xs text-red-400 mb-1">Chi tiêu tháng</div>
              <div className="text-sm font-bold text-red-300">
                {formatCurrency(
                  transactions
                    .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center space-x-2 shadow-md"
          >
            <span>🚪</span>
            <span className="font-semibold">Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-gray-800 shadow-lg border-b border-gray-700 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {activeTab === 'overview' && '📊 Tổng quan tài chính'}
                {activeTab === 'transaction' && '➕ Thêm giao dịch mới'}
                {activeTab === 'history' && '📝 Lịch sử giao dịch'}
              </h1>
              <p className="text-gray-400">
                {activeTab === 'overview' && 'Xem tổng quan về tình hình tài chính của bạn'}
                {activeTab === 'transaction' && 'Ghi lại các giao dịch thu chi của bạn'}
                {activeTab === 'history' && 'Xem lại tất cả các giao dịch đã thực hiện'}
              </p>
            </div>
            <div className="text-right bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Hôm nay</p>
              <p className="text-white font-bold text-lg">{new Date().toLocaleDateString('vi-VN')}</p>
              <p className="text-xs text-gray-500">{new Date().toLocaleTimeString('vi-VN')}</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto bg-black">
          {activeTab === 'overview' && (
            <div className="flex gap-8">
              {/* Left side - Calendar and Stats */}
              <div className="flex-1 space-y-6">
                {/* Calendar Section */}
                <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-white">Ngày:</h3>
                    <div className="flex items-center gap-1">
                      <button className="text-gray-400 hover:text-white px-1">&lt;</button>
                      <input
                        type="month"
                        value={new Date().toISOString().slice(0, 7)}
                        className="bg-gray-700 text-white text-sm px-2 py-1 rounded-lg border border-gray-600"
                      />
                      <button className="text-gray-400 hover:text-white px-1">&gt;</button>
                    </div>
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                      <div key={day} className="text-xs font-medium text-gray-400 py-0.5">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {Array(35).fill(null).map((_, index) => (
                      <button
                        key={index}
                        className={`aspect-square rounded text-xs p-0.5 
                          ${index === 18 ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-300">Thu nhập tháng này</h4>
                        <p className="text-2xl font-bold text-green-400 mt-2">
                          {formatCurrency(
                            transactions
                              .filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth())
                              .reduce((sum, t) => sum + t.amount, 0)
                          )}
                        </p>
                      </div>
                      <div className="text-4xl opacity-80">📈</div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-300">Chi tiêu tháng này</h4>
                        <p className="text-2xl font-bold text-red-400 mt-2">
                          {formatCurrency(
                            transactions
                              .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
                              .reduce((sum, t) => sum + t.amount, 0)
                          )}
                        </p>
                      </div>
                      <div className="text-4xl opacity-80">📉</div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-300">Tổng:</h4>
                        <p className="text-2xl font-bold text-gray-100 mt-2">
                          {formatCurrency(
                            transactions
                              .filter(t => new Date(t.date).getMonth() === new Date().getMonth())
                              .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
                          )}
                        </p>
                      </div>
                      <div className="text-4xl opacity-80">📊</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Recent Transactions */}
              <div className="flex-1">
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg h-full">
                  <h3 className="text-xl font-bold text-white mb-6">Lịch sử chi tiêu:</h3>
                  {transactions.length > 0 ? (
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div
                          key={transaction._id}
                          className="flex justify-between items-center p-4 bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.type === 'income' ? 'bg-green-600' : 'bg-red-600'
                            }`}>
                              <span className="text-white font-bold">
                                {transaction.type === 'income' ? '+' : '-'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{transaction.description}</p>
                              <p className="text-sm text-gray-400">
                                {categoryLabels[transaction.category]} • {new Date(transaction.date).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-lg ${
                              transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📝</div>
                      <p className="text-gray-400 text-lg">Chưa có giao dịch nào</p>
                      <p className="text-gray-500 text-sm">Hãy thêm giao dịch đầu tiên của bạn!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transaction' && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
                <div className="flex gap-8">
                  {/* Left side - Transaction input */}
                  <form onSubmit={handleCreateTransaction} className="flex gap-8 w-full">
                    <div className="flex-1 space-y-6">
                      {/* Transaction Type Tabs */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTransactionData(prev => ({ ...prev, type: 'expense' }))}
                          className={`flex-1 py-3 px-4 rounded-lg font-bold text-lg transition-all ${
                            transactionData.type === 'expense'
                              ? 'bg-gray-600 text-white'
                              : 'bg-gray-700 text-gray-400'
                          }`}
                        >
                          TIỀN CHI
                        </button>
                        <button
                          type="button"
                          onClick={() => setTransactionData(prev => ({ ...prev, type: 'income' }))}
                          className={`flex-1 py-3 px-4 rounded-lg font-bold text-lg transition-all ${
                            transactionData.type === 'income'
                              ? 'bg-gray-600 text-white'
                              : 'bg-gray-700 text-gray-400'
                          }`}
                        >
                          TIỀN THU
                        </button>
                      </div>

                      {/* Date Input */}
                      <div>
                        <label className="block text-lg font-medium text-gray-300 mb-3">
                          📅 Ngày:
                        </label>
                        <input
                          type="date"
                          value={transactionData.date || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setTransactionData({ ...transactionData, date: e.target.value })}
                          className="w-full px-4 py-4 bg-gray-700 border border-gray-600 text-white text-lg rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                        />
                      </div>

                      {/* Description Input */}
                      <div>
                        <label className="block text-lg font-medium text-gray-300 mb-3">
                          📝 Ghi chú:
                        </label>
                        <input
                          type="text"
                          value={transactionData.description}
                          onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })}
                          className="w-full px-4 py-4 bg-gray-700 border border-gray-600 text-white text-lg rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                          placeholder="Nhập ghi chú"
                          required
                        />
                      </div>

                      {/* Amount Input */}
                      <div>
                        <label className="block text-lg font-medium text-gray-300 mb-3">
                          💰 Số tiền:
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={transactionData.amount}
                          onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })}
                          className="w-full px-4 py-4 bg-gray-700 border border-gray-600 text-white text-lg rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                          placeholder="500.000"
                          required
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className={`w-full py-4 px-6 font-bold text-lg rounded-lg transition-all transform hover:scale-105 shadow-lg ${
                          transactionData.type === 'income'
                            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                            : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
                        }`}
                      >
                        Nhập khoản {transactionData.type === 'income' ? 'thu' : 'chi'}
                      </button>
                    </div>

                    {/* Right side - Categories */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-6">Chọn danh mục:</h3>
                      <div className="grid grid-cols-4 gap-4">
                        {(transactionData.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setTransactionData({ ...transactionData, category: cat })}
                            className={`aspect-square p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                              transactionData.category === cat
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {cat === 'food' && '🍽️'}
                            {cat === 'transport' && '🚌'}
                            {cat === 'entertainment' && '🎮'}
                            {cat === 'bills' && '📄'}
                            {cat === 'shopping' && '🛍️'}
                            {cat === 'health' && '🏥'}
                            {cat === 'education' && '📚'}
                            {cat === 'salary' && '💰'}
                            {cat === 'freelance' && '💻'}
                            {cat === 'investment' && '📈'}
                            {cat === 'gift' && '🎁'}
                            {cat === 'other' && '📦'}
                            <span className="text-sm font-medium text-center">{categoryLabels[cat]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <span>📝</span>
                    <span>Lịch sử giao dịch</span>
                  </h3>
                  <div className="text-gray-400">
                    Tổng: <span className="font-bold text-white">{transactions.length}</span> giao dịch
                  </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm theo ghi chú..."
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      🔍
                    </span>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex flex-wrap gap-4">
                    {/* Type Filter */}
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Loại giao dịch
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, type: 'all' }))}
                          className={`flex-1 py-2 px-3 rounded font-medium transition-all ${
                            filters.type === 'all'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          }`}
                        >
                          Tất cả
                        </button>
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, type: 'expense' }))}
                          className={`flex-1 py-2 px-3 rounded font-medium transition-all ${
                            filters.type === 'expense'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          }`}
                        >
                          Chi tiêu
                        </button>
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, type: 'income' }))}
                          className={`flex-1 py-2 px-3 rounded font-medium transition-all ${
                            filters.type === 'income'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          }`}
                        >
                          Thu nhập
                        </button>
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div className="w-[66%] min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Danh mục
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Tất cả danh mục</option>
                        <optgroup label="Chi tiêu">
                          {expenseCategories.map(cat => (
                            <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Thu nhập">
                          {incomeCategories.map(cat => (
                            <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    {/* Date Filter */}
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Thời gian
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                          className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-400">đến</span>
                        <input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                          className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Reset Filters Button */}
                    <div className="flex items-end">
                      <button
                        onClick={() => setFilters({
                          type: 'all',
                          category: 'all',
                          startDate: '',
                          endDate: ''
                        })}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                      >
                        🔄
                      </button>
                    </div>
                  </div>
                </div>

                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions
                      .filter(transaction => {
                        // Search query filter
                        if (!transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                          return false;
                        }
                        
                        // Type filter
                        if (filters.type !== 'all' && transaction.type !== filters.type) {
                          return false;
                        }

                        // Category filter
                        if (filters.category !== 'all' && transaction.category !== filters.category) {
                          return false;
                        }

                        // Date filter
                        if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) {
                          return false;
                        }
                        if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate + 'T23:59:59')) {
                          return false;
                        }

                        return true;
                      })
                      .map((transaction) => (
                      <div
                        key={transaction._id}
                        className="flex justify-between items-center p-5 bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors"
                      >
                        {editingTransaction?._id === transaction._id ? (
                          // Edit Mode
                          <form onSubmit={handleEditTransaction} className="w-full space-y-4">
                            <div className="flex gap-4">
                              {/* Type Selection */}
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Loại giao dịch</label>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingTransaction({...editingTransaction, type: 'expense'})}
                                    className={`flex-1 py-2 px-3 rounded font-medium transition-all ${
                                      editingTransaction.type === 'expense'
                                        ? 'bg-gray-600 text-white'
                                        : 'bg-gray-700 text-gray-300'
                                    }`}
                                  >
                                    Chi tiêu
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingTransaction({...editingTransaction, type: 'income'})}
                                    className={`flex-1 py-2 px-3 rounded font-medium transition-all ${
                                      editingTransaction.type === 'income'
                                        ? 'bg-gray-600 text-white'
                                        : 'bg-gray-700 text-gray-300'
                                    }`}
                                  >
                                    Thu nhập
                                  </button>
                                </div>
                              </div>

                              {/* Amount Input */}
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Số tiền</label>
                                <input
                                  type="number"
                                  value={editingTransaction.amount}
                                  onChange={(e) => setEditingTransaction({
                                    ...editingTransaction,
                                    amount: e.target.value
                                  })}
                                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded focus:ring-2 focus:ring-gray-500"
                                  required
                                />
                              </div>

                              {/* Date Input */}
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Ngày</label>
                                <input
                                  type="date"
                                  value={editingTransaction.date.split('T')[0]}
                                  onChange={(e) => setEditingTransaction({
                                    ...editingTransaction,
                                    date: e.target.value
                                  })}
                                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded focus:ring-2 focus:ring-gray-500"
                                />
                              </div>
                            </div>

                            <div className="flex gap-4">
                              {/* Description Input */}
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Ghi chú</label>
                                <input
                                  type="text"
                                  value={editingTransaction.description}
                                  onChange={(e) => setEditingTransaction({
                                    ...editingTransaction,
                                    description: e.target.value
                                  })}
                                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded focus:ring-2 focus:ring-gray-500"
                                  required
                                />
                              </div>

                              {/* Category Selection */}
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Danh mục</label>
                                <select
                                  value={editingTransaction.category}
                                  onChange={(e) => setEditingTransaction({
                                    ...editingTransaction,
                                    category: e.target.value
                                  })}
                                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white rounded focus:ring-2 focus:ring-gray-500"
                                >
                                  {(editingTransaction.type === 'income' ? incomeCategories : expenseCategories)
                                    .map(cat => (
                                      <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                                    ))
                                  }
                                </select>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                              <button
                                type="button"
                                onClick={() => handleDeleteTransaction(editingTransaction._id)}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                              >
                                🗑️ Xóa
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingTransaction(null)}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                              >
                                Hủy
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                              >
                                Lưu thay đổi
                              </button>
                            </div>
                          </form>
                        ) : (
                          // View Mode
                          <>
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-600' : 'bg-red-600'
                                }`}>
                                <span className="text-white font-bold text-lg">
                                  {transaction.type === 'income' ? '+' : '-'}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-white text-lg">{transaction.description}</p>
                                <p className="text-sm text-gray-400">
                                  📋 {categoryLabels[transaction.category]} • 📅 {new Date(transaction.date).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className={`font-bold text-xl ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  🕒 {new Date(transaction.date).toLocaleTimeString('vi-VN')}
                                </p>
                              </div>
                              <button
                                onClick={() => setEditingTransaction(transaction)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                              >
                                ✏️
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-8xl mb-6">📄</div>
                    <p className="text-gray-400 text-xl mb-2">Chưa có giao dịch nào</p>
                    <p className="text-gray-500">Hãy bắt đầu bằng cách thêm giao dịch đầu tiên!</p>
                    <button
                      onClick={() => setActiveTab('transaction')}
                      className="mt-6 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                    >
                      ➕ Thêm giao dịch ngay
                    </button>
                  </div>
                )}
              </div>
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