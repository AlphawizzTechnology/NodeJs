import mongoose  from 'mongoose';
import validator from 'validator';
const Schema = mongoose.Schema;
// Setup schema

export const MielageSchema = new mongoose.Schema({
    telemetryboardid: {
        type: String, 
        trim: true,
    },
    st1: {
        type:Number
    },
    tdt: {
        type:Number
    },
    time:{
        type: Date,
    },
    mielageleft:{
        type:Number
    }
});

module.exports = {
    Mielage: mongoose.model('Mielage', MielageSchema)
}




