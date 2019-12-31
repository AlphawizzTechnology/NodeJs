import mongoose  from 'mongoose';
import validator from 'validator';
// Setup schema

export const VehicleTypeSchema = new mongoose.Schema({
    typename: {
        type: String, 
        required:[true, 'Vehicletype is required.'],
        enum:{
        	values: ["threewheeler","twowheeler"],
        	message: "Not a valid enum"	
        },
        trim: true 
    }
});


module.exports = {
   VehicleType: mongoose.model('VehicleType', VehicleTypeSchema)
}
