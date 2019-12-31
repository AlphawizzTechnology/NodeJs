import mongoose from 'mongoose';
import validator from 'validator';

// Setup schema
export const UserTypeSchema = new mongoose.Schema({
    typename: {
        required: [true, 'Typename is required.'],
        type: String,
        enum: {
            values: ["Vendor", "Driver", "Administrator", "SuperAdministrator","Manager"],
            message: "Not a valid enum"
        },
        trim: true,
        require: true
    }
});
module.exports = {
    UserType: mongoose.model('UserType', UserTypeSchema)
}

