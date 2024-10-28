// all express imports
const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csrf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { ValidationError } = require('sequelize');

// this lets us determine what environment we're in so that we can do different process in that environment
const { environment } = require("./config");
const isProduction = environment === "production";
// this is to set up our express app
const app = express();
const routes = require('./routes');


// this is to log info about req and res -- middleware
app.use(morgan("dev"));
/**Add the cookie-parser middleware for parsing cookies and the express.json middleware for parsing JSON bodies of requests with Content-Type of "application/json". */
app.use(cookieParser());
app.use(express.json());

// Security Middleware
//this conditional checks if we're in a production environment
if (!isProduction) {
  // enable cors only in development
  app.use(cors());
}

// helmet helps set a variety of headers to better secure your app
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin"
  })
);

// Set the _csrf token and create req.csrfToken method
app.use(
  csrf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true
    }
  })
);


//ENDPOINTS
app.use(routes); // Connect all the routes

// the underscore before req and res is there to signify that we don't use them in the middleware
// Catch unhandled requests and forward to error handler.
app.use((_req, _res, next) => {
  // creates an error instance
  const err = new Error("The requested resource couldn't be found.");
  // gives the error a title
  err.title = "Resource Not Found";
  // specifies the errors that occurred
  err.errors = { message: "The requested resource couldn't be found." };
  // the status message that will be passed along with the error
  err.status = 404;
  next(err);
});



// Process sequelize errors
app.use((err, _req, _res, next) => {
  // check if error is a Sequelize error:
  if (err instanceof ValidationError) {
    let errors = {};
    for (let error of err.errors) {
      errors[error.path] = error.message;
    }
    err.title = 'Validation error';
    err.errors = errors;
  }
  next(err);
});

// Error formatter
//rewrite to get rid of the stack when deployed to render
app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  console.error(err);

  if (isProduction) {
    // In production, exclude stack from the response
    res.json({
      //title: err.title || 'Server Error',
      message: err.message,
      errors: err.errors,
    });
  } else {
    // In development, include stack in the response
    res.json({
      title: err.title || 'Server Error',
      message: err.message,
      errors: err.errors,
      stack: err.stack,
    });
  }
});


module.exports = app;
