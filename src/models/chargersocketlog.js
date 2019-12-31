import mongoose  from 'mongoose';
import validator from 'validator';
const Schema = mongoose.Schema;
// Setup schema

export const chargersocketlogSchema = new mongoose.Schema({
    datetime: {
        type: Date, 
        required:[true, 'DateTime is required.']
    },
    chargersocketid: {
        type: Schema.Types.ObjectId, 
        ref: 'ChargerSocket',
        required:[true, 'Charger SocketId is required.'],
        trim: true 
    },
    isblocked: {
        type: String, 
        required:[true, 'IsBlocked is required.'],
        trim: true 
    },
    blockingreason: {
        type: String, 
        required:[true, 'Blocking Reason is required.'],
        trim: true 
    },
    blockedby: {
        type: String, 
        required:[true, 'Blocked By is required.'],
        trim: true 
    }
});


module.exports = {
   ChargerSocketLog: mongoose.model('ChargerSocketLog', chargersocketlogSchema)
}

