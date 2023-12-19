// import Course from "../models/course.model"

const getCourseLists = async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "I am course List"
    })
}

const getLecturesList = async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "I am Lectures List"
    })
}

export {
    getCourseLists,
    getLecturesList,
}