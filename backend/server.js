const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ── MYSQL CONNECTION (Sequelize) ──
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'post_office_8',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Rzv#gf+T8crMV',
  logging: false
});

// Test connection
sequelize.authenticate().then(() => {
  console.log('Connected to MySQL via Sequelize!');
}).catch(err => {
  console.error('MySQL connection failed:', err.message);
});

// ── MYSQL CONNECTION (mysql2 pool for legacy queries) ──
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Rzv#gf+T8crMV',
  database: process.env.DB_NAME || 'post_office_8',
  waitForConnections: true,
  connectionLimit: 10
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL connection failed:', err.message);
  } else {
    console.log('Connected to MySQL via mysql2!');
    connection.release();
  }
});

// ── HELPERS ──
function getContentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html';
  if (filePath.endsWith('.css')) return 'text/css';
  if (filePath.endsWith('.js')) return 'application/javascript';
  return 'text/plain';
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    res.end(data);
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

function getBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(JSON.parse(body || '{}')));
  });
}

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  workAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hireDate: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'users'
});

// Sync database
sequelize.sync().then(() => {
  console.log('Database synchronized');
}).catch(err => {
  console.error('Database sync error:', err);
});

// ── MIDDLEWARE ──
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ── ROUTES ──

// PAGE ROUTES
app.get('/', (req, res) => {
  sendFile(res, path.join(__dirname, '../frontend/public/html/home.html'));
});

app.get('/customer_home', (req, res) => {
  sendFile(res, path.join(__dirname, '../frontend/public/html/customer/customer_home.html'));
});

app.get('/employee_home', (req, res) => {
  sendFile(res, path.join(__dirname, '../frontend/public/html/employee/employee_home.html'));
});

app.get('/package_list', (req, res) => {
  sendFile(res, path.join(__dirname, '../frontend/public/html/employee/package_list.html'));
});

// STATIC FILES
app.use('/css', express.static(path.join(__dirname, '../frontend/public/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/public/js')));

// QUERY ROUTES
app.get('/qry_all_packages', (req, res) => {
  db.query('SELECT * FROM packages', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'No packages found' });
    }
    res.status(200).json(results);
  });
});

// AUTH ROUTES

// Register Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, employeeId, department, position, phoneNumber, workAddress, hireDate, password } = req.body;

    if (!name || !email || !employeeId || !department || !position || !phoneNumber || !workAddress || !hireDate || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({
      where: {
        [Sequelize.Op.or]: [{ email }, { employeeId }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email or Employee ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      employeeId,
      department,
      position,
      phoneNumber,
      workAddress,
      hireDate,
      password: hashedPassword
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const userWithoutPassword = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      employeeId: newUser.employeeId,
      department: newUser.department,
      position: newUser.position,
      phoneNumber: newUser.phoneNumber,
      workAddress: newUser.workAddress,
      hireDate: newUser.hireDate
    };

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'An error occurred during registration' });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { employeeId, password, department } = req.body;

    if (!employeeId || !password || !department) {
      return res.status(400).json({ message: 'Employee ID, password, and department are required' });
    }

    const user = await User.findOne({
      where: { employeeId, department }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid Employee ID, password, or department' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid Employee ID, password, or department' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      employeeId: user.employeeId,
      department: user.department,
      position: user.position,
      phoneNumber: user.phoneNumber,
      workAddress: user.workAddress,
      hireDate: user.hireDate
    };

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
});

// Get Profile Route (Protected)
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      employeeId: user.employeeId,
      department: user.department,
      position: user.position,
      phoneNumber: user.phoneNumber,
      workAddress: user.workAddress,
      hireDate: user.hireDate
    };

    res.status(200).json({
      message: 'Profile retrieved successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'An error occurred while retrieving profile' });
  }
});

// Update Profile Route (Protected)
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, phoneNumber, workAddress } = req.body;

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (workAddress) user.workAddress = workAddress;

    await user.save();

    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      employeeId: user.employeeId,
      department: user.department,
      position: user.position,
      phoneNumber: user.phoneNumber,
      workAddress: user.workAddress,
      hireDate: user.hireDate
    };

    res.status(200).json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'An error occurred while updating profile' });
  }
});

// Change Password Route (Protected)
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'An error occurred while changing password' });
  }
});

// Forgot Password Route
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({ message: 'If email exists, password reset link has been sent' });
    }

    res.status(200).json({ message: 'If email exists, password reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Page not found' });
});

// ── START SERVER ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
