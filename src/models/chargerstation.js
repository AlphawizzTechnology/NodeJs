import mongoose from 'mongoose';
import validator from 'validator';
const Schema = mongoose.Schema;
// Setup schema

export const chargerstationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required.'],
        trim: true
    },
    lat: {
        type: String,
        required: [true, 'Lat is required.'],
        trim: true
    },
    long: {
        type: String,
        required: [true, 'Longitude is required.'],
        trim: true
    },
    addressLine1: {
        type: String,
        required: [true, 'AddressLine1 is required.'],
        trim: true
    },
    addressLine2: {
        type: String,
        //required: [true, 'AddressLine2 is required.'],
        trim: true
    },    
    pincode: {
        type: String,
        required: [true, 'PinCode is required.'],
        trim: true
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
    dateofestablishment: {
        type: Date,
        default: Date.now,
        //required: [true, 'Date Of Establishment is required.'],
        trim: true
    },
    telemetryboardid: {
        type: String,
        //required: [true, 'TelemetryBoard Id is required.'],
        trim: true
    },
    telemetryboardname: {
        type: String,
        //required: [true, 'Telemetryboardname Id is required.'],
        trim: true
    },
    SocketData: {
        type: Object
    },
    baseprice:{
        type: Number,
        trim: true 
    },
    unitprice:{
        type: Number,
        trim: true 
    },
    isactive:{
        type:Boolean,
        default:true
    },
    zoneid:{
        type: Schema.Types.ObjectId,
        ref: 'Zone',
        required: [true, 'zone is required.'],
        trim: true
    },
    ble_id:{
        type:String
    },
    chargerstationid:{
        type: String,
        required: [true, 'ChargerStation is required.'],
        trim: true
    },
	stationtype:{
        type: String, 
        enum:{
        	values: ["AC", "DC", "Solar", "Biodegradable"],
        	message: "Not a valid enum"	
        },
        trim: true,
        default:"AC"
    },
    fleetmanager:{
        type: String,
        trim: true
    },
    chargingoperator:{
        type: String,       
        trim: true
    },
    zonalmanager:{
        type: String,
        trim: true
    }
}, {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

chargerstationSchema.virtual('portsAvailable', {
    ref: 'ChargerSocket',
    localField: '_id',
    foreignField: 'chargerterminalid',
})

chargerstationSchema.pre('findOne', autoPopulateComments)

chargerstationSchema.pre('find', autoPopulateComments)
function autoPopulateComments(next) {
    this.populate({
        path: 'portsAvailable',
        match: { 'isavailable': true },
    })
    next()
}
module.exports = {
    ChargerStation: mongoose.model('ChargerStation', chargerstationSchema)
}

