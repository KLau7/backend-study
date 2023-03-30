const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY_TIME,
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;

  res
    .cookie('jwt', token, {
      expires: new Date(
        Date.now() +
          process.env.JWT_EXPIRY_TIME.match(/^\d*/)[0] * 60 * 60 * 1000
      ),
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    })
    .status(statusCode)
    .json({
      status: 'success',
      data: {
        user,
      },
    });
};

exports.signup = catchAsync(async (req, res) => {
  const { name, email, photo, password, passwordConfirm, passwordLastChanged } =
    req.body;

  const newUser = await User.create({
    name,
    email,
    photo,
    password,
    passwordConfirm,
    passwordLastChanged,
  });

  sendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError(400, 'Please provide email and password'));
  }

  const user = await User.findOne({ email }).select('+password');
  const correctPw = user && (await user.validatePw(password, user.password));

  if (!user || !correctPw)
    return next(new AppError(401, 'Email or password is incorrect'));

  sendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) return next(new AppError(401, 'Please log in to get access'));

  const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(payload.id);
  if (!user) return next(new AppError(401, 'User no longer exists'));

  if (user.changedPwAfter(payload.iat))
    return next(new AppError(401, 'Login expired.'));

  req.user = user;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError(403, 'Unauthorised'));
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError(404, 'Submitted email address is not registered'));

  const resetToken = user.generatePwResetToken();
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    status: 'success',
    data: {
      resetToken,
    },
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError(400, 'Token is invalid or expired'));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendToken(user, 200, res);
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  const correctPw =
    user && (await user.validatePw(currentPassword, user.password));
  if (!correctPw) return next(new AppError(401, 'Password is incorrect'));

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();

  sendToken(user, 200, res);
});
