// Import contact model';
var OrganizationServices = require('../services/organizationServices');
var VehicleServices = require('../services/vehicleServices');
var UserserviceServices = require('../services/userServices');
import { Organization } from '../models/organization';
var successHelper = require('../helpers/success.helper');
import { User } from '../models/user';
var errorsControllerHelper = require('../helpers/errors.controller.helper');
var bPromise = require('bluebird');
var bcrypt = require('bcrypt');
var fs = require('fs');
var moment = require('moment');
var uuidv1 = require('uuid/v1');
var fs = require('fs');

// CReate Organization
exports.CreateOrganizations = function (req, res) {
    var sampleFile = req.files.logo;
    var orgdata = JSON.parse(req.body.jsonInput)
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
            var params = {
                "organizationname": (orgdata.organizationname) ? orgdata.organizationname : "",
                "city": (orgdata.city) ? orgdata.city : "",
                "address1": (orgdata.address1) ? orgdata.address1 : "",
                "address2": (orgdata.address2) ? orgdata.address2 : "",
                "lat": (orgdata.lat) ? orgdata.lat : "",
                "lng": (orgdata.lng) ? orgdata.lng : "",
                "state": (orgdata.state) ? orgdata.state : "",
                "country": (orgdata.country) ? orgdata.country : "",
                "pincode": (orgdata.pincode) ? orgdata.pincode : "",
                "contactno": (orgdata.contactno) ? orgdata.contactno : "",
                "logo": Images[0].name
            }
            return OrganizationServices.CreateOrganizations(params).then(function (Data) {
                return Data;
            }).then(function (Data) {
                successHelper.returnSuccess(true, res, 200, "Organization created successfully.");
            }).catch(function (error) {
                res.status(500).json({
                    errorsdata: error
                })
            });
        }
    });
}
/******************************* Update Organizations*/
exports.UpdateOrganization = function (req, res) {
    var orgdata = JSON.parse(req.body.jsonInput)
    if (orgdata.updatedlogo == true) {
        var sampleFile = req.files.logo;
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
                var params = {
                    "organizationname": (orgdata.organizationname) ? orgdata.organizationname : "",
                    "city": (orgdata.city) ? orgdata.city : "",
                    "address1": (orgdata.address1) ? orgdata.address1 : "",
                    "address2": (orgdata.address2) ? orgdata.address2 : "",
                    "lat": (orgdata.lat) ? orgdata.lat : "",
                    "lng": (orgdata.lng) ? orgdata.lng : "",
                    "state": (orgdata.state) ? orgdata.state : "",
                    "country": (orgdata.country) ? orgdata.country : "",
                    "pincode": (orgdata.pincode) ? orgdata.pincode : "",
                    "contactno": (orgdata.contactno) ? orgdata.contactno : "",
                    "logo": Images[0].name
                }
                var orgwhereparams = {
                    "_id": req.params.Id
                }
                return OrganizationServices.UpdateOrganiztions(orgwhereparams, params).then(function (Data) {
                    return Data;
                }).then(function (Data) {
                    successHelper.returnSuccess(true, res, 200, "Organization updated successfully.");
                }).catch(function (err) {
                    res.status(500).json({
                        errorsdata: err
                    })
                })
            }
        });
    } else {
        return Organization.findOne({ _id: req.params.Id }).then(function (GetOrgData) {
            var params = {
                "organizationname": (orgdata.organizationname) ? orgdata.organizationname : "",
                "city": (orgdata.city) ? orgdata.city : "",
                "address1": (orgdata.address1) ? orgdata.address1 : "",
                "address2": (orgdata.address2) ? orgdata.address2 : "",
                "lat": (orgdata.lat) ? orgdata.lat : "",
                "lng": (orgdata.lng) ? orgdata.lng : "",
                "state": (orgdata.state) ? orgdata.state : "",
                "country": (orgdata.country) ? orgdata.country : "",
                "pincode": (orgdata.pincode) ? orgdata.pincode : "",
                "contactno": (orgdata.contactno) ? orgdata.contactno : "",
                "logo": GetOrgData.logo
            }
            var orgwhereparams = {
                "_id": req.params.Id
            }
            return OrganizationServices.UpdateOrganiztions(orgwhereparams, params).then(function (Data) {
                return Data;
            }).then(function (Data) {
                successHelper.returnSuccess(true, res, 200, "Organization updated successfully.");
            }).catch(function (err) {
                res.status(500).json({
                    errorsdata: err
                })
            })
        })
    }
}
// Get Organization
exports.GetOrganization = function (req, res) {
    var Id = (req.params.Id) ? req.params.Id : false;
    var params = {
        "_id": Id
    }
    return OrganizationServices.FindSingleOrganization(params).then(function (Data) {
        successHelper.returnSuccess(false, res, 200, "Vendor List.", Data);
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false, Status: 500, Message: 'Not authorize.', Name: 'Not authorize.'
        }, res, 500);
    });
}


//********************* Create Vendors */ 
exports.CreateVendor = function (req, res) {
    var sampleFile = req.files.profileImg;
    var userdata = JSON.parse(req.body.jsonInput);
    var hashedPassword = bcrypt.hashSync(userdata.password, 8);
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
            var paramsvendors = {
                "organizationid": userdata.organizationid ? userdata.organizationid : "",
                "usertypeid": "5cd2c46e3f068c1ffde5d624",
                "contactno": (userdata.contactno) ? userdata.contactno : "",
                "firstname": (userdata.firstname) ? userdata.firstname : "",
                "username": (userdata.username) ? userdata.username : "",
                "password": (hashedPassword) ? hashedPassword : "",
                "middlename": (userdata.middlename) ? userdata.middlename : "",
                "dob": (userdata.dob) ? userdata.dob : "",
                "lastname": (userdata.lastname) ? userdata.lastname : "",
                "email": (userdata.email) ? userdata.email : "",
                "roletype": (userdata.roletype) ? userdata.roletype : "",
                "profileImg": Images[0].name,
                "DateOfRegistration": moment().format()
            }
            return UserserviceServices.CreateVendors(paramsvendors, userdata.password).then(function (Data) {
                successHelper.returnSuccess(true, res, 200, "Vendor created successfully.");
            }).catch(function (error) {
                res.status(500).json({
                    errorsdata: error
                })
            });
        }
    })
}


//**************************** update Vendor List*/ 
exports.UpdateVendorLists = function (req, res) {
    var userdata = JSON.parse(req.body.jsonInput)
    if (userdata.profileupdated == true) {
        var sampleFile = req.files.profileImg;
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
                var Updateparams = {
                    "organizationid": (userdata.organizationid) ? userdata.organizationid : "",
                    "firstname": (userdata.firstname) ? userdata.firstname : "",
                    "lastname": (userdata.lastname) ? userdata.lastname : "",
                    "middlename": (userdata.middlename) ? userdata.middlename : "",
                    "dob": (userdata.dob) ? userdata.dob : "",
                    "roletype": (userdata.roleData) ? userdata.roleData : "",
                    "profileImg": Images[0].name
                }
                var whereparams = {
                    "_id": req.params.Id
                }
                return OrganizationServices.UpdateVendorList(whereparams, Updateparams).then(function (data) {
                    successHelper.returnSuccess(false, res, 200, "User Updated successfully.");
                }).catch(function (error) {
                    return errorsControllerHelper.returnError({
                        Succeeded: false,
                        Status: 500,
                        Message: 'Not authorize.',
                        Name: 'Not authorize.'
                    }, res, 500);
                });
            }
        })
    } else {
        var whereparams = {
            "_id": req.params.Id
        }
        return User.findOne(whereparams).then(function (Item) {
            var Updateparams = {
                "organizationid": (userdata.organizationid) ? userdata.organizationid : "",
                "firstname": (userdata.firstname) ? userdata.firstname : "",
                "lastname": (userdata.lastname) ? userdata.lastname : "",
                "middlename": (userdata.middlename) ? userdata.middlename : "",
                "dob": (userdata.dob) ? userdata.dob : "",
                "roletype": (userdata.roleData) ? userdata.roleData : "",
                "profileImg": Item.profileImg
            }
            return OrganizationServices.UpdateVendorList(whereparams, Updateparams).then(function (data) {
                successHelper.returnSuccess(false, res, 200, "User Updated successfully.");
            }).catch(function (error) {
                return errorsControllerHelper.returnError({
                    Succeeded: false,
                    Status: 500,
                    Message: 'Not authorize.',
                    Name: 'Not authorize.'
                }, res, 500);
            });
        })
    }
}

exports.CreateOrganizationFromExcel = function (req, res) {
    var params = req.body;
    var organizationId;
    var batteryData = [{ "batteryid": "batt8", "telemetryboardid": "tell8" }, { "batteryid": "batt7", "telemetryboardid": "tell7" }];
    return bPromise.all(params.VendorData).each(function (Item) {
        var orgparams = {
            "code": Item.code,
            "organizationname": Item.organizationname,
            "addressLine1": Item.addressLine1,
            "addressLine2": Item.addressLine2,
            "city": Item.city,
            "state": Item.state,
            "country": Item.country,
            "pincode": Item.pincode,
        }
        return OrganizationServices.CreateOrganizations(orgparams).then(function (Data) {
            return Data;
        }).then(function (Data) {
            organizationId = Data._id;
            var hashedPassword = bcrypt.hashSync(Item.password, 8);
            var paramsvendors = {
                "organizationid": Data._id ? Data._id : false,
                "usertypeid": "5cd2c46e3f068c1ffde5d624",//Item.usertypeid,
                "contactno": Item.contactno,
                "firstname": Item.firstname,
                "username": Item.username,
                "password": hashedPassword,
                "middlename": Item.middlename,
                "dob": Item.dob,
                "lastname": Item.lastname,
                "email": Item.email,
                "DateOfRegistration": moment().format()
            }
            return UserserviceServices.CreateVendors(paramsvendors).then(function (Data) {
                return Data;
            })
        }).then(function (Data) {
            return bPromise.all(batteryData).each(function (Item) {
                var batteryparams = {
                    "batteryid": (Item.batteryid) ? Item.batteryid : false,
                    "telemetryboardid": (Item.telemetryboardid) ? Item.telemetryboardid : false,
                    "organizationid": (organizationId) ? organizationId : false,
                }
                return VehicleServices.CreateBatteryData(batteryparams).then(function (Data) {
                    return Data;
                })
            })
        })
    }).then(function () {
        successHelper.returnSuccess(false, res, 200, "Vendor created successfully.");
    }).catch(function (error) {
        res.json({ "Status": error.status, "error": error.Data, "Message": error.Message });
    })
}
// Handle OrganizationList actions
exports.OrganizationList = function (req, res) {
    var params = req.body
    return OrganizationServices.FindAllOrganizationList(params).then(function (Data) {
        successHelper.returnSuccess(false, res, 200, "Organization List.", Data);
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500);
    });
};

// get all vendor list
exports.VendorLists = function (req, res) {
    var checkparams = req.params;
    if(checkparams.type =="all"){
        var params = {
            "usertypeid": "5cd2c46e3f068c1ffde5d624",
            "username": { $ne: "Superadmin" },
            //"isactive":true
        }
    }else{
        var params = {
            "usertypeid": "5cd2c46e3f068c1ffde5d624",
            "username": { $ne: "Superadmin" },
            "organizationid":checkparams.type,
            //"isactive":true
        }
    }
    
    return OrganizationServices.FindVendorList(params).then(function (data) {
        if(data){
            successHelper.returnSuccess(false, res, 200, "Vendor List.", data);
        }else{
            var data = [];
            successHelper.returnSuccess(false, res, 200, "Vendor List.", data);
        }
        
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500);
    });
}

// get single vendor list
exports.SingleVendorLists = function (req, res) {
    var params = req.params.Id;
    return OrganizationServices.FindSingleVendorList(params).then(function (data) {
        successHelper.returnSuccess(false, res, 200, "Vendor List.", data);
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500);
    });
}



exports.CreateZone = function (req, res) {
    var params = req.body;
    if (params) {
        return OrganizationServices.CreateZone(params).then(function (Item) {
            successHelper.returnSuccess(false, res, 200, "Zone created successfully.", Item);
        }).catch(function (error) {
            return errorsControllerHelper.returnError({
                Succeeded: false, Status: 500, Message: 'Not authorize.', Name: 'Not authorize.'
            }, res, 500);
        })
    } else {
        res.json({ "Status": 500, "error": "Parameter missing error", "Message": "Parameter missing error" });
    }
}

exports.GetZoneList = function (req, res) {
    var params = req.body;
    return OrganizationServices.GetZoneList(params).then(function (Item) {
        if (Item) {
            successHelper.returnSuccess(false, res, 200, "Zone List.", Item);
        } else {
            var Item = [];
            successHelper.returnSuccess(false, res, 200, "Zone List.", Item);
        }
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false, Status: 500, Message: 'Not authorize.', Name: 'Not authorize.'
        }, res, 500);
    })
}

exports.DeleteZone = function (req, res) {
    var params = req.body;
    var updateparams = {
        "status": 1
    }
    if (params) {
        return OrganizationServices.DeleteZone(params, updateparams).then(function (Item) {
            successHelper.returnSuccess(false, res, 200, "Zone created successfully.", Item);
        }).catch(function (error) {
            return errorsControllerHelper.returnError({
                Succeeded: false, Status: 500, Message: 'Not authorize.', Name: 'Not authorize.'
            }, res, 500);
        })
    } else {
        res.json({ "Status": 500, "error": "Parameter missing error", "Message": "Parameter missing error" });
    }
}

exports.GetZoneDetails = function (req, res) {
    var params = req.params.Id;
    if (params) {
        return OrganizationServices.GetZoneDetals(params).then(function (Item) {
            successHelper.returnSuccess(false, res, 200, "Zone List.", Item);
        }).catch(function (error) {
            return errorsControllerHelper.returnError({
                Succeeded: false, Status: 500, Message: 'Not authorize.', Name: 'Not authorize.'
            }, res, 500);
        })
    } else {
        res.json({ "Status": 500, "error": "Parameter missing error", "Message": "Parameter missing error" });
    }
}

exports.UpdateZone = function (req, res) {
    var params = req.body;
    var whereparams = req.params.Id;
    if (params) {
        return OrganizationServices.UpdateZones(whereparams, params).then(function (Item) {
            successHelper.returnSuccess(false, res, 200, "Zone updated successfully.", Item);
        }).catch(function (error) {
            return errorsControllerHelper.returnError({
                Succeeded: false, Status: 500, Message: 'Not authorize.', Name: 'Not authorize.'
            }, res, 500);
        })
    } else {
        res.json({ "Status": 500, "error": "Parameter missing error", "Message": "Parameter missing error" });
    }
}

/******************************BlockUnBlock Organization */
exports.ActiveInActiveOrganizations = function (req, res) {
    var params = req.body;
    return OrganizationServices.ActiveInActiveOrganizations(params).then(function (Organization) {
        if(params.status == true){
            successHelper.returnSuccess(false, res, 200, "Organization activated successfully.");
        }else{
            successHelper.returnSuccess(false, res, 200, "Organization deactivated successfully.");
        }
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false, Status: 500, Message: 'Not authorize.', Name: 'Not authorize.'
        }, res, 500);
    })
}


/********************************* Zone */
exports.ActiveInactiveZone = function(req, res){
    var params = req.body;
    return OrganizationServices.ActiveInActiveZone(params).then(function (Organization) {
        if(params.isactive == true){
            successHelper.returnSuccess(false, res, 200, "Zone activated successfully.");
        }else{
            successHelper.returnSuccess(false, res, 200, "Zone deactivated successfully.");
        }
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false, Status: 500, Message: 'Not authorize.', Name: 'Not authorize.'
        }, res, 500);
    })
}

/**************************** Vendor*/
exports.ActiveInactiveVendor = function(req, res){
    var params = req.body;
    return OrganizationServices.ActiveInActiveVendor(params).then(function (Organization) {
        if(params.isactive == true){
            successHelper.returnSuccess(false, res, 200, "Vendor activated successfully.");
        }else{
            successHelper.returnSuccess(false, res, 200, "Vendor deactivated successfully.");
        }
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false, Status: 500, Message: 'Not authorize.', Name: 'Not authorize.'
        }, res, 500);
    })
}


exports.FilterOrganizationList = function(req, res){
   return OrganizationServices.FilterOrganizationList().then(function (Organization) {
       if(Organization){
           successHelper.returnSuccess(false, res, 200, "Organization list for filter.",Organization);
       }else{
           successHelper.returnSuccess(false, res, 200, "Vendor deactivated successfully.");
       }
   }).catch(function (error) {
       return errorsControllerHelper.returnError({
           Succeeded: false, Status: 500, Message: 'Not authorize.', Name: 'Not authorize.'
       }, res, 500);
   })
}