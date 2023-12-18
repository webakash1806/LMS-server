import { model, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const userSchema = new Schema({
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    userName: {
        type: String,
        unique: true,
        lowercase: true,
        required: true,
    },
    fullName: {
        type: 'String',
        required: [true, 'Name is Required'],
        minLength: [5, 'Name must be more than 5 character'],
        maxLength: [30, 'Name should not be more than 30 character'],
        trim: true
    },
    email: {
        type: 'String',
        required: [true, 'Email is required'],
        unique: true,
        match: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter valid email']
    },
    password: {
        type: 'String',
        required: [true, 'Password is *'],
        select: false
    },
    confirmPassword: {
        type: 'String',
        required: [true, 'Confirm Password is *'],
        trim: true,
        select: false
    },
    avatar: {
        publicId: {
            type: 'String',
        },
        secure_url: {
            type: 'String',
        }
    },
    forgetPasswordToken: 'String',
    forgetPasswordExpiry: Date,

}, { timestamps: true })

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.isModified('confirmPassword')) {
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10)
    this.confirmPassword = await bcrypt.hash(this.confirmPassword, 10)
})

userSchema.methods = {
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
    comparePassword: async function (plainPassword) {
        return await bcrypt.compare(plainPassword, this.password)
    },
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

const User = model('User', userSchema)

export default User