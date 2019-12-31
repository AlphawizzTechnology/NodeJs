import mongoose  from 'mongoose';
import validator from 'validator';
// Setup schema

export const vehicleSchema = new mongoose.Schema({
    vehiclename: {
        type: String, 
        required:[true, 'VehicleId is required.'],
        trim: true 
    }
});


module.exports = {
    Vehicle: mongoose.model('Vehicle', vehicleSchema)
}
