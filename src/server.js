var koa        = require('koa');
var log        = require('./utilities/logger');
var koaLogger  = require('./utilities/koa-logger');
var koaBody    = require('koa-body');
var router     = require('koa-router')();
var routes     = require('./utilities/routes');
var hbs        = require('koa-hbs');
var Promise    = require('bluebird');
var serve      = require('koa-static-server');
var pay        = require('./utilities/payments');
var config     = require('./config/config');

//exports
var app = module.exports = koa();

//routes
router.get('/', routes.home);
router.post('/pay', routes.pay);

//middleware
app.use(koaLogger());
app.use(koaBody({formidable:{uploadDir: __dirname}}));
app.use(hbs.middleware({viewPath: __dirname + '/views'}));
app.use(serve({rootDir: __dirname + "/static", rootPath: "/static"}));
app.use(router.routes());


//------------------------------------------------------------------------------

if (!module.parent) {
    app.listen(config.port);
    console.log('server running on http://localhost:' + config.port);
}

//-------------------------------------------------------------------------------