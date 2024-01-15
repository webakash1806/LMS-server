/**
 * The errorMiddleware function handles errors in a Node.js application by setting the status code,
 * message, and stack trace in the response.
 * @param err - The `err` parameter is the error object that is passed to the middleware function. It
 * contains information about the error that occurred, such as the error message, error code, and stack
 * trace.
 * @param req - The `req` parameter represents the request object, which contains information about the
 * incoming HTTP request, such as the request headers, request method, request URL, request body, etc.
 * It is an object that is automatically created by the Express framework and passed to the middleware
 * function.
 * @param res - The `res` parameter is the response object that is used to send the response back to
 * the client. It contains methods and properties that allow you to set the status code, headers, and
 * send the response body. In this code snippet, the `res` object is used to set the status code
 * @param next - The `next` parameter is a function that is used to pass control to the next middleware
 * function in the request-response cycle. It is typically used when there is an error and you want to
 * skip the current middleware and move on to the next one.
 * @returns a JSON response with the following properties:
 * - success: false
 * - message: the error message from the error object or a default message if it is not provided
 * - stack: the stack trace of the error object
 */
const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Something went wrong"

    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        stack: err.stack
    })

}

export default errorMiddleware