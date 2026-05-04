const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  getProfile,
  adminLogin,
  changeAdminPassword,
  changeAdminMobile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Register validation
const registerValidation = [
  body('username').notEmpty().withMessage('Username is required').trim(),
  body('mobileNumber')
    .notEmpty()
    .withMessage('Mobile number is required')
    .isNumeric()
    .withMessage('Mobile number must be numeric')
    .isLength({ min: 10, max: 10 })
    .withMessage('Mobile number must be exactly 10 digits'),
  body('confirmMobileNumber')
    .notEmpty()
    .withMessage('Confirm mobile number is required')
    .custom((value, { req }) => value === req.body.mobileNumber)
    .withMessage('Mobile numbers do not match'),
];

// Login validation
const loginValidation = [
  body('username').notEmpty().withMessage('Username is required').trim(),
  body('mobileNumber')
    .notEmpty()
    .withMessage('Mobile number is required')
    .isNumeric()
    .withMessage('Mobile number must be numeric')
    .isLength({ min: 10, max: 10 })
    .withMessage('Mobile number must be exactly 10 digits'),
];

router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.post('/admin/login', adminLogin);
router.get('/profile', protect, getProfile);
router.put('/admin/change-password', protect, changeAdminPassword);
router.put('/admin/change-mobile', protect, changeAdminMobile);

module.exports = router;
