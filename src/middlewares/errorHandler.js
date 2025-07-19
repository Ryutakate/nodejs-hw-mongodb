/* eslint-disable no-unused-vars */
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";

    res.status(status).json({
        status,
        message,
    });
};

export default errorHandler;
