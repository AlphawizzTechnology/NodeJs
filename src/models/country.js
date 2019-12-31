import mongoose from 'mongoose';
import validator from 'validator';
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;
// Setup schema

export const countrySchema = new mongoose.Schema({
    name: {
        type: String, 
        required:[true, 'Country name is required.'],
        trim: true 
    },
    shortname:{
        type: String, 
        required:[true, 'Short name is required.'],
        trim: true 
    },
    status:{
        type:Boolean,
        default:true
    }
});

module.exports = {
    Countrys: mongoose.model('Countrys', countrySchema)
}

