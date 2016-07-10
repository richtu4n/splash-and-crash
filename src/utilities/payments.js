var testKey = "sk_test_5QzQvovraOiAwrEqqyLFpNQZ";
var liveKey = "sk_live_WdDYsMLPFWF0gP9JJMJDgtps";
var testCard = "4242424242424242";
var stripe  = require("stripe")(testKey);
var Promise = require("bluebird");

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