import User from "../models/user.models.js";
import AppError from "../utils/error.utils.js";




export const userStats = async (req, res, next) => {
    try {
        const usersCount = await User.countDocuments()

        const subscribedUser = await User.countDocuments({
            'subscription.status': 'active'
        })

        res.status(200).json({
            success: true,
            message: 'Users Stats',
            usersCount,
            subscribedUser,
        })
    } catch (e) {
        return next(new AppError(e.message, 400));
    }
}


