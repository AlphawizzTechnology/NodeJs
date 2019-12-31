import mongoose from 'mongoose';
import validator from 'validator';
const Schema = mongoose.Schema;
// Setup schema

export const evehicleSchema = new mongoose.Schema({
    vehicletype: {
        type: Schema.Types.ObjectId,
        ref: 'VehicleType',
        required: [true, 'Vehicle Type is required.'],
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Name is required.'],
        trim: true
    },
    // company: {
    //     type: String,
    //     required: [true, 'Company is required.'],
    //     trim: true
    // },
    batteryid: {
        type: Array,
        //required: [true, 'Battery Id is required.'],
        trim: true
    },
    telemetryboardid: {
        type: String,
        //required: [true, 'Telementry BoardId is required.'],
        trim: true
    },
    dateofregistration: {
        type: Date,
        trim: true
    },
    vehiclenumber: {
        type: String,
        required: [true, 'Vehicle Number is required.'],
        trim: true
    },
    isactive: {
        type: Boolean,
        trim: true,
        default:false
    },
    status: {
        type: String, 
        required:[true, 'Status is required.'],
        enum:{
        	values: ["free", "alloted", "active", "maintanence", "breakdown"],
        	message: "Not a valid enum"	
        },
        trim: true 
    },
    activatebysuperadmin: {
        type: Number,
        trim: true,
        default: 1
    },
    activatebyuser:{
        type: Number,
        trim: true,
        default: 0
    },
    organizationid: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: [true, 'organizations is required.'],
        trim: true
    },
    hubid: {
        type: Schema.Types.ObjectId,
        ref: 'Hub',
        trim: true
    },
    topicName:{
        type:String
    },
    vehicletypenmae:{
        type:String
    },
    vehicleDetail:{
        type:Object
    },
	batterManufacture:{
       type:Object
    },
    
     batterymanufacturer: {
         type: String,
         required: [true, 'Battery Manufacturer id is required.'],
         trim: true
     }   
});

export const batterySchema = new mongoose.Schema({
    batteryid: {
        type: Object,
        required: [true, 'Battery Id is required.'],
        trim: true
    },
    telemetryboardid: {
        type: String,
        required: [true, 'Telementry BoardId is required.'],
        trim: true
    },
    organizationid: {
        type: Schema.Types.ObjectId,
        ref: 'organizations',
        required: [true, 'organizations is required.'],
        trim: true
    },
    isactive: {
        type: Boolean,
        trim: true,
        default: false
    }
});

module.exports.Evehicle = mongoose.model('Evehicle', evehicleSchema);
module.exports.batteryData = mongoose.model('batteryData', batterySchema);

