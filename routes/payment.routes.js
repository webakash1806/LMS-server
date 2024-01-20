// Importing the necessary modules and functions from external files
import { Router } from "express";
import {
    allPayments,
    cancelSubscription,
    razorpayApiKey,
    subscription,
    verifySubscription
} from '../controllers/payment.controller.js'

import { isLoggedIn, authorizedUser, authorizedSubscriber } from "../middlewares/auth.middleware.js";

// Creating an instance of the Express Router
const router = Router()

// Route to get the Razorpay API key (requires user to be logged in)
router.get('/razorpay-key', isLoggedIn, razorpayApiKey)

// Route to subscribe to a payment plan (requires user to be logged in)
router.post('/subscribe', isLoggedIn, subscription)

// Route to verify a subscription (requires user to be logged in)
router.post('/verify-subscription', isLoggedIn, verifySubscription)

// Route to unsubscribe and cancel a subscription (requires user to be logged in as a subscriber)
router.post('/unsubscribe', isLoggedIn, authorizedSubscriber, cancelSubscription)

// Route to get all payments (requires user to be logged in as an ADMIN)
router.get('/', isLoggedIn, authorizedUser('ADMIN'), allPayments)

// Exporting the router for use in other parts of the application
export default router
