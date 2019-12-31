import mongoose  from 'mongoose';
import validator from 'validator';
// Setup schema

export const vehicledataSchema = new mongoose.Schema({
    telemetryboardid: {
        type: String, 
        required:[true, 'TelementryBoardId is required.'],
        trim: true 
    },
    datetime: {
        type: Date, 
        required:[true, 'DateTime is required.'],
        trim: true 
    },
    bv: {
        type: String, 
        required:[true, 'BV is required.'],
        trim: true 
    },
    lv: {
        type: String, 
        required:[true, 'LV is required.'],
        trim: true 
    },
    bi: {
        type: String, 
        required:[true, 'BI is required.'],
        trim: true 
    },
    ti: {
        type: String, 
        required:[true, 'TI is required.'],
        trim: true 
    },
    ts: {
        type: String, 
        required:[true, 'TS is required.'],
        trim: true 
    },
    soc: {
        type: String, 
        required:[true, 'SOC is required.'],
        trim: true 
    },
    soh: {
        type: String, 
        required:[true, 'SOH is required.'],
        trim: true 
    },
    chr: {
        type: String, 
        required:[true, 'CHR is required.'],
        trim: true 
    },
    dhr: {
        type: String, 
        required:[true, 'DHR is required.'],
        trim: true 
    },
    ckw: {
        type: String, 
        required:[true, 'CKW is required.'],
        trim: true 
    },
    dkw: {
        type: String, 
        required:[true, 'DKW is required.'],
        trim: true 
    },
    tdt: {
        type: String, 
        required:[true, 'TDT is required.'],
        trim: true 
    },
    cah: {
        type: String, 
        required:[true, 'CAH is required.'],
        trim: true 
    },
    dah: {
        type: String, 
        required:[true, 'DAH is required.'],
        trim: true 
    },
    tcc: {
        type: String, 
        required:[true, 'TCC is required.'],
        trim: true 
    },
    lng: {
        type: String, 
        required:[true, 'LNG is required.'],
        trim: true 
    },
    lat: {
        type: String, 
        required:[true, 'LAT is required.'],
        trim: true 
    },
    aid: {
        type: String, 
        required:[true, 'AID is required.'],
        trim: true 
    },
    dpt: {
        type: String, 
        required:[true, 'DPT is required.'],
        trim: true 
    },
    al1: {
        type: String, 
        required:[true, 'AL1 is required.'],
        trim: true 
    },
    st1: {
        type: String, 
        required:[true, 'ST1 is required.'],
        trim: true 
    },
    tb1:{
        type: Array, 
        trim: true 
    },
    tb2:{
        type: Array, 
        trim: true 
    },
    tb3:{
        type:Array,
    },
    tdt:{
        type:Array,
    },
    spd:{
        type: String, 
        required:[true, 'SPD is required.'],
        trim: true 
    }
});

module.exports = {
    VehicleData: mongoose.model('VehicleData', vehicledataSchema)
}
