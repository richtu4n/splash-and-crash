var log = require('./utilities/logger');
var payments = require('./utilities/payments');
var mongo = require('./mongo/connection');

module.exports.home = function *() {
	yield this.render('main');
};

module.exports.pay = function *() {
	try {

		var response = yield payments.send(this.request.body.stripeToken);

		yield mongo.db.payments.insert({ stripeToken: this.request.body.stripeToken });

		this.body = { response: response, success: true };
	} catch (err) {
		this.body = { response: err, success: false };
		throw new Error(err);
	}
};