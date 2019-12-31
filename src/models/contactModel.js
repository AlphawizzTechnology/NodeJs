import mongoose  from 'mongoose';
import validator from 'validator';
// Setup schema

export const ContactSchema = new mongoose.Schema({
    name: {
        first: String,
        last: { 
            type: String, 
            trim: true ,
            require: true
        }
    },
    email: {
        type: String,
        required: [true, 'Your username cannot be blank.'],
        unique: true,
        lowercase: true,
        validate: [
            /*{ validator: (value) => {
              return validator.check(username).notEmpty()
            }, message: 'sadfasdfsaf'},*/
            { validator: validator.isEmail, msg: 'invalid email address'},
            { validator: isEmailUnique, msg: "Email already exists123"}
        ]
    },
    company: {
        type: String,
        validator: required, msg: "Company is required"
    },
    phone: {
        type: Number            
    }
});


module.exports = {
    User: mongoose.model('User', ContactSchema)
}


function isEmailUnique(value, done) {
  if (value) {
    ContactSchema.path('email').validate(async (value) => {
        const emailCount = await mongoose.models.User.countDocuments({email: value });
        return !emailCount;
    });
  }
}
