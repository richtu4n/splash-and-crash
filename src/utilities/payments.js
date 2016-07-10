var config = require('../config/config');
var stripe  = require('stripe')(config.testSecretStripeKey);
var Promise = require('bluebird');
//testSecretStripeKey

module.exports.send = function (token, userName) {
	return new Promise(function(resolve, reject){
		
		var desc = userName + " SplashAndCrash contribution";
		var charge = stripe.charges.create({
		  	amount: 1000, // amount in cents, again
		  	currency: "gbp",
		  	source: token,
		  	description: desc
		}, function (err, charge) {
		  	if (err == null) {
		  		resolve(charge);
		  	} else {
		  		reject(err);
		  	}
		});
	});
};