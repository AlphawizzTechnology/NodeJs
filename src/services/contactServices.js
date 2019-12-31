// Import contact model
import  mongoose from 'mongoose';
import { UserType } from '../models/usertype';
import { Request, Response } from 'express';

exports.Testing = function(){    
    return UserType.find({},function(err, result) {
      if (!err) {
        // handle result
       return result;
      } else {
        // error handling
        console.log ('Error on save!')
        return result;
      };
    });
}
// Handle index actions
exports.index = function (req, res) {
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
            if (err){
                res.json(err);
            }else{
                res.json({
                    message: 'Contact Info updated',
                    data: contact
                });    
            }
        });
    });
};
// Handle delete contact
exports.delete = function (req, res) {
    contact.remove({
        _id: req.params.contact_id
    }, function (err, contact) {
        if (err){
            res.send(err);
        }else{
            res.json({status: "success",message: 'Contact deleted'});
        }
    });
};