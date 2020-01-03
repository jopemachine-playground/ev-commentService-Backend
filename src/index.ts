import createError from 'http-errors';
import cors from 'cors';
const express = require('express');
import router from './routes/router';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(cookieSession({
  keys: `sID`, // 세션키
  name: 'session',
  maxAge: 24 * 60 * 60 * 1000
}));

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// export default app;
module.exports = app;