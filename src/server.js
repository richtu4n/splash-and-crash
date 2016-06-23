var koa     = require('koa');
var router  = require('koa-router')();
var hbs     = require('koa-hbs');
var Promise = require('bluebird');
var serve   = require('koa-static-server');
var koaBody = require('koa-body');
var pay     = require("./utilities/payments.js");
var app     = koa();

app.use(koaBody({
	formidable:{uploadDir: __dirname}
}));

app.use(hbs.middleware({
  viewPath: __dirname + '/views'
}));

app.use(serve({
	rootDir: __dirname + "/static", rootPath: "/static"
}));

router.get('/', function *(){
	yield this.render('main');
});

router.post('/pay', function *(){
	try {
		var response = yield pay.send(this.request.body.stripeToken);
		this.body = { response: response, success: true };
	} catch (err) {
		this.body = { response: err, success: false };
	}	
});

app.use(router.routes());

app.listen(3000);
console.log('server running on http://localhost:3000');
