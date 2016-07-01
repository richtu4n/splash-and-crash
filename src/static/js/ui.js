
$(document).ready(function(){

	stripeForm.init();
	lightBox.init();
	loader.init();
	background.init();
	welcomeForm.init();
	disclaimerForm.init();
	setTimeout(function(){
		scroll.top();
	},700);
});

var userContext = {
	userName: null,
	userEmail: null,
	userId: null,
	agree: null,
	stripeToken: null
}


var lightBox = {

	state: {
		open: false,
		ready: false
	},
	element: null,
	init: function(){
		this.element = $('.light-box');
		this.state.ready = true;
	},
	toggle: function(){
		if(this.state.open){
			this._hide();
		} else {
			this._show();
		}
	},
	_show: function(zindex){
		if(!zindex){
			zindex = 1;
		}
		this.element.css('z-index', zindex);
		background.blur(true);
		this.state.open = true;
	},
	_hide: function(){
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
			this._hide();
		} else {
			this._show();
		}
	},
	_show: function(){
		this.element.css('z-index', '5');
		lightBox._show(5);
		this.state.open = true;
	},
	_hide: function(){
		this.element.css('z-index', '-1');
		lightBox._hide();
		if(stripeForm.state.open){
			lightBox._show();
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

var welcomeForm = {

	state: {
		ready: false
	},
	element: null,
	userId: null,
	init: function(){
		this.element = $('.welcome-form');
		this._bindEventHandlers();
		this.state.ready = true;
	},
	register: function(){
		//get data from form
		userContext.userName = this.element.find('.user-name').val();
		userContext.userEmail = this.element.find('.user-email').val();

		//request user id
		loader._show();
		this._requestUserIdAsync()
			.then(function(response){
				console.log(response);
				loader._hide();
				if(response.success){
					userContext.userId = response.result.userId; //store userId
					scroll.disclaimer(); //scroll to disclaimer form
				} else {
					console.log('error. ' + response.result);
					//handle error
				}
			})
			.error(function(error){
				console.log(error);
			});
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
		this.element.find('button').click(function(){
			welcomeForm.register();
		});
	}
};

var disclaimerForm = {

	state: {
		ready: false
	},
	element: null,
	init: function(){
		this.element = $('.disclaimer-form');
		this._bindEventHandlers();
		this.state.ready = true;
	},
	agree: function(){
		userContext.agree = true;
		loader._show();
		this._agreeAsync()
			.then(function(res){
				console.log(res);
				loader._hide();
				if(res.success){
					scroll.payment();
					stripeForm._show();
				} else {
					//handle error message
				}
			}).catch(function(err){
				console.log(err);
				//handle error
			});
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
	element: null,
	init: function(){
		var _ = this;
		_.element = $('.payment-form');
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
		loader._show();

		// Disable the submit button to prevent repeated clicks:
    	_.element.find('.submit').prop('disabled', true);

    	//hide old errors
		_.element.find('.payment-errors').text('');

		//get token
		_._requestTokenAsync(_.element)
    		.then(function(res){
    			userContext.stripeToken = res.result.stripeToken; //store stripeToken
    			stripeForm.pay(); //recall pay to send payment to server
    		}).catch(function(err){
    			//display errors on form
    			stripeForm.element.find('.payment-errors').text(err.result.message);
    			stripeForm.element.find('button.submit').removeAttr('disabled'); // Re-enable submission
    			loader._hide();
    		});
	},
	_requestPayment: function(){
		var _ = this;
    	this._payAsync()
    		.then(function(res){

    			_.element.find('.payment-errors').text(res.result.message);
    			if(!res.success){
    				_.element.find('button.submit').removeAttr('disabled'); // Re-enable submission
    				userContext.stripeToken = null;	
    			}	
    		}).catch(function(err){
    			console.log(err);
    			_.element.find('.payment-errors').text("Error. service not available.");

    		}).finally(function(){
    			loader._hide();
    		});
	},
	close: function(){
		this.element.find('.exit').click();
	},
	toggle: function(){
		var _ = this;
		if(_.state.open){
			_._hide();
		} else {
			_._show();
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
	_show: function(){
		this.element.slideDown(150, function(){
			lightBox._show();
		});
		this.state.open = true;
	},
	_hide: function(){
		this.element.slideUp(150, function(){
			lightBox._hide();
		});
		this.state.open = false;
	},
	_bindEventHandlers: function(){
		//close form
		this.element.find('.exit').click(function(){
			stripeForm._hide();
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
