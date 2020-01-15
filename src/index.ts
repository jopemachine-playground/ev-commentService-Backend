import createError from 'http-errors';
import cors from 'cors';
import express from "express";
import expressSession from "express-session";
import userRouter from './routes/user';
import blogMgmtRouter from "./routes/blogMgmt";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import multer from 'multer';
import flash from "connect-flash";
import path from "path";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();
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

app.use(express.static(path.join(__dirname, 'public')));

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

app.use('/URL-Register', blogMgmtRouter);
app.use('/', userRouter);

app.use(function(req, res, next) {
  console.log("404 not found : " + req.url);
  next(createError(404));
});

// export default app;
module.exports = app;