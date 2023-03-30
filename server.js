const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const app = require('./app');

process.on('uncaughtException', (err) => {
  console.error(err.name, err.message);
  process.exit(1);
});

// START SERVER
const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose.connect(DB).then((con) => {
  console.log('DB connection successful');
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`App running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
