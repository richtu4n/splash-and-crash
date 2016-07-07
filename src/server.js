var async        = require('asyncawait/async');
var await        = require('asyncawait/await');
var koa          = require('koa');
var koaBody      = require('koa-body');
var router       = require('koa-router')();
var hbs          = require('koa-hbs');
var serve        = require('koa-static-server');
var Promise      = require('bluebird');
var co           = require('co');
var log          = require('./utilities/logger');
var koaLogger    = require('./utilities/koa-logger');
var routes       = require('./routes');
var pay          = require('./utilities/payments');
var config       = require('./config/config');
var mongo        = require('./mongo/connection');
var http         = require('http');
var https        = require('https');
var fs           = require('fs');
var enforceHttps = require('koa-sslify');

//exports
var app = koa();

//routes
router.get('/', routes.home);
router.post('/register', routes.register);
router.post('/pref', routes.preference);
router.post('/agreetandcs', routes.agreetandcs);
router.post('/pay', routes.pay);

//middleware
app.use(koaLogger());
app.use(enforceHttps());
app.use(koaBody({ formidable: { uploadDir: __dirname } }));
app.use(hbs.middleware({viewPath: __dirname + '/views'}));
app.use(serve({rootDir: __dirname + "/static", rootPath: "/static"}));
app.use(router.routes());

var options = {
    key: fs.readFileSync('/root/splash-and-crash/keys/server.key'),
    cert: fs.readFileSync('/root/splash-and-crash/keys/server.csr')
};

//------------------------------------------------------------------------------

async (function () {
	await (mongo.init());

	app.listen(options, config.port, function () {
		log.info('Server running on port: ' + config.port + '.');
	});
	//http.createServer(app.callback()).listen(80);
	//https.createServer(options, app.callback()).listen(443);

})();


//-------------------------------------------------------------------------------
