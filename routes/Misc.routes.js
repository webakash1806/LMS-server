// Importing the 'Router' class from the 'express' module
import { Router } from "express";

// Importing middleware functions from the 'auth.middleware.js' file
import { isLoggedIn, authorizedUser } from "../middlewares/auth.middleware.js";

// Importing the 'userStats' controller function from the 'misc.controller.js' file
import { userStats } from "../controllers/misc.controller.js";

// Creating an instance of the 'Router' class to define routes
const router = Router();

// Defining a route for handling GET requests to '/admin/stats'
// Middleware functions 'isLoggedIn' and 'authorizedUser' are used to check authentication and user roles
// The 'userStats' controller function is responsible for handling the actual logic of the route
router.route('/admin/stats').get(isLoggedIn, authorizedUser('ADMIN'), userStats);

// Exporting the router instance to be used in other parts of the application
export default router;
