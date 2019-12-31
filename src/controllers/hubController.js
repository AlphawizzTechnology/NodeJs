// Import contact model';
var HubServices = require('../services/hubServices');
var VehiclesServices = require('../services/vehicleServices');
var bPromise = require('bluebird');
var ErrorHelper = require('../helpers/errortypes-helper');
var errorsControllerHelper = require('../helpers/errors.controller.helper');

// Handle CeateUser actions
exports.CreateHub = function (req, res) {
    var params = req.body;
    var hubparams = {
        "hubname": (params.hubname) ? params.hubname : "",
        "country": (params.country) ? params.country : "",
        "state": (params.state) ? params.state : "",
        "city": (params.city) ? params.city : "",
        "pincode": (params.pincode) ? params.pincode : "",
        "lat": (params.lat) ? params.lat : "",
        "long": (params.long) ? params.long : "",
        "addressLine1": (params.addressLine1) ? params.addressLine1 : "",
        "addressLine2": (params.addressLine2) ? params.addressLine2 : "",
        "organizationid": (req.AuthData.organizationid) ? req.AuthData.organizationid : "",
        "polygondata": (params.polygondata) ? (params.polygondata) : ""
    }
    console.log("hubparams============", hubparams)
    return HubServices.CreateHubs(hubparams).then(function (Data) {
        return Data;
    }).then(function (Data) {
        res.json({ "Status": 200, "result": Data, "Message": "Hub Created successfully." });
    }).catch(function(error){
        res.json({ "Status": error.status, "error": error.Data, "Message": error.Message });
    })
};


exports.CreateHubFromExcel = function (req, res) {
    var params = req.body;
    var VehicleData = [{ "_id": "5cdabe7b1d944e40ecb2447e" }, { "_id": "5cdbaafe977d680982de5bbc" }]
    return bPromise.all(params.HubData).each(function (Item) {
        var whereparams = {
            "organizationid": Item.OrganizationId
        }
        return HubServices.FindSingleVehicle(whereparams).then(function (Data) {
            if (Data) {
                var hubId;
                var hubparams = {
                    "hubname": Item.hubname,
                    "country": Item.country,
                    "state": Item.state,
                    "city": Item.city,
                    "pincode": Item.pincode,
                    "lat": Item.lat,
                    "long": Item.long,
                    "addressLine1": Item.addressLine1,
                    "addressLine2": Item.addressLine2,
                    "organizationid": Item.OrganizationId,
                }
                return HubServices.CreateHubs(hubparams).then(function (Data) {
                    hubId = Data._id;
                    return Data;
                }).then(function (Data) {
                    return bPromise.all(VehicleData).each(function (Item) {
                        var whereparams = {
                            "_id": Item._id,
                            "isactive": true
                        }
                        var updateparams = {
                            "hubid": hubId
                        }
                        return VehiclesServices.UpdateHubId(whereparams, updateparams).then(function (Data) {
                            return Data;
                        }).catch(function (err) {
                            throw new ErrorHelper.BadRequest("Something went wrong.", err);
                        })
                    })
                })
            } else {
                res.json(error);
            }
        })
    }).then(function (Data) {
        res.json({ "Status": 200, "result": Data, "Message": "Hub Created successfully." });
    }).catch(function (error) {
        res.json({ "Status": error.status, "error": error.Data, "Message": error.Message });
    });
}


// Handle HubList actions
exports.HubList = function (req, res) {
    var params = req.body;
    return HubServices.FindAllHubList(req.AuthData.organizationid, params).then(function (Data) {
        if (Data) {
            res.json({ "Status": 200, "result": Data, "Message": "Hub List." });
        } else {
            res.json({ "Status": 200, "result": [], "Message": "No Hub Data Found." });
        }
    }).catch(function (error) {
        res.json(error);
    });
};

exports.UpdateHub = function (req, res) {
    var params = req.body;
    return HubServices.FindSingleHub(req.params.Id).then(function (Data) {
        if (Data) {
            var updatehubparams = {
                "hubname": (params.hubname) ? params.hubname : "",
                "country": (params.country) ? params.country : "",
                "state": (params.state) ? params.state : "",
                "city": (params.city) ? params.city : "",
                "pincode": (params.pincode) ? params.pincode : "",
                "lat": (params.lat) ? params.lat : "",
                "polygondata": (params.polygondata) ? params.polygondata : "",
                "long": (params.long) ? params.long : "",
                "addressLine1": (params.addressLine1) ? params.addressLine1 : "",
                "addressLine2": (params.addressLine2) ? params.addressLine2 : "",
            }
            var whereparamshub = {
                "_id": req.params.Id
            }
            return HubServices.UpdateHub(whereparamshub, updatehubparams).then(function (Data) {
                return Data;
            }).then(function (Item) {
                res.json({ "Status": 200, "Message": "Hub updated successfully." });
            })
        } else {
            res.json({ "Status": 200, "Message": "hub not found.." });
        }
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: error.Succeeded, Status: error.status, Message: error.Message, Name: error.Name,
            Data: error.Data
        }, res, 500);
    });
}

exports.CreateHubLog = function (req, res) {
    var params = req.body;
    return HubServices.CreateHubLogs(req.AuthData.organizationid, params).then(function (Data) {
        res.json({ "Status": 200, "result": Data, "Message": "Create Hub." });
    }).catch(function (error) {
        res.json(error);
    });
}

/******************** CreateHubManager */
exports.CreateHubManager = function (req, res) {
    var params = req.body;
    return HubServices.CreateHubManager(params).then(function (Data) {
        res.json({ "Status": 200, "result": Data, "Message": "HubManager Create Successfully." });
    }).catch(function (error) {
        res.json(error);
    });
}

/******************** HubDetail */
exports.HubDetail = function (req, res) {
    var Id = (req.params.Id) ? req.params.Id : false;
    var whereparams = {
        "_id": Id
    }
    return HubServices.HubDetails(whereparams).then(function (Data) {
        res.json({ "Status": 200, "Data": Data, "Message": "Hub Details." });
    }).catch(function (error) {
        res.json(error);
    });
}

/******************** FindUnAssignedHubList */
exports.FindUnAssignedHubList = function (req, res) {
    var whereparams = {
        "isactive": "false"
    }
    return HubServices.FindUnAssignedVehicle(whereparams).then(function (Data) {
        res.json({ "Status": 200, "Data": Data, "Message": "Hub List." });
    }).catch(function (error) {
        res.json(error);
    });
}

/******************** Active Inactive Hub */
exports.ActiveInactiveHub = function(req, res){
    var params = req.body;
    return HubServices.ActiveInactiveHub(params).then(function (Data) {
        if(params.isactive ==true){
            res.json({ "Status": 200, "Message": "Hub data active." });
        }else{
            res.json({ "Status": 200, "Message": "Hub data inactive." });
        }
    }).catch(function (error) {
        res.json(error);
    });
}