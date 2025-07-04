// middleware/errorMiddleware.js

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Specific Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }
    
    // Mongoose cast error (e.g., invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 404;
        message = 'Resource not found.';
    }

    console.error(err.stack);

    res.status(statusCode).render('error', {
        title: 'Error',
        message,
        // Only show stack trace in development
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = { asyncHandler, notFound, errorHandler };