import mongoose  from 'mongoose';
import validator from 'validator';
const Schema = mongoose.Schema;
// Setup schema

export const exceptionSchema = new mongoose.Schema({
    screenname: {
        type: String, 
        //required:[true, 'Hub Name is required.'],
        trim: true,
    },
    datetime: {
        type: Date, 
        //required:[true, 'City is required.'],
        trim: true,
        default:Date.now()
    },
    eventfunctionname: {
        type: String, 
        //required:[true, 'State is required.'],
        trim: true 
    },
    linenumber: {
        type: Number, 
        //required:[true, 'Country is required.'],
        trim: true 
    },
    message: {
        type: String, 
        //required:[true, 'Latitude is required.'],
        trim: true 
    }
});

module.exports = {
   exception: mongoose.model('exception', exceptionSchema)
}




