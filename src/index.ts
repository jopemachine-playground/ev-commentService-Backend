import createError from 'http-errors';
import cors from 'cors';
import express from "express";
import expressSession from "express-session";
import userRouter from './routes/user';
import blogMgmtRouter from "./routes/blogMgmt";
import bodyParser from "body-parser";
import tokenIssuer from "./routes/tokenIssuer";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import multer from 'multer';
import passport from "passport";
import passportConfig from "./passport/passportConfig";
import flash from "connect-flash";

const app = express();
passportConfig(passport);

app.use(cors());

app.use(multer({
  dest: __dirname + "/upload",
  limits: {
    fileSize: 1024 * 1024 * 16
  }
}).any());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(flash());

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession({
  secret: 'here should be the secret key',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', blogMgmtRouter);
app.use('/', userRouter);
// app.use('/', tokenIssuer);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log("404 not found : " + req.url);
  next(createError(404));
});

// export default app;
module.exports = app;