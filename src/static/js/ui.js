
$(document).ready(function(){
	app.init();
});

var userContext = {
	userName: null,
	userEmail: null,
	prefDrinks: null,
	prefFood: null,
	prefCrash: null,
	prefIdeas: null,
	userAgree: null,
	paid: false,
	stripeToken: null
}


var lightBox = {

	state: {
		open: false,
		ready: false
	},
	selector: ".light-box",
	element: null,
	init: function(){
		this.element = $(this.selector);
		this.state.ready = true;
	},
	toggle: function(){
		if(this.state.open){
			this.hide();
		} else {
			this.show();
		}
	},
	show: function(zindex){
		if(!zindex){
			zindex = 1;
		}
		this.element.css('z-index', zindex);
		background.blur(true);
		this.state.open = true;
	},
	hide: function(){
		this.element.css('z-index', -1);
		background.blur(false);
		this.state.open = false;
	}
};

var loader = {

	state: {
		open: false,
		ready: false
	},
	element: null,
	init: function(){
		this.element = $('.loader');
		this.state.ready = true;
	},
	toggle: function(){
		if(this.state.open){
			this.hide();
		} else {
			this.show();
		}
	},
	show: function(){
		this.element.css('z-index', '5');
		lightBox.show(5);
		this.state.open = true;
	},
	hide: function(){
		this.element.css('z-index', '-1');
		lightBox.hide();
		if(stripeForm.state.open){
			lightBox.show();
		}
		this.state.open = false;
	}
};


var background = {

	state: {
		ready: false,
		blur: false
	},
	element: null,
	init: function(){
		this.element = $('.background');
		this.state.ready = true;
	},
	blur: function(bool){
		if(bool){
			this.element.attr('style', '-webkit-filter: blur(10px);-moz-filter: blur(10px);-o-filter: blur(10px);-ms-filter: blur(10px);filter: blur(10px);');
		} else {
			this.element.removeAttr('style');
		}
	}
};

var registerForm = {

	state: {
		ready: false,
		open: false
	},
	selector: ".register-wrapper",
	element: null,
	userId: null,
	init: function(){
		this.element = $(this.selector);
		this._bindEventHandlers();
		this.state.ready = true;
	},
	register: function(){
		var _ = this;

		if(!_._validate()){
			_.updateError("Please enter your name and email");
			return;
		}

		loader.show();

		//get data from form
		userContext.userName = _.element.find('.user-name').val().toLowerCase();
		userContext.userEmail = _.element.find('.user-email').val().toLowerCase();

		//request user id
		_._requestUserIdAsync()
			.then(function(response){
				app.dump(response);
				app.pause(1000)
				.then(function(){
					loader.hide();
					if(response.success == true){
						userContext = response.result;
						preferenceForm.updateValues();
						preferenceForm.show();

					} else {
						_.updateError(response.result);
					}
				});
			})
			.catch(function(error){
				app.dump(error);
				loader.hide();
				_.updateError('Error. Service not available.')
			});
	},
	show: function(){
		var _ = this;
		app.hideForms();
		_.element.show();
		_.state.open = true;
	},
	hide: function(){
		this.element.hide();
		this.state.open = false;
	},
	clear: function(){
		var _ = this;
		_.element.find('input').val('');
		_.element.find('.errors').text('');
	},
	updateError: function(message){
		var _ = this;
		_.element.find('.errors').html(message);
	},
	_requestUserIdAsync: function(){
		return new Promise(function(resolve,reject){
			$.ajax({
				url: "/register",
				method: "POST",
				data: userContext,
				success: function(res){
					resolve(res);
				},
				error: function(err){
					reject(err);
				}
			});
		});
	},
	_bindEventHandlers: function(){
		var _ = this;
		_.element.find('button').click(function(){
			_.register();
		});
	},
	_validate: function(){
		var _ = this;
		var userName = _.element.find('.user-name').val();
		var userEmail = _.element.find('.user-email').val();
		if(userName == "" || userEmail == ""){
			return false;
		} else {
			return true;
		}
	}
};


var preferenceForm = {

	state: {
		ready: false,
		open: false
	},
	selector: ".preference-wrapper",
	element: null,
	userId: null,
	init: function(){
		this.element = $(this.selector);
		this._bindEventHandlers();
		this.state.ready = true;
	},
	next: function(){
		var _ = this;

		loader.show();

		//get data from form
		userContext.prefDrinks = _.element.find('.pref-drinks').val().toLowerCase();
		userContext.prefFood   = _.element.find('.pref-food').val().toLowerCase();
		userContext.prefCrash  = _.element.find('.pref-crash').val().toLowerCase();
		userContext.prefIdeas  = _.element.find('.pref-ideas').val().toLowerCase();

		//request user id
		_._sendPrefAsync()
			.then(function(response){
				app.dump(response);
				app.pause(1000)
				.then(function(){
					loader.hide();
					if(response.success == true){
						disclaimerForm.show();
					} else {
						_.updateError(response.result);
					}
				});
			})
			.catch(function(error){
				app.dump(error);
				loader.hide();
				_.updateError('Error. Service not available.')
			});
	},
	show: function(){
		var _ = this;
		app.hideForms();
		_.element.show();
		_.state.open = true;
	},
	hide: function(){
		this.element.hide();
		this.state.open = false;
	},
	clear: function(){
		var _ = this;
		_.element.find('input').val('');
		_.element.find('.errors').text('');
	},
	updateValues: function(){
		var _ = this;
		_.element.find('.pref-drinks').val(userContext.prefDrinks);
		_.element.find('.pref-food').val(userContext.prefFood);
		_.element.find('.pref-crash').val(userContext.prefCrash);
		_.element.find('.pref-ideas').val(userContext.prefIdeas);
	},
	updateError: function(message){
		var _ = this;
		_.element.find('.errors').html(message);
	},
	_sendPrefAsync: function(){
		return new Promise(function(resolve,reject){
			$.ajax({
				url: "/pref",
				method: "POST",
				data: userContext,
				success: function(res){
					resolve(res);
				},
				error: function(err){
					reject(err);
				}
			});
		});
	},
	_bindEventHandlers: function(){
		var _ = this;
		_.element.find('button').click(function(){
			_.next();
		});
	}
};

var disclaimerForm = {

	state: {
		ready: false,
		open: false
	},
	selector: ".disclaimer-wrapper",
	element: null,
	init: function(){
		this.element = $(this.selector);
		this._bindEventHandlers();
		this.state.ready = true;
	},
	agree: function(){
		var _ = this;

		loader.show();

		userContext.userAgree = true;
		_._agreeAsync()
			.then(function(res){
				app.dump(res);
				app.pause(1000)
				.then(function(){
					loader.hide();
					if(res.success){
						stripeForm.show();
					} else {
						//handle error message
					}
				});
			}).catch(function(err){
				app.dump(err);
				//handle error
			});
	},
	show: function(){
		var _ = this;
		app.hideForms();
		lightBox.show();
		_.element.show();
		_.state.open = true;
	},
	hide: function(){
		var _ = this;
		_.element.hide();
		_.state.open = false;
		lightBox.hide();
	},
	clear: function(){
		return;
	},
	_agreeAsync: function(){
		return new Promise(function(resolve,reject){
			$.ajax({
				url: "/agreetandcs",
				method: "POST",
				data: userContext,
				success: function(res){
					resolve(res);
				},
				error: function(err){
					reject(err);
				}
			});
		});
	},
	_bindEventHandlers: function(){
		this.element.find('button').click(function(){
			disclaimerForm.agree();
		});
	}
};

var stripeForm = {

	state: {
		ready: false,
		open: false
	},
	selector: ".payment-wrapper",
	element: null,
	init: function(){
		var _ = this;
		_.element = $(this.selector);
		_._bindEventHandlers();
		_.state.ready = true;
	},
	pay: function(){
		var _ = this;
		app.dump('pay called');
		if(!userContext.stripeToken){
			app.dump(' - getting stripeToken');
			_._getToken();
		} else {
			app.dump(' - request payment from server');
			_._requestPayment();
		}

	},
	_getToken: function(){
		var _ = this;

		loader.show();
    	_.disable();

		//get token
		_._requestTokenAsync(_.element.find('form'))
    		.then(function(res){
    			userContext.stripeToken = res.result.stripeToken;
    			_.pay(); //recall pay to send payment to server
    		})
    		.catch(function(err){
    			loader.hide();
    			_.updateError(err.result.message);
    			_.enable();
    		});
	},
	_requestPayment: function(){
		var _ = this;

		loader.show();

    	_._payAsync()
    		.then(function(res){

    			loader.hide();
    			
    			if(!res.success){
    				userContext.stripeToken = null;	
    				_.updateError(res.result.message);
    				_.enable();	
    			} 
    			else {
    				_.clear();
    				_.enable();
    				message.update(":)", "Thankyou!", null, function(){
    					message.hide();
    					app.clear();
    					registerForm.show();
    				});
    			}
    		}).catch(function(err){
    			app.dump(err);
    			_.updateError("Error. service not available.");
    			loader.hide();
    		});
	},
	close: function(){
		this.element.find('.exit').click();
	},
	toggle: function(){
		var _ = this;
		if(_.state.open){
			_.hide();
		} else {
			_.show();
		}
	},
	clear: function(){
		var _ = this;
		_.element.find('input').val('');
		_.element.find('.errors').text('');
	},
	enable: function(){
		var _ = this;
		_.element.find('button.submit').removeAttr('disabled');
	},
	disable: function(){
		var _ = this;
		_.element.find('.submit').prop('disabled', true);
	},
	updateError: function(message){
		var _ = this;
		alert(message);
		//_.element.find('.errors').text(message);
	},
	_requestTokenAsync: function(form){
		return new Promise(function(resolve,reject){
			Stripe.card.createToken(form, function(status, response){
				if (response.error) { // Problem!
					reject({result: response.error, success: false});
				} else { // Token was created!
					resolve({result: {stripeToken: response.id}, success: true});
				}
			});
		});
	},
	_payAsync: function(){
		return new Promise(function(resolve,reject){
			$.ajax({
				url: "/pay",
				method: "POST",
				data: userContext,
				success: function(res){
					resolve(res);
				},
				error: function(err){
					reject(err);
				}
			});
		});
	},
	show: function(){
		var _ = this;
		app.hideForms();
		lightBox.show();
		_.element.show();
		_.state.open = true;
	},
	hide: function(){
		var _ = this;
		_.element.hide();
		_.state.open = false;
		lightBox.hide();
	},
	_bindEventHandlers: function(){
		var _ = this;
		//close form
		_.element.find('.exit').click(function(){
			registerForm.show();
		});

		//pay
		_.element.find('button.submit').click(function(){
			_.pay();
    		return false;
		});
	}
};


var scroll = {
	content: ".content",
	top: function(){
		if(!this._isAtTop()){
			this._scrollPage(0, 200);
		} else { app.dump('at top'); }
	},
	disclaimer: function(){
		var position = this._contentHeight();
		this._scrollPage(position, 200);
	},
	payment: function(){
		var position = (this._contentHeight() * 2);
		this._scrollPage(position, 200);
	},
	_contentHeight: function(){
		return $(this.content).height();
	},
	_scrollPage: function(pixels, time){
		$('body').animate({
			scrollTop: pixels
		}, time);
	},
	_isAtTop: function(){
		if($('body').scrollTop() > 0){
			return false;
		} else {
			return true;
		}
	}
}


var message = {

	state: {
		ready: false,
		open: false
	},
	smiley: ":)",
	message: "Thankyou!",
	error: "",
	selector: ".message-wrapper",
	element: null,
	init: function(){
		this.element = $(this.selector);
		this.state.ready = true;
	},
	update: function(smiley, message, error, callback){
		var _ = this;
		_.element.find('.smiley').html(smiley);
		_.element.find('.message').html(message);
		_.element.find('.error').html(error);
		_.show();
		if(callback != null){
			window.setTimeout(callback,2000);
		}
	},
	show: function(){
		var _ = this;
		app.hideForms();
		lightBox.show();
		_.element.show();
		_.state.open = true;
	},
	hide: function(){
		var _ = this;
		_.element.hide();
		_.state.open = false;
		lightBox.hide();
	},
	clear: function(){
		return;
	}
};

var app = {
	debug: true,
	forms: [
		registerForm,
		preferenceForm,
		disclaimerForm,
		stripeForm,
		message
	],
	elements: [
		lightBox,
		loader,
		background
	],
	init: function(){
		var _ = this;

		for(i=0; i<_.forms.length; i++){
			var form = _.forms[i];
			form.init();
		}

		for(i=0; i<_.elements.length; i++){
			var element = _.elements[i];
			element.init();
		}

		registerForm.show();
	},
	hideForms: function(){
		var _ = this;

		for(i=0; i<_.forms.length; i++){
			var form = _.forms[i];
			form.hide();
		}
	},
	clear: function(){
		var _ = this;

		for(i=0; i<_.forms.length; i++){
			var form = _.forms[i];
			form.clear();
		}
	},
	dump: function(obj){
		if(this.debug){
			console.log(obj);
		}
	},
	pause: function(time){
		return new Promise(function(resolve, reject){
			window.setTimeout(function(){
				resolve();
			},time)
		});
	}
}

