// Importing Mongoose model and schema functionality
import { model, Schema } from "mongoose"

/* 
   Defining a Mongoose schema for a payment object. The schema specifies the structure and
   validation rules for the payment object.
*/
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
    timestamps: true  // Automatically add timestamps (createdAt, updatedAt) to documents
})

// Creating a Mongoose model named 'Payment' using the defined schema
const Payment = model('Payment', paymentSchema)

// Exporting the 'Payment' model for use in other parts of the application
export default Payment