import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from 'dotenv'
import morgan from 'morgan'
import userRoutes from './routes/user.routes.js'
import courseRoutes from './routes/course.routes.js'
import errorMiddleware from './middlewares/error.middleware.js'
config()

const app = express()

app.use(express.urlencoded({ extended: true }));

app.use(express.json())
// app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}))

app.use(morgan('dev'))

app.use('/ping', function (req, res) {
    res.send('/pong')
})

app.use('/api/v1/user', userRoutes)

app.use('/api/v1/course', courseRoutes)

app.all('*', (req, res) => {
    res.status(404).send('OOPS! 404 Page not found')
})

app.use(errorMiddleware)

export default app