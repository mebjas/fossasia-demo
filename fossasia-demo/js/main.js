// Notification handler
var notification = function(message, type) {
	this.message = message;
	this.type = type;
	// ^ success, warning, info, secondary
	this.obj = document.createElement('div');
	$(this.obj).addClass("alert-box");
	$(this.obj).addClass("radius");
	if (this.type != '') $(this.obj).addClass(this.type);
	$(this.obj).attr("data-alert", 'true');
	$(this.obj).html(message);
	$(this.obj).on('click', function() {
		$(this).slideUp(function() {
			$(this).remove();
		});
	})
	$("#_NOTIF_HANDLER").prepend(this.obj);

	var $this = this;
	setTimeout(function() {
		$($this.obj).slideUp( function() {
			$($this.obj).remove()
		});
	}, 5000);
}

/**
 * Deals with pagination in the page
 */
var pagination = function(id) {
	this.id = id;
	this.obj = $("#" +id +" tr");
	this.count = this.obj.length - 1;
	this.max = 20;
	this.total = Math.ceil(this.count / this.max);
	this.pages = "";
	for(i = 1; i <= this.total; i++) {
		this.pages += "<li><a href=\"javascript: void(0)\">" +i +"</a></li>";
	}

	// Remove any existing pagination UI if exist
	if ($("#" +this.id).next(".pagination-centered").length) {
		$("#" +this.id).next(".pagination-centered").remove();
	}

	this.paginId = 'a' +Math.ceil(Math.random() * 10000);
	while ($("#" +this.paginId).length) {
		this.paginId = 'a' +Math.ceil(Math.random() * 10000);
	}

	this.current = 1;

	$("#" +id).after("<div class=\"pagination-centered\" id=" +this.paginId +">"
			+"<ul class=\"pagination\">"
    		+"<li class=\"arrow unavailable\" data-attr=\"prev\"><a href=\"javascript: void(0)\">&laquo;</a></li>"
    		+this.pages
    		+"<li class=\"arrow\"  data-attr=\"next\"><a href=\"javascript: void(0)\">&raquo;</a></li>"
  			+"</ul>"
			+"</div>");

	$("#" +this.paginId).children("ul").children("li").eq(1).addClass("current");
	if (this.total <= 1) {
		$("#" +this.paginId).children("ul").children(".arrow").eq(1).addClass('unavailable');
	}

	for (i = 1; i <= this.max; i++) {
		$("#" +id +" tr").eq(i).show();
	}
	for (i = this.max + 1; i <= this.count; i++) {
		$("#" +id +" tr").eq(i).slideUp();
	}

	// Now attach event listener to other all buttons
	var $this = this;
	$("#" +this.paginId +" ul li").on('click', function(e) {
		if (typeof $(this).attr("class") != "undefined" && $(this).attr("class").indexOf("current") != -1) {
			e.preventDefault();
			return;
		}

		var target = (parseInt($(this).children("a").html()));
		if (isNaN(target)) {
			if ($(this).attr("class").indexOf("unavailable") != -1)
				return;

			// its an arrow
			if ($(this).attr("data-attr") == "prev") {
				// go previous
				target = $this.current - 1;
				if (target < 1) {
					e.preventDefault();
					return;
				}
			} else {
				// go next
				target = $this.current + 1;
				if (target > $this.total) {
					e.preventDefault();
					return;
				}
			}
			e.preventDefault();
		}
		// hide all
		for (i = 1; i < $this.count + 1; i++) {
			$("#" +id +" tr").eq(i).hide();
		}

		for (i = (target - 1) * $this.max + 1; i <= $this.count && i <= (target) * $this.max; i++) {
			$("#" +id +" tr").eq(i).slideDown();
		}

		// animate to the target
		$('html,body').animate({
        	scrollTop: $("#" +$this.id).offset().top - 50},
        'slow');

        $("#" +$this.paginId +" ul li").removeClass("current");
        $("#" +$this.paginId +" ul li").eq(target).addClass("current");


        $this.current = target;

        // @todo - handle unavailability of next and prev
        if (target == 1) {
        	$("#" +$this.paginId).children("ul").children(".arrow").eq(0).addClass('unavailable');
        } else {
        	$("#" +$this.paginId).children("ul").children(".arrow").eq(0).removeClass('unavailable');
        }

        if (target == $this.total) {
        	$("#" +$this.paginId).children("ul").children(".arrow").eq(1).addClass('unavailable');
        } else {
        	$("#" +$this.paginId).children("ul").children(".arrow").eq(1).removeClass('unavailable');
        }

	}); 
}

var paginationObj;

$(document).ready(function() {

	


	/**
	 * Code to pickup the list of active tasks on pageload and start getting its information
	 */
	$(".activetask").each(function(){
		$(this).parent("tr").attr("id", "task_item_" +$(this).attr('taskid'));
		var o = new task({taskid: $(this).attr('taskid'),
					checksum: $(this).attr('checksum'),
					todo: 1000,
					done: 0,
					description: '',
					started_at_timestamp: $(this).parent('tr').children('td').eq('1').attr('timestamp'),
					ended_at: -1
					}, true);
	});

	/**
	 * Code to handle repo list and repositories
	 */
	$("#repo_search").on('keyup', function() {
		var val = $(this).val();
		if (val.length) {
			var count = 0;

			val = val.toLowerCase();

			$("#_REPO_LIST tr").each(function(){
				if ($(this).children("th").length) return;
				if (typeof $(this).children("td").eq(1).children("a").html() == "undefined") {
					$(this).slideUp();
					return;
				}

				if ($(this).children("td").eq(1).children("a").html().toLowerCase().indexOf(val) == -1) {
					if (typeof $(this).children("td").eq(3).children("span").eq(1).html() == "undefined") {
						$(this).slideUp();
						return;
					}

					if ($(this).children("td").eq(3).children("span").eq(1).html().toLowerCase().indexOf(val) == -1) {
						$(this).slideUp();
					} else {
						$(this).show();
						++count;
					}
				} else {	
					$(this).show();
					++count;
				}
			});
			if (!count && !$("#repo_match_not_found").length) {
				$("#repo_search").css('border', '1px solid rgba(255, 0, 0, 0.26)');
				$("#repo_search").css('box-shadow', 'inset 0px 0px 7px rgba(255, 0, 0, 0.27)');
				$("#repo_search").css('color', 'rgba(100, 7, 7, 0.65)');
			} else if (count) {
				$("#repo_search").css('border', '');
				$("#repo_search").css('box-shadow', '');
				$("#repo_search").css('color', '');
			}

			$("#" +paginationObj.paginId).remove();
		} else {
			$("#" +paginationObj.paginId).remove();
			paginationObj = new pagination("_REPO_LIST");
		}	
	});

	// --- handeling pagination
	paginationObj = new pagination("_REPO_LIST");

	// -- Dealing with tags
	$("span.tag").each(function() {
		var uname = $(this).html();
		var d = /(<.*>)(.*)/.exec(uname);
		if (typeof d != "undefined" && d[2] != "undefined") {
			uname = d[2];
		} else return;

		$(this).html('<a href="https://github.com/' +uname +'" title="uname on github" target="new">' +d[1] +'' +uname +'</a>');
	});

	/**
	 * Code to make all .large_no data, 
	 */
	$("span.large_no").toArabic();

	$("#prompt_cancel, .prompt_close").live('click', function() {
		$("#olayer, #obox").fadeOut();
		$("#obox").html("");
		$("#obox").css("min-height", "200px");
	});
});


function prompt(que, title, placeholder, _value, button, callback) {
	if (typeof que == 'undefined' || typeof callback == 'undefined') return;
	$("#obox").css("min-height", "0px");

	$("#olayer").fadeIn();
	$("#obox").html('<div style="padding: 10px;background: rgba(189, 189, 189, 0.51);margin-bottom: 15px;font-size: 12pt;font-family: inherit;font-weight: bold;">' +title +'<a href="javascript:void(0)" class="prompt_close" style="float: right;color: rgb(131, 36, 36);font-weight: 100;">x</a></div>');

	if (typeof que != 'undefined' && que.length) {
		$("#obox").append('<div class="row"><div class="large-12 columns">' +que +'</div></div>');
	}

	if (typeof button == 'undefined')
		button = 'submit';

	if (typeof _value == 'undefined')
		_value = '';


	$("#obox").append('<div class="row"><div class="large-8 columns"><input type="text" id="prompt_data" value="' +_value +'" placeholder="' +placeholder +'"></div><div class="large-12 columns"><button class="success tiny radius" id="prompt_submit">' +button +'</button>  <button class="secondary tiny radius" id="prompt_cancel">Cancel</button></div></div>');

	$("#prompt_submit").on('click', function() {
		var p = $("#prompt_data").val();
		callback(p);
	});
	$("#obox").fadeIn();
}

// ---- GA tracking code
// (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
// (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
// m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
// })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

// ga('create', 'UA-37229689-4', 'auto');
// ga('send', 'pageview');