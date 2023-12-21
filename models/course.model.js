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
        minLength: [20, 'Description must be atleast 20 characters'],
        maxLength: [250, 'Description should be less than 250 characters'],
        trim: true,
    },
    category: {
        type: 'String',
        required: [true, 'Category is required']
    },
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
    lectures: [
        {
            title: {
                type: 'String',
                required: [true, 'Title is required'],
                minLength: [10, 'Title must be atleast 10 characters'],
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
                    required: true
                },
                secure_url: {
                    type: 'String',
                    required: true
                }
            }
        }
    ],
    numberOfLecture: {
        type: 'Number',
        default: 0,
        required: true
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