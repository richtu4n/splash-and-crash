module.exports = {
	home: function *(){
		yield this.render('main');
	},
	pay: function *(){
		try {
			var response = yield pay.send(this.request.body.stripeToken);
			this.body = { response: response, success: true };
		} catch (err) {
			this.body = { response: err, success: false };
		}
	}
};