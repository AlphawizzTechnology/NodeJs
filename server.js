// server.js
import express from 'express';
import bodyParser from 'body-parser';
var path = require('path');
var passport = require('./authenticate');
var cookieParser = require('cookie-parser');
import mongoose from 'mongoose';
const app = express();

let apiRoutes = require("./src/api-routes/api-routes");
let userapi = require("./src/api-routes/user-routes");
let hubapi = require("./src/api-routes/hub-routes");
let orgazizationapi = require("./src/api-routes/organization-routes");
let authApi = require("./src/api-routes/auth-routes");
let vehicleApi = require("./src/api-routes/vehicle-routes");
let chargerApi = require("./src/api-routes/chargersocket-routes");
var uristring =
  process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://103.50.163.29:27017/IoT';
// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
//mongoose.connect(uristring,function (err, res) {
var options = {
   useNewUrlParser: true
 }
mongoose.connect(uristring, options).then(function (req, res) {
 if (err) {
   console.log('ERROR connecting to: ' + uristring + '. ' + err);
 } else {
   console.log('Succeeded connected to: ' + uristring);
 }
}).catch(function(err){
    console.log("errrr")
    console.log(err);
});

// Require static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', require('hbs').__express);

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
// Connect to Mongoose and set connection variable

// Send message for default URL
app.get('/', (req, res) => res.send('Hello World with Express'));
// Use Api routes in the App

app.use('/api', apiRoutes);
app.use('/authApi', authApi);
app.use('/userapi', userapi);
app.use('/hubapi', hubapi);
app.use('/orgazizationapi', orgazizationapi);
app.use('/vehicleApi', vehicleApi);
app.use('/chargerApi', chargerApi)


app.listen(8080)
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});





