var async = require('asyncawait/async');
var await = require('asyncawait/await');
var config = require('../config/config');
var pmongo = require('promise-mongo');

module.exports = (function () {

	var init = async (function () {
		var pm = new pmongo();
		var mdb = await (pm.initDb(['users', 'payments', 'failed_payments'], 'mongodb://127.0.0.1:27017/splashandcrash'));
		this.db = pm.cols;
	});

	return {
		init: init,
		db: null
	};

})();