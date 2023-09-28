const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);

    // Set the status code: use the status code from the error, or default to 500 (Internal Server Error)
    res.status(err.status || 500);

    // Send the error details in the response
    res.json({
        error: {
            message: err.message,
        },
    });
};

module.exports = errorMiddleware;