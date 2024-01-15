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

import { isLoggedIn, authorizedUser, authorizedSubscriber } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js'


/* `const router = Router();` is creating a new instance of the Express Router. The Router is a
middleware function that allows us to define routes for our application. It provides methods to
define different HTTP methods (GET, POST, PUT, DELETE) and their corresponding route handlers. */
const router = Router();

/* `router.route('/').get(getCourseLists)` is defining a route for the root URL ("/") with the HTTP GET
method. When a GET request is made to the root URL, the `getCourseLists` function from the
`course.controller.js` file will be executed. */
router.route('/').get(getCourseLists)

/* `router.route('/:id').get(isLoggedIn, authorizedSubscriber, getLecturesList)` is defining a route
for the URL pattern "/:id" with the HTTP GET method. */
router.route('/:id').get(isLoggedIn, authorizedSubscriber, getLecturesList)

/* The `router.post('/create', upload.single("thumbnail"), isLoggedIn, authorizedUser("ADMIN"),
createCourse)` is defining a route for the URL pattern "/create" with the HTTP POST method. */
router.post('/create', upload.single("thumbnail"), isLoggedIn, authorizedUser("ADMIN"), createCourse)

/* The `router.put('/update/:id', upload.single("thumbnail"), isLoggedIn, authorizedUser("ADMIN"),
updateCourse)` is defining a route for the URL pattern "/update/:id" with the HTTP PUT method. */
router.put('/update/:id', upload.single("thumbnail"), isLoggedIn, authorizedUser("ADMIN"), updateCourse)

/* The `router.delete('/remove/:id', isLoggedIn, authorizedUser("ADMIN"), deleteCourse)` is defining a
route for the URL pattern "/remove/:id" with the HTTP DELETE method. */
router.delete('/remove/:id', isLoggedIn, authorizedUser("ADMIN"), deleteCourse)

/* The `router.post('/create/lectures/:id', upload.single("lecture"), isLoggedIn,
authorizedUser("ADMIN"), createLecture)` is defining a route for the URL pattern
"/create/lectures/:id" with the HTTP POST method. */
router.post('/create/lectures/:id', upload.single("lecture"), isLoggedIn, authorizedUser("ADMIN"), createLecture)

router.put('/update/lectures/:id/:lectureId', upload.single("lecture"), isLoggedIn, authorizedUser("ADMIN"), updateLecture)

router.delete('/remove/lectures/:id/:lectureId', isLoggedIn, authorizedUser("ADMIN"), deleteLecture)

export default router