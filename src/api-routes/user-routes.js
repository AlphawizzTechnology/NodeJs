let router = require('express').Router();
// Import User controller
var userController = require('../controllers/userController');
var middleware = require('../middlewares/authusers.middleware');

// User routes

router.route('/userList').post(middleware.getTokenDetails,userController.UserList);
router.route('/userTypeList').get(userController.getUserTypeList);
router.route('/fleetManagerUserList').get(middleware.getTokenDetails, userController.FleetManagerUserList);
router.route('/chargingOperatorUserList').get(middleware.getTokenDetails, userController.ChargingOperatorUserList);
router.route('/zonalmanagerUserList').get(userController.ZonalManagerUserList);
router.route('/blockeUser').post(userController.BlockedUser);
router.route('/userDetails/:Id').get(userController.UserDetailList);
router.route('/getsingleprofilesetting').get(middleware.getTokenDetails, userController.GetSingleProfileSetting);
router.route('/updatesingleprofilesetting').put(middleware.getTokenDetails, userController.UpdateSingleProfileSetting);
router.route('/createVendor').post(middleware.requireAccessKey,userController.CreateVendor);
router.route('/createUserWallet').post(middleware.requireAccessKey,userController.CreateUserWallet);
router.route('/getUserProfile').get(middleware.getTokenDetails,userController.GetUserProfile);
router.route('/updatepassword').post(middleware.getTokenDetails, userController.UpdatePassword);
router.route('/sendOTP').post(userController.sendOTP);
router.route('/VerifyOTP').post(userController.VerifyOTP);
router.route('/resetPassword').post(userController.resetPassword);
router.route('/createuserhublog').post(middleware.getTokenDetails, userController.CreateUserlogData);
router.route('/getManagerUserData').post(userController.GetManagerUserData);
router.route('/faq').post(userController.CreateFaq);
router.route('/faqlist').post(userController.FaqList);
router.route('/faqupdate/:Id').post(userController.FaqUpdate);
router.route('/registercomplaint').post(middleware.getTokenDetails, userController.CreateComplaint);
router.route('/getregistercomplaint').post(middleware.getTokenDetails, userController.GetRegisterComplaint);
router.route('/bookSeat').post(middleware.getTokenDetails, userController.BookingSheet);
router.route('/releaseSeat').post(middleware.getTokenDetails, userController.ReleasingSheet);
router.route('/rolelist').get(userController.GetAllRoleList);
router.route('/rolecreate').get(userController.CreateRole);
router.route('/createbatterymanufacture').post(userController.CreateBatteryManufacturer);
router.route('/updatebatterymanufacture').put(userController.UpdateBatteryManufacturer);
router.route('/getbatterymanufacture').get(userController.GetBatteryManufacturer);
router.route('/getBatteryManufactureList').get(userController.GetBatteryManufacturerList);
// router.route('/getNotificationUserbychargingstation/:cs_id').get(userController.getNotificationUserbychargingstation);
// router.route('/getNotificationUserbybatterydata/:telemtry_id').get(userController.getNotificationUserbyBatteryData);
router.route('/getChargingStationAlarmList/:Id').get(userController.GetChargingStationAlaramList);
router.route('/getBatteryDataAlarmList/:Id').get(userController.GetBatteryDataAlaramList);
router.route('/faqactiveInactive').post(userController.ActiveInactiveFaq);

/*******add Country/state/City Route */
router.route('/addCountry').post(userController.AddCountry);
router.route('/addState').post(userController.AddState);
router.route('/addCity').post(userController.AddCity);

/*******get Country/state/City Route */
router.route('/getCountry/:Id').get(userController.GetCountry);
router.route('/getState/:Id').get(userController.GetState);
router.route('/getCity/:Id').get(userController.GetCity);

/*******update Country/state/City Route */
router.route('/updateCountry/:Id').put(userController.UpdateCountry);
router.route('/updateState/:Id').put(userController.UpdateState);
router.route('/updateCity/:Id').put(userController.UpdateCity);

/*******delete Country/state/City Route */
router.route('/deleteCountry/:Id').delete(userController.DeleteCountry);
router.route('/deleteState/:Id').delete(userController.DeleteState);
router.route('/deleteCity/:Id').delete(userController.DeleteCity);


module.exports = router;