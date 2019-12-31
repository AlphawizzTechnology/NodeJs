import mongoose  from 'mongoose';
const Schema = mongoose.Schema;

export const UserRolesSchema = new mongoose.Schema({
    userid: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'UserId is required.'],        
        trim: true 
    },
    roleid: {
        type: Schema.Types.ObjectId,
        ref: 'Roles',
        required: [true, 'Roleid is required.'],   
        trim: true 
    }
});

module.exports = {
    UserRole: mongoose.model('UserRole', UserRolesSchema)
}


