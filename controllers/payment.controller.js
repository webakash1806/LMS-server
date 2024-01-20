// Importing necessary modules and models
import Payment from "../models/payment.model.js";
import User from "../models/user.models.js";
import { razorpay } from "../server.js";
import AppError from "../utils/error.utils.js"
import crypto from 'crypto'

/**
 * The function `razorpayApiKey` returns the Razorpay API key as a JSON response.
 * @param req - The `req` parameter is the request object that contains information about the incoming
 * HTTP request, such as the request headers, request body, and request parameters. It is used to
 * access and manipulate the data sent by the client.
 * @param res - The `res` parameter is the response object that is used to send the response back to
 * the client. It has methods like `status()` to set the HTTP status code, `json()` to send a JSON
 * response, and `send()` to send a plain text response.
 * @param next - The `next` parameter is a function that is used to pass control to the next middleware
 * function in the request-response cycle. It is typically used to handle errors or to move on to the
 * next middleware function after completing the current one.
 * @returns a JSON response with the following properties:
 * - success: a boolean value indicating whether the request was successful or not
 * - message: a string message indicating the purpose of the response
 * - key: the value of the RAZORPAY_KEY_ID environment variable
 */
const razorpayApiKey = async (req, res, next) => {
    try {
        // Sending Razorpay API key in the response
        res.status(200).json({
            success: true,
            message: "Razorpay API key",
            key: process.env.RAZORPAY_KEY_ID
        })
    } catch (e) {
        // Handling errors and passing them to the next middleware
        return next(new AppError(e.message, 500))
    }
}

/**
 * The `subscription` function is an asynchronous function that handles the process of subscribing a
 * user to a subscription plan using Razorpay API.
 * @returns a JSON response with the following properties:
 * - success: a boolean value indicating whether the subscription was successful or not
 * - message: a string message indicating the result of the subscription
 * - subscription_id: the ID of the subscription
 */
const subscription = async (req, res, next) => {
    try {
        // Extracting user ID from the request
        const { id } = req.user

        // Retrieving user details from the database
        const user = await User.findById(id)

        // Handling cases where user is not found or is an admin
        if (!user) {
            return next(new AppError('Please Login', 400))
        }

        if (user.role === 'ADMIN') {
            return next(new AppError('Admin Cannot purchase subscription', 400))
        }

        // Creating a subscription using Razorpay API
        const subscription = await razorpay.subscriptions.create({
            plan_id: process.env.RAZORPAY_PLAN_ID, // The unique plan ID
            customer_notify: 1,
            total_count: 12,
        });

        // Updating user's subscription details in the database
        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;

        // Saving the user object
        await user.save();

        // Sending success response with subscription details
        res.status(200).json({
            success: true,
            message: "Subscribed successfully",
            subscription_id: subscription.id
        })
    } catch (e) {
        // Handling errors and passing them to the next middleware
        return next(new AppError(e.message, 500))
    }
}

/**
 * The function `verifySubscription` is an asynchronous function that verifies a subscription payment
 * using Razorpay and updates the user's subscription status to 'active' if the payment is successful.
 * @returns a JSON response with the following properties:
 * - success: a boolean value indicating whether the verification was successful or not
 * - message: a string message indicating the result of the verification
 * - subscription: an object representing the user's subscription status
 */
const verifySubscription = async (req, res, next) => {
    try {
        // Extracting necessary data from the request
        const { id } = req.user
        const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = req.body

        // Retrieving user details from the database
        const user = await User.findById(id)

        // Handling cases where user is not found
        if (!user) {
            return next(new AppError('Please Login', 400))
        }

        // Generating a signature for verification
        const subscriptionId = user.subscription.id
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id}|${subscriptionId}`)
            .digest('hex')

        // Verifying the signature
        if (generatedSignature !== razorpay_signature) {
            return next(new AppError('Payment Unsuccessfull! Please try again', 400))
        }

        // Creating a payment record in the database
        await Payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id
        })

        // Updating user's subscription status to 'active'
        user.subscription.status = 'active'
        await user.save()

        // Sending success response with subscription details
        res.status(200).json({
            success: true,
            message: "Verified successfully",
            subscription: user.subscription
        })

    } catch (e) {
        // Handling errors and passing them to the next middleware
        return next(new AppError(e, 500))
    }
}

/**
 * The `cancelSubscription` function cancels a user's subscription and updates the subscription status
 * in the database.
 * @returns a JSON response with a success status and a message indicating that the subscription has
 * been cancelled.
 */
const cancelSubscription = async (req, res, next) => {
    try {
        // Extracting user ID from the request
        const { id } = req.user

        // Retrieving user details from the database
        const user = await User.findById(id)

        // Handling cases where user is not found or is an admin
        if (!user) {
            return next(new AppError('Please Login', 400))
        }

        if (user.role === 'ADMIN') {
            return next(new AppError('Admin Cannot cancel subscription', 400))
        }

        // Cancelling the subscription using Razorpay API
        const subscriptionId = user.subscription.id
        const subscription = await razorpay.subscriptions.cancel(subscriptionId)

        // Updating user's subscription status in the database
        user.subscription.status = subscription.status
        await user.save()

        // Sending success response
        res.status(200).json({
            success: true,
            message: "Subscription cancelled!"
        })

    } catch (error) {
        // Handling errors and passing them to the next middleware
        return next(new AppError(error.error, error.statusCode))
    }
}

/**
 * The above function retrieves all payment subscriptions using the Razorpay API and returns the data
 * as a JSON response.
 * @returns The function `allPayments` is returning a JSON response with the following structure:
 */
const allPayments = async (req, res, next) => {
    try {
        // Extracting count and skip parameters from the query
        const { count, skip } = req.query

        // Retrieving payment subscriptions using Razorpay API
        const subscription = await razorpay.subscriptions.all({
            count: count ? count : 100,
            skip: skip ? skip : 0
        })


        // Creates a list of month names to filter by. This is used to filter the list of months
        const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];

        // Returns a map of months to be used for filtering. This map is indexed by month
        const finalMonths = {
            January: 0,
            February: 0,
            March: 0,
            April: 0,
            May: 0,
            June: 0,
            July: 0,
            August: 0,
            September: 0,
            October: 0,
            November: 0,
            December: 0,
        };

        // Mapping subscription start months to month names
        const monthlyWisePayments = subscription.items.map((payment) => {
            const monthsInNumbers = new Date(payment.start_at * 1000);
            return monthNames[monthsInNumbers.getMonth()];
        });

        // Counting subscriptions per month
        monthlyWisePayments.map((month) => {
            Object.keys(finalMonths).forEach((objMonth) => {
                if (month === objMonth) {
                    finalMonths[month] += 1;
                }
            });
        });

        // Creating a list of subscription counts per month
        const monthlySalesRecord = [];

        Object.keys(finalMonths).forEach((monthName) => {
            monthlySalesRecord.push(finalMonths[monthName]);
        });

        // Sending success response with payment subscription details
        res.status(200).json({
            success: true,
            message: 'All payments',
            subscription,
            finalMonths,
            monthlySalesRecord,
        });
    } catch (e) {
        // Handling errors and passing them to the next middleware
        return next(new AppError(e.message, 500))
    }
}

/* The `export` statement is used to export functions or variables from a module so that they can be
used in other modules. In this case, the `export` statement is exporting the following functions: */
export {
    razorpayApiKey,
    subscription,
    verifySubscription,
    cancelSubscription,
    allPayments,
}