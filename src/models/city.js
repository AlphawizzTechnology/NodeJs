import mongoose from 'mongoose';
import validator from 'validator';
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;
// Setup schema

export const citySchema = new mongoose.Schema({
    name: {
        type: String, 
        required:[true, 'City name is required.'],
        trim: true 
    },
    state: {
        type: Schema.Types.ObjectId, 
        ref: 'State'
    },
    shortname:{
        type: String, 
        required:[true, 'Short name is required.'],
        trim: true 
    },
    status:{
        type:Boolean,
        default:true
    },
    country: {
        type: Schema.Types.ObjectId, 
        ref: 'Country'
    },
});

module.exports = {
    Citys: mongoose.model('Citys', citySchema)
}