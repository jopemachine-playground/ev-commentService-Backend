import createError from 'http-errors';
import cors from 'cors';
import express = require('express');
import router from './routes/router';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// export default app;
module.exports = app;