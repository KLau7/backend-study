const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is a required field'],
  },
  email: {
    type: String,
    required: [true, 'Email is a required field'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password is a required field'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password confirm is a required field'],
    validate: {
      validator: function (input) {
        return this.password === input;
      },
      message: 'Password confirm does not match password',
    },
  },
  passwordLastChanged: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordLastChanged = Date.now() - 1000;
  next();
});

userSchema.methods.validatePw = async (inputPw, userPw) =>
  await bcrypt.compare(inputPw, userPw);

userSchema.methods.changedPwAfter = function (jwtTimeStamp) {
  if (this.passwordLastChanged) {
    const lastChangedTimestamp = parseInt(
      this.passwordLastChanged.getTime() / 1000,
      10
    );
    return lastChangedTimestamp > jwtTimeStamp;
  }

  return false;
};

userSchema.methods.generatePwResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
