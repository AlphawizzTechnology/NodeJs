import mongoose from 'mongoose';
import validator from 'validator';
const Schema = mongoose.Schema;
// Setup schema

export const BatteryManufacturerSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Name is required.'],
        trim: true
    },
    isactive:{
        type:Boolean,
        default:true
    },
	userid:{
		type: Schema.Types.ObjectId,
        ref: 'User',
        trim: true
	},
	code:{
		type:String,
		unique: true
	}

})

module.exports = {
    BatterManufacturer: mongoose.model('BatterManufacturer', BatteryManufacturerSchema)
}

