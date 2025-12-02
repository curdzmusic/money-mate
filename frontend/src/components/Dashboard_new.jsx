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
        <div className="min-h-screen bg-gray-900 flex">
            {/* Sidebar Navigation */}
            <div className="w-80 bg-gray-800 shadow-lg flex flex-col border-r border-gray-700">
                {/* User Info Section */}
                <div className="p-6 border-b border-gray-700">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <span className="text-2xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
                        <p className="text-sm text-gray-400 mb-4">{user.email}</p>

                        {/* Balance Display */}
                        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4 text-white">
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
                            { id: 'add-money', label: 'Nạp tiền', icon: '💰', desc: 'Nạp tiền vào tài khoản' },
                            { id: 'transaction', label: 'Giao dịch', icon: '➕', desc: 'Thêm giao dịch mới' },
                            { id: 'history', label: 'Lịch sử', icon: '📝', desc: 'Xem lịch sử giao dịch' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
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
                        className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 shadow-md"
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
                                {activeTab === 'add-money' && '💰 Nạp tiền vào tài khoản'}
                                {activeTab === 'transaction' && '➕ Thêm giao dịch mới'}
                                {activeTab === 'history' && '📝 Lịch sử giao dịch'}
                            </h1>
                            <p className="text-gray-400">
                                {activeTab === 'overview' && 'Xem tổng quan về tình hình tài chính của bạn'}
                                {activeTab === 'add-money' && 'Nạp thêm tiền vào tài khoản để sử dụng'}
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
                <div className="flex-1 p-8 overflow-y-auto bg-gray-900">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-xl text-white shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-lg font-medium opacity-90">Thu nhập tháng này</h4>
                                            <p className="text-3xl font-bold mt-2">
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

                                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-xl text-white shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-lg font-medium opacity-90">Chi tiêu tháng này</h4>
                                            <p className="text-3xl font-bold mt-2">
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

                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl text-white shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-lg font-medium opacity-90">Tổng giao dịch</h4>
                                            <p className="text-3xl font-bold mt-2">{transactions.length}</p>
                                        </div>
                                        <div className="text-4xl opacity-80">📊</div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-white mb-4">🕒 Giao dịch gần đây</h3>
                                {transactions.length > 0 ? (
                                    <div className="space-y-3">
                                        {transactions.slice(0, 5).map((transaction) => (
                                            <div
                                                key={transaction._id}
                                                className="flex justify-between items-center p-4 bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-600' : 'bg-red-600'
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
                                                    <p className={`font-bold text-lg ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
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
                    )}

                    {activeTab === 'add-money' && (
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
                                <div className="text-center mb-8">
                                    <div className="text-6xl mb-4">💰</div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Nạp tiền vào tài khoản</h3>
                                    <p className="text-gray-400">Thêm tiền vào tài khoản để quản lý chi tiêu</p>
                                </div>

                                <form onSubmit={handleAddMoney} className="space-y-6">
                                    <div>
                                        <label className="block text-lg font-medium text-gray-300 mb-3">
                                            💵 Số tiền (VNĐ)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={addMoneyData.amount}
                                            onChange={(e) => setAddMoneyData({ ...addMoneyData, amount: e.target.value })}
                                            className="w-full px-4 py-4 bg-gray-700 border border-gray-600 text-white text-lg rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Nhập số tiền cần nạp"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-lg font-medium text-gray-300 mb-3">
                                            📝 Ghi chú (không bắt buộc)
                                        </label>
                                        <input
                                            type="text"
                                            value={addMoneyData.description}
                                            onChange={(e) => setAddMoneyData({ ...addMoneyData, description: e.target.value })}
                                            className="w-full px-4 py-4 bg-gray-700 border border-gray-600 text-white text-lg rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Ví dụ: Nạp tiền từ thẻ ngân hàng"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-lg rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg"
                                    >
                                        💰 Nạp tiền ngay
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'transaction' && (
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
                                <div className="text-center mb-8">
                                    <div className="text-6xl mb-4">➕</div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Thêm giao dịch mới</h3>
                                    <p className="text-gray-400">Ghi lại thu nhập hoặc chi tiêu của bạn</p>
                                </div>

                                <form onSubmit={handleCreateTransaction} className="space-y-6">
                                    <div>
                                        <label className="block text-lg font-medium text-gray-300 mb-3">
                                            🔄 Loại giao dịch
                                        </label>
                                        <select
                                            value={transactionData.type}
                                            onChange={(e) => setTransactionData({
                                                ...transactionData,
                                                type: e.target.value,
                                                category: e.target.value === 'income' ? 'salary' : 'other'
                                            })}
                                            className="w-full px-4 py-4 bg-gray-700 border border-gray-600 text-white text-lg rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            <option value="expense">💸 Chi tiêu</option>
                                            <option value="income">💵 Thu nhập</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-lg font-medium text-gray-300 mb-3">
                                            💰 Số tiền (VNĐ)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={transactionData.amount}
                                            onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })}
                                            className="w-full px-4 py-4 bg-gray-700 border border-gray-600 text-white text-lg rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Nhập số tiền"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-lg font-medium text-gray-300 mb-3">
                                            📋 Danh mục
                                        </label>
                                        <select
                                            value={transactionData.category}
                                            onChange={(e) => setTransactionData({ ...transactionData, category: e.target.value })}
                                            className="w-full px-4 py-4 bg-gray-700 border border-gray-600 text-white text-lg rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            {(transactionData.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                                                <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-lg font-medium text-gray-300 mb-3">
                                            📝 Mô tả
                                        </label>
                                        <input
                                            type="text"
                                            value={transactionData.description}
                                            onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })}
                                            className="w-full px-4 py-4 bg-gray-700 border border-gray-600 text-white text-lg rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Mô tả giao dịch"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className={`w-full py-4 px-6 font-bold text-lg rounded-lg transition-all transform hover:scale-105 shadow-lg ${transactionData.type === 'income'
                                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                                                : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
                                            }`}
                                    >
                                        {transactionData.type === 'income' ? '💵 Thêm thu nhập' : '💸 Thêm chi tiêu'}
                                    </button>
                                </form>
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

                                {transactions.length > 0 ? (
                                    <div className="space-y-4">
                                        {transactions.map((transaction) => (
                                            <div
                                                key={transaction._id}
                                                className="flex justify-between items-center p-5 bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-650 transition-colors"
                                            >
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
                                                <div className="text-right">
                                                    <p className={`font-bold text-xl ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                                                        }`}>
                                                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        🕒 {new Date(transaction.date).toLocaleTimeString('vi-VN')}
                                                    </p>
                                                </div>
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
                                            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
