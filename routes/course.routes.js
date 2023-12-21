import { Router } from 'express'
import { createCourse, deleteCourse, getCourseLists, getLecturesList, updateCourse } from '../controllers/course.controller.js';
import { isLoggedIn, authorizedUser } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js'


const router = Router();

router.route('/').get(getCourseLists)

router.route('/:id').get(isLoggedIn, getLecturesList)

router.post('/create', upload.single("thumbnail"), isLoggedIn, authorizedUser("ADMIN"), createCourse)

router.put('/update/:id', isLoggedIn, authorizedUser("ADMIN"), updateCourse)

router.delete('/remove/:id', isLoggedIn, authorizedUser("ADMIN"), deleteCourse)

export default router