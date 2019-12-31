import mongoose  from 'mongoose';
import validator from 'validator';
const Schema = mongoose.Schema;
// Setup schema

export const vehiclelogSchema = new mongoose.Schema({
    vehicleid: {
        type: Schema.Types.ObjectId, 
        ref: 'Evehicle', 
        required:[true, 'Vehicle Id is required.'],
        trim: true 
    },
    status: {
        type: String, 
        enum:{
            values: ["active","deactive"],
            message: "Not a valid enum" 
        },
        required:[true, 'Status is required.'],
        trim: true 
    },
    statuschangedby: {
        type: String, 
        //required:[true, 'Status Changed By is required.'],
        trim: true 
    },
    deactivatebysuperadmin: {
        type: Boolean, 
        //required:[true, 'Deactivate By SuperAdmin is required.'],
        trim: true 
    },
    reason: {
        type: String, 
        //required:[true, 'Reason is required.'],
        trim: true 
    },
    datetime: {
        type: Date, 
        'default': Date.now, 
        index: true
    }
});


module.exports = {
   VehicleLog: mongoose.model('VehicleLog', vehiclelogSchema)
}


