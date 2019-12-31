import mongoose  from 'mongoose';
const Schema = mongoose.Schema;

export const RolesWritesSchema = new mongoose.Schema({
    read: {        
        type: Boolean,
        trim: true 
    },
    write: {
        type: Boolean,
        trim: true 
    },
    notify: {
        type: Boolean,
        trim: true 
    },
    roleid: {
        type: Schema.Types.ObjectId,
        ref: 'matserroles'
    }
});

module.exports = {
    Roleswrites: mongoose.model('Roleswrites', RolesWritesSchema)
}


