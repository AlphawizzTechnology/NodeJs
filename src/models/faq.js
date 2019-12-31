import mongoose  from 'mongoose';
import validator from 'validator';
const uniqueValidator = require('mongoose-unique-validator');

// Setup schema
export const FaqSchema = new mongoose.Schema({
    question: {
        type: String, 
        required:[true, 'Question is required.'],
        trim: true 
    },
    answer: {
        type: String, 
        required:[true, 'Answer is required.'],
        trim: true 
    },
    sequence: {
        type: String, 
        //required:[true, 'Sequence is required.'],
        trim: true 
    },
    isactive: {
        type: Boolean, 
        default: true 
    }
});

module.exports = {
    Faq: mongoose.model('Faq', FaqSchema)
}
