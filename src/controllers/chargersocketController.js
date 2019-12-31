// Import contact model';
var ChargersocketServices = require('../services/chargersocketServices');
var UserServices = require('../services/userServices');
var successHelper = require('../helpers/success.helper');
var errorsControllerHelper = require('../helpers/errors.controller.helper');
import { ChargerStation } from '../models/chargerstation';
import { ChargingStationLiveData } from '../models/chargingstationlivedata';
var moment = require('moment');
var bPromise = require('bluebird');
var geodist = require('geodist')
var config = require('../../config');
var distance = require('google-distance');
var excel = require('excel4node');

// Handle CreateChargerSocket actions
exports.CreateChargerSocket = function (req, res) {
    var params = {
        "number": (req.body.number) ? req.body.number : false,
        "isavailable": (req.body.isavailable) ? req.body.isavailable : false,
        "dateofestablishment": moment(req.body.dateofestablishment),
        "chargerterminalid": (req.body.chargerterminalid) ? req.body.chargerterminalid : false,
        "isactive": true
    }
    return ChargersocketServices.CreateChargerSockets(params).then(function (Data) {
        successHelper.returnSuccess(false, res, 200, "Charger socket created succcessfully!.", "");

    }).catch(function (error) {
        res.json({ "Status": error.status, "error": error.Data, "Message": error.Message });
    });
}


// Handle CreateChargerSation actions
exports.CreateChargerSation = function (req, res) {
    return ChargersocketServices.CreateChargerStations(req.body).then(function (Data) {
        if(Data){
            successHelper.returnSuccess(false, res, 200, "Charging station created succcessfully!.", Data);
        }else{
            successHelper.returnSuccess(false, res, 200, "Charging station created succcessfully!.", Data);
        }
        
    }).catch(function (error) {
        res.json({ "Status": error.status, "error": error.Data, "Message": error.Message });
    });
}

//handle CreateChargerSocketLog action
exports.CreateChargerSocketLog = function (req, res) {
    return ChargersocketServices.CreateChargerSocketLogs(req.body).then(function (Data) {
        successHelper.returnSuccess(false, res, 200, "Charger socketLog created succcessfully!.", Data);
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Error: error,
        }, res, 500);
    });
}

//handle ChargerStationMapList action
exports.ChargerStationMapList = function (req, res) {
    var params = req.body;
	var chargingStationPlot = [];
    /*temp code sitara starts*/
    return ChargersocketServices.ChargerStationList(params).then(function (Data) {
		console.log("Data Data Data Data", Data);
		
        return bPromise.map(Data, function (Item) {
            
            if (Item.stationData) {
                var count = 0
                //var busycount = 0
                var Distance = [];
                distance.apiKey = config.GoogleAPIKey;
                var o1 = '"' + Item.stationData.lat + ',' + Item.stationData.long + '"';
                var d1 = '"' + params.lat + ',' + params.lng + '"';
                return new Promise(function (resolve, reject) {
                    return distance.get({ origin: o1, destination: d1 }, function (err, data) {
						console.log("err============",err)
                        resolve(data);
                    });
                }).then(function (data) {
					console.log("Distance Distance Distance", Item)
                    Distance.push(data)
					if(Item.stationliveData){
						var FreeSlot = JSON.parse(Item.stationliveData.json)
						if (FreeSlot.s1_sts == 1) {
							count = count + 1;
						}
						if (FreeSlot.s2_sts == 1) {
							count = count + 1;
						}
						if (FreeSlot.s3_sts == 1) {
							count = count + 1;
						}
						chargingStationPlot.push({
							"_id": Item.stationData._id,
							"name": Item.stationData.name,
							"lat": Item.stationData.lat,
							"long": Item.stationData.long,
							"addressLine1": Item.stationData.addressLine1,
							"addressLine2": (Item.stationData.addressLine2) ? Item.stationData.addressLine2 : "",
							"country": Item.stationData.country,
							"pincode": Item.stationData.pincode,
							"dateofestablishment": Item.stationData.dateofestablishment,
							"telemetryboardid": Item.stationData.telemetryboardid,
							"totalPowerSlot": 3,
							"totalPowerSlotFree": count,
							"hlt_sts": FreeSlot.hlt_sts,
							"emg_sts": FreeSlot.emg_sts,
							"distance": (data)?data:{"distance":"0 KM","duration":"0 minute"},
							"baseprice": Item.stationData.baseprice,
							"unitprice": Item.stationData.unitprice,
							"stationtype": Item.stationData.stationtype,
							"chargerstationid": Item.stationData.chargerstationid,
							"tariff": Item.stationData.perunitprice,
							"bleid": Item.stationData.ble_id,
						})
						return chargingStationPlot;
					}
                })
            } else {
                
            }
        }).then(function (dist) {
            successHelper.returnSuccess(true, res, 200, "Charger station map list.", chargingStationPlot);
        })

    }).catch(function (error) {
		console.log("error");
		console.log("error");
		console.log("error");
		console.log(error);
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Error: error,
        }, res, 500);
    });
    /*temp code sitara ends */
}


exports.distance = function (lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") { dist = dist * 1.609344 }
        if (unit == "N") { dist = dist * 0.8684 }
        return dist.toFixed(2);
    }
}

//handle ChargerStationData action
exports.ChargerStationData = function (req, res) {
    var params = req.body
    return ChargersocketServices.getChargerStationData(params).then(function (Data) {
        Data.distance = 20;
        successHelper.returnSuccess(false, res, 200, "Charger station map list!.", Data);
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Error: error,
        }, res, 500);
    });
}

/**********************Get ZonalManager Charging Station list */

//handle CreateChargingLog action
exports.CreateChargingLog = function (req, res) {
    return ChargersocketServices.CreateChargingLogs(req.body).then(function (Data) {
        if(Data){
            successHelper.returnSuccess(false, res, 200, "Charger log created succcessfully!.", Data);
        }else{
            var Data = [];
            successHelper.returnSuccess(false, res, 200, "Charger log created succcessfully!.", Data);
        }
        
    }).catch(function (error) {
        res.json({ "Status": error.status, "error": error.Data, "Message": error.Message });
    });
}

//handle ChargingCompleted action
exports.ChargingCompleted = function (req, res) {
    return ChargersocketServices.ChargingCompleted(req.body).then(function (Data) {
        successHelper.returnSuccess(false, res, 200, "Charging Completed!.");
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Error: error,
        }, res, 500);
    });
}

//handle CreateVehicleData action
exports.CreateBatteryLogData = function (req, res) {
    return ChargersocketServices.CreateBatteryLog(req.body).then(function (Data) {
        successHelper.returnSuccess(false, res, 200, "VehicleData created succcessfully!.", Data);
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Error: error,
        }, res, 500);
    });
}

//handle GetVehicleData action
exports.GetVehicleData = function (req, res) {
    return ChargersocketServices.GetAllVehicleData().then(function (Data) {
        return bPromise.all(Data).each(function (Item) {
            var dist = geodist({ lat: Item.lat, lon: Item.lng });
        }).then(function (dist) {
            return ChargersocketServices.GetChargingLogData().then(function (Data) {
                successHelper.returnSuccess(false, res, 200, "VehicleData list.", dist);
            })
        })
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Error: error,
        }, res, 500);
    });
}

//handle UpdateChargerSation action
exports.UpdateChargerSation = function (req, res) {
    var ID = (req.params.Id) ? req.params.Id : false;
    var updateparams = req.body;
    return ChargersocketServices.UpdateChargerSation(ID, updateparams).then(function (Data) {
        successHelper.returnSuccess(false, res, 200, "Charger Station update successfully.");
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Error: error,
        }, res, 500);
    });
}

//handle UpdateChargerSocket action
exports.UpdateChargerSocket = function (req, res) {
    var ID = (req.params.Id) ? req.params.Id : false;
    var updateparams = req.body;
    return ChargersocketServices.UpdateChargerSockets(ID, updateparams).then(function (Data) {
        successHelper.returnSuccess(false, res, 200, "Charger Socket update successfully.");
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Error: error,
        }, res, 500);
    });
}

//handle TelemetryLog action
exports.TelemetryLog = function (req, res) {
    var LoginData = req.AuthData
    var params = req.body;
    return ChargersocketServices.CreateTelemetryLog(params, LoginData).then(function (Data) {
        successHelper.returnSuccess(false, res, 200, "Telemetry log created successfully.", Data);
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}

//handle CreateChargerStationLiveData action
exports.CreateChargerStationLiveData = function (req, res) {
    var bbb = {};
    for (var key in req.body) {
        bbb[key.toLowerCase()] = req.body[key];
    }
    var params = bbb;
    return ChargersocketServices.CreateChargerStationLiveData(params).then(function (Data) {
        if (Data) {
            return UserServices.getNotificationUserbychargingstation(params).then(function (Data1) {
                successHelper.returnSuccess(false, res, 200, "Charger Station Live Data created successfully.", Data);
            });
        } else {
            successHelper.returnSuccess(false, res, 200, "Data not found.");
        }
    }).catch(function (error) {
        console.log("error", error)
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: 'Not authorize.',
            Name: 'Not authorize.'
        }, res, 500)
    })
}

//handle SocketAllocationToDriver action
exports.SocketAllocationToDriver = function (req, res) {
    var Id = req.params.Id;
    return ChargersocketServices.AllocateSocketToDriver(Id).then(function (Data) {
        successHelper.returnSuccess(false, res, 200, "Socket Allocate to Driver.");
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: error,
            Name: 'Not authorize.'
        }, res, 500)
    })
}

//handle GetAllTravelHistory action
exports.GetAllTravelHistory11 = function (req, res) {
    var Authparams = req.AuthData;
    var params = req.body;
    return ChargersocketServices.GetAllTravelHistoryData(Authparams, params).then(function (Data) {
        successHelper.returnSuccess(false, res, 200, "Travel History Data.", Data);
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: error,
            Name: 'Not authorize.'
        }, res, 500)
    })
}


exports.GetAllTravelHistory = function(req, res){
   var Authparams = req.AuthData;
   var params = req.body;
   return ChargersocketServices.TravelHostoryMobile(Authparams,params).then(function (Data) {
       if(Data){
           successHelper.returnSuccess(false, res, 200, "Travel History Data.", Data);
       }else{
           var Data = [];
           successHelper.returnSuccess(false, res, 200, "Travel History Data.", Data);
       }
   }).catch(function (error) {
       return errorsControllerHelper.returnError({
           Succeeded: false,
           Status: 500,
           Message: error,
           Name: 'Not authorize.'
       }, res, 500)
   })
}

exports.ChargerStationDetails = function (req, res) {
    var params = req.body;
    return new Promise(function (resolve, reject) {
        return ChargersocketServices.chargerStationDetails(params, resolve, reject);
    }).then(function (result) {
        if (result) {
            console.log("controller")
            successHelper.returnSuccess(false, res, 200, "Charger Station Details.", result);
        } else {
            console.log("I am herer2")
            var result = [];
            successHelper.returnSuccess(false, res, 200, "Charger Station Details.", result);
        }

    }).catch(function (error) {
        console.log("controllererror==========", error)
    })
}


exports.ChargerStationDetailsAPP = function (req, res) {
    var params = req.body;
    return new Promise(function (resolve, reject) {
        return ChargersocketServices.ChargerStationDetailsAPP(params, resolve, reject);
    }).then(function (result) {
        if (result) {
            console.log("controller")
            successHelper.returnSuccess(false, res, 200, "Charger Station Details.", result);
        } else {
            console.log("I am herer2")
            var result = [];
            successHelper.returnSuccess(false, res, 200, "Charger Station Details.", result);
        }

    }).catch(function (error) {
        console.log("controllererror==========", error)
    })
}



exports.SingleChargerStationDetails = function (req, res) {
    var params = req.body;
    return ChargersocketServices.SingleChargerStationDetails(params).then(function (result) {
        if (result) {
            successHelper.returnSuccess(false, res, 200, "Charger Station Details.", result);
        } else {
            var result = [];
            successHelper.returnSuccess(false, res, 200, "Charger Station Details.", result);
        }

    }).catch(function (error) {
        console.log("controllererror==========", error)
    })
}


exports.ChargingStationGraph = function (req, res) {
    return ChargersocketServices.ChargingStationGraph().then(function (Data) {
        successHelper.returnSuccess(false, res, 200, "Charger Station Graph Data.", Data);
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: error,
            Name: 'Not authorize.'
        }, res, 500)
    })
}


exports.ChargingStationGraphAdmin = function (req, res) {
    var params = req.AuthData;
    return ChargersocketServices.ChargingStationGraphAdmin(params).then(function (Data) {
        successHelper.returnSuccess(false, res, 200, "Charger Station Graph Data.", Data);
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: error,
            Name: 'Not authorize.'
        }, res, 500)
    })
}


exports.GetChargerStationLiveData = function (req, res) {
    return ChargersocketServices.GetChargingStationLiveData().then(function (Data) {
        successHelper.returnSuccess(false, res, 200, "Charger Station live data.", Data);
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: error,
            Name: 'Not authorize.'
        }, res, 500)
    })
}


/********* Get Temp Data */
exports.GetTempChargerStationLiveData = function (req, res) {
    return ChargersocketServices.GetTempChargerStationLiveData().then(function (Data) {
        successHelper.returnSuccess(false, res, 200, "Charger Station live data.", Data);
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: error,
            Name: 'Not authorize.'
        }, res, 500)
    })
}

/**
 * Created By :- Ishan Jain
 * Created Date :- 12-07-2019
 * Purpose :- For download charger station data in excle formate between two date.
 */
exports.GetChargingStationReport = function (req, res) {
    if (req.params.chargerstationid) {
        var body = req.params;
    } else if (req.body.chargerstationid) {
        var body = req.body;
    }
    return ChargerStation.findOne({
        "chargerstationid": body.chargerstationid
    }).then(function (VData) {
        return ChargersocketServices.GetChargingStationReport(body).then(function (ChargingData) {
            console.log("ChargingData.length ============== ", ChargingData.length);
            //return res.json(BatteryData);
            // Create a new instance of a Workbook class
            var workbook = new excel.Workbook();

            // Add Worksheets to the workbook
            var ws = workbook.addWorksheet('Sheet 1');
            var worksheet2 = workbook.addWorksheet('Sheet 2');

            console.log(ChargingData.length);
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
            ws.cell(2, 2, 2, 10, true).string('Charger Report').style(headerValueStyle);

            ws.cell(3, 1).string('Duration').style(headerLevelStyle);
            var toDateTemp = moment(body.to).format('ll');
            var fromDateTemp = moment(body.from).format('ll');
            ws.cell(3, 2, 3, 6, true).string(fromDateTemp + ' to ' + toDateTemp).style(headerValueStyle);

            ws.cell(4, 1).string('Charging Station Name').style(headerLevelStyle);
            if (VData) {
                ws.cell(4, 2, 4, 10, true).string(VData.name + "(" + VData.chargerstationid + ")").style(headerValueStyle);
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
            ws.cell(headRowIndex, 3).string('Charging Station ID').style(style);
            ws.cell(headRowIndex, 4).string('EM_V1').style(style);
            ws.cell(headRowIndex, 5).string('EM_V2').style(style);
            ws.cell(headRowIndex, 6).string('EM_V3').style(style);
            ws.cell(headRowIndex, 7).string('EM_I1').style(style);
            ws.cell(headRowIndex, 8).string('EM_I2').style(style);
            ws.cell(headRowIndex, 9).string('EM_I3').style(style);
            ws.cell(headRowIndex, 10).string('EM_P1').style(style);
            ws.cell(headRowIndex, 11).string('EM_P2').style(style);
            ws.cell(headRowIndex, 12).string('EM_P3').style(style);
            ws.cell(headRowIndex, 13).string('EM_E1').style(style);
            ws.cell(headRowIndex, 14).string('EM_E2').style(style);
            ws.cell(headRowIndex, 15).string('EM_E3').style(style);
            ws.cell(headRowIndex, 16).string('S1_STS').style(style);
            ws.cell(headRowIndex, 17).string('S2_STS').style(style);
            ws.cell(headRowIndex, 18).string('S3_STS').style(style);
            ws.cell(headRowIndex, 19).string('HLT_STS').style(style);
            ws.cell(headRowIndex, 20).string('EMG_STS').style(style);

            ws.cell(headRowIndex, 21).string('Low Voltage in R-Phase').style(style);
            ws.cell(headRowIndex, 22).string('High Voltage in R-Phase').style(style);

            ws.cell(headRowIndex, 23).string('Low Voltage in Y-Phase').style(style);
            ws.cell(headRowIndex, 24).string('High Voltage in Y-Phase').style(style);

            ws.cell(headRowIndex, 25).string('Low Voltage in B-Phase').style(style);
            ws.cell(headRowIndex, 26).string('High Voltage in B-Phase').style(style);

            ws.cell(headRowIndex, 27).string('Over load in Socket 1').style(style);
            ws.cell(headRowIndex, 28).string('Over load in Socket 2').style(style);
            ws.cell(headRowIndex, 29).string('Over load in Socket 3').style(style);

            ws.cell(headRowIndex, 30).string('Power limit exceeded in Socket 1').style(style);
            ws.cell(headRowIndex, 31).string('Power limit exceeded in Socket 2').style(style);
            ws.cell(headRowIndex, 32).string('Power limit exceeded in Socket 3').style(style);

            ws.cell(headRowIndex, 33).string('Socket 1 faulty').style(style);
            ws.cell(headRowIndex, 34).string('Socket 2 faulty').style(style);
            ws.cell(headRowIndex, 35).string('Socket 3 faulty').style(style);
            ws.cell(headRowIndex, 36).string('Partial System Fault').style(style);
            ws.cell(headRowIndex, 37).string('Full System Fault').style(style);
            ws.cell(headRowIndex, 38).string('Emergency Fault').style(style);


            return bPromise.all(ChargingData).each(function (item, index) {

                var rowIndex = index + headRowIndex + 1;
                var style = {
                    font: {
                        bold: false
                    }
                }

                var DateD = moment(item.datetime).format("MM/DD/YYYY");
                var Time = moment(item.datetime).format("HH:mm:ss");

                var jsonData = JSON.parse(item.json);

                for (var property1 in jsonData) {
                    jsonData[property1] = parseFloat(jsonData[property1]);
                }

                ws.cell(rowIndex, 1).string(DateD).style(style);
                ws.cell(rowIndex, 2).string(Time).style(style);
                ws.cell(rowIndex, 3).string(item.cs_id).style(style);
                ws.cell(rowIndex, 4).number((jsonData.em_v1) ? jsonData.em_v1 : 0).style(style);
                ws.cell(rowIndex, 5).number((jsonData.em_v2) ? jsonData.em_v2 : 0).style(style);
                ws.cell(rowIndex, 6).number((jsonData.em_v3) ? jsonData.em_v3 : 0).style(style);
                ws.cell(rowIndex, 7).number((jsonData.em_i1) ? jsonData.em_i1 : 0).style(style);
                ws.cell(rowIndex, 8).number((jsonData.em_i2) ? jsonData.em_i2 : 0).style(style);
                ws.cell(rowIndex, 9).number((jsonData.em_i3) ? jsonData.em_i3 : 0).style(style);
                ws.cell(rowIndex, 10).number((jsonData.em_p1) ? jsonData.em_p1 : 0).style(style);
                ws.cell(rowIndex, 11).number((jsonData.em_p2) ? jsonData.em_p2 : 0).style(style);
                ws.cell(rowIndex, 12).number((jsonData.em_p3) ? jsonData.em_p3 : 0).style(style);
                ws.cell(rowIndex, 13).number((jsonData.em_e1) ? jsonData.em_e1 : 0).style(style);
                ws.cell(rowIndex, 14).number((jsonData.em_e2) ? jsonData.em_e2 : 0).style(style);
                ws.cell(rowIndex, 15).number((jsonData.em_e3) ? jsonData.em_e3 : 0).style(style);
                ws.cell(rowIndex, 16).number((jsonData.s1_sts) ? jsonData.s1_sts : 0).style(style);
                ws.cell(rowIndex, 17).number((jsonData.s2_sts) ? jsonData.s2_sts : 0).style(style);
                ws.cell(rowIndex, 18).number((jsonData.s3_sts) ? jsonData.s3_sts : 0).style(style);
                ws.cell(rowIndex, 19).number((jsonData.hlt_sts) ? jsonData.hlt_sts : 0).style(style);
                ws.cell(rowIndex, 20).number((jsonData.emg_sts) ? jsonData.emg_sts : 0).style(style);

                var low = 0, high = 0;
                if (jsonData.em_v1 < 200.0) {
                    low = 1;
                } else if (jsonData.em_v1 > 270.0) {
                    high = 1;
                }
                ws.cell(rowIndex, 21).number(low).style(style);
                ws.cell(rowIndex, 22).number(high).style(style);

                var low = 0, high = 0;
                if (jsonData.em_v2 < 200.0) {
                    low = 1;
                } else if (jsonData.em_v2 > 270.0) {
                    high = 1;
                }
                ws.cell(rowIndex, 23).number(low).style(style);
                ws.cell(rowIndex, 24).number(high).style(style);

                var low = 0, high = 0;
                if (jsonData.em_v3 < 200.0) {
                    low = 1;
                } else if (jsonData.em_v3 > 270.0) {
                    high = 1;
                }
                ws.cell(rowIndex, 25).number(low).style(style);
                ws.cell(rowIndex, 26).number(high).style(style);

                ws.cell(rowIndex, 27).number((parseFloat(jsonData.em_l1) > 15 && parseFloat(jsonData.s1_sts) == 2) ? 1 : 0).style(style);
                ws.cell(rowIndex, 28).number((parseFloat(jsonData.em_l1) > 15 && parseFloat(jsonData.s2_sts) == 2) ? 1 : 0).style(style);
                ws.cell(rowIndex, 29).number((parseFloat(jsonData.em_l1) > 15 && parseFloat(jsonData.s3_sts) == 2) ? 1 : 0).style(style);

                ws.cell(rowIndex, 30).number((parseFloat(jsonData.em_p1) > 3.3 && parseFloat(jsonData.s1_sts) == 2) ? 1 : 0).style(style);
                ws.cell(rowIndex, 31).number((parseFloat(jsonData.em_p2) > 3.3 && parseFloat(jsonData.s1_sts) == 2) ? 1 : 0).style(style);
                ws.cell(rowIndex, 32).number((parseFloat(jsonData.em_p3) > 3.3 && parseFloat(jsonData.s1_sts) == 2) ? 1 : 0).style(style);

                ws.cell(rowIndex, 33).number((parseFloat(jsonData.s1_sts) == 6) ? 1 : 0).style(style);
                ws.cell(rowIndex, 34).number((parseFloat(jsonData.s2_sts) == 6) ? 1 : 0).style(style);
                ws.cell(rowIndex, 35).number((parseFloat(jsonData.s3_sts) == 6) ? 1 : 0).style(style);

                ws.cell(rowIndex, 36).number((parseFloat(jsonData.hlt_sts) == 9) ? 1 : 0).style(style);
                ws.cell(rowIndex, 37).number((parseFloat(jsonData.hlt_sts) == 10) ? 1 : 0).style(style);
                ws.cell(rowIndex, 38).number((parseFloat(jsonData.emg_sts) == 11) ? 1 : 0).style(style);

            }).then(function () {
                var fileName = "chargerreportreport-" + body.chargerstationid + moment(body.from).format("YYYYMMDDHHMMSS") + moment(body.to).format("YYYYMMDDHHMMSS") + '.xlsx';
                console.log(fileName)
                workbook.write('./public/' + fileName, function (err, stats) {
                    if (err) {
                        res.json({
                            error: true,
                            message: "There are some error occured in DB."
                        });
                    } else {
                        if (req.params.chargerstationid) {
                            res.download('./public/' + fileName);
                        } else if (req.body.chargerstationid) {
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


/*****************Start Charging Station Port */
exports.StartChargingStationport = function (req, res) {
    var Authparams = req.AuthData;
    var body = req.body;
    return ChargersocketServices.StartChargingStationport(Authparams, body).then(function (portData) {
        if (portData) {
            successHelper.returnSuccess(false, res, 200, "Charger port connected successfully.", portData);
        } else {
            var Data = [];
            successHelper.returnSuccess(false, res, 200, "Charger port connected successfully.", Data);
        }
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: error,
            Name: 'Not authorize.'
        }, res, 500)
    })
}


/***************************** Get Chargingstation Port */
exports.GetChargingstationPort = function(req, res){
    var Authparams = req.AuthData;
    var body = req.body;
    return ChargersocketServices.GetChargingStationPort(Authparams).then(function (portData) {
        if (portData) {
            successHelper.returnSuccess(false, res, 200, "Charger port data.", portData);
        } else {
            var Data = null;
            successHelper.returnSuccess(false, res, 200, "Charger port data.", Data);
        }
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false,
            Status: 500,
            Message: error,
            Name: 'Not authorize.'
        }, res, 500)
    }) 
}

/************************************* ActiveInactiveChargingStation */
exports.ActiveInactiveChargingStation = function(req, res){
    var params = req.body;
    return ChargersocketServices.ActiveInActiveChargingStation(params).then(function (Organization) {
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

/************************************Controller for Get Zone wise Charging station */
exports.GetZoneChargingStation = function(req, res){
    var params = req.body;
    return ChargersocketServices.GetZoneChargingStation(params).then(function (Organization) {
        if(Organization){
            successHelper.returnSuccess(false, res, 200, "Zone charging station list.", Organization);
        }else{
            successHelper.returnSuccess(false, res, 200, "Zone charging station list.");
        }
    }).catch(function (error) {
        return errorsControllerHelper.returnError({
            Succeeded: false, Status: 500, Message: 'Not authorize.', Name: 'Not authorize.'
        }, res, 500);
    })
}


exports.GetZonalManagerChargingStatinList = function (req, res) {
   var params = req.AuthData
   return ChargersocketServices.GetZonalManagerChargingStatinList(params, res).then(function (data) {
       var tempArr = [];
       data.forEach(function (Item) {
           if (Item.length > 0) {
               tempArr.push(Item);
           }
       })
       if (tempArr[0]) {
           successHelper.returnSuccess(false, res, 200, "Zonal manager Charging station list.", tempArr[0]);
       } else {
           successHelper.returnSuccess(false, res, 200, "Zonal manager Charging station list.", []);
       }
   })
}
exports.GetChargingStatinListByUserType = function (req, res) {
   var AuthParams = req.AuthData;
   var params = req.params
   return ChargersocketServices.GetChargingStatinListByUserType(AuthParams, params).then(function (data) {
       var tempArr = [];
	   console.log("data============",data)
       data.forEach(function (Item) {
           if (Item.length > 0) {
               tempArr.push(Item);
           }
       })
       if (tempArr[0]) {
           successHelper.returnSuccess(false, res, 200, "Charging operator Charging station list.", data[data.length-1]);
       } else {
           successHelper.returnSuccess(false, res, 200, "Charging operator Charging station list.", data[data.length-1]);
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

exports.GetChargingStationEnergyChartData = function (req, res) {
   var Authparams = req.AuthData;
   var params = req.params;
   return ChargersocketServices.GetChargingStationEnergyChartData(Authparams, params).then(function (Data) {
       res.json({ "Status": 200, "Result": Data[Data.length - 1], "Message": "Charging station energy data" });
   }).catch(function (error) {
       return errorsControllerHelper.returnError({
           Succeeded: false,
           Status: 500,
           Message: 'Not authorize.',
           Name: 'Not authorize.'
       }, res, 500)
   })
}
/********************GetChargingStationRevanueChart */
exports.GetChargingStationRevanueChart = function (req, res) {
   var Authparams = req.AuthData;
   var params = req.params;
   return ChargersocketServices.GetChargingStationRevanueChart(Authparams, params).then(function (Data) {
       res.json({ "Status": 200, "Result": Data[Data.length - 1], "Message": "Charging station revanue Chart data" });
   }).catch(function (error) {
       return errorsControllerHelper.returnError({
           Succeeded: false,
           Status: 500,
           Message: 'Not authorize.',
           Name: 'Not authorize.'
       }, res, 500)
   })
}

exports.GetZonalManagerDashboard = function (req, res) {
   var params = req.AuthData;
   return ChargersocketServices.GetZonalManagerDashboard(params).then(function (data) {
       if (data) {
           successHelper.returnSuccess(false, res, 200, "ZonalManager dashboard data.", data);
       }else{
           successHelper.returnSuccess(false, res, 200, "ZonalManager dashboard data.", data);
       }
   });
}
exports.GetChargingOperatorDashboard = function(req, res){
   var params = req.AuthData;
   return ChargersocketServices.GetChargingOperatorDashboard(params).then(function (data) {
       if (data[data.length-1]) {
           successHelper.returnSuccess(false, res, 200, "ChargingOperator dashboard data.", data[data.length-1]);
       }else{
           successHelper.returnSuccess(false, res, 200, "ChargingOperator dashboard data.", data);
       }
   });
}
exports.GetStationInstantaneousEnergyGraph = function (req, res) {
   var AuthData = req.AuthData;
   return ChargersocketServices.GetStationInstantaneousEnergyGraph(AuthData).then(function (Data) {
       res.json({ "Status": 200, "Result": Data, "Message": "Instantaneous energy graph data" });
   }).catch(function (error) {
       return errorsControllerHelper.returnError({
           Succeeded: false,
           Status: 500,
           Message: 'Not authorize.',
           Name: 'Not authorize.'
       }, res, 500)
   })
}


exports.GetChargingSessionData = function (req, res) {
   var Authparams = req.AuthData;
   return ChargersocketServices.GetChargingSessionData(Authparams).then(function (Data) {
       res.json({ "Status": 200, "Result": Data, "Message": "Average session graph data" });
   }).catch(function (error) {
       res.json(error);
   })
}
/*****************************Controller for Avg Session Data */
exports.GetChargingSessionTimeData = function(req, res){
   var Authparams = req.AuthData;
   var params = req.params;
   return ChargersocketServices.GetChargingSessionTimeData(Authparams, params).then(function (Data) {
       res.json({ "Status": 200, "Result": Data, "Message": "Average session graph data" });
   }).catch(function (error) {
       return errorsControllerHelper.returnError({
           Succeeded: false,
           Status: 500,
           Message: 'Not authorize.',
           Name: 'Not authorize.'
       }, res, 500)
   })
}

exports.getUtilizationRationGraph = function (req, res) {
   var Authparams = req.AuthData;
   var params = req.params;
   return ChargersocketServices.GetStationUtilizationGraph(Authparams, params).then(function (Data) {
       res.json({ "Status": 200, "Result": Data[Data.length-1], "Message": "Utilization ratio graph data" });
   }).catch(function (error) {
       return errorsControllerHelper.returnError({
           Succeeded: false,
           Status: 500,
           Message: 'Not authorize.',
           Name: 'Not authorize.'
       }, res, 500)
   })
}

exports.GetChargingStationRationData = function(req, res){
   var Authparams = req.AuthData;
   var params = req.params;
   return ChargersocketServices.GetChargingStationRationData(Authparams, params).then(function (Data) {
       res.json({ "Status": 200, "Message": "Average session graph data", "Result": Data[Data.length - 1], });
   }).catch(function (error) {
       return errorsControllerHelper.returnError({
           Succeeded: false,
           Status: 500,
           Message: 'Not authorize.',
           Name: 'Not authorize.'
       }, res, 500)
   })
}
exports.GetFleetManagerDashboardData = function(req, res){
   var Authparams = req.AuthData;
   return ChargersocketServices.GetFleetManagerDashboardData(Authparams).then(function (Data) {
       if(Data){
           res.json({ "Status": 200, "Message": "FleetManager live vehicle data", "Result": Data, });
       }else{
           res.json({ "Status": 200, "Message": "FleetManager live vehicle data", "Result": Data, });
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