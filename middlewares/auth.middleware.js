import User from "../models/user.models.js"
import AppError from "../utils/error.utils.js"
import jwt from 'jsonwebtoken'

/**
 * The function checks if a user is logged in by verifying the token in the request cookies and sets
 * the user details in the request object.
 * @param req - The `req` parameter is the request object that contains information about the incoming
 * HTTP request, such as headers, query parameters, and body data. It is an object that is passed to
 * the middleware function by the Express framework.
 * @param res - The `res` parameter is the response object in Express.js. It is used to send the
 * response back to the client.
 * @param next - The `next` parameter is a function that is used to pass control to the next middleware
 * function in the request-response cycle. It is typically called at the end of the current middleware
 * function to indicate that it has completed its processing and the next middleware function should be
 * called.
 * @returns the result of calling the `next` function.
 */
const isLoggedIn = async (req, res, next) => {
    const { token } = await req.cookies

    if (!token) {
        return next(new AppError('Unauthenticated! Please Login again', 404))
    }
    const userDetails = await jwt.verify(token, process.env.JWT_SECRET)

    req.user = userDetails;

    next()
}

/**
 * The function `authorizedUser` checks if the user has the required role(s) to access a certain route
 * and returns an error if they don't.
 * @param role - The `role` parameter is a rest parameter that allows you to pass in multiple roles as
 * arguments to the `authorizedUser` function. It is used to specify the roles that are authorized to
 * access a particular route or perform a specific action.
 * @returns The function `authorizedUser` is returning a middleware function that takes in `req`,
 * `res`, and `next` as parameters.
 */
const authorizedUser = (...role) => async (req, res, next) => {
    const userRole = await req.user.role

    if (!role.includes(userRole)) {
        return next(new AppError('Unauthenticated! You dont have permission to change this', 404))
    }

    next()
}

/**
 * The function `authorizedSubscriber` checks if a user is an active subscriber or an admin before
 * allowing access to a route.
 * @returns If the subscription status is not 'active' and the user role is not 'ADMIN', then an error
 * message is returned with a status code of 404. Otherwise, the next middleware function is called.
 */
const authorizedSubscriber = async (req, res, next) => {

    const user = await User.findById(req.user.id)
    const subscription = user.subscription.status
    const role = user.role

    if (subscription !== 'active' && role !== 'ADMIN') {
        return next(new AppError('Unauthenticated! You dont have permission to access this. please subscribe', 404))
    }

    next()
}

/* The line `export { isLoggedIn, authorizedUser, authorizedSubscriber }` is exporting the functions
`isLoggedIn`, `authorizedUser`, and `authorizedSubscriber` from the current module. This allows
other modules to import and use these functions. */
export { isLoggedIn, authorizedUser, authorizedSubscriber }