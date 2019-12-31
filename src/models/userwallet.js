import mongoose  from 'mongoose';
import validator from 'validator';
const Schema = mongoose.Schema;
// Setup schema

export const userwalletSchema = new mongoose.Schema({
    userid: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required:[true, 'UserId is required.'],
        trim: true 
    },
    datetimeofpayment: {
        type: Date, 
        required:[true, 'DateTime Of Payment is required.'],
        trim: true 
    },
    rechargeamount: {
        type: String, 
        required:[true, 'Recharge Amount is required.'],
        trim: true 
    },
    modeofpayment: {
        type: String, 
        required:[true, 'ModeOf Payment is required.'],
        trim: true 
    },
    transactionstatus: {
        type: String, 
        required:[true, 'TransactionStatus is required.'],
        trim: true 
    },
    totalbalance: {
        type: String, 
        required:[true, 'Total Balance is required.'],
        trim: true 
    },
    note: {
        type: String, 
        required:[true, 'Note is required.'],
        trim: true 
    }
});


module.exports = {
   UserWallet: mongoose.model('UserWallet', userwalletSchema)
}
