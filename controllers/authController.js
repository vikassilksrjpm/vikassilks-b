const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const { username, mobileNumber, confirmMobileNumber } = req.body;

    if (mobileNumber !== confirmMobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Mobile numbers do not match',
      });
    }

    const userExists = await User.findOne({ mobileNumber });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number already registered',
      });
    }

    const user = await User.create({
      username,
      mobileNumber,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (handles both user and admin)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const { username, mobileNumber } = req.body;

    const user = await User.findOne({ mobileNumber });

    if (!user || user.username !== username) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        mobileNumber: user.mobileNumber,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin login with email & password
// @route   POST /api/auth/admin/login
// @access  Public
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), role: 'admin' });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change admin password
// @route   PUT /api/auth/admin/change-password
// @access  Private (admin only)
const changeAdminPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const admin = await User.findById(req.user._id);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Change admin mobile number
// @route   PUT /api/auth/admin/change-mobile
// @access  Private (admin only)
const changeAdminMobile = async (req, res, next) => {
  try {
    const { newMobileNumber, confirmMobileNumber } = req.body;

    if (!newMobileNumber || !confirmMobileNumber) {
      return res.status(400).json({ success: false, message: 'Both fields are required' });
    }

    if (!/^\d{10}$/.test(newMobileNumber)) {
      return res.status(400).json({ success: false, message: 'Mobile number must be exactly 10 digits' });
    }

    if (newMobileNumber !== confirmMobileNumber) {
      return res.status(400).json({ success: false, message: 'Mobile numbers do not match' });
    }

    const existing = await User.findOne({ mobileNumber: newMobileNumber });
    if (existing && existing._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Mobile number already in use' });
    }

    await User.findByIdAndUpdate(req.user._id, { mobileNumber: newMobileNumber });

    res.json({ success: true, message: 'Mobile number updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  adminLogin,
  changeAdminPassword,
  changeAdminMobile,
};
