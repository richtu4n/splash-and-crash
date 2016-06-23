var testKey = "sk_test_5QzQvovraOiAwrEqqyLFpNQZ";
var testCard = "4242424242424242";
var stripe  = require("stripe")(testKey);
var Promise = require("bluebird");

function sendPayment(token){
	return new Promise(function(resolve, reject){
		
		var charge = stripe.charges.create({
		  amount: 10000, // amount in cents, again
		  currency: "gbp",
		  source: token,
		  description: "Example charge"
		}, function(err, charge) {
		  if(err == null){
		  	resolve(charge);
		  } else {
		  	reject(err);
		  }
		});
	});
}


module.exports.send = sendPayment;