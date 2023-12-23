import Payment from "../models/payment.model.js";
import User from "../models/user.models.js";
import { razorpay } from "../server.js";
import AppError from "../utils/error.utils.js"
import crypto from 'crypto'

const razorpayApiKey = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: "Razorpay API key",
            key: process.env.RAZORPAY_KEY_ID
        })
    } catch (e) {
        return next(new AppError(e.message + 500))
    }
}

const subscription = async (req, res, next) => {
    try {
        const { id } = req.user
        const user = await User.findById(id)

        if (!user) {
            return next(new AppError('Please Login', 400))
        }

        if (user.role === 'ADMIN') {
            return next(new AppError('Admin Cannot purchase subscription', 400))
        }

        const subscription = await razorpay.subscription.create({
            plan_id: process.env.RAZORPAY_PLAN_ID,
            customer_notify: 1
        })

        user.subscription.id = subscription.id
        user.subscription.status = subscription.status

        await user.save

        res.status(200).json({
            success: true,
            message: "Subscribed successfully",
            subscription_id: subscription.id
        })
    } catch (e) {
        return next(new AppError(e.message + 500))
    }
}

const verifySubscription = async (req, res, next) => {
    try {
        const { id } = req.user
        const { razorpay_payment_id, razorpay_signature, razorpay_subscriptio_id } = req.body

        const user = await User.findById(id)

        if (!user) {
            return next(new AppError('Please Login', 400))
        }

        const subscriptionId = user.subscription.id

        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id}|${subscriptionId}`)
            .digest('hex')



        if (generatedSignature !== razorpay_signature) {
            return next(new AppError('Payment Unsuccessfull! Please try again', 400))
        }
        user.subscription.status = 'active'
        await user.save()

        res.status(200).json({
            success: true,
            message: "Subscribed successfully",
            subscription_id: subscription.id
        })

    } catch (e) {
        return next(new AppError(e.message + 500))
    }
}

const cancelSubscription = async (req, res, next) => {

}

const allPayments = async (req, res, next) => {

}

export {
    razorpayApiKey,
    subscription,
    verifySubscription,
    cancelSubscription,
    allPayments,
}