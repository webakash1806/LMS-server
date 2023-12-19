import { Router } from 'express'
import { getCourseLists, getLecturesList } from '../controllers/course.controller.js';

const router = Router();

router.get('/', getCourseLists)
router.get('/:id', getLecturesList)

export default router