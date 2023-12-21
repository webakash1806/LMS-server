import { Router } from 'express'
import { createCourse, deleteCourse, getCourseLists, getLecturesList, updateCourse } from '../controllers/course.controller.js';
import { isLoggedIn } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js'


const router = Router();

router.route('/').get(getCourseLists)
router.route('/:id').get(isLoggedIn, getLecturesList)
router.post('/create', upload.single("thumbnail"), isLoggedIn, createCourse)
router.put('/update/:id', isLoggedIn, updateCourse)
router.delete('/remove/:id', isLoggedIn, deleteCourse)

export default router