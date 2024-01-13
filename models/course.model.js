import { model, Schema } from 'mongoose'


const courseSchema = new Schema({
    title: {
        type: 'String',
        required: [true, 'Title is required'],
        minLength: [6, 'Title must be atleast 6 characters'],
        maxLength: [59, 'Title should be less than 60 characters'],
        trim: true,
    },
    description: {
        type: 'String',
        required: [true, 'Description is required'],
        minLength: [200, 'Description must be atleast 200 characters'],
        maxLength: [500, 'Description should be less than 500 characters'],
        trim: true,
    },
    category: {
        type: 'String',
        required: [true, 'Category is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    discount: {
        type: Number,
        required: [true, 'Discount is required']
    },
    language: {
        type: 'String',
        required: [true, 'Language is required']
    },
    skills: {
        type: 'String',
        required: [true, 'Description is required'],
        minLength: [6, 'skills must be atleast 6 characters'],
        maxLength: [100, 'skills should be less than 100 characters'],
        trim: true,
    },
    thumbnail: {
        public_id: {
            type: String,
            // required: true
        },
        secure_url: {
            type: String,
            // required: true
        }
    },
    lectures: [
        {
            title: {
                type: 'String',
                required: [true, 'Title is required'],
                minLength: [8, 'Title must be atleast 8 characters'],
                maxLength: [100, 'Title should be less than 100 characters'],
                trim: true,
            },
            description: {
                type: 'String',
                required: [true, 'Description is required'],
                minLength: [30, 'Description must be atleast 30 characters'],
                maxLength: [400, 'Description should be less than 400 characters'],
                trim: true,
            },
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
    numberOfLecture: {
        type: 'Number',
        default: 0,
    },
    createdBy: {
        type: 'String',
        required: true
    }
}, {
    timestamps: true
})

const Course = model('Course', courseSchema)

export default Course