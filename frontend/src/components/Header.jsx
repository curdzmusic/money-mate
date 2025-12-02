import React from 'react';

export default function LandingPage({ onLogin, onRegister, user }) {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
            <div className="text-center">
                <img src="src/assets/logo.png" alt="MoneyMate Logo" className="mx-auto mb-4 w-[150px] h-[150px]" />
                <h1 className="text-5xl font-extrabold mb-6">MoneyMate</h1>
                <p className="text-lg mb-8">
                    Theo dõi chi tiêu dễ dàng hơn cùng MoneyMate từ bây giờ!
                </p>
                {user ? (
                    <span className="text-gray-300">Xin chào, {user.name}!</span>
                ) : (
                    <>
                        <button
                            className="px-6 py-3 bg-gray-600 text-gray-100 font-semibold rounded-lg mb-4 hover:bg-gray-500 transition"
                            onClick={onRegister}
                        >
                            Đăng ký miễn phí
                        </button>
                        <button
                            className="px-6 py-3 bg-gray-600 text-gray-100 font-semibold rounded-lg hover:bg-gray-500 transition"
                            onClick={onLogin}
                        >
                            Đăng nhập ngay
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}