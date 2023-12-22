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

const createLecture = async (req, res, next) => {

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
        // course
    })
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

        console.log(lectureIndex)

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
    }
    catch (e) {
        console.log(e)
    }
}

const deleteLecture = async (req, res, next) => {
    const { id } = req.params
    const { lectureId } = req.params

    const course = await Course.findById(id)
    if (!course) {
        return next(new AppError('No Course Found', 400))
    }

    const lectureIndex = course.lectures.findIndex(
        (lecture) => lecture._id.toString() === lectureId.toString())

    console.log(lectureIndex)

    if (lectureIndex === -1) {
        return next(new AppError('No Lecture Found', 400))
    }

    await course.deleteOne(course.lectures[lectureIndex])
    await course.save()
    res.status(200).json({
        status: true,
        course
    })
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