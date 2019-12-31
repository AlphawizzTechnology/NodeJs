import mongoose from 'mongoose';
import validator from 'validator';
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;
// Setup schema

export const stateSchema = new mongoose.Schema({
    name: {
        type: String, 
        required:[true, 'State name is required.'],
        trim: true 
    },
    country: {
        type: Schema.Types.ObjectId, 
        ref: 'Country'
    },
    status:{
        type:Boolean,
        default:true
    },
    shortname:{
        type: String, 
        required:[true, 'Short name is required.'],
        trim: true 
    }
});

module.exports = {
    States: mongoose.model('States', stateSchema)
}

