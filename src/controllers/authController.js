// Import contact model';
var AuthServices = require('../services/authServices');
var errorsControllerHelper = require('../helpers/errors.controller.helper');
var successHelper = require('../helpers/success.helper');
var userservice = require('../services/userServices');
import { LoginLog } from '../models/loginlog';
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var Passport = require('passport');
var moment = require('moment');
var fs = require('fs');
var AWS = require('aws-sdk');
var uuidv1 = require('uuid/v1');
var awsIot = require('aws-iot-device-sdk');
import * as AppConfig from '../../config';
const sendmail = require('sendmail')({
    devPort: false, // Default: False
    devHost: 'localhost', // Default: localhost
    smtpPort: 25, // Default: 25
    smtpHost: -1 // Default: -1 - extra smtp host after resolveMX
});



// final callback
exports.finalCallback = function (req, res, ErrorCode, Status, result, ErrorMessage, authKey) {
    if (authKey) {
        res.json({ "ErrorCode": ErrorCode, Status: Status, "user": result, "ErrorMessage": ErrorMessage, "auth-key": authKey });
    } else {
        res.json({ "ErrorCode": ErrorCode, Status: Status, "user": result, "ErrorMessage": ErrorMessage });
    }
}

exports.CreateUser = function (req, res) {

    console.log("UserData.updatedprofile===", req.body);
    var UserData = JSON.parse(req.body.jsonInput)
    console.log("UserData.updatedprofile===", UserData);
    if (UserData.updatedprofile == true) {
        var sampleFile = req.files.profile;
        console.log("if i mam here")
        var Images = [];
        var dir = (__dirname + '/../../uploads/')
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, 755);
        }
        var UId = Date.now();
        Images.push({ "name": UId + "_" + sampleFile.name });
        sampleFile.mv(dir + UId + "_" + sampleFile.name, function (err) {
            if (err) {
                return res.status(500).send(err);
            } else {
                if (UserData.password) {
                    var hashedPassword = bcrypt.hashSync(UserData.password, 8);
                } else {
                    var hashedPassword = "";
                }
                var HubId;
                var params = {
                    "firstname": (UserData.firstname) ? (UserData.firstname) : "",
                    "lastname": (UserData.lastname) ? UserData.lastname : "",
                    "middlename": (UserData.middlename) ? UserData.middlename : false,
                    "email": (UserData.email) ? UserData.email : false,
                    "contactno": (UserData.contactno) ? UserData.contactno : false,
                    "password": hashedPassword,
                    "organizationid": (req.AuthData.organizationid) ? req.AuthData.organizationid : false,
                    "username": (UserData.username) ? UserData.username : false,
                    "usertypeid": (UserData.usertypeid) ? UserData.usertypeid : false,
                    "dob": moment(UserData.dob),
                    "dateofregistration": moment(),
                    "hubid": (UserData.hubid) ? UserData.hubid : false,
                    "profileImg": Images[0].name
                }

                return AuthServices.CreateUsers(params).then(function (Data) {
                    return Data;
                }).then(function (Item) {
                    HubId = Item.hubid.toString();
                    var updateparams = {
                        "isactive": "true"
                    }
                    var hubwhereparams = {
                        "_id": HubId
                    }
                    return AuthServices.UpdateHubs(hubwhereparams, updateparams).then(function (Data) {
                        successHelper.returnSuccess(true, res, 200, "User Created Successfully.", Item);
                    })
                }).catch(function (error) {
                    res.json(error);
                });
            }
        })
    } else {
        console.log("ele i mam here")
        if (UserData.password) {
            var hashedPassword = bcrypt.hashSync(UserData.password, 8);
        } else {
            var hashedPassword = "";
        }
        var HubId;
        var params = {
            "firstname": (UserData.firstname) ? (UserData.firstname) : "",
            "lastname": (UserData.lastname) ? UserData.lastname : "",
            "middlename": (UserData.middlename) ? UserData.middlename : false,
            "email": (UserData.email) ? UserData.email : false,
            "contactno": (UserData.contactno) ? UserData.contactno : false,
            "password": hashedPassword,
            "organizationid": (req.AuthData.organizationid) ? req.AuthData.organizationid : false,
            "username": (UserData.username) ? UserData.username : false,
            "usertypeid": (UserData.usertypeid) ? UserData.usertypeid : false,
            "dob": moment(UserData.dob),
            "dateofregistration": moment(),
            "hubid": (UserData.hubid) ? UserData.hubid : false,
            "profileImg": ""
        }

        return AuthServices.CreateUsers(params).then(function (Data) {
            return Data;
        }).then(function (Item) {
            HubId = Item.hubid.toString();
            var updateparams = {
                "isactive": "true"
            }
            var hubwhereparams = {
                "_id": HubId
            }
            return AuthServices.UpdateHubs(hubwhereparams, updateparams).then(function (Data) {
                successHelper.returnSuccess(true, res, 200, "User Created Successfully.", Item);
            })
        }).catch(function (error) {
            res.json(error);
        });
    }
};

exports.FindUser = function (req, res) {
    var ResponseData = { UserData: "", UserTypes: "", VehicleTypes: "" }
    var email = req.body.email ? req.body.email : false;
    return AuthServices.FindUsers(email).then(function (Data) {
        return ResponseData.UserData = Data;
    }).then(function (Data) {
        return AuthServices.GetUserTypes().then(function (userTypeData) {
            return ResponseData.UserTypes = userTypeData;
        })
    }).then(function (UserTypes) {
        return AuthServices.getVehicleTypes().then(function (vehicleTypeData) {
            return ResponseData.VehicleTypes = vehicleTypeData;
        })

    }).then(function () {
        successHelper.returnSuccess(false, res, 200, '', ResponseData);
    }).catch(function (error) {
        res.json(error);
    });
}


// Login
exports.Login = function (req, res, next) {
    var username = (req.body.username) ? req.body.username : false;
    var password = (req.body.password) ? req.body.password : false;
    var deviceid = (req.body.deviceid) ? req.body.deviceid : "";
    var firebasetoken = (req.body.firebasetoken) ? req.body.firebasetoken : "";
    var contactno = (req.body.contactno) ? req.body.contactno : false;
    var userData;
    if (password) {
        req.body.password = password;
    }
    if (!req.body.password || !username) {
        exports.finalCallback(req, res, 304, false, null, "Please send required parameter.");
    } else {
        return Passport.authenticate('local',
            function (err, user, info) {
                if (err) {
                    return errorsControllerHelper.returnError({
                        Succeeded: false, Status: 500, Message: 'Not authorize.', Name: 'Not authorize.'
                    }, res, 500);
                }
                if (!user) {
                    if (info.message == 'Invalid username.') {
                        exports.finalCallback(req, res, 404, false, null, "Invalid username.");
                    } else if (info.error == true && info.statusCode == 202) {
                        exports.finalCallback(req, res, 401, false, null, "Invalid Password.");
                    }
                } else {
                    //if (user.isactive == true) {
                    if (req.body.type == "Mobile") {
                        return LoginLog.findOne({ "userid": user._id }).sort({ _id: -1 }).then(function (LogoutUser) {

                            if (!LogoutUser) {
                                return exports.LoginUser_fun(user, req, res, deviceid, firebasetoken)
                            } else if (LogoutUser.islogout == true) {
                                return exports.LoginUser_fun(user, req, res, deviceid, firebasetoken)
                            } else if (LogoutUser.islogout == false && LogoutUser.deviceid == deviceid) {
                                return exports.LoginUser_fun(user, req, res, deviceid, firebasetoken)
                            } else {
                                // return errorsControllerHelper.returnError({
                                //     Succeeded: true, Status: 400, Message: 'User already Logged in.', Name: 'User already Logged in.'
                                // }, res, 400);
                                exports.finalCallback(req, res, 401, false, null, "User already Logged in.");
                                //res.json({ "ErrorCode": 300, "Message": "User already Logged in." });
                            }
                        })
                    } else {
                        return exports.LoginUser_fun(user, req, res, deviceid, firebasetoken)
                    }
                    // } else {
                    //     exports.finalCallback(req, res, 401, false, null, "User is blocked by admin.");
                    // }
                }
            }
        )(req, res, next);
    }
};


exports.GetSubAdminToken = function (req, res, next) {
    var OrgId = (req.params.Id) ? req.params.Id : "";
    var whereparams = {
        "organizationid": OrgId
    }
    return userservice.GetSingleUserInfo(whereparams).then(function (user) {
        if (user) {
            jwt.sign({
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
                data: {
                    id: user._id,
                    email: user.email,
                    organizationid: user.organizationid,
                    usertypeid: user.usertypeid
                }
            }, 'your_jwt_secret', function (err, decode) {
                if (err) {
                    return errorsControllerHelper.returnError({
                        Succeeded: false,
                        Status: 300,
                        Message: 'Error! Please try after some time',
                        Name: 'Error! Please try after some time'
                    }, res, 300);
                }

                res.setHeader('auth-key', 'Bearer ' + decode);
                exports.finalCallback(req, res, 200, 200, user, "Success.", "Bearer " + decode);
            });
        } else {
            exports.finalCallback(req, res, 200, 200, "user", "Success.");
        }
    })
}


exports.UpdateUser = function (req, res) {
    if (req.body.jsonInput) {
        var UserData = JSON.parse(req.body.jsonInput)
        if (UserData.password) {
            UserData.password = bcrypt.hashSync(UserData.password, 8);
        }
        var updateuserparams = UserData;
        var userwhereparams = {
            "_id": req.params.Id
        }
        if (req.files && Object.keys(req.files).length) {
            var sampleFile = req.files.profileImg;
            var ImageName = sampleFile.name.split(".");
            ImageName[ImageName.length - 1]
        }
    } else {
        if (req.body.password) {
            req.body.password = bcrypt.hashSync(req.body.password, 8);
        }
        var updateuserparams = req.body;
        var userwhereparams = {
            "_id": req.params.Id
        }
        if (req.files && Object.keys(req.files).length) {
            var sampleFile = req.files.profileImg;
            var ImageName = sampleFile.name.split(".");
            ImageName[ImageName.length - 1]
        }
    }
    if (sampleFile) {
        var dir = (__dirname + '/../../uploads/');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, 755);
        }
        var UId = uuidv1();
        sampleFile.mv(dir + ImageName[0] + "_" + UId + ".png", function (err) {
            if (!err) {
                updateuserparams.profileImg = ImageName[0] + "_" + UId + ".png";
                updateuserparams.dob = moment(updateuserparams.dob).utc().format();
                return AuthServices.UpdateUser(userwhereparams, updateuserparams).then(function (Data) {
                    return Data;
                }).then(function (Item) {
                    var updateparams = {
                        "isactive": true
                    }
                    var hubwhereparams = {
                        "_id": Item.hubid._id
                    }
                    return AuthServices.UpdateHubs(hubwhereparams, updateparams).then(function (Data) {
                        res.json({ "Status": 200, "result": Item, "Message": "User Updated successfully." });
                    })
                }).catch(function (error) {
                });
            } else {
                return errorsControllerHelper.returnError({
                    Succeeded: false, Status: 500, Message: 'An error occured while uploading proifle image.',
                    Name: 'An error occured while uploading proifle image.'
                }, res, 500);

            }
        });
        // var type = profileImg.split(';')[0].split('/')[1];
        // var buff = new Buffer(profileImg.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');
        // var imageName = Date.now() + ".png";
        //fs.writeFile(__dirname + '/../../uploads/' + imageName, buff, function (err) {

        //});
    } else {
        updateuserparams.dob = moment(updateuserparams.dob).utc().format();
        return AuthServices.UpdateUser(userwhereparams, updateuserparams).then(function (Data) {
            return Data;
        }).then(function (Item) {
            var updateparams = {
                "isactive": true
            }
            var hubwhereparams = {
                "_id": Item.hubid._id
            }
            return AuthServices.UpdateHubs(hubwhereparams, updateparams).then(function (Data) {

                res.json({ "Status": 200, "result": Item, "Message": "User Updated successfully." });
            })
        }).catch(function (error) {
            res.json(error);
        });
    }
}

exports.VerifyOpt = function (req, res) {
    var whereparams = {
        "email": req.body.email,
        "lastotp": req.body.lastotp
    }
    return AuthServices.findUserbyOtp(whereparams).then(function (Data) {
        if (!Data) {
            res.json({
                Status: 500,
                succeed: false,
                message: "Wrong Otp."
            })
        } else {
            var params = {
                "userid": Data._id,
                "mobilenumber": Data.contactno,
                "logindatetime": moment(),
                "currentlat": req.body.currentlat,
                "currentlng": req.body.currentlng,
                "deviceid": req.body.deviceid,
            }
            return AuthServices.addLoginLog(params).then(function (Data) {
                if (Data) {
                    res.json({ "Status": 200, "result": Data, "Message": "Login log created successfully." });
                }
            })
        }
    }).catch(function (error) {
        res.status(500).json({
            Status: 500,
            succeed: false,
            message: "Something went wrong.",
            errorsdata: error
        })
    });
}



/**** Lopgout User  */
exports.LogoutUser = function (req, res) {
    var params = req.body;
    return AuthServices.LogoutUser(params).then(function (Data) {
        if (Data) {
            res.json({ "Status": 200, "result": Data, "Message": "User Logout Successfully." });
        }
    }).catch(function (error) {
        res.status(500).json({
            code: 500,
            succeed: false,
            message: "Something went wrong.",
            errorsdata: error
        })
    });
}

/************** LogoutSingle User */
exports.LogoutSingleUser = function (req, res) {
    var params = req.body;
    return AuthServices.LogoutSingleUser(params).then(function (Data) {
        if (Data) {
            res.json({ "Status": 200, "result": Data, "Message": "User Logout Successfully." });
        }
    }).catch(function (error) {
        res.status(500).json({
            code: 500,
            succeed: false,
            message: "Something went wrong.",
            errorsdata: error
        })
    });
}

/*********************** Get Battery Data */
exports.GetBatteryData = function (req, res) {
    var whereparams = {
        "isactive": false,
    }
    return AuthServices.GetBatteryData(whereparams).then(function (Data) {
        if (Data) {
            res.json({ "Status": 200, "result": Data, "Message": "Battery Data." });
        }
    }).catch(function (error) {
        res.status(500).json({
            code: 500,
            succeed: false,
            message: "Something went wrong.",
            errorsdata: error
        })
    });
}


exports.StartVehicle = function (req, res) {
    var params = req.body;
    return AuthServices.FindVehicle(params).then(function (VehicleUpdatedData) {
        if (VehicleUpdatedData) {
            //var SSCString = `${VehicleUpdatedData.activatebysuperadmin}, ${VehicleUpdatedData.activatebyuser}`;

        }
        return VehicleUpdatedData;
    }).then(function (Data) {
        if (Data) {
            var SSCString = 0;
            if (Data.activatebysuperadmin == 1 && Data.activatebyuser == 1) {
                SSCString = 1;
            } else if (Data.activatebysuperadmin == 1 && Data.activatebyuser == 0) {
                SSCString = 0;
            } else if (Data.activatebysuperadmin == 0 && Data.activatebyuser == 1) {
                SSCString = 0;
            } else if (Data.activatebysuperadmin == 0 && Data.activatebyuser == 0) {
                SSCString = 0;
            }

            successHelper.thingShadowsHelper(Data.telemetryboardid, {
                "state": {
                    "desired": {
                        "AID": SSCString
                    }
                }
            });
            console.log("rgbLedLampState");
            if (Data.activatebysuperadmin == 0) {
                if (params.requesttype == "Web") {
                    res.json({ "Status": 200, "Message": "Vehicle stoped successfully.", "IsStart": SSCString });
                } else {
                    res.json({ "Status": 200, "Message": "Vehicle is temporarily disabled. Please contact your organization.", "IsStart": SSCString });
                }
            } else {
                res.json({ "Status": 200, "Message": (parseInt(params.startvalue) == 1) ? "Vehicle started successfully." : "Vehicle stoped successfully.", "IsStart": SSCString });
            }

        } else {
            console.log('connect 3223232');
            res.json({ "Status": 500, "Message": "Something went wrong." });
        }
    }).catch(function (error) {
        res.status(500).json({
            code: 500,
            succeed: false,
            message: "Something went wrong 1.",
            errorsdata: error
        })
    });
}

// get DashboardData
exports.GetDashboardData = function (req, res) {
    console.log("req.AuthData._id", req.AuthData._id)
    return AuthServices.getDashboardData(req.AuthData._id, req, res).then(function (Data) {
        if (Data) {
            res.json({ "Status": 200, "Message": "Dashboard Data.", "Data": Data });
        } else {
            var Data = "";
            res.json({ "Status": 300, "Message": "", "Data": Data });
        }
    }).catch(function (error) {
        res.status(500).json({
            code: 500,
            succeed: false,
            message: error,
            errorsdata: error
        })
    });
}

// get SendMailforForgetPassword
exports.SendMailforForgetPassword = function (req, res) {
    var email = (req.body.email) ? req.body.email : false
    return AuthServices.getForgetpasswordMail(email).then(function (Data) {
        if (Data) {
            sendmail({
                from: 'no-reply@yourdomain.com',
                to: email,
                subject: 'Forget Password',
                html: 'Mail of test sendmail ',
            }, function (err, reply) {
                if (err) {
                    exports.finalCallback(req, res, 401, false, null, err);
                } else {
                    res.json({ "Status": 200, "Message": "Link has been send to you registered email Id123." });
                }
            });
        } else {
            res.json({ "Status": 500, "Message": "User is not Valid." });
        }
    }).catch(function (error) {
        res.status(500).json({
            code: 500,
            succeed: false,
            message: "Something went wrong.",
            errorsdata: error
        })
    });
}


exports.CreateException = function (req, res) {
    var params = req.body;
    return AuthServices.CreateEcxeption(params).then(function (Data) {
        if (Data) {
            res.json({ "Status": 200, "Message": "Exception created successfully.", "Data": Data });
        } else {
            var Data = "";
            res.json({ "Status": 200, "Message": "Dashboard Data.", "Data": Data });
        }
    }).catch(function (error) {
        res.status(500).json({
            code: 500,
            succeed: false,
            message: "Something went wrong.",
            errorsdata: error
        })
    });
}


// Function for create role
exports.CreateRoles = function (req, res) {
    var params = req.body;
    return AuthServices.CreateRoles(params).then(function (Data) {
        if (Data) {
            res.json({ "Status": 200, "Message": "Exception created successfully.", "Data": Data });
        } else {
            var Data = "";
            res.json({ "Status": 200, "Message": "Dashboard Data.", "Data": Data });
        }
    }).catch(function (error) {
        res.status(500).json({
            code: 500,
            succeed: false,
            message: "Something went wrong.",
            errorsdata: error
        })
    });
}


// get Country List
exports.GetCountryList = function (req, res) {
    return AuthServices.GetAllCountryList().then(function (Data) {
        if (Data) {
            res.json({ "Status": 200, "Message": "Country List.", "Data": Data });
        } else {
            res.json({ "Status": 200, "Message": "Country List.", "Data": "" });
        }
    }).catch(function (error) {
        res.status(500).json({
            code: 500,
            succeed: false,
            message: "Something went wrong.",
            errorsdata: error
        })
    })
}

// get State List

exports.GetStateList = function (req, res) {
    var countryid = req.params.countryId
    return AuthServices.GetAllStateList(countryid).then(function (Data) {
        if (Data) {
            res.json({ "Status": 200, "Message": "State List.", "Data": Data });
        } else {
            res.json({ "Status": 200, "Message": "State List.", "Data": "" });
        }
    }).catch(function (error) {
        res.status(500).json({
            code: 500,
            succeed: false,
            message: "Something went wrong.",
            errorsdata: error
        })
    })
}

// city List

exports.GetCityList = function (req, res) {
    var stateid = req.params.stateId
    return AuthServices.GetAllCityList(stateid).then(function (Data) {
        if (Data) {
            res.json({ "Status": 200, "Message": "City List.", "Data": Data });
        } else {
            res.json({ "Status": 200, "Message": "City List.", "Data": "" });
        }
    }).catch(function (error) {
        res.status(500).json({
            code: 500,
            succeed: false,
            message: "Something went wrong.",
            errorsdata: error
        })
    })
}


exports.LoginUser_fun = function (user, req, res, deviceid, firebasetoken) {
    var userData;
    return req.logIn(user, function (err) {
        userData = user;
        jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
            data: {
                id: user._id,
                email: user.email,
                organizationid: user.organizationid,
                usertypeid: user.usertypeid,
                hubid: user.hubid
            }
        }, 'your_jwt_secret', function (err, decode) {
            if (err) {
                return errorsControllerHelper.returnError({
                    Succeeded: false,
                    Status: 300,
                    Message: 'Error! Please try after some time',
                    Name: 'Error! Please try after some time'
                }, res, 300);
            }
            res.setHeader('auth-key', 'Bearer ' + decode);
            var Otp = Math.floor(1000 + Math.random() * 9000);
            if (user.contactno != undefined) {
                var Contrycode = "+91";
                AWS.config.update({
                    accessKeyId: config.accessKeyId,
                    secretAccessKey: config.secretAccessKey,
                    region: config.region
                });
                var sns = new AWS.SNS({ "region": config.region });
                var params = {
                    Message: "Your Otp is " + Otp.toString() + " Please don't share with any one",
                    MessageStructure: 'text',
                    PhoneNumber: Contrycode.toString() + user.contactno.toString()
                };
                sns.publish(params, function (err, data) {
                    if (err) {
                        console.log(err, err.stack); // an error occurred  
                    }
                    else {
                        var updateparams = {
                            "lastotprequestdatetime": moment(),
                            "lastotp": Otp,
                            "deviceid": deviceid,
                            "firebasetoken": firebasetoken
                        }
                        return AuthServices.UpdateUser(userData._id, updateparams).then(function (Item) {
                            if (Item) {
                                user.lastotp = Otp;
                                exports.finalCallback(req, res, 200, true, user, "Success.", "Bearer " + decode);
                            }
                        });
                    }
                });
            } else {
                var updateparams = {
                    "lastotprequestdatetime": moment(),
                    "lastotp": Otp,
                    "deviceid": deviceid,
                    "firebasetoken": firebasetoken
                }
                return AuthServices.UpdateUser(userData._id, updateparams).then(function (Item) {
                    if (Item) {
                        user.lastotp = Otp;
                        exports.finalCallback(req, res, 200, true, user, "Success.", "Bearer " + decode);
                    }
                });
            }
            /* send otp ends here */
        });
    });
}

/*******************Block user by admin 17-07-2019 */
exports.BlockUserByAdmin = function (req, res) {
    var updateparams = {
        "isactive": false
    }
    var whereparams = {
        "_id": req.body.Id
    }
    return AuthServices.BlockUser(whereparams, updateparams).then(function (Item) {
        if (Item.params == true) {
            res.json({ "Status": 200, "Message": "User UnBlock successfully." });
        } else {
            res.json({ "Status": 200, "Message": "User Block successfully." });
        }
    }).catch(function (error) {
        res.status(500).json({
            code: 500,
            succeed: false,
            message: "Something went wrong.",
            errorsdata: error
        })
    });
}