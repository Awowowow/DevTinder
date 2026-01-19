const { AppError } = require('../utils/customErrors');

const errorHandler = (err, req, res, next) => {
  

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';


  console.error('❌ ERROR OCCURRED:', {
    message: err.message,
    statusCode: statusCode,
    path: req.path,           
    method: req.method,       
    stack: err.stack,         
  });

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }


  if (err.code === 11000) {
    statusCode = 409;
    message = 'This resource already exists';
  }


  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map(e => e.message);
    message = errors.join(', ');
  }


  res.status(statusCode).json({
    success: false,
    error: message,
    
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack 
    }),
  });
};

module.exports = errorHandler;