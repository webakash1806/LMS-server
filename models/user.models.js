import { model, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

/* 
   Defining a Mongoose schema for a user in a MongoDB database.
*/
const userSchema = new Schema({
    // Role of the user (can be 'USER' or 'ADMIN')
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    // User's username (unique and case-insensitive)
    userName: {
        type: String,
        unique: true,
        lowercase: true,
        required: true,
    },
    // User's full name with length constraints
    fullName: {
        type: 'String',
        required: [true, 'Name is Required'],
        minLength: [5, 'Name must be more than 5 characters'],
        maxLength: [30, 'Name should not be more than 30 characters'],
        trim: true
    },
    // User's email with validation using regex
    email: {
        type: 'String',
        required: [true, 'Email is required'],
        unique: true,
        match: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email']
    },
    // User's password and confirmPassword with hiding from query results
    password: {
        type: 'String',
        required: [true, 'Password is required'],
        select: false
    },
    confirmPassword: {
        type: 'String',
        required: [true, 'Confirm Password is required'],
        trim: true,
        select: false
    },
    // User's avatar information
    avatar: {
        publicId: {
            type: 'String',
        },
        secure_url: {
            type: 'String',
        }
    },
    // Token and expiry for password reset
    forgetPasswordToken: 'String',
    forgetPasswordExpiry: Date,
    // User's subscription information
    subscription: {
        id: String,
        status: String,
    }

}, { timestamps: true })

/* 
   Pre-save middleware function in Mongoose.
   Executed before saving a user document to the database.
*/
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.isModified('confirmPassword')) {
        return next()
    }
    // Hashing the password and confirmPassword before saving
    this.password = await bcrypt.hash(this.password, 10)
    this.confirmPassword = await bcrypt.hash(this.confirmPassword, 10)
})

/* 
   Additional methods that can be called on user documents created using the User model.
*/
userSchema.methods = {
    // Generating a JWT token for authentication
    generateJWTToken: async function () {
        return await jwt.sign(
            {
                id: this._id, email: this.email, subscription: this.subscription, role: this.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY
            }
        )
    },
    // Comparing a plain password with the hashed password
    comparePassword: async function (plainPassword) {
        return await bcrypt.compare(plainPassword, this.password)
    },
    // Generating a password reset token and updating token and expiry fields in the document
    generatePasswordResetToken: async function () {
        const resetToken = crypto.randomBytes(20).toString('hex')

        this.forgetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        this.forgetPasswordExpiry = Date.now() + 5 * 60 * 1000

        return resetToken
    }
}

// Creating the User model using the defined schema
const User = model('User', userSchema)

// Exporting the User model
export default User
