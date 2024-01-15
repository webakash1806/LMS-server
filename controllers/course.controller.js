import Course from "../models/course.model.js"
import AppError from "../utils/error.utils.js"
import cloudinary from 'cloudinary'
import fs from 'fs/promises'

/**
 * The function `getCourseLists` retrieves a list of courses from the database, excluding the lecture
 * details, and returns it as a JSON response.
 * @param req - The `req` parameter is the request object that contains information about the HTTP
 * request made by the client. It includes details such as the request method, headers, query
 * parameters, and body.
 * @param res - The `res` parameter is the response object that is used to send the response back to
 * the client. It contains methods and properties that allow you to control the response, such as
 * setting the status code, headers, and sending the response body. In this code, `res.status(200)` is
 * @param next - The `next` parameter is a function that is used to pass control to the next middleware
 * function in the request-response cycle. It is typically used to handle errors or to move on to the
 * next middleware function after completing the current one.
 * @returns a list of courses.
 */
const getCourseLists = async (req, res, next) => {
    try {
        const course = await Course.find({}).select('-lectures')

        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        res.status(200).json({
            success: true,
            message: "Course List",
            course
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

/* The `getLecturesList` function retrieves a list of lectures for a specific course from the database
and returns it as a JSON response. It takes in the `id` parameter from the request URL to identify
the course for which the lectures are being retrieved. If the course is found, it sends a success
response with the lectures list. If the course is not found, it sends an error response indicating
that no course was found. */
const getLecturesList = async (req, res, next) => {
    try {
        /* The below code is written in JavaScript. It is using destructuring assignment to extract the
        `id` property from the `req.params` object. */
        const { id } = req.params

        /* The below code is using JavaScript to find a course by its ID. It is using the `findById`
        method on the `Course` object and passing in the `id` variable as the parameter. The `await`
        keyword is used to wait for the asynchronous operation to complete before continuing with
        the code execution. */
        const course = await Course.findById(id)

        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        res.status(200).json({
            success: true,
            message: "Lectures List",
            lectures: course.lectures
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

/**
 * The `createCourse` function is an asynchronous function that creates a new course with the provided
 * details and saves it to the database.
 * @returns a JSON response with the following properties:
 * - success: a boolean value indicating whether the course creation was successful or not
 * - message: a string message indicating the status of the course creation
 * - course: an object containing the details of the created course
 */
const createCourse = async (req, res, next) => {

    try {
        const { title, description, category, createdBy, price, discount, skills, language, thumbnail } = req.body

        if (!title || !description || !category || !createdBy || !price || !discount || !skills || !language) {
            return next(new AppError('All Fields are required', 400))
        }

        const course = await Course.create({
            title,
            description,
            category,
            createdBy,
            price,
            discount,
            skills,
            language,
            thumbnail: {
                public_id: '',
                secure_url: '',
            }
        })

        if (!course) {
            return next(new AppError('Course is not created', 500))
        }

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms'
            })

            if (result) {
                course.thumbnail.public_id = result.public_id
                course.thumbnail.secure_url = result.secure_url
            }
            fs.rm(`uploads/${req.file.filename}`)
        }

        await course.save()

        res.status(200).json({
            success: true,
            message: "Course created successfully",
            course
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

/**
 * The `updateCourse` function updates a course in a database, including handling the upload of a
 * thumbnail image.
 * @returns a JSON response with the following properties:
 * - success: a boolean value indicating whether the course was updated successfully
 * - message: a string message indicating the status of the update
 * - course: the updated course object
 */
const updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params
        /* The above code is written in JavaScript. It is using destructuring assignment to extract the
        `id` property from the `req.params` object. */

        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set: req.body
            },
            { runValidators: true }
        )

        /* The code `if (!course) { return next(new AppError('No Course Found', 400)) }` is checking if
        the `course` variable is falsy (null, undefined, false, 0, empty string, etc.). If the
        `course` variable is falsy, it means that no course was found in the database. In this case,
        it creates a new `AppError` object with the message 'No Course Found' and a status code of
        400 (Bad Request), and passes it to the `next` function to handle the error and move to the
        next middleware function in the request-response cycle. */
        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        /* This code block is responsible for uploading a thumbnail image for a course to the cloud
        storage service, Cloudinary. */
        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms'
            })

            if (result) {
                course.thumbnail.public_id = await result.public_id
                course.thumbnail.secure_url = await result.secure_url
            }
            fs.rm(`uploads/${req.file.filename}`)
        }

        await course.save()

        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            course
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

/**
 * The deleteCourse function deletes a course from the database based on the provided id and returns a
 * success message.
 * @returns a JSON response with a success message if the course is successfully deleted.
 */
const deleteCourse = async (req, res, next) => {
    try {
        /* The below code is written in JavaScript. It is using destructuring assignment to extract the
        `id` property from the `req.params` object. */
        const { id } = req.params

        /* The below code is using JavaScript to find a course by its ID. It is using the `findById`
        method on the `Course` object and passing in the `id` variable as the parameter. The `await`
        keyword is used to wait for the asynchronous operation to complete before continuing with
        the code execution. */
        const course = await Course.findById(id)

        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        await Course.findByIdAndDelete(id)

        res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

/**
 * The `createLecture` function is an asynchronous function that creates a new lecture and adds it to a
 * course in a Learning Management System (LMS).
 * @returns a JSON response with the following properties:
 * - success: a boolean value indicating whether the operation was successful or not
 * - message: a string message indicating the result of the operation
 * - course: the updated course object
 */
const createLecture = async (req, res, next) => {

    try {
        const { id } = req.params
        const { title, description, lecture } = req.body

        const course = await Course.findById(id)

        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        if (!title, !description) {
            return next(new AppError('All fields are required', 400))
        }

        const lectureData = {
            title,
            description,
            lecture: {
                public_id: '',
                secure_url: '',
            }
        }

        if (!lectureData) {
            return next(new AppError('Failed to save lecture', 400))
        }

        /* The below code is handling file uploads in a Node.js application. */
        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                resource_type: 'video'
            })

            if (result) {
                lectureData.lecture.public_id = result.public_id
                lectureData.lecture.secure_url = result.secure_url
            }
            fs.rm(`uploads/${req.file.filename}`)
        }

        course.lectures.push(lectureData)
        course.numberOfLecture = course.lectures.length

        await course.save()

        res.status(200).json({
            success: true,
            message: "Lectures successfully added to the course",
            course
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

/**
 * The function `updateLecture` updates the details of a lecture in a course, including the title,
 * description, and lecture video.
 * @returns a JSON response with a success status and the updated course object.
 */
const updateLecture = async (req, res, next) => {
    try {
        const { id } = req.params
        const { lectureId } = req.params
        const { title, description, lecture } = req.body

        const course = await Course.findById(id)

        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        const lectureIndex = course.lectures.findIndex(
            (lecture) => lecture._id.toString() === lectureId.toString())

        if (lectureIndex === -1) {
            return next(new AppError('No Lecture Found', 400))
        }

        if (title) {
            course.lectures[lectureIndex].title = await title
        }

        if (description) {
            course.lectures[lectureIndex].description = await description
        }

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                resource_type: 'video'
            })

            if (result) {
                course.lectures[lectureIndex].lecture.public_id = result.public_id
                course.lectures[lectureIndex].lecture.secure_url = result.secure_url
            }
            fs.rm(`uploads/${req.file.filename}`)
        }

        await course.save()
        res.status(200).json({
            success: true,
            course
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

/**
 * The `deleteLecture` function is an asynchronous function that deletes a lecture from a course and
 * updates the course's lecture count.
 * @returns a JSON response with the status, message, and updated course object.
 */
const deleteLecture = async (req, res, next) => {
    try {
        const { id } = req.params
        const { lectureId } = req.params

        const course = await Course.findById(id)
        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        const lectureIndex = course.lectures.findIndex(
            (lecture) => lecture._id.toString() === lectureId.toString())

        if (lectureIndex === -1) {
            return next(new AppError('No Lecture Found', 400))
        }

        await cloudinary.v2.uploader.destroy(
            course.lectures[lectureIndex].lecture.public_id,
            {
                resource_type: 'video',
            }
        );

        course.lectures.splice(lectureIndex, 1)
        course.numberOfLecture = course.lectures.length

        await course.save()

        res.status(200).json({
            status: true,
            message: "Lecture deleted successfully",
            course
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

/* The below code is exporting a set of functions related to managing courses and lectures. These
functions include: */
export {
    getCourseLists,
    getLecturesList,
    createCourse,
    updateCourse,
    deleteCourse,
    createLecture,
    updateLecture,
    deleteLecture
}