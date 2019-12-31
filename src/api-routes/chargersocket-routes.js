// Filename: api-routes.js
// Initialize express router
let router = require('express').Router();
// Import contact controller
var chargersocketController = require('../controllers/chargersocketController');
var middleware = require('../middlewares/authusers.middleware');

// Contact routes
router.route('/createChargersocket').post(middleware.getTokenDetails,chargersocketController.CreateChargerSocket);
router.route('/updateChargerSocket/:Id').put(middleware.requireAccessKey,chargersocketController.UpdateChargerSocket);
router.route('/createChargerStation').post(middleware.requireAccessKey,chargersocketController.CreateChargerSation);
router.route('/updateChargerStation/:Id').put(middleware.requireAccessKey,chargersocketController.UpdateChargerSation);
router.route('/chargerStationDetails').post(middleware.requireAccessKey,chargersocketController.ChargerStationDetails);
router.route('/chargerStationDetailsforApp').post(middleware.requireAccessKey,chargersocketController.ChargerStationDetailsAPP);
router.route('/singlechargerStationDetails').post(middleware.getTokenDetails,chargersocketController.SingleChargerStationDetails);
router.route('/createChargerSocketLog').post(middleware.getTokenDetails,chargersocketController.CreateChargerSocketLog);
router.route('/ChargerStationMapList').post(middleware.getTokenDetails,chargersocketController.ChargerStationMapList);
router.route('/ChargerStationList').post(middleware.requireAccessKey,chargersocketController.ChargerStationData);
router.route('/createChargingLog').post(middleware.getTokenDetails,chargersocketController.CreateChargingLog);
router.route('/chargingCompleted').post(middleware.getTokenDetails,chargersocketController.ChargingCompleted);
router.route('/CreateBatteryLog').post(middleware.getTokenDetails,chargersocketController.CreateBatteryLogData);
router.route('/createTelemetrylog').post(middleware.getTokenDetails, chargersocketController.TelemetryLog);
router.route('/createChargerStationLiveData').post(chargersocketController.CreateChargerStationLiveData);
router.route('/getChargerStationLiveData').get(chargersocketController.GetChargerStationLiveData);
router.route('/gettempChargerStationLiveData').get(chargersocketController.GetTempChargerStationLiveData);
router.route('/allocateSocket/:Id').get(middleware.getTokenDetails, chargersocketController.SocketAllocationToDriver);
router.route('/travelhistory').post(middleware.getTokenDetails, chargersocketController.GetAllTravelHistory);
router.route('/travelhistoryMobile').post(chargersocketController.GetAllTravelHistory11);/***************GetAllTravelHistory routes */
router.route('/chargingStationGraph').post(chargersocketController.ChargingStationGraph);
router.route('/chargingStationGraphadmin').post(chargersocketController.ChargingStationGraphAdmin);
router.route('/getChargerReport/:to/:from/:chargerstationid').get(middleware.getTokenDetails, chargersocketController.GetChargingStationReport);
router.route('/getChargerReport').post(chargersocketController.GetChargingStationReport);
router.route('/startchargerstationport').post(middleware.getTokenDetails, chargersocketController.StartChargingStationport);
router.route('/getchargerstationport').post(middleware.getTokenDetails, chargersocketController.GetChargingstationPort);
router.route('/activeinactivechargingstation').post(middleware.getTokenDetails, chargersocketController.ActiveInactiveChargingStation);
router.route('/getzonechargingstation').post(chargersocketController.GetZoneChargingStation);

router.route('/getZonalManagerChargingStationList').get(middleware.getTokenDetails,chargersocketController.GetZonalManagerChargingStatinList);/***************GetZonalManagerChargingStatinList routes */
router.route('/getZonalManagerDashboard').get(middleware.getTokenDetails,chargersocketController.GetZonalManagerDashboard);/***************getZonalManagerDashboard routes */
router.route('/getChargingOperatorDashboard').get(middleware.getTokenDetails,chargersocketController.GetChargingOperatorDashboard);/***************getChargingOperatorDashboard routes */
//router.route('/getChargingOperatorRationGraph').get(middleware.getTokenDetails,chargersocketController.getChargingOperatorRationGraph);/***************getChargingOperatorRationGraph routes */
//router.route('/getChargingOperatorChargingStationList').get(middleware.getTokenDetails,chargersocketController.GetChargingOperatorStatinList);/***************getChargingOperatorChargingStationList routes */

router.route('/getChargingStationListByUserType/:usertype').get(middleware.getTokenDetails,chargersocketController.GetChargingStatinListByUserType);/***************getChargingOperatorChargingStationList routes */

router.route('/getChargingStationEnergyChartData/:searchType/:usertype').get(middleware.getTokenDetails,chargersocketController.GetChargingStationEnergyChartData);/***************GetChargingStationEnergyChartData routes */
router.route('/getChargingStationRevanueChartData/:searchType/:usertype').get(middleware.getTokenDetails, chargersocketController.GetChargingStationRevanueChart);/***************GetChargingStationRevanueChart routes */
router.route('/getChargingStationInstantaneousEnergyGraph').get(chargersocketController.GetStationInstantaneousEnergyGraph);


router.route('/getUtilizationRatioGraph/:usertype').get(middleware.getTokenDetails,chargersocketController.getUtilizationRationGraph);/***************getChargingOperatorRationGraph routes */
router.route('/getChargingSessionData').get(middleware.getTokenDetails,chargersocketController.GetChargingSessionData);/***************GetChargingStationRevanueChart routes */
router.route('/getChargingSessionTimeData/:searchType').get(middleware.getTokenDetails,chargersocketController.GetChargingSessionTimeData);/***************GetChargingStationRevanueChart routes */
router.route('/getChargingStationRationData/:usertype').get(middleware.getTokenDetails,chargersocketController.GetChargingStationRationData);
// Export API routes
router.route('/getFleetManagerLiveVehicleData').get(middleware.getTokenDetails,chargersocketController.GetFleetManagerDashboardData);/*****************Routes for getFleetManagerLiveVehicleData*/
module.exports = router;