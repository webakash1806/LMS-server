import { Router } from "express";
import { register, login, logout, profile, forgotPassword, resetPassword, changePassword, updateProfile } from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { loginAuth } from "../middlewares/login.middleware.js";
import upload from '../middlewares/multer.middleware.js'

const router = Router()

router.post('/register', upload.single("avatar"), register)
router.post('/login', loginAuth, login)
router.get('/logout', logout)
router.get('/me', isLoggedIn, profile)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:resetToken', resetPassword)
router.post('/change-password', isLoggedIn, changePassword)
router.put('/update-profile', isLoggedIn, upload.single("avatar"), updateProfile)

export default router