import { Hub } from '../models/';
// handle CreateUser Services.
exports.CreateVendors = function (params) {
  var myData = new Hub(params);
  return myData.save().then(function (item) {
    return item
  }).catch(function (err) {
    return err;
  });
}