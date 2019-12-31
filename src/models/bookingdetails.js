import mongoose  from 'mongoose';
const Schema = mongoose.Schema;
// Setup schema

export const BookingDetailSchema = new mongoose.Schema({
    seatnumber: {
        type: Number, 
        required:[true, 'Seat Number is required.'],
        trim: true 
    },
    currentlat: {
        type: String, 
        required:[true, 'current lat is required.'],
        trim: true 
    },
    currentlng: {
        type: String, 
        required:[true, 'current long is required.'],
        trim: true 
    },
    vehiclenumber: {
        type: Schema.Types.ObjectId, 
        ref: 'Evehicle',
        required:[true, 'VehicleNumber is required.'],
        trim: true
    },
    userid: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required:[true, 'User ID is required.'],
        trim: true
    },
    paidamount:{
        type: Number, 
        required:[true, 'paidamount is required.'],
        trim: true
    },
    datetime: {
        type: Date, 
        required:[true, 'Date  is required.'],
        trim: true,
    },
	endlat:{
		type:Number
	},
	endlng:{
		type:Number
	}
});

module.exports = {
    BookingDetail: mongoose.model('BookingDetail', BookingDetailSchema)
}
