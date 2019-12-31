import mongoose from 'mongoose';
import validator from 'validator';
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

// Setup schema
// as per discuss with Mam We have comment VehicleId and UserId
export const BatteryDataAlaramLogSchema = new mongoose.Schema({
    telemetryboardid: {
        type: String,
        //required:[true, 'TelemetryBoard Id is required.'],
        trim: true
    },
    time: {
        type: Date,
        //required:[true, 'DateTime is required.'],
        trim: true
    },
    al1: {
        type: Number
    },
    al2: {
        type: Number
    },
    al3: {
        type: Number
    },
    al4: {
        type: Number
    },
    st1: {
        type: Number
    },
    st2: {
        type: Number
    },
    emailRecipient: {
        type: Array
    },
    lastalarmdatetime: {
        type: Date
    }
});
module.exports = {
    BatteryDataAlaramLog: mongoose.model('BatteryDataAlaramLog', BatteryDataAlaramLogSchema)
}
