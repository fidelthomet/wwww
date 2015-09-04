var ageband = ["18-24", "25-34", "35-44", "45-54", "55-64", "65-74", "75+"],
	genderNames = {
		m: "männlich",
		f: "weiblich",
		b: "-"
	},
	width, height, sympathyWidth, sympathyHeight,
	svg, bar, barMax, arc, pie, radius,
	barHeight = 40,
	barChart, donutChart

var colors = {
	SP: "#FF173E",
	SVP: "#3F7B17",
	FDP: "#1153A9",
	CVP: "#F99929",
	EDU: "#000",
	GP: "#82BB61",
	GLP: "#C2D82E",
	BDP: "#FFDF00",
	PdA: "#000",
	AL: "#000",
	EVP: "#FCDD04"
}

$(function() {
	getData();
	
	for( var age in ageband){
		$("#ages").append(
			'<div class="checkbox"><label><input type="checkbox" value="">'
			+ageband[age]+'</label></div>');
	};
	for( var gender in genderNames){
		$("#genders").append(
			'<div class="checkbox"><label><input type="checkbox" value="">'
			+genderNames[gender]+'</label></div>');
	};
})

var data;

function getData() {
	d3.csv("data/data_groups.csv", function(error, d) {
		if (error) throw error;

		data = d

		initGraph()
	})
}

function initGraph() {
	width = window.innerWidth
	height = window.innerHeight

	sympathyWidth = width / 2 - 40
	sympathyHeight = height - 120

	radius = Math.min(sympathyWidth, sympathyHeight) / 2

	barMax = d3.scale.linear()
		.range([0, sympathyWidth])
		.domain([0, 1])

	barChart = d3.select("#chart").append("svg")
		.append("g")
		.attr("class", "sympathy")

	donutChart = d3.select("svg")
		.append("g")
		.attr("class", "donut")

	arc = d3.svg.arc()
		.outerRadius(radius - 10)
		.innerRadius(radius - 130);

	pie = d3.layout.pie()
		.sort(null)
		.value(function(d) {
			return d.sympathy;
		});


	drawSympathy(getValues())
}

// gender (String): m/f/b
// age (Array, String) -> ageband: [ageband[0],ageband[1],...]
function getValues(gender, age) {
	if (!gender) {
		gender = "b"
	}
	if (!age) {
		age = ageband
	}

	var sorted = {}

	data.forEach(function(d) {
		if ((d.Geschlecht == genderNames[gender] || gender == "b") && (age.indexOf(d.Alter) != -1)) {
			if (!sorted[d.Partei]) {
				sorted[d.Partei] = []
			}
			sorted[d.Partei].push({
				sympathy: d.Sympathie,
				probability: d.Wahlwahrscheinlichkeit
			})
		}
	});

	var values = []

	for (var key in sorted) {
		console.log(key)
		var val = {}
		var total = 0

		sorted[key].forEach(function(d) {
			total += parseFloat(d.probability)
		})
		val.party = key
		val.sympathy = 0
		sorted[key].forEach(function(d) {
			val.sympathy += (parseFloat(d.probability) / total) * parseFloat(d.sympathy)
		})
		values.push(val)
	}

	return (values)
}

function drawSympathy(selectedData) {
	//sympathy
	barChart.attr("height", barHeight * selectedData.length);

	$(".bar").remove()
	$(".arc").remove()

	bar = barChart.selectAll("g")
		.data(selectedData)
		.enter().append("g")
		.attr("transform", function(d, i) {
			return "translate(0," + i * barHeight + ")";
		})
		.attr("class", "bar")

	bar.append("rect")
		.attr("width", function(d) {
			return barMax(d.sympathy);
		})
		.attr("height", barHeight - 1)
		.attr("fill", function(d) {
			return colors[d.party]
		})

	//results
	var g = donutChart.selectAll(".arc")
		.data(pie(selectedData))
		.enter().append("g")
		.attr("class", "arc");

	g.append("path")
		.attr("d", arc)
		.attr("class", "arcDonut")
		.style("fill", function(d) {
			return colors[d.data.party]
		});

	g.append("text")
	    .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
	    .attr("dy", ".35em")
	    .style("text-anchor", "middle")
	    .text(function(d) { return d.data.party; });

}