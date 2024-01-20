// Importing the 'model' and 'Schema' from the Mongoose library
import { model, Schema } from 'mongoose';

/* 
   Defining a Mongoose schema for a course. 
   The schema specifies the structure and validation rules for the course object.
*/
const courseSchema = new Schema({
    // Title of the course
    title: {
        type: 'String',
        required: [true, 'Title is required'],
        minLength: [5, 'Title must be at least 5 characters'],
        maxLength: [59, 'Title should be less than 60 characters'],
        trim: true,
    },
    // Description of the course
    description: {
        type: 'String',
        required: [true, 'Description is required'],
        minLength: [200, 'Description must be at least 200 characters'],
        maxLength: [500, 'Description should be less than 500 characters'],
        trim: true,
    },
    // Category of the course
    category: {
        type: 'String',
        required: [true, 'Category is required']
    },
    // Price of the course
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    // Discount applied to the course
    discount: {
        type: Number,
        required: [true, 'Discount is required']
    },
    // Language of the course
    language: {
        type: 'String',
        required: [true, 'Language is required']
    },
    // Skills required for the course
    skills: {
        type: 'String',
        required: [true, 'Skills are required'],
        minLength: [6, 'Skills must be at least 6 characters'],
        maxLength: [100, 'Skills should be less than 100 characters'],
        trim: true,
    },
    // Thumbnail information for the course
    thumbnail: {
        public_id: {
            type: 'String',
            // required: true
        },
        secure_url: {
            type: 'String',
            // required: true
        }
    },
    // Array of lectures within the course
    lectures: [
        {
            // Title of the lecture
            title: {
                type: 'String',
                required: [true, 'Title is required'],
                minLength: [8, 'Title must be at least 8 characters'],
                maxLength: [100, 'Title should be less than 100 characters'],
                trim: true,
            },
            // Description of the lecture
            description: {
                type: 'String',
                required: [true, 'Description is required'],
                minLength: [30, 'Description must be at least 30 characters'],
                maxLength: [400, 'Description should be less than 400 characters'],
                trim: true,
            },
            // Information about the lecture
            lecture: {
                public_id: {
                    type: 'String',
                    // required: true
                },
                secure_url: {
                    type: 'String',
                    // required: true
                }
            }
        }
    ],
    // Number of lectures in the course (default is set to 0)
    numberOfLecture: {
        type: 'Number',
        default: 0,
    },
    // Creator or author of the course
    createdBy: {
        type: 'String',
        required: true
    }
}, {
    // Including timestamps for created and updated timestamps
    timestamps: true
});

/* 
   Creating a Mongoose model named "Course" based on the defined schema "courseSchema".
   This model can be used to interact with the MongoDB database for courses.
*/
const Course = model('Course', courseSchema);

// Exporting the "Course" model to be used in other parts of the application
export default Course;
