const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR: ', err);

    res.status(500).json({
      status: 'error',
      message: 'Unknown error',
    });
  }
};

const handleDBError = (err) => {
  // Invalid value
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(400, message);
  }
  // Duplicate key
  if (err.code === 11000) {
    const message = `Duplicate key: ${Object.values(err.keyValue)[0]}`;
    return new AppError(400, message);
  }
  return err;
};

const handleJWTError = (err) => {
  if (err.name === 'JsonWebTokenError')
    return new AppError(401, 'Invalid token.');
  if (err.name === 'TokenExpiredError')
    return new AppError(401, 'Token expired.');
  return err;
};

module.exports = (err, req, res, _) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = new AppError(err.statusCode, err.message);
  error = handleDBError(error);
  error = handleJWTError(error);

  if (process.env.NODE_ENV === 'production') {
    sendErrorProd(error, res);
  } else {
    sendErrorDev(error, res);
  }
};
