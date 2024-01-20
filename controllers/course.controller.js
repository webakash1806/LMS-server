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
        // Fetching courses from the database (excluding lecture details)
        const course = await Course.find({}).select('-lectures')

        // Handling case where no courses are found
        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        // Sending successful response with the list of courses
        res.status(200).json({
            success: true,
            message: "Course List",
            course
        })
    } catch (e) {
        // Handling internal server error
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
        // Extracting the `id` parameter from the request URL
        const { id } = req.params

        // Finding the course by its ID
        const course = await Course.findById(id)

        // Handling case where no course is found
        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        // Sending successful response with the list of lectures
        res.status(200).json({
            success: true,
            message: "Lectures List",
            lectures: course.lectures
        })
    } catch (e) {
        // Handling internal server error
        return next(new AppError(e.message, 500))
    }
}

/**
 * Creates a new course with the provided details and saves it to the database.
 * @returns {object} - A JSON response indicating the status of the course creation.
 */
const createCourse = async (req, res, next) => {

    try {
        // Extracting necessary details from the request body
        const { title, description, category, createdBy, price, discount, skills, language, thumbnail } = req.body

        // Validating required fields
        if (!title || !description || !category || !createdBy || !price || !discount || !skills || !language) {
            return next(new AppError('All Fields are required', 400))
        }

        // Creating a new course in the database
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

        // Handling case where course creation fails
        if (!course) {
            return next(new AppError('Course is not created', 500))
        }

        // Uploading thumbnail image to Cloudinary if provided
        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms'
            })

            // Updating course thumbnail details
            if (result) {
                course.thumbnail.public_id = result.public_id
                course.thumbnail.secure_url = result.secure_url
            }
            // Removing temporary file
            fs.rm(`uploads/${req.file.filename}`)
        }

        // Saving the updated course to the database
        await course.save()

        // Sending successful response with the created course details
        res.status(200).json({
            success: true,
            message: "Course created successfully",
            course
        })
    } catch (e) {
        // Handling internal server error
        return next(new AppError(e.message, 500))
    }
}

/**
 * Updates a course in the database, including handling the upload of a thumbnail image.
 * @returns {object} - A JSON response indicating the status of the course update.
 */
const updateCourse = async (req, res, next) => {
    try {
        // Extracting necessary details from the request parameters
        const { id } = req.params

        // Finding the course by its ID
        const course = await Course.findById(id)

        // Extracting details from the request body
        const { title, description, category, createdBy, price, discount, skills, language, thumbnail } = req.body

        // Handling case where no course is found
        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        // Updating course details if provided
        if (title) {
            course.title = await title
        }

        // (Similar updates for other fields...)
        if (description) {
            course.description = await description
        }

        if (category) {
            course.category = await category
        }

        if (createdBy) {
            course.createdBy = await createdBy
        }

        if (price) {
            course.price = await price
        }

        if (discount) {
            course.discount = await discount
        }

        if (skills) {
            course.skills = await skills
        }

        if (language) {
            course.language = await language
        }

        // Handling thumbnail image upload to Cloudinary if provided
        if (req.file) {

            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms'
            })

            // Updating course thumbnail details
            if (result) {
                course.thumbnail.public_id = result.public_id
                course.thumbnail.secure_url = result.secure_url
            }

            // Removing temporary file
            fs.rm(`uploads/${req.file.filename}`)
        }

        // Saving the updated course to the database
        await course.save()

        // Sending successful response with the updated course details
        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            course
        })
    } catch (e) {
        // Handling internal server error
        return next(new AppError(e.message, 500))
    }
}

/**
 * Deletes a course from the database based on the provided id and returns a success message.
 * @returns {object} - A JSON response with a success message if the course is successfully deleted.
 */
const deleteCourse = async (req, res, next) => {
    try {
        // Extracting the `id` parameter from the request parameters
        const { id } = req.params

        // Finding the course by its ID
        const course = await Course.findById(id)

        // Handling case where no course is found
        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        // Deleting the course from the database
        await Course.findByIdAndDelete(id)

        // Sending successful response with a delete message
        res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        })
    } catch (e) {
        // Handling internal server error
        return next(new AppError(e.message, 500))
    }
}

/**
 * Creates a new lecture and adds it to a course in a Learning Management System (LMS).
 * Returns a JSON response indicating the success of the operation.
 *
 * @param {Object} req - The request object containing information about the HTTP request.
 * @param {Object} res - The response object used to send the response back to the client.
 * @param {Function} next - Function to pass control to the next middleware.
 * @returns {JSON} - Success message and details of the updated course with added lectures.
 */
const createLecture = async (req, res, next) => {

    try {
        // Extract course ID from the request parameters
        const { id } = req.params

        // Extract relevant details from the request body
        const { title, description, lecture } = req.body

        // Find the course by ID
        const course = await Course.findById(id)

        // Check if the course exists
        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        // Validate required fields
        if (!title, !description) {
            return next(new AppError('All fields are required', 400))
        }

        // Initialize lecture data
        const lectureData = {
            title,
            description,
            lecture: {
                public_id: '',
                secure_url: '',
            }
        }

        // Check if lecture data is successfully created
        if (!lectureData) {
            return next(new AppError('Failed to save lecture', 400))
        }

        // Upload lecture video to Cloudinary if a file is provided
        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                resource_type: 'video'
            })

            if (result) {
                lectureData.lecture.public_id = result.public_id
                lectureData.lecture.secure_url = result.secure_url
            }
            // Remove the uploaded file from the local server
            fs.rm(`uploads/${req.file.filename}`)
        }

        // Add the new lecture to the course and update the lecture count
        course.lectures.push(lectureData)
        course.numberOfLecture = course.lectures.length

        // Save the updated course to the database
        await course.save()

        // Send a success response indicating the addition of lectures to the course
        res.status(200).json({
            success: true,
            message: "Lectures successfully added to the course",
            course
        })
    } catch (e) {
        // Handle unexpected errors
        return next(new AppError(e.message, 500))
    }
}

/**
 * Updates the details of a lecture in a course, including the title, description, and lecture video.
 * Returns a JSON response indicating the success of the operation.
 *
 * @param {Object} req - The request object containing information about the HTTP request.
 * @param {Object} res - The response object used to send the response back to the client.
 * @param {Function} next - Function to pass control to the next middleware.
 * @returns {JSON} - Success message and details of the updated course with modified lecture.
 */
const updateLecture = async (req, res, next) => {
    try {
        // Extract course and lecture IDs from the request parameters
        const { id } = req.params
        const { lectureId } = req.params

        // Extract relevant details from the request body

        const { title, description, lecture } = req.body

        // Find the course by ID
        const course = await Course.findById(id)

        // Check if the course exists
        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        // Find the index of the lecture in the course's lectures array
        const lectureIndex = course.lectures.findIndex(
            (lecture) => lecture._id.toString() === lectureId.toString())

        // Check if the lecture exists
        if (lectureIndex === -1) {
            return next(new AppError('No Lecture Found', 400))
        }

        // Update lecture details if provided
        if (title) {
            course.lectures[lectureIndex].title = await title
        }

        // Similar updates for other fields...
        if (description) {
            course.lectures[lectureIndex].description = await description
        }

        // Upload new lecture video to Cloudinary if a file is provided
        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                resource_type: 'video'
            })

            if (result) {
                course.lectures[lectureIndex].lecture.public_id = result.public_id
                course.lectures[lectureIndex].lecture.secure_url = result.secure_url
            }
            // Remove the uploaded file from the local server
            fs.rm(`uploads/${req.file.filename}`)
        }

        // Save the updated course to the database
        await course.save()

        // Send a success response with details of the updated course
        res.status(200).json({
            success: true,
            course
        })
    } catch (e) {
        // Handle unexpected errors
        return next(new AppError(e.message, 500))
    }
}

/**
 * Deletes a lecture from a course and updates the course's lecture count.
 * Returns a JSON response indicating the success of the operation.
 *
 * @param {Object} req - The request object containing information about the HTTP request.
 * @param {Object} res - The response object used to send the response back to the client.
 * @param {Function} next - Function to pass control to the next middleware.
 * @returns {JSON} - Success message and details of the updated course after deleting the lecture.
 */
const deleteLecture = async (req, res, next) => {
    try {
        // Extract course and lecture IDs from the request parameters
        const { id } = req.params
        const { lectureId } = req.params

        // Find the course by ID
        const course = await Course.findById(id)

        // Check if the course exists
        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        // Find the index of the lecture in the course's lectures array
        const lectureIndex = course.lectures.findIndex(
            (lecture) => lecture._id.toString() === lectureId.toString())

        // Check if the lecture exists
        if (lectureIndex === -1) {
            return next(new AppError('No Lecture Found', 400))
        }

        // Delete the lecture video from Cloudinary
        await cloudinary.v2.uploader.destroy(
            course.lectures[lectureIndex].lecture.public_id,
            {
                resource_type: 'video',
            }
        );

        // Remove the lecture from the course's lectures array
        course.lectures.splice(lectureIndex, 1)

        // Update the course's lecture count
        course.numberOfLecture = course.lectures.length

        // Save the updated course to the database
        await course.save()

        // Send a success response with details of the updated course
        res.status(200).json({
            status: true,
            message: "Lecture deleted successfully",
            course
        })
    } catch (e) {
        // Handle unexpected errors
        return next(new AppError(e.message, 500))
    }
}

// Exporting the functions for use in other modules
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