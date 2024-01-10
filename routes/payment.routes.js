import { Router } from "express";
import {
    allPayments,
    cancelSubscription,
    razorpayApiKey,
    subscription,
    verifySubscription
} from '../controllers/payment.controller.js'

import { isLoggedIn, authorizedUser, authorizedSubscriber } from "../middlewares/auth.middleware.js";


const router = Router()

router.get('/razorpay-key', isLoggedIn, razorpayApiKey)

router.post('/subscribe', isLoggedIn, subscription)

router.post('/verify-subscription', isLoggedIn, verifySubscription)

router.post('/unsubscribe', isLoggedIn, authorizedSubscriber, cancelSubscription)

router.get('/', isLoggedIn, authorizedUser('ADMIN'), allPayments)

export default router