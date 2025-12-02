const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'Không có token, quyền truy cập bị từ chối' 
      });
    }

    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);

    // Use findById which automatically handles ObjectId conversion
    const user = await User.findById(decoded.id).select('-password');
    console.log('User found:', user ? 'Yes' : 'No');
    console.log('User isActive:', user ? user.isActive : 'N/A');

    // Check if user exists and is active
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ 
        success: false, 
        message: 'Token không hợp lệ' 
      });
    }

    if (!user.isActive) {
      console.log('User exists but is inactive');
      return res.status(401).json({ 
        success: false, 
        message: 'Tài khoản đã bị vô hiệu hóa' 
      });
    }

    req.user = user;
    console.log('Auth successful for user:', user.email);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ 
        success: false, 
        message: 'Token đã hết hạn, vui lòng đăng nhập lại' 
      });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ 
        success: false, 
        message: 'Token không hợp lệ' 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Lỗi xác thực: ' + error.message 
      });
    }
  }
};

module.exports = authMiddleware;