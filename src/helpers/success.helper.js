var thingShadowsList = [];
var thingShadowNameList = [];

var awsIot = require('aws-iot-device-sdk');

import { UserType } from '../models/usertype';


/**
 * Handler for errors
 */
var returnSuccess = function (status, res, code, message, data) {
    if (!code) {
        code = status ? err.status : 200;
    }
    return res.status(code).json({
        Succeeded: status,
        Status: code,
        Message: message ? message : '',
        Data: data
    });
};

var returnUserTypes = function(Types){
   var whereparams = {
       "typename":Types
   }
   return UserType.findOne(whereparams).then(function(usertypes){
       if(usertypes){
           return usertypes;
       }else{
           var usertypes = [];
           return usertypes
       }
   })
}

var thingShadowsHelper = function(telemetryboardid, rgbLedLampState){
	console.log("Start ", telemetryboardid, rgbLedLampState)
	var clientTokenUpdate;
	var thingShadows = awsIot.thingShadow({
		keyPath: './07July/d739552e54-private.pem.key',
		certPath: './07July/d739552e54-certificate.pem.crt',
		caPath: './07July/root.cert',
		clientId: 'Policy30may',
		host: 'asoqa2zjmpz13.iot.ap-south-1.amazonaws.com',
		region: 'ap-south-1',
		port: 443, 
		ALPNProtocols: ["x-amzn-mqtt-ca"]  
	});



	thingShadows.on('connect', function() {
		console.log("telemetryboardid, rgbLedLampState", telemetryboardid, rgbLedLampState, thingShadowNameList)
		if(thingShadows){
			console.log('connect iiiii dfdsfdf', telemetryboardid, "SSCString", rgbLedLampState);
			thingShadows.register( telemetryboardid, {}, function() {
				console.log("register thing shadow")
				clientTokenUpdate = thingShadows.update(telemetryboardid, rgbLedLampState);
				if (clientTokenUpdate === null){
				  console.log('update shadow failed, operation still in progress');
				} else {
				   setTimeout(function(){
					   console.log('Unregister shadow', telemetryboardid);
					   //thingShadows.unregister(Data.telemetryboardid);
				   }, 1500);
				}
			});
		}
	});
	
	
}

module.exports.returnSuccess = returnSuccess;
module.exports.returnUserTypes = returnUserTypes;
module.exports.thingShadowsHelper = thingShadowsHelper;