// Import contact model';
var VehicleServices = require('../services/vehicleServices');
var AuthServices = require('../services/authServices');
var HubServices = require('../services/hubServices');
var successHelper = require('../helpers/success.helper');
var UserServices = require('../services/userServices');
var errorsControllerHelper = require('../helpers/errors.controller.helper');
var moment = require('moment');
import { Telemetrylog } from '../models/telemetrylog';
import { Hub } from '../models/hub';
import { LoginLog } from '../models/loginlog';
import { User } from '../models/user';
import { VehicleTravelRevenue } from '../models/vehicletravelrevenuelog';
import { Evehicle } from '../models/evehicle';
import { BookingDetail } from '../models/bookingdetails';
//import { BookingDetail } from '../models/bookingdetails';
import { VehicleRange } from '../models/vehiclerange';
import { config } from 'aws-sdk';
var ErrorHelper = require('../helpers/errortypes-helper');
var bPromise = require('bluebird');
var awsIot = require('aws-iot-device-sdk');
var inside = require('point-in-polygon');
import * as AppConfig from '../../config';
var excel = require('excel4node');
var FCM = require('fcm-node');

// Handle CreateVehicles actions
exports.CreateVehicle = function (req, res) {
    var OrganizationId = "";
    if (req.body.organizationid) {
        OrganizationId = req.body.organizationid;
    } else {
        OrganizationId = req.AuthData.organizationid;
    }
    var params = {
        "vehicletype": (req.body.vehicletype) ? req.body.vehicletype : false,
        "name": (req.body.name) ? req.body.name : "",
        "organizationid": OrganizationId,
        "dateofregistration": moment().format(),
        "vehiclenumber": (req.body.vehiclenumber) ? req.body.vehiclenumber : "",
        "status": "free",
        "hubid": (req.body.hubid) ? req.body.hubid : ""
    }
    return VehicleServices.CreateVehicles(params).then(function (VehicleData) {
        if (VehicleData) {
            successHelper.returnSuccess(false, res, 200, "Vehicle Created Successfully.");
        } else {
            successHelper.returnSuccess(false, res, 200, "Something went wrong.");
        }
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: error.Succeeded, Status: error.status, Message: error.Message, Name: error.Name, Data: error.Data
        }, res, 500);
    });
};

// Handle VehicleList actions
exports.BatteryList = function (req, res) {
    return VehicleServices.FindAllBattery(req.AuthData).then(function (Data) {
        successHelper.returnSuccess(false, res, 200, "Vehicle List.", Data);
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false, Status: 500, Message: 'Not authorize.', Name: 'Not authorize.'
        }, res, 500);
    });
}

// Handle CreateBatteryData actions
exports.CreateBatteryData = function (req, res) {
    var params = {
        "batteryid": (req.body.batteryid) ? req.body.batteryid : false,
        "telemetryboardid": (req.body.telemetryboardid) ? req.body.telemetryboardid : false,
        "organizationid": (req.body.organizationid) ? req.body.organizationid : false,
    }
    return VehicleServices.CreateBatteryData(params).then(function (Data) {
        successHelper.returnSuccess(false, res, 200, "Battery Data Created Successfully.", Data);
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false, Status: 500, Message: 'Not authorize.', Name: 'Not authorize.'
        }, res, 500);
    })
}

// Handle VehicleList actions
exports.VehicleList = function (req, res) {
    var whereparams = {
        "_id": req.AuthData.usertypeid
    }
    return VehicleServices.findUserType(whereparams).then(function (Data) {
        if (Data.typename.charAt(0) == "D") {
            var whereparams = {
                "isactive": true,
                "organizationid": (req.AuthData.organizationid) ? req.AuthData.organizationid : false,
                "hubid": (req.AuthData.hubid) ? req.AuthData.hubid : false,
            }
        }
        return VehicleServices.VehicleListsVendor(whereparams).then(function (VehicleData) {
            return VehicleData
        }).then(function (VehicleData) {

            var whereparams = {
                "vehicleid": VehicleData[0]._id,
                "status": "active"
            }
            return VehicleServices.StoreVehicLogs(whereparams).then(function (Item) {
                if (Data.typename.charAt(0) == "D") {
                    var item = VehicleData[Math.floor(Math.random() * VehicleData.length)];
                    successHelper.returnSuccess(false, res, 200, "Vehicle List.", item);
                }
            })
        })
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500);
    })
}

exports.AllVehicleList = function (req, res) {
    var params = req.AuthData;
    var HubId = req.body.HubId;
    return VehicleServices.FindAllVehicleList(params, HubId).then(function (Data) {
        if (Data) {
            successHelper.returnSuccess(false, res, 200, "All Vehicle List.", Data);
        } else {
            var Data = [];
            successHelper.returnSuccess(false, res, 200, "No Vehicle List.", Data);
        }
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}

exports.GetVehiclListForAggregator = function (req, res) {
    var whereparams = req.body
    return VehicleServices.FindVehicleListAggregator(whereparams).then(function (Data) {

        if (Data) {
            successHelper.returnSuccess(false, res, 200, "All Vehicle List.", Data);
        } else {
            var Data = [];
            successHelper.returnSuccess(false, res, 200, "All Vehicle List.", Data);
        }
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}

exports.ChangeStatus = function (req, res) {
    var params = req.body;
    return VehicleServices.Changestatus(params).then(function (Data) {
        successHelper.returnSuccess(false, res, 200, "Vehicle Log Status updated successfully.", Data);
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}

exports.AuthenticateVehicleCheckPromise = function (req, res, index, VehicleData) {

    if (VehicleData.length > 0) {


        console.log("VehicleData  VehicleData VehicleData", VehicleData, index)
        if (VehicleData[index]) {
            return LoginLog.findOne({
                "vehicleid": VehicleData[index]._id,
                'logindatetime': {
                    $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
                    $lt: moment().utc().format(),
                },
                "isauthenticated": true
            }).then(function (VItem) {
                if (VItem) {
                    var VehicleDataTemp = VehicleData.splice(index, 1);
                    VehicleData = VehicleDataTemp;
                    var VIndex = Math.floor(Math.random() * VehicleData.length);
                    exports.AuthenticateVehicleCheckPromise(req, res, VIndex, VehicleData);
                } else {
                    console.log("VehicleData=========1111", VehicleData)
                    req.VehicleData = VehicleData;
                    req.Vehicleindex = index;
                    return exports.AuthenticateVehicleCallback(req, res);
                }
            });
        } else {
            res.json({ "Status": 300, "Message": "No vehicle found." });
        }
    } else {
        res.json({ "Status": 300, "Message": "No vehicle found." });
    }
}

exports.ReserveOn = function(req, res){
    var params = req.params;

    var whereparams = {
        "vehicleid": (params.vehicleid) ? (params.vehicleid) : false,
    }
    var orderBy = {
        time: -1
    }

    if(!params.vehicleid){
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500);
    }
    
    return VehicleServices.FindLastTelemetrylogData(whereparams, orderBy).then(function(TelematicsLogData){
        if(TelematicsLogData){
            var jsonData = JSON.parse(TelematicsLogData.json);
            
            var ST1 = GetActivatedAlarmData(ConvertNumberToBinary(jsonData.ST1));
            var operation = {
                third: {
                    key: "",
                    value: ""
                }, 
                fifth: {
                    key: "",
                    value: ""
                }
            }
            var AID = 0;
            ST1.forEach(function (value, alertIndex) {
                if(alertIndex == 6){
                    operation.fifth.key = alertIndex;
                    operation.fifth.value = value;
                }
                if(alertIndex == 4){
                    operation.third.key = alertIndex;
                    operation.third.value = value;
                }
            });

            var whereparame = {
                "vehicleid": params.vehicleid,
                "logindatetime": {
                    $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
                    $lt: moment().utc().format(),
                },
                "isauthenticated": true,
            }
            var orderBy = {
                logindatetime: -1
            }
            
			console.log("operation operation operation", operation);
			console.log("operation operation operation", operation);
			console.log("operation operation operation", operation);
			
            var AID = 0;
            return AuthServices.getLastLoginLogData(whereparame, orderBy).then(function(VehicleLoginLog){
                if(VehicleLoginLog){
                    switch(true){
                        case (operation.fifth.value == 1 && operation.third.value == 0 && VehicleLoginLog.isauthenticated == true):
                            AID = 3;
                            break;
                        // case (operation.fifth.value == 1 && operation.third.value == 0 && VehicleLoginLog.isauthenticated == false):
                            // AID = 0;
                            // break;
                        // case (operation.fifth.value == 0 && operation.third.value == 1 && VehicleLoginLog.isauthenticated == false):
                            // AID = 2;
                            // break;
                        // case (operation.fifth.value == 0 && operation.third.value == 1 && VehicleLoginLog.isauthenticated == true):
                            // AID = 3;
                            // break;
                    }

                    successHelper.thingShadowsHelper(TelematicsLogData.telemetryboardid, {"state":{"desired":{
                        "AID": AID
                    }}});
					
					return successHelper.returnSuccess(false, res, 200, "Vehicle reserved successfully.", []);
                } else {
                    return errorsControllerHelper.returnError({
                        Succeeded: false,
                        Status: 300,
                        Message: 'This vehicle is not allocate to any driver at the moment.',
                        Name: 'This vehicle is not allocate to any driver at the moment.',
                    }, res, 300);
                }
            });
        }
    }).catch(function (error) {
		console.log(error)
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize qq.',
            Name: 'Not authorize qq.'
        }, res, 500);
    })
}

exports.AuthenticateVehicleCallback = function (req, res) {
    var params = req.body;
    var Authparams = req.AuthData;
    var VehicleData = req.VehicleData;
    var Data = req.UserTypeData;

    var whereparams = {
        "vehicleid": VehicleData[req.Vehicleindex]._id,
        "status": "active"
    }
    var updateparams = {
        "vehicleid": VehicleData[req.Vehicleindex]._id,
        "telemetryboardid": VehicleData[req.Vehicleindex].telemetryboardid,
        "isauthenticated": true,
        "lastauthenticatedtime": moment().utc().format()
    }
    var whereparamscheckauth = {
        "userid": req.AuthData._id,
        'logindatetime': {
            $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
            $lt: moment().utc().format(),
        },
        "isauthenticated": false
    }
    return LoginLog.findOne(whereparamscheckauth).sort({ logindatetime: -1 }).then(function (Item) {
        if (!Item) {
            res.json({ "Status": 300, "Message": "No vehicle available right now." });
        } else {
            var telemetryboard = Item.telemetryboardid;
            return VehicleServices.StoreVehicLogs(whereparams, updateparams, params, Authparams).then(function (ItemStor) {
                if (Data.typename.charAt(0) == "D") {
                    //var item = VehicleData[Math.floor(Math.random() * VehicleData.length)];
                    var item = VehicleData[req.Vehicleindex];
                    if (VehicleData[req.Vehicleindex].vehicletype == req.AuthData.usertypeid._id) {
                        item.vehicletypenmae = "Three-Wheeler";
                    } else if (VehicleData[req.Vehicleindex].vehicletype == req.AuthData.usertypeid._id) {
                        item.vehicletypenmae = "Two-Wheeler";
                    }
                    item.topicName = 'battery/' + item.telemetryboardid + '/shadow/update';
                    var batteryidDataList = [];
                    bPromise.all(item.batteryid).each(function (batteryidData) {
                        if (batteryidData) {
                            batteryidDataList.push(batteryidData);
                        }
                    }).then(function () {
                        
                        /*
							var device = awsIot.device({
                            keyPath: './cert/cb0460421e-private.pem.key',
                            certPath: './cert/cb0460421e-certificate.pem.crt',
                            caPath: './cert/AmazonRootCA1.pem',
                            host: AppConfig.AWShost
                        });
                        device.on('connect', function() {
                            device.publish('$aws/things/' + item.telemetryboardid + '/shadow/update/AID', JSON.stringify({
                                "AID": 1
                            }));

                            
                        });
						if(device){
							console.log('connect iiiii item.telemetryboardid', item.telemetryboardid);
							device.publish('$aws/things/' + item.telemetryboardid + '/shadow/update/AID', JSON.stringify({
								"AID": 1
							}));
						}
						*/

                        successHelper.thingShadowsHelper(item.telemetryboardid, {
                            "state": {
                                "desired": {
                                    "AID": 1
                                }
                            }
                        });


                        var whereparamscheckauth = {
                            "userid": req.AuthData._id,
                            'logindatetime': {
                                $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
                                $lt: moment().utc().format(),
                            },
                            "isauthenticated": true
                        }

                        return LoginLog.findOne(whereparamscheckauth).sort({ _id: -1 }).then(function (Item) {
                            var result = {
                                "batteryid": batteryidDataList,
                                "isactive": Item.isactive,
                                "deactivatebysuperadmin": Item.deactivatebysuperadmin,
                                "_id": Item._id,
                                "vehicletype": Item.vehicletype,
                                "name": Item.name,
                                "company": Item.company,
                                "telemetryboardid": Item.telemetryboardid,
                                "organizationid": (Item.organizationid) ? Item.organizationid : "",
                                "dateofregistration": Item.dateofregistration,
                                "vehiclenumber": Item.vehiclenumber,
                                "status": Item.status,
                                "topicName": Item.topicName,
                                "vehicleid": VehicleData[req.Vehicleindex]._id
                            }

                            if (Item.telemetryboardid) {
                                successHelper.returnSuccess(false, res, 200, "Vehicle List.", result);
                            } else if (!Item.telemetryboardid) {
                                res.json({ "Status": 300, "Message": "Vehicle with telemetryboard is not available." });
                            } else if (Item.length < 0) {
                                res.json({ "Status": 300, "Message": "Vehicle is not available." });
                            }
                        });
                    });
                }
            }).catch(function (error) {
                console.log("error", error)
            })
        }
    })
}

exports.AuthenticateVehicle = function (req, res) {
    var params = req.body;
    var Authparams = req.AuthData;
    return LoginLog.findOne({
        "userid": params.userid,
        'logindatetime': {
            $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
            $lt: moment().utc().format(),
        },
        "isauthenticated": true
    }).findOne().then(function (UserAssignedData) {
        if (UserAssignedData) {
            var whereparams = {
                _id: UserAssignedData.vehicleid,
                "status": "alloted"
            }
            return Evehicle.findOne(whereparams).populate('vehicletype').then(function (item) {
                var result = {
                    "batteryid": item.batteryid,
                    "isactive": item.isactive,
                    "deactivatebysuperadmin": item.deactivatebysuperadmin,
                    "vehicletype": item.vehicletype,
                    "name": item.name,
                    "company": item.company,
                    "telemetryboardid": item.telemetryboardid,
                    "organizationid": (item.organizationid) ? item.organizationid : "",
                    "dateofregistration": item.dateofregistration,
                    "vehiclenumber": item.vehiclenumber,
                    "status": item.status,
                    "topicName": item.topicName,
                    "vehicleid": item._id
                }
                successHelper.returnSuccess(false, res, 200, "Vehicle List.", result);
            })
        } else {

            var usertypewhereparams = {
                "_id": Authparams.usertypeid
            }
            return VehicleServices.findUserType(usertypewhereparams).then(function (Data) {
                if (Data.typename.charAt(0) == "D") {
                    var whereparams = {
                        "organizationid": (req.AuthData.organizationid) ? req.AuthData.organizationid : false,
                        "telemetryboardid": { $exists: true },
                        "status": "free"
                    }
                    return VehicleServices.VehicleLists(whereparams, req.body).then(function (VehicleData) {
                        return VehicleData;
                    }).then(function (VehicleData) {
                        req.UserTypeData = Data;
                        var VehicleDataLen = VehicleData.length;
                        var VIndex = Math.floor(Math.random() * VehicleData.length);
                        return exports.AuthenticateVehicleCheckPromise(req, res, VIndex, VehicleData);
                    })
                } else {
                    res.json({ "Status": 300, "Message": "Not a valid user." });
                }

            }).catch(function (error) {
                return errorsControllerHelper.returnError({
                    Succeeded: false,
                    Status: 500,
                    Message: 'Not authorize.',
                    Name: 'Not authorize.'
                }, res, 500);
            })
        }
    })

}

exports.DeAuthenticateVehicle = function (req, res) {
    var params = (req.body.userid) ? req.body.userid : false;
    var LogData = req.AuthData;
    var whereparams = {
        "userid": params,
        'logindatetime': {
            $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
            $lt: moment().utc().format(),
        },
        "isauthenticated": true
    }
    var mysort = { logindatetime: -1 };
    return LoginLog.findOne(whereparams).sort(mysort).then(function (Item) {

        if (Item) {
            var vehicleid = (Item.vehicleid) ? Item.vehicleid : Item._id;
            var lastauthenticatedtime = Item.lastauthenticatedtime;
        }
        return VehicleServices.DeAuthenticateVehicle(params).then(function (Item1) {
            if (Item1) {
                return VehicleServices.findLoginLogData({
                    _id: vehicleid
                }).then(function (VData) {
                    if (VData) {
                        if (VData.telemetryboardid) {
                            var totalRevenu = 0;
                            var TotalDistance = 0;

                            return BookingDetail.find({
                                userid: req.body.userid,
                                vehiclenumber: vehicleid,
                                endlat: { $exists: true },
                                endlng: { $exists: true },
                                datetime: {
                                    $gte: lastauthenticatedtime,
                                    $lte: moment().utc().format(),
                                }
                            }).then(function (BookData) {

                                return bPromise.all(BookData).each(function (itemData) {
                                    totalRevenu += itemData.paidamount;
                                });
                            }).then(function () {
                                var todayDate = new Date(moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z");
                                var new_date = new Date(moment(todayDate.getFullYear() + "-" + (todayDate.getMonth() + 1) + "-" + todayDate.getDate()).add(1, 'day').format("YYYY-MM-DD") + "T00:00:00.000Z");
                                return Telemetrylog.findOne({
                                    userid: req.body.userid,
                                    vehicleid: vehicleid,
                                    telemetryboardid: VData.telemetryboardid,
                                    time: {
                                        $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
                                        $lt: moment().utc().format(),
                                    }
                                }).sort({
                                    _id: -1
                                }).then(function (TelData) {
                                    if (TelData) {
                                        TotalDistance = TelData.tdt;
                                    }
                                    return TotalDistance;
                                }).then(function (dd) {
                                    var SaveData = {
                                        vehicleid: vehicleid,
                                        userid: (req.body.userid) ? req.body.userid : "",
                                        startdatetime: new Date(),
                                        enddatetime: new Date(),
                                        vehiclerevenue: totalRevenu,
                                        distancetravelled: TotalDistance
                                    }
                                    var InsertData = new VehicleTravelRevenue(SaveData);
                                    return InsertData.save().then(function (RevData) {
                                        successHelper.thingShadowsHelper(VData.telemetryboardid, {
                                            "state": {
                                                "desired": {
                                                    "AID": 0
                                                }
                                            }
                                        });
                                        res.json({ "Status": 200, "Message": "Vehicle deauthenticated successfully." })

										/*
											if(device){
												console.log("'$aws/things/' + VData.telemetryboardid + '/shadow/update/AID'", '$aws/things/' + VData.telemetryboardid + '/shadow/update/AID')
												device.publish('$aws/things/' + VData.telemetryboardid + '/shadow/update/AID', JSON.stringify({
													"AID": 0
												}));
									
												res.json({ "Status": 200, "Message": "Vehicle deauthenticated successfully." }) 
											}
										*/


                                        /*var device = awsIot.device({
                                            keyPath: './cert/cb0460421e-private.pem.key',
                                            certPath: './cert/cb0460421e-certificate.pem.crt',
                                            caPath: './cert/AmazonRootCA1.pem',
                                            host: AppConfig.AWShost
                                        });
                                        
                                        device.on('connect', function() {
                                            console.log("'$aws/things/' + VData.telemetryboardid + '/shadow/update/AID'", '$aws/things/' + VData.telemetryboardid + '/shadow/update/AID')
                                            device.publish('$aws/things/' + VData.telemetryboardid + '/shadow/update/AID', JSON.stringify({
                                                "AID": 0
                                            }));
                                
                                            res.json({ "Status": 200, "Message": "Vehicle deauthenticated successfully." }) 
                                        });*/
                                        //res.json({ "Status": 200, "Message": "Vehicle deauthenticated successfully." })
                                    });
                                }).catch(function (error) {
                                    console.log("error==========", error)
                                    throw error;
                                });
                            });
                        } else {
                            res.json({ "Status": 200, "Message": "Vehicle deauthenticated successfully." })
                        }
                    } else {
                        res.json({ "Status": 200, "Message": "Vehicle deauthenticated successfully." })
                    }
                });
            }
        }).catch(function (error) {
            return errorsControllerHelper.returnError({
                Succeeded: false,
                Status: 500,
                Message: error,
                Name: 'Not authorize.'
            }, res, 500)
        })
    });

}

exports.VehicleDetail = function (req, res) {
    var Id = (req.params.Id) ? req.params.Id : false;
    var whereparams = {
        "_id": Id
    }
    return VehicleServices.GetVehicleDetails(whereparams).then(function (Data) {
        if (Data) {
            res.json({ "Status": 200, "result": Data, "Message": "Veicle Details List." });
        } else {
            var Data = [];
            res.json({ "Status": 200, "result": Data, "Message": "Veicle Details List." });
        }
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}


exports.GetBatteryIdData = function (req, res) {
    var Id = (req.params.Id) ? req.params.Id : false;
    var whereparams = {
        "telemetryboardid": Id,
        "isactive": false
    }
    return VehicleServices.GetBatteryData(whereparams).then(function (Data) {
        res.json({ "Status": 200, "result": Data, "Message": "BatteryDataList." });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}


exports.UpdateVehicle = function (req, res) {
    var params = req.body;
    var Authparams = req.AuthData;
    var Id = (req.params.Id) ? req.params.Id : false;
    return VehicleServices.UpdateVehicle(Id, params, Authparams).then(function (Data) {
        if (Data) {
            res.json({ "Status": 200, "result": Data, "Message": "Vehicle Update Successfully." });
        } else {
            res.json({ "Status": 200, "result": Data, "Message": "No vehicle available." });
        }
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}

// update vehicle system Aggregator
exports.UpdateVehicleSystemAggregator = function (req, res) {
    var params = req.body
    var Id = (req.params.Id) ? req.params.Id : false;
    return VehicleServices.UpdateVehicleSystemAggregator(Id, params).then(function (Data) {
        res.json({ "Status": 200, "result": Data, "Message": "Vehicle Update Successfully." });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}


exports.VehicleTypeList = function (req, res) {
    return VehicleServices.VehicleTypeLists().then(function (Data) {
        res.json({ "Status": 200, "result": Data, "Message": "Vehicle Type List." });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}


exports.AssignVehicle = function (req, res) {
    return VehicleServices.AssignVehicle().then(function (Data) {
        res.json({ "Status": 200, "result": Data, "Message": "Vehicle Type List." });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}


exports.AddBatteryData = function (req, res) {
    var json = JSON.stringify(req.body);
    var bbb = {};
    var tid = "";
    for (var key in req.body) {
        if (key.toLowerCase() == "time") {
            var todayDate = moment(req.body[key]).utc().format();
            bbb[key.toLowerCase()] = req.body[key];
        } else if (key.toLowerCase() == "tid") {
            //key = 'telemetryboardid';
            tid = req.body[key];
            bbb[key.toLowerCase()] = req.body[key];
        } else {
            bbb[key.toLowerCase()] = req.body[key];
        }
    }
	
	console.log(todayDate)
	console.log(todayDate)
	console.log(todayDate)
	console.log(todayDate)
	console.log(todayDate)
	console.log(todayDate)
	console.log(todayDate)
	console.log(todayDate)
	console.log(todayDate)
	console.log(todayDate)

    bbb.telemetryboardid = tid;
    var params = bbb;

    params.time = todayDate;

    params.json = json;


    var mysort = { "_id": -1 }
    //return res.json(params)

    var mysort = { "_id": -1 }
    //return res.json(params)
    if (params.bm && params.snb1 && params.snb2 && params.snb3) {
        var Addparams = {
            "telemetryboardid": params.telemetryboardid,
            "bm": params.bm,
            "snb1": params.snb1,
            "snb2": params.snb2,
            "snb3": params.snb3,
            "time": todayDate
        }
        return VehicleServices.AddBatteryDataBM(Addparams).then(function (Data) {
            res.json({ "Status": 200, "result": Data, "Message": "Battery Data BM Added Successfully" });
        }).catch(function (error) {
            return errorsControllerHelper.returnError({
                Succeeded: false,
                Status: 500,
                Message: error,
                Name: 'Not authorize.'
            }, res, 500)
        });

    } else {
        return Evehicle.findOne({
            telemetryboardid: params.telemetryboardid,
        }).then(function (vehicleData) {
            if (vehicleData) {
                params.vehicleid = vehicleData._id;
                return LoginLog.findOne({
                    "vehicleid": vehicleData._id,
                    // 'logindatetime': {
                    //     $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
                    //     $lt: moment().utc().format(),
                    // }, "isauthenticated": false
                }).sort({ _id: -1 }).then(function (LogData) {
                    if (LogData) {
                        params.userid = LogData.userid;
                    }
                    if (params.lat != "" && params.lng != "") {
                        return Hub.findOne({ "_id": vehicleData.hubid }).then(function (HubData) {
                            if (inside([params.lat, params.lng], HubData.polygondata)) {
                                var AddRangeparams = {
                                    "userid": LogData.userid,
                                    "telemetryboardid": params.telemetryboardid,
                                    "vehicleid": vehicleData._id,
                                    "time": moment().utc().format(),
                                    "lat": params.lat,
                                    "lng": params.lng,
                                    "rangestart": true,
                                    "rangestop": true
                                }
                                var rangeparams = new VehicleRange(AddRangeparams);
                                return rangeparams.save().then(function () {
                                    return true
                                }).then(function (Data) {
                                    return VehicleRange.findOne({ "userid": LogData.userid }).sort({ _id: -1 }).then(function (RangeData) {
                                        var currenttime = moment(params.time);//now
                                        var RangeTime = moment(RangeData.time);
                                        var diff = (currenttime.diff(RangeTime, 'minutes')) // 44700
                                        if (diff >= 15) {
                                            return LoginLog.findOne({ "userid": LogData.userid, "islogout": false }).then(function (LoginUserData) {
                                                var SERVER_API_KEY = AppConfig.FIREBASE_SERVER_KEY;
                                                var fcm = new FCM(SERVER_API_KEY);
                                                var payloadMulticast = {
                                                    registration_ids: [LoginUserData.firebasetoken],
                                                    priority: 'high',
                                                    content_available: true,
                                                    data: {
                                                        "message": "your vehicle is out of range"
                                                    },
                                                };
                                                fcm.send(payloadMulticast, function (err, res) {
                                                    if (err) {
                                                        console.log("error=========", err)
                                                        return true;
                                                    } else {
                                                        console.log("res=========", res)
                                                        return true;
                                                    }

                                                });

                                            })
                                        } else {

                                        }
                                    })
                                })
                            } else {
                                return false;
                            }
                        }).then(function () {
                            return VehicleServices.AddBatteryData(params).then(function (Data) {
                                if (Data) {
                                    return UserServices.getNotificationUserbyBatteryData(params).then(function (BatteryAlaram) {
										
										
										var ST1 = GetActivatedAlarmData(ConvertNumberToBinary(params.st1));
										
										var operation = {
											third: {
												key: "",
												value: ""
											}, 
											fifth: {
												key: "",
												value: ""
											},
											twelve: {
												key: "",
												value: ""
											}
										}
										var AID = 0;
										ST1.forEach(function (value, alertIndex) {
											if(alertIndex == 5){
												operation.fifth.key = alertIndex;
												operation.fifth.value = value;
											}
											if(alertIndex == 3){
												operation.third.key = alertIndex;
												operation.third.value = value;
											}
											if(alertIndex == 12){
												operation.twelve.key = alertIndex;
												operation.twelve.value = value;
											}
										});
										
										console.log("operation data ", operation);
										console.log("ST1 binary ", ConvertNumberToBinary(params.st1));
										console.log("REQ ", params.st1, LogData.isauthenticated, params.telemetryboardid );
										if(operation.twelve.value == 1){
											if(operation.fifth.value == '0' && operation.third.value == '1' && LogData.isauthenticated == true){
												console.log(522)
												successHelper.thingShadowsHelper(params.telemetryboardid, {"state":{"desired":{
													"AID": 1
												}}});
											}
										}										
                                        res.json({ "Status": 200, "result": Data, "Message": "Battery Data Added Successfully" });
                                    })
                                }
                            }).catch(function (error) {
                                return errorsControllerHelper.returnError({
                                    Succeeded: false,
                                    Status: 500,
                                    Message: error,
                                    Name: 'Not authorize.'
                                }, res, 500)
                            });

                        })
                    }
                });
            } else {
                /**
                *	Temp Data
                ***/
                return VehicleServices.AddTempBatteryData(params).then(function (Data) {
                    res.json({ "Status": 200, "result": Data, "Message": "Battery Data Added Successfully" });
                }).catch(function (error) {
                    return errorsControllerHelper.returnError({
                        Succeeded: false,
                        Status: 500,
                        Message: error,
                        Name: 'Not authorize.'
                    }, res, 500)
                })
            }
        });
    }
}


exports.GetTestBatteryData = function (req, res) {
    return VehicleServices.GetTestBatteryData().then(function (Data) {
        res.json({ "Status": 200, "result": Data, "Message": "Battery Data List" });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}


exports.GetBatteryIdDataBM = function (req, res) {
    return VehicleServices.GetTestBatteryDataBM().then(function (Data) {
        res.json({ "Status": 200, "result": Data, "Message": "Battery Data List" });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}

exports.GetBatteryIdDataBMTemp = function (req, res) {
    return VehicleServices.GetBatteryIdDataBMTemp().then(function (Data) {
        res.json({ "Status": 200, "result": Data, "Message": "Battery Data List" });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}


exports.GetDistancefromChargerStation = function (req, res) {
    var params = req.body;
    return VehicleServices.GetDistancefromChargerStations(params).then(function (Data) {
        res.json({ "Status": 200, "result": Data, "Message": "Battery Data Added Successfully" });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}

exports.GenVehicleGraph = function (req, res) {
    var whereparams = {
        "status": "free"
    }
    var Authdata = req.AuthData;
    return VehicleServices.GetVehicleGraph(whereparams, Authdata).then(function (Data) {
        res.json({ "Status": 200, "Result": Data, "Message": "Vehicle graph Data" });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}


exports.GenVehicleGraphAdmin = function (req, res) {
    var whereparams = {
        "status": "free"
    }
    var Authdata = req.AuthData;
    return VehicleServices.GetVehicleGraphAdmin(whereparams, Authdata).then(function (Data) {
        res.json({ "Status": 200, "Result": Data, "Message": "Vehicle graph Data." });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}


exports.SystemIntegreatorGraph = function (req, res) {
    var whereparams = {
        "status": "free"
    }
    return VehicleServices.SystemIntegreatorGraph(whereparams).then(function (Data) {
        res.json({ "Status": 200, "Result": Data, "Message": "System integreator graph data." });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}

exports.GetchargingStationGraph = function (req, res) {
    return VehicleServices.GetChargingStationGraph().then(function (Data) {
        res.json({ "Status": 200, "Result": Data, "Message": "Charger Graph Data" });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}


exports.GetchargingStationGraphAdmin = function (req, res) {
    var AuthData = req.AuthData;
    var params = req.params;
    return VehicleServices.GetChargingStationGraphAdmin(AuthData, params).then(function (Data) {
        res.json({ "Status": 200, "Result": Data, "Message": "Charger Graph Data" });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}

exports.GetVehicleDistanceChart = function (req, res) {
    var AuthData = req.AuthData;
    var params = req.params;
    return VehicleServices.getVehicleDistanceChartData(AuthData, params).then(function (Data) {
        res.json({ "Status": 200, "Result": Data[Data.length-1], "Message": "Vehicle Chart Data" });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}

exports.GetVehicleRevanueChart = function (req, res) {
    var AuthData = req.AuthData;
    var params = req.params;
    return VehicleServices.getVehicleRevanueChartData(AuthData, params).then(function (Data) {
        res.json({ "Status": 200, "Result": Data[Data.length-1], "Message": "Vehicle Chart Data" });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500);
    });
}

exports.GetVehicleTypes = function (req, res) {
    return VehicleServices.getVehicleTypes().then(function (Data) {
        res.json({ "Status": 200, "Result": Data, "Message": "Vehicle Type List" });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}

exports.CalculateVehicleDistance = function (req, res) {
    var userId = {
        "organizationid": req.body.userid
    }
    return VehicleServices.getVehicleDistance(userId).then(function (Data) {
        res.json({ "Status": 200, "Result": Data, "Message": "Vehicle Distance" });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}

exports.VehicleRevenueLog = function (req, res) {
    var params = req.body;
    return VehicleServices.generateVehicleRevenueLog(params).then(function (Data) {
        res.json({ "Status": 200, "Result": Data, "Message": "Vehicle revenue log generated successfully" });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}


/***** Get Assigned Vehicle Data */
exports.AssignedVehicleData = function (req, res) {
    var params = req.AuthData
    return VehicleServices.GetAssignedVehicleData(params).then(function (VehicleData) {
        if (VehicleData) {
            res.json({ "Status": 200, "Result": VehicleData, "Message": "Assigned vehicle data." });
        } else {
            var Data = [];
            res.json({ "Status": 200, "Result": Data, "Message": "Not Available any assigned vehicle." });
        }
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}


exports.GetTempTestBatteryData = function (req, res) {
    return VehicleServices.GetTempTestBatteryData().then(function (Data) {
        if (Data) {
            res.json({ "Status": 200, "Result": Data, "Message": "BatteryData list." });
        } else {
            var Data = [];
            res.json({ "Status": 200, "Result": Data, "Message": "BatteryData list." });
        }
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}

/*************************** Get Batter Alaram Data */
exports.GetBatteryAlaramData = function (req, res) {
    return VehicleServices.GetBatteryAlaramData().then(function (Data) {
        if (Data) {
            res.json({ "Status": 200, "Result": Data, "Message": "BatteryData list." });
        } else {
            var Data = [];
            res.json({ "Status": 200, "Result": Data, "Message": "BatteryData list." });
        }
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}

/**
 * Created By :- Ishan Jain
 * Created Date :- 12-07-2019
 * Purpose :- For download bettery data in excle formate between two date.
 */
function ConvertNumberToBinary(no) {
    return Number(no).toString(2);
}
function GetActivatedAlarmData(source) {
    var sourceList = source.split('');
    return sourceList.reverse();
}
exports.GetVehicleReport = function (req, res) {
    if (req.params.telemetryboardid) {
        var body = req.params;
    } else if (req.body.telemetryboardid) {
        var body = req.body;
    }

    return Evehicle.findOne({
        "telemetryboardid": body.telemetryboardid
    })
        /*
            .then(function (VData) {
            return VehicleServices.GetVehicleReport(body).then(function (BatteryData) {
                const createCsvWriter = require('csv-writer').createArrayCsvWriter;
    
                var headers = ['DATE', 'Time', 'Telematics ID', 'json'];
    
                var fileName = body.telemetryboardid + moment(body.from).format("YYYYMMDDHHMM") + moment(body.to).format("YYYYMMDDHHMM") + '.csv';
    
                const csvWriter = createCsvWriter({
                    header: headers,
                    path: './public/' + fileName
                });
    
    
                // var headers = ['DATE', 'Time', 'Telematics ID', 'Battery Voltage', 'Battery Current', 'SOC', 'Telematics Temperature', 'Delivery Instruction', 'Battery Voltage 1', 'Battery Current 1', 'Battery SOC 1', 'Temeprature Battery 1', 'Charge AH Batt1', 'Charge KWH Batt1', 'Discharge AH Batt1', 'SOH Battery 1', 'Cycle Counts Battery 1', 'Charge Run Hours Battery 1', 'Discharge Run Hours Battery 1', 'Battery Voltage 2', 'Battery Current 2', 'Battery SOC 2', 'Temeprature Battery 2', 'Charge AH Batt2', 'Charge KWH Batt2', 'Discharge AH Batt2', 'SOH Battery 2', 'Cycle Counts Battery 2', 'Charge Run Hours Battery 2', 'Discharge Run Hours Battery 2', 'Battery Voltage 3', 'Battery Current 3', 'Battery SOC 3', 'Temeprature Battery 3', 'Charge AH Batt3', 'Charge KWH Batt3', 'Discharge AH Batt3', 'SOH Battery 3', 'Cycle Counts Battery 3', 'Charge Run Hours Battery 3', 'Charge Run Hours Battery 3', 'Speed', 'Longitude', 'E/W', 'Lattitude', 'N/S', 'Alarm1', 'Alarm2', 'Alarm3', 'Alarm4', 'Status1', 'Status2', 'Serial string Battery 1', 'Serial string Battery 2', 'Serial string Battery 3', 'Battery Manufacturer', 'Telematics Version'];
    
                // var fileName = body.telemetryboardid + moment(body.from).format("YYYYMMDDHHMM") + moment(body.to).format("YYYYMMDDHHMM") + '.xlsx';
    
                // const csvWriter = createCsvWriter({
                //     header: headers,
                //     path: './public/' + fileName
                // });
    
                // var headerCellIndex = 58;
                // AppConfig.BitMessages.SuperAdminAlarm1Arr.forEach(function (value) {
                //     headerCellIndex += 1;
                //     headers.push(value.message)
                // });
    
                // AppConfig.BitMessages.SuperAdminAlarm2Arr.forEach(function (value) {
                //     headerCellIndex += 1;
                //     headers.push(value.message)
                // });
    
                // AppConfig.BitMessages.SuperAdminAlarm3Arr.forEach(function (value) {
                //     headerCellIndex += 1;
                //     headers.push(value.message)
                // });
    
                // AppConfig.BitMessages.SuperAdminAlarm4Arr.forEach(function (value) {
                //     headerCellIndex += 1;
                //     headers.push(value.message)
                // });
    
                // AppConfig.BitMessages.SuperAdminStatus1Arr.forEach(function (value) {
                //     headerCellIndex += 1;
                //     headers.push(value.message)
                // });
    
                // AppConfig.BitMessages.SuperAdminStatus2Arr.forEach(function (value) {
                //     headerCellIndex += 1;
                //     headers.push(value.message)
                // });
    
                var records = [];
                console.log("BatteryData ================ ", BatteryData.length);
                return bPromise.all(BatteryData).each(function (item, index) {
                    var recordInner = [];
    
                    //var rowIndex = index + headRowIndex + 1;
    
                    console.log("item.time ============ ", item.tim, index);
                    var DateD = moment(item.time).format("MM/DD/YYYY");
                    var Time = moment(item.time).format("HH:mm:ss");
    
    
                    //var jsonData = JSON.parse(item.json);
                    //console.log("DateD", jsonData);
    
                    recordInner.push(DateD);
                    recordInner.push(Time);
                    recordInner.push(item.telemetryboardid);
                    recordInner.push(item.json);
                    records.push(recordInner);
                	
                	
                    // recordInner.push(jsonData.BI);
                    // recordInner.push(jsonData.SOC);
                    // recordInner.push(jsonData.TS);
                    // recordInner.push('Delivery Instruction');
    
                    // console.log("BV1")
                    // recordInner.push(jsonData.BV1);
                    // recordInner.push(jsonData.BI1);
                    // recordInner.push(jsonData.BSC1);
                    // recordInner.push(jsonData.TB1);
                    // recordInner.push(jsonData.CAB1);
                    // recordInner.push(jsonData.CKB1);
                    // recordInner.push(jsonData.DAB1);
                    // recordInner.push(jsonData.SHB1);
                    // recordInner.push(jsonData.CCB1);
                    // recordInner.push(jsonData.CHR1);
                    // recordInner.push(jsonData.DHR1);
    
                    // console.log("BV2")
                    // recordInner.push(jsonData.BV2);
                    // recordInner.push(jsonData.BI2);
                    // recordInner.push(jsonData.BSC2);
                    // recordInner.push(jsonData.TB2);
                    // recordInner.push(jsonData.CAB2);
                    // recordInner.push(jsonData.CKB2);
                    // recordInner.push(jsonData.DAB2);
                    // recordInner.push(jsonData.SHB2);
                    // recordInner.push(jsonData.CCB2);
                    // recordInner.push(jsonData.CHR2);
                    // recordInner.push(jsonData.DHR2);
    
                    // console.log("BV3")
                    // recordInner.push(jsonData.BV3);
                    // recordInner.push(jsonData.BI3);
                    // recordInner.push(jsonData.BSC3);
                    // recordInner.push(jsonData.TB3);
                    // recordInner.push(jsonData.CAB3);
                    // recordInner.push(jsonData.CKB3);
                    // recordInner.push(jsonData.DAB3);
                    // recordInner.push(jsonData.SHB3);
                    // recordInner.push(jsonData.CCB3);
                    // recordInner.push(jsonData.CHR3);
                    // recordInner.push(jsonData.DHR3);
    
                    // recordInner.push(jsonData.SPD);
                    // recordInner.push(jsonData.LNG);
                    // recordInner.push(jsonData.LNS);
                    // recordInner.push(jsonData.LAT);
                    // recordInner.push(jsonData.LAS);
    
    
    
    
                    // console.log("AL1");
                    // recordInner.push(jsonData.AL1);
                    // recordInner.push(jsonData.AL2);
                    // recordInner.push(jsonData.AL3);
                    // recordInner.push(jsonData.AL4);
    
                    // console.log("S")
                    // recordInner.push(jsonData.ST1);
                    // recordInner.push(jsonData.ST2);
    
                    // recordInner.push('Serial Number Battery 1');
                    // recordInner.push('Serial Number Battery 2');
                    // recordInner.push('Serial Number Battery 3');
    
                    // recordInner.push('Battery Manufacturer');
                    // recordInner.push('Telematics Version');
    
    
                    // console.log("AL1");
    
                    // var AL1 = GetActivatedAlarmData(ConvertNumberToBinary(jsonData.AL1));
                    // console.log("AL1", AL1);
    
                    // var cellIndex = 58;
                    // AL1.forEach(function (value, alertIndex) {
                    //     cellIndex += 1;
                    //     recordInner.push(value);
                    // });
    
                    // if (AL1.length < 16) {
                    //     for (var ali = AL1.length; ali < 16; ali++) {
                    //         cellIndex += (ali - AL1.length) + 1;
                    //         recordInner.push(0);
                    //     }
                    // }
    
                    // var AL2 = GetActivatedAlarmData(ConvertNumberToBinary(jsonData.AL2));
                    // console.log("AL2", AL2);
    
                    // AL2.forEach(function (value, alertIndex) {
                    //     cellIndex += 1;
                    //     recordInner.push(value);
                    // });
    
                    // if (AL2.length < 16) {
                    //     for (var ali = AL2.length; ali < 16; ali++) {
                    //         cellIndex += (ali - AL2.length) + 1;
                    //         recordInner.push(0);
                    //     }
                    // }
    
                    // var AL3 = GetActivatedAlarmData(ConvertNumberToBinary(jsonData.AL3));
                    // console.log("AL3", AL3);
    
                    // AL3.forEach(function (value, alertIndex) {
                    //     cellIndex += 1;
                    //     recordInner.push(value);
                    // });
    
                    // if (AL3.length < 16) {
                    //     for (var ali = AL3.length; ali < 16; ali++) {
                    //         cellIndex += (ali - AL3.length) + 1;
                    //         recordInner.push(0);
                    //     }
                    // }
    
                    // var AL4 = GetActivatedAlarmData(ConvertNumberToBinary(jsonData.AL4));
                    // console.log("AL4", AL4);
    
                    // AL4.forEach(function (value, alertIndex) {
                    //     cellIndex += 1;
                    //     recordInner.push(value);
                    // });
    
                    // if (AL4.length < 16) {
                    //     for (var ali = AL4.length; ali < 16; ali++) {
                    //         cellIndex += (ali - AL4.length) + 1;
                    //         recordInner.push(0);
                    //     }
                    // }
    
                    // var ST1 = GetActivatedAlarmData(ConvertNumberToBinary(jsonData.ST1));
                    // console.log("ST1", ST1);
    
                    // ST1.forEach(function (value, alertIndex) {
                    //     cellIndex += 1;
                    //     recordInner.push(value);
                    // });
    
                    // if (ST1.length < 16) {
                    //     for (var ali = ST1.length; ali < 16; ali++) {
                    //         cellIndex += (ali - ST1.length) + 1;
                    //         recordInner.push(0);
                    //     }
                    // }
    
                    // var ST2 = GetActivatedAlarmData(ConvertNumberToBinary(jsonData.ST2));
                    // console.log("ST2", ST2);
    
                    // ST2.forEach(function (value, alertIndex) {
                    //     cellIndex += 1;
                    //     recordInner.push(value);
                    // });
    
                    // if (ST2.length < 16) {
                    //     for (var ali = ST2.length; ali < 16; ali++) {
                    //         cellIndex += (ali - ST2.length) + 1;
                    //         recordInner.push(0);
                    //     }
                    // }
    
                    // records.push(recordInner);
                }).then(function () {
                    csvWriter.writeRecords(records)       // returns a promise
                        .then(() => {
                            if(req.params.telemetryboardid){
                                res.download('./public/' + fileName);
                            } else if(req.body.telemetryboardid){
                                res.json({ 
                                    "Status": 200, 
                                    "Result": fileName, 
                                    "Message": "" 
                                });
                            }        
                        });
                });
            });
        });
        */
        .then(function (VData) {
            return VehicleServices.GetVehicleReport(body).then(function (BatteryData) {
                console.log("BatteryData.length ============== ", BatteryData.length);
                //return res.json(BatteryData);
                // Create a new instance of a Workbook class
                var workbook = new excel.Workbook();

                // Add Worksheets to the workbook
                var ws = workbook.addWorksheet('Sheet 1');
                var worksheet2 = workbook.addWorksheet('Sheet 2');

                console.log(BatteryData.length);
                var headerStyle = {
                    alignment: {
                        horizontal: ['center'],
                        vertical: ['center'],
                    }
                }
                var headerLevelStyle = {
                    alignment: {
                        horizontal: ['right'],
                        vertical: ['center'],
                    },
                    font: {
                        bold: true
                    }
                }
                var headerValueStyle = {
                    alignment: {
                        horizontal: ['left'],
                        vertical: ['center'],
                    }
                }
                ws.cell(1, 1, 1, 12, true).string('').style(headerStyle);

                ws.cell(2, 1).string('Report Type').style(headerLevelStyle);
                ws.cell(2, 2, 2, 10, true).string('Device Report').style(headerValueStyle);

                ws.cell(3, 1).string('Duration').style(headerLevelStyle);
                var toDateTemp = moment(body.to).format('ll');
                var fromDateTemp = moment(body.from).format('ll');
                ws.cell(3, 2, 3, 6, true).string(fromDateTemp + ' to ' + toDateTemp).style(headerValueStyle);

                ws.cell(4, 1).string('Vehicle Name').style(headerLevelStyle);
                if (VData) {
                    ws.cell(4, 2, 4, 10, true).string(VData.vehiclenumber + "(" + VData.telemetryboardid + ")").style(headerValueStyle);
                }

                var columnStyle = {
                    font: {
                        bold: true
                    }
                }

                var headRowIndex = 6;

                var style = {
                    font: {
                        bold: true
                    }
                }

                ws.cell(headRowIndex, 1).string('DATE').style(style);
                ws.cell(headRowIndex, 2).string('Time').style(style);
                ws.cell(headRowIndex, 3).string('Telematics ID').style(style);
                ws.cell(headRowIndex, 4).string('Battery Voltage').style(style);
                ws.cell(headRowIndex, 5).string('Battery Current').style(style);
                ws.cell(headRowIndex, 6).string('SOC').style(style);
                ws.cell(headRowIndex, 7).string('Telematics Temperature').style(style);
                ws.cell(headRowIndex, 8).string('Battery Voltage 1').style(style);
                ws.cell(headRowIndex, 9).string('Battery Current 1').style(style);
                ws.cell(headRowIndex, 10).string('Battery SOC 1').style(style);
                ws.cell(headRowIndex, 11).string('Temeprature Battery 1').style(style);
                ws.cell(headRowIndex, 12).string('Charge AH Batt1').style(style);
                ws.cell(headRowIndex, 13).string('Charge KWH Batt1').style(style);
                ws.cell(headRowIndex, 14).string('Discharge AH Batt1').style(style);
                ws.cell(headRowIndex, 15).string('Discharge KWH Batt1').style(style);
                ws.cell(headRowIndex, 16).string('SOH Battery 1').style(style);
                ws.cell(headRowIndex, 17).string('Cycle Counts Battery 1').style(style);
                ws.cell(headRowIndex, 18).string('Charge Run Hours Battery 1').style(style);
                ws.cell(headRowIndex, 19).string('Discharge Run Hours Battery 1').style(style);
                ws.cell(headRowIndex, 20).string('Battery Voltage 2').style(style);
                ws.cell(headRowIndex, 21).string('Battery Current 2').style(style);
                ws.cell(headRowIndex, 22).string('Battery SOC 2').style(style);
                ws.cell(headRowIndex, 23).string('Temeprature Battery 2').style(style);
                ws.cell(headRowIndex, 24).string('Charge AH Batt2').style(style);
                ws.cell(headRowIndex, 25).string('Charge KWH Batt2').style(style);
                ws.cell(headRowIndex, 26).string('Discharge AH Batt2').style(style);
                ws.cell(headRowIndex, 27).string('Discharge KWH Batt2').style(style);
                ws.cell(headRowIndex, 28).string('SOH Battery 2').style(style);
                ws.cell(headRowIndex, 29).string('Cycle Counts Battery 2').style(style);
                ws.cell(headRowIndex, 30).string('Charge Run Hours Battery 2').style(style);
                ws.cell(headRowIndex, 31).string('Discharge Run Hours Battery 2').style(style);
                ws.cell(headRowIndex, 32).string('Battery Voltage 3').style(style);
                ws.cell(headRowIndex, 33).string('Battery Current 3').style(style);
                ws.cell(headRowIndex, 34).string('Battery SOC 3').style(style);
                ws.cell(headRowIndex, 35).string('Temeprature Battery 3').style(style);
                ws.cell(headRowIndex, 36).string('Charge AH Batt3').style(style);
                ws.cell(headRowIndex, 37).string('Charge KWH Batt3').style(style);
                ws.cell(headRowIndex, 38).string('Discharge AH Batt3').style(style);
                ws.cell(headRowIndex, 39).string('Discharge KWH Batt3').style(style);
                ws.cell(headRowIndex, 40).string('SOH Battery 3').style(style);
                ws.cell(headRowIndex, 41).string('Cycle Counts Battery 3').style(style);
                ws.cell(headRowIndex, 42).string('Charge Run Hours Battery 3').style(style);
                ws.cell(headRowIndex, 43).string('Discharge Run Hours Battery 3').style(style);
                ws.cell(headRowIndex, 44).string('Distance Travelled').style(style);
                ws.cell(headRowIndex, 45).string('Speed').style(style);
                ws.cell(headRowIndex, 46).string('Longitude').style(style);
                ws.cell(headRowIndex, 47).string('E/W').style(style);
                ws.cell(headRowIndex, 48).string('Lattitude').style(style);
                ws.cell(headRowIndex, 49).string('N/S').style(style);
                ws.cell(headRowIndex, 50).string('Alarm1').style(style);
                ws.cell(headRowIndex, 51).string('Alarm2').style(style);
                ws.cell(headRowIndex, 52).string('Alarm3').style(style);
                ws.cell(headRowIndex, 53).string('Alarm4').style(style);
                ws.cell(headRowIndex, 54).string('Status1').style(style);
                ws.cell(headRowIndex, 55).string('Status2').style(style);
                ws.cell(headRowIndex, 56).string('Serial Number Battery 1').style(style);
                ws.cell(headRowIndex, 57).string('Serial Number Battery 2').style(style);
                ws.cell(headRowIndex, 58).string('Serial Number Battery 3').style(style);
                ws.cell(headRowIndex, 59).string('Battery Manufacturer').style(style);
                ws.cell(headRowIndex, 60).string('Telematics FV').style(style);

                var headerCellIndex = 61;
                AppConfig.BitMessages.SuperAdminAlarm1Arr.forEach(function (value) {
                    headerCellIndex += 1;
                    ws.cell(headRowIndex, headerCellIndex).string(value.message).style(style);
                });

                AppConfig.BitMessages.SuperAdminAlarm2Arr.forEach(function (value) {
                    headerCellIndex += 1;
                    ws.cell(headRowIndex, headerCellIndex).string(value.message).style(style);
                });

                AppConfig.BitMessages.SuperAdminAlarm3Arr.forEach(function (value) {
                    headerCellIndex += 1;
                    ws.cell(headRowIndex, headerCellIndex).string(value.message).style(style);
                });

                AppConfig.BitMessages.SuperAdminAlarm4Arr.forEach(function (value) {
                    headerCellIndex += 1;
                    ws.cell(headRowIndex, headerCellIndex).string(value.message).style(style);
                });

                AppConfig.BitMessages.SuperAdminStatus1Arr.forEach(function (value) {
                    headerCellIndex += 1;
                    ws.cell(headRowIndex, headerCellIndex).string(value.message).style(style);
                });

                AppConfig.BitMessages.SuperAdminStatus2Arr.forEach(function (value) {
                    headerCellIndex += 1;
                    ws.cell(headRowIndex, headerCellIndex).string(value.message).style(style);
                });

                return bPromise.all(BatteryData).each(function (item, index) {

                    var rowIndex = index + headRowIndex + 1;
                    var style = {
                        font: {
                            bold: false
                        }
                    }

                    var DateD = moment(item.time).format("MM/DD/YYYY");
                    var Time = moment(item.time).format("HH:mm:ss");

                    var jsonData = JSON.parse(item.json);

                    ws.cell(rowIndex, 1).string(DateD).style(style);
                    ws.cell(rowIndex, 2).string(Time).style(style);
                    ws.cell(rowIndex, 3).string(item.telemetryboardid).style(style);
                    ws.cell(rowIndex, 4).number((jsonData.BV) ? jsonData.BV : 0).style(style);
                    ws.cell(rowIndex, 5).number((jsonData.BI) ? jsonData.BI : 0).style(style);
                    ws.cell(rowIndex, 6).number((jsonData.SOC) ? jsonData.SOC : 0).style(style);
                    ws.cell(rowIndex, 7).number((jsonData.TS) ? jsonData.TS : 0).style(style);
                    ws.cell(rowIndex, 8).number((jsonData.BV1) ? jsonData.BV1 : 0).style(style);
                    ws.cell(rowIndex, 9).number((jsonData.BI1) ? jsonData.BI1 : 0).style(style);
                    ws.cell(rowIndex, 10).number((jsonData.BSC1) ? jsonData.BSC1 : 0).style(style);
                    ws.cell(rowIndex, 11).number((jsonData.TB1) ? jsonData.TB1 : 0).style(style);
                    ws.cell(rowIndex, 12).number((jsonData.CAB1) ? jsonData.CAB1 : 0).style(style);
                    ws.cell(rowIndex, 13).number((jsonData.CKB1) ? jsonData.CKB1 : 0).style(style);
                    ws.cell(rowIndex, 14).number((jsonData.DAB1) ? jsonData.DAB1 : 0).style(style);
                    ws.cell(rowIndex, 15).number((jsonData.DKB1) ? jsonData.DKB1 : 0).style(style);
                    ws.cell(rowIndex, 16).number((jsonData.SHB1) ? jsonData.SHB1 : 0).style(style);
                    ws.cell(rowIndex, 17).number((jsonData.CCB1) ? jsonData.CCB1 : 0).style(style);
                    ws.cell(rowIndex, 18).number((jsonData.CHR1) ? jsonData.CHR1 : 0).style(style);
                    ws.cell(rowIndex, 19).number((jsonData.DHR1) ? jsonData.DHR1 : 0).style(style);
                    ws.cell(rowIndex, 20).number((jsonData.BV2) ? jsonData.BV2 : 0).style(style);
                    ws.cell(rowIndex, 21).number((jsonData.BI2) ? jsonData.BI2 : 0).style(style);
                    ws.cell(rowIndex, 22).number((jsonData.BSC2) ? jsonData.BSC2 : 0).style(style);
                    ws.cell(rowIndex, 23).number((jsonData.TB2) ? jsonData.TB2 : 0).style(style);
                    ws.cell(rowIndex, 24).number((jsonData.CAB2) ? jsonData.CAB2 : 0).style(style);
                    ws.cell(rowIndex, 25).number((jsonData.CKB2) ? jsonData.CKB2 : 0).style(style);
                    ws.cell(rowIndex, 26).number((jsonData.DAB2) ? jsonData.DAB2 : 0).style(style);
                    ws.cell(rowIndex, 27).number((jsonData.DKB2) ? jsonData.DKB2 : 0).style(style);
                    ws.cell(rowIndex, 28).number((jsonData.SHB2) ? jsonData.SHB2 : 0).style(style);
                    ws.cell(rowIndex, 29).number((jsonData.CCB2) ? jsonData.CCB2 : 0).style(style);
                    ws.cell(rowIndex, 30).number((jsonData.CHR2) ? jsonData.CHR2 : 0).style(style);
                    ws.cell(rowIndex, 31).number((jsonData.DHR2) ? jsonData.DHR2 : 0).style(style);
                    ws.cell(rowIndex, 32).number((jsonData.BV3) ? jsonData.BV3 : 0).style(style);
                    ws.cell(rowIndex, 33).number((jsonData.BI3) ? jsonData.BI3 : 0).style(style);
                    ws.cell(rowIndex, 34).number((jsonData.BSC3) ? jsonData.BSC3 : 0).style(style);
                    ws.cell(rowIndex, 35).number((jsonData.TB3) ? jsonData.TB3 : 0).style(style);
                    ws.cell(rowIndex, 36).number((jsonData.CAB3) ? jsonData.CAB3 : 0).style(style);
                    ws.cell(rowIndex, 37).number((jsonData.CKB3) ? jsonData.CKB3 : 0).style(style);
                    ws.cell(rowIndex, 38).number((jsonData.DAB3) ? jsonData.DAB3 : 0).style(style);
                    ws.cell(rowIndex, 39).number((jsonData.DKB3) ? jsonData.DKB3 : 0).style(style);
                    ws.cell(rowIndex, 40).number((jsonData.SHB3) ? jsonData.SHB3 : 0).style(style);
                    ws.cell(rowIndex, 41).number((jsonData.CCB3) ? jsonData.CCB3 : 0).style(style);
                    ws.cell(rowIndex, 42).number((jsonData.CHR3) ? jsonData.CHR3 : 0).style(style);
                    ws.cell(rowIndex, 43).number((jsonData.DHR3) ? jsonData.DHR3 : 0).style(style);
                    ws.cell(rowIndex, 44).number((jsonData.TDT) ? jsonData.TDT : 0).style(style);
                    ws.cell(rowIndex, 45).number((jsonData.SPD) ? jsonData.SPD : 0).style(style);
                    ws.cell(rowIndex, 46).number((jsonData.LNG) ? jsonData.LNG : 0).style(style);
                    ws.cell(rowIndex, 47).string((jsonData.LNS) ? jsonData.LNS : "").style(style);
                    ws.cell(rowIndex, 48).number((jsonData.LAT) ? jsonData.LAT : 0).style(style);
                    ws.cell(rowIndex, 49).string((jsonData.LAS) ? jsonData.LAS : "").style(style);
                    ws.cell(rowIndex, 50).number((jsonData.AL1) ? jsonData.AL1 : 0).style(style);
                    ws.cell(rowIndex, 51).number((jsonData.AL2) ? jsonData.AL2 : 0).style(style);
                    ws.cell(rowIndex, 52).number((jsonData.AL3) ? jsonData.AL3 : 0).style(style);
                    ws.cell(rowIndex, 53).number((jsonData.AL4) ? jsonData.AL4 : 0).style(style);
                    ws.cell(rowIndex, 54).number((jsonData.ST1) ? jsonData.ST1 : 0).style(style);
                    ws.cell(rowIndex, 55).number((jsonData.ST2) ? jsonData.ST2 : 0).style(style);
                    ws.cell(rowIndex, 56).number((jsonData.snb1) ? jsonData.snb1 : 0).style(style);
                    ws.cell(rowIndex, 57).number((jsonData.snb2) ? jsonData.snb2 : 0).style(style);
                    ws.cell(rowIndex, 58).number((jsonData.snb3) ? jsonData.snb3 : 0).style(style);
                    ws.cell(rowIndex, 59).number((jsonData.bm) ? jsonData.bm : 0).style(style);
                    ws.cell(rowIndex, 60).string('Telematics Version').style(style);
                    /*ws.cell(rowIndex, 56).string('Serial Number Battery 1').style(style);
                    ws.cell(rowIndex, 57).string('Serial Number Battery 2').style(style);
                    ws.cell(rowIndex, 58).string('Serial Number Battery 3').style(style);
                    ws.cell(rowIndex, 59).string('Battery Manufacturer').style(style);
                    ws.cell(rowIndex, 60).string('Telematics Version').style(style);*/

                    var AL1 = GetActivatedAlarmData(ConvertNumberToBinary(jsonData.AL1));
                    var cellIndex = 61;
                    AL1.forEach(function (value, alertIndex) {
                        cellIndex += 1;
                        ws.cell(rowIndex, cellIndex).string(value).style(style);
                    });
                    if (AL1.length < 16) {
                        for (var ali = AL1.length; ali < 16; ali++) {
                            cellIndex += 1;
                            ws.cell(rowIndex, cellIndex).number(0).style(style);
                        }
                    }

                    var AL2 = GetActivatedAlarmData(ConvertNumberToBinary(jsonData.AL2));
                    AL2.forEach(function (value, alertIndex) {
                        cellIndex += 1;
                        ws.cell(rowIndex, cellIndex).string(value).style(style);
                    });
                    if (AL2.length < 16) {
                        for (var ali = AL2.length; ali < 16; ali++) {
                            cellIndex += 1;
                            ws.cell(rowIndex, cellIndex).number(0).style(style);
                        }
                    }

                    var AL3 = GetActivatedAlarmData(ConvertNumberToBinary(jsonData.AL3));
                    AL3.forEach(function (value, alertIndex) {
                        cellIndex += 1;
                        ws.cell(rowIndex, cellIndex).string(value).style(style);
                    });
                    if (AL3.length < 16) {
                        for (var ali = AL3.length; ali < 16; ali++) {
                            cellIndex += 1;
                            ws.cell(rowIndex, cellIndex).number(0).style(style);
                        }
                    }

                    var AL4 = GetActivatedAlarmData(ConvertNumberToBinary(jsonData.AL4));
                    AL4.forEach(function (value, alertIndex) {
                        cellIndex += 1;
                        ws.cell(rowIndex, cellIndex).string(value).style(style);
                    });
                    if (AL4.length < 16) {
                        for (var ali = AL4.length; ali < 16; ali++) {
                            cellIndex += 1;
                            ws.cell(rowIndex, cellIndex).number(0).style(style);
                        }
                    }

                    var ST1 = GetActivatedAlarmData(ConvertNumberToBinary(jsonData.ST1));
                    ST1.forEach(function (value, alertIndex) {
                        cellIndex += 1;
                        ws.cell(rowIndex, cellIndex).string(value).style(style);
                    });
                    if (ST1.length < 16) {
                        for (var ali = ST1.length; ali < 16; ali++) {
                            cellIndex += 1;
                            ws.cell(rowIndex, cellIndex).number(0).style(style);
                        }
                    }

                    var ST2 = GetActivatedAlarmData(ConvertNumberToBinary(jsonData.ST2));
                    ST2.forEach(function (value, alertIndex) {
                        cellIndex += 1;
                        ws.cell(rowIndex, cellIndex).string(value).style(style);
                    });
                    if (ST2.length < 16) {
                        for (var ali = ST2.length; ali < 16; ali++) {
                            cellIndex += 1;
                            ws.cell(rowIndex, cellIndex).number(0).style(style);
                        }
                    }

                }).then(function () {
                    var fileName = body.telemetryboardid + moment(body.from).format("YYYYMMDDHHMMSS") + moment(body.to).format("YYYYMMDDHHMMSS") + '.xlsx';
                    workbook.write('./public/' + fileName, function (err, stats) {
                        if (err) {
                            res.json({
                                error: true,
                                message: "There are some error occured in DB."
                            });
                        } else {
                            if (req.params.telemetryboardid) {
                                res.download('./public/' + fileName);
                            } else if (req.body.telemetryboardid) {
                                res.json({
                                    "Status": 200,
                                    "Result": fileName,
                                    "Message": ""
                                });
                            }
                        }
                    });
                }).catch(function (error) {
                    throw error;
                });
            }).catch(function (error) {
                return errorsControllerHelper.returnError({
                    Succeeded: false,
                    Status: 500,
                    Message: error,
                    Name: error
                }, res, 500)
            })
        });
}
/*************************Controller for Hub Vehicle List */
exports.HubVehicleList = function (req, res) {
    var params = req.params.Id;
    return VehicleServices.HubVehicleList(params).then(function (Data) {
        if (Data) {
            res.json({ "Status": 200, "Result": Data, "Message": "Hub vehicle list." });
        } else {
            res.json({ "Status": 200, "Result": Data, "Message": "Hub vehicle list ." });
        }
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}

/***********************Controller for GetVehicleUtilizationFactorGraph */
exports.GetVehicleUtilizationFactorGraph = function (req, res) {

    var AuthData = req.AuthData;
    return VehicleServices.GetVehicleUtilizationFactorGraph(AuthData).then(function (Data) {
        if (Data) {
            res.json({ "Status": 200, "Result": Data, "Message": "Vehicle utilization factor graph." });
        } else {
            res.json({ "Status": 200, "Result": Data, "Message": "Vehicle utilization factor graph ." });
        }
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}

/***********************Controller for get vehicle utilities chart  */
exports.GetVehicleUtilitiesChartData = function(req, res){
	var AuthData = req.AuthData;
    var params = req.params;

    return VehicleServices.getVehicleUtilitiesChartData(AuthData, params).then(function (Data) {
        res.json({ "Status": 200, "Result": Data[Data.length-1], "Message": "Vehicle Chart Data" });
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}