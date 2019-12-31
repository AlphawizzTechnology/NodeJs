let router = require('express').Router();
// Import contact controller
var hubController = require('../controllers/hubController');
var middleware = require('../middlewares/authusers.middleware');

// Contact routes
router.route('/createHub').post(middleware.getTokenDetails, hubController.CreateHub);
router.route('/createHubFromExcelFile').post(middleware.getTokenDetails, hubController.CreateHubFromExcel);
router.route('/updateHub/:Id').put(middleware.getTokenDetails, hubController.UpdateHub);
router.route('/hubDetails/:Id').get(hubController.HubDetail)
router.route('/hubList').post(middleware.getTokenDetails, hubController.HubList);
router.route('/createHubLog').post(middleware.getTokenDetails, hubController.CreateHubLog);
router.route('/Addhubmanager').post(hubController.CreateHubManager);
router.route('/findUnAssignedHubList').get(hubController.FindUnAssignedHubList);
router.route('/activeinactivehub').post(middleware.getTokenDetails, hubController.ActiveInactiveHub);

module.exports = router;