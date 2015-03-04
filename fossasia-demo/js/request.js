/**
 * Javascript code to deal with all reqeuests and show notifications accordingly
 * include after main.js
 */

var BASE_URL = 'http://hector/~minhazav/todo-ci/server/';

var CATEGORIES = ['tag', 'label', 'assignment', 'todo', 'remainder', 'deadline', 'issue', 'follow', 'comment', 'follow'];

var request = function(category, todo_id, extra, callback, failurecallback) {
	// check categories
	this.category = '';
	for (var i = 0; i < CATEGORIES.length; i++) {
		if (CATEGORIES[i] == category) {
			this.category = category;
			break;
		}
	}
	if (this.category == '') {
		return new notification('Unable to create a request', 'warning');
	}

	// get few of data from url!
	var data = /.*\/r\/([a-zA-Z0-9-._]+)\/([a-zA-Z0-9-_.]+)[\/]*([a-zA-Z0-9-_.]+)*[\/]*(\d+)*/.exec(location.href);
	this.json = {};
	this.json.username = data[1];
	this.json.repo = data[2];
	this.json.branch = (typeof data[3] == "undefined") ? '' : data[3];
	this.json.todo_id = todo_id;
	this.json.category = this.category;
	this.json.data = JSON.parse(extra);

	this.response = {};
	this.callback = callback;
	this.failurecallback = failurecallback;

	this.handle();
}

request.prototype.handle = function() {
	this.xhr = new XMLHttpRequest();
	this.xhr.open('POST', BASE_URL +'api/ajaxserver/');
	var $this = this;
	this.xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			$this.response = JSON.parse(this.response);
			$this.action();
		} else if (this.readyState == 4) {
			return new notification('Unable to connect to server!', 'warning');
		}
	};

	this.xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	this.xhr.send('data=' +JSON.stringify(this.json));
};

request.prototype.action = function() {
	var r = this.response;
	if (r.error) {
		if (typeof this.failurecallback != "undefined")
			this.failurecallback();
		return new notification(r.message, 'warning');
	} else {
		if (r.lightbox) {
			$('#obox').html(r.message);
			$('#olayer, #obox').fadeIn();
		} else {
			if (typeof this.callback != "undefined") {
				this.callback(r);
			}
			return new notification(r.message, 'success');
		}
	}
};


$("body").append("<div id='olayer'></div>");
$("body").append("<div id='obox'></div>");

$('#olayer').on('click', function() {
	$('#olayer, #obox').fadeOut();
});