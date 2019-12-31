import mongoose  from 'mongoose';
import validator from 'validator';
const Schema = mongoose.Schema;
// Setup schema

export const hubSchema = new mongoose.Schema({
    hubname: {
        type: String, 
        required:[true, 'Hub Name is required.'],
        trim: true,
        //unique: true
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
    lat: {
        type: String, 
        required:[true, 'Latitude is required.'],
        trim: true 
    },
    long: {
        type: String, 
        required:[true, 'Longitude is required.'],
        trim: true 
    },
    addressLine1: {
        type: String, 
        required:[true, 'AddressLine1 is required.'],
        trim: true 
    },
    addressLine2: {
        type: String, 
        //required:[true, 'AddressLine2 is required.'],
        trim: true 
    },
    pincode: {
        type: Number, 
        required:[true, 'PinCode is required.'],
        trim: true 
    },
    isactive: {
        type: Boolean, 
        //required:[true, 'PinCode is required.']
        trim: true,
        default:false
    },
    organizationid: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: [true, 'Organization is required.'],
        trim: true
    },
    deactivatebysuperadmin: {
        type: Boolean, 
        //required:[true, 'DeactivateBySuperAdmin is required.']
        trim: true,
        default:false
    },
    dateofestablishment:{
        type: Date, 
        trim: true,
        default:Date.now()
    },
    VehicleData: {
        type: Object
    },
    HubManager: {
        type: Object
    },
    polygondata:{
        type:Object
    }
});

module.exports = {
   Hub: mongoose.model('Hub', hubSchema)
}




