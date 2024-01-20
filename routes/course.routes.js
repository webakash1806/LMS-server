// Importing the 'Router' class from the 'express' module
import { Router } from 'express';

// Importing various controller functions and middleware from respective files
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

import { isLoggedIn, authorizedUser, authorizedSubscriber } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

// Creating a new instance of the Express Router
const router = Router();

// Route to get the list of courses (HTTP GET method)
router.route('/').get(getCourseLists);

// Route to get the list of lectures for a specific course (HTTP GET method)
router.route('/:id').get(isLoggedIn, authorizedSubscriber, getLecturesList);

// Route to create a new course (HTTP POST method)
router.post('/create', upload.single("thumbnail"), isLoggedIn, authorizedUser("ADMIN"), createCourse);

// Route to update an existing course (HTTP PUT method)
router.put('/update/:id', upload.single("thumbnail"), isLoggedIn, authorizedUser("ADMIN"), updateCourse);

// Route to delete an existing course (HTTP DELETE method)
router.delete('/remove/:id', isLoggedIn, authorizedUser("ADMIN"), deleteCourse);

// Route to create a new lecture for a specific course (HTTP POST method)
router.post('/create/lectures/:id', upload.single("lecture"), isLoggedIn, authorizedUser("ADMIN"), createLecture);

// Route to update an existing lecture for a specific course (HTTP PUT method)
router.put('/update/lectures/:id/:lectureId', upload.single("lecture"), isLoggedIn, authorizedUser("ADMIN"), updateLecture);

// Route to delete an existing lecture for a specific course (HTTP DELETE method)
router.delete('/remove/lectures/:id/:lectureId', isLoggedIn, authorizedUser("ADMIN"), deleteLecture);

// Exporting the router instance for use in other parts of the application
export default router;
