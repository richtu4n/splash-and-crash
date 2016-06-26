
$(document).ready(function(){

	stripeForm.init();
	lightBox.init();
	loader.init();
	background.init();
	welcomeForm.init();
	setTimeout(function(){
		scroll.top();
	},500);
});

var userContext = {
	name: null,
	email: null,
	id: null
}

var stripeForm = {

	state: {
		ready: false,
		open: false
	},
	element: null,
	init: function(){
		this.element = $('.payment-form');
		this._bindEventHandlers();
		this.state.ready = true;
	},
	close: function(){
		this.element.find('.exit').click();
	},
	toggle: function(){
		if(this.state.open){
			this._hide();
		} else {
			this._show();
		}
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
	}
};


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
		userContext.name = this.element.find('.user-name').val();
		userContext.email = this.element.find('.user-email').val();

		//request user id
		this._requestUserIdAsync()
			.then(function(response){
				userContext.id = response.userId
			})
			.error(function(error){
				//log
				console.log(error);
			});

		//on success scroll to next
		scroll.disclaimer();
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

var scroll = {
	content: ".content",
	top: function(){
		if($('.content').scrollTop() > 0){
			this._scrollPage('.content', 500);
		}
	},
	disclaimer: function(){
		this._scrollPage('.disclaimer-wrapper', 500);
	},
	payment: function(){
		this._scrollPage('.payment-wrapper', 500);
	},
	_scrollPage: function(selector, time){
		var target = $(selector);
		target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
		if (target.length) {
			$('html, body').animate({
				scrollTop: target.offset().top
			}, time);
			return false;
		}
	}
}


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