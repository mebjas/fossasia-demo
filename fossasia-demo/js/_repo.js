/**
 * JS code specifically for repo & branch page
 * @todo - minify this later
 */

$(document).ready(function() {
	$(".expand_code").live('click', function() {
		var id = $(this).attr("data-id");
		$(this).attr("src", "../../resources/icons_black/compress.png");
		$(this).attr("title", "View less");
		$(this).removeClass('expand_code');
		$(this).addClass('compress_code');

		var top = $(".todo_row [data-id='" +id +"']").offset().top;
		console.log(top);

		$(".moreinfo[data-id='" +id +"'").slideDown();
	});
	
	$(".compress_code").live('click', function() {
		var id = $(this).attr("data-id");
		$(this).attr("src", "../../resources/icons_black/expand2.png");
		$(this).attr("title", "View more");
		$(this).removeClass('compress_code');
		$(this).addClass('expand_code');

		$(".moreinfo[data-id='" +id +"'").slideUp();
	});

	$("._tmpstmp").toRelativeDate(true);

	// To convert deadline timestamp to real date
	$(".deadline_date").each(function() {
		var no = parseInt($(this).html().trim()) * 1000;
		console.log(no);
		var date = new Date(no);
		var op = '';
		switch(date.getMonth()) {
			case 0: op += 'Jan'; break;
			case 1: op += 'Feb'; break;
			case 2: op += 'Mar'; break;
			case 3: op += 'Apr'; break;
			case 4: op += 'May'; break;
			case 5: op += 'Jun'; break;
			case 6: op += 'Jul'; break;
			case 7: op += 'Aug'; break;
			case 8: op += 'Sep'; break;
			case 9: op += 'Oct'; break;
			case 10: op += 'Nov'; break;
			case 11: op += 'Dec'; break;
		};
		op += ' ' +date.getDate();
		var year = date.getFullYear();
		$(this).html('<span class="deadline_date_date">' +op +'</span>');
		$(this).append('<span class="deadline_date_year">' +year +'</span>');
	});

	// To find relative days left
	$(".deadline_relative").each(function() {
		var d = parseInt($(this).attr("data-deadline"));
		var current = (new Date().getTime()) / 1000;

		var diff = (d - current);
		if (diff < 0) {
			// Overdue
			$(this).append('<span style="color:rgb(145, 18, 18)">overdue</span>');
			$(this).parent('.deadline').addClass('_dline_extreme');
		} else if (diff < 60) {
			$(this).append(diff +'s left');
			$(this).parent('.deadline').addClass('_dline_high');
		} else if (diff / 60 < 60) {
			$(this).append(Math.round(diff/60) +'m left');

			// if less than 5 min then high else ok
			if (diff / 60 < 5) $(this).parent('.deadline').addClass('_dline_high');
			else $(this).parent('.deadline').addClass('_dline_medium');
		} else if (diff / 3600 < 24) {
			$(this).append(Math.round(diff/3600) +'h left');
			$(this).parent('.deadline').addClass('_dline_medium');
		} else {
			$(this).append(Math.round(diff/86400) +'d left');
			$(this).parent('.deadline').addClass('_dline_normal');
		}
	});
	$(".color").each(function() {
		var color = $(this).attr("data-color");
		$(this).css("background", color);
	});

	$("._ul_labels li").each(function() {
		var color = $(this).attr('data-color');
		$(this).children('span').css('background', color)
	});

	$("._add_more_tags").on('click', function() {
		var arr = /.*\/([\d]*)(?:#.*)*/.exec(location.href);
		if (typeof arr[1] != "undefined")
			new request("tag", arr[1], '{"task":"add_dialog"}');
	});
	$("._add_more_labels").on('click', function() {
		var arr = /.*\/([\d]*)(?:#.*)*/.exec(location.href);
		if (typeof arr[1] != "undefined")
			new request("label", arr[1], '{"task":"add_dialog"}');
	});

	var MIN_COMMENT_LENGTH = 4;
	$("#_post_new_comment").on('click', function() {
		var arr = /.*\/([\d]*)(?:#.*)*/.exec(location.href);
		if (typeof arr[1] != "undefined") {
			var comment = $("#_new_comment").val().trim();
			if (comment.length < MIN_COMMENT_LENGTH) {
				return new notification("comment should be minimum " +MIN_COMMENT_LENGTH +" charecters long", "warning");
			}
			new request("comment", arr[1], '{"task":"add", "comment":"' +comment +'"}', function() {
				location.reload();
			});
		}
	});

	$("._delete_comment").on('click', function() {
		var arr = /.*\/([\d]*)(?:#.*)*/.exec(location.href);
		if (typeof arr[1] != "undefined") {
			var comment_id = parseInt($(this).attr("data-comment_id"));
			if (isNaN(comment_id)) {
				return;
			}
			new request("comment", arr[1], '{"task":"delete", "comment_id":"' +comment_id +'"}', function(r) {
				$("div.__comment[data-comment_id='" +r.extra[0] +"']").fadeOut();
				setTimeout(function() {
					$("div.__comment[data-comment_id='" +r.extra[0] +"']").next().remove();
					$("div.__comment[data-comment_id='" +r.extra[0] +"']").remove();
				}, 500);
			});
		}
	});

	$("._edit_comment").on('click', function() {
		var comment_id = parseInt($(this).attr("data-comment_id"));
		if (isNaN(comment_id)) {
			return;
		}

		$(this).hide();
		var $this = $(this);

		var comment = $("._comment_text[data-comment_id='" +comment_id +"']").html().trim();
		$("._comment_text[data-comment_id='" +comment_id +"']").html("<textarea class=\"_update_comment e_comment\" data-comment_id=\"" +comment_id +"\">"+comment+"</textarea><a class=\"small radius button success _update_new_comment\" href=\"javascript: void(0)\" style=\"padding: 5px 10px;\" data-comment_id=\"" +comment_id +"\">update</a>&nbsp;<a class=\"small radius button secondary _update_new_comment_cancel\" href=\"javascript: void(0)\" style=\"padding: 5px 10px;\" data-comment_id=\"" +comment_id +"\">cancel</a>");

		$("._update_new_comment_cancel[data-comment_id='" +comment_id +"']").on('click', function() {
			var comment_id = parseInt($(this).attr("data-comment_id"));
			var comment = $(this).prev().prev().val();
			$(this).parent("div").html(comment);
			$this.show();
		});

		$("._update_new_comment[data-comment_id='" +comment_id +"']").live('click', function() {
			var arr = /.*\/([\d]*)(?:#.*)*/.exec(location.href);
			if (typeof arr[1] != "undefined") {
				var comment_id = parseInt($(this).attr("data-comment_id"));
				var comment = $(this).prev().val().trim();
				if (isNaN(comment_id) || comment.length < MIN_COMMENT_LENGTH) {
					return;
				}
				new request("comment", arr[1], '{"task":"edit", "comment_id": "' +comment_id +'", "comment": "' +comment +'"}', function(r) {
					$("._comment_text[data-comment_id='" +r.extra[0] +"']").html(r.extra[1]);
					$this.show();
				});
			}
		});

	});

	$("#_button_follow").on('click', function() {
		var arr = /.*\/([\d]*)(?:#.*)*/.exec(location.href);
		if (typeof arr[1] != "undefined") {
			var task = $(this).attr("task");
			if (task == 'follow' || task == 'unfollow') {
				var $this = $(this);
				new request('follow', arr[1], '{"task": "' +task +'"}', function(r) {
					console.log(r);
					$this.attr('task', r.extra[0]);
					$this.html(r.extra[0]);
				});
			} else return new notification('unable to ' +task +' this request', 'warning');
		}
	});	

	$("._change_assignment").on('click', function() {
		prompt("", "Assign this todo", "enter username", "", "Assign", function(r) {
			if (r.trim().length)
			var arr = /.*\/([\d]*)(?:#.*)*/.exec(location.href);
			if (typeof arr[1] != "undefined") {
				new request("assignment", arr[1], '{"task":"assign", "name": "' +r.trim() +'"}', function(s) {
					$(".___assignment").html("Assigned to <a href='../../../" +s.extra[0] +"'><img src='" +s.extra[1] +"' style='width: 20px'> " +s.extra[0] +"</a>");
					$(this).children("img").attr("src", "../../../../resources/icons_black/pencil.png");
				});
			}
			$("#olayer, #obox").fadeOut();
			$("#obox").html("");
			$("#obox").css("min-height", "200px");
		})
	});

	$("._remove_assignment").on('click', function() {
		var arr = /.*\/([\d]*)(?:#.*)*/.exec(location.href);
		if (typeof arr[1] != "undefined") {
			var $this = $(this);
			new request("assignment", arr[1], '{"task":"unassign"}', function(s) {
					$(".___assignment").html("assign now ");
					$(this).next().children("img").attr("src", "../../../../resources/icons_black/plus.png");
					$this.remove();
				});
		}
	});

	$("._change_todo").on('click', function() {
		prompt("", "Edit todo", "enter new todo", $(".__todo_text").html().trim(), "Update", function(r) {
			if (!r.trim().length) return;

			var arr = /.*\/([\d]*)(?:#.*)*/.exec(location.href);
			if (typeof arr[1] != "undefined") {
				new request("todo", arr[1], '{"task":"update", "payload": "' +r +'"}', function(s) {
					$(".__todo_text").html(s.extra[0]);
				});
			}
			$("#olayer, #obox").fadeOut();
			$("#obox").html("");
			$("#obox").css("min-height", "200px");
		})
	});

	$("#_button_issue").on('click', function() {
		var arr = /.*\/([\d]*)(?:#.*)*/.exec(location.href);
		if (typeof arr[1] != "undefined") {
			// Show dialog
			$("#olayer, #obox").fadeIn();
			// Add header
			$("#obox").html('<div style="padding: 10px;background: rgba(189, 189, 189, 0.51);margin-bottom: 15px;font-size: 12pt;font-family: inherit;font-weight: bold;">Create Issue on Github<a href="javascript:void(0)" class="close" style="float: right;color: rgb(131, 36, 36);font-weight: 100;">x</a></div>');
			$("#obox").append('<div class="row"><div class="large-12 columns"><input type="text" id="issue_title" placeholder="Issue Title" value="Complete #TODO' +arr[1] +' @TODOCI"></div></div>');
			$("#obox").append('<div class="row"><div class="large-12 columns"><textarea style="color: black; padding:10px" id="issue_description" placeholder="Issue description here"></textarea></div></div>');
			$("#issue_description").val($(".__todo_text").html().trim());

			$("#obox").append('<div class="row"><div class="large-12 columns"><a class="small radius button success _create_issue" href="javascript: void(0)" style="padding: 5px 10px;" data-comment_id="3">Create</a>&nbsp; <a class="small radius button secondary _create_issue_cancel" href="javascript: void(0)" style="padding: 5px 10px;" data-comment_id="3">cancel</a></div></div>');


		}

	});
	$("#obox div a.close, ._create_issue_cancel").live('click', function() {
		$("#olayer, #obox").fadeOut();
		$("#obox").html();
	});

	$("._create_issue").live('click', function() {
		var title = $("#issue_title").val().trim();
		var desc = $("#issue_description").val().trim();
		if (!title.length || !desc.length)
			return;
		var arr = /.*\/([\d]*)(?:#.*)*/.exec(location.href);
		if (typeof arr[1] != "undefined") {
			new request("issue", arr[1], '{"title":"' +title +'", "desc": "' +desc +'"}', function(s) {
				$("#olayer, #obox").fadeOut();
				$("#obox").html();
				$("#_button_issue").fadeOut();
				$("#__issue_link").html("<a href='" +s.extra[0] +"' target='_blank'>view issue on Github #" +s.extra[1] +"</a>");
				//@todo - change this with an action
			}, function() {
				$("#olayer, #obox").fadeOut();
				$("#obox").html();
			});
		}

	})
	
});