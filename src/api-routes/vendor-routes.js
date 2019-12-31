let router = require('express').Router();
// Import contact controller
var vendorController = require('../controllers/venodrController');
var middleware = require('../middlewares/authusers.middleware');

// Contact routes
router.route('/createVendor').post(middleware.requireAccessKey, vendorController.CreateVendor)

module.exports = router;