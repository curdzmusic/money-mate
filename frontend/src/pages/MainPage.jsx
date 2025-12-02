
import React, { useState, useEffect } from "react";
import Header from '../components/Header';
import Toast from '../components/Toast';
import Dashboard from '../components/Dashboard';

function HomePage({ user, onLogout, userBalance, transactions, onRefreshData }) {
  return (
    <main className="p-8 text-center">
      {user ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Xin chào, {user.name}!</h2>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Đăng xuất
            </button>
          </div>

          <div className="bg-blue-100 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-2">Thông tin tài khoản</h3>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Số dư hiện tại:</span>
              <span className={`ml-2 font-bold ${userBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {userBalance?.toLocaleString('vi-VN')} VNĐ
              </span>
            </p>
            <button
              onClick={onRefreshData}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Làm mới dữ liệu
            </button>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Giao dịch gần đây</h3>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction, index) => (
                  <div
                    key={transaction._id || index}
                    className="flex justify-between items-center bg-white p-3 rounded shadow"
                  >
                    <div className="text-left">
                      <p className="font-medium">{transaction.description || transaction.category}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{transaction.amount?.toLocaleString('vi-VN')} VNĐ
                      </p>
                      <p className="text-sm text-gray-500">{transaction.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Chưa có giao dịch nào</p>
            )}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">
            Chào mừng bạn đến với ứng dụng quản lý tài chính cá nhân!
          </h2>
          <p>Ứng dụng giúp bạn theo dõi thu chi, lập kế hoạch tài chính và đạt được mục tiêu cá nhân.</p>
        </>
      )}
    </main>
  );
}

export default function MainPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });
  const [toast, setToast] = useState({ message: "", type: "info" });

  const [user, setUser] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      fetchUserData(savedToken);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      // Fetch user profile to get updated balance
      const profileRes = await fetch("http://localhost:5000/api/auth/profile", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          setUserBalance(profileData.data.totalBalance || 0);
          // Update user in localStorage with latest data
          localStorage.setItem("user", JSON.stringify(profileData.data));
          setUser(profileData.data);
        }
      }

      // Fetch recent transactions
      const transactionsRes = await fetch("http://localhost:5000/api/transactions?limit=5", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        if (transactionsData.success) {
          setTransactions(transactionsData.data.transactions || []);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu người dùng:", err);
      setToast({ message: "Không thể tải dữ liệu người dùng", type: "error" });
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setToast({ message: data.message, type: "success" });
        const user = data.data.user;
        const token = data.data.token;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);
        setUserBalance(user.totalBalance || 0);
        setShowLogin(false);

        // Clear login form
        setLoginData({ email: "", password: "" });

        // Fetch additional user data
        fetchUserData(token);
      } else {
        setToast({ message: data.message, type: "error" });
      }
    } catch (err) {
      setToast({ message: "Đã xảy ra lỗi khi đăng nhập: " + err, type: "error" });
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setToast({ message: data.message, type: "success" });
        setShowRegister(false);
        // Clear register form
        setRegisterData({ name: "", email: "", password: "" });
        // Auto login after successful registration
        setLoginData({ email: registerData.email, password: registerData.password });
        setTimeout(() => {
          setToast({ message: "Đăng ký thành công! Đang đăng nhập...", type: "success" });
          handleLogin();
        }, 1000);
      } else {
        setToast({ message: data.message, type: "error" });
      }
    } catch (err) {
      setToast({ message: "Đã xảy ra lỗi khi đăng ký: " + err, type: "error" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setUserBalance(0);
    setTransactions([]);
    setToast({ message: "Đã đăng xuất thành công", type: "success" });
  };

  const handleRefreshData = () => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserData(token);
      setToast({ message: "Đã làm mới dữ liệu", type: "success" });
    }
  };

  return (
    <div>
      <Header
        onLogin={() => setShowLogin(true)}
        onRegister={() => setShowRegister(true)}
        user={user}
      />
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <HomePage
          user={user}
          onLogout={handleLogout}
          userBalance={userBalance}
          transactions={transactions}
          onRefreshData={handleRefreshData}
        />
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />

      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 backdrop-blur-sm">
          <div className="bg-gray-800 p-10 rounded-2xl w-full max-w-md mx-4 shadow-2xl transform transition-all duration-300 border border-gray-700">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-900 bg-opacity-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Đăng nhập</h3>
              <p className="text-gray-300">Chào mừng bạn quay trở lại!</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mật khẩu</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu của bạn"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                className="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={handleLogin}
              >
                Đăng nhập
              </button>
              <button
                className="flex-1 py-3 px-6 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors duration-200"
                onClick={() => {
                  setShowLogin(false);
                  setLoginData({ email: "", password: "" });
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 backdrop-blur-sm">
          <div className="bg-gray-800 p-10 rounded-2xl w-full max-w-md mx-4 shadow-2xl transform transition-all duration-300 border border-gray-700">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-900 bg-opacity-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Đăng ký</h3>
              <p className="text-gray-300">Tạo tài khoản mới để bắt đầu!</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Họ tên</label>
                <input
                  type="text"
                  placeholder="Nhập họ tên của bạn"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-green-500 focus:outline-none transition-colors duration-200 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-green-500 focus:outline-none transition-colors duration-200 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mật khẩu</label>
                <input
                  type="password"
                  placeholder="Tạo mật khẩu mạnh"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-green-500 focus:outline-none transition-colors duration-200 text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                className="flex-1 py-3 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={handleRegister}
              >
                Đăng ký
              </button>
              <button
                className="flex-1 py-3 px-6 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors duration-200"
                onClick={() => {
                  setShowRegister(false);
                  setRegisterData({ name: "", email: "", password: "" });
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
