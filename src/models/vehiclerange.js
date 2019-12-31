import mongoose  from 'mongoose';
import validator from 'validator';
const Schema = mongoose.Schema;
// Setup schema

export const VehicleRangeSchema = new mongoose.Schema({
    userid: {
        type: String, 
        trim: true,
    },
    telemetryboardid:{
        type: String, 
        trim: true,
    },
    vehicleid:{
        type: String, 
        trim: true,
    },
    time:{
        type: Date, 
        trim: true,
    },
    lat:{
        type: Date, 
        trim: true, 
    },
    lng:{
        type: Date, 
        trim: true,
    },
    rangestart:{
        type:Boolean
    },
    rangestop:{
        type:Boolean
    }
});

module.exports = {
    VehicleRange: mongoose.model('VehicleRange', VehicleRangeSchema)
}




