import { Organization } from '../models/organization';
import { batteryData } from '../models/evehicle';
import { Evehicle } from '../models/evehicle';
import { Zone } from '../models/zone';
import { Hub } from '../models/hub';
import { User } from '../models/user';
var config = require('../../config');
import { Roleswrites } from '../models/roleswrites';
import { Mastserroles } from '../models/masterroles';
import { States } from '../models/city';
import { Countrys } from '../models/state';
import { Citys } from '../models/country';
var ErrorHelper = require('../helpers/errortypes-helper');
var bPromise = require('bluebird');

// handle CreateOrganizations Services.
exports.CreateOrganizations = function (params) {
  var myData = new Organization(params);
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


exports.CreateOrganizationService = function (params) {
  var myData = new Organization(params);
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

// handle FindAllOrganizationList Services.
exports.FindAllOrganizationList = function (params) {
  if (params.status == "active") {
    var whereparams = {
      "status": true
    }
  }else if(params.status == "inactive"){
    var whereparams = {
      "status":false
    }
  }else{
    var whereparams = { }
  }
  var result = [];
  return Organization.find(whereparams).sort({ organizationname: 1 }).then(function (OrgItem) {
    if (OrgItem) {
      var Assembled = [];
      return bPromise.all(OrgItem).each(function (Item) {
        return User.find({ organizationid: Item._id }).then(function (UserCont) {
          //Item.UserData = UserCont.length;
          Item.FleetManagerList = UserCont;
          return Item
        }).then(function(Item){
         return User.find({ organizationid: Item._id, "usertypeid": { $ne: "5cd2c46e3f068c1ffde5d624" }}).then(function (UserCont) {
           Item.UserData = UserCont.length;
           return Item
       }).then(function (Item) {
          return Evehicle.find({ organizationid: Item._id }).then(function (VehicleCont) {
            Item.VehicleData = VehicleCont.length;
            return Item;
          }).then(function (Item) {
            var whereparams = {
              "organizationid": Item._id,
              "telemetryboardid": { $exists: false }
            }
            return Evehicle.find(whereparams).then(function (AssembledVehicleCount) {
              if (AssembledVehicleCount.length > 0) {
                Item.DisAssembledVehicle = AssembledVehicleCount.length
              }
              return Item;
            }).then(function (Item) {
               Item.fleetManager = false;
               Item.UtilityManager = false;
               Item.ChargingOperator = false;
               Item.BatteryManufaturer = false;
               if (Item.FleetManagerList.length > 0) {
                 return new Promise(function (resolve, reject) {
                   resolve(exports.GetRoleType("FleetManager"));
                   /*resolve(exports.GetRoleType("ChargingOperator"));
                   resolve(exports.GetRoleType("BatteryManufaturer"));*/
                 }).then(function (RoleId) {
                   return new Promise(function (resolve, reject) {
                     resolve(exports.CheckRoleInCollection(Item.FleetManagerList, RoleId))
                   }).then(function (result) {
                     Item.fleetManager = result;
                     return Item
                   }).then(function (Item) {
                     return new Promise(function (resolve, reject) {
                       resolve(exports.GetRoleType("Utility"));
                     }).then(function (RoleId) {
                       return new Promise(function (resolve, reject) {
                         resolve(exports.CheckRoleInCollection(Item.FleetManagerList, RoleId))
                       }).then(function(result){
                         Item.UtilityManager = result;
                         return Item
                     })
                   })
                   }).then(function (Item) {
                     return new Promise(function (resolve, reject) {
                       resolve(exports.GetRoleType("ChargingOperator"));
                     }).then(function (RoleId) {
                       return new Promise(function (resolve, reject) {
                         resolve(exports.CheckRoleInCollection(Item.FleetManagerList, RoleId))
                       }).then(function(result){
                         Item.ChargingOperator = result;
                         return Item
                     })
                   })
                   }).then(function (Item) {
                     return Item;
                   })
                 })
               }
               return Item;
             })
           })
         }).then(function (Item) {
           result.push({
             "_id": Item._id,
             "fleetmanager": Item.fleetManager,
             "utilitymanager":Item.UtilityManager,
             "chargingoperator":Item.ChargingOperator,
             "batterymanufacturer":Item.BatteryManufaturer,
             "status": Item.status,
             "organizationname": Item.organizationname,
             "contactno": Item.contactno,
             "logo": config.url + "iotnode/uploads/" + Item.logo,
             "usercount": Item.UserData,
             "vehiclecount": Item.VehicleData,
             "DisAssembled": (Item.DisAssembledVehicle) ? Item.DisAssembledVehicle : 0
           })
         })
       })
     }).then(function () {
       return result;
     })
    } else {
      var item = "";
      return item;
    }
  }).catch(function (error) {
    console.log("error", error)
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  });
}

exports.CheckRoleInCollection = function (FleetManagerList, RoleId) {
  var result = [];
  return bPromise.all(FleetManagerList).each(function (FleetUser) {
    if (FleetUser.roletype.length > 0) {
      if (FleetUser.roletype.indexOf(RoleId) > -1) {
        result.push(true)
      }
    }
  }).then(function () {
    if (result.indexOf(true) > -1) {
      return true;
    } else {
      return false;
    }
  })
}

exports.GetRoleType = function (RoleName) {
  return Mastserroles.findOne({ "rolename": RoleName }).then(function (UserRole) {
    return Roleswrites.findOne({ "roleid": UserRole._id }).then(function (RoleId) {
      return RoleId._id
    })
  }).catch(function (error) {
    return error;
  })
}

// handle VendorsList Services.
// exports.FindVendorList = function (params, resolve, reject) {
//   return User.find(params).populate('organizationid').then(function (Data) {
//     if (Data) {
//       return bPromise.map(Data, function (Items) {
//         return Hub.find({ "organizationid": Items.organizationid._id }).then(function (HubData) {
//           Items.HubData = HubData;
//         }).then(function () {
//           var params = {
//             "organizationid": Items.organizationid._id,
//             "usertypeid": { $ne: "5cd2c46e3f068c1ffde5d624" }
//           }
//           return User.find(params).then(function (userdata) {
//             Items.UserData = userdata;
//           }).then(function () {
//             return Evehicle.find({ "organizationid": Items.organizationid._id }).then(function (VehicleItem) {
//               Items.VehicleData = VehicleItem;
//               return Items;
//             });
//           })
//         })
//       }).then(function (fdata) {
//         resolve(fdata)
//       }).catch(function (error) {
//       })
//     } else {
//       throw new ErrorHelper.ValidationError("Something went wrong.", params);
//     }
//   }).catch(function (error) {
//     throw new ErrorHelper.BadRequest("Something went wrong.", error);
//   });
// }

//get All Vendor List
exports.FindVendorList = function (params, resolve, reject) {
  return User.find(params).populate('organizationid').sort({ firstname: 1 }).then(function (Data) {
    var VendorListData = [];
    return bPromise.all(Data).each(function (VendorItem) {
      var whererparams = {
        _id: { $in: VendorItem.roletype }
      }
      return Roleswrites.find(whererparams).populate('roleid').then(function (RoleData) {
        if (VendorItem.organizationid != null) {
          VendorListData.push({
            "_id": VendorItem._id,
            "organizationname": VendorItem.organizationid.organizationname,
            "firstname": VendorItem.firstname,
            "lastname": VendorItem.lastname,
            "email": VendorItem.email,
            "roleData": RoleData,
            "isactive": VendorItem.isactive,
            "profileImg": config.url + "iotnode/uploads/" + VendorItem.profileImg
          })
        }
      })
    }).then(function () {
      return VendorListData;
    })
    //} else {
    //var Data = "";
    // return Data;
    // }
  }).catch(function (error) {
    console.log("Data========error=======", error)
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  });
}

// find Singkle vendor List
exports.FindSingleVendorList = function (Id) {
  var whereparams = {
    _id: Id
  }
  return User.findOne(whereparams).populate('organizationid').then(function (Data) {
    if (Data) {
      var whererparams = {
        _id: { $in: Data.roletype }
      }
      return Roleswrites.find(whererparams).populate('roleid').then(function (RoleData) {
        var RoleDataItem = [];
        return bPromise.all(RoleData).each(function (RoleItem) {
          RoleDataItem.push(RoleItem._id)
        }).then(function () {
          if (Data.organizationid != null) {
            return {
              "_id": Data._id,
              "organizationid": Data.organizationid._id,
              "firstname": Data.firstname,
              "contactno": Data.contactno,
              "lastname": Data.lastname,
              "email": Data.email,
              "middlename": Data.middlename,
              "dob": Data.dob,
              "roleData": RoleDataItem,
              "profileImg": config.url + "iotnode/uploads/" + Data.profileImg
            }
          }
        })
      })
    } else {
      var Data = "";
      return Data;
    }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  });
}

// Update Vendor List
exports.UpdateVendorList = function (Id, updateparams) {
  var whereparams = {
    _id: Id
  }
  return User.findOne(whereparams).then(function (Data) {
    if (Data) {
      return User.updateOne({ _id: Id }, { $set: updateparams }, { new: true }).then(function (Data) {
        return Data;
      })
    } else {
      var Data = "";
      return Data;
    }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  });
}

exports.UpdateOrganiztions = function (Id, updateparams) {
  return Organization.updateOne({ _id: Id }, { $set: updateparams }, { new: true }).then(function (Item) {
    return Item;
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })
}

exports.FindSingleOrganization = function (params) {
  return Organization.findOne(params).populate('hubid').then(function (Item) {
    return {
      "_id": Item._id,
      "organizationname": Item.organizationname,
      "city": Item.city,
      "address1": Item.address1,
      "address2": (Item.address2) ? Item.address2 : "",
      "lat": Item.lat,
      "lng": Item.lng,
      "state": Item.state,
      "country": Item.country,
      "pincode": Item.pincode,
      "contactno": Item.contactno,
      "logo": config.url + "iotnode/uploads/" + Item.logo,
    }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })
}

exports.CreateZone = function (params) {
  if (params) {
    var ZoneData = new Zone(params);
    return ZoneData.save().then(function (item) {
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
  } else {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  }
}

exports.GetZoneList = function (params) {
  if(params.status == "active"){
    var whereparams = {
      "isactive" : true
    }
  }else if(params.status == "inactive"){
    var whereparams = {
      "isactive" : false
    }
  }else{
    var whereparams = {}
  } 
  return Zone.find(whereparams).populate('city').populate('state').populate('country').sort({ name: 1 }).then(function (Item) {
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

exports.DeleteZone = function (ZoneId, updateparams) {
  if (Id) {
    return Zone.find({ "_id": ZoneId }).then(function (Item) {
      if (Item) {
        return Zone.updateOne({ _id: ZoneId }, { $set: updateparams }).then(function (Item) {

        }).catch(function (error) {
          throw new ErrorHelper.BadRequest("Something went wrong.", error);
        })
      }
    }).catch(function (error) {
      throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
  }
}

exports.GetZoneDetals = function (ZoneId) {
  if (ZoneId) {
    return Zone.findOne({ "_id": ZoneId }).then(function (Item) {
      if (Item) {
        return Item
      }
    }).catch(function (error) {
      throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
  } else {
    throw new ErrorHelper.ValidationError("parameter missing error.", error);
  }
}


exports.UpdateZones = function (ZoneId, updateparams) {
  if (ZoneId) {
    return Zone.find({ _id: ZoneId }).then(function (Item) {
      if (Item) {
        return Zone.findOneAndUpdate({ _id: ZoneId }, { $set: updateparams }, { new: true }).then(function (ZoneItem) {
          return ZoneItem;
        }).catch(function (error) {
          throw new ErrorHelper.BadRequest("Something went wrong.", error);
        })
      }
    }).catch(function (error) {
      throw new ErrorHelper.BadRequest("Something went wrong.", error);
    })
  }
}

/*********************** Organizations*/
exports.ActiveInActiveOrganizations = function (params) {
  var updateparams = {
    "status": params.status
  }
  return Organization.updateOne({ _id: params.Id }, { $set: updateparams }, { new: true }).then(function (Item) {
    return Item;
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })
}


/***************************** Zone*/
exports.ActiveInActiveZone = function (params) {
  var updateparams = {
    "isactive": params.isactive
  }
  return Zone.updateOne({ _id: params.Id }, { $set: updateparams }, { new: true }).then(function (Item) {
    return Item;
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })
}

/******************************Vendor  */
exports.ActiveInActiveVendor = function (params) {
  var updateparams = {
    "isactive": params.isactive
  }
  return User.updateOne({ _id: params.Id }, { $set: updateparams }, { new: true }).then(function (Item) {
    return Item;
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })
}


exports.FilterOrganizationList = function(){
 var OrgList = [];
 return Organization.find().sort({"organizationname":1}).then(function(OrganizationList){
   if(OrganizationList){
     return bPromise.all(OrganizationList).each(function(OrgItem){
       OrgList.push({"_id":OrgItem._id,"organizationname":OrgItem.organizationname})
     }).then(function(){
       return OrgList;
     })
   }else{
     var OrganizationList = [];
     return OrganizationList
   }
 }).catch(function(error){
   return error;
 })
}
