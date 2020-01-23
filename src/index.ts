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
import passport from "passport";
import passportConfig from "./passport/passportConfig";
import dotenv from "dotenv";

const app = express();
passportConfig(passport);

// dotenv setting
dotenv.config();

// cors setting
app.use(cors());

// static file path setting
app.use(express.static(path.join(__dirname, '/../' ,'public')));

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
app.use(express.urlencoded({ extended: true }));

// cookie, session setting
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession({
  secret: 'secret key',
  resave: true,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 60 * 60 * 1000,
  }
}));

app.use(flash());

// passport setting
app.use(passport.initialize());
app.use(passport.session());

// routing
app.use('/URL-Register', blogMgmtRouter);
app.use('/Comment', commentRouter);
app.use('/', userRouter);

// 404 error
app.use(function(req, res, next) {
  console.log(`404 not found:: Method:${req.method}, Url: ${req.url}`);
  next(createError(404));
});

// export default app;
module.exports = app;