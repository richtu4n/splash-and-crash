var log = require('./utilities/logger');
var payments = require('./utilities/payments');
var email = require('./utilities/email');
var mongo = require('./mongo/connection');
var sha1 = require('sha1');

module.exports.home = function *() {
	yield this.render('main');
};
module.exports.check = function *() {
	try {
		var email = this.request.query.email;
		var data;

		var _user = yield mongo.db.users.findOne({ userEmail: email });
		if (_user) {
			data = { result: { paid: _user.paid }, success: true };
		} else {
			data = { result: { paid: false }, success: true };
		}
	} catch (err) {
		data = { result: err, success: false };
	}

	try {
		yield this.render('check', data);
	} catch (err) {
		// Let it 404.
	}
};

module.exports.register = function *() {
	try {
		var userContext = this.request.body;
		var userEmail = userContext.userEmail;
		userContext.paid = JSON.parse(userContext.paid);
		userContext._id = sha1(userContext.userEmail);

		if (!userEmail) {
			this.body = { result: 'Please enter your email address', success: false };
			return;
		}

		//look for existing user
		var _user = yield mongo.db.users.findOne({ userEmail: userEmail });
		if (_user) {
			if (_user.paid) { // If we find one check paid
				this.body = { result: 'You have already registered!', success:false }
			} else {
				//if not return existing user object
				this.body = { result: _user, success: true };
			}
		} else {
			//create new user
			yield mongo.db.users.insert(userContext);
			this.body = { result: userContext, success: true };
		}

	} catch (err) {
		this.body = { result: 'Registration failed.', success: false };
		return;
	}
};
module.exports.preference = function *() {

	try {
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
	} catch (err) {
		this.body = { result: 'Updating preferences failed.', success: false };
		return;
	}
};
module.exports.agreetandcs = function *() {
	try {
		var userEmail = this.request.body.userEmail;
		var userAgree = this.request.body.userAgree;

		var _user = yield mongo.db.users.findOne({ userEmail: userEmail });
		if (!_user) {
			this.body = { result: "User doesn't exist!", success: false };
		} else {
			yield mongo.db.users.updateOne({ userEmail: userEmail }, { $set: { userAgree: userAgree } });
			this.body = { success: true };
		}
	} catch (err) {
		this.body = { result: 'Agreeing to tsandcs failed.', success: false };
		return;
	}	
};

module.exports.pay = function *() {
	try {
		var userEmail   = this.request.body.userEmail;
		var userName    = this.request.body.userName;
		var stripeToken = this.request.body.stripeToken;

	} catch (err) {
		this.body = { result: 'Missing parameters userEmail, stripeToken', success: false };
		return;
	}

	try {
		// Find user with userEmail and set paying to true. If return val has paying set to true also, error. Otherwise continue.
		var user = yield mongo.db.users.findAndModify(
			{ userEmail: userEmail },
			null, 
			{ $set: { paying: true } }
		)
	} catch (err) {
		this.body = { result: err, success: false };
		return;
	}
	if (!user) {
		this.body = { result: "User with email " +  userEmail + " doesn't exist.", success: false };
		return;
	}
	if (user.paid) {
		this.body = { result: "User with email " + userEmail + " has already paid.", success: false };
		return;
	}
	if (user.paying) {
		this.body = { result: "Transaction for user " + userEmail + " is currently being processed.", success: false };
		return;
	}


	// Set user status to paying
	try {
		yield mongo.db.users.updateOne(
			{ userEmail: userEmail },
			{ $set: { paying: true } },
			{ upsert: true }
		);
	} catch (err) {
		this.body = { result: err, success: false };
		return;
	}

	try {
		var stripeResponse = yield payments.send(stripeToken, userName);
	} catch (err) {

		try {
			yield mongo.db.failed_payments.insert({ 
		    	userEmail: userEmail,
		    	stripeToken: stripeToken,
		    	stripeResponse: err
			});
			yield mongo.db.users.updateOne(
				{ userEmail: userEmail },
				{ $set: { paying: false } },
				{ upsert: true }
			);
		} catch (err) {
			this.body = { result: err, success: false };
			return;
		}

		this.body = { result: err.message, success: false };
		return;
	}

	// Record successful payment
	try {
		yield mongo.db.payments.insert({
			userEmail: userEmail,
			stripeToken: stripeToken,
			stripeResponse: stripeResponse
		});
		yield mongo.db.users.updateOne(
			{ userEmail: userEmail }, 
			{ $set: { paid: true, stripeToken: stripeToken, paying: false } }, 
			{ upsert: true }
		);
	} catch (err) {
		this.body = { result: err, success: false };
		return;
	}

	try {
		yield email.sendEmail(userEmail, userName, user.prefCrash, user.prefDrinks, user.prefFood, user.prefIdeas);
	} catch (err) {
		try {
			yield mongo.db.bounced_emails.insert({
				email: userEmail,
				name: userName,
				errorMessage: err
			});
		} catch (err) {

		}
	}

	this.body = { result: "Payment approved!", success: true };
};