import Course from "../models/course.model.js"
import AppError from "../utils/error.utils.js"
import cloudinary from 'cloudinary'
import fs from 'fs/promises'

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
        return next(new AppError(e.message + 500))
    }
}

const getLecturesList = async (req, res, next) => {
    try {
        const { id } = req.params

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
        return next(new AppError(e.message + 500))
    }
}

const createCourse = async (req, res, next) => {

    try {
        const { title, description, category, createdBy, thumbnail } = req.body

        if (!title || !description || !category || !createdBy) {
            return next(new AppError('All Fields are required', 400))
        }

        const course = await Course.create({
            title,
            description,
            category,
            createdBy,
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
        return next(new AppError(e.message + 500))
    }
}

const updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params
        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set: req.body
            },
            { runValidators: true }
        )


        if (!course) {
            return next(new AppError('No Course Found', 400))
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
            message: "Course updated successfully",
            course
        })
    } catch (e) {
        return next(new AppError(e.message + 500))
    }
}

const deleteCourse = async (req, res, next) => {
    try {
        const { id } = req.params

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
        return next(new AppError(e.message + 500))
    }
}

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

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms'
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
        return next(new AppError(e.message + 500))
    }
}

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
                folder: 'lms'
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
        return next(new AppError(e.message + 500))
    }
}

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

        course.lectures.pop(course.lectures[lectureIndex])
        course.numberOfLecture = course.lectures.length

        await course.save()

        res.status(200).json({
            status: true,
            message: "Lecture deleted successfully",
            course
        })
    } catch (e) {
        return next(new AppError(e.message + 500))
    }
}

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