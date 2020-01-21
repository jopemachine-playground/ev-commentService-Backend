import createError from 'http-errors';
import cors from 'cors';
import express from "express";
import expressSession from "express-session";
import userRouter from './routes/user';
import blogMgmtRouter from "./routes/blogMgmt";
import commentRouter from "./routes/comment";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import multer from 'multer';
import flash from "connect-flash";
import path from "path";
import morgan from "morgan";
import dotenv from "dotenv";

const app = express();

// dotenv setting
dotenv.config();

// cors setting
app.use(cors());

// multer setting
app.use(multer({
  dest: __dirname + "/upload",
  limits: {
    fileSize: 1024 * 1024 * 16
  }
}).any());

// view Engine Setting
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// static file path setting
app.use(express.static(path.join(__dirname, '/../' ,'public')));

// cookie, session setting
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressSession({
  secret: '',
  resave: true,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 60 * 60 * 1000,
  }
}));

app.use(flash());

// routing
app.use('/URL-Register', blogMgmtRouter);
app.use('/Comment', commentRouter);
app.use('/', userRouter);

// 404 error
app.use(function(req, res, next) {
  console.log("404 not found : " + req.url);
  next(createError(404));
});

// export default app;
module.exports = app;