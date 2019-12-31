// Filename: api-routes.js
// Initialize express router
let router = require('express').Router();
// Import contact controller
var AuthController = require('../controllers/authController');
var middleware = require('../middlewares/authusers.middleware');

// Contact routes

router.route('/login').post(AuthController.Login);
router.route('/createUser').post(middleware.getTokenDetails, AuthController.CreateUser);
router.route('/updateuser/:Id').put(middleware.getTokenDetails, AuthController.UpdateUser);
router.route('/startvehicle').post(middleware.getTokenDetails, AuthController.StartVehicle)
router.route('/user/me').post(middleware.requireAccessKey, middleware.authByEmail, AuthController.FindUser);
router.route('/verifyotp').post(middleware.getTokenDetails, AuthController.VerifyOpt);
router.route('/logoutuser').post(AuthController.LogoutUser);
router.route('/getbatteryData').post(AuthController.GetBatteryData);
router.route('/getdashboardData').post(middleware.getTokenDetails, AuthController.GetDashboardData);
router.route('/forgetpassword').post(AuthController.SendMailforForgetPassword);
router.route('/getSubAdminToken/:Id').get(middleware.getSubAdminTokenDetails, AuthController.GetSubAdminToken);
router.route('/createException').post(AuthController.CreateException);
router.route('/createRoles').post(middleware.getTokenDetails, AuthController.CreateRoles);
router.route('/countrylist').get(AuthController.GetCountryList);
router.route('/statelist/:countryId').get(AuthController.GetStateList);
router.route('/citylist/:stateId').get(AuthController.GetCityList);
router.route('/blockuserbyadmin').post(AuthController.BlockUserByAdmin);/*********Block user by admin */
router.route('/logoutsingleuser').post(AuthController.LogoutSingleUser);

// Export API routes
module.exports = router;