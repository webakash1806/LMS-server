import Course from "../models/course.model.js"

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

export {
    getCourseLists,
    getLecturesList,
}