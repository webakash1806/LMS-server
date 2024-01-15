import { model, Schema } from "mongoose"


/* The code is defining a Mongoose schema for a payment object. The schema specifies the structure and
validation rules for the payment object. */
const paymentSchema = new Schema({
    razorpay_payment_id: {
        type: String,
        required: true
    },
    razorpay_subscription_id: {
        type: String,
        required: true
    },
    razorpay_signature: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const Payment = model('Payment', paymentSchema)

export default Payment