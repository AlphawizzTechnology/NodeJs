import mongoose from 'mongoose';
import validator from 'validator';
const Schema = mongoose.Schema;

// Setup schema
export const UserLogSchema = new mongoose.Schema({
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
    username: {
        type: String,
        required: [true, 'User Name is required.'],
        trim: true
    },
    contactno: {
        type: String,
        required: [true, 'Contact No is required.'],
        trim: true
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
    hubid: [{
        type: Schema.Types.ObjectId, 
        ref: 'Hub'
    }],
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
            isEmailUnique, message: "Email already exists." 
        }
    },
    HubData: {
        type: Object
    },
    VehicleData:{
        type:Object
    },
    profileImg: {
        type: String,
        trim: true 
    },
    address: {
        type: String
    }
});

module.exports = {
    UserLog: mongoose.model('UserLog', UserLogSchema)
}

function isEmailUnique(value, done) {
    if (value) {
        UserSchema.path('email').validate(async (value) => {
            const emailCount = await mongoose.models.User.countDocuments({ email: value });
            return !emailCount;
        });
    }
}
