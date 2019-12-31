import mongoose  from 'mongoose';
import validator from 'validator';
// Setup schema

export const hublogSchema = new mongoose.Schema({
    hubid: {
        type: Number, 
        required:[true, 'Hub Id is required.'],
        trim: true 
    },
    status: {
        type: Number, 
        required:[true, 'Status is required.'],
        trim: true 
    },
    statuschangedby: {
        type: Boolean, 
        required:[true, 'Status Changed By is required.'],
        trim: true 
    },
    deactivatebysuperadmin: {
        type: Boolean, 
        required:[true, 'Deactivateby Superadmin is required.'],
        trim: true 
    },
    reason: {
        type: String, 
        required:[true, 'Reason is required.'],
        trim: true 
    },
    datetime: {
        type: Date, 
        required:[true, 'Date Time is required.'],
        trim: true,
        default:Date.now
    }
});


module.exports = {
   HubLog: mongoose.model('HubLog', hublogSchema)
}


// function isEmailUnique(value, done) {
//   if (value) {
//     ContactSchema.path('email').validate(async (value) => {
//         const emailCount = await mongoose.models.User.countDocuments({email: value });
//         return !emailCount;
//     });
//   }
// }
