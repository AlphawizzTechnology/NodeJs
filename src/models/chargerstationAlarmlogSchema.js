import mongoose from 'mongoose';
import validator from 'validator';
const Schema = mongoose.Schema;
// Setup schema

export const chargerstationAlarmlogSchema = new mongoose.Schema({
    stationid: {
		type: Schema.Types.ObjectId, 
		ref: 'ChargerStation', 
		//required:[true, 'chargerstationid  is required.'],
        trim: true,
        default: null
	},
	cs_id: {
		type: String,
		trim: true
	},
    json:{
        type:Object
    },

    em_v1: {
        type: Number, 
        required:[true, 'EM V1 is required.'],
        trim: true 
    },
    em_v2: {
        type: Number, 
        //required:[true, 'EM V2 is required.'],
        trim: true 
    },
    em_v3: {
        type: Number, 
        //required:[true, 'EM V3 is required.'],
        trim: true 
    },
    em_i1: {
        type: Number, 
        //required:[true, 'EM l1 is required.'],
        trim: true 
    },
    em_i2: {
        type: Number, 
        //required:[true, 'EM l2 is required.'],
        trim: true 
    },
    em_i3: {
        type: Number, 
        //required:[true, 'EM l3 is required.'],
        trim: true 
    },
    em_p1: {
        type: Number, 
        //required:[true, 'EM P1 is required.'],
        trim: true 
    },
    em_p2: {
        type: Number, 
        //required:[true, 'EM P2 is required.'],
        trim: true 
    },
    em_p3: {
        type: Number, 
        //required:[true, 'EM P3 is required.'],
        trim: true 
    },
    em_e1: {
        type: Number, 
        //required:[true, 'EM E1 is required.'],
        trim: true 
    },
    em_e2: {
        type: Number, 
       // required:[true, 'EM E2 is required.'],
        trim: true 
    },
    em_e3: {
        type: Number, 
        //required:[true, 'EM E3 is required.'],
        trim: true 
    },
    s1_sts: {
        type: Number, 
        //required:[true, 'S1 STS is required.'],
        trim: true 
    },
    s2_sts: {
        type: Number, 
        //required:[true, 'S2 STS is required.'],
        trim: true 
    },
    s3_sts: {
        type: Number, 
        //required:[true, 'S3 STS is required.'],
        trim: true 
    },
    hlt_sts: {
        type: Number, 
        //required:[true, 'HLT STS is required.'],
        trim: true 
    },
    emg_sts: {
        type: Number, 
        //required:[true, 'EMG STS is required.'],
        trim: true 
    },
    emailRecipient: {
        type: Array
    },
    lastalarmdatetime: {
        type: Date
    }
    
});

module.exports = {
    ChargerstationAlarmlog: mongoose.model('chargerstationAlarmlogSchema', chargerstationAlarmlogSchema)
}

