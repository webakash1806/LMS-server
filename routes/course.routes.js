import { Router } from 'express'
import { getCourseLists, getLecturesList } from '../controllers/course.controller.js';
import { isLoggedIn } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/').get(getCourseLists)
router.route('/:id').get(isLoggedIn, getLecturesList)

export default router