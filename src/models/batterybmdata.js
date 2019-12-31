import mongoose from 'mongoose';
import validator from 'validator';
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

// Setup schema
// as per discuss with Mam We have comment VehicleId and UserId
export const BatteryDatatBMLogSchema = new mongoose.Schema({
    telemetryboardid: {
        type: String,
        trim: true
    },
    certificateid:{
        type:String
    },
    time: {
        type: Date,
        trim: true
    },
    bm:{
        type:String
    }, 
    snb1:{
        type:String
    },
    snb2:{
        type:String
    },
    snb3:{
        type:String
    }
});
module.exports = {
    BatteryDataBM: mongoose.model('BatteryDataBM', BatteryDatatBMLogSchema)
}
