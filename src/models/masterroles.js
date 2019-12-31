import mongoose  from 'mongoose';
const Schema = mongoose.Schema;

export const MasterRolesSchema = new mongoose.Schema({
    rolename: {
        type: String, 
        trim: true
    }
});

module.exports = {
    Mastserroles: mongoose.model('matserroles', MasterRolesSchema)
}


