var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors'); // 1. Import 'cors' here

// Import your API routes
const authRouter = require('./routes/auth.routes.js');
// const recipeRouter = require('./routes/recipe.routes.js'); // We'll use this later

var app = express();

// --- MIDDLEWARE ---
// 2. Use 'cors' at the very top of your middleware
app.use(cors()); 
app.use('/api/users', require('./routes/user.routes.js'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// --- API ROUTES ---
app.use('/api/auth', authRouter);
// app.use('/api/recipes', recipeRouter); // We'll use this later


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;