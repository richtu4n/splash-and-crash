var _log = require('./logger');
var format = require('util').format;
var ms = require('ms');


/**
 * Expose middleware
 */
module.exports = function () {
  return log;
};


/**
 * Options
 */
var options = exports;

options.indent = 2;
options.format = 'method=:method path=:path status=:status header=:header time=:time body=:body';
options.filter = ['password', 'password_confirmation'];
options.ignore = ['static'];


/**
 * Log requests
 */
function * log (next) {
	var start = Date.now();
	
	var err;
	
	try {
	  yield next;
	} catch (e) {
	  err = e;
	  this.status = err.status || 500;
	}

	var end = Date.now();

	var params = {
	  method: this.method.toUpperCase(),
	  path: this.url,
	  status: this.status,
	  time: ms(end - start),
	  header: serialize(this.request.header),
	  body: serialize(this.request.body || {}),
	  skip: false
	};

	options.ignore.map(function(s){
		if(params.path.indexOf(s) > -1){
			params.skip = true;
		}
	});
	
	
	if(!params.skip){

		var output = options.format;
		
		Object.keys(params).forEach(function (param) {
		  output = output.replace(':' + param, params[param]);
		});
		
		// insert spaces
		output = indent(output);
		
		_log.info(output);
	}

	if (err) throw err;
};


/**
 * Utilities
 */
function serialize (obj) {
  if (Object.prototype.toString.call(obj) !== '[object Object]') return obj;
  
  // request params keys
  var keys = Object.keys(obj);
  
  // filter out keys
  keys = keys.filter(function (key) {
    return options.filter.indexOf(key) === -1;
  });
  
  // convert to stirng
  obj = keys.map(function (key) {
    return format('%s: %s', key, obj[key]);
  });
  
  return format('{ %s }', obj.join(', '));
}

function indent (str) {
  return new Array(options.indent + 1).join(' ') + str;
}
