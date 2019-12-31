import mongoose from 'mongoose';
import validator from 'validator';
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

// Setup schema
// as per discuss with Mam We have comment VehicleId and UserId
export const TelemetrylogLogSchema = new mongoose.Schema({
    vehicleid: {
        type: Schema.Types.ObjectId,
        ref: 'Evehicle',
        //required:[true, 'VehicleId  is required.'],
        trim: true,
        default: null
    },
    userid: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        //required:[true, 'UserId is required.'],
        trim: true,
        default: null
    },
    mobilenumber: {
        type: Number,
        //required:[true, 'MobileNumber is required.'],
        trim: true
    },
    telemetryboardid: {
        type: String,
        //required:[true, 'TelemetryBoard Id is required.'],
        trim: true
    },
    time: {
        type: Date,
        //required:[true, 'DateTime is required.'],
        trim: true
    },
    soc: {
        type: Number
    },
    soh: {
        type: Number
    },
    tdt: {
        type: Number
    },
    lng: {
        type: Number,
        default:0
    },
    json: {
        type: String
    },
    lat: {
        type: Number,
        default:0
    },
    al1: {
        type: Number
    },
    al2: {
        type: Number
    },
    al3: {
        type: Number
    },
    al4: {
        type: Number
    },
    st1: {
        type: Number
    },
    st2: {
        type: Number
    },
    tb1: {
        type: Number
    },
    tb2: {
        type: Number
    },
    tb3: {
        type: Number
    },
    spd: {
        type: Number
    },
    /*
     tokennumber: {
        type: String,
        trim: true
    },
    bv: {
        type: Number,
        //required:[true, 'BV is required.'],
        trim: true
    },
    lv: {
        type: Number
    },
    bi: {
        type: Number
    },
    ti: {
        type: Number
    },
    ts: {
        type: Number
    },
    chr: {
        type: Number
    },
    dhr: {
        type: Number
    },
    ckw: {
        type: Number
    },
    dkw: {
        type: Number
    },    
    cah: {
        type: Number
    },
    dah: {
        type: Number
    },
    tcc: {
        type: Number
    },
     aid: {
        type: Number
    },
    dpt: {
        type: Number
    },    
    tb1:{
        type:Number
    },
    cab1:{
        type:Number
    },
    ckb1:{
        type:Number
    },
    dab1:{
        type:Number
    },
    dkb1:{
        type:Number
    },
    tb2:{
        type:Number
    },
    cab2:{
        type:Number
    },
    ckb2:{
        type:Number
    },
    dab2:{
        type:Number
    },
    dkb2:{
        type:Number
    },
    tb3:{
        type:Number
    },
    cab3:{
        type:Number
    },
    ckb3:{
        type:Number
    },
    dab3:{
        type:Number
    },
    dkb3:{
        type:Number
    },
    al1:{
        type:Number
    },
    al2:{
        type:Number
    },
    al3:{
        type:Number
    },
    al4:{
        type:Number
    },
    st2:{
        type:Number
    },
    lns:{
        type:Number
    },
    dhr3:{
        type:Number
    },
    ccb3:{
        type:Number
    },
    ccb3:{
        type:Number
    },
    bsc3:{
        type:Number
    },
    bsc3:{
        type:Number
    },
    bsc3:{
        Type:Number
    },
    dhr2:{
        type:Number
    },
    dhr2:{
        type:Number
    },
    ccb2:{
        type:Number
    },
    shb2:{
        type:Number
    },
    bsc2:{
        type:Number
    },
    bi2:{
        type:Number
    },
    bv2:{
        type:Number
    },
    dhr1:{
        type:Number
    },
    chr1:{
        type:Number
    },
    ccb1:{
        type:Number
    },
    shb1:{
        type:Number
    },
    bsc1:{
        type:Number
    },
    bi1:{
        type:Number
    },
    bv1:{
        type:Number
    },
    */
});
module.exports = {
    Telemetrylog: mongoose.model('Telemetrylog', TelemetrylogLogSchema)
}
