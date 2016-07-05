
$(document).ready(function(){

	stripeForm.init();
	lightBox.init();
	loader.init();
	background.init();
	registerForm.init();
	disclaimerForm.init();
	message.init();

	registerForm.show();
});

var userContext = {
	userName: null,
	userEmail: null,
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

		loader.show();

		//get data from form
		userContext.userName = _.element.find('.user-name').val().toLowerCase();
		userContext.userEmail = _.element.find('.user-email').val().toLowerCase();

		//request user id
		_._requestUserIdAsync()
			.then(function(response){
				console.log(response);
				loader.hide();
				if(response.success == true){
					userContext = response.result;
					_.hide();
					disclaimerForm.show();
				} else {
					//handle error
					_._updateError(response.result);
				}
			})
			.catch(function(error){
				console.log(error);
				loader.hide();
				_._updateError('Error. Service not available.')
			});
	},
	show: function(){
		this.element.show();
		this.state.open = true;
	},
	hide: function(){
		this.element.hide();
		this.state.open = false;
	},
	_updateError: function(message){
		var _ = this;
		_.element.find('.register-errors').html(message);
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

		//loader.show();

		userContext.userAgree = true;
		_._agreeAsync()
			.then(function(res){
				console.log(res);
				if(res.success){
					_.hide();
					stripeForm.show();
				} else {
					//handle error message
				}
			}).catch(function(err){
				console.log(err);
				//handle error
			});
	},
	show: function(){
		this.element.show();
		lightBox.show();
		this.state.open = true;
	},
	hide: function(){
		this.element.hide();
		lightBox.hide();
		this.state.open = false;
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
		console.log('pay called');
		if(!userContext.stripeToken){
			console.log(' - getting stripeToken');
			_._getToken();
		} else {
			console.log(' - request payment from server');
			_._requestPayment();
		}

	},
	_getToken: function(){
		var _ = this;

		loader.show();

		// Disable the submit button to prevent repeated clicks:
    	_.element.find('.submit').prop('disabled', true);

    	//hide old errors
		_.element.find('.payment-errors').text('');

		//get token
		_._requestTokenAsync(_.element.find('form'))
    		.then(function(res){
    			userContext.stripeToken = res.result.stripeToken; //store stripeToken
    			stripeForm.pay(); //recall pay to send payment to server
    		}).catch(function(err){
    			loader.hide();
    			//display errors on form
    			stripeForm.element.find('.payment-errors').text(err.result.message);
    			stripeForm.element.find('button.submit').removeAttr('disabled'); // Re-enable submission
    		});
	},
	_requestPayment: function(){
		var _ = this;

		loader.show();

    	this._payAsync()
    		.then(function(res){

    			loader.hide();
    			
    			if(!res.success){
    				_.element.find('.payment-errors').text(res.result.message);
    				_.element.find('button.submit').removeAttr('disabled'); // Re-enable submission
    				userContext.stripeToken = null;	
    			} else {
    				_.element.find('.payment-errors').text(res.result);
    				_.hide();
    				message.update();
    				message.show();
    			}
    		}).catch(function(err){
    			console.log(err);
    			_.element.find('.payment-errors').text("Error. service not available.");
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
		this.element.show();
		lightBox.show();
		this.state.open = true;
	},
	hide: function(){
		this.element.hide();
		lightBox.hide();
		this.state.open = false;
	},
	_bindEventHandlers: function(){
		//close form
		this.element.find('.exit').click(function(){
			stripeForm.hide();
			welcomeForm.show();
		});

		//pay
		this.element.find('button.submit').click(function(){
			stripeForm.pay();
    		return false;
		});
	}
};


var scroll = {
	content: ".content",
	top: function(){
		if(!this._isAtTop()){
			this._scrollPage(0, 200);
		} else { console.log('at top'); }
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
	update: function(){
		var _ = this;
		_.element.find('.smiley').html(_.smiley);
		_.element.find('.message').html(_.message);
		_.element.find('.error').html(_.error);
	},
	show: function(){
		this.element.show();
		lightBox.show();
		this.state.open = true;
	},
	hide: function(){
		this.element.hide();
		lightBox.hide();
		this.state.open = false;
	}
};


