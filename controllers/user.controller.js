import User from "../models/user.models.js"
import AppError from "../utils/error.utils.js"
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import bcrypt from 'bcryptjs'
import sendEmail from "../utils/sendEmail.js"
import crypto from 'crypto'

const cookieOption = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    // httpOnly: true,
    // secure: true
}

const register = async (req, res, next) => {
    try {
        const { userName, fullName, email, password, confirmPassword } = req.body

        if (!userName || !fullName || !email || !password || !confirmPassword) {
            return next(new AppError('All Fields are required', 400))
        }

        const uniqueUser = await User.findOne({ userName })
        if (uniqueUser) {
            return next(new AppError('UserName already exists', 400))
        }

        const uniqueEmail = await User.findOne({ email })
        if (uniqueEmail) {
            return next(new AppError('Email is already registered', 400))
        }

        const user = await User.create({
            userName,
            fullName,
            email,
            password,
            confirmPassword,
            avatar: {
                publicId: '',
                secure_url: ''
            }
        })

        if (!user) {
            return next(new AppError('Registration Failed!', 400))
        }

        if (req.file) {
            // console.log(req.file)
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms',
                    width: 250,
                    height: 250,
                    gravity: 'faces',
                    crop: 'fill',
                })
                if (result) {
                    user.avatar.publicId = result.public_id
                    user.avatar.secure_url = result.secure_url

                    fs.rm(`uploads/${req.file.filename}`)
                }
            }
            catch (err) {
                return next(new AppError('File can not get uploaded', 500))
            }
        }

        const token = await user.generateJWTToken()

        res.cookie('token', token, cookieOption)

        if (password === confirmPassword) {
            await user.save()
            user.password = undefined
            user.confirmPassword = undefined
            res.status(201).json({
                success: true,
                message: 'User registered Successfully'
            })
        }
        else {
            return next(new AppError('Password and Confirm Password must be same', 400))
        }
    } catch (err) {
        return next(new AppError(err.message, 500))
    }

}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return next(new AppError('Email and Password is required', 400))
        }

        const user = await User.findOne({
            email
        }).select('+password')

        console.log(user)

        if (!user) {
            return next(new AppError('Email is not registered', 400))
        }

        const passwordCheck = await user.comparePassword(password)
        if (!passwordCheck) {
            return next(new AppError('Password is wrong', 400))
        }

        const token = await user.generateJWTToken()
        res.cookie('token', token, cookieOption)

        res.status(200).json({
            success: true,
            message: 'Login Successfull!',
            user
        })

    }
    catch (err) {
        return next(new AppError(err.message, 500))
    }

}

const logout = (req, res) => {
    const token = ""
    const cookiesOption = { logoutAt: new Date(), httpOnly: true }

    try {
        res.cookie("token", token, cookiesOption)
        res.status(200).json({ success: true, message: "Logged out" })
    }
    catch (e) {
        return res.status(500).json({ success: false, message: e.message })
    }
}

const profile = async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findById(userId)

        res.status(200).json({
            success: true,
            message: "User Details",
            user
        })
    }
    catch (err) {
        return next(new AppError("Failed to fetch" + err.message, 500))
    }
}

const forgotPassword = async (req, res, next) => {
    const { email } = req.body
    if (!email) {
        return next(new AppError("Email is Required", 400))
    }

    const user = await User.findOne({ email })

    if (!user) {
        return next(new AppError("Email is not registered", 400))
    }

    const resetToken = await user.generatePasswordResetToken()
    await user.save()

    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    const subject = 'Reset Password'
    const message = `Reset your Password by clicking on this link <a href=${resetPasswordURL}/>`

    try {
        await sendEmail(email, subject, message)

        res.status(200).json({
            success: true,
            message: 'Password reset link has been sent to your email'
        })


    } catch (e) {
        user.forgetPasswordExpiry = undefined
        user.forgetPasswordToken = undefined

        await user.save()
        return next(new AppError(e.message, 500))
    }

}

const resetPassword = async (req, res, next) => {
    try {
        const { resetToken } = req.params
        const { password } = req.body

        console.log(resetToken)

        const forgetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        console.log(forgetPasswordToken)

        const user = await User.findOne({
            forgetPasswordToken,
            forgetPasswordExpiry: { $gt: Date.now() }
        })


        if (!user) {
            return next(new AppError('Token is Invalid or expired! please resend it', 400))
        }

        if (!password) {
            return next(new AppError('Please Enter new Password', 400))
        }

        user.password = await bcrypt.hash(password, 10)
        user.forgetPasswordToken = undefined
        user.forgetPasswordExpiry = undefined

        await user.save()

        res.status(200).json({
            success: true,
            message: 'Password reset successfull'
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }

}

const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body
        const { id } = req.user

        if (!oldPassword || !newPassword) {
            return next(new AppError('All fields are required', 400))
        }

        if (oldPassword === newPassword) {
            return next(new AppError('New password is same as old password', 400))
        }

        const user = await User.findById(id).select('+password')

        if (!user) {
            return next(new AppError('User does not exist', 400))
        }

        const passwordValid = await user.comparePassword(oldPassword)

        if (!passwordValid) {
            return next(new AppError('Old Password is wrong', 400))
        }

        user.password = await bcrypt.hash(newPassword, 10)

        await user.save()

        user.password = undefined

        res.status(200).json({
            status: true,
            message: 'Password Changed successfully'
        })
    }
    catch (e) {
        return next(new AppError(e.message, 500))
    }

}


const updateProfile = async (req, res, next) => {
    try {
        const { fullName } = req.body
        const { id } = req.user

        const user = await User.findById(id)

        if (!user) {
            return next(new AppError('User does not exist', 400))
        }


        if (fullName) {
            user.fullName = await fullName
        }


        if (req.file) {
            await cloudinary.v2.uploader.destroy(user.avatar.publicId)
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms',
                    width: 250,
                    height: 250,
                    gravity: 'faces',
                    crop: 'fill',
                })
                if (result) {
                    user.avatar.publicId = result.public_id
                    user.avatar.secure_url = result.secure_url

                    fs.rm(`uploads/${req.file.filename}`)
                }
            }
            catch (err) {
                return next(new AppError('File can not get uploaded', 500))
            }
        }

        await user.save()

        res.status(200).json({
            success: true,
            message: 'User Detail updated successfully'
        })
    }
    catch (e) {
        return next(new AppError(e.message, 500))
    }

}

export {
    register,
    login,
    logout,
    profile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile
}