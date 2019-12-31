let router = require('express').Router();
// Import Organization controller
var organizationController = require('../controllers/organizationController');
var middleware = require('../middlewares/authusers.middleware');

// Organization routes
//router.route('/createOrganization').post(middleware.getTokenDetails, organizationController.CreateOrganization);
router.route('/createorganization').post(middleware.getTokenDetails, organizationController.CreateOrganizations);
router.route('/createvendor').post(middleware.getTokenDetails, organizationController.CreateVendor);
router.route('/createOrganizationFromExcelFile').post(middleware.requireAccessKey, organizationController.CreateOrganizationFromExcel);
router.route('/updateOrganization/:Id').put(middleware.getTokenDetails, organizationController.UpdateOrganization);
router.route('/getOrganization/:Id').get(middleware.getTokenDetails, organizationController.GetOrganization);
router.route('/organizationList').post(middleware.requireAccessKey, organizationController.OrganizationList);
router.route('/basicOrganizationFilter').post(middleware.requireAccessKey, organizationController.FilterOrganizationList);/*****************OrganizationList routes */
router.route('/VendorList/:type').get(middleware.getTokenDetails, organizationController.VendorLists);
router.route('/singleVendorList/:Id').get(middleware.getTokenDetails, organizationController.SingleVendorLists);
router.route('/updateVendorList/:Id').put(middleware.getTokenDetails, organizationController.UpdateVendorLists);
router.route('/createZone').post(middleware.getTokenDetails, organizationController.CreateZone);
router.route('/getZoneList').post(middleware.getTokenDetails, organizationController.GetZoneList);
router.route('/deleteZone').get(middleware.getTokenDetails, organizationController.DeleteZone);
router.route('/zoneDetails/:Id').get(middleware.getTokenDetails, organizationController.GetZoneDetails);
router.route('/updateZone/:Id').put(middleware.getTokenDetails, organizationController.UpdateZone);
router.route('/activedeactiveganization').post(middleware.getTokenDetails, organizationController.ActiveInActiveOrganizations);
router.route('/activeinactivezone').post(middleware.getTokenDetails, organizationController.ActiveInactiveZone);
router.route('/activeinactivevendor').post(middleware.getTokenDetails, organizationController.ActiveInactiveVendor);

module.exports = router;