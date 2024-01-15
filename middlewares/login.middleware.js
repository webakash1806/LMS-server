import AppError from "../utils/error.utils.js"

/**
 * The loginAuth function checks if a user is already logged in and returns an error if they are.
 * @param req - The `req` parameter is the request object that contains information about the incoming
 * HTTP request, such as the request headers, request body, and request parameters. It is an object
 * that is passed to the middleware function by the Express framework.
 * @param res - The `res` parameter is the response object in Express.js. It is used to send a response
 * back to the client.
 * @param next - The `next` parameter is a function that is used to pass control to the next middleware
 * function in the request-response cycle. It is typically called at the end of the current middleware
 * function to indicate that it has completed its processing and the next middleware function should be
 * called.
 * @returns In this code snippet, if the `token` exists in the `req.cookies`, then the `next` function
 * is called with an `AppError` object as an argument. This means that an error will be passed to the
 * next middleware or error handler.
 */
const loginAuth = async (req, res, next) => {
    const { token } = await req.cookies

    if (token) {
        return next(new AppError('Already Logged in! Please Logout First', 404))
    }

    next()
}

export { loginAuth }