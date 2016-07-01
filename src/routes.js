var log = require('./utilities/logger');
var payments = require('./utilities/payments');
var mongo = require('./mongo/connection');
var sha1 = require('sha1');

module.exports.home = function *() {
	yield this.render('main');
};

module.exports.register = function *() {
	var userName = this.request.body.userName;
	var userEmail = this.request.body.userEmail;
	if (!(userName && userEmail)) {
		this.body = { result: 'Missing userName or userEmail!', success: false };
		return;
	}

	var userId = sha1(userName + userEmail);

	var _user = yield mongo.db.users.findOne({ userId: userId });
	if (_user) {
		this.body = { result: { userId: userId }, success: true };
	} else {
		yield mongo.db.users.insert({ userId: userId, userName: userName, userEmail: userEmail });
		this.body = { result: { userId: userId }, success: true };
	}
};
module.exports.agreetandcs = function *() {
	var userId = this.request.body.userId;
	var agree = this.request.body.agree;

	var _user = yield mongo.db.users.findOne({ userId: userId });
	if (!_user) {
		this.body = { result: "User doesn't exist!", success: false };
	} else {
		yield mongo.db.users.updateOne({ userId: userId }, { agree: agree }, { upsert: true });
		this.body = { success: true };
	}
};
module.exports.pay = function *() {
	try {
		var userId = this.request.body.userId;
		var stripeToken = this.request.body.stripeToken;
		//yield mongo.db.payments.

		var stripeResponse = yield payments.send(stripeToken);

		//yield mongo.db.payments.insert({ userId: userId, stripeToken: stripeToken, stripeResponse: stripeResponse });

		this.body = { result: {message: "Payment approved!"}, success: true };

	} catch (err) {
		this.body = { result: {error: err, message: err.message}, success: false };
	}
};


// user = {
// 	userName: ,
// 	userEmail: ,
// 	agree: ,
// 	stripeToken: ,
// 	paymentSuccess: 
// }


