import { User } from '../models/user';
import { Evehicle } from '../models/evehicle';
import { Organization } from '../models/organization';
import { Hub } from '../models/hub';
import { UserType } from '../models/usertype';
import { Faq } from '../models/faq';
import { UserWallet } from '../models/userwallet';
import { UserLog } from '../models/userlog';
import { BookingDetail } from '../models/bookingdetails';
import { ChargingStationLiveData } from '../models/chargingstationlivedata';
import { ChargerStation } from '../models/chargerstation';
import { ChargerstationAlarmlog } from '../models/chargerstationAlarmlogSchema';
import { BatteryDataAlaramLog } from '../models/batterydataalaramlogschema';
import { Telemetrylog } from '../models/telemetrylog';
import { ComplaintLog } from '../models/complaintlog';
import { Roleswrites } from '../models/roleswrites';
import { Mastserroles } from '../models/masterroles';
import { BatterManufacturer } from '../models/batterymanufacturer';
import { LoginLog } from '../models/loginlog';
import { UserRole } from '../models/userroles';
import { Countrys } from '../models/country';
import { States } from '../models/state';
import { Citys } from '../models/city';
var moment = require('moment');
var config = require('../../config');
var alaramDataJson = require('../../alarmarrdata');
var BCrypt = require('bcrypt');
var ErrorHelper = require('../helpers/errortypes-helper');
var bPromise = require('bluebird');
var fs = require('fs');
var AWS = require('aws-sdk');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nynbus.inwizards@gmail.com',
    pass: 'qwerty@11'
  }
});
const sendmail = require('sendmail')({
  devPort: false, // Default: False
  devHost: 'localhost', // Default: localhost
  smtpPort: 25, // Default: 25
  smtpHost: -1 // Default: -1 - extra smtp host after resolveMX
});

//***** FinalCallback */
exports.finalCallback = function (req, res, ErrorCode, Status, result, ErrorMessage, authKey) {
  if (authKey) {
    res.json({ "ErrorCode": ErrorCode, Status: Status, "user": result, "ErrorMessage": ErrorMessage, "auth-key": authKey });
  } else {
    res.json({ "ErrorCode": ErrorCode, Status: Status, "user": result, "ErrorMessage": ErrorMessage });
  }
}

// handle UserList Services.
exports.FindAllUsersList = function (params) {
  var userList = [];
  return User.find(params).populate('usertypeid').populate('organizationid').populate('hubid').sort({ firstname: 1 }).then(function (item) {
    if (item) {
		
      return bPromise.all(item).each(function (ItemData) {
        var userListObject = {
          "_id": ItemData._id,
          "profileImg": (ItemData.profileImg)?config.url + "iotnode/uploads/" +ItemData.profileImg:"",
          "firstname": ItemData.firstname,
          "lastname": ItemData.lastname,
          "isactive":ItemData.isactive,
          "middlename": (ItemData.middlename) ? ItemData.middlename : "",
          "type": (ItemData.usertypeid) ? ItemData.usertypeid : "",
          "dob": (ItemData.dob) ? ItemData.dob : "",
          "email": (ItemData.email) ? ItemData.email : "",
          "contactno": (ItemData.contactno) ? ItemData.contactno : "",
        };
        userListObject.hub = {
          "hubid": (ItemData.hubid) ? ItemData.hubid._id : "",
          "hubname": (ItemData.hubid) ? ItemData.hubid.hubname : "",
        }
        return LoginLog.findOne({
          "userid": ItemData._id,
          "vehicleid": { $exists: true },
          'logindatetime': {
            $gt: moment().utc().format("YYYY-MM-DD") + "T00:00:00.000Z",
            $lt: moment().utc().format(),
          },
          "isauthenticated": true
        }).sort({ logindatetime: -1 }).populate('vehicleid').then(function (VehicleAssignedData) {
          if (VehicleAssignedData) {
            userListObject.vehicleData = {
              "name": (VehicleAssignedData.vehicleid) ? VehicleAssignedData.vehicleid.name : "",
              "vehicleid": (VehicleAssignedData.vehicleid) ? VehicleAssignedData.vehicleid._id : "",
              "vehiclenumber": (VehicleAssignedData.vehicleid) ? VehicleAssignedData.vehicleid.vehiclenumber : "",
              "activatebysuperadmin": (VehicleAssignedData.vehicleid) ? VehicleAssignedData.vehicleid.activatebysuperadmin : "",
              "activatebyuser": (VehicleAssignedData.vehicleid) ? VehicleAssignedData.vehicleid.activatebyuser : "",
              "deviceid": VehicleAssignedData.deviceid,
            }
          } else {
            userListObject.vehicleData = {
              "name": "",
              "vehicleid":"",
              "vehiclenumber": "",
              "activatebysuperadmin":0,
              "activatebyuser":0,
              "deviceid": ""
            }
          }
          userListObject.islogout = (VehicleAssignedData) ? VehicleAssignedData.islogout : false;
          userList.push(userListObject);
        })
      }).then(function () {
        return userList;
      });
    } else {
      throw new ErrorHelper.BadRequest("Something went wrong.", "error");
    }
  }).catch(function (error) {
    console.log("error", error)
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  });
}

// handle CreateUsers Services.
exports.CreateVendors = function (params, password) {
  var myData = new User(params);
  var RoleName = [];
  return myData.save().then(function (item) {
    if (item) {
      return bPromise.all(item.roletype).each(function (RoleId) {
        return Roleswrites.findOne({ "_id": RoleId }).populate('roleid').then(function (roleData) {
          RoleName.push(roleData.roleid.rolename);
        })
      }).then(function () {
        return Organization.findOne({ _id: item.organizationid }).then(function (OrganizationData) {
          var mailOptions = {
            from: 'no-reply@yourdomain.com',
            to: item.email,
            subject: 'Notification Mail',
            html: `<style>
            body {
                font-family: Arial, Helvetica, sans-serif;
                margin: 0;
                padding: 110px 0 0;
                overflow-x: hidden;
            }
    
            .login-header {
                position: absolute;
                top: 0;
                margin-bottom: 50px;
                z-index: 1;
                width: 100%;
                background: #181818;
                padding: 5px 0;
                height: 82px;
            }
    
            .login-header img {
                max-width: 94px;
                padding: 10px 0;
            }
    
            .container-fluid {
                width: 100%;
                padding-right: 15px;
                padding-left: 15px;
                margin-right: auto;
                margin-left: auto;
            }
    
            .container-box {
                margin: auto;
                max-width: 1170px;
                padding: 0 15px;
                overflow: hidden;
            }
            .blue-txt{
                color:#0089D0;
            }
        </style>
        <div class="login-header">
            <div class="container-fluid">
              <div class="logo"><a href="#"><img _ngcontent-c1="" src="../../public/images/sidebarnymbus.png"></a></div>
            </div>
          </div>
          <div class="iot-wrapper">
              <div class="container-box">
                  <div class="content-box">
                      <p>Dear <span class="blue-txt"><strong>${item.firstname} ${item.lastname}</strong></span>,</p>
                      <p>You are registered with [${OrganizationData.organizationname}], with Role ${RoleName} to access the
                          website, please click on link below :</p>
                      <p><a href="http://103.1.114.100/IotAdmin">http://103.1.114.100/IotAdmin</a></p>
                      <p><strong>Your credentials are as follows:</strong></p>
                      <p>User - [${item.email}]</p>
                      <p>Password - [${password}]</p>
                      <p style="text-align: right;">
                          Thanks!<br />
                          <span class="blue-txt"><strong>Team Nymbus</strong></span>
                      </p>
                  </div>
  
              </div>
          </div>`,
          };
          transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
            } else {
              console.log("err========else=", item)
              return item
            }
          })
        })
      })
    }
  }).catch(function (error) {
	  console.log("error error",error);
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

exports.UpdateVendors = function (Id, updateparams) {
  var whereparams = Id
  var query = { $set: updateparams }
  return User.updateOne(whereparams, query).then(function (Item) {
    return Item;
  }).catch(function (error) {
    res.json(error);
  })
}

exports.CreateUserWallets = function (params) {
  var WalletData = new UserWallet(params)
  return WalletData.save().then(function (Item) {
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

exports.UpdatePassword = function (Id, updateparams, params) {

  return User.findOne({ "_id": Id }).then(function (Item) {
    console.log("Item", Item)
    if (!BCrypt.compareSync(params.currentpassowrd, Item.password)) {
      console.log("asdasdasd")
    } else {
      console.log("else")
      return User.updateOne({ _id: Id }, { $set: updateparams }, { new: true }).then(function (Item) {
        return Item;
      }).catch(function (error) {
        res.json(error);
      })
    }
  }).catch(function (error) {
    console.log("error", error)
  })
}


exports.ResetPassword = function (Id, updateparams) {
  return User.findOne({ "_id": Id }).then(function (Item) {
    return User.updateOne({ _id: Id }, { $set: updateparams }, { new: true }).then(function (Item) {
      return Item;
    }).catch(function (error) {
      res.json(error);
    })
  }).catch(function (error) {
    console.log("error", error)
  })
}

exports.BlockedUser = function (params) {
  var updateparams = {
    "isactive": params.isactive
  }
  return User.updateOne({ _id: params.Id }, { $set: updateparams }).then(function (Item) {
    return Item;
  }).catch(function (error) {
    res.json(error);
  })
}

exports.GetProfileData = function (params) {
  return User.findOne(params).populate('organizationid').then(function (Item) {
    if (Item) {
      return {
        "isactive": Item.isactive,
        "_id": Item._id,
        "hubid": Item.hubid,
        "usertypeid": Item.usertypeid,
        "contactno": Item.contactno,
        "firstname": Item.firstname,
        "username": Item.username,
        "password": Item.password,
        "middlename": Item.middlename,
        "dob": moment(Item.dob).utc().format("DD MMM, YYYY"),
        "lastname": Item.lastname,
        "email": Item.email,
        "lastotp": Item.lastotp,
        "lastotprequestdatetime": Item.lastotprequestdatetime,
        "address": Item.address,
        "deviceid": Item.deviceid,
        "profileImg": config.url + "iotnode/uploads/" + Item.profileImg
      }
    } else {
      var Item = "";
      return Item
    }
  }).catch(function (error) {
    res.json(error);
  })
}

exports.GetUsersTypesData = function () {
  return UserType.find({ $or: [{ "typename": "Driver" }, { "typename": "Manager" }] }).then(function (Data) {
    return Data
  }).catch(function (error) {
    res.json(error);
  })
}

exports.getAllUserTypeList = function (UserTypeId) {
  var whereparams = {
    "_id": UserTypeId
  }
  return UserType.findOne(whereparams).then(function (Data) {
    return Data
  }).catch(function (error) {
    res.json(error);
  })
}

exports.GetUserDetails = function (params) {
  return User.findOne(params).populate('usertypeid').populate('hubid').populate('organizationid').then(function (Item) {
    return Item;
  }).catch(function (error) {
    res.json(error);
  })
}

exports.CreateUserLog = function (params) {
  var MyData = new UserLog(params)
  return MyData.save().then(function (item) {
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

exports.GetManagerUserData = function (params) {
  return User.find(params).then(function (Item) {
    return Item;
  }).catch(function (error) {
    res.json(error);
  })
}

exports.CreateFaqQuestions = function (params) {
  var FaqData = new Faq(params);
  return FaqData.save().then(function (item) {
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

exports.FaqQuestionLists = function () {
  return Faq.find().sort({ answer: 1 }).then(function (Item) {
    return Item;
  }).catch(function (error) {
    res.json(error);
  })
}


exports.CreateComplaint = function (params, Image) {
  var saveparams = {
    title: params.title,
    detail: params.detail,
    picture: Image,
    status: "new",
    posteadby: params.posteadby,
    vehiclenumber: params.vehiclenumber,
  }
  var ComplaintData = new ComplaintLog(saveparams);
  return ComplaintData.save().then(function (item) {
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

exports.GetRegisterComplaint = function (params, AuthData) {
  var VehicleId = [];
  return Evehicle.find().then(function (VehicleData) {
    return bPromise.all(VehicleData).each(function (vehicelresult) {
      VehicleId.push(vehicelresult._id)
    }).then(function () {
      if(params.fromdate && params.todate){
        var complainwhereparams = {
          "datetime": {
            $gt: moment(params.fromdate).utc().add(1, 'days').format(),
            $lt: moment(params.todate).utc().add(1, 'days').format(),
          }
        }
      }
      else if (params.status == "new" ) {
        var complainwhereparams = {
          "status": "new",
          //"posteadby":AuthData._id,
          "vehiclenumber": { $in: VehicleId }
        }
      } else if (params.status == "resolved") {
        var complainwhereparams = {
          "status": "resolved",
          "posteadby":AuthData._id,
          //"vehiclenumber": { $in: VehicleId }
        }
      } else if (params.status == "pending") {
        var complainwhereparams = {
          "status": "pending",
          "posteadby":AuthData._id,
          //"vehiclenumber": { $in: VehicleId }
        }
      }
	  else{
       var complainwhereparams = {
         "datetime": {
           $gte: moment().utc().subtract(7, 'days').format(),
           $lt: moment().utc().format(),
         }
       }
     }
      return ComplaintLog.find(complainwhereparams).populate('vehiclenumber').sort({ title: 1 }).then(function (complainItem) {
        return bPromise.map(complainItem, function (Data) {
          var path = config.url + "iotnode/uploads/complaint/";
          return {
            "datetime": Data.datetime,
            "title": Data.title,
            "detail": Data.detail,
            "picture": Data.picture,
            "imagepath": path,
            "status": Data.status,
            "vehicleno": (Data.vehiclenumber.vehiclenumber)?Data.vehiclenumber.vehiclenumber:"",
            "vehiclename": (Data.vehiclenumber.name)?Data.vehiclenumber.name:"",
          }
        })
      })
    })
  }).catch(function (error) {
    console.log("error===============",error)
    res.json(error);
  })
}


exports.BookingSheet = function (params) {
  var Booking = new BookingDetail(params);
  return Booking.save().then(function (item) {
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

exports.ReleasingSheet = function (params, AuthData) {
  var whereparams = {
    "seatnumber": params.seatnumber,
    "vehiclenumber": params.vehiclenumber,
    "paidamount": 0
  }
  var Sorting = { datetime: 1 }
  return BookingDetail.findOne(whereparams).sort(Sorting).then(function (Item) {
    var updateparams = {
      "paidamount": params.paidamount,
      "endlat": params.currentlat,
      "endlng": params.currentlng
    }
    return BookingDetail.updateOne({ _id: Item._id }, { $set: updateparams }).then(function (Item) {
      return Item;
    }).catch(function (error) {
      res.json(error);
    })
    /*if (Item && Item.paidamount <= 0) {
      var releasingparams = {
        "seatnumber": Item.seatnumber,
        "currentlat": Item.currentlat,
        "currentlng": Item.currentlng,
        "vehiclenumber": Item.vehiclenumber,
        "paidamount": params.paidamount,
        "datetime": Item.datetime,
        "userid": AuthData._id
      }
      var ReleaseData = new BookingDetail(releasingparams)
      return ReleaseData.save().then(function (Item) {
        return Item;*/
  })
}

// exports.GetUserByOrganization = function(OrgId){
//   var whereparams = {
//     "organizationid":OrgId
//   }
//   return User.find(whereparams).populate('organizationid').populate('hubid').then(function (Item) {
//     if(Item.length>0){
//       return Item;
//     }else{
//       var Item = [];
//       return Item;
//     }
//   }).catch(function (error) {
//     res.json(error);
//   })
// }


exports.GetSingleUserInfo = function (Id) {
  return User.findOne(Id).then(function (Item) {
    if (Item) {
      return Item
    } else {
      var Item = "";
      return Item;
    }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })
}

exports.UpdateFaq = function (Id, updateparams) {
  return Faq.updateOne({ _id: Id }, { $set: updateparams }, { new: true }).then(function (Item) {
    return Item;
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })
}


exports.GetAllRoleLists = function () {
  return Roleswrites.find().populate('roleid').then(function (RoleData) {
    var Items = [];
    return bPromise.all(RoleData).each(function (RoleItem) {
      if (RoleItem.roleid.rolename != "SuperAdmin") {
        Items.push({
          "_id": RoleItem._id,
          "name": RoleItem.roleid.rolename,
          "read": RoleItem.read,
          "write": RoleItem.write,
          "notify": RoleItem.notify
        })
      }
    }).then(function () {
      return Items;
    })
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })
}

exports.CreateUserRole = function (params) {
  var Userrole = new UserRole(params)
  return Userrole.save.then(function (RoleData) {
    return RoleData;
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })
}

exports.GetSingleProfileSetting = function (params) {
  var whereparams = {
    "_id": params._id
  }
  return User.findOne(whereparams).populate("organizationid").then(function (Item) {
    return Item;
  }).then(function (Item) {
    var whereparams = {
      "_id": { $in: Item.roletype }
    }
    return Roleswrites.find(whereparams).then(function (RoleItem) {
      return {
        "roletype": RoleItem,
        "emailnotification": Item.emailnotification,
        "mobilenotification": Item.mobilenotification,
        "_id": Item.organizationid._id,
        "organizationid": Item.organizationid._id,
        "lastname": Item.lastname,
        "email": Item.email,
        "contactno": Item.contactno,
        "dob": Item.dob,
        "middlename": Item.middlename,
        "firstname": Item.firstname,
        "profileImg": config.url + "iotnode/uploads/" + Item.profileImg,
      }
    })
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })
}

// update single profile Setting
exports.UpdateSingleProfileSetting = function (whereparams, updateparams) {
  var whereparams = {
    _id: whereparams._id
  }
  return User.findOne(whereparams).then(function (Item) {
    return Item;
  }).then(function (Item) {
    if (Item) {
      if (updateparams.profileupdated == true) {
        var newImg = updateparams.profileImg;
        var type = newImg.split(';')[0].split('/')[1];
        var buff = new Buffer(newImg.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');
        var imageName = Date.now() + "." + type;
        fs.writeFile(__dirname + '/../../uploads/' + imageName, buff, function (err) {
          if (!err) {
            updateparams.profileImg = imageName
            return User.updateOne({ _id: whereparams._id }, { $set: updateparams }, { new: true }).then(function (updateItem) {
              return updateItem;
            })

          }
        })
      } else {
        updateparams.profileImg = Item.profileImg
        return User.updateOne({ _id: whereparams._id }, { $set: updateparams }, { new: true }).then(function (updateItem) {
          return updateItem;
        })
      }
    } else {
      var Item = {}
      return Item;
    }
  }).catch(function (error) {
    throw new ErrorHelper.BadRequest("Something went wrong.", error);
  })
}
/******************* FleetManagerUserList*/
exports.FleetManagerUserList = function () {
  var RoleTyprId = []
  return Mastserroles.findOne({"rolename" : "FleetManager"}).then(function(UtilityManagerId){
    return Roleswrites.findOne({"roleid":UtilityManagerId._id}).then(function(UtilityRoleId){
      if(UtilityRoleId){
        RoleTyprId.push(""+UtilityRoleId._id);
        var whereroleparams = {
          "roletype": { $in:RoleTyprId }
        }
        return User.find(whereroleparams).populate('organizationid').then(function (Data) {
          var UserIfno = [];
          return bPromise.all(Data).each(function (userData) {
            var whereroleRoleparams = {
              "_id": { $in: userData.roletype }
            }
            return Roleswrites.find(whereroleRoleparams).populate('roleid').then(function (RoleData) {
              UserIfno.push({
                "_id": userData._id,
                "email": userData.email,
                "firstname": userData.firstname,
                "usertypeid": userData.usertypeid,
                "organizationid": userData.organizationid._id,
                "organizationname": userData.organizationid.organizationname,
                "username": userData.username,
                "middlename": userData.middlename,
                "dob123": userData.dob,
                "lastname": userData.lastname,
                "contactno": userData.contactno,
                "hubid": userData.hubid,
                "roleData": (RoleData)?RoleData:"",
                "profileImg": config.url + "iotnode/uploads/" + userData.profileImg
              })
            })
          }).then(function () {
            return UserIfno;
          }).catch(function (error) {
            console.log("error===========", error)
          })
        })
      }else{
        var UserIfno = [];
        return UserIfno
      }
    })
  })
}

/******************** ChargingOperatorUserList*/
exports.ChargingOperatorUserList = function () {
  var RoleTyprId = []
  return Mastserroles.findOne({"rolename" : "ChargingOperator"}).then(function(UtilityManagerId){
    return Roleswrites.findOne({"roleid":UtilityManagerId._id}).then(function(UtilityRoleId){
      if(UtilityRoleId){
        RoleTyprId.push(""+UtilityRoleId._id);
        var whereroleparams = {
          "roletype": { $in:RoleTyprId }
        }
        return User.find(whereroleparams).populate('organizationid').then(function (Data) {
          var UserIfno = [];
          return bPromise.all(Data).each(function (userData) {
            var whereroleRoleparams = {
              "_id": { $in: userData.roletype }
            }
            return Roleswrites.find(whereroleRoleparams).populate('roleid').then(function (RoleData) {
              UserIfno.push({
                "_id": userData._id,
                "email": userData.email,
                "firstname": userData.firstname,
                "usertypeid": userData.usertypeid,
                "organizationid": userData.organizationid._id,
                "organizationname": userData.organizationid.organizationname,
                "username": userData.username,
                "middlename": userData.middlename,
                "dob123": userData.dob,
                "lastname": userData.lastname,
                "contactno": userData.contactno,
                "hubid": userData.hubid,
                "roleData": (RoleData)?RoleData:"",
                "profileImg": config.url + "iotnode/uploads/" + userData.profileImg
              })
            })
          }).then(function () {
            return UserIfno;
          }).catch(function (error) {
            console.log("error===========", error)
          })
        })
      }else{
        var UserIfno = [];
        return UserIfno
      }
    })
  })
}

/********************************* */
exports.ZonalManagerUserList = function(){
  var RoleTyprId = []
  return Mastserroles.findOne({"rolename" : "Utility"}).then(function(UtilityManagerId){
    return Roleswrites.findOne({"roleid":UtilityManagerId._id}).then(function(UtilityRoleId){
      if(UtilityRoleId){
        RoleTyprId.push(""+UtilityRoleId._id);
        var whereroleparams = {
          "roletype": { $in:RoleTyprId }
        }
        return User.find(whereroleparams).populate('organizationid').then(function (Data) {
          var UserIfno = [];
          return bPromise.all(Data).each(function (userData) {
            var whereroleRoleparams = {
              "_id": { $in: userData.roletype }
            }
            return Roleswrites.find(whereroleRoleparams).populate('roleid').then(function (RoleData) {
              UserIfno.push({
                "_id": userData._id,
                "email": userData.email,
                "firstname": userData.firstname,
                "usertypeid": userData.usertypeid,
                "organizationid": userData.organizationid._id,
                "organizationname": userData.organizationid.organizationname,
                "username": userData.username,
                "middlename": userData.middlename,
                "dob123": userData.dob,
                "lastname": userData.lastname,
                "contactno": userData.contactno,
                "hubid": userData.hubid,
                "roleData": (RoleData)?RoleData:"",
                "profileImg": config.url + "iotnode/uploads/" + userData.profileImg
              })
            })
          }).then(function () {
            return UserIfno;
          }).catch(function (error) {
            console.log("error===========", error)
          })
        })
      }else{
        var UserIfno = [];
        return UserIfno
      }
    })
  })
}

/***************************** sendNotificationToUser*/
exports.sendNotificationToUser = function (params) {
  var UserList = [];
  return ChargingStationLiveData.findOne({ "cs_id": params.cs_id }).then(function (LiveStationData) {
    return LiveStationData
  }).then(function (LiveStationData) {
    return ChargerStation.findOne({ _id: LiveStationData.stationid }).then(function (StationData) {
      return StationData
    }).then(function (StationData) {
      return User.findOne({ _id: StationData.fleetmanager }).then(function (fleetuser) {
        if(fleetuser){
          UserList.push({ "_id": fleetuser._id, "firstname": fleetuser.firstname, "lastname": fleetuser.lastname, "emailnotification": fleetuser.emailnotification, "mobilenotification": fleetuser.mobilenotification, "email": fleetuser.email, "contactno": fleetuser.contactno });
          return StationData;
        }
      })
    }).then(function (StationData) {
      return User.findOne({ _id: StationData.chargingoperator }).then(function (chargingOperatoruser) {
        if(chargingOperatoruser){
          UserList.push({ "_id": chargingOperatoruser._id, "firstname": chargingOperatoruser.firstname, "lastname": chargingOperatoruser.lastname, "emailnotification": chargingOperatoruser.emailnotification, "mobilenotification": chargingOperatoruser.mobilenotification, "email": chargingOperatoruser.email, "contactno": chargingOperatoruser.contactno });
          return StationData;
        }
      })
    }).then(function (StationData) {
      return User.findOne({ username: "Superadmin" }).then(function (superadminuser) {
        if(superadminuser){
          UserList.push({ "_id": superadminuser._id, "firstname": superadminuser.firstname, "lastname": superadminuser.lastname, "emailnotification": superadminuser.emailnotification, "mobilenotification": superadminuser.mobilenotification, "email": superadminuser.email, "contactno": superadminuser.contactno })
          return StationData;
        }
      })
    }).then(function (StationData) {
      var params2 = {
        "stationid": false,
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
        "emailRecipient": UserList,
        "lastalarmdatetime": moment().utc().format()
      };

      return ChargerStation.findOne({ "chargerstationid": params.cs_id }).then(function (StationId) {
        if (StationId) {
          params2.stationid = StationId._id
        }

        return new ChargerstationAlarmlog(params2).save().then(function (Item) {
          return Item;
        }).then(function () {
          return bPromise.all(UserList).each(function (userinfo) {
            if (userinfo.emailnotification) {
              var mailOptions = {
                from: 'no-reply@yourdomain.com',
                to: userinfo.email,
                subject: 'Notification Mail',
                html: 'Hi, <br/><br/>' + userinfo.firstname + ' ' + userinfo.lastname + '<br/>Your Station Name is : ' + StationData.name + '<br/>' + 'you station Id is : ' + StationData.chargerstationid + ' <br/><br/><br/> Thanks!!',
              };
              transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                } else {
                  if (userinfo.mobilenotification) {
                    var Contrycode = "+91";
                    AWS.config.update({
                      accessKeyId: config.accessKeyId,
                      secretAccessKey: config.secretAccessKey,
                      region: config.region
                    });
                    var sns = new AWS.SNS({ "region": config.region });
                    var params = {
                      Message: "Byee",
                      MessageStructure: 'text',
                      PhoneNumber: Contrycode.toString() + userinfo.contactno.toString()
                    };
                    sns.publish(params, function (err, data) {
                      if (err) {
                        console.log(err); // an error occurred  
                      } else {
                        console.log(data)
                      }
                    });
                  }
                }
              });
            }
          }).then(function () {
            var result = "Email hase been sent to registered email id";
            return result;
          })
        })
      })
    });
  }).catch(function (error) {
    console.log("error===============", error)
  })
}


exports.getNotificationUserbychargingstation = function (params) {
  return ChargerstationAlarmlog.findOne({
    "cs_id": params.cs_id
  }).sort({
    "_id": -1
  }).then(function (AlarmData) {
    if (AlarmData) {
      if (AlarmData.em_v1 != params.em_v1 || AlarmData.em_v2 != params.em_v2 || AlarmData.em_v3 != params.em_v3 || AlarmData.em_i1 != params.em_i1 || AlarmData.em_i2 != params.em_i2 || AlarmData.em_i3 != params.em_i3 || AlarmData.em_p1 != params.em_p1 || AlarmData.em_p2 != params.em_p2 || AlarmData.em_p3 != params.em_p3 || AlarmData.em_e1 != params.em_e1 || AlarmData.em_e2 != params.em_e2 || AlarmData.em_e3 != params.em_e3 || AlarmData.s1_sts != params.s1_sts || AlarmData.s2_sts != params.s2_sts || AlarmData.s3_sts != params.s3_sts || AlarmData.hlt_sts != params.hlt_sts || AlarmData.emg_sts != params.emg_sts) {
        return exports.sendNotificationToUser(params);
      } else {
        return true;
      }
    } else {
      return exports.sendNotificationToUser(params);
    }
  });
}

function ConvertNumberToBinary(no) {
  return Number(no).toString(2);
}
function GetActivatedAlarmData(source) {
  var sourceList = source.split('');
  return sourceList.reverse();
}


exports.sendBatteryDataNotificationToUser = function (params) {
  var UserList = [];
  var MessageAlaram = [];
  return Telemetrylog.findOne({ "telemetryboardid": params.telemetryboardid }).sort({_id:-1}).then(function (BatteryLiveData) {
    var BatteryLiveDataAlaramList = JSON.parse(BatteryLiveData.json);
    var FleetManagerAlarm1Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.al1), alaramDataJson.FleetManagerAlarm1Arr)
    var FleetManagerAlarm2Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.al2), alaramDataJson.FleetManagerAlarm2Arr)
    var FleetManagerAlarm3Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.al3), alaramDataJson.FleetManagerAlarm3Arr)
    var FleetManagerAlarm4Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.al4), alaramDataJson.FleetManagerAlarm4Arr)

    var SystemIntegraterAlarm1Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.al1), alaramDataJson.SystemIntegraterAlarm1Arr)
    var SystemIntegraterAlarm2Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.al2), alaramDataJson.SystemIntegraterAlarm2Arr)
    var SystemIntegraterAlarm3Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.al3), alaramDataJson.SystemIntegraterAlarm3Arr)
    var SystemIntegraterAlarm4Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.al4), alaramDataJson.SystemIntegraterAlarm4Arr)

    var BatteryManufacturerAlarm1Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.al1), alaramDataJson.BatteryManufacturerAlarm1Arr)
    var BatteryManufacturerAlarm2Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.al2), alaramDataJson.BatteryManufacturerAlarm2Arr)
    var BatteryManufacturerAlarm3Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.al3), alaramDataJson.BatteryManufacturerAlarm3Arr)
    var BatteryManufacturerAlarm4Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.al4), alaramDataJson.BatteryManufacturerAlarm4Arr)

    var SuperAdminAlarm1Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.al1), alaramDataJson.SuperAdminAlarm1Arr)
    var SuperAdminAlarm2Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.al2), alaramDataJson.SuperAdminAlarm2Arr)
    var SuperAdminAlarm3Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.al3), alaramDataJson.SuperAdminAlarm3Arr)
    var SuperAdminAlarm4Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.al4), alaramDataJson.SuperAdminAlarm4Arr)

    MessageAlaram.push({ "FleetManagerAlarmMessage": FleetManagerAlarm1Message, FleetManagerAlarm2Message, FleetManagerAlarm3Message, FleetManagerAlarm4Message }, { "SystemIntegraterAlarmMessage": SystemIntegraterAlarm1Message, SystemIntegraterAlarm2Message, SystemIntegraterAlarm3Message, SystemIntegraterAlarm1Message }, { "BatteryManufacturerAlarmMessage": SystemIntegraterAlarm4Message, BatteryManufacturerAlarm1Message, BatteryManufacturerAlarm2Message, BatteryManufacturerAlarm3Message }, { "SuperAdminAlarmMessage": BatteryManufacturerAlarm4Message, SuperAdminAlarm1Message, SuperAdminAlarm2Message, SuperAdminAlarm3Message, SuperAdminAlarm4Message });
    return BatteryLiveData
  }).then(function (BatteryLiveData) {
    return Evehicle.findOne({ _id: BatteryLiveData.vehicleid }).then(function (VehicleData) {
      return VehicleData
    }).then(function (VehicleData) {
      return User.findOne({ username: "Superadmin" }).then(function (superadminuser) {
        UserList.push({ "_id": superadminuser._id, "firstname": superadminuser.firstname, "lastname": superadminuser.lastname, "emailnotification": superadminuser.emailnotification, "mobilenotification": superadminuser.mobilenotification, "email": superadminuser.email, "contactno": superadminuser.contactno })
        return VehicleData;
      })
    }).then(function (VehicleData) {
      var params2 = {
        "telemetryboardid": (params.telemetryboardid) ? params.telemetryboardid : "",
        "al1": (params.al1) ? params.al1 : "",
        "al1": (params.al1) ? params.al2 : "",
        "al2": (params.al2) ? params.em_al3 : "",
        "al3": (params.al3) ? params.al3 : "",
        "al4": (params.al4) ? params.al4 : "",
        "st1": (params.st1) ? params.st1 : "",
        "st2": (params.st2) ? params.st2 : "",
        "emailRecipient": UserList,
        "lastalarmdatetime": moment().utc().format()
      };
      return new BatteryDataAlaramLog(params2).save().then(function (Item) {
        return Item;
      }).then(function () {
        return bPromise.all(UserList).each(function (userinfo, Index) {
          if (userinfo.emailnotification) {
            var mailOptions = {
              from: 'no-reply@yourdomain.com',
              to: userinfo.email,
              subject: 'Notification Mail',
              html: 'Hi, <br/><br/>' + userinfo.firstname + ' ' + userinfo.lastname + '<br/>Your Station Name is : ' + VehicleData.name + '<br/>' + 'you vehicle number is : ' + VehicleData.vehiclenumber + ' <br/>BatteryAlaram Message:<br/><br/> Thanks!!',
            };
            transporter.sendMail(mailOptions, function (err, info) {
              if (err) {
                console.log(err)
              } else {
                if (userinfo.mobilenotification) {
                  var Contrycode = "+91";
                  AWS.config.update({
                    accessKeyId: config.accessKeyId,
                    secretAccessKey: config.secretAccessKey,
                    region: config.region
                  });
                  var sns = new AWS.SNS({ "region": config.region });
                  var params = {
                    Message: "Byee",
                    MessageStructure: 'text',
                    PhoneNumber: Contrycode.toString() + userinfo.contactno.toString()
                  };
                  sns.publish(params, function (err, data) {
                    if (err) {
                      console.log(err); // an error occurred  
                    } else {
                      console.log(data)
                    }
                  });
                }
              }
            });
          }
        }).then(function () {
          var result = "Email hase been sent to registered email id";
          return result;
        })
      })
    });
  }).catch(function (error) {
    console.log("error===============", error)
  })
}

/*********************Get Notification By BatteryData */
exports.getNotificationUserbyBatteryData = function (params) {
  return BatteryDataAlaramLog.findOne({
    "telemetryboardid": params.telemetryboardid
  }).sort({
    "_id": -1
  }).then(function (BatteryAlarmData) {
    if (BatteryAlarmData) {
      if (BatteryAlarmData.al1 != params.al1 || BatteryAlarmData.al2 != params.al2 && BatteryAlarmData.al3 != params.al3 && BatteryAlarmData.al4 != params.al4 && BatteryAlarmData.st1 != params.st1 && BatteryAlarmData.st2 != params.st2) {
        return exports.sendBatteryDataNotificationToUser(params);
      } else {
        return true;
      }
    } else {
      return exports.sendBatteryDataNotificationToUser(params);
    }
  });
}

//******  GetChargingStationAlaramList */
exports.GetChargingStationAlaramList = function (CS_Id) {
  var Scoket1 = []
  var Scoket2 = []
  var Scoket3 = []
  var Scoket4 = []
  var result = [];
  return ChargingStationLiveData.findOne({ "cs_id": CS_Id }).sort({ _id: 1 }).then(function (chargingstationLiveData) {
    var LiveData = JSON.parse(chargingstationLiveData.json);
  
    if (parseFloat(LiveData.em_v1) < 200) {
      Scoket1.push({ "message": "Low Voltage in R-Phase" })
    }
    if (parseFloat(LiveData.em_v1) > 270) {
      Scoket1.push({ "message": "High Voltage in R-Phase" })
    }
    if (parseFloat(LiveData.em_l1) > 15 && parseFloat(LiveData.s1_sts) == 2) {
      Scoket1.push({ "message": "Over load in Socket 1" })
    }
    if (parseFloat(LiveData.em_p1) > 3.3) {
      Scoket1.push({ "message": "Power limit exceeded in Socket 1" })
    }
    if (parseFloat(LiveData.s1_sts) == 6) {
      Scoket1.push({ "message": "Socket 1 faulty" })
    }


    if (parseFloat(LiveData.em_l2) > 15 && parseFloat(LiveData.s2_sts) == 2) {
      Scoket2.push({ "message": "Over load in Socket 1" })
    }
    if (parseFloat(LiveData.em_v2) < 200) {
      Scoket2.push({ "message": "Low Voltage in R-Phase" })
    }
    if (parseFloat(LiveData.em_v2) > 270) {
      Scoket2.push({ "message": "High Voltage in R-Phase" })
    }

    if (parseFloat(LiveData.em_p2) > 3.3) {
      Scoket2.push({ "message": "Power limit exceeded in Socket 2" })
    }
    if (parseFloat(LiveData.s2_sts) == 6) {
      Scoket2.push({ "message": "Socket 2 faulty" })
    }


    if (parseFloat(LiveData.em_l3) > 15 && parseFloat(LiveData.s3_sts) == 2) {
      Scoket3.push({ "message": "Over load in Socket 3" })
    }
    if (parseFloat(LiveData.em_v3) < 200) {
      Scoket3.push({ "message": "Low Voltage in R-Phase" })
    }
    if (parseFloat(LiveData.em_v3) > 270) {
      Scoket3.push({ "message": "High Voltage in R-Phase" })
    }

    if (parseFloat(LiveData.em_p3) > 3.3) {
      Scoket3.push({ "message": "Power limit exceeded in Socket 3" })
    }
    if (parseFloat(LiveData.s3_sts) == 6) {
      Scoket3.push({ "message": "Socket 3 faulty" })
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
    return result;
  }).then(function (result) {
    return result;
  }).catch(function (error) {

  })
}

function ConvertNumberToBinary(no) {
  return Number(no).toString(2);
}

function GetActivatedAlarmData(arr, AlaramArr) {
  var temp_arr = [];
  var a = arr.split('');
  var b = a.reverse();
  let ab = AlaramArr;
  b.forEach(function (value, key) {
    if (value == 1) {

      temp_arr.push(ab[key])

    }
  })
  return temp_arr;
}



exports.GetBatteryDataAlaramList = function (TelemetryId) {
  return Telemetrylog.findOne({ "telemetryboardid": TelemetryId }).sort({ _id: -1 }).then(function (BatteryLiveData) {
    if (BatteryLiveData) {
      var MessageAlaram = []
      var BatteryLiveDataAlaramList = JSON.parse(BatteryLiveData.json);
      var FleetManagerAlarm1Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.AL1), alaramDataJson.FleetManagerAlarm1Arr)
      var FleetManagerAlarm2Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.AL2), alaramDataJson.FleetManagerAlarm2Arr)
      var FleetManagerAlarm3Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.AL3), alaramDataJson.FleetManagerAlarm3Arr)
      var FleetManagerAlarm4Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.AL4), alaramDataJson.FleetManagerAlarm4Arr)

      var SystemIntegraterAlarm1Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.AL1), alaramDataJson.SystemIntegraterAlarm1Arr)
      var SystemIntegraterAlarm2Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.AL2), alaramDataJson.SystemIntegraterAlarm2Arr)
      var SystemIntegraterAlarm3Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.AL3), alaramDataJson.SystemIntegraterAlarm3Arr)
      var SystemIntegraterAlarm4Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.AL4), alaramDataJson.SystemIntegraterAlarm4Arr)

      var BatteryManufacturerAlarm1Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.AL1), alaramDataJson.BatteryManufacturerAlarm1Arr)
      var BatteryManufacturerAlarm2Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.AL2), alaramDataJson.BatteryManufacturerAlarm2Arr)
      var BatteryManufacturerAlarm3Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.AL3), alaramDataJson.BatteryManufacturerAlarm3Arr)
      var BatteryManufacturerAlarm4Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.AL4), alaramDataJson.BatteryManufacturerAlarm4Arr)

      var SuperAdminAlarm1Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.AL1), alaramDataJson.SuperAdminAlarm1Arr)
      var SuperAdminAlarm2Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.AL2), alaramDataJson.SuperAdminAlarm2Arr)
      var SuperAdminAlarm3Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.AL3), alaramDataJson.SuperAdminAlarm3Arr)
      var SuperAdminAlarm4Message = GetActivatedAlarmData(ConvertNumberToBinary(BatteryLiveDataAlaramList.AL4), alaramDataJson.SuperAdminAlarm4Arr)

      MessageAlaram.push({ "FleetManagerAlarmMessage": FleetManagerAlarm1Message, FleetManagerAlarm2Message, FleetManagerAlarm3Message, FleetManagerAlarm4Message }, { "SystemIntegraterAlarmMessage": SystemIntegraterAlarm1Message, SystemIntegraterAlarm2Message, SystemIntegraterAlarm3Message, SystemIntegraterAlarm1Message }, { "BatteryManufacturerAlarmMessage": SystemIntegraterAlarm4Message, BatteryManufacturerAlarm1Message, BatteryManufacturerAlarm2Message, BatteryManufacturerAlarm3Message }, { "SuperAdminAlarmMessage": BatteryManufacturerAlarm4Message, SuperAdminAlarm1Message, SuperAdminAlarm2Message, SuperAdminAlarm3Message, SuperAdminAlarm4Message });

      var UserList = [];
      return bPromise.map(MessageAlaram, function (AlaramMessage) {
        return Evehicle.findOne({ "telemetryboardid": BatteryLiveData.telemetryboardid }).then(function (VehicleData) {
          return User.findOne({ username: "Superadmin" }).then(function (superadminuser) {
            UserList.push({ "_id": superadminuser._id, "firstname": superadminuser.firstname, "lastname": superadminuser.lastname, "emailnotification": superadminuser.emailnotification, "mobilenotification": superadminuser.mobilenotification, "email": superadminuser.email, "contactno": superadminuser.contactno });
            return bPromise.all(UserList).each(function (userinfo, Index) {
              if (userinfo.emailnotification == true) {
                var mailOptions = {
                  from: 'no-reply@yourdomain.com',
                  to: userinfo.email,
                  subject: 'Notification Mail',
                  html: 'Hi, <br/><br/>' + userinfo.firstname + ' ' + userinfo.lastname + ',<br/><br/>Your Vehicle Name is : ' + VehicleData.name + '<br/>' + 'Your vehicle no is : ' + VehicleData.vehiclenumber + ' Alert Message: ' + AlaramMessage.SuperAdminAlarmMessage[Index].message + '<br/><br/><br/> Thanks!!',
                };
                transporter.sendMail(mailOptions, function (err, info) {
                  if (err) {
                  } else {
                    if (userinfo.mobilenotification) {
                      var Contrycode = "+91";
                      AWS.config.update({
                        accessKeyId: config.accessKeyId,
                        secretAccessKey: config.secretAccessKey,
                        region: config.region
                      });
                      var sns = new AWS.SNS({ "region": config.region });
                      var params = {
                        Message: "Byee",
                        MessageStructure: 'text',
                        PhoneNumber: Contrycode.toString() + userinfo.contactno.toString()
                      };
                      sns.publish(params, function (err, data) {
                        if (err) {
                          console.log(err); // an error occurred  
                        } else {
                          return AlaramMessage;
                        }
                      });
                    }
                  }
                });
              }
            })
          })
        })
      }).then(function () {
        return AlaramMessage;
      })
    } else {
      return AlaramMessage;
    }
  }).catch(function (error) {
    console.log()
  })
}


//********************************************************************* */

/************** Service for Add Countrys */
exports.AddCountrys = function (countryparams) {
  var countryData = new Countrys(countryparams)
  return countryData.save().then(function (countryItem) {
    return countryItem
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

/************** Service for Add States */
exports.AddStates = function (stateparams) {
  var stateData = new States(stateparams)
  return stateData.save().then(function (stateItem) {
    return stateItem
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

/************** Service for Add Citys */
exports.AddCitys = function (cityparams) {
  var cityData = new Citys(cityparams)
  return cityData.save().then(function (cityItem) {
    return cityItem
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

//************************************========================================= */

/************** Service for update Countrys */
exports.UpdateCountrys = function (Id, updateparams) {
  return Countrys.find({ _id: Id }).then(function (CountryData) {
    if (CountryData) {
      return Countrys.updateOne({ _id: Id }, { $set: updateparams }, { new: true }).then(function (updateCountryItem) {
        return updateCountryItem;
      })
    } else {
      var updateCountryItem = [];
      return updateCountryItem
    }
  }).catch(function (error) {
    return error;
  })
}

/************** Service for update States */
exports.UpdateStates = function (Id, updateparams) {
  return States.find({ _id: Id }).then(function (StateData) {
    if (StateData) {
      return States.updateOne({ _id: Id }, { $set: updateparams }, { new: true }).then(function (updateStateItem) {
        return updateStateItem;
      })
    } else {
      var updateStateItem = [];
      return updateStateItem;
    }
  }).catch(function (error) {
    return error;
  })
}

/************** Service for update Citys */
exports.UpdateCitys = function (Id, updateparams) {
  return Citys.find({ _id: Id }).then(function (CityData) {
    if (CityData) {
      return Citys.updateOne({ _id: Id }, { $set: updateparams }, { new: true }).then(function (updateCityItem) {
        return updateCityItem;
      })
    } else {
      var updateCityItem = [];
      return updateCityItem
    }
  }).catch(function (error) {
    return error;
  })
}



//************************************========================================= */
/************** Service for update Countrys */
exports.DeleteCountrys = function (Id, updateparams) {
  return Countrys.find({ _id: Id }).then(function (CountryData) {
    if (CountryData) {
      updateparams.status = false;
      return Countrys.updateOne({ _id: Id }, { $set: updateparams }, { new: true }).then(function (updateCountryItem) {
        return updateCountryItem;
      })
    } else {
      var updateCountryItem = [];
      return updateCountryItem
    }
  }).catch(function (error) {
    return error;
  })
}

/************** Service for update States */
exports.DeleteStates = function (Id, updateparams) {
  return States.find({ _id: Id }).then(function (StateData) {
    if (StateData) {
      updateparams.status = false;
      return States.updateOne({ _id: Id }, { $set: updateparams }, { new: true }).then(function (updateStateItem) {
        return updateStateItem;
      })
    } else {
      var updateStateItem = [];
      return updateStateItem;
    }
  }).catch(function (error) {
    return error;
  })
}

/************** Service for update Citys */
exports.DeleteCitys = function (Id, updateparams) {
  return Citys.find({ _id: Id }).then(function (CityData) {
    if (CityData) {
      updateparams.status = false;
      return Citys.updateOne({ _id: Id }, { $set: updateparams }, { new: true }).then(function (updateCityItem) {
        return updateCityItem;
      })
    } else {
      var updateCityItem = [];
      return updateCityItem
    }
  }).catch(function (error) {
    return error;
  })
}


//************************************========================================= */

/************** Service for update Countrys */
exports.GetCountrys = function (Id) {
  return Countrys.find({ _id: Id }).then(function (CountryData) {
    if (CountryData) {
      return CountryData;
    } else {
      var updateCountryItem = [];
      return updateCountryItem
    }
  }).catch(function (error) {
    return error;
  })
}

/************** Service for update States */
exports.GetStates = function (Id) {
  return States.find({ _id: Id }).then(function (StateData) {
    if (StateData) {
      return StateData;
    } else {
      var updateStateItem = [];
      return updateStateItem;
    }
  }).catch(function (error) {
    return error;
  })
}

/************** Service for update Citys */
exports.GetCitys = function (Id) {
  return Citys.find({ _id: Id }).then(function (CityData) {
    if (CityData) {
      return CityData;
    } else {
      var updateCityItem = [];
      return updateCityItem;
    }
  }).catch(function (error) {
    return error;
  })
}


exports.GetBatteryManufacturer = function () {
 var RoleTyprId = []
 return Mastserroles.findOne({ "rolename": "BatteryManufaturer" }).then(function (BattermanufactureId) {
   return Roleswrites.findOne({ "roleid": BattermanufactureId._id }).then(function (RoleId) {
     if (RoleId) {
       RoleTyprId.push("" + RoleId._id);
       var whereroleparams = {
         "roletype": { $in: RoleTyprId }
       }
       return User.find(whereroleparams).populate('organizationid').then(function (Data) {
         var UserIfno = [];
         return bPromise.all(Data).each(function (userData) {
           var whereroleRoleparams = {
             "_id": { $in: userData.roletype }
           }
           return Roleswrites.find(whereroleRoleparams).populate('roleid').then(function (RoleData) {
             UserIfno.push({
               "_id": userData._id,
               "email": userData.email,
               "firstname": userData.firstname,
               "usertypeid": userData.usertypeid,
               "organizationid": userData.organizationid._id,
               "organizationname": userData.organizationid.organizationname,
               "username": userData.username,
               "middlename": userData.middlename,
               "dob123": userData.dob,
               "lastname": userData.lastname,
               "contactno": userData.contactno,
               "hubid": userData.hubid,
               "roleData": (RoleData) ? RoleData : "",
               "profileImg": config.url + "iotnode/uploads/" + userData.profileImg
             })
           })
         }).then(function () {
           return UserIfno;
         }).catch(function (error) {
           console.log("error===========", error)
         })
       })
     } else {
       var UserIfno = [];
       return UserIfno
     }
   })
 })
}



exports.GetBatteryManufacturerList = function(){
 return BatterManufacturer.find().populate('userid').then(function(BatteryManufacturerList){
   if(BatteryManufacturerList.length > 0){
     return bPromise.map(BatteryManufacturerList,function(Item){
       return {
         "_id":Item._id,
         "userid":Item.userid._id,
         "batteryAggregator":Item.userid.firstname + " " + Item.userid.lastname,
         "name":Item.name,
         "code":Item.code
       }
     })
   }else{
     var BatteryManufacturerList = [];
     return BatteryManufacturerList;
   }
 }).catch(function(error){
   throw new ErrorHelper.BadRequest("Something went wrong.", error);
 })
}
exports.CreateBatteryManufacture = function(params){
 var batterManufacturer = new BatterManufacturer(params)
 return batterManufacturer.save().then(function(batterManufacturerData){
   return batterManufacturerData;
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


/*UpdateBatteryManufacturer */
exports.UpdateBatteryManufacturer = function(params){
 var updateparams = {
   "name":params.name,
   "code":params.code,
   "userid":params.userid
 }
 return BatterManufacturer.updateOne({ _id: params._id }, { $set: updateparams }, { new: true }).then(function (UpdateBatteryManufacturer) {
   return UpdateBatteryManufacturer;
 }).catch(function(error){
   throw new ErrorHelper.BadRequest("Something went wrong.", error);
 })
}

exports.ActiveInactiveFaq = function(Item){
 var updateparams = {
   "isactive":Item.isactive
 }
 return Faq.findOne({ _id: Item.Id }).then(function (FaqItem) {
   if(FaqItem){
     return Faq.updateOne({ _id: FaqItem._id }, { $set: updateparams }).then(function (Item) {
       return Item.isactive;
     })
   }else{
     var Item = [];
     return Item;
   }
 }).catch(function (error) {
   return error;
 })
}
