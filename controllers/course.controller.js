import Course from "../models/course.model.js"
import AppError from "../utils/error.utils.js"
import cloudinary from 'cloudinary'
import fs from 'fs/promises'

const getCourseLists = async (req, res, next) => {
    const course = await Course.find({}).select('-lectures')


    try {
        res.status(200).json({
            success: true,
            message: "Course List",
            course
        })
    } catch (e) {
        console.log(e)
    }
}

const getLecturesList = async (req, res, next) => {
    const { id } = req.params

    const course = await Course.findById(id)
    if (!course) {
        console.log("no course found")
    }

    try {
        res.status(200).json({
            success: true,
            message: "Lectures List",
            lectures: course.lectures
        })
    } catch (e) {
        console.log(e)
    }
}

const createCourse = async (req, res, next) => {

    const { title, description, category, createdBy, numberOfLecture, thumbnail } = req.body

    if (!title || !description || !category || !createdBy || !numberOfLecture) {
        return next(new AppError('All Fields are required', 400))
    }

    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        numberOfLecture,
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
        message: "Course created successfully"
    })
}

const updateCourse = async (req, res, next) => {
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

    await course.save()

    res.status(200).json({
        success: true,
        message: "Course updated successfully",
    })
}

const deleteCourse = async (req, res, next) => {
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
}

export {
    getCourseLists,
    getLecturesList,
    createCourse,
    updateCourse,
    deleteCourse
}