const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');

const AppError = require('./utils/appError');

const viewRouter = require('./routes/viewRoutes');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const errController = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// ------ MIDDLEWARE ------ //
// STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// SECURITY
// app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
// app.use(helmet.contentSecurityPolicy());
// const scriptSrcUrls = [
//   'https://api.tiles.mapbox.com/',
//   'https://api.mapbox.com/',
// ];
// const styleSrcUrls = [
//   'https://api.mapbox.com/',
//   'https://api.tiles.mapbox.com/',
//   'https://fonts.googleapis.com/',
// ];
// const connectSrcUrls = [
//   'https://api.mapbox.com/',
//   'https://a.tiles.mapbox.com/',
//   'https://b.tiles.mapbox.com/',
//   'https://events.mapbox.com/',
// ];
// const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: [],
//       connectSrc: ["'self'", ...connectSrcUrls],
//       scriptSrc: ["'self'", ...scriptSrcUrls],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", 'blob:'],
//       objectSrc: [],
//       imgSrc: ["'self'", 'blob:', 'data:'],
//       fontSrc: ["'self'", ...fontSrcUrls],
//     },
//   })
// );
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       'script-src': ["'self'", 'https://api.mapbox.com'],
//       'style-src': ["'self'", 'https://api.mapbox.com', 'fonts.googleapis.com'],
//     },
//   })
// );
// app.use(
//   helmet({
//     contentSecurityPolicy: false,
//   })
// );
const scriptSrcUrls = [
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
];
const styleSrcUrls = [
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);
// app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests, please try again in an hour',
});
app.use('/api', limiter);

// DEBUG
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// PARSER
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// DATA SANITIZATION
app.use(mongoSanitize());
app.use(xssClean());

// PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: ['duration'],
  })
);
// ------------------------ //

// ROUTES
// app.use('/', viewRouter);
app.get('/', (_, res) => {
  res.status(200).json({
    message: 'success',
  });
});
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(404, 'Route is undefined'));
});

app.use(errController);

module.exports = app;
