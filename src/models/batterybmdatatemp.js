import mongoose from 'mongoose';
import validator from 'validator';
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

// Setup schema
// as per discuss with Mam We have comment VehicleId and UserId
export const BatteryDatatBMTempLogSchema = new mongoose.Schema({
    telemetryboardid: {
        type: String,
        trim: true
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
    BatteryDataBMTemp: mongoose.model('BatteryDataBMTemp', BatteryDatatBMTempLogSchema)
}
