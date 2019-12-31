import mongoose from 'mongoose';
import validator from 'validator';
import organizationSchema from '../models/organization';
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

// Setup schema
var UserSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'First Name is required.'],
        trim: true
    },
    usertypeid: {
        type: Schema.Types.ObjectId, 
        ref: 'UserType', 
        required: [true, 'User TypeId is required.'],
        trim: true
    },
    organizationid: { 
        type: Schema.Types.ObjectId, 
        required:true,
        ref: 'Organization' 
    },
    roletype: { 
        type: Array, 
        required:true 
    },
    username: {
        type: String,
        //required: [true, 'User Name is required.'],
        trim: true
    },
    contactno: {
        type: String,
        required: [true, 'Contact No is required.'],
        index: true, unique: true
        
    },
    password: {
        type: String,
        required: [true, 'password is required.'],
        trim: true
    },
    middlename: {
        type: String,
        trim: true
    },
    dob: {
        type: Date,
        required: [true, 'DOB is required.'],
        trim: true
    },
    lastotprequestdatetime: {
        type: Date
    },
    lastotp: {
        type: Number
    },
    dateofregistration: {
        type: Date
    },
    isactive: {
        type: Boolean,
        default:true
    },
    deviceid: {
        type: String
    },
    hubid: {
        type: Schema.Types.ObjectId, 
        ref: 'Hub'
    },
    lastVerificationDateTime: {
        type: Date
    },
    lastname: {
        type: String,
        required: [true, 'Last Name is required.'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        index: true, unique: true,
        validate:{
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email.',
            isAsync: false,
            //isEmailUnique, message: "Email already exists." 
        }
    },
    HubData: {
        type: Object
    },
    VehicleData:{
        type:Object
    },
    VehicleDataItem:{
        type:Object
    },
    UserData:{
        type:Object
    },
    FleetManager:{
        type:Boolean
    },
    profileImg: {
        type: String,
        trim: true 
    },
    address: {
        type: String
    },
    batterydata:{
        type:Array
    },
    telemetryboardid:{
        type:Object
    },
    emailnotification: {
        type:Boolean,
        default:false
    },
    mobilenotification:{
        type:Boolean,
        default:false
    },
    firebasetoken:{
        type:String
    },
    DisAssembledVehicle:{
        type:Object
    }
});

UserSchema.pre('save', function (next) {
    var self = this;
    mongoose.model('User', UserSchema).find({email : self.email}, function (err, docs) {
        if (!docs.length){
            next();
        }else{                
            next({
                "name": "EmailExist",
                "type": "ValidatorError",
                "message": "Email already exist",
                "path": "Email already exist"
            });
        }
    });
    mongoose.model('User', UserSchema).find({contactno : self.contactno}, function (err, docs) {
        if (!docs.length){
            next();
        }else{                
            next({
                "name": "ContactExist",
                "type": "ValidatorError",
                "message": "Contact no already exist",
                "path": "Contact no already exist"
            });
        }
    });
}) ;

module.exports = {
    User: mongoose.model('User', UserSchema)
}


