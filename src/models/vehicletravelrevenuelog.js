import mongoose  from 'mongoose';
import validator from 'validator';
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
// Setup schema

export const vehicletravelrevenueSchema = new mongoose.Schema({
    vehicleid: {
        type: Schema.Types.ObjectId, 
        ref: 'Evehicle', 
        required:[true, 'Vehicle Id is required.'],
        trim: true 
    },
    startdatetime: {
        type: Date,
        trim: true 
    },
    enddatetime: {
        type: Date,
        trim: true 
    },
    vehiclerevenue: {
        type: Number,
        trim: true 
    },
    distancetravelled: {
        type: Number,
        trim: true 
    },
    userid: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required:[true, 'User Id is required.'],
        trim: true 
    }
});

module.exports = {
	ObjectId: ObjectId,
    VehicleTravelRevenue: mongoose.model('vehicletravelrevenues', vehicletravelrevenueSchema)
}
