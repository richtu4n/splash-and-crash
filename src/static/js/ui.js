$(document).ready(function(){

	stripeForm.init();
	lightBox.init();
	loader.init();
});

var stripeForm = {

	state: {
		open: false
	},
	element: null,
	init: function(){
		this.element = $('.payment-form');
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
	}
};


var lightBox = {

	state: {
		open: false
	},
	element: null,
	init: function(){
		this.element = $('.light-box');
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
		this.state.open = true;
	},
	_hide: function(){
		this.element.css('z-index', '-1');
		this.state.open = false;
	}
};

var loader = {

	state: {
		open: false
	},
	element: null,
	init: function(){
		this.element = $('.loader');
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
