import mongoose from 'mongoose';
import validator from 'validator';
const Schema = mongoose.Schema;
// Setup schema

export const ZoneSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Zone Name Type is required.'],
        trim: true
    },
    address1: {
        type: String,
        required: [true, 'Address1 is required.'],
        trim: true
    },
    address2: {
        type: String,
        //required: [true, 'Address2 is required.'],
        trim: true
    },
    city: {
        type: Schema.Types.ObjectId, 
        ref: 'Citys'
    },
    state: {
        type: Schema.Types.ObjectId, 
        ref: 'States'
    },
    country: {
        type: Schema.Types.ObjectId, 
        ref: 'Countrys'
    },
    pincode: {
        type: Number,
        required: [true, 'Pincode Number is required.'],
        trim: true
    },
    isactive:{
        type: Boolean,
        trim: true,
        default:true
    },
    mobileno:{
        type: Number,
        required: [true, 'Mobile Number is required.'],
        trim: true
    },
    lat:{
        type: Number,
        trim: true
    },
    lng:{
        type: Number,
        trim: true
    }
});

module.exports.Zone = mongoose.model('Zone', ZoneSchema);

