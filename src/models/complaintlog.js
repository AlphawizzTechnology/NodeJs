import mongoose  from 'mongoose';
import validator from 'validator';
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

// Setup schema
export const ComplaintlogLogSchema = new mongoose.Schema({
    datetime: {
        type:Date, 
        trim: true,
        default:Date.now() 
    },
    title: { 
        type:String,
        required:[true, 'Title is required.'],
        trim: true 
    },
    detail: {
        type: String, 
        //required:[true, 'Details is required.'],
        trim: true 
    },
    picture: {
        type : Array , 
        default : [],
        required:[true, 'Picture is required.'],
        trim: true 
    },
    posteadby: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required:[true, 'PosteadBy is required.'],
        trim: true 
    },
    status: {
        type: String, 
        required:[true, 'Status is required.'],
        enum:{
        	values: ["new", "resolved", "pending"],
        	message: "Not a valid enum"	
        },
        trim: true 
    },
    vehiclenumber: {
        type: Schema.Types.ObjectId,
        ref: 'Evehicle',
        trim: true 
    },
    checkedby:{
        type: String,  
        trim: true 
    },
    reply:{
        type: String,  
        trim: true 
    },
    imagepath:{
        type: String,
        trim: true
    }
});


module.exports = {
    ComplaintLog: mongoose.model('ComplaintLog', ComplaintlogLogSchema)
}
