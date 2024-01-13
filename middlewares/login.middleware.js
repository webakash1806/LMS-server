import AppError from "../utils/error.utils.js"

const loginAuth = async (req, res, next) => {
    const { token } = await req.cookies

    if (token) {
        return next(new AppError('Already Logged in! Please Logout First', 404))
    }

    next()
}

export { loginAuth }