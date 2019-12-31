import { ChargerSocket } from '../models/chargersocket';
import { ChargerStation } from '../models/chargerstation';
import { ChargerSocketLog } from '../models/chargersocketlog';
import { ChargingStationLiveData } from '../models/chargingstationlivedata';
import { ChargingStationLiveDataTemp } from '../models/chargingstationlivedatatemp';
import { ChargingLog } from '../models/charginglog';
import { Telemetrylog } from '../models/telemetrylog';
import { VehicleTravelRevenue, ObjectId } from '../models/vehicletravelrevenuelog';
import { Evehicle } from '../models/evehicle';
import { Mastserroles } from '../models/masterroles';
import { Organization } from '../models/organization';
import { Roleswrites } from '../models/roleswrites';
import { LoginLog } from '../models/loginlog';
import { User } from '../models/user';
var config = require('../../config');
var distance = require('google-distance');
var ErrorHelper = require('../helpers/errortypes-helper');
var moment = require('moment');
var bPromise = require('bluebird');
var FCM = require('fcm-node');
import * as AppConfig from '../../config';
import { Organizations } from 'aws-sdk';
//handle CreateChargerSockets action
exports.CreateChargerSockets = function (params) {
    var myData = new ChargerSocket(params);
    return myData.save().then(function (item) {
        return item
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

//handle CreateChargerStations action
exports.CreateChargerStations = function (params) {
    var myData = new ChargerStation(params);
    return myData.save().then(function (item) {
        return item
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

//handle CreateChargerSocketLogs action
exports.CreateChargerSocketLogs = function (params) {
    var param = {
        "datetime": params.datetime,
        "chargersocketid": params.chargersocketid,
        "isblocked": params.isblocked,
        "blockingreason": params.blockingreason,
        "blockedby": params.blockedby
    }
    var myData = new ChargerSocketLog(param);
    return myData.save().then(function (item) {
        return item
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

//handle ChargerStationList action
exports.ChargerStationList = function (params) {
    if (params.sorttype == "distance") {
        var mysort = { lat: 1 }
        var stationid = [];
        var testinfgData = [];
        var finaddsl = []
        return ChargerStation.find().populate('stationid').sort(mysort).then(function (StationLivedata) {
            return bPromise.all(StationLivedata).each(function (StationData) {
                testinfgData = StationData;
                return ChargingStationLiveData.findOne({ 'cs_id': StationData.chargerstationid }).sort({ _id: -1 }).then(function (LiveData) {
                    stationid = LiveData
                    finaddsl.push({ "stationData": testinfgData, "stationliveData": stationid })

                })
            }).then(function () {
                return finaddsl;
            })

        }).catch(function (error) {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        })
    } else if (params.sorttype == "tariff") {
        var mysort = { unitprice: 1 };
        var stationid = [];
        var testinfgData = [];
        var finaddsl = []
        return ChargerStation.find().populate('stationid').sort(mysort).then(function (StationLivedata) {
            return bPromise.all(StationLivedata).each(function (StationData) {
                testinfgData = StationData;
                return ChargingStationLiveData.findOne({ 'cs_id': StationData.chargerstationid }).sort({ _id: -1 }).then(function (LiveData) {
                    stationid = LiveData
                    finaddsl.push({ "stationData": testinfgData, "stationliveData": stationid })

                })
            }).then(function () {
                return finaddsl;
            })

        }).catch(function (error) {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        })
    } else if (params.sorttype == "port") {
        var mysort = { totalPowerSlotFree: 1 };
        var stationid = [];
        var testinfgData = [];
        var finaddsl = []
        return ChargerStation.find().populate('stationid').sort({ _id: -1 }).then(function (StationLivedata) {

            return bPromise.all(StationLivedata).each(function (StationData) {
                testinfgData = StationData;
                return ChargingStationLiveData.findOne({ 'cs_id': StationData.chargerstationid }).sort({ _id: -1 }).then(function (LiveData) {
                    stationid = LiveData
                    finaddsl.push({ "stationData": testinfgData, "stationliveData": stationid })

                })
            }).then(function () {
                return finaddsl;
            })

        }).catch(function (error) {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        })
    } else {
        var stationid = [];
        var testinfgData = [];
        var finaddsl = []
        return ChargerStation.find().populate('stationid').sort({ _id: -1 }).then(function (StationLivedata) {
            return bPromise.all(StationLivedata).each(function (StationData) {
                testinfgData = StationData;
                return ChargingStationLiveData.findOne({ 'cs_id': StationData.chargerstationid }).sort({ _id: -1 }).then(function (LiveData) {
                    console.log("chargerStationDetails================", LiveData)
                    stationid = LiveData
                    finaddsl.push({ "stationData": testinfgData, "stationliveData": stationid })

                })
            }).then(function () {
                return finaddsl;
            })


        }).catch(function (error) {
            console.log("I am error", error)
            //throw new ErrorHelper.BadRequest("Something went wrong.", error);
        })
    }

}

//handle getChargerStationData action
exports.getChargerStationData = function (params) {
    var FleetUserData = ""
    if (params.status == "active") {
        var whereparams = {
            "isactive": true
        }
    } else if (params.status == "inactive") {
        var whereparams = {
            "isactive": false
        }
    } else {
        var whereparams = {}
    }
    return ChargerStation.find(whereparams).populate('zoneid').populate('city').sort({ name: 1 }).then(function (stationData) {
        var Result = []
        return bPromise.map(stationData, function (stationDataList) {
            return new Promise(function (resolve, reject) {
                resolve(exports.GetFleetUserData(stationDataList.fleetmanager))
            }).then(function (FleetUser) {
                FleetUserData = FleetUser;
                return new Promise(function (resolve, reject) {
                    resolve(exports.GetChargingOperatorUserData(stationDataList.chargingoperator))
                }).then(function (ChargingOperator) {
                    return new Promise(function (resolve, reject) {
                        resolve(exports.GetZonalManagerUserData(stationDataList.zonalmanager))
                    }).then(function (zonalmanager) {
                        return {
                            "_id": stationDataList._id,
                            "stationname": stationDataList.name,
                            "baseprice": stationDataList.baseprice,
                            "unitprice": stationDataList.unitprice,
                            "zonename": stationDataList.zoneid.name,
                            "fleetuser": (FleetUser[0]) ? FleetUser[0] : "",
                            "isactive": stationDataList.isactive,
                            "chargingoperator": (ChargingOperator[0]) ? ChargingOperator[0] : "",
                            "zonalmanager": (zonalmanager[0]) ? zonalmanager[0] : "",
                            "city": stationDataList.city.name,
                            "bleid": stationDataList.ble_id,
                            "blename": stationDataList.blenmae,
                            "lat": (stationDataList.lat) ? stationDataList.lat : 0,
                            "long": (stationDataList.long) ? stationDataList.long : 0,
                        }
                    })
                })
            })
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
    })
}



exports.GetFleetUserData = function (Id) {
    var FleetUserInfo = [];
    if (Id) {
        return User.findOne({ _id: Id }).then(function (FleetUser) {
            FleetUserInfo.push({ "userid": FleetUser._id, "firstname": FleetUser.firstname, "lastname": FleetUser.lastname })
        }).then(function () {
            return FleetUserInfo;
        })
    } else {
        return false;
    }
}

exports.GetChargingOperatorUserData = function (Id) {
    var ChargingoperatorInfo = [];
    if (Id) {
        return User.findOne({ _id: Id }).then(function (ChargingOperator) {
            ChargingoperatorInfo.push({ "userid": ChargingOperator._id, "firstname": ChargingOperator.firstname, "lastname": ChargingOperator.lastname })
        }).then(function () {
            return ChargingoperatorInfo;
        })
    } else {
        return false;
    }
}

exports.GetZonalManagerUserData = function (Id) {
    var ChargingoperatorInfo = [];
    if (Id) {
        return User.findOne({ _id: Id }).then(function (ChargingOperator) {
            ChargingoperatorInfo.push({ "userid": ChargingOperator._id, "firstname": ChargingOperator.firstname, "lastname": ChargingOperator.lastname })
        }).then(function () {
            return ChargingoperatorInfo;
        })
    } else {
        return false;
    }
}

//handle CreateChargingLogs action
exports.CreateChargingLogs = function (params) {
    var whereparams = {
        "chargerterminalid": params.chargerstationid,
        "number": params.number
    }
    return ChargerSocket.findOne(whereparams).then(function (Item) {
        if (Item) {
            var param = {
                "datetimeofcharging": moment(params.datetimeofcharging),
                "chargersocketid": Item._id,
                "telementoryboardid": params.telementoryboardid
            }
            var Data = new ChargingLog(param);
            return Data.save().then(function (Item) {
                return Item;
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
            })
        }
    })
}

exports.ChargingCompleted = function (params) {
    var whereparams = {
        "chargersocketid": params.chargersocketid,
        "telementoryboardid": params.telementoryboardid
    }
    var mysort = { _id: -1 };
    return ChargingLog.findOne(whereparams).sort(mysort).then(function (Item) {
        if (Item) {
            var updateparam = {
                "totalchargeunit": params.totalchargeunit,
                "paidamount": params.paidamount
            }
            return ChargingLog.updateOne({ "_id": Item._id }, { $set: updateparam }).then(function (Item) {
                return Item;
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
            })
        }
    })
}

//handle CreateBatteryLog action
exports.CreateBatteryLog = function (params) {
    var Data = new Telemetrylog(params);
    return Data.save().then(function (Item) {
        return Item;
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
    })
}

//handle UpdateChargerSation action
exports.UpdateChargerSation = function (Id, updateparams) {
    if (Id) {
        return ChargerStation.find({ _id: Id }).then(function (Data) {
            if (Data) {
                return ChargerStation.updateOne({ "_id": Id }, { $set: updateparams }).then(function (Item) {
                })
            } else {
                throw new ErrorHelper.BadRequest("Something went wrong.", error);
            }
        }).catch(function (error) {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        })
    } else {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    }

}

//handle UpdateChargerSockets action
exports.UpdateChargerSockets = function (Id, updateparams) {
    if (Id) {
        return ChargerSocket.find({ _id: Id }).then(function (Data) {
            if (Data) {
                return ChargerSocket.updateOne({ "_id": Id }, { $set: updateparams }).then(function (Item) {
                    return Item;
                })
            } else {
                throw new ErrorHelper.BadRequest("Something went wrong.", error);
            }
        }).catch(function (error) {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        })
    } else {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    }
}

//handle CreateTelemetryLog action
exports.CreateTelemetryLog = function (params, LoginData) {
    return Evehicle.findOne({ "telemetryboardid": params.telemetryboardid }).then(function (Item) {
        if (Item) {
            return User.findOne({ "_id": LoginData._id }).then(function (UserData) {
                if (UserData) {
                    var whereparams = {
                        "userid": UserData._id,
                        "mobilenumber": UserData.contactno,
                        "isauthenticated": true
                    }
                    return LoginLog.findOne(whereparams).then(function (LoginUserData) {
                        if (LoginUserData) {
                            var tellogparams = {
                                "telemetryboardid": params.telemetryboardid,
                                "vehicleid": LoginUserData.vehicleid,
                                "userid": LoginUserData.userid,
                                "mobilenumber": LoginUserData.mobilenumber,
                                "datetime": moment(params.datetime).format(),
                                "tokennumber": (params.tokennumber) ? params.tokennumber : false,
                                "bv": (params.bv) ? params.bv : false,
                                "lv": (params.lv) ? params.lv : false,
                                "bi": (params.bi) ? params.bi : false,
                                "ti": (params.ti) ? params.ti : false,
                                "ts": (params.ts) ? params.ts : false,
                                "soc": (params.soc) ? params.soc : false,
                                "soh": (params.soh) ? params.soh : false,
                                "chr": (params.chr) ? params.chr : false,
                                "dhr": (params.dhr) ? params.dhr : false,
                                "ckw": (params.ckw) ? params.ckw : false,
                                "dkw": (params.dkw) ? params.dkw : false,
                                "tdt": (params.tdt) ? params.tdt : false,
                                "cah": (params.cah) ? params.cah : false,
                                "dah": (params.dah) ? params.dah : false,
                                "tcc": (params.tcc) ? params.tcc : false,
                                "lng": (params.lng) ? params.lng : false,
                                "lat": (params.lat) ? params.lat : false,
                                "aid": (params.aid) ? params.aid : false,
                                "dpt": (params.dpt) ? params.dpt : false,
                                "al1": (params.al1) ? params.al1 : false,
                                "al2": (params.al2) ? params.al2 : false
                            }
                            var TelemetrylogData = new Telemetrylog(tellogparams);
                            return TelemetrylogData.save().then(function (Item) {
                                return Item;
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
                                    throw new ErrorHelper.BadRequest("Something went wrong.", "error");
                                }
                            })
                        } else {
                            throw new ErrorHelper.BadRequest("Something went wrong.", "error");
                        }
                    })
                } else {
                    throw new ErrorHelper.BadRequest("Something went wrong.", "error");
                }
            })
        } else {
            throw new ErrorHelper.BadRequest("Something went wrong.", "error");
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}

//handle CreateChargerStationLiveData action
//handle CreateChargerStationLiveData action
exports.CreateChargerStationLiveData = function (params) {
    return ChargerStation.findOne({ "chargerstationid": params.cs_id }).then(function (StationId) {
        if (StationId) {
            return ChargingStationLiveDataTemp.findOne({
                "chargerstationid": params.cs_id
            }).sort({
                datetime: -1
            }).then(function (lastData) {
                if (lastData) {
                    var whereSocketLog = {};
                    whereSocketLog.chargerstationid = StationId._id;
                    whereSocketLog.endtime = { $exists: false };

                    if (lastData.s1_sts == 2 && params.s1_sts == 1) {
                        whereSocketLog.port = 1;
                    } else if (lastData.s2_sts == 2 && params.s2_sts == 1) {
                        whereSocketLog.port = 2;
                    } else if (lastData.s3_sts == 2 && params.s3_sts == 1) {
                        whereSocketLog.port = 3;
                    }

                    whereSocketLog.datetime = {
                        $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
                        $lte: moment().utc().format()
                    }

                    var updateparams = {
                        "isactive": false,
                        "endtime": moment().utc().format()
                    }

                    return ChargerSocket.findOne(whereSocketLog).sort({ starttime: -1 }).then(function (SocketData) {
                        if (SocketData) {
                            return ChargerSocket.updateOne(whereSocketLog, { $set: updateparams }, { new: true }).sort({ starttime: -1 }).then(function (updatesocketData) {
                                return updatesocketData
                            }).then(function (updatesocketData) {
                                //return ChargerSocket.findOne(whereSocketLog).sort({ starttime: -1 }).then(function (SocketData) {
                                return User.findOne({ _id: SocketData.userid }).then(function (UserData) {
                                    var SERVER_API_KEY = AppConfig.FIREBASE_SERVER_KEY;
                                    var fcm = new FCM(SERVER_API_KEY);
                                    var payloadMulticast = {
                                        registration_ids: [UserData.firebasetoken],
                                        priority: 'high',
                                        content_available: true,
                                        data: {
                                            "message": "your vehicle charging done. "
                                        },
                                    };
                                    fcm.send(payloadMulticast, function (err, res) {
                                        if (err) {
                                            return true;
                                        } else {
                                            return true;
                                        }
                                    });
                                });
                                //});
                            });
                        } else {
                            return false;
                        }
                    });
                }
            }).then(function () {
                params.stationid = StationId._id;
                var param = {
                    "stationid": (StationId._id) ? StationId._id : false,
                    "cs_id": (params.cs_id) ? params.cs_id : false,
                    "em_v1": (params.em_v1) ? params.em_v1 : false,
                    "em_v2": (params.em_v2) ? params.em_v2 : false,
                    "em_v3": (params.em_v3) ? params.em_v3 : false,
                    "em_l1": (params.em_l1) ? params.em_l1 : false,
                    "em_l2": (params.em_l2) ? params.em_l2 : false,
                    "em_l3": (params.em_l3) ? params.em_l3 : false,
                    "em_i1": (params.em_i1) ? params.em_i1 : false,
                    "em_i2": (params.em_i2) ? params.em_i2 : false,
                    "em_i3": (params.em_i3) ? params.em_i3 : false,
                    "em_p1": (params.em_p1) ? params.em_p1 : false,
                    "em_p2": (params.em_p2) ? params.em_p2 : false,
                    "em_p3": (params.em_p3) ? params.em_p3 : false,
                    "em_e1": (params.em_e1) ? params.em_e1 : false,
                    "em_e2": (params.em_e2) ? params.em_e2 : false,
                    "em_e3": (params.em_e3) ? params.em_e3 : false,
                    "s1_sts": (params.s1_sts) ? params.s1_sts : false,
                    "s2_sts": (params.s2_sts) ? params.s2_sts : false,
                    "s3_sts": (params.s3_sts) ? params.s3_sts : false,
                    "hlt_sts": (params.hlt_sts) ? params.hlt_sts : false,
                    "ble_id": (params.ble_id) ? params.ble_id : false,
                    "emg_sts": (params.emg_sts) ? params.emg_sts : false,
                    "json": JSON.stringify(params)
                }
                var chargerLiveData = new ChargingStationLiveData(param)
                return chargerLiveData.save().then(function (Item) {
                    return Item;

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
                        throw new ErrorHelper.BadRequest("Something went wrong.", "error");
                    }
                })
            });
            // return ChargerSocket.findOne({ "chargerstationid": StationId._id, "endtime": { $exists: false } }).sort({ _id: -1 }).then(function (SocketData) {
            //     if ((params.s1_sts == 2 && SocketData.port == 1) || (params.s2_sts == 2 && SocketData.port == 1) || (params.s3_sts == 2 && SocketData.port == 1)) {
            //         var updateparams = {
            //             "isactiv": false,
            //             "endtime": moment().utc().format()
            //         }
            //         var whereparams = {
            //             "_id": SocketData._id
            //         }
            //         return ChargerSocket.updateOne(whereparams, { $set: updateparams }, { new: true }).then(function (updatesocketData) {
            //             return updatesocketData
            //         }).then(function (updatesocketData) {
            //             return User.findOne({ _id: SocketData.userid }).then(function (UserData) {
            //                 var SERVER_API_KEY = AppConfig.FIREBASE_SERVER_KEY;
            //                 var fcm = new FCM(SERVER_API_KEY);
            //                 var payloadMulticast = {
            //                     registration_ids: [UserData.firebasetoken],
            //                     priority: 'high',
            //                     content_available: true,
            //                     data: {
            //                         "message": "your vehicle charging done. "
            //                     },
            //                 };
            //                 fcm.send(payloadMulticast, function (err, res) {
            //                     if (err) {
            //                         return true;
            //                     } else {
            //                         return true;
            //                     }
            //                 });
            //             })
            //         })
            //     } else {
            //         return false;
            //     }
            // })

        } else {
            var param = {
                "cs_id": (params.cs_id) ? params.cs_id : false,
                "em_v1": (params.em_v1) ? params.em_v1 : false,
                "em_v2": (params.em_v2) ? params.em_v2 : false,
                "em_v3": (params.em_v3) ? params.em_v3 : false,
                "em_l1": (params.em_l1) ? params.em_l1 : false,
                "em_l2": (params.em_l2) ? params.em_l2 : false,
                "em_l3": (params.em_l3) ? params.em_l3 : false,
                "em_i1": (params.em_i1) ? params.em_i1 : false,
                "em_i2": (params.em_i2) ? params.em_i2 : false,
                "em_i3": (params.em_i3) ? params.em_i3 : false,
                "em_p1": (params.em_p1) ? params.em_p1 : false,
                "em_p2": (params.em_p2) ? params.em_p2 : false,
                "em_p3": (params.em_p3) ? params.em_p3 : false,
                "em_e1": (params.em_e1) ? params.em_e1 : false,
                "em_e2": (params.em_e2) ? params.em_e2 : false,
                "em_e3": (params.em_e3) ? params.em_e3 : false,
                "s1_sts": (params.s1_sts) ? params.s1_sts : false,
                "s2_sts": (params.s2_sts) ? params.s2_sts : false,
                "s3_sts": (params.s3_sts) ? params.s3_sts : false,
                "hlt_sts": (params.hlt_sts) ? params.hlt_sts : false,
                "emg_sts": (params.emg_sts) ? params.emg_sts : false,
                "ble_id": (params.ble_id) ? params.ble_id : false,
                "json": JSON.stringify(params)
            }
            var chargerLiveData = new ChargingStationLiveDataTemp(param)
            return chargerLiveData.save().then(function (Item) {
                return Item;
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
                    throw new ErrorHelper.BadRequest("Something went wrong.", "error");
                }
            })
        }
    })
}
/*
	exports.CreateChargerStationLiveData = function (params) {
    return ChargerStation.findOne({ "chargerstationid": params.cs_id }).then(function (StationId) {
        if (StationId) {
            return ChargerSocket.findOne({ "chargerstationid": StationId._id, "endtime": { $exists: false } }).sort({ _id: -1 }).then(function (SocketData) {
                if ((params.s1_sts == 2 && SocketData.port == 1) || (params.s2_sts == 2 && SocketData.port == 1) || (params.s3_sts == 2 && SocketData.port == 1)) {
                    var updateparams = {
                        "isactiv": false,
                        "endtime": moment().utc().format()
                    }
                    var whereparams = {
                        "_id": SocketData._id
                    }
                    return ChargerSocket.updateOne(whereparams, { $set: updateparams }, { new: true }).then(function (updatesocketData) {
                        return updatesocketData
                    }).then(function (updatesocketData) {
                        return User.findOne({ _id: SocketData.userid }).then(function (UserData) {
                            var SERVER_API_KEY = AppConfig.FIREBASE_SERVER_KEY;
                            var fcm = new FCM(SERVER_API_KEY);
                            var payloadMulticast = {
                                registration_ids: [UserData.firebasetoken],
                                priority: 'high',
                                content_available: true,
                                data: {
                                    "message": "your vehicle charging done. "
                                },
                            };
                            fcm.send(payloadMulticast, function (err, res) {
                                if (err) {
                                    return true;
                                } else {
                                    return true;
                                }
                            });
                        })
                    })
                } else {
                    return false;
                }
            }).then(function () {
                params.stationid = StationId._id;
                var param = {
                    "stationid": (StationId._id) ? StationId._id : false,
                    "cs_id": (params.cs_id) ? params.cs_id : false,
                    "em_v1": (params.em_v1) ? params.em_v1 : false,
                    "em_v2": (params.em_v2) ? params.em_v2 : false,
                    "em_v3": (params.em_v3) ? params.em_v3 : false,
                    "em_l1": (params.em_l1) ? params.em_l1 : false,
                    "em_l2": (params.em_l2) ? params.em_l2 : false,
                    "em_l3": (params.em_l3) ? params.em_l3 : false,
                    "em_i1": (params.em_i1) ? params.em_i1 : false,
                    "em_i2": (params.em_i2) ? params.em_i2 : false,
                    "em_i3": (params.em_i3) ? params.em_i3 : false,
                    "em_p1": (params.em_p1) ? params.em_p1 : false,
                    "em_p2": (params.em_p2) ? params.em_p2 : false,
                    "em_p3": (params.em_p3) ? params.em_p3 : false,
                    "em_e1": (params.em_e1) ? params.em_e1 : false,
                    "em_e2": (params.em_e2) ? params.em_e2 : false,
                    "em_e3": (params.em_e3) ? params.em_e3 : false,
                    "s1_sts": (params.s1_sts) ? params.s1_sts : false,
                    "s2_sts": (params.s2_sts) ? params.s2_sts : false,
                    "s3_sts": (params.s3_sts) ? params.s3_sts : false,
                    "hlt_sts": (params.hlt_sts) ? params.hlt_sts : false,
                    "ble_id": (params.ble_id) ? params.ble_id : false,
                    "emg_sts": (params.emg_sts) ? params.emg_sts : false,
                    "json": JSON.stringify(params)
                }
                var chargerLiveData = new ChargingStationLiveData(param)
                return chargerLiveData.save().then(function (Item) {
                    return Item;

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
                        throw new ErrorHelper.BadRequest("Something went wrong.", "error");
                    }
                })
            })

        } else {
            var param = {
                "cs_id": (params.cs_id) ? params.cs_id : false,
                "em_v1": (params.em_v1) ? params.em_v1 : false,
                "em_v2": (params.em_v2) ? params.em_v2 : false,
                "em_v3": (params.em_v3) ? params.em_v3 : false,
                "em_l1": (params.em_l1) ? params.em_l1 : false,
                "em_l2": (params.em_l2) ? params.em_l2 : false,
                "em_l3": (params.em_l3) ? params.em_l3 : false,
                "em_i1": (params.em_i1) ? params.em_i1 : false,
                "em_i2": (params.em_i2) ? params.em_i2 : false,
                "em_i3": (params.em_i3) ? params.em_i3 : false,
                "em_p1": (params.em_p1) ? params.em_p1 : false,
                "em_p2": (params.em_p2) ? params.em_p2 : false,
                "em_p3": (params.em_p3) ? params.em_p3 : false,
                "em_e1": (params.em_e1) ? params.em_e1 : false,
                "em_e2": (params.em_e2) ? params.em_e2 : false,
                "em_e3": (params.em_e3) ? params.em_e3 : false,
                "s1_sts": (params.s1_sts) ? params.s1_sts : false,
                "s2_sts": (params.s2_sts) ? params.s2_sts : false,
                "s3_sts": (params.s3_sts) ? params.s3_sts : false,
                "hlt_sts": (params.hlt_sts) ? params.hlt_sts : false,
                "emg_sts": (params.emg_sts) ? params.emg_sts : false,
                "ble_id": (params.ble_id) ? params.ble_id : false,
                "json": JSON.stringify(params)
            }
            var chargerLiveData = new ChargingStationLiveDataTemp(param)
            return chargerLiveData.save().then(function (Item) {
                return Item;
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
                    throw new ErrorHelper.BadRequest("Something went wrong.", "error");
                }
            })
        }
    })
}

*/

exports.getBleDeviceName = function (Id) {
    return ChargerStation.find({ "_id": Id }, { "telemetryboardname": 1 }, { "telemetryboardid": 1 }).then(function (Item) {
        return bPromise.map(Item, function (Data) {
            return Data;
        }).then(function (Item) {
            return Item;
        })
    })
}

//handle AllocateSocketToDriver action
exports.AllocateSocketToDriver = function (Id) {
    return ChargerSocket.find({ chargerterminalid: Id }).then(function (Data) {
        if (Data) {
            var updateparams = {
                "isavailable": false,
                "isactive": false
            }
            return ChargerSocket.updateOne({ "chargerterminalid": Id }, { $set: updateparams }).then(function (Item) {
                return Item;
            })
        } else {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}

//handle GetAllTravelHistoryData action
exports.GetAllTravelHistoryData = function (Authparams, params) {
    var Datecondition = "";
    var currentDate = "";
    if (params.type == "w" && !params.todate && !params.fromdate) {  //for w-week
        currentDate = moment().utc().format();
        Datecondition = moment(new Date()).utc().subtract(7, 'days').format();
    } else if (params.type == "m" && !params.todate && !params.fromdate) { // for m-month 
        currentDate = moment().utc().format();
        Datecondition = moment(new Date()).utc().subtract(30, 'days').format();
    }
    else if (params.type == "" || params.type == "undefined") {
        currentDate = moment().utc().format();
        Datecondition = moment(new Date()).utc().subtract(7, 'days').format();
    } else if (params.fromdate && params.todate) {
        Datecondition = moment(params.fromdate).utc().format();
        currentDate = moment(params.todate).utc().add(1, 'days').format();
    }

    return VehicleTravelRevenue.find({
        "startdatetime": {
            $gte: Datecondition
        },
        "enddatetime": {
            $lt: currentDate
        },
        "userid": Authparams._id
    }).sort({ "startdatetime": -1 }).populate('vehicleid').then(function (TelemetryLogData) {
        var finalData = [];
        return bPromise.map(TelemetryLogData, function (Item) {
            if (Item.vehicleid) {
                finalData.push({
                    "totaldistance": Item.distancetravelled,
                    "totalrevenue": Item.vehiclerevenue,
                    "vehicleno": Item.vehicleid.vehiclenumber,
                    "startdatetime": Item.startdatetime,
                    "enddatetime": Item.enddatetime
                });
            }
        }).then(function (Data) {
            return finalData;
        }).catch(function (error) {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        })
    })
}


exports.TravelHostoryMobile = function (Authparams, params) {
    var finalData = [];
    if (params.type == "w" && !params.todate && !params.fromdate) {  //for w-week

        var startdate = moment().utc().subtract(7, 'days').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        var end = moment().utc().subtract(1, 'days').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    } else if (params.type == "m" && !params.todate && !params.fromdate) { // for m-month

        var startdate = moment().utc().subtract(1, 'months').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        var end = moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    }
    else if (params.type == "" || params.type == "undefined") {

        var startdate = moment().utc().subtract(7, 'days').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        var end = moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    } else if (params.fromdate && params.todate) {

        var startdate = moment(params.fromdate).format("YYYY-MM-DD") + "T00:00:00.000Z";
        var end = moment(params.todate).utc().add(1, 'days').format();
    }
    return VehicleTravelRevenue.aggregate([
        { $match: { userid: ObjectId("" + Authparams._id) } },
        {
            $match: {
                "startdatetime": {
                    $gt: new Date(startdate),
                    $lte: new Date(end)
                }
            }
        },
        { $group: { _id: '$vehicleid', distancetravelled: { $sum: '$distancetravelled' }, vehiclerevenue: { $sum: '$vehiclerevenue' }, startdatetime: { $push: '$startdatetime' }, enddatetime: { $push: '$enddatetime' }, vehicleid: { $push: "$vehicleid" } } }]).then(function (TravleData) {
            return bPromise.map(TravleData, function (Item) {
                return Evehicle.findOne({ _id: Item.vehicleid[0] }).then(function (VehicleData) {
                    //console.log("VehicleData==============",VehicleData)
                    finalData.push({
                        "totaldistance": Item.distancetravelled,
                        "totalrevenue": Item.vehiclerevenue,
                        "vehicleno": (VehicleData) ? VehicleData.vehiclenumber : "",
                        "startdatetime": Item.startdatetime[0],
                        "enddatetime": Item.enddatetime[0]
                    });
                })
            }).then(function () {
                console.log("finalData=================", finalData)
                return finalData;
            })
        }).catch(function (error) {
            console.log("error=============", error)
        })
}

//handle getDistance action
exports.getDistance = function (start, end, decimals) {
    decimals = decimals || 2;
    var earthRadius = 6371; // km
    var lat1 = parseFloat(start.latitude);
    var lat2 = parseFloat(end.lat);
    var lon1 = parseFloat(start.longitude);
    var lon2 = parseFloat(end.lng);
    var dLat = (lat2 - lat1);
    var dLon = (lon2 - lon1)
    var lat1 = lat1
    var lat2 = lat2
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = earthRadius * c;
    var kilometer = Math.round(d * Math.pow(10, decimals)) / Math.pow(10, decimals);
    return kilometer.toFixed(2);
}

//handle ChargerStationDetails action
exports.chargerStationDetails = function (params, resolve, reject) {
    var stationId = "";
    var result = [];
    var Scoket1 = []
    var Scoket2 = []
    var Scoket3 = []
    var Scoket4 = []
    return ChargerStation.findOne({ "_id": params.Id }).populate('zoneid').then(function (Item) {
        if (Item) {
            return ChargingStationLiveData.findOne({ "cs_id": Item.chargerstationid }).sort({ _id: -1 }).then(function (ItemData) {
                if (ItemData) {
                    var LiveData = JSON.parse(ItemData.json);
                    stationId = LiveData.stationid;
                    if (parseFloat(LiveData.em_v1) < 200) {
                        Scoket1.push({ "message": "Low Voltage in R-Phase" })
                    }
                    if (parseFloat(LiveData.em_v1) > 270) {
                        Scoket1.push({ "message": "High Voltage in R-Phase" })
                    }
                    if (parseFloat(LiveData.em_p1) > 3.3 && parseFloat(LiveData.s1_sts) == 2) {
                        Scoket1.push({ "message": "Power limit exceeded in Socket 1" })
                    }
                    if (parseFloat(LiveData.s1_sts) == 6) {
                        Scoket1.push({ "message": "Socket 1 faulty" })
                    }
                    if (parseFloat(LiveData.em_l1) > 15 && parseFloat(LiveData.s1_sts) == 2) {
                        Scoket1.push({ "message": "Over load in Socket 1" })
                    }


                    if (parseFloat(LiveData.em_v2) < 200) {
                        Scoket2.push({ "message": "Low Voltage in R-Phase" })
                    }
                    if (parseFloat(LiveData.em_v2) > 270) {
                        Scoket2.push({ "message": "High Voltage in R-Phase" })
                    }
                    if (parseFloat(LiveData.em_p2) > 3.3 && parseFloat(LiveData.s2_sts) == 2) {
                        Scoket2.push({ "message": "Power limit exceeded in Socket 2" })
                    }
                    if (parseFloat(LiveData.s2_sts) == 6) {
                        Scoket2.push({ "message": "Socket 2 faulty" })
                    }
                    if (parseFloat(LiveData.em_l2) > 15 && parseFloat(LiveData.s2_sts) == 2) {
                        Scoket2.push({ "message": "Over load in Socket 2" })
                    }


                    if (parseFloat(LiveData.em_v3) < 200) {
                        Scoket3.push({ "message": "Low Voltage in R-Phase" })
                    }
                    if (parseFloat(LiveData.em_v3) > 270) {
                        Scoket3.push({ "message": "High Voltage in R-Phase" })
                    }
                    if (parseFloat(LiveData.em_p3) > 3.3 && parseFloat(LiveData.s3_sts) == 2) {
                        Scoket3.push({ "message": "Power limit exceeded in Socket 3" })
                    }
                    if (parseFloat(LiveData.s3_sts) == 6) {
                        Scoket3.push({ "message": "Socket 3 faulty" })
                    }
                    if (parseFloat(LiveData.em_l3) > 15 && parseFloat(LiveData.s3_sts) == 2) {
                        Scoket3.push({ "message": "Over load in Socket 3" })
                    }


                    if (parseFloat(LiveData.hlt_sts) == 9) {
                        Scoket4.push({ "message": "Partial System Fault" })
                    }
                    if (parseFloat(LiveData.hlt_sts) == 10) {
                        Scoket4.push({ "message": "Full System Fault" })
                    }
                    if (parseFloat(LiveData.emg_sts) == 11) {
                        Scoket4.push({ "message": "Emergency Fault." })
                    }
                    result.push({ "socket1": Scoket1, "socket2": Scoket2, "socket3": Scoket3, "socket4": Scoket4 })
                    resolve({
                        "_id": Item.get('_id'),
                        "name": Item.get('name'),
                        "lat": Item.get('lat'),
                        "long": Item.get('long'),
                        "addressLine1": Item.get('addressLine1'),
                        "addressLine2": (Item.get('addressLine2')) ? Item.get('addressLine2') : "",
                        "country": Item.get('country'),
                        "pincode": Item.get('pincode'),
                        "dateofestablishment": Item.get('dateofestablishment'),
                        //"currentlat": (params.lat) ? params.lat : "",
                        //"currentlng": (params.lng) ? params.lng : "",
                        "baseprice": Item.get('baseprice'),
                        "city": Item.get('city'),
                        "state": Item.get('state'),
                        "chargerstationid": (LiveData) ? LiveData : "",
                        "unitprice": Item.get('unitprice'),
                        "zoneid": Item.get('zoneid'),
                        "bleid": (Item.ble_id) ? Item.ble_id : "",
                        "blename": (Item.blenmae) ? Item.blenmae : "",
                        //"Distance": data,
                        "AlaramMessage": result
                    });
                } else {
                    resolve({
                        "_id": Item.get('_id'),
                        "name": Item.get('name'),
                        "lat": Item.get('lat'),
                        "long": Item.get('long'),
                        "addressLine1": Item.get('addressLine1'),
                        "addressLine2": Item.get('addressLine2'),
                        "country": Item.get('country'),
                        "pincode": Item.get('pincode'),
                        "dateofestablishment": Item.get('dateofestablishment'),
                        //"currentlat": (params.lat) ? params.lat : "",
                        //"currentlng": (params.lng) ? params.lng : "",
                        "baseprice": Item.get('baseprice'),
                        "city": Item.get('city'),
                        "state": Item.get('state'),
                        "chargerstationid": "",
                        "unitprice": Item.get('unitprice'),
                        "bleid": (Item.ble_id) ? Item.ble_id : "",
                        "blename": (Item.blenmae) ? Item.blenmae : "",
                        "zoneid": Item.get('zoneid'),
                        //"Distance": data,
                        "AlaramMessage": []
                    });
                }
            }).catch(function (error) {
                console.log("error", error)
            })
        } else {
            var Data = [];
            return Data
        }
    }).catch(function (error) {
        return error;
    })
}



exports.ChargerStationDetailsAPP = function (params, resolve, reject) {
    return ChargerStation.findOne({ "_id": params.Id }).populate('zoneid').then(function (Item) {
        if (Item) {
            return ChargingStationLiveData.findOne({ "cs_id": Item.chargerstationid }).sort({ _id: -1 }).then(function (ItemData) {
                if (ItemData) {
                    var LiveData = JSON.parse(ItemData.json);

                    distance.apiKey = config.GoogleAPIKey;
                    var o1 = '"' + Item.lat + ',' + Item.long + '"';
                    var d1 = '"' + params.lat + ',' + params.lng + '"';

                    return distance.get({ origin: [o1], destination: [d1] }, function (err, data) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                "_id": Item.get('_id'),
                                "name": Item.get('name'),
                                "lat": Item.get('lat'),
                                "long": Item.get('long'),
                                "addressLine1": Item.get('addressLine1'),
                                "addressLine2": Item.get('addressLine2'),
                                "country": Item.get('country'),
                                "pincode": Item.get('pincode'),
                                "dateofestablishment": Item.get('dateofestablishment'),
                                "currentlat": (params.lat) ? params.lat : "",
                                "currentlng": (params.lng) ? params.lng : "",
                                "baseprice": Item.get('baseprice'),
                                "city": Item.get('city'),
                                "state": Item.get('state'),
                                "chargerstationid": LiveData,
                                "unitprice": Item.get('unitprice'),
                                "bleid": Item.ble_id,
                                "zoneid": Item.get('zoneid'),
                                "bleid": (Item.ble_id) ? Item.ble_id : "",
                                "Distance": (data) ? data : { "distance": "0 KM", "duration": "0 minute" },
                            });
                        }
                    });
                } else {
                    resolve({
                        "_id": Item.get('_id'),
                        "name": Item.get('name'),
                        "lat": Item.get('lat'),
                        "long": Item.get('long'),
                        "addressLine1": Item.get('addressLine1'),
                        "addressLine2": Item.get('addressLine2'),
                        "country": Item.get('country'),
                        "pincode": Item.get('pincode'),
                        "dateofestablishment": Item.get('dateofestablishment'),
                        "currentlat": (params.lat) ? params.lat : "",
                        "currentlng": (params.lng) ? params.lng : "",
                        "baseprice": Item.get('baseprice'),
                        "city": Item.get('city'),
                        "state": Item.get('state'),
                        "chargerstationid": "",
                        "unitprice": Item.get('unitprice'),
                        "bleid": Item.ble_id,
                        "zoneid": Item.get('zoneid'),
                        "bleid": (Item.ble_id) ? Item.ble_id : "",
                        "Distance": (data) ? data : { "distance": "0 KM", "duration": "0 minute" },
                    });
                }
            })
        } else {
            var Data = [];
            return Data;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}

//handle SingleChargerStationDetails action
exports.SingleChargerStationDetails = function (params) {
    return ChargerStation.findOne({ "_id": params.Id }).populate('zoneid').then(function (Item) {
        return new Promise(function (resolve, reject) {
            resolve(exports.GetFleetUserData(Item.fleetmanager))
        }).then(function (FleetUser) {
            return new Promise(function (resolve, reject) {
                resolve(exports.GetChargingOperatorUserData(Item.chargingoperator))
            }).then(function (ChargingOperator) {
                return new Promise(function (resolve, reject) {
                    resolve(exports.GetZonalManagerUserData(Item.zonalmanager))
                }).then(function (zonalmanager) {
                    return {
                        "_id": Item.get('_id'),
                        "name": Item.get('name'),
                        "lat": Item.get('lat'),
                        "long": Item.get('long'),
                        "addressLine1": Item.get('addressLine1'),
                        "addressLine2": Item.get('addressLine2'),
                        "country": Item.get('country'),
                        "pincode": Item.get('pincode'),
                        "dateofestablishment": Item.get('dateofestablishment'),
                        "baseprice": Item.get('baseprice'),
                        "city": Item.get('city'),
                        "state": Item.get('state'),
                        "chargerstationid": Item.chargerstationid,
                        "unitprice": Item.get('unitprice'),
                        "bleid": (Item.ble_id) ? Item.ble_id : "",
                        "blename": (Item.blenmae) ? Item.blenmae : "",
                        "zoneid": Item.zoneid._id,
                        "fleetuserinfo": (FleetUser) ? FleetUser : "",
                        "chargingoperator": (ChargingOperator) ? ChargingOperator : "",
                        "zonalmanager": (zonalmanager) ? zonalmanager : ""
                    }
                })
            })
        })

    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}

exports.GetAllVehicleData = function () {
    return Evehicle.find().then(function (Data) {
        if (Data) {
            return Data
        } else {
            throw new ErrorHelper.BadRequest("Something went wrong.", error);
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}


exports.ChargingStationGraph = function () {
    var Result = { "TotalCharginStation": "", "TotalFaultStation": "" };
    var params = {
        "isactive": true,
    }
    return ChargerStation.find().populate('chargerterminalid').then(function (Item) {
        Result.TotalCharginStation = Item.length;
    }).then(function () {
        var params = {
            "isactive": false,
        }
        return ChargerSocket.find(params).populate('chargerterminalid').then(function (Item) {
            Result.TotalFaultStation = Item.length;
            return Result;
        }).then(function (Result) {
            return Result;
        })
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}

exports.GetChargingStationLiveData = function () {
    return ChargingStationLiveData.find().sort({
        _id: -1
    }).then(function (LiveData) {
        if (LiveData) {
            return LiveData;
        } else {
            var Data = []
            return Data;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}

/************Get Temp Charging Station live Data */

exports.GetTempChargerStationLiveData = function () {
    return ChargingStationLiveDataTemp.find().sort({
        _id: -1
    }).then(function (LiveData) {
        if (LiveData) {
            return LiveData;
        } else {
            var Data = []
            return Data;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}

/*****************Charging Station Port Start */
exports.StartChargingStationport = function (AuthData, Params) {
    var params = {
        "port": Params.port,
        "userid": AuthData._id,
        "chargerstationid": Params.chargerstationid,
        "vehicleid": Params.vehicleid,
        "starttime": moment().utc().format(),
        "bleaddress": Params.bleAddress
    }
    var startport = new ChargerSocket(params);
    return startport.save().then(function (PortData) {
        return PortData
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

/******************Get ChargingStationReport */
exports.GetChargingStationReport = function (params) {
    return ChargingStationLiveData.find({
        'cs_id': params.chargerstationid,
        'datetime': {
            $gt: moment(params.from).utc().format(),
            $lte: moment(params.to).utc().format()
        }
    }).sort({
        datetime: 1
    }).then(function (LiveData) {
        if (LiveData) {
            return LiveData;
        } else {
            var Data = []
            return Data;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}


/************************************ Get Charging Station Port */
exports.GetChargingStationPort = function (AuthData) {
    return ChargerSocket.findOne({ "userid": AuthData._id }).sort({ _id: -1 }).then(function (PortData) {
        if (PortData) {
            return PortData;
        } else {
            var PortData = [];
            return PortData;
        }
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}

/******************************************* */
exports.ActiveInActiveChargingStation = function (params) {
    var updateparams = {
        "isactive": params.isactive
    }
    return ChargerStation.updateOne({ _id: params.Id }, { $set: updateparams }, { new: true }).then(function (Item) {
        return Item;
    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}

/****************************************** */
exports.GetZoneChargingStation = function (params) {
    return ChargerStation.find({ zoneid: params.ZoneId }).then(function (Item) {
        if (Item.length > 0) {
            return Item;
        } else {
            var Item = [];
            return Item;
        }

    }).catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
}

//handle GetZonalManagerChargingStatinList action*/
exports.GetZonalManagerChargingStatinList = function (params) {
    var Result = [];
    if (params.organizationid) {
        var whereparams = {
            "organizationid": params.organizationid
        }
    } else {
        var whereparams = {
            "_id": params._id
        }
    }
    return User.find(whereparams).then(function (UserList) {
        if (UserList) {
            return bPromise.all(UserList).each(function (UserItem) {
                return ChargerStation.find({ "zonalmanager": UserItem._id }).populate('zoneid').populate('city').sort({ name: 1 }).then(function (stationDataList) {
                    if (stationDataList != null) {
                        Result.push(stationDataList);
                    }
                })
            }).then(function () {
                return Result;
            })
        } else {
            return Result;
        }
    }).catch(function (error) {
        return error
    })
}

exports.GetChargingStatinListByUserType = function (Authparams, params) {
    var Result = [];
    if (Authparams.organizationid) {
        var whereparams = {
            "organizationid": Authparams.organizationid
        }
    } else {
        var whereparams = {
            "_id": Authparams._id
        }
    }
    var UserType = params.usertype;
    var findParams = {};
    return User.find(whereparams).then(function (UserList) {
        if (UserList) {
            return bPromise.map(UserList,function (UserItem) {
                findParams[UserType] = UserItem._id;
                return ChargerStation.find(findParams).populate('zoneid').populate('city').sort({ name: 1 }).then(function (stationDataList) {
                    if (stationDataList) {
                        Result.push(stationDataList);
                    }
                })
            }).then(function () {
                return Result;
            })
        } else {
            return Result;
        }
    }).catch(function (error) {
        return error
    })
 }


/*************************** GetChargingStationEnergyChartData********************************/
exports.GetChargingStationEnergyChartData = function (Authparams, params) {
    if (Authparams.organizationid) {
        var userwhereparams = {
            "organizationid": Authparams.organizationid
        }
    } else {
        var userwhereparams = {
            "_id": Authparams._id
        }
    }

    var finalData = {
        "Categories": [],
        "Series": []
    }
    var nameList = [];
    var whereparame = {};
    if (params.searchType == "D") {
        whereparame = {
            "datetime": {
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
    } else if (params.searchType == "W") {
        whereparame = {
            "datetime": {
                $gt: moment().utc().subtract(7, "days").format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().format(),
            }
        }
        finalData.Categories = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    } else if (params.searchType == "M") {
        whereparame = {
            "datetime": {
                $gt: moment().utc().startOf('month').format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().endOf('month').format(),
            }
        }

        finalData.Categories = [];
        for (var i = 0; i < moment().utc().endOf("month").format("DD"); i++) {
            finalData.Categories.push((i + 1));
        }
    } else if (params.searchType == "Y") {
        whereparame = {
            "datetime": {
                $gt: moment().utc().startOf('year').format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().endOf('year').format(),
            }
        }
        finalData.Categories = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];;
    }


    var UserType = params.usertype;
    var findParams = {};

    whereparame.stationid = { $exists: true, $ne: null }
    return User.find(userwhereparams).then(function (UserItem) {
        return bPromise.map(UserItem, function (UserData) {
            findParams[UserType] = UserData._id;
            return ChargerStation.find(findParams).then(function (StationData) {
                return bPromise.map(StationData, function (Data) {
                    if (Data) {
                        return new bPromise(function (resolve, reject) {
                            resolve(exports.GetStationLiveData(Data.chargerstationid))
                        }).then(function (stationData) {
                            var jsonData = JSON.parse(stationData.json);
                            if (params.searchType == "D") {
                                var getDayIndex = hoursList.indexOf(parseInt(moment(Data.time).hours()));
                                var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                                if (Data) {
                                    var getIndex = nameList.indexOf(Data.name);

                                    if (getIndex == -1) {
                                        finalData.Series.push({
                                            "name": Data.name + "[" + Data.chargerstationid + "]",
                                            "data": data
                                        })
                                        nameList.push(Data.name);
                                        finalData.Series[(nameList.length - 1)].data[getDayIndex] = parseFloat(jsonData.em_e1) + parseFloat(jsonData.em_e2) + parseFloat(jsonData.em_e3);
                                    } else {
                                        if (finalData.Series[getIndex]) {
                                            finalData.Series[getIndex].data[getDayIndex] = parseFloat(jsonData.em_e1) + parseFloat(jsonData.em_e2) + parseFloat(jsonData.em_e3);
                                        }
                                    }
                                }
                            } else if (params.searchType == "W") {
                                var getDayIndex = moment(Data.time).day();
                                var data = [0, 0, 0, 0, 0, 0, 0];
                                if (Data) {
                                    var getIndex = nameList.indexOf(Data.name);

                                    if (getIndex == -1) {
                                        finalData.Series.push({
                                            "name": Data.name + "[" + Data.chargerstationid + "]",
                                            "data": data
                                        })
                                        nameList.push(Data.name);
                                        finalData.Series[(nameList.length - 1)].data[getDayIndex] = parseFloat(jsonData.em_e1) + parseFloat(jsonData.em_e2) + parseFloat(jsonData.em_e3);
                                    } else {
                                        if (finalData.Series[getIndex]) {
                                            finalData.Series[getIndex].data[getDayIndex] = parseFloat(jsonData.em_e1) + parseFloat(jsonData.em_e2) + parseFloat(jsonData.em_e3);
                                        }
                                    }
                                }
                            } else if (params.searchType == "M") {
                                var getDayIndex = moment(Data.time).month();
                                var data = [];
                                for (var i = 0; i < moment().utc().endOf("month").format("DD"); i++) {
                                    data.push(0);
                                }
                                if (Data) {
                                    var getIndex = nameList.indexOf(Data.name);

                                    if (getIndex == -1) {
                                        finalData.Series.push({
                                            "name": Data.name + "[" + Data.chargerstationid + "]",
                                            "data": data
                                        })
                                        nameList.push(Data.name);
                                        finalData.Series[(nameList.length - 1)].data[getDayIndex] = parseFloat(jsonData.em_e1) + parseFloat(jsonData.em_e2) + parseFloat(jsonData.em_e3);
                                    } else {
                                        if (finalData.Series[getIndex]) {
                                            finalData.Series[getIndex].data[getDayIndex] = parseFloat(jsonData.em_e1) + parseFloat(jsonData.em_e2) + parseFloat(jsonData.em_e3);
                                        }
                                    }
                                }
                            } else if (params.searchType == "Y") {
                                var getDayIndex = moment(Data.time).month();
                                var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                                if (Data) {
                                    var getIndex = nameList.indexOf(Data.name);
                                    if (getIndex == -1) {
                                        finalData.Series.push({
                                            "name": Data.name + "[" + Data.chargerstationid + "]",
                                            "data": data
                                        })
                                        nameList.push(Data.name);
                                        finalData.Series[(nameList.length - 1)].data[getDayIndex] = parseFloat(jsonData.em_e1) + parseFloat(jsonData.em_e2) + parseFloat(jsonData.em_e3);
                                    } else {
                                        if (finalData.Series[getIndex]) {
                                            finalData.Series[getIndex].data[getDayIndex] = parseFloat(jsonData.em_e1) + parseFloat(jsonData.em_e2) + parseFloat(jsonData.em_e3);
                                        }
                                    }
                                }
                            }
                            return Data;
                        })
                    }
                }).then(function (data) {
                    //ResultData.push(finalData)
                    return finalData;
                })

            })
        })
    })
}

/****************************************service for GetChargingStationRevanueChart */
exports.GetChargingStationRevanueChart = function (Authparams, params) {
    var ResultData = [];
    if (Authparams.organizationid) {
        var userwhereparams = {
            "organizationid": Authparams.organizationid
        }
    } else {
        var userwhereparams = {
            "_id": Authparams._id
        }
    }
    var finalData = {
        "Categories": [],
        "Series": []
    }
    var nameList = [];
    var whereparame = {};
    if (params.searchType == "D") {
        whereparame = {
            "starttime": {
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
    } else if (params.searchType == "W") {
        whereparame = {
            "starttime": {
                $gt: moment().utc().subtract(7, "days").format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().format(),
            }
        }
        finalData.Categories = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    } else if (params.searchType == "M") {
        whereparame = {
            "starttime": {
                $gt: moment().utc().startOf('month').format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().endOf('month').format(),
            }
        }

        finalData.Categories = [];
        for (var i = 0; i < moment().utc().endOf("month").format("DD"); i++) {
            finalData.Categories.push((i + 1));
        }
    } else if (params.searchType == "Y") {
        whereparame = {
            "starttime": {
                $gt: moment().utc().startOf('year').format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().endOf('year').format(),
            }
        }
        finalData.Categories = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];;
    }

    whereparame.stationid = { $exists: true, $ne: null }
    var UserType = params.usertype;
    var findParams = {};
    return User.find(userwhereparams).then(function (UserItem) {
        return bPromise.map(UserItem, function (UserData) {
            findParams[UserType] = UserData._id;
            return ChargerStation.find(findParams).then(function (StationData) {
                return bPromise.map(StationData, function (Data) {
                    if (Data) {
                        return new bPromise(function (resolve, reject) {
                            resolve(exports.GetStationLiveData(Data.chargerstationid))
                        }).then(function (stationData) {
                            var jsonData = JSON.parse(stationData.json);
                            if (params.searchType == "D") {
                                var getDayIndex = hoursList.indexOf(parseInt(moment(Data.time).hours()));
                                var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                                if (Data) {
                                    var getIndex = nameList.indexOf(Data.name);

                                    if (getIndex == -1) {
                                        finalData.Series.push({
                                            "name": Data.name + "[" + Data.chargerstationid + "]",
                                            "data": data
                                        })
                                        nameList.push(Data.name);
                                        finalData.Series[(nameList.length - 1)].data[getDayIndex] = (parseFloat(jsonData.em_e1) * parseFloat(Data.unitprice)) + parseFloat(Data.unitprice);
                                    } else {
                                        if (finalData.Series[getIndex]) {
                                            finalData.Series[getIndex].data[getDayIndex] = (parseFloat(jsonData.em_e1) * parseFloat(Data.unitprice)) + parseFloat(Data.unitprice);
                                        }
                                    }
                                }
                            } else if (params.searchType == "W") {
                                var getDayIndex = moment(Data.time).day();
                                var data = [0, 0, 0, 0, 0, 0, 0];
                                if (Data) {
                                    var getIndex = nameList.indexOf(Data.name);

                                    if (getIndex == -1) {
                                        finalData.Series.push({
                                            "name": Data.name + "[" + Data.chargerstationid + "]",
                                            "data": data
                                        })
                                        nameList.push(Data.name);
                                        finalData.Series[(nameList.length - 1)].data[getDayIndex] = (parseFloat(jsonData.em_e1) * parseFloat(Data.unitprice)) + parseFloat(Data.unitprice);
                                    } else {
                                        if (finalData.Series[getIndex]) {
                                            finalData.Series[getIndex].data[getDayIndex] = (parseFloat(jsonData.em_e1) * parseFloat(Data.unitprice)) + parseFloat(Data.unitprice);
                                        }
                                    }
                                }
                            } else if (params.searchType == "M") {
                                var getDayIndex = moment(Data.time).month();
                                var data = [];
                                for (var i = 0; i < moment().utc().endOf("month").format("DD"); i++) {
                                    data.push(0);
                                }
                                if (Data) {
                                    var getIndex = nameList.indexOf(Data.name);

                                    if (getIndex == -1) {
                                        finalData.Series.push({
                                            "name": Data.name + "[" + Data.chargerstationid + "]",
                                            "data": data
                                        })
                                        nameList.push(Data.name);
                                        finalData.Series[(nameList.length - 1)].data[getDayIndex] = (parseFloat(jsonData.em_e1) * parseFloat(Data.unitprice)) + parseFloat(Data.unitprice);
                                    } else {
                                        if (finalData.Series[getIndex]) {
                                            finalData.Series[getIndex].data[getDayIndex] = (parseFloat(jsonData.em_e1) * parseFloat(Data.unitprice)) + parseFloat(Data.unitprice);
                                        }
                                    }
                                }
                            } else if (params.searchType == "Y") {
                                var getDayIndex = moment(Data.time).month();
                                var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                                if (Data) {
                                    var getIndex = nameList.indexOf(Data.name);
                                    if (getIndex == -1) {
                                        finalData.Series.push({
                                            "name": Data.name + "[" + Data.chargerstationid + "]",
                                            "data": data
                                        })
                                        nameList.push(Data.name);
                                        finalData.Series[(nameList.length - 1)].data[getDayIndex] = (parseFloat(jsonData.em_e1) * parseFloat(Data.unitprice)) + parseFloat(Data.unitprice);
                                    } else {
                                        if (finalData.Series[getIndex]) {
                                            finalData.Series[getIndex].data[getDayIndex] = (parseFloat(jsonData.em_e1) * parseFloat(Data.unitprice)) + parseFloat(Data.unitprice);
                                        }
                                    }
                                }
                            }
                            return Data;
                        })
                    }
                }).then(function (data) {
                    //ResultData.push(finalData)
                    return finalData;
                })

            })
        })
    })
}

exports.GetStationLiveData = function (Id) {
    return ChargingStationLiveData.findOne({ "cs_id": Id }).sort({
        _id: -1
    }).then(function (Item) {
        return Item;
    }).catch(function (error) {
        throw error;
    })
}
exports.GetZonalManagerDashboard = function (params) {
    var Result = { "TotalStation": "", "FaultyStation": "", "WorkingStation": "" };
    if (params.organizationid) {
        var whereparams = {
            "organizationid": params.organizationid
        }
    } else {
        var whereparams = {
            "_id": params._id
        }
    }
    return User.find(whereparams).then(function (UserList) {
        if (UserList) {
            var totalStation = [];
            return bPromise.map(UserList, function (UserItem) {
                return ChargerStation.find({ "zonalmanager": UserItem._id }).then(function (stationDataList) {
                    if (stationDataList.length >= 1) {
                        totalStation.push(stationDataList.length)
                    }
                    return totalStation;
                }).then(function () {
                    Result.TotalStation = totalStation.toString();

                    var faultyStation = 0
                    var WorkingStation = 0;
                    return bPromise.map(totalStation, function (FaultyStation) {
                        return ChargingStationLiveData.findOne({ "cs_id": FaultyStation.chargerstationid }).then(function (Item) {
                            if (!Item) {
                                faultyStation++;
                                Result.FaultyStation = faultyStation;
                            } else {
                                WorkingStation++;
                                Result.WorkingStation = WorkingStation;
                            }
                            return Result
                        })
                    }).then(function () {
                        return Result;

                    })
                })
            })
        }
    }).catch(function (error) {
        console.log("error=============", error)
        return error
    })
}
exports.GetChargingOperatorDashboard = function (params) {
    var Result = { "TotalStation": "", "FaultyStation": "", "WorkingStation": "" };
    if (params.organizationid) {
        var whereparams = {
            "organizationid": params.organizationid
        }
    } else {
        var whereparams = {
            "_id": params._id
        }
    }
    return User.find(whereparams).then(function (UserList) {
        if (UserList) {
            var totalStation = [];
            return bPromise.map(UserList, function (UserItem) {
                return ChargerStation.find({ "chargingoperator": UserItem._id }).then(function (stationDataList) {
                    if (stationDataList.length >= 1) {
                        totalStation.push(stationDataList.length)
                    }
                    return totalStation;
                }).then(function () {
                    Result.TotalStation = totalStation.toString();
                    var faultyStation = 0
                    var WorkingStation = 0;
                    return bPromise.map(totalStation, function (FaultyStation) {
                        return ChargingStationLiveData.findOne({ "cs_id": FaultyStation.chargerstationid }).then(function (Item) {
                            if (!Item) {
                                faultyStation++;
                                Result.FaultyStation = faultyStation;
                            } else {
                                WorkingStation++;
                                Result.WorkingStation = WorkingStation;
                            }
                            return Result
                        })
                    }).then(function () {
                        return Result;

                    })
                })
            })
        }
    }).catch(function (error) {
        console.log("error=============", error)
        return error
    })
}

/*************************** Services for GetStationInstantaneousEnergyGraph */
exports.GetStationInstantaneousEnergyGraph = function () {
    var whereparame = {
        "datetime": {
            $gt: moment().utc().format(),
            //$lt:moment().utc().format(),
        }
    }
    var finalData = {
        "Categories": [],
        "Series": [],
    }
    return ChargingStationLiveData.find(whereparame).populate('stationid').then(function (ChargingStationData) {
        return bPromise.map(ChargingStationData, function (Item) {
            var jsonData = JSON.parse(Item.json);
            finalData.Categories.push(Item.stationid.name + "[" + Item.stationid.chargerstationid + "]");
            finalData.Series.push(parseFloat(jsonData.em_e1) + parseFloat(jsonData.em_e2) + parseFloat(jsonData.em_e3));
            return finalData;
        }).then(function () {
            return finalData;
        })
    }).catch(function (error) {
        throw error;
    })
}



/*******************Services for GetStationUtilizationGraph */
exports.GetStationUtilizationGraph = function (Authparams, params) {
    var ResultData = [];
    if (Authparams.organizationid) {
        var userwhereparams = {
            "organizationid": Authparams.organizationid
        }
    } else {
        var userwhereparams = {
            "_id": Authparams._id
        }
    }
    var finalData = {
        "Categories": [],
        "Series": []
    }
    var temptotalport = []
    var temphealthyport = [];
    var UserType = params.usertype;
    var findParams = {};
    return User.find(userwhereparams).then(function (UserItem) {
        return bPromise.map(UserItem, function (UserData) {
            findParams[UserType] = UserData._id;
            return ChargerStation.find(findParams).then(function (StationData) {
                return bPromise.map(StationData, function (Data) {
                    if (Data) {
                        var count = 0
                        var healtycount = 0;
                        return new bPromise(function (resolve, reject) {
                            resolve(exports.GetStationLiveData(Data.chargerstationid))
                        }).then(function (stationData) {
                            var jsonData = JSON.parse(stationData.json);
                            finalData.Categories.push(Data.name + "[" + Data.chargerstationid + "]")
                            if (jsonData.s1_sts == 1) {
                                count = count + 1;
                            }
                            if (jsonData.s2_sts == 1) {
                                count = count + 1;
                            }
                            if (jsonData.s3_sts == 1) {
                                count = count + 1;
                            }
                            temptotalport.push(count);

                            if (jsonData.s1_sts == 2) {
                                healtycount = healtycount + 1;
                            }
                            if (jsonData.s2_sts == 2) {
                                healtycount = healtycount + 1;
                            }
                            if (jsonData.s3_sts == 2) {
                                healtycount = healtycount + 1;
                            }

                            temphealthyport.push(healtycount);

                        })
                    }
                }).then(function (data) {
                    finalData.Series = [{
                        "name": "Total Port",
                        "type": 'column',
                        "yAxis": 1,
                        "data": temptotalport,
                        "tooltip": {
                            valueSuffix: 'w'
                        }
                    },
                    {
                        "name": "Healthy Port",
                        "type": 'column',
                        "data": temphealthyport,
                        "tooltip": {
                            valueSuffix: 'w'
                        }
                    }];
                    return finalData;
                })
            })
        })
    }).catch(function (error) {
        return error;
    })
}

/********************Services for get GetChargingSessionData  */
exports.GetChargingSessionData = function (params) {
    var finalData = {
        "Categories": [],
        "Series": [],
    }

    if (params.organizationid) {
        var whereparams = {
            "organizationid": params.organizationid
        }
    } else {
        var whereparams = {
            "_id": params._id
        }
    }
    return User.find(whereparams).then(function (UserDataItem) {
        return bPromise.map(UserDataItem, function (userItem) {
            return ChargerStation.find({ "chargingoperator": userItem._id }).then(function (SessionData) {
                return bPromise.map(SessionData, function (StationData) {
                    if (StationData) {
                        var whereparams = {
                            "endtime": {
                                $gt: moment().utc().format() + "T00:00:00.000Z",
                                $lte: moment().utc().format()
                            },
                            "chargerstationid": StationData._id,
                            "endtime": { $exists: true }
                        }
                        finalData.Categories.push(StationData.name + "[" + StationData.chargerstationid + "]");
                    }
                    return ChargerSocket.countDocuments(whereparams).then(function (SessionData) {
                        var temp = [];
                        if (SessionData > 0) {
                            temp.push(SessionData);
                            //ChargerSession.push({ "ChargerSession": SessionData })
                        } else {
                            SessionData[SessionData.length - 1] = 0
                        }
                        finalData.Series.push({
                            'data': temp
                        })

                    }).catch(function(error){
						throw error;
					})
                })
            })
        }).then(function () {
			console.log("finalData", finalData);
            return finalData
        }).catch(function(error){
			throw error;
		})
    }).catch(function(error){
		throw error;
	})
}


/***********************Services for GetChargingSessionTimeData */
exports.GetChargingSessionTimeData = function (Authparams, params) {
    var finalData = {
        "Categories": [],
        "Series": []
    }
    var nameList = [];
    var whereparame = {};
    if (params.searchType == "D") {
        whereparame = {
            "endtime": {
                $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().format(),

            }
            // ,
            // endtime : { $exists: true, $ne: null }
        }
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
            "endtime": {
                $gt: moment().utc().subtract(7, "days").format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().format(),

            }
        }
        finalData.Categories = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    } else if (params.searchType == "M") {
        whereparame = {
            "endtime": {
                $gt: moment().utc().startOf('month').format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().endOf('month').format(),

            }
        }

        finalData.Categories = [];
        for (var i = 0; i < moment().utc().endOf("month").format("DD"); i++) {
            finalData.Categories.push((i + 1));
        }
    } else if (params.searchType == "Y") {
        whereparame = {
            "endtime": {
                $gt: moment().utc().startOf('year').format("YYYY-MM-DD") + "T00:00:00.000Z",
                $lt: moment().utc().endOf('year').format(),

            }
        }
        finalData.Categories = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];;
    }
    whereparame.endtime = { $exists: true }
    return ChargerSocket.find(whereparame).populate('chargerstationid').sort({
        _id: -1
    }).then(function (Item) {
        return bPromise.map(Item, function (Data) {
            if (params.searchType == "D") {
                var getDayIndex = hoursList.indexOf(parseInt(moment(Data.time).hours()));
                var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                if (Data.chargerstationid) {
                    var getIndex = nameList.indexOf(Data.chargerstationid.name);
                    const date1 = new Date(Data.starttime);
                    const date2 = new Date(Data.starttime.endtime);
                    const diffTime = Math.abs(date2.getTime() - date1.getTime());
                    if (getIndex == -1) {
                        finalData.Series.push({
                            "name": Data.chargerstationid.name + "[" + Data.chargerstationid.chargerstationid + "]",
                            "data": data
                        })
                        nameList.push(Data.chargerstationid.name);
                        finalData.Series[(nameList.length - 1)].data[getDayIndex] = (diffTime) ? diffTime : 0;
                    } else {
                        if (finalData.Series[getIndex]) {
                            finalData.Series[getIndex].data[getDayIndex] = (diffTime) ? diffTime : 0;
                        }
                    }
                }
            } else if (params.searchType == "W") {
                var getDayIndex = moment(Data.time).day();
                var data = [0, 0, 0, 0, 0, 0, 0];
                if (Data.chargerstationid) {
                    var getIndex = nameList.indexOf(Data.chargerstationid.name);
                    const date1 = new Date(Data.starttime);
                    const date2 = new Date(Data.starttime.endtime);
                    const diffTime = Math.abs(date2.getTime() - date1.getTime());
                    if (getIndex == -1) {
                        finalData.Series.push({
                            "name": Data.chargerstationid.name + "[" + Data.chargerstationid.chargerstationid + "]",
                            "data": data
                        })
                        nameList.push(Data.chargerstationid.name);
                        finalData.Series[(nameList.length - 1)].data[getDayIndex] = diffTime;
                    } else {
                        if (finalData.Series[getIndex]) {
                            finalData.Series[getIndex].data[getDayIndex] = diffTime;
                        }
                    }
                }
            } else if (params.searchType == "M") {
                var getDayIndex = moment(Data.time).month();
                var data = [];
                for (var i = 0; i < moment().utc().endOf("month").format("DD"); i++) {
                    data.push(0);
                }
                if (Data.chargerstationid) {
                    var getIndex = nameList.indexOf(Data.chargerstationid.name);
                    const date1 = new Date(Data.starttime);
                    const date2 = new Date(Data.starttime.endtime);
                    const diffTime = Math.abs(date2.getTime() - date1.getTime());
                    if (getIndex == -1) {
                        finalData.Series.push({
                            "name": Data.chargerstationid.name + "[" + Data.chargerstationid.chargerstationid + "]",
                            "data": data
                        })
                        nameList.push(Data.chargerstationid.name);
                        finalData.Series[(nameList.length - 1)].data[getDayIndex] = diffTime;
                    } else {
                        if (finalData.Series[getIndex]) {
                            finalData.Series[getIndex].data[getDayIndex] = diffTime;
                        }
                    }
                }
            } else if (params.searchType == "Y") {
                var getDayIndex = moment(Data.time).month();
                var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                if (Data.chargerstationid) {
                    var getIndex = nameList.indexOf(Data.chargerstationid.name);
                    const date1 = new Date(Data.starttime);
                    const date2 = new Date(Data.starttime.endtime);
                    const diffTime = Math.abs(date2.getTime() - date1.getTime());
                    if (getIndex == -1) {
                        finalData.Series.push({
                            "name": Data.chargerstationid.name + "[" + Data.chargerstationid.chargerstationid + "]",
                            "data": data
                        })
                        nameList.push(Data.chargerstationid.name);
                        finalData.Series[(nameList.length - 1)].data[getDayIndex] = diffTime;
                    } else {
                        if (finalData.Series[getIndex]) {
                            finalData.Series[getIndex].data[getDayIndex] = diffTime;
                        }
                    }
                }
            }
            return Data;
        }).then(function (data) {
            return finalData;
        })
    }).catch(function (error) {
        throw error;
    })
}

/***************Service for GetChargingStationRationData */
exports.GetChargingStationRationData = function (Authparams, params) {
    var ResultData = [];
    if (Authparams.organizationid) {
        var userwhereparams = {
            "organizationid": Authparams.organizationid
        }
    } else {
        var userwhereparams = {
            "_id": Authparams._id
        }
    }
    var finalData = {
        "ratioofworkingstation": "",
        "totalchargingstation": ""
    }
    var temptotalport = []
    var temphealthyport = [];
    var UserType = params.usertype;
    var findParams = {};
    var totalstation = 0;
    return User.find(userwhereparams).then(function (UserItem) {
        return bPromise.map(UserItem, function (UserData) {
            findParams[UserType] = UserData._id;
            return ChargerStation.find(findParams).then(function (StationData) {
                return bPromise.map(StationData, function (Data) {
                    if (Data) {
                        var count = 0
                        var healtycount = 0;
                        totalstation++;
                        return new bPromise(function (resolve, reject) {
                            resolve(exports.GetStationLiveData(Data.chargerstationid))
                        }).then(function (stationData) {

                            var jsonData = JSON.parse(stationData.json);
                            //finalData.Categories.push(Data.name + "[" + Data.chargerstationid + "]")
                            if (jsonData.s1_sts == 1) {
                                count = count + 1;
                            }
                            if (jsonData.s2_sts == 1) {
                                count = count + 1;
                            }
                            if (jsonData.s3_sts == 1) {
                                count = count + 1;
                            }
                            temptotalport.push(count);

                            if (jsonData.s1_sts == 2) {
                                healtycount = healtycount + 1;
                            }
                            if (jsonData.s2_sts == 2) {
                                healtycount = healtycount + 1;
                            }
                            if (jsonData.s3_sts == 2) {
                                healtycount = healtycount + 1;
                            }
                            temphealthyport.push(healtycount);
                        })
                    }
                }).then(function (data) {
                    finalData.totalchargingstation = totalstation;
                    var a = parseFloat(temptotalport) / parseFloat(totalstation)
                    finalData.ratioofworkingstation = (a) ? a : 0;
                    //ResultData.push(finalData);
                    return finalData;
                })
            })
        })
    }).catch(function (error) {
        return error;
    })
}


/***********************Service for handling GetFleetManagerDashboardData */
exports.GetFleetManagerDashboardData = function (Authparams) {
    if (Authparams.organizationid) {
        var userwhereparams = {
            "organizationid": Authparams.organizationid
        }
    } else {
        var userwhereparams = {
            "_id": Authparams._id
        }
    }
    var finalData = {
        "VehicleLiveData": []
    }

    return Evehicle.find(userwhereparams).then(function (VehicleData) {
        return bPromise.map(VehicleData, function (VehicleDataItem) {
            var whereparams = {
                "telemetryboardid": VehicleDataItem.telemetryboardid
            }
            return Telemetrylog.findOne(whereparams).sort({ "time": -1 }).then(function (LiveData) {
                if (LiveData) {
                    finalData.VehicleLiveData.push(JSON.parse(LiveData.json));
                }
            })
        })
    }).then(function () {
        return finalData;
    }).catch(function (error) {
        return error;
    })
}