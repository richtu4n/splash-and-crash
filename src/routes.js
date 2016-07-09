var log = require('./utilities/logger');
var payments = require('./utilities/payments');
var mongo = require('./mongo/connection');
var sha1 = require('sha1');

module.exports.home = function *() {
	yield this.render('main');
};

module.exports.register = function *() {

	//check we have a user Email
	var userContext = this.request.body;
	var userEmail = userContext.userEmail;
	if (!userEmail) {
		this.body = { result: 'Please enter your email address', success: false };
		return;
	}

	//look for existing user
	var _user = yield mongo.db.users.findOne({ userEmail: userEmail });
	if (_user) {
		if(_user.paid == true){ // If we find one check paid
			this.body = {result: 'You have already registered!', success:false}
		} else {
			//if not return existing user object
			this.body = { result: _user, success: true };
		}
	} else {
		//create new user
		yield mongo.db.users.insert(userContext);
		this.body = { result: userContext, success: true };
	}
};
module.exports.preference = function *() {

	//check we have a user Email
	var userContext = this.request.body;
	var userEmail   = userContext.userEmail;
	var prefDrinks  = userContext.prefDrinks;
	var prefFood    = userContext.prefFood;

	var _user = yield mongo.db.users.findOne({ userEmail: userEmail });
	if (!_user) {
		this.body = { result: "User doesn't exist!", success: false };
	} else {
		yield mongo.db.users.updateOne({ userEmail: userEmail }, { $set: { 
			prefDrinks: userContext.prefDrinks, 
			prefFood:   userContext.prefFood,
			prefCrash:  userContext.prefCrash,
			prefIdeas:  userContext.prefIdeas
		} });
		this.body = { success: true };
	}
};
module.exports.agreetandcs = function *() {
	var userEmail = this.request.body.userEmail;
	var userAgree = this.request.body.userAgree;

	var _user = yield mongo.db.users.findOne({ userEmail: userEmail });
	if (!_user) {
		this.body = { result: "User doesn't exist!", success: false };
	} else {
		yield mongo.db.users.updateOne({ userEmail: userEmail }, { $set: { userAgree: userAgree } });
		this.body = { success: true };
	}
};
module.exports.pay = function *() {
	try {
		var userEmail   = this.request.body.userEmail;
		var stripeToken = this.request.body.stripeToken;

		// if user paid, throw Error
		var user = yield mongo.db.users.findOne({ userEmail: userEmail });
		if (!user) throw new Error("User with email " +  userEmail + " doesn't exist.");
		if (user.paid) throw new Error("User with email " + userEmail + " has already paid.");
		if (user.paying) throw new Error("Transaction for user " + userEmail + " is currently being processed.");
		// Set user status to paying
		yield mongo.db.users.updateOne(
			{ userEmail: userEmail },
			{ $set: { paying: true } },
			{ upsert: true }
		);

		var stripeResponse = yield payments.send(stripeToken);

		yield mongo.db.users.updateOne(
			{ userEmail: userEmail }, 
			{ $set: { paid: true, stripeToken: stripeToken, paying: false } }, 
			{ upsert: true }
		);

		yield mongo.db.payments.insert({ 
			userEmail: userEmail,
			stripeToken: stripeToken,
			stripeResponse: stripeResponse
		});

		// Send email confirmation

		this.body = { result: "Payment approved!", success: true };

	} catch (error) {

		yield mongo.db.users.updateOne(
			{ userEmail: userEmail },
			{ $set: { paying: false } },
			{ upsert: true }
		);
		yield mongo.db.failed_payments.insert({ 
		    userEmail: userEmail,
		    stripeToken: stripeToken,
		    stripeResponse: error
		});
		this.body = { result: error, success: false };
	}
};


