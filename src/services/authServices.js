import { User } from '../models/user';
import { LoginLog } from '../models/loginlog';
import { Hub } from '../models/hub';
var ErrorHelper = require('../helpers/errortypes-helper');
var successhelper = require('../helpers/success.helper');
import { UserType } from '../models/usertype';
import { BookingDetail } from '../models/bookingdetails';
import { Evehicle } from '../models/evehicle';
import { Countrys } from '../models/country';
import { States } from '../models/state';
import { Citys } from '../models/city';
import { VehicleType } from '../models/vehicletype';
import { exception } from '../models/exception';
import { batteryData } from '../models/evehicle';
import { Telemetrylog } from '../models/telemetrylog';
import { Mielage } from '../models/mileage';
var bPromise = require('bluebird');
var moment = require('moment');
// handle CreateUser Services.
exports.CreateUsers = function (params) {
  var myData = new User(params);
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
      throw new ErrorHelper.ValidationError("parameter error.", params);
    } else if (error.name == "EmailExist") {
      throw new ErrorHelper.BadRequest(error.message, error);
    } else {
      throw new ErrorHelper.BadRequest("Something went wrong.", error);
    }
  });
}

exports.FindVehicle = function (params) {
	
  return Evehicle.findOne({ _id: params.VehicleId }).then(function (VehicleItem) {
    if (VehicleItem) {
		console.log("VehicleItem", VehicleItem, params);
      if (params.requesttype == "Web") {
        var updateparams = {
          "activatebysuperadmin": params.startvalue
        }
		if(parseInt(params.startvalue) == 0 && VehicleItem.activatebyuser == 1){
			updateparams.activatebyuser = 0;
		}
        return Evehicle.findOneAndUpdate({ _id: VehicleItem._id }, { $set: updateparams }, { new: true }).then(function (VehicleUpdatedData) {
          return VehicleUpdatedData;
        })
      } else if (params.requesttype == "Mobile") {
		if(VehicleItem.activatebysuperadmin == 0){
			var updateparams = {
			  "activatebyuser": 0
			}
		} else {
			var updateparams = {
			  "activatebyuser": parseInt(params.startvalue)
			}			
		}
        return Evehicle.findOneAndUpdate({ _id: VehicleItem._id }, { $set: updateparams }, { new: true }).then(function (VehicleUpdatedData) {
          return VehicleUpdatedData;
        })
      }
    } else {
      var Item = "";
      return Item;
    }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  });
}


exports.GetUserTypes = function () {
  return UserType.find().then(function (item) {
    if (item) {
      return item
    } else {
      throw new ErrorHelper.BadRequest("Something went wrong.", "error");
    }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  });
}

exports.getVehicleTypes = function () {
  return VehicleType.find().then(function (item) {
    if (item) {
      return item
    } else {
      throw new ErrorHelper.BadRequest("Something went wrong.", "error");
    }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  });
}

exports.UpdateUser = function (Id, updateparams) {
  return User.findOneAndUpdate({ _id: Id }, { $set: updateparams }, { new: true }).then(function (Item) {
    if (Item) {
      var whereparams = {
        "_id": Item._id
      }
      return User.findOne(whereparams).populate('usertypeid').populate('hubid').then(function (item) {
        return item;
      })
    } else {
      throw new ErrorHelper.BadRequest("Something went wrong.", "error");
    }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })
}

exports.findUserbyOtp = function (params) {
  return User.findOne(params).then(function (item) {
    return item;

  })
}

exports.UpdateHubs = function (Id, updateparams) {
  return Hub.findOneAndUpdate({ _id: Id }, { $set: updateparams }, { new: true }).then(function (Item) {
    return Item;
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })
}

exports.addLoginLog = function (params) {
  var myData = new LoginLog(params);
  return myData.save().then(function (item) {
    return item;
  })
}

//*** Logout User Functionality */
exports.LogoutUser = function (updateparams) {
	console.log({ "userid": updateparams.userid, "deviceid": updateparams.deviceid, "islogout": false })
  return LoginLog.findOne({ "userid": updateparams.userid, "deviceid": updateparams.deviceid, "islogout": false }).sort({ logindatetime : -1 }).then(function (LoginUserData) {
    console.log("LoginUserData", LoginUserData)
    if (LoginUserData) {
      updateparams.islogout = true;
      return LoginLog.findOneAndUpdate({ _id: LoginUserData._id }, { $set: updateparams }, { new: true }).then(function (Item) {
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

/*****************Logout Single User */
exports.LogoutSingleUser = function (updateparams) {
  return User.findOne({ "email": updateparams.email }).then(function (UserData) {
    return LoginLog.findOne({ "userid": UserData.userid, "islogout": false }).sort({ _id: -1 }).then(function (LoginUserData){
      if (LoginUserData) {
        updateparams.islogout = true;
        return LoginLog.findOneAndUpdate({ _id: LoginUserData._id }, { $set: updateparams }, { new: true }).then(function (Item) {
          return Item;
        }).catch(function (error) {
          throw new ErrorHelper.BadRequest("Something went wrong.", error);
        })
      } else {
        var Item = "";
        return Item;
      }
    })
  })
}

/******************* Get Battery Data  */
exports.GetBatteryData = function (params) {
  return batteryData.find(params).then(function (Data) {
    if (Data) {
      return Data;
    }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  });
}


exports.FindUserTypes = function (params) {
  return UserType.findOne(params).then(function (Data) {
    if (Data) {
      return Data;
    }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  });
}


exports.UpdateLoginLogData = function (params) {
  var whereparams = {
    "userid": params.userid
  }
  return LoginLog.findOne(whereparams).then(function (Data) {
    if (Data) {
      return LoginLog.findOneAndUpdate({ _id: Data._id }, { $set: params }, { new: true }).then(function (Item) {
        return Item;
      })
    } else {
      var myData = new LoginLog(params);
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
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  });
}


exports.StartVehicle = function (params) {
  return params;
}

exports.getLastLoginLogData = function(whereparame, orderParams){
  
  var Sorting = { logindatetime: -1 }
  return LoginLog.findOne(whereparame).sort(orderParams).then(function(item){
    return item;
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })
}

exports.getDashboardData = function (Id, req, res) {
  var lefttoday = ""
  var whereparame = {
    "userid": Id,
    "logindatetime": {
      $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
      $lt: moment().utc().format(),
    },
    "isauthenticated": true,
  }
  var Sorting = { logindatetime: -1 }
  return LoginLog.findOne(whereparame).populate('vehicleid').sort(Sorting).then(function (ItemData) {
    if (ItemData) {
      var whereparams = {
        "_id": ItemData.vehicleid.vehicletype
      }
      return VehicleType.findOne(whereparams).then(function (VehicleTypeData) {
        ItemData.type = VehicleTypeData;
        return ItemData;
      }).then(function (Item) {
        var whereparams = {
          "vehiclenumber": Item.vehicleid._id,
          "userid": Id,
          "datetime": {
            $gt: moment(Item.logindatetime).format(),
            $lt: moment().utc().format(),
          }
        }

        var Sort = { "datetime": -1 }
        return BookingDetail.find(whereparams).sort(Sort).then(function (VehicleBookingData) {
          var totalrevenue = 0;
          var AvailableSeats = [];
          return bPromise.all(VehicleBookingData).each(function (BookingData) {
            if (Item.type.typename == "Two-Wheeler" && BookingData.paidamount == 0) {
              if (BookingData.seatnumber <= 2) {
                AvailableSeats.push({ "seatnumber": BookingData.seatnumber, "status": "free" })
              }

            } else if (Item.type.typename == "Three-Wheeler" && BookingData.paidamount == 0) {
              if (BookingData.seatnumber <= 4) {
                AvailableSeats.push({ "seatnumber": BookingData.seatnumber, "status": "free" })
              }
            }
            totalrevenue += BookingData.paidamount;
          }).then(function () {
            var whereparams = {
              "telemetryboardid": ItemData.telemetryboardid,
              //"vehicleid":ItemData.vehicleid._id
            }
            console.log("whereparams", whereparams)
            return Telemetrylog.findOne(whereparams).sort({ time: -1 }).then(function (TelemetryData) {
              var LeftToday = (parseFloat(TelemetryData.soc) * (100 - parseFloat(TelemetryData.soc))) / parseFloat(TelemetryData.tdt)
              if (LeftToday > 0) {
                lefttoday = LeftToday;
              } else {
                lefttoday = "";
              }
			        console.log("ItemData ItemData ItemData", ItemData);
              if (ItemData.isauthenticated == true && TelemetryData) {
                return {
					        "telemetryboardid": (ItemData.telemetryboardid) ? ItemData.telemetryboardid : "",
                  "tb1": TelemetryData.tb1,
                  "tb2": TelemetryData.tb2,
                  "tb3": TelemetryData.tb3,
                  "speed": TelemetryData.spd,
                  "runtoday": TelemetryData.tdt,
                  "lefttoday": lefttoday,
                  "Vehicleno": ItemData.vehicleid.vehiclenumber,
                  "revenue": totalrevenue,
                  "VehicleData": ItemData.vehicleid._id,
                  "soc": TelemetryData.soc,
                  "type": ItemData.type,
                  "seats": AvailableSeats,
                  "activatebysuperadmin": (ItemData.vehicleid) ? ItemData.vehicleid.activatebysuperadmin : 0,
                  "activatebyuser": (ItemData.vehicleid) ? ItemData.vehicleid.activatebyuser : 0,
                  "topicName": "battery/" + ItemData.telemetryboardid + "/shadow/update"
                  //"topicName": "$aws/things/" + ItemData.telemetryboardid + "/shadow/update"
                };
                //console.log("Item==============",Item)
              } else {
                var Data = [];
                res.json({ "Status": 400, "Message": "No live data found for this vehicle111.", "Data": Data });
              }
            }).catch(function (error) {
              console.log("error==============", error)
            })
          })
        })
      })
    } else {
      var DataDashboard = "";
      return DataDashboard;
    }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })

}

exports.getForgetpasswordMail = function (Email) {
  var whereparams = {
    "email": Email
  }
  return User.findOne(whereparams).populate('usertypeid').then(function (Item) {
    if (Item) {
      return Item;
    } else {
      var Item = "";
      return Item;
    }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })
}

exports.CreateEcxeption = function (params) {
  var myData = new exception(params);
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
      throw new ErrorHelper.ValidationError("parameter error.", params);
    } else if (error.name == "EmailExist") {
      throw new ErrorHelper.BadRequest(error.message, error);
    } else {
      throw new ErrorHelper.BadRequest("Something went wrong.", error);
    }
  });
}

//Services for createing roles

exports.CreateRoles = function (params) {

}

// get all Country List
exports.GetAllCountryList = function () {
  var whereparams = {
    "status": true
  }
  return Countrys.find(whereparams).then(function (CountryList) {
    return CountryList
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest(error.message, error);
  })
}

// get all state List
// get all state List
exports.GetAllStateList = function (CountryId) {
  var whereparams = {
    "status": true,
    "country": CountryId
  }
  return States.find(whereparams).then(function (stateList) {
    return stateList
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest(error.message, error);
  })
}

// get all city List
exports.GetAllCityList = function (StateId) {
  var whereparams = {
    "status": true,
    "state": StateId
  }
  return Citys.find(whereparams).then(function (cityList) {
    return cityList
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest(error.message, error);
  })
}

/***********************Block User by Admin */
exports.BlockUser = function (Id, updateparams) {
  return User.findOneAndUpdate({ _id: Id }, { $set: updateparams }, { new: true }).then(function (UserData) {
    if (UserData) {
      return UserData;
    } else {
      var data = [];
      return data
    }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest(error.message, error);
  })
}

exports.GetAllLoginLog = function(){
  var whereparams = {
      'logindatetime': {
          $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
          $lte: moment().utc().format()
      },
	  vehicleid: { $exists: true }
  }

  return LoginLog.find(whereparams).sort({ logindatetime: 1 })
    .then(function (LoginLogData) {
        return LoginLogData;
    })
    .catch(function (error) {
        throw new ErrorHelper.BadRequest("Something went wrong.", error);
    });
}
