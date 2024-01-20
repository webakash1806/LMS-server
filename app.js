import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from 'dotenv'
import morgan from 'morgan'
import userRoutes from './routes/user.routes.js'
import courseRoutes from './routes/course.routes.js'
import paymentRoutes from './routes/payment.routes.js'
import miscRoutes from './routes/Misc.routes.js'
import errorMiddleware from './middlewares/error.middleware.js'
config()

// Creating an instance of the Express application
const app = express()

// Middleware setup to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Middleware setup to parse JSON data from incoming requests
app.use(express.json())

// Middleware setup to parse cookies from incoming requests
app.use(cookieParser())

// Setting up CORS (Cross-Origin Resource Sharing) middleware for Express
// Example usage:
// If the 'FRONTEND_URL' is set to 'https://example.com', then only requests
// originating from 'https://example.com' will be allowed, and credentials will be included.
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}))

// Applying the 'dev' format logging to all routes
app.use(morgan('dev'))

// Middleware setup for handling requests to the '/ping' endpoint
app.use('/ping', function (req, res) {
    // When a request is made to '/ping', respond with the string '/pong'
    res.send('/pong')
})

// Mounting userRoutes for handling routes related to user in the '/api/v1/user' path
/**'/api/v1/user': Mounts the 'userRoutes' to handle routes related to user
     functionality under the '/api/v1/user' path. For example, you might have
     routes for user registration, login, profile, logout etc. */
app.use('/api/v1/user', userRoutes)

// Mounting courseRoutes for handling routes related to courses in the '/api/v1/course' path
/*'/api/v1/course': Mounts the 'courseRoutes' to handle routes related to courses
     under the '/api/v1/course' path. This could include routes for listing courses,
     creating a new course, updating a course, etc.*/
app.use('/api/v1/course', courseRoutes)


// Mounting paymentRoutes for handling routes related to payments in the '/api/v1/payment' path
/**'/api/v1/payment': Mounts the 'paymentRoutes' to handle routes related to payments
     under the '/api/v1/payment' path. These routes might involve processing payments,
     viewing payment history, and so on. */
app.use('/api/v1/payment', paymentRoutes)

// Mounting 'miscRoutes' middleware at the '/api/v1' path
app.use('/api/v1', miscRoutes)


// This route handler is a catch-all (*) for any request that hasn't been handled by previous routes.
// It responds with a 404 status code and sends a simple 'OOPS! 404 Page not found' message.
app.all('*', (req, res) => {
    res.status(404).send('OOPS! 404 Page not found')
})

/**The 'app.use' function is used to mount middleware in an Express.js application.
   In this case, 'errorMiddleware' is registered as error-handling middleware. */
app.use(errorMiddleware)

export default app