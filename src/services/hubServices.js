import { Hub } from '../models/hub';
import { HubLog } from '../models/hublog';
import { Evehicle } from '../models/evehicle';
import { UserType } from '../models/usertype';
import { User } from '../models/user';
import { Citys } from '../models/city';
import { States } from '../models/state';
var ErrorHelper = require('../helpers/errortypes-helper');
var bPromise = require('bluebird');

// handle CreateUser Services.
exports.CreateHubs = function (params) {
  var myData = new Hub(params);
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

// handle HubList Services.
exports.FindAllHubList = function (organizationid, params) {
	
  var Result = { "Hub": {}, "Vehicle": {} }
  if (params.status == "active") {
    var whereparams = {
      "organizationid": organizationid,
      "isactive": true
    }
  }else if (params.status == "inactive") {
    var whereparams = {
      "organizationid": organizationid,
      "isactive": false
    }
  }else{
    var whereparams = {
      "organizationid": organizationid
    }
  }
  return Hub.find(whereparams).sort({ hubname: 1 }).then(function (Data) {
	  console.log("organizationid============I am herer",Data)
    if (Data.length > 0) {
      Result.Hub = Data;
      return bPromise.all(Data).each(function (Items) {
        return Evehicle.find({ "hubid": Items._id }).then(function (VehicleData) {
          Items.VehicleData = VehicleData;
          return Items
        }).then(function (Items) {
          return User.findOne({ "organizationid": Items.organizationid, "usertypeid": "5cd291330c23960c5411b7de" }).then(function (userdata) {
			  if(userdata){
				Items.HubManager = userdata.firstname + " " + userdata.lastname
			  }else{
			  Items.HubManager = '';
			  }
            return Items;
          })
        })
      }).then(function (res) {
        return res;
      })

    } else {
      var Data = "";
      return Data;
    }
  }).catch(function (error) {
	  console.log("error==============",error)
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  });
}


exports.FindUnAssignedVehicle = function (params) {
  return Hub.find(params).then(function (Data) {
    if (Data) {
      return Data
    } else {
      throw new ErrorHelper.BadRequest("Something went wrong.", "error");
    }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  });
}

// handle FindSingleVehicle Services.
exports.FindSingleHub = function (params) {
  return Hub.findOne({ _id: params }).then(function (item) {
    if (item) {
      return item;
    } else {
      throw new ErrorHelper.BadRequest("Something went wrong.", "error");
    }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  });
}

// handle UpdateHub Services.
exports.UpdateHub = function (Id, updateparams) {
  return Hub.updateOne({ _id: Id }, { $set: updateparams }, { new: true }).then(function (HubItem) {
    return HubItem;
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })
}

/**********update hub id in vehicle  */
exports.UpdateHubId = function (VehicleId, HubId) {
  var updateparams = {
    "hubid": HubId
  }
  return Evehicle.findOne({ _id: VehicleId }).then(function (VehicleData) {
    if (VehicleData) {
      return Evehicle.updateOne({ _id: VehicleData._id }, { $set: updateparams }, { new: true }).then(function (VehicleUpdate) {
        return VehicleUpdate;
      })
    } else {
      var VehicleUpdate = [];
      return VehicleUpdate;
    }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })
}


exports.CreateHubLogs = function (OrgId, params) {
  return Hub.findOne({ "organizationid": OrgId }).sort({ "_id": -1 }).then(function (Item) {
    if (Item) {
      var HubLogparams = {
        "hubid": Item._id,
        "status": params.status,
        "statuschangedby": params.statuschangedby,
        "deactivatebysuperadmin": params.deactivatebysuperadmin,
        "reason": params.reason,
        "datetime": params.datetime,
      }
      var HubLogData = new HubLog(HubLogparams)
      return HubLogData.save().then(function (Item) {
        return Item;
      })
    } else {
      throw new ErrorHelper.BadRequest("Something went wrong.", error);
    }
  }).catch(function (error) {
    res.json(error);
  })
}

exports.CreateHubManager = function (params) {
  var myData = new UserType(params);
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


exports.HubDetails = function (params) {
  var Result = { "Hub": {}, "VehicleId": {} }
  return Hub.findOne(params).then(function (Data) {
    //Result.Hub = Data;
    if (Data) {
      return Evehicle.find({ "hubid": Data._id, "isactive": true }).then(function (VehicleData) {
        var vehicleid = [];
        return bPromise.all(VehicleData).each(function (Item) {
          vehicleid.push(Item._id);
          Data.VehicleId = vehicleid;
        }).then(function () {
          return Data;
        })
      }).then(function (res) {
        return res;
      })
    } else {
      throw new ErrorHelper.BadRequest("Something went wrong.", "error");
    }
    // return Hub.findOne(params).populate('organizationid').then(function (item) {
    //   if (item) {
    //     return item;
    //   } else {
    //     throw new ErrorHelper.BadRequest("Something went wrong.", "error");
    //   }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  });
}


/************************Hub Active Inactive */
exports.ActiveInactiveHub = function (params) {
  var updateparams = {
    "isactive": params.isactive
  }
  return Hub.updateOne({ _id: params.Id }, { $set: updateparams }, { new: true }).then(function (hubUpdateddata) {
    if (hubUpdateddata) {
      return hubUpdateddata;
    } else {
      var hubUpdateddata = [];
      return hubUpdateddata;
    }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })
}