let router = require('express').Router();
// Import contact controller
var vehicleController = require('../controllers/vehicleController');
var middleware = require('../middlewares/authusers.middleware');
router.route('/createVehicle').post(middleware.getTokenDetails, vehicleController.CreateVehicle);
router.route('/updateVehicle/:Id').put(middleware.getTokenDetails, vehicleController.UpdateVehicle);
router.route('/systemaggregatorupdateVehicle/:Id').put(middleware.getTokenDetails, vehicleController.UpdateVehicleSystemAggregator);
router.route('/vehicleTypeList').get(vehicleController.VehicleTypeList);
router.route('/vehicleDetail/:Id').get(vehicleController.VehicleDetail);
router.route('/vehicleList').get(middleware.getTokenDetails, vehicleController.VehicleList);
router.route('/allVehicleList').post(middleware.getTokenDetails, vehicleController.AllVehicleList);
router.route('/vehicleListAggregrator').post(middleware.getTokenDetails, vehicleController.GetVehiclListForAggregator);
router.route('/createBatteryData').post(middleware.requireAccessKey, vehicleController.CreateBatteryData);
router.route('/batteryList').get(middleware.getTokenDetails, vehicleController.BatteryList)
router.route('/changestatus').post(middleware.requireAccessKey, vehicleController.ChangeStatus);
router.route('/Authenticate').post(middleware.getTokenDetails, vehicleController.AuthenticateVehicle);
router.route('/AssignedVehicleData').post(middleware.getTokenDetails, vehicleController.AssignedVehicleData);
router.route('/unAuthenticate').post(middleware.getTokenDetails, vehicleController.DeAuthenticateVehicle);
router.route('/assignVehicle').post(middleware.getTokenDetails, vehicleController.AssignVehicle);/*********** AssignVehicle */
router.route('/GetBatteryData/:Id').get(vehicleController.GetBatteryIdData);/*********** GetBatteryIdData */
router.route('/addBatteryData').post(vehicleController.AddBatteryData);/*********** AddBatteryData */
/****************Add BM Data */

router.route('/GetBatteryDataforbm').get(vehicleController.GetBatteryIdDataBM);/*********** BatterManufucturing */
router.route('/GetBatteryDataforbmtemp').get(vehicleController.GetBatteryIdDataBMTemp);/*********** BatterManufucturing */

/****************End BM Data */
router.route('/mapchargerstationdistance/').post(vehicleController.GetDistancefromChargerStation);
router.route('/VehicleGraph').post(middleware.getTokenDetails, vehicleController.GenVehicleGraph);
router.route('/VehicleGraphsuperadmin').post(middleware.getTokenDetails, vehicleController.GenVehicleGraphAdmin);
router.route('/systemIntegreatorGraphDashboard').get(vehicleController.SystemIntegreatorGraph);
router.route('/ChargingStationGraph').post(middleware.getTokenDetails, vehicleController.GetchargingStationGraph);
router.route('/ChargingStationGraphadmin').post(middleware.getTokenDetails, vehicleController.GetchargingStationGraphAdmin);
router.route('/getVehicleDistanceChartData/:searchType').get(middleware.getTokenDetails, vehicleController.GetVehicleDistanceChart);
router.route('/getVehicleRevanueChartData/:searchType').get(middleware.getTokenDetails, vehicleController.GetVehicleRevanueChart);
router.route('/getVehicleType').get(middleware.getTokenDetails, vehicleController.GetVehicleTypes);
router.route('/vehicleDistance').post(middleware.getTokenDetails, vehicleController.CalculateVehicleDistance);
router.route('/vehicleRevenueLog').post(middleware.getTokenDetails, vehicleController.VehicleRevenueLog);
router.route('/gettestBatteryData').get(vehicleController.GetTestBatteryData);
router.route('/gettemptestBatteryData').get(vehicleController.GetTempTestBatteryData);
router.route('/addBatteryAlaramData').post(vehicleController.GetBatteryAlaramData);
router.route('/getVehicleReport/:to/:from/:telemetryboardid').get(middleware.getTokenDetails, vehicleController.GetVehicleReport);
router.route('/getVehicleReport').post(middleware.getTokenDetails, vehicleController.GetVehicleReport);
router.route('/getVehicleReport').post(middleware.getTokenDetails, vehicleController.GetVehicleReport);
router.route('/getVehicleByHub/:Id').get(vehicleController.HubVehicleList);
router.route('/getVehicleUtilizationFactorGraph').get(middleware.getTokenDetails, vehicleController.GetVehicleUtilizationFactorGraph);
//router.route('/webexception').post(vehicleController.WebException);

router.route('/ReserveOn/:vehicleid').get(vehicleController.ReserveOn);
router.route('/getVehicleUtilitiesChartData/:searchType').get(middleware.getTokenDetails, vehicleController.GetVehicleUtilitiesChartData);

module.exports = router;