const createError = require('http-errors');
const cors = require('cors');
import express = require('express');
const router = require('./routes/router.tsx');

const app = express();

app.use(cors());

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

module.exports = app;