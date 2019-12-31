import { Evehicle } from '../models/evehicle';
import { batteryData } from '../models/evehicle';
import { VehicleLog } from '../models/vehiclelog';
import { UserType } from '../models/usertype';
import { VehicleType } from '../models/vehicletype';
import { Hub } from '../models/hub';
import { User } from '../models/user';
import { LoginLog } from '../models/loginlog';
import { vehicletravelrevenues, VehicleTravelRevenue } from '../models/vehicletravelrevenuelog';
import { ChargerStation } from '../models/chargerstation';
import { Telemetrylog } from '../models/telemetrylog';
import { BatteryDataBM } from '../models/batterybmdata';
import { Mielage } from '../models/mileage';
import { BatteryDataBMTemp } from '../models/batterybmdatatemp';
import { Telemetrylogtemp } from '../models/telemetrylogtemp';
import { BookingDetail } from '../models/bookingdetails';
import { Mastserroles } from '../models/masterroles';
import { Roleswrites } from '../models/roleswrites';
var ErrorHelper = require('../helpers/errortypes-helper');
var successHelper = require('../helpers/success.helper');
var distance = require('google-distance-matrix');
import DistanceMatrix from 'node-distance-matrix';
import { VehiclechartModel, ObjectId } from '../models/vehiclechartdata';
import { fchown } from 'fs';
var bPromise = require('bluebird');
var moment = require('moment');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nynbus.inwizards@gmail.com',
        pass: 'qwerty@11'
    }
});

// handle CreateVehicles Services.
exports.CreateVehicles = function (params) {
    var myData = new Evehicle(params);
    return myData.save().then(function (item) {
        return item;
    }).catch(function (error) {
        if (error.name == "ValidationError") {
            var params = Object.keys(error.errors).map(function (key) {
                return {
                    "message": error.errors[key].message,
                    "path": error.errors[key].message,
                    "type": error.errors[key].name
                }
            });
            throw new ErrorHelper.ValidationError("Something went wrong.", params);
        } else {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        }
    });
}

// handle FindAllOrganizationList Services.
exports.FindAllBattery = function (AuthData) {
    return batteryData.find({ "isactive": false, "organizationid": AuthData.organizationid }).then(function (item) {
        if (item) {
            return item;
        } else {
            return false;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    });
}

// handle CreateBatteryData Services.
exports.CreateBatteryData = function (params) {
    var myData = new batteryData(params);
    return myData.save().then(function (item) {
        return item;
    }).catch(function (error) {
        if (error.name == "ValidationError") {
            var params = Object.keys(error.errors).map(function (key) {
                return {
                    "message": error.errors[key].message,
                    "path": error.errors[key].message,
                    "type": error.errors[key].name
                }
            });
            throw new ErrorHelper.ValidationError("Something went wrong.", params);
        } else {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        }
    });
}

// handle FindSingleBatery Services.
exports.FindSingleBatery = function (params) {
    return batteryData.findOne(params).then(function (item) {
        if (item) {
            return item;
        } else {
            item = ""
            return item;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    });
}

// handle FindSingleBatery Services.
exports.FindLastTelemetrylogData = function (params, orderBy) {
    return Telemetrylog.findOne(params).sort(orderBy).then(function (Item) {
        if (Item) {
            return Item;
        } else {
            var Item = [];
            return Item;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}

// handle VehicleLists Services.
exports.VehicleListsVendor = function (params) {
    return Evehicle.find(params).populate('vehicletype').populate('hubid').then(function (item) {
        if (item) {
            return item;
        } else {
            return false;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    });
}

exports.VehicleLists = function (params, userParams) {
    var whereparams = {
        "userid": userParams.userid,
        'logindatetime': {
            $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
            $lt: moment().utc().format()
        },
        "isauthenticated": false
    }
    return LoginLog.find(whereparams).sort({ _id: -1 }).then(function (Item) {
        if (Item.length < 0) {
            var Item = "";
            return Item;
        } else {
            // check healty vehicle
            return Evehicle.find(params).populate('vehicletype').then(function (item) {
                if (item.length != 0) {
                    return item;
                } else {
                    var item = "";
                    return item;
                }
            }).catch(function (error) {
                throw new ErrorHelper.BadRequest("Something went wrong.", error);
            });
        }
    })
}

exports.FindAllVehicleList = function (params, HubId) {
    if (HubId != "") {
        var whereparams = {
            "organizationid": params.organizationid,
            "hubid": HubId
        }
    } else {
        var whereparams = {
            "organizationid": params.organizationid,
        }
    }
    return Evehicle.find(whereparams).populate('hubid').populate('vehicletype').sort({ name: 1 }).then(function (item) {
        if (item) {
            return item;
        } else {
            var item = [];
            return item;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    });
}


exports.FindVehicleListAggregator = function (whereparams) {
    if (whereparams.status == "assembled") {
        var whereparams = {
            "organizationid": whereparams.orgid,
            "telemetryboardid": { $exists: true },
            "batteryid": { $exists: true }
        }
    } else if (whereparams.status == "dissemble") {

        var whereparams = {
            "organizationid": whereparams.orgid,
            "telemetryboardid": { $exists: false },
            "batteryid": { $exists: false }
        }
    } else if (whereparams.status == "all") {
        var whereparams = {
            "organizationid": whereparams.orgid
        }
    }
    return Evehicle.find(whereparams).populate('organizationid').populate('hubid').populate('vehicletype').sort({ name: 1 }).then(function (VehicleItem) {
        if (VehicleItem) {
            console.log("VehicleItem=============", VehicleItem)
            var VehicleList = [];
            return bPromise.all(VehicleItem).each(function (VehicleData) {
                VehicleList.push({
                    "_id": VehicleData._id,
                    "vehicletypename": VehicleData.vehicletype.typename,
                    "name": VehicleData.name,
                    "hubname": (VehicleData.hubid.hubname) ? VehicleData.hubid.hubname : "",
                    "orgid": VehicleData.organizationid._id,
                    "telemetryboardid": VehicleData.telemetryboardid,
                    "batteryid": VehicleData.batteryid,
                    "organizationname": VehicleData.organizationid.organizationname,
                    "type": (VehicleData.batteryid.length > 0) ? "Assembled" : "Disassembled",
                    "vehiclenumber": VehicleData.vehiclenumber,
                    "batterymanufacturer": (VehicleData.batterymanufacturer) ? VehicleData.batterymanufacturer : ""
                })
            }).then(function () {
                return VehicleList;
            })
        } else {
            var item = {};
            return item;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    });
}

// handle HubLists Services.
exports.HubLists = function (params) {
    if (params) {
        return Hub.find(params).then(function (item) {
            if (item) {
                return item;
            } else {
                return false;
            }
        }).catch(function (error) {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        });
    } else {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    }
}

// handle UpdateHubId Services.
exports.UpdateHubId = function (whereparams, updateparams) {
    return Evehicle.findOne(whereparams).then(function (Item) {
        if (Item) {
            if (Item.isactive == false) {
                return Evehicle.updateOne(whereparams, { $set: updateparams }, { new: true }).then(function (item) {
                    if (item) {
                        return item;
                    } else {
                        return false;
                    }
                }).catch(function (error) {
                    throw new ErrorHelper.BadRequest("Something went wrong.", error);
                });
            }
        }
    })

}


exports.UpdateVehicleId = function (VehicleId, HubId) {

    var whereparams = {
        "hubid": HubId,
        "_id": { $nin: VehicleId }
    }
    return Evehicle.find(whereparams).then(function (VehicleData) {
        return bPromise.all(VehicleData).each(function (Item) {
            var UpdateParams = {
                "isactive": false
            }
            var whereparams = {
                "_id": Item._id
            }
            return Evehicle.updateOne(whereparams, { $set: UpdateParams }).then(function (VehicleData) {
                return VehicleData
            })
        }).then(function (Data) {
            return Data;
        })
    })
}
// handle UpdateBatteryData Services.
exports.UpdateBatteryData = function (Data, DeleteId, OrgId) {
    if (DeleteId.length >= 1) {
        return bPromise.map(DeleteId, function (Item) {
            return batteryData.findOne({ _id: Item }).then(function (Item) {
                if (Item.isactive == false) {
                    return batteryData.deleteOne({ _id: Item }).then(function (Item) {
                        return Item;
                    }).then(function (result) {
                        if (Data.prmy_id) {
                            var updateparams = {
                                "batteryid": (Data.batteryid[0]) ? Data.batteryid[0] : false,
                                "telemetryboardid": (Data.telemetryboardid) ? Data.telemetryboardid : false,
                            }
                            return batteryData.updateOne({ _id: Data.prmy_id }, { $set: updateparams }, { new: true }).then(function (Item) {
                                return Item;
                            }).then(function (result) {
                                if (Data.prmy_id == '0') {
                                    var params = {
                                        "batteryid": (Data.batteryid[0]) ? Data.batteryid[0] : false,
                                        "telemetryboardid": (Data.telemetryboardid) ? Data.telemetryboardid : false,
                                    }
                                    var Batterdata = new batteryData(params)
                                    return Batterdata.save().then(function (Item) {
                                        return Item
                                    })
                                }
                            })
                        }
                    })
                }
            })
        })
    } else {
        //return bPromise.map(Data, function (Item) {
        if (Data.prmy_id) {
            var updateparams = {
                "batteryid": (Data.batteryid[0]) ? Data.batteryid[0] : false,
                "telemetryboardid": (Data.telemetryboardid) ? Data.telemetryboardid : false,
            }
            return batteryData.updateOne({ _id: Data.prmy_id }, { $set: updateparams }, { new: true }).then(function (Item) {
                return Item;
            }).then(function (result) {
                if (Data.prmy_id == '0') {
                    var params = {
                        "batteryid": (Data.batteryid[0]) ? Data.batteryid[0] : false,
                        "telemetryboardid": (Data.telemetryboardid) ? Data.telemetryboardid : false,

                    }
                    var Batterdata = new batteryData(params)
                    return Batterdata.save().then(function (Item) {
                        return Item
                    })
                } else {
                    return Item;
                }
            })
        }
        //})
    }
}

exports.updateBateryData = function (Id, updateparams, AuthData) {
    return batteryData.updateOne({ _id: Id }, { $set: updateparams }).then(function (Item) {
        return Item;
    }).catch(function (error) {
        res.json(error);
    })
}



// exports.FindVehicleHiostory = function (whereparams) {
//     return batteryData.find(whereparams).then(function (item) {
//         if (item) {
//             return item;
//         } else {
//             throw new ErrorHelper.BadRequest("Parameter missing.", error);
//         }
//     }).catch(function (error) {
//         throw new ErrorHelper.BadRequest("Something went wrong.", error);
//     });
// }

exports.Changestatus = function (params) {
    var VehicleLogDta = new VehicleLog(params)
    return VehicleLogDta.save().then(function (Data) {
        return Data;
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}

exports.AuthenticateVehicle = function (params, Authparams) {
    var whereparams = {
        "userid": params.userid
    }
    return LoginLog.findOne(whereparams).then(function (item) {
        if (item) {
            var updateparams = {
                "isauthenticated": false,
                "vehicleid": item.vehicleid,
                "telemetryboardid": item.telemetryboardid,
                "isauthenticated": item.isauthenticated
            }
            var mysort = { _id: -1 };
            return LoginLog.findOne().sort(mysort).then(function (Item) {
                if (Item) {
                    return LoginLog.updateOne({ "_id": Item._id }, { $set: updateparams }).then(function (Item) {
                        return Item
                    }).catch(function (error) {
                        throw new ErrorHelper.BadRequest("Something went wrong.", error);
                    })
                }
            })
        } else {
            var item = [];
            return item;
        }
    })
}

exports.findLoginLogData = function (whereparams) {
    var mysort = { "_id": -1 }
    return Evehicle.findOne(whereparams).sort(mysort).then(function (item) {
        if (item) {
            return item;
        } else {
            var item = {};
            return item;
        }
    });
}


exports.DeAuthenticateVehicle = function (UserId) {
    var whereparame = {
        "_id": UserId
    }

    return User.findOne(whereparame).then(function (item) {
        if (item) {
            var whereparams = {
                "userid": UserId,
                'logindatetime': { $lt: new Date() },
                "isauthenticated": true
            }
            var mysort = { _id: -1 };
            return LoginLog.findOne(whereparams).sort(mysort).then(function (Item) {
                if (Item) {
                    var LoginLogData = Item;
                    var updateparams = {
                        "logindatetime": new Date(),
                        "isauthenticated": false,
                        $unset: { telemetryboardid: "", vehicleid: "" }
                    }
                    return LoginLog.updateMany({ "userid": Item.userid }, { $set: updateparams }).then(function (Item) {
                        return Item
                    }).then(function () {
                        updateparams = {
                            "status": "free",
                            "activatebyuser": 0
                        }
                        return Evehicle.updateMany({ "_id": LoginLogData.vehicleid }, { $set: updateparams }).then(function (Item) {
                            return Item;
                        });
                    }).catch(function (error) {
                        throw new ErrorHelper.BadRequest("Something went wrong.", error);
                    })

                } else {
                    updateparams = {
                        "status": "free",
                        "activatebyuser": 0
                    }
                    return Evehicle.updateMany({ "_id": LoginLogData.vehicleid }, { $set: updateparams }).then(function (Item) {
                        return Item
                    });
                }
            })
        } else {
            successHelper.returnSuccess(true, res, 200, "User not exists.", Item)
        }
    })
}
exports.GetVehicleDetails = function (params) {
    return Evehicle.findOne(params).populate().then(function (item) {
        if (item.telemetryboardid) {
            return Telemetrylog.findOne({ "telemetryboardid": item.telemetryboardid }).sort({ time: -1 }).then(function (TelemetryData) {
                if (TelemetryData) {
                    item.vehicleDetail = JSON.parse(TelemetryData.json);
                    return BatteryDataBM.findOne({ "telemetryboardid": TelemetryData.telemetryboardid }).then(function
                        (BatterManufacturer) {
                        if (BatterManufacturer) {
                            item.batterManufacture = BatterManufacturer;
                        } else {
                            item.batterManufacture = "";
                        }
                        return item
                    })
                } else {
                    return item
                }

            })
        } else {
            item.vehicleDetail = "";
            return item;
        }
    }).then(function (item) {
        if (item) {
            return item;
        } else {
            var item = [];
            return item;
        }

    }).catch(function (error) {
        console.log("error", error)
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    });
}

// handle GetBatteryData 
exports.GetBatteryData = function (params) {
    return batteryData.findOne(params).sort({
        _id: -1
    }).then(function (item) {
        if (item) {
            return item;
        } else {
            var item = "";
            return item;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    });
}

// handle update Vehicles
exports.UpdateVehicle = function (Id, updateparams, Authparams) {
    return Evehicle.findOne({ _id: Id }).then(function (Item) {
        if (Item) {
            if (updateparams.organizationid) {
                updateparams.organizationid = updateparams.organizationid;
                updateparams.batterymanufacturer = updateparams.batterymanufacturer;
            } else {
                updateparams.organizationid = Authparams.organizationid;
                updateparams.batterymanufacturer = updateparams.batterymanufacturer;
            }
            return Evehicle.updateOne({ _id: Id }, { $set: updateparams }).then(function (Item) {
                return Item;
            }).catch(function (error) {
                throw new ErrorHelper.BadRequest("Something went wrong.", error);
            })
        } else {
            var Item = "";
            return Item;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("parameter missing.", error);
    })
}


exports.UpdateVehicleSystemAggregator = function (Id, updateparams) {
    return Evehicle.findOne({ _id: Id }).then(function (Item) {
        if (Item) {
            if (updateparams.organizationid) {
                updateparams.organizationid = updateparams.organizationid;
                updateparams.isactive = true;
            } else {
                updateparams.organizationid = Authparams.organizationid;
                updateparams.isactive = true;
            }
            return Evehicle.updateOne({ _id: Id }, { $set: updateparams }).then(function (Item) {
                return Item;
            }).catch(function (error) {
                throw new ErrorHelper.BadRequest("Something went wrong.", error);
            })
        } else {
            var Item = "";
            return Item;
        }
    })
}


exports.VehicleTypeLists = function () {
    return VehicleType.find().then(function (Item) {
        return Item;
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}

exports.findUserType = function (params) {
    return UserType.findOne(params).then(function (Data) {
        if (Data) {
            return Data;
        } else {
            var Data = "";
            return Data;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    });
}

exports.FindLastBateryData = function(){

}

exports.StoreVehicLogs = function (params, updateparams, userparams, AuthData) {
    var whereparame = {
        "userid": AuthData._id,
        "logindatetime":
        {
            $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
            $lt: moment().utc().format()
        }
    }
    return LoginLog.findOne(whereparame).sort({ _id: -1 }).then(function (Data) {
        if (Data) {
            return LoginLog.updateMany({ "_id": Data._id, }, { $set: updateparams }, { new: true }).then(function (Item) {
                return Item;
            }).then(function (Data1) {
                var evehicleupdateparame = {
                    "status": "alloted"
                }
                return Evehicle.updateMany({ _id: params.vehicleid }, { $set: evehicleupdateparame }, { new: true }).then(function (Item) {
                    return Data;
                })
            }).catch(function (error) {
                throw new ErrorHelper.BadRequest("Something went wrong.", error);
            })
        } else {
            return LoginLog.updateMany({ "userid": userparams.userid }, { $set: updateparams }, { new: true }).then(function (Item) {
                return Item;
            }).then(function (Data) {
                var evehicleupdateparame = {
                    "status": "alloted"
                }
                return Evehicle.updateMany({ _id: params.vehicleid }, { $set: evehicleupdateparame }).then(function (Item) {
                    return Data;
                })
            }).catch(function (error) {
                throw new ErrorHelper.BadRequest("Something went wrong.", error);
            })
        }
    })
}


exports.AddTempBatteryData = function (params) {
    console.log("I am herer Temp data")
    var myData = new Telemetrylogtemp(params);
    return myData.save().then(function (item) {
        return item;
    }).then(function (Item) {
        return Item
    }).catch(function (error) {
        if (error.name == "ValidationError") {
            var params = Object.keys(error.errors).map(function (key) {
                return {
                    "message": error.errors[key].message,
                    "path": error.errors[key].message,
                    "type": error.errors[key].name
                }
            });
            throw new ErrorHelper.ValidationError("Something went wrong.", params);
        } else {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        }
    });
}


function ConvertNumberToBinary(no) {
    return Number(no).toString(2);
}

exports.AddBatteryData = function (params) {
    console.log("I am herer");
    var myData = new Telemetrylog(params);
    return myData.save().then(function (item) {
        return item;
    }).then(function (Item) {
        return Item
    }).then(function (Item) {
        return Mielage.findOne({ "telemetryboardid": params.telemetryboardid }).sort({ _id: -1 }).then(function (MileageData) {
            if (MileageData) {
                var ConvertNumber = ConvertNumberToBinary(MileageData.st1);
                var a = ConvertNumber.split('');
                var b = a.reverse();
                if (b[8] == 1 && MileageData.mielageleft == null) {
                    var saveparams = {
                        "telemetryboardid": params.telemetryboardid,
                        "tdt": params.tdt,
                        "st1": params.st1,
                        "time": params.time,
                        "mielageleft": "0"
                    }
                    var MileageSave = new Mielage(saveparams);
                    return MileageSave.save().then(function (Mileage) {
                        return Mileage;
                    })
                } else if (b[8] == 0 && MileageData.mielageleft >= 0) {
                    var MileageLeft = (parseFloat(params.tdt) - parseFloat(MileageData.tdt))
                    var saveparams = {
                        "telemetryboardid": params.telemetryboardid,
                        "tdt": params.tdt,
                        "st1": params.st1,
                        "time": params.time,
                        "mielageleft": MileageLeft
                    }
                    var MileageSave = new Mielage(saveparams);
                    return MileageSave.save().then(function (Mileage) {
                        return Mileage;
                    })
                } else {
                    return MileageData;
                }
            } else {
                var saveparams = {
                    "telemetryboardid": params.telemetryboardid,
                    "tdt": params.tdt,
                    "st1": params.st1,
                    "time": params.time,
                    "mielageleft": ""
                }
                var MileageSave = new Mielage(saveparams);
                return MileageSave.save().then(function (Mileage) {
                    return Mileage;
                })
            }
        })
    }).catch(function (error) {
        if (error.name == "ValidationError") {
            var params = Object.keys(error.errors).map(function (key) {
                return {
                    "message": error.errors[key].message,
                    "path": error.errors[key].message,
                    "type": error.errors[key].name
                }
            });
            throw new ErrorHelper.ValidationError("Something went wrong.", params);
        } else {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        }
    });
}

/***************Add Battery Data BM */
exports.AddBatteryDataBM = function (params) {
    return BatteryDataBM.findOne({ "telemetryboardid": params.telemetryboardid }).then(function (BatteryDatabm) {
        if (BatteryDataBM) {
            if (params.bm == BatteryDatabm.bm && params.snb1 == BatteryDatabm.snb1 && params.snb2 == BatteryDatabm.snb2 && params.snb3 == BatteryDatabm.snb3) {
                return true;
            } else {
                return BatteryDataBM.updateMany({ "_id": BatteryDatabm._id }, { $set: params }).then(function (item) {
                    return item;
                }).then(function (item) {
                    return User.findOne({ username: "Superadmin" }).then(function (superadminuser) {
                        var mailOptions = {
                            from: 'no-reply@yourdomain.com',
                            to: superadminuser.email,
                            subject: 'Notification Mail',
                            html: 'Hi, <br/><br/>' + superadminuser.firstname + ' ' + superadminuser.lastname + '<br/>Your Battery data has been changed : <br/><br/><br/> Thanks!!',
                        };
                        transporter.sendMail(mailOptions, function (err, info) {
                            if (err) {
                                console.log("err========", err)
                            } else {
                                console.log("err========", info)
                                return true
                            }
                        })
                    })
                }).catch(function (error) {
                    console.log("error===============", error)
                    if (error.name == "ValidationError") {
                        var params = Object.keys(error.errors).map(function (key) {
                            return {
                                "message": error.errors[key].message,
                                "path": error.errors[key].message,
                                "type": error.errors[key].name
                            }
                        });
                        throw new ErrorHelper.ValidationError("Something went wrong.", params);
                    } else {
                        throw new ErrorHelper.BadRequest("Something went wrong.", error);
                    }
                });
            }
        } else {
            var myData = new BatteryDataBM(params);
            return myData.save().then(function (item) {
                return item;
            }).then(function (Item) {
                return Item
            }).catch(function (error) {
                if (error.name == "ValidationError") {
                    var params = Object.keys(error.errors).map(function (key) {
                        return {
                            "message": error.errors[key].message,
                            "path": error.errors[key].message,
                            "type": error.errors[key].name
                        }
                    });
                    throw new ErrorHelper.ValidationError("Something went wrong.", params);
                } else {
                    throw new ErrorHelper.BadRequest("Something went wrong.", error);
                }
            });
        }
    })
}


exports.AddBatteryDataBMTemp = function (params) {
    //params.json = JSON.stringify(params);
    var myData = new BatteryDataBMTemp(params);
    return myData.save().then(function (item) {
        return item;
    }).then(function (Item) {
        return Item
    }).catch(function (error) {
        if (error.name == "ValidationError") {
            var params = Object.keys(error.errors).map(function (key) {
                return {
                    "message": error.errors[key].message,
                    "path": error.errors[key].message,
                    "type": error.errors[key].name
                }
            });
            throw new ErrorHelper.ValidationError("Something went wrong.", params);
        } else {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        }
    });
}

exports.GetTestBatteryData = function () {
    return Telemetrylog.find().sort({
        time: -1
    }).then(function (Item) {
        if (Item) {
            return Item;
        } else {
            var Item = [];
            return Item;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}


exports.GetBatteryIdDataBMTemp = function () {
    return BatteryDataBMTemp.find().sort({
        _id: -1
    }).then(function (Item) {
        if (Item) {
            return Item;
        } else {
            var Item = [];
            return Item;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}

exports.GetTestBatteryDataBM = function () {
    return BatteryDataBM.find().sort({
        _id: -1
    }).then(function (Item) {
        if (Item) {
            return Item;
        } else {
            var Item = [];
            return Item;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}

exports.GetDistancefromChargerStations = function (params) {
    var origins = ['42.30432', '-73.4389'];
    var destinations = ['42.30432,-73.4389', '43.30432,-74.4389'];
    var mode = params.mode;
    distance.matrix(origins, destinations, mode, function (err, distances) {
        if (!err) {
        } else {
            return false;
        }
    });
}

exports.GetVehicleGraph = function (params, Authdata) {
    var Result = { "FreeVehicle": "", "TotalVehicle": "", "ActiveVehicle": "", "BreakdownVehicle": "", "MaintanenceVehicle": "", "TotalHubs": "", "FreeHub": "", "TotalChargerstation": "", "TotalActivUser": "", "TotalUser": "", "TotalManager": "" };
    var whereparams = {
        "organizationid": Authdata.organizationid,
        "isactive": true
    }
    return Evehicle.find(whereparams).then(function (Item) {
        Result.FreeVehicle = Item.length;
    }).then(function (TotalVehicle) {
        var params = {
            "organizationid": Authdata.organizationid,
        }
        return Evehicle.find(params).then(function (Item) {
            Result.TotalVehicle = Item.length;
        }).then(function () {
            var params = {
                "status": "alloted",
                "organizationid": Authdata.organizationid,
            }
            return Evehicle.find(params).then(function (Item) {
                Result.ActiveVehicle = Item.length
            }).then(function () {
                var params = {
                    "status": "maintanence",
                    "organizationid": Authdata.organizationid,
                }
                return Evehicle.find(params).then(function (Item) {
                    Result.MaintanenceVehicle = Item.length
                })
            }).then(function () {
                var params = {
                    "status": "breakdown",
                    "organizationid": Authdata.organizationid,
                }
                return Evehicle.find(params).then(function (Item) {
                    Result.BreakdownVehicle = Item.length;

                }).then(function () {
                    var params = {
                        "organizationid": Authdata.organizationid,
                    }
                    return Hub.find(params).then(function (Item) {
                        Result.TotalHubs = Item.length;
                    })
                }).then(function () {
                    var params = {
                        "organizationid": Authdata.organizationid,
                        "isactive": false
                    }
                    return Hub.find(params).then(function (Item) {
                        Result.FreeHub = Item.length;
                    })
                }).then(function () {
                    return ChargerStation.find().then(function (Item) {
                        Result.TotalChargerstation = Item.length;
                    })
                }).then(function () {
                    var whereparams = {
                        "isactive": true,
                        "organizationid": Authdata.organizationid,
                    }
                    return User.find(whereparams).then(function (Item) {
                        Result.TotalActivUser = Item.length;
                    })
                }).then(function () {
                    new bPromise(function (resolve, reject) {
                        resolve(successHelper.returnUserTypes("Vendor"))
                    }).then(function (usertypes) {
                        var whereparams = {
                            "organizationid": Authdata.organizationid,
                            "usertypeid": { $ne: usertypes._id }
                        }
                    })
                    return User.find(whereparams).then(function (Item) {
                        Result.TotalUser = Item.length;
                        return Result;
                    })
                }).then(function () {
                    new bPromise(function (resolve, reject) {
                        resolve(successHelper.returnUserTypes("Manager"))
                    }).then(function (usertypes) {
                        var whereparams = {
                            "organizationid": Authdata.organizationid,
                            "usertypeid": usertypes._id
                        }
                    })
                    return User.find(whereparams).then(function (Item) {
                        Result.TotalManager = Item.length;
                        return Result;
                    })
                }).then(function (Result) {
                    return Result;
                })
            })
        })
    }).catch(function (err) {
        throw new ErrorHelper.BadRequest("Something went wrong.", err);
    })
}


exports.SystemIntegreatorGraph = function (params) {
    var Result = { "FreeVehicle": "", "TotalVehicle": "", "ActiveVehicle": "", "BreakdownVehicle": "", "MaintanenceVehicle": "", "TotalChargerstation": "", "AssembledVehicle":"","DisaambledVehicle":"" };
    var params = { "status": "free" };
    return Evehicle.find(params).then(function (Item) {
        Result.FreeVehicle = Item.length;
    }).then(function (TotalVehicle) {
        var params = {};
        return Evehicle.find(params).then(function (Item) {
            Result.TotalVehicle = Item.length;
        }).then(function () {
            return LoginLog.find({
                'logindatetime': {
                    $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
                    $lt: moment().utc().format(),
                },
                "isauthenticated": true
            }).then(function (Item) {
                Result.ActiveVehicle = Item.length
            }).then(function () {
                var params = { "status": "maintanence" }
                return Evehicle.find(params).then(function (Item) {
                    Result.MaintanenceVehicle = Item.length
                })
            }).then(function () {
                var params = { "status": "breakdown" };
                return Evehicle.find(params).then(function (Item) {
                    Result.BreakdownVehicle = Item.length;
                }).then(function () {
                    return ChargerStation.find().then(function (Item) {
                        Result.TotalChargerstation = Item.length;
                        //return Result
                    })
                }).then(function(){
                    var params = {"telemetryboardid":{$exists:true}};
                    return Evehicle.find(params).then(function (Item) {
                        Result.AssembledVehicle = Item.length;
                        var LiveDataArray = 0;
                        return bPromise.map(Item,function(VehicleItem){
                            return Telemetrylog.find({"telemetryboardid":VehicleItem.telemetryboardid}).then(function(LiveData){
                                if(LiveData.length){
                                }else{
                                    LiveDataArray++; 
                                }
                            })
                        }).then(function(){
                            Result.DisaambledVehicle = LiveDataArray;
                            return Result
                        }).then(function (Result) {
                            return Result;
                        })
                    })
                })
            })
        })
    }).catch(function (err) {
        throw new ErrorHelper.BadRequest("Something went wrong.", err);
    })
}

exports.GetVehicleGraphAdmin = function (params, Authdata) {
    var organizationid = (Authdata.organizationid) ? Authdata.organizationid : false;
    var Result = { "FreeVehicle": "", "FleetManager":"","UtilityManager":"","ChargingOperator":"","SystemAggregator":"", "TotalVehicle": "", "ActiveVehicle": "", "BreakdownVehicle": "", "MaintanenceVehicle": "", "TotalHubs": "", "FreeHub": "", "TotalChargerstation": "", "TotalActivUser": "", "TotalUser": "" };

    if (organizationid) {
        var params = { "status": "free", "organizationid": organizationid }
    } else {
        var params = { "status": "free" };
    }
    return Evehicle.find(params).then(function (Item) {
        Result.FreeVehicle = Item.length;
    }).then(function (TotalVehicle) {

        if (organizationid) {
            var params = { "organizationid": organizationid }
        } else {
            var params = {};
        }
        return Evehicle.find(params).then(function (Item) {
            Result.TotalVehicle = Item.length;
        }).then(function () {
			/*
				var params = {
					"status": "active"
				}
				return Evehicle.find(params).then(function (Item) {
					Result.ActiveVehicle = Item.length
				})
			*/
            return LoginLog.find({
                'logindatetime': {
                    $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
                    $lt: moment().utc().format(),
                },
                "isauthenticated": true
            }).sort({ logindatetime: -1 }).then(function (Item) {
                Result.ActiveVehicle = Item.length
            }).then(function () {
                if (organizationid) {
                    var params = { "status": "maintanence", "organizationid": organizationid }
                } else {
                    var params = { "status": "maintanence" };
                }
                return Evehicle.find(params).then(function (Item) {
                    Result.MaintanenceVehicle = Item.length
                })
            }).then(function () {
                if (organizationid) {
                    var params = { "status": "breakdown", "organizationid": organizationid }
                } else {
                    var params = { "status": "breakdown" };
                }
                return Evehicle.find(params).then(function (Item) {
                    Result.BreakdownVehicle = Item.length;
                }).then(function () {

                    if (organizationid) {
                        var params = { "organizationid": organizationid }
                    } else {
                        var params = {};
                    }
                    return Hub.find(params).then(function (Item) {
                        Result.TotalHubs = Item.length;
                    })
                }).then(function () {
                    if (organizationid) {
                        var params = { "organizationid": organizationid, "isactive": true }
                    } else {
                        var params = { "isactive": true };
                    }
                    return Hub.find(params).then(function (Item) {
                        Result.FreeHub = Item.length;
                    })
                }).then(function () {
                    return ChargerStation.find().then(function (Item) {
                        Result.TotalChargerstation = Item.length;
                    })
                }).then(function () {
                    var whereparams = {
                        "isactive": true,
                        "usertypeid": "5cd2913f0c23960c5411b7df"
                        //"username": { $ne: "Superadmin" }
                    }
                    return LoginLog.find({
                        'logindatetime': {
                            $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
                            $lt: moment().utc().format(),
                        },
                        "isauthenticated": true
                    }).then(function (Item) {
                        Result.TotalActivUser = Item.length;
                    })
                }).then(function () {
                    if (organizationid) {
                        var params = { "organizationid": organizationid, "usertypeid": { $ne: "5cd291290c23960c5411b7dd" } }
                    } else {
                        var params = { "usertypeid": { $ne: "5cd291290c23960c5411b7dd" } };
                    }
                    return User.find(params).then(function (Item) {
                        Result.TotalUser = Item.length;
                    })
                }).then(function(){
                    return new bPromise(function(resolve, reject){
                       resolve(exports.GetDataByRoleType("FleetManager")); 
                    }).then(function(FleetManagerCount){
                        Result.FleetManager = FleetManagerCount.length;
                    })
                }).then(function(){
                    return new bPromise(function(resolve, reject){
                       resolve(exports.GetDataByRoleType("ChargingOperator")); 
                    }).then(function(ChargingOperatorCount){
                        Result.ChargingOperator = ChargingOperatorCount.length;
                    })
                }).then(function(){
                    return new bPromise(function(resolve, reject){
                       resolve(exports.GetDataByRoleType("Utility")); 
                    }).then(function(UtilityManagerCount){
                        Result.UtilityManager = UtilityManagerCount.length;
                    })
                }).then(function(){
                    return new bPromise(function(resolve, reject){
                       resolve(exports.GetDataByRoleType("SystemIntegrater")); 
                    }).then(function(SystemAggregatorCount){
                        Result.SystemAggregator = SystemAggregatorCount.length;
                        return Result; 
                    })
                }).then(function (Result) {
                    return Result;
                })
            })
        })
    }).catch(function (err) {
        throw new ErrorHelper.BadRequest("Something went wrong.", err);
    })
}


exports.GetDataByRoleType = function(RoleName){
    return Mastserroles.findOne({"rolename":RoleName}).then(function(RoleName){
        return RoleName
    }).then(function(Rolename){
        return Roleswrites.findOne({"roleid":Rolename._id}).then(function(RoleId){
            return RoleId;
        }).then(function(RoleId){
            return User.find({"roletype":{$in:[""+RoleId._id]}}).then(function(UserData){
                return UserData;
            })
        })
    }).catch(function(error){
        return error;
    }) 
}
exports.GetChargingStationGraph = function () {
    var result = { "FreeStation": "" }
    return ChargerStation.find().then(function (Data) {
        result.FreeStation = Data.length
        return result;
    }).then(function (Item) {
        return Item
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}


exports.GetChargingStationGraphAdmin = function (OrganizationId) {

}

exports.getVehicleDistanceChartData = function (AuthData, params) {
    /* var FromDate = new Date();
     var todate = new Date(FromDate);
     todate.setDate(todate.getDate() - 7);
     return Telemetrylog.find({ "datetime": { $gte: todate, $lt: FromDate } }).populate('userid').populate('vehicleid').then(function (Item) {
         return bPromise.map(Item, function (Data) {
             return {
                 "date": moment(Data.datetime).format("YYYY-MM-DD"),
                 "distance": "20",
                 "vehiclename": Data.vehicleid.name
             }
         })
     }).catch(function (error) {
         throw new ErrorHelper.BadRequest("Something went wrong.", error);
     })
     */
    var finalData = {
        "Categories": [],
        "Series": []
    }
    var nameList = [];
    var whereparame = {};
    if (params.searchType == "D") {
        whereparame = {
            "time": {
                $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().format(),
            }
        }
		finalData.Title = "Vehicle Distance Graph [" + moment().utc().format("DD MMM, YYYY") + " 06:00 AM to 05:00 PM]"
        finalData.Categories = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00'];
        var hoursList = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
        hoursList.push(0);
        hoursList.push(1);
        hoursList.push(2);
        hoursList.push(3);
        hoursList.push(4);
        hoursList.push(5);
    } else if (params.searchType == "W") {
        whereparame = {
            "time": {
                $gt: moment().utc().startOf('week').format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt:moment().utc().endOf('week').format("YYYY-MM-DD"),
            }
        }
		finalData.Title = "Vehicle Distance Graph [" + moment().utc().startOf('week').format("DD MMM, YYYY") + " to " + moment().utc().endOf('week').format("DD MMM, YYYY") + "]"
		finalData.Categories = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		// var CategoriesNums = [];
		// finalData.Categories = [];
		// for(var i = 0; i < 7; i++){
			// if(i > 0){
				// var getDayIndex = moment().utc().subtract((i + 1), "days").day();
			// } else {
				// var getDayIndex = moment().day();
			// }
			// CategoriesNums.push(getDayIndex);
			// finalData.Categories.push(Categories[getDayIndex])
		// }
		
		// whereparame.isWeekEnd = true;
    } else if (params.searchType == "M") {
        whereparame = {
            "time": {
                $gt: moment().utc().startOf('month').format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().endOf('month').format(),
            }
        }
		finalData.Title = "Vehicle Distance Graph [" + moment().utc().startOf('month').format("DD MMM, YYYY") + " to " + moment().utc().endOf('month').format("DD MMM, YYYY") + "]"
        finalData.Categories = [];
        for (var i = 0; i < moment().utc().endOf("month").format("DD"); i++) {
            finalData.Categories.push((i + 1));
        }
    } else if (params.searchType == "Y") {
        whereparame = {
            "time": {
                $gt: moment().utc().startOf('year').format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().endOf('year').format(),
            }
        }
		finalData.Title = "Vehicle Distance Graph [" + moment().utc().startOf('year').format("DD MMM, YYYY") + " to " + moment().utc().endOf('year').format("DD MMM, YYYY") + "]"
        finalData.Categories = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];;
		// whereparame.isMonthEnd = true;
    }

    whereparame.vehicleid = { $exists: true, $ne: null }
    //whereparame.userid = { $exists: true, $ne: null }
	if(AuthData.username=="Superadmin"){
       var vehilcewhereparams = {}
   }else{
       var vehilcewhereparams =
       {"organizationid":AuthData.organizationid}
   }
    return Evehicle.find(vehilcewhereparams).then(function(vehicleData){
        return bPromise.map(vehicleData,function(VehicleItem){
            whereparame.vehicleid = ObjectId("" + VehicleItem._id);
			console.log("whereparame whereparame", whereparame)
            return VehiclechartModel.find(whereparame).sort({
                _id: -1
            }).then(function (Item) {
                return bPromise.map(Item, function (Data) {
                    if (params.searchType == "D") {
                        var getDayIndex = hoursList.indexOf(parseInt(moment(Data.time).hours()));
                        var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        if (VehicleItem) {
                            //var jsonData = JSON.parse(Data.json);
                            var getIndex = nameList.indexOf(VehicleItem.name);
                            if (getIndex == -1) {
                                finalData.Series.push({
                                    "name": VehicleItem.name + "[" + VehicleItem.vehiclenumber + "]",
                                    "data": data
                                })
                                nameList.push(VehicleItem.name);
                                //finalData.Series[(nameList.length - 1)].data[getDayIndex] = parseFloat(jsonData.TDT);
                                finalData.Series[(nameList.length - 1)].data[getDayIndex] = parseFloat(Data.tdt);
                            } else {
                                if (finalData.Series[getIndex]) {
                                    //finalData.Series[getIndex].data[getDayIndex] = parseFloat(finalData.Series[getIndex].data[getDayIndex]) + parseFloat(jsonData.TDT);;
                                    //finalData.Series[getIndex].data[getDayIndex] = parseFloat(jsonData.TDT);
                                    finalData.Series[getIndex].data[getDayIndex] = parseFloat(Data.tdt);
                                }
                            }
                        }
                    } else if (params.searchType == "W") {
                        var getDayIndex = moment(Data.time).day();
						//var getDayIndex = CategoriesNums.indexOf(getDayIndex);
						console.log(Data.time);
                        var data = [0, 0, 0, 0, 0, 0, 0];
                        if (VehicleItem) {
                            //var jsonData = JSON.parse(Data.json);
                            var getIndex = nameList.indexOf(VehicleItem.name);
        
                            if (getIndex == -1) {
                                finalData.Series.push({
                                    "name": VehicleItem.name + "[" + VehicleItem.vehiclenumber + "]",
                                    "data": data
                                })
                                nameList.push(VehicleItem.name);
                                //finalData.Series[(nameList.length - 1)].data[getDayIndex] = parseFloat(jsonData.TDT);
                                finalData.Series[(nameList.length - 1)].data[getDayIndex] = parseFloat(Data.tdt);
                            } else {
                                if (finalData.Series[getIndex]) {
                                    //finalData.Series[getIndex].data[getDayIndex] = parseFloat(finalData.Series[getIndex].data[getDayIndex]) + parseFloat(jsonData.TDT);;
                                    //finalData.Series[getIndex].data[getDayIndex] = parseFloat(jsonData.TDT);
                                    finalData.Series[getIndex].data[getDayIndex] = parseFloat(Data.tdt);
                                }
                            }
                        }
                    } else if (params.searchType == "M") {
                        var getDayIndex = moment(Data.time).utc().format("DD");
                        var data = [];
                        for (var i = 0; i < moment().utc().endOf("month").format("DD"); i++) {
                            data.push(0);
                        }
                        if (VehicleItem) {
                            //var jsonData = JSON.parse(Data.json);
                            var getIndex = nameList.indexOf(VehicleItem.name);
        
                            if (getIndex == -1) {
                                finalData.Series.push({
                                    "name": VehicleItem.name + "[" + VehicleItem.vehiclenumber + "]",
                                    "data": data
                                })
                                nameList.push(VehicleItem.name);
                                //finalData.Series[(nameList.length - 1)].data[getDayIndex] = parseFloat(jsonData.TDT);
                                finalData.Series[(nameList.length - 1)].data[getDayIndex] = parseFloat(Data.tdt);
                            } else {
                                if (finalData.Series[getIndex]) {
                                    //finalData.Series[getIndex].data[getDayIndex] = parseFloat(finalData.Series[getIndex].data[getDayIndex]) + parseFloat(jsonData.TDT);;
                                    //finalData.Series[getIndex].data[getDayIndex] = parseFloat(jsonData.TDT);
                                    finalData.Series[getIndex].data[getDayIndex] = parseFloat(Data.tdt);
                                }
                            }
                        }
                    } else if (params.searchType == "Y") {
        
                        var getDayIndex = moment(Data.time).month();
                        var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        if (VehicleItem) {
                            //var jsonData = JSON.parse(Data.json);
                            var getIndex = nameList.indexOf(VehicleItem.name);
                            if (getIndex == -1) {
                                finalData.Series.push({
                                    "name": VehicleItem.name + "[" + VehicleItem.vehiclenumber + "]",
                                    "data": data
                                })
                                nameList.push(VehicleItem.name);
                                //finalData.Series[(nameList.length - 1)].data[getDayIndex] = parseFloat(jsonData.TDT);
                                finalData.Series[(nameList.length - 1)].data[getDayIndex] = parseFloat(Data.tdt);
                            } else {
                                if (finalData.Series[getIndex]) {
                                    //finalData.Series[getIndex].data[getDayIndex] = parseFloat(finalData.Series[getIndex].data[getDayIndex]) + parseFloat(jsonData.TDT);;
                                    finalData.Series[getIndex].data[getDayIndex] = parseFloat(Data.tdt);
                                }
                            }
                        }
                    }
                    return Data;
                }).then(function (data) {
                    //console.log("finalData ============ ", finalData)
                    return finalData;
                    //return data;
                })
            }).catch(function (error) {
                //throw new ErrorHelper.BadRequest("Something went wrong.", error);
                throw error;
            })      
        })
    })
}

exports.getVehicleUtilitiesChartData = function (AuthData, params) {
    /* var FromDate = new Date();
     var todate = new Date(FromDate);
     todate.setDate(todate.getDate() - 7);
     return Telemetrylog.find({ "datetime": { $gte: todate, $lt: FromDate } }).populate('userid').populate('vehicleid').then(function (Item) {
         return bPromise.map(Item, function (Data) {
             return {
                 "date": moment(Data.datetime).format("YYYY-MM-DD"),
                 "distance": "20",
                 "vehiclename": Data.vehicleid.name
             }
         })
     }).catch(function (error) {
         throw new ErrorHelper.BadRequest("Something went wrong.", error);
     })
     */
    var finalData = {
        "Categories": [],
        "Series": []
    }
    var nameList = [];
    var whereparame = {};
    if (params.searchType == "D") {
        // whereparame = {
            // "time": {
                // $gt: moment().subtract(4, "days").utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
                // $lt: moment().add(1, 'days').utc().format(),
            // }
        // }
		
		whereparame = {
            "time": {
                $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().format(),
            }
        }
        finalData.Categories = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00'];
        var hoursList = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
        hoursList.push(0);
        hoursList.push(1);
        hoursList.push(2);
        hoursList.push(3);
        hoursList.push(4);
        hoursList.push(5);
    }

    whereparame.vehicleid = { $exists: true, $ne: null }
    //whereparame.userid = { $exists: true, $ne: null }
	if(AuthData.username=="Superadmin"){
       var vehilcewhereparams = {}
   }else{
       var vehilcewhereparams =
       {"organizationid":AuthData.organizationid}
   }

    return Evehicle.find(vehilcewhereparams).then(function(vehicleData){
		console.log("vehicleData", vehicleData);
        return bPromise.map(vehicleData,function(VehicleItem){
            whereparame.vehicleid = ObjectId("" + VehicleItem._id);
            return Telemetrylog.find(whereparame).sort({
                time: 1
            }).then(function (Item) {
				
                return bPromise.map(Item, function (Data) {
                    if (params.searchType == "D") {
                        var getDayIndex = hoursList.indexOf(parseInt(moment(Data.time).hours()));
                        var start = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        var end = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        var diff = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        if (VehicleItem) {
                            var jsonData = JSON.parse(Data.json);
                            var getIndex = nameList.indexOf(VehicleItem.name);
                            if (getIndex == -1) {
                                finalData.Series.push({
                                    "name": VehicleItem.name + "[" + VehicleItem.vehiclenumber + "]",
                                    "start": start,
									"end": end,
									"diff": diff
                                })
                                nameList.push(VehicleItem.name);
                                finalData.Series[(nameList.length - 1)].start[getDayIndex] = parseFloat(jsonData.TDT);
								finalData.Series[(nameList.length - 1)].end[getDayIndex] = 0;
								
								var end = finalData.Series[(nameList.length - 1)].end[getDayIndex];
								var start = finalData.Series[(nameList.length - 1)].start[getDayIndex];
								finalData.Series[(nameList.length - 1)].diff[getDayIndex] = end - start;
                            } else {
								if (finalData.Series[getIndex]) {
									finalData.Series[getIndex].end[getDayIndex] = parseFloat(jsonData.TDT);
									finalData.Series[getIndex].start[(getDayIndex + 1)] = parseFloat(jsonData.TDT);
									var end = finalData.Series[getIndex].end[getDayIndex];
									var start = finalData.Series[getIndex].start[(getDayIndex)];
									finalData.Series[getIndex].diff[getDayIndex] = end - start;
                                }
                            }
                        }
                    }
                    return Data;
                }).then(function (data) {
					
					var vehicledata = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
					return bPromise.map(finalData.Series, function(item){
						return bPromise.all(item.diff).each(function(sData, index){
							if((item.start[index] > 0 || item.end[index] > 0)){
								if(sData > 0){
									vehicledata[index] = vehicledata[index] + 1;
								}
							}
							return sData;
						}).then(function(io){
							item.vehicledata = vehicledata;
							return item;
						});
					})
				}).then(function (data) {
                    //console.log("finalData ============ ", finalData)
					 var SeriesTotalData = [];
					 var SeriesRunningData = [];
					 //return data
					if(data.length > 0){
						SeriesRunningData = data[0].vehicledata;
						for(var i = 0; i < SeriesRunningData.length; i++){
							SeriesTotalData.push(data.length);
						}
					}
						
					var newData = {
						"Categories": finalData.Categories,
						"Series": [
						  {
							"name": "Total Vehicle",
							"type": "column",
							"yAxis": 1,
							"data": SeriesTotalData,
							"tooltip": {
							  "valueSuffix": "w"
							}
						  },
						  {
							"name": "Running Vehicle",
							"type": "column",
							"data": SeriesRunningData,
							"tooltip": {
							  "valueSuffix": "w"
							}
						  }
						]
					  }
                    return newData;
                    //return data;
                })
            }).catch(function (error) {
                //throw new ErrorHelper.BadRequest("Something went wrong.", error);
                throw error;
            })      
        })
    })
}


exports.getVehicleRevanueChartData = function (AuthData, params) {
    
    var finalData = {
        "Categories": [],
        "Series": []
    }
    var nameList = [];
    var whereparame = {};
    if (params.searchType == "D") {
        whereparame = {
            "time": {
                $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().format(),
            }
        }
		finalData.Title = "Vehicle Revanue Graph [" + moment().utc().startOf('week').format("DD MMM, YYYY") + " 06:00 AM to 5:00 PM]"
        finalData.Categories = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00'];
        var hoursList = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
        hoursList.push(0);
        hoursList.push(1);
        hoursList.push(2);
        hoursList.push(3);
        hoursList.push(4);
        hoursList.push(5);
    } else if (params.searchType == "W") {
        whereparame = {
            "time": {
                $gt: moment().utc().startOf("week").format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().endOf("week").format(),
            }
        }
		finalData.Title = "Vehicle Revanue Graph [" + moment().utc().startOf('week').format("DD MMM, YYYY") + " to " + moment().utc().endOf('week').format("DD MMM, YYYY") + "]"
        finalData.Categories = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        //whereparame.isWeekEnd = true;
    } else if (params.searchType == "M") {
        whereparame = {
            "time": {
                $gt: moment().utc().startOf('month').format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().endOf('month').format(),
            }
        }
		finalData.Title = "Vehicle Revanue Graph [" + moment().utc().startOf('month').format("DD MMM, YYYY") + " to " + moment().utc().endOf('month').format("DD MMM, YYYY") + "]"
        finalData.Categories = [];
        for (var i = 0; i < moment().utc().endOf("month").format("DD"); i++) {
            finalData.Categories.push((i + 1));
        }
    } else if (params.searchType == "Y") {
        whereparame = {
            "time": {
                $gt: moment().utc().startOf('year').format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().endOf('year').format(),
            }
        }
		finalData.Title = "Vehicle Revanue Graph [" + moment().utc().startOf('year').format("DD MMM, YYYY") + " to " + moment().utc().endOf('year').format("DD MMM, YYYY") + "]"
        //whereparame.isMonthEnd = true;
        finalData.Categories = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];;
    }

    //whereparame.vehiclenumber = { $exists: true, $ne: null }
    //whereparame.userid = { $exists: true, $ne: null }
	if(AuthData.username=="Superadmin"){
       var vehilcewhereparams = {}
   }else{
       var vehilcewhereparams =
       {"organizationid":AuthData.organizationid}
   }
   console.log(vehilcewhereparams)
    return Evehicle.find(vehilcewhereparams).then(function(vehicleData){
        return bPromise.map(vehicleData,function(VehicleItem){
            whereparame.vehicleid = ObjectId("" + VehicleItem._id);
			
			console.log("whereparame ", whereparame);
			
            return VehiclechartModel.find(whereparame).sort({
                _id: -1
            }).then(function (Item) {
				//console.log("Item Item ", Item);
                return bPromise.map(Item, function (Data) {
					console.log("Data Data ", Data);
                    if (params.searchType == "D") {
                        var getDayIndex = hoursList.indexOf(parseInt(moment(Data.time).hours()));
                        var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        if (VehicleItem) {
                            var getIndex = nameList.indexOf(VehicleItem.name);
        
                            if (getIndex == -1) {
                                finalData.Series.push({
                                    "name": VehicleItem.name + "[" + VehicleItem.vehiclenumber + "]",
                                    "data": data
                                })
                                nameList.push(VehicleItem.name);
                                finalData.Series[(nameList.length - 1)].data[getDayIndex] = parseFloat(Data.revenue);
                            } else {
                                if (finalData.Series[getIndex]) {
                                    //finalData.Series[getIndex].data[getDayIndex] = parseFloat(finalData.Series[getIndex].data[getDayIndex]) + parseFloat(Data.paidamount);;
                                    finalData.Series[getIndex].data[getDayIndex] = parseFloat(Data.revenue);
                                }else{
                                    finalData.Series[getIndex].data[getDayIndex] = 0;
                                }
                            }
                        }
                    } else if (params.searchType == "W") {
                        var getDayIndex = moment(Data.time).day();
                        var data = [0, 0, 0, 0, 0, 0, 0];
                        if (VehicleItem) {
                            var getIndex = nameList.indexOf(VehicleItem.name);
        
                            if (getIndex == -1) {
                                finalData.Series.push({
                                    "name": VehicleItem.name + "[" + VehicleItem.vehiclenumber + "]",
                                    "data": data
                                })
                                nameList.push(VehicleItem.name);
                                finalData.Series[(nameList.length - 1)].data[getDayIndex] = parseFloat(Data.revenue);
                            } else {
                                if (finalData.Series[getIndex]) {
                                    //finalData.Series[getIndex].data[getDayIndex] = parseFloat(finalData.Series[getIndex].data[getDayIndex]) + parseFloat(Data.paidamount);;
                                    finalData.Series[getIndex].data[getDayIndex] = parseFloat(Data.revenue);
                                }else{
                                    finalData.Series[getIndex].data[getDayIndex] = 0;
                                }
                            }
                        }
                    } else if (params.searchType == "M") {
                        var getDayIndex = moment(Data.time).utc().format("DD");
                        var data = [];
                        for (var i = 0; i < moment().utc().endOf("month").format("DD"); i++) {
                            data.push(0);
                        }
                        if (VehicleItem) {
                            var getIndex = nameList.indexOf(VehicleItem.name);
        
                            if (getIndex == -1) {
                                finalData.Series.push({
                                    "name": VehicleItem.name + "[" + VehicleItem.vehiclenumber + "]",
                                    "data": data
                                })
                                nameList.push(VehicleItem.name);
                                finalData.Series[(nameList.length - 1)].data[getDayIndex] = parseFloat(Data.revenue);
                            } else {
                                if (finalData.Series[getIndex]) {
                                    //finalData.Series[getIndex].data[getDayIndex] = parseFloat(finalData.Series[getIndex].data[getDayIndex]) + parseFloat(Data.paidamount);;
                                    finalData.Series[getIndex].data[getDayIndex] = parseFloat(Data.revenue);
                                }else{
                                    finalData.Series[getIndex].data[getDayIndex] = 0;
                                }
                            }
                        }
                    } else if (params.searchType == "Y") {
        
                        var getDayIndex = moment(Data.time).month();
                        var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        if (VehicleItem) {
                            var getIndex = nameList.indexOf(VehicleItem.name);
                            if (getIndex == -1) {
                                finalData.Series.push({
                                    "name": VehicleItem.name + "[" + VehicleItem.vehiclenumber + "]",
                                    "data": data
                                })
                                nameList.push(VehicleItem.name);
                                finalData.Series[(nameList.length - 1)].data[getDayIndex] = parseFloat(Data.revenue);
                            } else {
                                if (finalData.Series[getIndex]) {
                                    //finalData.Series[getIndex].data[getDayIndex] = parseFloat(finalData.Series[getIndex].data[getDayIndex]) + parseFloat(Data.paidamount);;
                                    finalData.Series[getIndex].data[getDayIndex] = parseFloat(Data.revenue);
                                }else{
                                    finalData.Series[getIndex].data[getDayIndex] = 0;
                                }
                            }
                        }
                    }
                    return Data;
                })
            }).then(function (data) {
                //console.log("finalData ============ ", finalData)
                return finalData;
                //return data;
            }).catch(function (error) {
                //throw new ErrorHelper.BadRequest("Something went wrong.", error);
                throw error;
            })
        })
    }) 
    
}


exports.getVehicleTypes = function () {
    return VehicleType.find().then(function (Item) {
        return Item;vehiclechartadddata
    }).catch(function (err) {
        throw new ErrorHelper.BadRequest("Something went wrong.", err);
    })
}

exports.getVehicleDistance = function (UserId) {
    return Evehicle.find(UserId).then(function (Item) {
        return Item;
    }).catch(function (err) {
        throw new ErrorHelper.BadRequest("Something went wrong.", err);
    })
}

exports.generateVehicleRevenueLog = function (params) {
    var saveparams = new VehicleTravelRevenue(params)
    return saveparams.save().then(function (Item) {
        if (Item) {
            return Item;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", err);
    })
}


/*********Service for Get Assigned Vehicle Data */
exports.GetAssignedVehicleData = function (Authparams) {
    var VehicleDataItem = []
    return LoginLog.find({
        "userid": Authparams._id,
        "vehicleid": { $exists: true },
        'logindatetime': {
            $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
            $lt: moment().utc().format(),
        },
        "isauthenticated": true
    }).sort({ _id: -1 }).then(function (VehicleAssignedData) {
        if (VehicleAssignedData.length > 0) {
            return bPromise.all(VehicleAssignedData).each(function (VehicleData) {
                return Evehicle.findOne({ _id: VehicleData.vehicleid }).then(function (VehicleItem) {
                    VehicleDataItem.push({ "name": VehicleItem.name, "isauthenticated": VehicleData.isauthenticated, "islogout": VehicleData.islogout, "deviceid": VehicleData.deviceid, "userid": VehicleData.userid })
                })
            }).then(function () {
                return VehicleDataItem;
            })
        } else {
            var Data = "";
            return Data;
        }
    }).catch(function (error) {
        if (error) {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        }
    })
}

/**************************** */
exports.GetTempTestBatteryData = function () {
    return Telemetrylogtemp.find().sort({ _id: -1 }).then(function (TempBatteryData) {
        if (TempBatteryData) {
            return TempBatteryData;
        } else {
            var TempBatteryData = [];
            return TempBatteryData;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}

exports.GetBatteryAlaramData = function () {
    return Telemetrylog.find().sort({ _id: -1 }).then(function (BatteryDataAlaram) {
        if (BatteryDataAlaram) {
            return TempBatteryData;
        } else {
            var TempBatteryData = [];
            return TempBatteryData;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}

exports.GetVehicleReport = function (params) {
    var whereparams = {
        'telemetryboardid': params.telemetryboardid,
        'time': {
            $gt: moment(params.from).utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
            $lte: moment(params.to).utc().format()
        }
    }
	
    return Telemetrylog.find(whereparams).sort({ time: 1 })
        .then(function (BatteryData) {
            return BatteryData;
        })
        .catch(function (error) {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        })
}


exports.HubVehicleList = function (Id) {
    return Evehicle.find({ "hubid": Id }).then(function (VehicleList) {
        if (VehicleList) {
            return VehicleList
        } else {
            var VehicleList = [];
            return VehicleList;
        }
    }).catch(function (error) {
        return error;
    })
}
/**********************Service for GetVehicleUtilizationFactorGraph */
exports.GetVehicleUtilizationFactorGraph = function(AuthData){
    var Result = {"RunningVehicle":"","ActiveVehicle":""}
    var whereparams = {
        "organizationid":AuthData.organizationid
    }
    return Evehicle.find(whereparams).then(function(VehicleData){
        var livedatacount = 0;
        return bPromise.map(VehicleData,function(VehicleItem){
            var whereparams = {
                "telemetryboardid":VehicleItem.telemetryboardid
            }
            return Telemetrylog.findOne(whereparams).then(function(LiveData){
                if(LiveData){
                    livedatacount++;
                }
                Result.RunningVehicle = livedatacount;
                //return Result
            })
        })
    }).then(function(){
        return LoginLog.find({
            'logindatetime': {
                $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().format(),
            },
            "isauthenticated": true
        }).then(function (Item) {
            Result.ActiveVehicle = Item.length
        })
    }).then(function(){
        console.log("=============Result",Result)
    }).catch(function(error){
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}

exports.GetTodaysVehicleData = function (params) {
    var whereparams = {
        'vehicleid': { $in: params.vehicleids },
        'time': {
            $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
            $lte: moment().utc().format(),
        }
    }

    return Telemetrylog.find(whereparams).sort({ _id: 1 })
        .then(function (BatteryData) {
            return BatteryData;
        })
        .catch(function (error) {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        })
}

exports.GetTodaysVehicleRevanueData = function (params) {
    var whereparams = {
        'vehicleid': { $in: params.vehicleids },
        'startdatetime': {
            $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
            $lte: moment().utc().format(),
        }
    }
	
	return VehicleTravelRevenue.find(whereparams).sort({ _id: 1 })
        .then(function (data) {
            return data;
        })
        .catch(function (error) {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        })
}

exports.VehiclechartAddData = function(data){
	return VehiclechartModel.insertMany(data)
        .then(function (data) {
            return data;
        })
        .catch(function (error) {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        })
}