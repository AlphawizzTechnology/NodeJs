import mongoose from 'mongoose';
import validator from 'validator';
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
// Setup schema

export const Vehiclechart = new mongoose.Schema({
    vehicleid: {
        type: Schema.Types.ObjectId,
        ref: 'Evehicle',
        //required:[true, 'vehicleid is required.'],
        trim: true
    },
    isMonthEnd: {
        type: Boolean,
        //required:[true, 'time is required.'],
        trim: true,
        default: false
    },
    isWeekEnd: {
        type: Boolean,
        //required:[true, 'time is required.'],
        trim: true,
        default: false
    },
    time: {
        type: Date,
        //required:[true, 'time is required.'],
        trim: true
    },
    tdt: {
        type: Number,
        //required:[true, 'IsActive is required.'],
        trim: true,
    },
    revenue: {
        type: Number,
        trim: true
    }
});

module.exports.VehiclechartModel = mongoose.model('vehiclechart', Vehiclechart);
module.exports.ObjectId= ObjectId;

