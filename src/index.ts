import createError from 'http-errors';
import cors from 'cors';
const express = require('express');
import userRouter from './routes/user';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import multer from 'multer';

const app = express();

app.use(cors());

app.use(multer({
  dest: __dirname + "/upload",
  limits: {
    fileSize: 1024 * 1024 * 16
  }
}).any());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(cookieSession({
  keys: `sID`, // 세션키
  name: 'session',
  maxAge: 24 * 60 * 60 * 1000
}));

app.use('/', userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log("404 not found : " + req.url);
  next(createError(404));
});

// export default app;
module.exports = app;