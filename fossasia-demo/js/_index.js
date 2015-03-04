/**
 * JS code specifically for main index page
 * @todo - minify this later
 */
var O;
var jsonData;

function plotGraph() {
	var obj = jsonData;
	$("#_todo_on_github div.graph").dxChart({
	    dataSource: obj.data,

	    series: {
	        argumentField: "lang",
	        valueField: "count",
	        name: "Net #TODOs in different languages",
	        type: "spline"
	    },
	    tooltip:{
	        enabled: true
	    },
	    title: "#TODOs on Github (in Millions)",
	    legend: {
	        verticalAlignment: "bottom",
	        horizontalAlignment: "center"
	    },
	    argumentAxis:{
	        grid:{
	            visible: true
	        }
	    },
	    valueAxis:{
			label: {
				format: "millions"
			}
		}
	});
}

 $(document).ready(function() {
	// - plotting the graph if json is available
	if ($("#_todo_on_github").length) {
		jsonData = JSON.parse($("#_todo_on_github div.json_data").html());
		plotGraph();
	}

	$(".timestamp").toPrettyDate("D, d^ M'y");

	window.onresize = function() {
		plotGraph();
	}
});
