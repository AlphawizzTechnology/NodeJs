import mongoose  from 'mongoose';
import validator from 'validator';
const Schema = mongoose.Schema;
// Setup schema

export const charginglogSchema = new mongoose.Schema({
    datetimeofcharging: {
        type: Date, 
        required:[true, 'DateTime Of Charging is required.'],
        trim: true 
    },
    chargersocketid: {
        type: Schema.Types.ObjectId, 
        required:true,
        ref: 'ChargerSocket' 
    },
    telementoryboardid: {
        type: String, 
        required:[true, 'TelemetoryBoardId is required.'],
        trim: true 
    },
    meterreading: {
        type: String, 
        //required:[true, 'Meter Reading is required.']
        trim: true 
    },
    totalchargeunit: {
        type: String, 
        //required:[true, 'Total Charge Unit is required.']
        trim: true 
    },
    paidamount: {
        type: Number, 
        //required:[true, 'PaidAmount is required.']
        trim: true 
    },
    userwalletid: {
        type: String, 
        //required:[true, 'User WalletId is required.']
        trim: true 
    }
});


module.exports = {
   ChargingLog: mongoose.model('ChargingLog', charginglogSchema)
}


