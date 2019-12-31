// Import contact model';
var ContactServices = require('../services/contactServices.js');
import { User } from '../models/user';
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var Passport = require('passport');

// final callback
exports.finalCallback = function(req, res, ErrorCode, Status, result, ErrorMessage, authKey) {
    if(authKey){
        res.json({"ErrorCode": ErrorCode, Status: Status, "user": result, "ErrorMessage": ErrorMessage, "auth-key" : authKey});
    } else {
        res.json({"ErrorCode": ErrorCode, Status: Status, "user": result, "ErrorMessage": ErrorMessage});
    }
}

// Handle index actions
exports.index = function (req, res) {
    ContactServices.Testing().then(function(Data){
        console.log("Controllers");
        res.json({"result":Data});
    });
};

exports.Registeration = function(req, res){
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    console.log(222)
    User.create({
        username : req.body.username,
        email : req.body.email,
        password : hashedPassword
    },function (err, user) {
    if (err) {
        return res.status(500).send(err)
    }  else {
        // create a token
        var token = jwt.sign({ id: user._id }, "333", {
          expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({ auth: true, token: token });
    }
  }); 
}


// Login
exports.Login = function(req, res, next) {
    var email = (req.body.email)?req.body.email:false;
    var password = (req.body.password)?req.body.password:false;           
    if(password){
        req.body.password = password;
    }
    if(!req.body.password || !email){
        exports.finalCallback(req, res, 304, false, null, "Please send required parameter.");
    }else{
        return Passport.authenticate('local',
            function(err, user, info) {
             console.log(err);
                 console.log(user)
                if(err) {
                    return errors.returnError(err,res);
                }
                if(!user) {
                    if(info.error == true && info.statusCode == 201){
                        exports.finalCallback(req, res, 404, false, null, "User doesn't exist.");
                    } else if(info.error == true && info.statusCode == 202){
                        exports.finalCallback(req, res, 401, false, null, "Invalid Password.");
                    }
                }else{
                    return req.logIn(user, function(err) {
                        const token = jwt.sign(user, "your_jwt_secret"); 
                        res.setHeader('auth-key', 'Bearer '+token);
                        exports.finalCallback(req, res, 200, true, user, "Success.", "Bearer ");
                    });
                }
            }
        )(req, res, next);
    }   
};

// Handle create contact actions
exports.new = function (req, res) {
    var contact = new contact();
    contact.name = req.body.name ? req.body.name : contact.name;
    contact.gender = req.body.gender;
    contact.email = req.body.email;
    contact.phone = req.body.phone;
    var myobj = { name: contact.name, gender: contact.gender, };
    db.collection("contact").insertOne(myobj, function (err, result) {
        if (err) throw err;
        res.json({
            message: 'New contact created!'
        });
        db.close();
    });
};
// Handle view contact info
exports.view = function (req, res) {
    // Contact.findById(req.params.contact_id, function (err, contact) {
    //     if (err)
    //         res.send(err);
    //     res.json({
    //         message: 'Contact details loading..',
    //         data: contact
    //     });
    // });
    db.collection("contact").find({}).toArray(function (err, result) {
        if (err) throw err;
        res.json({
            message: 'New contact created!',
            data: result
        });
        db.close();
    });
};
// Handle update contact info
exports.update = function (req, res) {
    contact.findById(req.params.contact_id, function (err, contact) {
        if (err)
            res.send(err);
        contact.name = req.body.name ? req.body.name : contact.name;
        contact.gender = req.body.gender;
        contact.email = req.body.email;
        contact.phone = req.body.phone;
        // save the contact and check for errors
        contact.save(function (err) {
            if (err)
                res.json(err);
            res.json({
                message: 'Contact Info updated',
                data: contact
            });
        });
    });
};
// Handle delete contact
exports.delete = function (req, res) {
    contact.remove({
        _id: req.params.contact_id
    }, function (err, contact) {
        if (err)
            res.send(err);
        res.json({
            status: "success",
            message: 'Contact deleted'
        });
    });
};