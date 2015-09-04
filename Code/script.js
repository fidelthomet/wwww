var ageband = ["18-25", "26-35", "36-49", "50-65", "65+"],
	genderNames = {
		m: "männlich",
		f: "weiblich",
		b: "-"
	},
	width, height, sympathyWidth, sympathyHeight,
	svg, bar, barMax
	barHeight = 40

$(function() {
	getData()
})

var data;

function getData() {
	d3.csv("data/example.csv", function(error, d) {
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

	barMax = d3.scale.linear()
    .range([0, sympathyWidth])
    .domain([0, 1])

	barChart = d3.select("body").append("svg")
		.append("g")
		.attr("class", "sympathy")

	

	

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
				count: d.Anzahl
			})
		}
	});

	var values = []


	for (var key in sorted) {
		var val = {}
		var total = 0

		sorted[key].forEach(function(d) {
			total += parseInt(d.count)
		})
		val.party = key
		val.sympathy = 0
		sorted[key].forEach(function(d) {
			val.sympathy += (parseFloat(d.count) / total) * parseFloat(d.sympathy)
		})
		values.push(val)
	}

	return (values)
}

function drawSympathy(selectedData) {
	barChart.attr("height", barHeight * selectedData.length);

	$(".bar").remove()

	bar = barChart.selectAll("g")
		.data(selectedData)
		.enter().append("g")
		.attr("transform", function(d, i) {
			return "translate(0," + i * barHeight + ")";
		})
		.attr("class", "bar")

	bar.append("rect")
      .attr("width", function(d) { return barMax(d.sympathy); })
      .attr("height", barHeight - 1);
}