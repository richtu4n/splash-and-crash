var nodemailer = require('nodemailer');
var QRCode     = require('qrcode');
var Promise    = require('bluebird');
var sha1       = require('sha1');
var path       = require('path');
var fs         = require('fs');
var aws        = require('aws-sdk');
var log        = require('./logger');
var config     = require('../config/config');


var transporter = nodemailer.createTransport('smtps://hello.splashandcrash%40gmail.com:10rekbear@smtp.gmail.com');

var _initS3 = function () {
	aws.config.update({ accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey, region: config.region });
	var s3 = new aws.S3();
	return s3;
};

var _generateQRCode = function (email) {
	return new Promise(function (resolve, reject) {
		var link = 'https://splashandcrash.com/check?email=' + email;
		QRCode.save(path.resolve('./qrcodes/' + email), link, function (err, written) {
			if (err) reject(err);
			resolve(path.resolve('./qrcodes/' + email));
		});
	});
};

var uploadToAws = function (filePath, key) {
	return new Promise(function (resolve, reject) {
		var s3 = _initS3();

		var readStream = fs.createReadStream(filePath);
		var options = {
			Bucket: 'splashandcrash',
			Key: key,
			Body: readStream,
			ACL: 'public-read'
		};
		s3.putObject(options, function (err, data) {
			if (err) reject(err);
			resolve(key);
		});
	});
};


module.exports.sendEmail = function (email) {
	return new Promise(function(resolve, reject) {

		_generateQRCode(email).then(function (filePath) {
			uploadToAws(filePath, sha1(email).replace('/', '=')).then(function (key) {

				var codeUrl = 'https://s3-' + config.region + '.amazonaws.com/splashandcrash/' + key;

				var mailOptions = {
			    	from: '"Splash And Crash"',
			    	to: email,
			    	subject: 'Welcome to Splash & Crash',
			    	text: 'Splash & Crash. Thanks for registering! Here is your code for entry: ' + codeUrl,
			    	html: '<h1>Splash & Crash</h1><p>Thanks for registering! Here is your code for entry:</p><img style="width: 300px;" src="' + codeUrl + '" alt="QR code link" />'
				};
				transporter.sendMail(mailOptions, function (err, data) {
			    	if (err) reject(err);
			    	resolve(data);
				});


			}, function (err) {
				reject(err);
			})
		}, function (err) {
			reject(err);
		});

	});
};