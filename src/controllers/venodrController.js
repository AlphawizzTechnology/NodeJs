// Import contact model';
var VendorServices = require('../services/vendorServices');

// final callback
exports.finalCallback = function (req, res, ErrorCode, Status, result, ErrorMessage, authKey) {
    if (authKey) {
        res.json({ "ErrorCode": ErrorCode, Status: Status, "user": result, "ErrorMessage": ErrorMessage, "auth-key": authKey });
    } else {
        res.json({ "ErrorCode": ErrorCode, Status: Status, "user": result, "ErrorMessage": ErrorMessage });
    }
}

// Handle CeateUser actions
exports.CreateVendor = function (req, res) {
    var params = req.body
    return VendorServices.CreateVendors(params).then(function (Data) {
        res.json({ "Status": 200, "result": Data, "Message": "User Created Successfully." });
    });
};