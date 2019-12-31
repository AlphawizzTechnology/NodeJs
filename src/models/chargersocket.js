import mongoose  from 'mongoose';
import validator from 'validator';
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;
// Setup schema

export const chargersocketSchema = new mongoose.Schema({
    port: {
        type: Number, 
        required:[true, 'Number is required.'],
        trim: true 
    },
    chargerstationid: {
        type: Schema.Types.ObjectId, 
        ref: 'ChargerStation',
        required:[true, 'Charger Terminal Id is required.'],
        trim: true 
    },
    vehicleid: {
        type: Schema.Types.ObjectId, 
        ref: 'Evehicle',
        required:[true, 'Charger Terminal Id is required.'],
        trim: true 
    },
    userid: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required:[true, 'Charger Terminal Id is required.'],
        trim: true 
    },
    isactive: {
        type: Boolean, 
        required:[true, 'IsActive is required.'],
        trim: true,
        default:true
    },
    starttime: {
        type: Date,
        trim: true 
    },
    endtime: {
        type: Date, 
        trim: true 
    },
    bleaddress:{
        type:String
    }
});

module.exports = {
   ChargerSocket: mongoose.model('ChargerSocket', chargersocketSchema)
}
