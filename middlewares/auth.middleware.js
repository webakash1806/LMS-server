import AppError from "../utils/error.utils.js"
import jwt from 'jsonwebtoken'

const isLoggedIn = async (req, res, next) => {
    const { token } = await req.cookies
    console.log(token)

    if (!token) {
        return next(new AppError('Unauthenticated! Please Login again', 404))
    }
    const userDetails = await jwt.verify(token, process.env.JWT_SECRET)

    req.user = userDetails;

    next()
}

const authorizedUser = (...role) => async (req, res, next) => {
    const userRole = await req.user.role
    console.log(userRole)
    console.log(...role)
    if (!role.includes(userRole)) {
        return next(new AppError('Unauthenticated! You dont have permission to change this', 404))
    }

    next()
}

export { isLoggedIn, authorizedUser }