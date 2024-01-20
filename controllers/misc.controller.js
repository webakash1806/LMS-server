// Importing the User model from the specified path
import User from "../models/user.models.js";

// Importing the custom error handling utility
import AppError from "../utils/error.utils.js";

// Controller function to retrieve and send user statistics
export const userStats = async (req, res, next) => {
    try {
        // Fetching the total count of users from the User model
        const usersCount = await User.countDocuments()

        // Fetching the count of users with an active subscription status
        const subscribedUser = await User.countDocuments({
            'subscription.status': 'active'
        })

        // Sending the user statistics as a JSON response
        res.status(200).json({
            success: true,
            message: 'Users Stats',
            usersCount,
            subscribedUser,
        })
    } catch (e) {
        // Handling errors by passing them to the next middleware (error handling middleware)
        return next(new AppError(e.message, 400));
    }
}


