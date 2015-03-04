/**
 * JS code specifically for user page
 * @todo - minify this later
 */

// Progress bar class to deal with the progress bar for repo refresh
var progressBar = function() {
	this.width = 5;
	this.colors = ['red', 'rgb(253, 166, 7)', 'rgba(77, 195, 121, 0.95)'];
	this.color_id = 0;
	this.MIN = 5;

	$("._progress .meter").css('background', this.colors[this.color_id]);
	$("._progress .meter").css('width', this.width +'%');

	$("._progress").slideDown();
}
progressBar.prototype.Update = function(per) {
	this.width = (per > this.MIN) ? per : this.MIN;
	var r = 100 / this.colors.length + .0001;
	this.color_id = Math.floor(per / r);

	$("._progress .meter").css('background', this.colors[this.color_id]);
	$("._progress .meter").css('width', this.width +'%');
};
progressBar.prototype.End = function() {
	$("._progress").slideUp();
	try {
		delete this;
	} catch (ex) {
		console.error('Unable to destroy: [error]' +ex);
	}
}


var task = function(obj, progressBarObj) {
	// @todo - we need started_at and ended_at also back
	this.taskid = obj.taskid;
	this.progressBarObj = progressBarObj;
	this.checksum = obj.checksum;
	this.todo = obj.todo;
	this.done = obj.done;
	this.description = obj.description;
	this.started_at_timestamp = obj.started_at_timestamp;
	this.ended_at_timestamp = obj.ended_at_timestamp;

	this.category = 1;
	
	this.timeout;
	this.freq = 1000;
	this.status = 0;
	this.count = 0;

	this._width = 5;
	this._width_MAX = 60;

	this.update();
	this.updatethis();
}

/** 
 * Function to insert the the task into UI
 */
task.prototype = {
	update : function() {
		this._width = (this._width < this._width_MAX) ? this._width + 5 : this._width;
		var width = (this.todo) ? Math.ceil(this.done / this.todo * 100) : 5;
		width = (width > 100) ? 100 : width;
		width = (width < this._width) ? this._width : width;

		this.progressBarObj.Update(width);
	},
	updatethis : function() {
		if (new Date().getTime() > (this.started_at_timestamp * 1000 + _REPO_FETCH_TIMEOUT * 1000)) {
			// timeout
			console.log('timeout situation');
			if (this.status == 0) {
				// repo fetch timed out
				new notification("Repository list update timeout", "warning");
			}
			this.End();
		}

		var $this = this;
		this.count++;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', "../api/repos/status.php?taskid=" +this.taskid +"&checksum=" +this.checksum);
		xhr.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var obj = JSON.parse(this.response);
			    if (obj.error) {
			    	// Show Error notification
			    	if (typeof obj.reload != "undefined"
			    		&& obj.reload) {
			    		location.reload();
			    		return;
			    	}
			    	return new notification(obj.message, "warning");
			    } else {
			    	// todo, done, flag	
			    	$this.todo = obj.todo;
			    	$this.done = obj.done;
			    	$this.status = obj.flag;
			    	$this.started_at_timestamp = obj.started_at_timestamp;
			    	$this.ended_at_timestamp = obj.ended_at_timestamp;
			    	$this.update();
			    	if ($this.status == 0) {
			    		$this.timeout = setTimeout(function() {
			    			$this.updatethis();
			    		}, $this.freq);
			    	} else {
			    		$this.refreshRepoList();
			    		$this.End();
			    	}
			    }
			} else if (this.readyState == 4) {
				// Show Notification and make it secondary -- make all text grey
		  		if (typeof $this.errorRecoveryAttempt != 'undefined') {	  			
		  			$this.End();
		  			return new notification("Unable to connect to remote server!", "warning");
		  		} else {
		  			$this.errorRecoveryAttempt = true;
		  			$this.timeout = setTimeout(function() {
		    			$this.updatethis();
		    		}, $this.freq);
		  		}
			}
		};
		xhr.send();
	},
	refreshRepoList: function() {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', "../api/repos/repos.php");
		xhr.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var obj = JSON.parse(this.response);
				if (obj.error) {
			    	// Show Error notification
			    	if (typeof obj.reload != "undefined"
			    		&& obj.reload) {
			    		location.reload();
			    		return;
			    	}
			    	return new notification(obj.message, "warning");
			    } else {
			    	// update the repo info
			    	var len = $("#_REPO_LIST tr").length;
			    	for(var i = 1; i < len; i++) $("#_REPO_LIST tr").eq(1).remove();

			    	// Update repo_metadata

			    	// public repositories
			    	var str = parseInt(obj.repo_count) + " Public ";
			    	if (parseInt(obj.repo_count) == 1) str += "Repository";
			    	else str += "Repositories";

			    	$("._infolist div").eq(0).html(str);
			    	// private repositories
			    	str = parseInt(obj.private_repos) + " Private ";
			    	if (parseInt(obj.private_repos) == 1) str += "Repository";
			    	else str += "Repositories";
			    	$("._infolist div").eq(1).html(str);

			    	len = obj.data.length;
			    	for(var i = 0; i < len; i++) {
			    		var state = (obj.data[i].flag == 1) ? "Active" : "Inactive";

			    		var lang = (obj.data[i].language != '') ? "<span class='secondary label' style='float: right'>" +obj.data[i].language +"</span>" : "";

			    		var stateClass = "label ";
			    		stateClass += (obj.data[i].flag == 1) ? "success" : "secondary";

			    		$("#_REPO_LIST").append("<tr>"
			    			+ "<td>" +(i+1) +"</td>"
			    			+ "<td><a href='./" +obj.data[i].full_name +"' title='" +obj.data[i].name +"'>" +obj.data[i].full_name +"</a></td>"
			    			+ "<td><span class='" +stateClass +"'> " +state +" </span></td>"
			    			+ "<td><span class='label' style='float: right'>" +obj.data[i].size +" KB</span> &nbsp; " +lang +"</td>"
			    			+"</tr>");
			    	}

			    	paginationObj = new pagination("_REPO_LIST");
			    	// ^ get pagination done
			    	new notification("Repository lists updated!", "info");
			    }
			} else if (this.readyState == 4) {
				return new notification("Unable to connect to remote server!", "warning");
			}
		};
		xhr.send();
	},
	End: function() {
		clearTimeout(this.timeout);
		this.progressBarObj.End();
		if (parseInt(this.status) == 1) {
			$("#tmstmp_lu").html(this.ended_at_timestamp);
			$("#tmstmp_lu").toRelativeDate(true);
		}
		delete this;
		return;
	}
};

// GLOBALS to be used to check if a request is currently active
var _REPO_FETCH_STATUS = false;
var _REPO_FETCH_TIMEOUT = 3 * 60 * 1000; // 3minutes
var _REPO_FETCH_STARTED;

$(document).ready(function() {
    $(".timestamp_to_relative, .timestamp, #tmstmp_lu").toRelativeDate(true);
    $("._ra_deadline").toPrettyDate("D, d^ M'y");

    /**
	 * Add event listener to refresh button
	 */
	$("#_BUTTON_REFRESH_REPO").on('click', function() {
		// create a repo refresh task
		if (_REPO_FETCH_STATUS) {
			if (new Date().getTime() <= _REPO_FETCH_STARTED + _REPO_FETCH_TIMEOUT) {
				return;	
			}
		}
		_REPO_FETCH_STARTED = new Date().getTime();
		_REPO_FETCH_STATUS = true;
		new notification("Repository update started successfully", "success");
		var progressBarObj = new progressBar();

		var xhr = new XMLHttpRequest();
		xhr.open('GET', "../api/repos/");
		xhr.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var obj = JSON.parse(this.response);
				if (obj.error) {
			    	// Show Error notification
			    	if (typeof obj.reload != "undefined"
			    		&& obj.reload) {
			    		location.reload();
			    		return;
			    	}
			    	return new notification(obj.message, "warning");
			    } else {
			    	this.abort();
			    	return new task(obj, progressBarObj);					    	
			    }
			} else if (this.readyState == 4) {
				return new notification("Unable to connect to remote server!", "warning");
			}
		};
		xhr.send();
	});


});