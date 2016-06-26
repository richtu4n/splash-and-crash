$(document).ready(function(){

	stripeForm.init();
	lightBox.init();
	loader.init();
	background.init();
});

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
	_show: function(){
		this.element.css('z-index', '1');
		background.blur(true);
		this.state.open = true;
	},
	_hide: function(){
		this.element.css('z-index', '-1');
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
		this.element.css('z-index', '1');
		lightBox._show();
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

