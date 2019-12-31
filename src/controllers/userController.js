// Import contact model';
var AuthServices = require('../services/authServices');
var UserServices = require('../services/userServices');
var SendOtp = require('sendotp');
var sendOtp = new SendOtp('271041A3tkxEmFrb5ca730f1');
var bcrypt = require('bcrypt');
var moment = require('moment');
var config = require('../../config');
var fs = require('fs');
var bPromise = require('bluebird');
var errorsControllerHelper = require('../helpers/errors.controller.helper');
// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Handle ListUser actions
exports.UserList = function (req, res) {
    var params = req.body
    if(params.status == "active"){
        var whereparams = {
            "organizationid": req.AuthData.organizationid,
            "isactive":true,
            "usertypeid": { $ne: "5cd2c46e3f068c1ffde5d624" },
            //"isactive":true
        }
    }else if(params.status == "inactive"){
        var whereparams = {
            "organizationid": req.AuthData.organizationid,
            "isactive":false,
            "usertypeid": { $ne: "5cd2c46e3f068c1ffde5d624" },
            //"isactive":true
        }
    }else{
        var whereparams = {
            "organizationid": req.AuthData.organizationid,
            "usertypeid": { $ne: "5cd2c46e3f068c1ffde5d624" },
            //"isactive":true
        } 
    }
    return UserServices.FindAllUsersList(whereparams).then(function (Data) {
        res.json({ "Status": 200, "result": Data, "Message": "User list." });
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
};

// Handle createVendors actions
exports.CreateVendor = function (req, res) {
    return UserServices.CreateVendors(req.body).then(function (Data) {
        if(Data){
            res.json({ "Status": 200, "result": Data, "Message": "Vendor created successfully." });
        }else{
            res.json({ "Status": 300, "Message": "some parameter missing." });
        }
        
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

// Handle CreateUserWallet actions
exports.CreateUserWallet = function (req, res) {
    return UserServices.CreateUserWallets(req.body).then(function (Data) {
        if(Data){
            res.json({ "Status": 200, "result": Data, "Message": "UserWallet created successfully." });
        }else{
            var Data = [];
            res.json({ "Status": 200, "result": Data, "Message": "UserWallet created successfully." });
        }
        
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

// get User Profile
exports.GetUserProfile = function (req, res) {
    var whereparams = {
        "_id": req.AuthData._id
    }
    return UserServices.GetProfileData(whereparams).then(function (Data) {
        if(Data){
            res.json({ "Status": 200, "result": Data, "Message": "User profile data." });
        }else{
            var Data = [];
            res.json({ "Status": 200, "result": Data, "Message": "User profile data." });
        }
        
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

exports.UpdatePassword = function (req, res) {
    var updateparams = {
        password: bcrypt.hashSync(req.body.password, 8)
    }
    var params = req.body;
    return UserServices.UpdatePassword(req.AuthData._id, updateparams, params).then(function (Data) {
        if (Data) {
            res.json({ "Status": 200, "Message": "Password updated successfully." });
        } else {
            res.json({ "Status": 500, "Message": "Current password don't match." });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

exports.sendOTP = function (req, res) {
    var Contrycode = "+91";
    var Phonenumber = (req.body.phonenumber) ? req.body.phonenumber : false;
    var otp = Math.floor(1000 + Math.random() * 9000);
    var whereparams = {
        "contactno": req.body.phonenumber
    }
    return UserServices.GetProfileData(whereparams).then(function (Data) {
        if (Data) {
            /*AWS.config.update({
                accessKeyId: 'AKIA2JPZE4BPCRRGOBTU',
                secretAccessKey: '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',
                region: 'us-east-1'
            });*/
            AWS.config.update({
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
                region: config.region
            });
            var sns = new AWS.SNS({ "region": "us-west-2" });
            var params = {
                Message: otp.toString(),
                MessageStructure: 'text',
                PhoneNumber: Contrycode.toString() + Phonenumber.toString()
            };
            sns.publish(params, function (err, data) {
                if (err) {
                    console.log(err, err.stack); // an error occurred  
                }
                else {
                    var updateparams = {
                        "lastotprequestdatetime": moment(),
                        "lastotp": otp
                    }
                    return AuthServices.UpdateUser(Data._id, updateparams).then(function (Item) {
                        if (Item) {
                            res.json({ "Status": 200, "result": otp, "Message": "OTP sent to your registered mobile number." });
                        }
                    });
                }
            });
        } else {
            return errorsControllerHelper.returnError({
                Succeeded: false,
                Status: 500,
                Message: 'Please enter registered mobile number.',
                Name: 'Please enter registered mobile number.'
            }, res, 500);
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

exports.VerifyOTP = function (req, res) {
    var whereparams = {
        "contactno": req.body.PhoneNumber,
        "lastotp": req.body.lastotp
    }
    return AuthServices.findUserbyOtp(whereparams).then(function (Data) {
        if (Data) {
            if (moment().format("YYYY-MM-DD HH:mm:ss") >= moment(Data.get("lastotprequestdatetime")).add("m", 15).format("YYYY-MM-DD HH:mm:ss")) {
                return errorsControllerHelper.returnError({
                    Succeeded: false,
                    Status: 500,
                    Message: 'OTP has been expired.',
                    Name: 'OTP has been expired.'
                }, res, 500);
            } else {
                var params = {
                    "userid": Data._id,
                    "mobilenumber": Data.contactno
                }
                return AuthServices.UpdateLoginLogData(params).then(function (Data) {
                    res.json({ "Status": 200, "result": { "userId": Data.get("_id") }, "Message": "successful" });
                })

            }
        } else {
            res.json({
                Status: 500,
                succeed: false,
                message: "Wrong Otp."
            })
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

exports.resetPassword = function (req, res) {
    var updateparams = {
        password: bcrypt.hashSync(req.body.password, 8),
        userId: (req.body.userId) ? req.body.userId : false
    }
    if (updateparams.userId) {
        return UserServices.ResetPassword(updateparams.userId, updateparams).then(function (Data) {
            res.json({ "Status": 200, "result": Data, "Message": "Password updated successfully." });
        }).catch(function (error) {
            res.status(500).json({
                Status: 500,
                succeed: false,
                message: "Something went wrong.",
                errorsdata: error
            })
        });
    } else {
        res.json({
            Status: 500,
            succeed: false,
            message: "Please send required parameter."
        })
    }
}

exports.getUserTypeList = function (req, res) {
    return UserServices.GetUsersTypesData().then(function (Item) {
        res.json({ "Status": 200, "Data": Item, "Message": "User Type List." });
    }).catch(function (error) {
        res.status(500).json({
            code: 500,
            succeed: false,
            message: "Something went wrong.",
            errorsdata: error
        })
    });
}



exports.UserDetailList = function (req, res) {
    var Id = (req.params.Id) ? req.params.Id : false
    var whereparams = {
        "_id": Id
    }
    return UserServices.GetUserDetails(whereparams).then(function (Item) {
        res.json({ "Status": 200, "Data": Item, "Message": "User Details List." });
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}


exports.CreateUserlogData = function (req, res) {
    var params = req.body
    return UserServices.CreateUserLog(params).then(function (Item) {
        res.json({ "Status": 200, "Data": Item, "Message": "UserLog Created Successfully." });
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}


exports.GetManagerUserData = function (req, res) {
    var whereparams = {
        "usertypeid": req.AuthData.usertypeid,
        "organizationid": req.AuthData.organizationid
    }
    return UserServices.GetManagerUserData(whereparams).then(function (Item) {
        res.json({ "Status": 200, "Data": Item, "Message": "Manager Data." });
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

exports.BlockedUser = function (req, res) {
    var params = req.body;
    return UserServices.BlockedUser(params).then(function (Item) {
        res.json({ "Status": 200, "Data": Item, "Message": "User blocked successfully." });
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

exports.CreateFaq = function (req, res) {
    var params = req.body;
    return UserServices.CreateFaqQuestions(params).then(function (Item) {
        res.json({ "Status": 200, "Data": Item, "Message": "Faq created successfully." });
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

exports.FaqList = function (req, res) {
    return UserServices.FaqQuestionLists().then(function (Item) {
        if(Item){
            res.json({ "Status": 200, "Data": Item, "Message": "Faq Question list." });
        }else{
            var Item = [];
            res.json({ "Status": 200, "Data": Item, "Message": "Faq Question list." });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

exports.CreateComplaint = function (req, res) {
    var params = req.body;
    var Images = [];
    var sampleFile = req.files.picture;
    if (sampleFile.length > 0) {
        var dir = (__dirname + '/../../uploads/complaint/')
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, 755);
        }
        return bPromise.map(sampleFile, function (Data) {
            var UId = Date.now();
            Images.push({ "name": UId + "_" + Data.name });
            Data.mv(dir + UId + "_" + Data.name, function (err) {
                if (err) {
                    return res.status(500).send(err);
                }
            });
        }).then(function () {
            return UserServices.CreateComplaint(params, Images).then(function (Item) {
                res.json({ "Status": 200, "Data": Item, "Message": "Complaint registered successfully." });
            }).catch(function (error) {
                res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
            });
        })
    } else {
        var dir = (__dirname + '/../../uploads/complaint/')
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, 755);
        }
        var UId = Date.now();
        Images.push({ "name": UId + "_" + sampleFile.name });
        sampleFile.mv(dir + UId + "_" + sampleFile.name, function (err) {
            if (err) {
                return res.status(500).send(err);
            }
        });
        return UserServices.CreateComplaint(params, Images).then(function (Item) {
            res.json({ "Status": 200, "Data": Item, "Message": "Complaint registered successfully." });
        }).catch(function (error) {
            res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
        });
    }
}

exports.GetRegisterComplaint = function (req, res) {
    var params = req.body;
    var AuthData = req.AuthData;
    return UserServices.GetRegisterComplaint(params, AuthData).then(function (Item) {
        if(Item){
            res.json({ "Status": 200, "Data": Item, "Message": "Complaint list." });
        }else{
            var Item = [];
            res.json({ "Status": 200, "Data": Item, "Message": "Complaint list." });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}


exports.BookingSheet = function (req, res) {
    var params = req.body;
    params.datetime = moment().utc().format();
    params.userid = req.AuthData._id;
    return UserServices.BookingSheet(params).then(function (Item) {
        res.json({ "Status": 200, "Data": Item, "Message": "Booking is successfully. " });
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

exports.ReleasingSheet = function (req, res) {
    var params = req.body;
    var AuthData = req.AuthData;
    return UserServices.ReleasingSheet(params, AuthData).then(function (Item) {
        res.json({ "Status": 200, "Message": "Seat "+params.seatnumber+" has been released you get ₹"+params.paidamount+" ." });
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

exports.FaqUpdate = function(req, res){
    var FaqId = (req.params.Id)?req.params.Id:false;
    var updateparams = req.body;
    return UserServices.UpdateFaq(FaqId, updateparams).then(function (Item) {
        res.json({ "Status": 200, "Message": "Faq has been update successfully. " });
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

exports.GetAllRoleList = function(req, res){
    return UserServices.GetAllRoleLists().then(function (Item) {
        if(Item){
            res.json({ "Status": 200, "Message": "RoleList. ","result": Item});
        }else{
            var Item = [];
            res.json({ "Status": 200, "Message": "RoleList. ","result": Item});
        }
        
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

exports.CreateRole = function(req, res){
    var params = req.body
    return UserServices.CreateUserRole(params).then(function (Item) {
        if(Item){
            res.json({ "Status": 200, "Message": "RoleList. ","result": Item});
        }else{
            var Item = [];
            res.json({ "Status": 200, "Message": "RoleList. ","result": Item});
        }
        
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    }); 
}

exports.GetSingleProfileSetting = function(req, res){
    var params = req.AuthData;
    return UserServices.GetSingleProfileSetting(params).then(function (Item) {
        res.json({ "Status": 200, "Message": "User Profile List. ","result": Item});
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    }); 
}

exports.UpdateSingleProfileSetting = function (req, res) {
    var whereparams = req.AuthData;
    var updateparams = req.body;
    return UserServices.UpdateSingleProfileSetting(whereparams, updateparams).then(function (Item) {
        if (Item) {
            res.json({ "Status": 200, "Message": "Profile setting update successfully. ", "result": Item });
        } else {
            res.json({ "Status": 200, "Message": "user not found. ", "result": Item });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}
/*************************** FleetManagerUserList */
exports.FleetManagerUserList = function(req, res){
    var whereparams = req.AuthData;
    var updateparams = req.body;
    return UserServices.FleetManagerUserList().then(function (Item) {
        if (Item) {
            res.json({ "Status": 200, "Message": "Profile setting update successfully. ", "result": Item });
        } else {
            res.json({ "Status": 200, "Message": "user not found. ", "result": Item });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}
/**************************ChargingOperatorUserList */
exports.ChargingOperatorUserList = function(req, res){
    var whereparams = req.AuthData;
    var updateparams = req.body;
    return UserServices.ChargingOperatorUserList().then(function (Item) {
        if (Item) {
            res.json({ "Status": 200, "Message": "Charging operator list. ", "result": Item });
        } else {
            res.json({ "Status": 200, "Message": "user not found. ", "result": Item });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}


/*************************ZonalManagerUserList */
exports.ZonalManagerUserList = function(req, res){
    return UserServices.ZonalManagerUserList().then(function (Item) {
        if (Item) {
            res.json({ "Status": 200, "Message": "Zonal Manager list. ", "result": Item });
        } else {
            res.json({ "Status": 200, "Message": "user not found. ", "result": Item });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}


// //*** */getNotificationUserbychargingstation//
// exports.getNotificationUserbychargingstation = function(req, res){
//     var params = req.params
//     return UserServices.getNotificationUserbychargingstation(params).then(function (Item) {
//         if (Item) {
//             res.json({ "Status": 200, "Message": "Charging operator list. ", "result": Item });
//         } else {
//             var Item = [];
//             res.json({ "Status": 200, "Message": "No notification found. ", "result": Item });
//         }
//     }).catch(function (error) {
//         res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
//     });
// }


// /*****************************getNotificationUserbyBatteryData */
// exports.getNotificationUserbyBatteryData = function(req, res){
//     var params = req.params;
//     return UserServices.getNotificationUserbyBatteryData(params).then(function (Item) {
//         if (Item) {
//             res.json({ "Status": 200, "Message": "Battery data list. ", "result": Item });
//         } else {
//             var Item = [];
//             res.json({ "Status": 200, "Message": "No notification found. ", "result": Item });
//         }
//     }).catch(function (error) {
//         res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
//     });
// }

//***** GetChargingStationAlaramList*/
exports.GetChargingStationAlaramList = function(req, res){
    var params = req.params.Id
    return UserServices.GetChargingStationAlaramList(params).then(function (Item) {
        if (Item) {
            res.json({ "Status": 200, "Message": "Charging station Alaram list. ", "result": Item });
        } else {
            var Item = [];
            res.json({ "Status": 200, "Message": "Charging station Alaram list. ", "result": Item });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}


exports.GetBatteryDataAlaramList = function(req, res){
    var params = req.params.Id
    return UserServices.GetBatteryDataAlaramList(params).then(function (Item) {
        if (Item) {
            res.json({ "Status": 200, "Message": "Charging station Alaram list. ","result": Item});
        } else {
            var Item = [];
            res.json({ "Status": 200, "Message": "Charging station Alaram list. " });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

/*****************************************=================================================== */
/**************** Controller for Add Country */
exports.AddCountry = function(req, res){
    var params = req.body
    return UserServices.AddCountrys(params).then(function (Item) {
        if (Item) {
            res.json({ "Status": 200, "Message": "Country added successfully. ", "result": Item });
        } else {
            var Item = [];
            res.json({ "Status": 200, "Message": ". ", "result": Item });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

/**************** Controller for Add State */
exports.AddState = function(req, res){
    var params = req.body
    return UserServices.AddStates(params).then(function (Item) {
        if (Item) {
            res.json({ "Status": 200, "Message": "State added successfully. ", "result": Item });
        } else {
            var Item = [];
            res.json({ "Status": 200, "Message": ". ", "result": Item });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

/**************** Controller for Add city */
exports.AddCity = function(req, res){
    var params = req.body
    return UserServices.AddCitys(params).then(function (Item) {
        if (Item) {
            res.json({ "Status": 200, "Message": "City added successfully. ", "result": Item });
        } else {
            var Item = [];
            res.json({ "Status": 200, "Message": ". ", "result": Item });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

//**************************************************************======================== */
/**************** Controller for Update Country */
exports.UpdateCountry = function(req, res){
    var updateparams = req.body;
    var Id = req.params.Id;
    return UserServices.UpdateCountrys(Id, updateparams).then(function (Item) {
        if (Item) {
            res.json({ "Status": 200, "Message": "Country updated successfully. ", "result": Item });
        } else {
            var Item = [];
            res.json({ "Status": 200, "Message": ". ", "result": Item });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

/**************** Controller for Update State */
exports.UpdateState = function(req, res){
    var updateparams = req.body
    var Id = req.params.Id
    return UserServices.UpdateStates(Id, updateparams).then(function (Item) {
        if (Item) {
            res.json({ "Status": 200, "Message": "State updated successfully. ", "result": Item });
        } else {
            var Item = [];
            res.json({ "Status": 200, "Message": ". ", "result": Item });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

/**************** Controller for Update city ***********************/
exports.UpdateCity = function(req, res){
    var updateparams = req.body;
    var Id = req.params.Id;
    return UserServices.UpdateCitys(Id, updateparams).then(function (Item) {
        if (Item) {
            res.json({ "Status": 200, "Message": "City updated successfully. ", "result": Item });
        } else {
            var Item = [];
            res.json({ "Status": 200, "Message": ". ", "result": Item });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}


//**************************************************************==========Delete============== */
/**************** Controller for Delete Country */
exports.DeleteCountry = function(req, res){
    var updateparams = req.body;
    var Id = req.params.Id;
    return UserServices.DeleteCountrys(Id, updateparams).then(function (Item) {
        if (Item) {
            res.json({ "Status": 200, "Message": "Country delete successfully. ", "result": Item });
        } else {
            var Item = [];
            res.json({ "Status": 200, "Message": ". ", "result": Item });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

/**************** Controller for deleteCountry State */
exports.DeleteState = function(req, res){
    var updateparams = req.body
    var Id = req.params.Id
    return UserServices.DeleteStates(Id, updateparams).then(function (Item) {
        if (Item) {
            res.json({ "Status": 200, "Message": "State delete successfully. ", "result": Item });
        } else {
            var Item = [];
            res.json({ "Status": 200, "Message": ". ", "result": Item });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

/**************** Controller for deleteCountry city */
exports.DeleteCity = function(req, res){
    var updateparams = req.body;
    var Id = req.params.Id;
    return UserServices.DeleteCitys(Id, updateparams).then(function (Item) {
        if (Item) {
            res.json({ "Status": 200, "Message": "City delete successfully. ", "result": Item });
        } else {
            var Item = [];
            res.json({ "Status": 200, "Message": ". ", "result": Item });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}


//**************************************************************==========get============== */
/**************** Controller for Delete Country */
exports.GetCountry = function(req, res){
    var Id = req.params.Id;
    return UserServices.GetCountrys(Id).then(function (Item) {
        if (Item) {
            res.json({ "Status": 200, "Message": "Get country. ", "result": Item });
        } else {
            var Item = [];
            res.json({ "Status": 200, "Message": ". ", "result": Item });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

/**************** Controller for deleteCountry State */
exports.GetState = function(req, res){
    var Id = req.params.Id
    return UserServices.GetStates(Id).then(function (Item) {
        if (Item) {
            res.json({ "Status": 200, "Message": "Get states. ", "result": Item });
        } else {
            var Item = [];
            res.json({ "Status": 200, "Message": ". ", "result": Item });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

/**************** Controller for deleteCountry city */
exports.GetCity = function(req, res){
    var Id = req.params.Id;
    return UserServices.GetCitys(Id).then(function (Item) {
        if (Item) {
            res.json({ "Status": 200, "Message": "Get city. ", "result": Item });
        } else {
            var Item = [];
            res.json({ "Status": 200, "Message": ". ", "result": Item });
        }
    }).catch(function (error) {
        res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
    });
}

/*********************Create Battery Manufacture */
exports.CreateBatteryManufacturer = function (req, res) {
   var params = req.body
   return UserServices.CreateBatteryManufacture(params).then(function (Item) {
       if (Item) {
           res.json({ "Status": 200, "Message": "Battery manufacturer created successfully. ", "result": Item });
       } else {
           var Item = [];
           res.json({ "Status": 200, "Message": "Battery manufacturer created successfully.", "result": Item });
       }
   }).catch(function (error) {
       res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
   });
}
exports.UpdateBatteryManufacturer = function(req, res){
   var params = req.body
   return UserServices.UpdateBatteryManufacturer(params).then(function (Item) {
       if (Item) {
           res.json({ "Status": 200, "Message": "Battery manufacturer updated successfully. ", "result": Item });
       } else {
           var Item = [];
           res.json({ "Status": 200, "Message": "Battery manufacturer updated successfully.", "result": Item });
       }
   }).catch(function (error) {
       res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
   });
}
exports.GetBatteryManufacturer = function (req, res) {
   return UserServices.GetBatteryManufacturer().then(function (Item) {
       if (Item) {
           res.json({ "Status": 200, "Message": "Battery manufacturer list. ", "result": Item });
       } else {
           res.json({ "Status": 200, "Message": ". ", "result": Item });
       }
   }).catch(function (error) {
       res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
   });
}
exports.GetBatteryManufacturerList = function(req, res){
   return UserServices.GetBatteryManufacturerList().then(function (Item) {
       if (Item) {
           res.json({ "Status": 200, "Message": "Battery manufacturer list.", "result": Item });
       } else {
           res.json({ "Status": 200, "Message": "Battery manufacturer list.", "result": Item });
       }
   }).catch(function (error) {
       res.status(500).json({ code: 500, succeed: false, message: "Something went wrong.", errorsdata: error });
   });
}


exports.ActiveInactiveFaq = function(req, res){
   var Item  = req.body
   return UserServices.ActiveInactiveFaq(Item).then(function (data) {
       if (Item.isactive == true) {
           res.json({ "Status": 200, "Message": "Faq Activated successfully." });
       } else if(Item.isactive == false) {
           res.json({ "Status": 200, "Message": "Faq Deactivated successfully." });
       }else{
           res.json({ "Status": 200, "Message": "Faq Question list." });
       }
   }).catch(function (error) {
       //console.log("error=========",error)
      return error
   });
}