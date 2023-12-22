import { Router } from 'express'
import {
    createCourse,
    createLecture,
    deleteCourse,
    deleteLecture,
    getCourseLists,
    getLecturesList,
    updateCourse,
    updateLecture
} from '../controllers/course.controller.js';

import { isLoggedIn, authorizedUser } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js'


const router = Router();

router.route('/').get(getCourseLists)

router.route('/:id').get(isLoggedIn, getLecturesList)

router.post('/create', upload.single("thumbnail"), isLoggedIn, authorizedUser("ADMIN"), createCourse)


router.put('/update/:id', isLoggedIn, authorizedUser("ADMIN"), updateCourse)

router.delete('/remove/:id', isLoggedIn, authorizedUser("ADMIN"), deleteCourse)

router.post('/create/lectures/:id', upload.single("lecture"), isLoggedIn, authorizedUser("ADMIN"), createLecture)

router.put('/update/lectures/:id/:lectureId', upload.single("lecture"), isLoggedIn, authorizedUser("ADMIN"), updateLecture)

router.delete('/remove/lectures/:id/:lectureId', isLoggedIn, authorizedUser("ADMIN"), deleteLecture)

export default router