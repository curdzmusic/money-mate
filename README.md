# Hệ thống quản lý tài chính cá nhân 💰

**Ứng dụng giúp bạn theo dõi thu chi, lập kế hoạch tài chính và đạt được mục tiêu cá nhân**

[![Node.js 16+](https://img.shields.io/badge/node.js-16+-green.svg)](https://nodejs.org/)
[![Framework: Express](https://img.shields.io/badge/Framework-Express-blue.svg)](https://expressjs.com/)
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB-green.svg)](https://www.mongodb.com/)
[![Frontend: React](https://img.shields.io/badge/Frontend-React-blue.svg)](https://reactjs.org/)

Dự án này là một hệ thống quản lý tài chính cá nhân toàn diện, cho phép người dùng theo dõi các giao dịch thu chi hàng ngày, phân loại chi tiêu theo nhiều danh mục khác nhau, và xem tổng quan về tình hình tài chính của mình. Hệ thống được xây dựng với kiến trúc full-stack hiện đại, đảm bảo bảo mật và hiệu suất cao.

## ✨ Tính Năng Nổi Bật

- 🔐 **Xác thực người dùng an toàn**: Hệ thống đăng ký và đăng nhập với mã hóa mật khẩu bằng bcrypt và JWT token để bảo vệ thông tin người dùng.
- 💵 **Quản lý giao dịch thu chi**: Ghi lại và quản lý các giao dịch thu nhập và chi tiêu với đầy đủ thông tin như số tiền, danh mục, mô tả và ngày tháng.
- 📊 **Dashboard tổng quan**: Xem tổng quan về tài chính với số dư hiện tại, thu nhập và chi tiêu theo tháng, cùng với lịch sử giao dịch gần đây.
- 🏷️ **Phân loại đa dạng**: Hỗ trợ nhiều danh mục cho cả thu nhập (lương, freelance, đầu tư, quà tặng) và chi tiêu (ăn uống, di chuyển, giải trí, hóa đơn, mua sắm, sức khỏe, giáo dục).
- 🔍 **Tìm kiếm và lọc giao dịch**: Tìm kiếm giao dịch theo mô tả, lọc theo loại giao dịch, danh mục và khoảng thời gian.
- ✏️ **Chỉnh sửa và xóa giao dịch**: Dễ dàng cập nhật hoặc xóa các giao dịch đã tạo.
- 💰 **Nạp tiền vào tài khoản**: Tính năng nạp tiền để quản lý số dư ban đầu.
- 🔒 **Bảo mật cao**: Tích hợp các biện pháp bảo mật như Helmet, rate limiting, và CORS để bảo vệ API.
- 📱 **Giao diện hiện đại**: Giao diện web đẹp mắt, responsive với TailwindCSS, dễ sử dụng trên mọi thiết bị.

## 🛠️ Công Nghệ Sử Dụng

### Backend:
- **Node.js**: Môi trường runtime JavaScript.
- **Express.js**: Web framework để xây dựng RESTful API.
- **MongoDB**: Cơ sở dữ liệu NoSQL để lưu trữ dữ liệu người dùng và giao dịch.
- **Mongoose**: ODM (Object Data Modeling) cho MongoDB.
- **JWT (JSON Web Token)**: Xác thực và ủy quyền người dùng.
- **bcryptjs**: Mã hóa mật khẩu.
- **express-validator**: Xác thực dữ liệu đầu vào.
- **Helmet**: Bảo mật HTTP headers.
- **express-rate-limit**: Giới hạn số lượng request để chống DDoS.

### Frontend:
- **React**: Thư viện JavaScript để xây dựng giao diện người dùng.
- **Vite**: Build tool và dev server nhanh chóng.
- **TailwindCSS**: Framework CSS utility-first để thiết kế giao diện.
- **Axios**: Thư viện HTTP client để giao tiếp với API.
- **React Router DOM**: Điều hướng trong ứng dụng React.

## 🚀 Cài đặt & Khởi chạy

### Yêu cầu
- Node.js 16.0.0 trở lên
- MongoDB (cài đặt local hoặc sử dụng MongoDB Atlas)
- npm hoặc yarn

### Hướng dẫn cài đặt

1. **Clone repository về máy**
   ```bash
   git clone <your-repository-link>
   cd QLDA-cuoiki-main
   ```

2. **Cài đặt dependencies cho backend**
   ```bash
   cd backend
   npm install
   ```

3. **Cài đặt dependencies cho frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Cấu hình biến môi trường**

   Tạo file `.env` trong thư mục `backend` với nội dung:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/personal-finance
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```
   
   *LƯU Ý: Thay `your-secret-key-here` bằng một chuỗi bí mật mạnh cho JWT. Thay đổi `MONGO_URI` nếu bạn sử dụng MongoDB Atlas hoặc cấu hình khác.*

### Chạy chương trình

1. **Khởi động MongoDB**

   Đảm bảo MongoDB đang chạy trên máy của bạn. Nếu chưa cài đặt, bạn có thể:
   - Cài đặt MongoDB Community Edition từ [mongodb.com](https://www.mongodb.com/try/download/community)
   - Hoặc sử dụng MongoDB Atlas (cloud database)

2. **Khởi động Backend Server**

   Mở terminal và chạy:
   ```bash
   cd backend
   npm start
   ```
   
   Hoặc chạy ở chế độ development với nodemon:
   ```bash
   npm run dev
   ```
   
   Server sẽ chạy tại `http://localhost:5000`

3. **Khởi động Frontend Development Server**

   Mở terminal mới và chạy:
   ```bash
   cd frontend
   npm run dev
   ```
   
   Frontend sẽ chạy tại `http://localhost:5173`

4. **Truy cập ứng dụng**

   Mở trình duyệt web và truy cập vào địa chỉ sau để bắt đầu sử dụng:
   [http://localhost:5173](http://localhost:5173)

## 📂 Cấu Trúc Dự Án

```
QLDA-cuoiki-main/
├── README.md                   # File README
├── backend/                    # Thư mục backend
│   ├── config/
│   │   └── database.js         # Cấu hình kết nối MongoDB
│   ├── controllers/
│   │   ├── authController.js   # Xử lý logic đăng ký, đăng nhập
│   │   └── transactionController.js # Xử lý logic giao dịch
│   ├── middleware/
│   │   ├── auth.js             # Middleware xác thực JWT
│   │   ├── errorHandler.js     # Xử lý lỗi
│   │   └── validation.js       # Xử lý validation
│   ├── models/
│   │   ├── Transaction.js       # Model giao dịch
│   │   └── User.js              # Model người dùng
│   ├── routes/
│   │   ├── authRoutes.js       # Routes cho authentication
│   │   └── transactionRoutes.js # Routes cho transactions
│   ├── utils/
│   │   └── constants.js        # Các hằng số
│   ├── server.js               # File server chính
│   ├── package.json            # Dependencies backend
│   └── .env                    # Biến môi trường (tạo mới)
├── frontend/                   # Thư mục frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx   # Component dashboard chính
│   │   │   ├── Header.jsx       # Component header
│   │   │   └── Toast.jsx        # Component thông báo
│   │   ├── pages/
│   │   │   └── MainPage.jsx    # Trang chính
│   │   ├── App.jsx              # Component App chính
│   │   └── main.jsx             # Entry point
│   ├── package.json             # Dependencies frontend
│   └── vite.config.js           # Cấu hình Vite
└── package.json                 # Dependencies root (MongoDB driver)
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin profile (yêu cầu authentication)

### Transactions
- `GET /api/transactions` - Lấy danh sách giao dịch (yêu cầu authentication)
- `POST /api/transactions` - Tạo giao dịch mới (yêu cầu authentication)
- `PUT /api/transactions/:id` - Cập nhật giao dịch (yêu cầu authentication)
- `DELETE /api/transactions/:id` - Xóa giao dịch (yêu cầu authentication)
- `POST /api/transactions/add-money` - Nạp tiền vào tài khoản (yêu cầu authentication)
- `GET /api/transactions/statistics` - Lấy thống kê giao dịch (yêu cầu authentication)

### Health Check
- `GET /api/health` - Kiểm tra trạng thái server

## 🐛 Xử lý sự cố (Troubleshooting)

- **Lỗi `ModuleNotFoundError: No module named '...'`**:
  - Đảm bảo bạn đã chạy `npm install` trong cả thư mục `backend` và `frontend`.
  - Kiểm tra xem bạn đang ở đúng thư mục khi chạy lệnh.

- **Lỗi kết nối MongoDB**:
  - Kiểm tra xem MongoDB đã được khởi động chưa.
  - Xác nhận `MONGO_URI` trong file `.env` là chính xác.
  - Nếu sử dụng MongoDB Atlas, đảm bảo IP của bạn đã được whitelist.

- **Lỗi CORS khi gọi API từ frontend**:
  - Kiểm tra `CLIENT_URL` trong file `.env` của backend có khớp với URL frontend không.
  - Đảm bảo frontend đang chạy trên port được cấu hình trong CORS.

- **Lỗi JWT authentication**:
  - Kiểm tra xem bạn đã đăng nhập thành công chưa.
  - Xác nhận token được lưu trong localStorage.
  - Kiểm tra `JWT_SECRET` trong file `.env` là hợp lệ.

- **Port đã được sử dụng**:
  - Thay đổi `PORT` trong file `.env` của backend nếu port 5000 đã được sử dụng.
  - Thay đổi port của Vite trong file `vite.config.js` nếu port 5173 đã được sử dụng.

## 📝 Ghi chú

- Mật khẩu được mã hóa bằng bcrypt với salt rounds = 12.
- JWT token được lưu trong localStorage của trình duyệt.
- Tất cả các route transaction đều yêu cầu authentication.
- Rate limiting được áp dụng cho tất cả các API routes (100 requests/15 phút).

## 📄 License

MIT License

