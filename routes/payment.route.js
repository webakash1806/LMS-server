import { Router } from "express";

const router = Router()

router.get('/razorpay-key', razorpayApiKey)

router.post('/subscribe', subscription)

router.post('verify-subscription', verifySubscription)

router.post('/unsubscribe', cancelSubscription)

router.get('/', allPayment)

export default router