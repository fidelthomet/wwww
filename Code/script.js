var ageband = ["18-24", "25-34", "35-44", "45-54", "55-64", "65-74", "75+"],
	genderNames = ["männlich", "weiblich"],
width, height, sympathyWidth, sympathyHeight,
svg, bar, barMax, arc, pie, radius,
barHeight = 40,
	barChart, donutChart,
	totalSympathy

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
	EVP: "#FCDD04",
	none: "#FFF"
}

$(function() {
	getData();

	for (var age in ageband) {
		$("#ages").append('<div class="checkbox"><label><input type="checkbox" class="checkAge" value="' + age + '">' + ageband[age] + '</label></div>');
	};
	for (var gender in genderNames) {
		if (gender != "b")
			$("#genders").append('<div class="checkbox"><label><input type="checkbox" class="checkGender" value="' + gender + '">' + genderNames[gender] + '</label></div>');
	};

	$(".checkAge, .checkGender").change(function() {



		var ages = []
		$(".checkAge").each(function(i, el) {
			if ($(el).prop('checked')) {
				ages.push(ageband[el.value])
			}
		})

		var gender = []
		$(".checkGender").each(function(i, el) {
			if ($(el).prop('checked')) {
				gender.push(genderNames[el.value])
			}
		})

		drawSympathy(getValues(gender, ages))
	})
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
		.domain([0, 10])

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

// gender (Array, String): m/f/b
// age (Array, String) -> ageband: [ageband[0],ageband[1],...]
function getValues(gender, age) {
	if (!gender) {
		gender = genderNames
	} else if (!gender.length) {
		gender = genderNames
	}
	if (!age) {
		age = ageband
	} else if (!age.length) {
		age = ageband
	}

	var sorted = {}
	data.forEach(function(d) {
		console.log(d.Geschlecht)
		console.log(gender.indexOf(d.Geschlecht))
		if ((gender.indexOf(d.Geschlecht) != -1) && (age.indexOf(d.Alter) != -1)) {
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

	console.log(values)

	totalSympathy = 0
	values.forEach(function(d) {
		totalSympathy += d.sympathy
	})

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
	selectedData.push({
		party: "none",
		sympathy: .5 * totalSympathy
	})
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
		.attr("transform", function(d) {
			return "translate(" + arc.centroid(d) + ") rotate(120)";
		})
		.attr("dy", ".35em")

	.style("text-anchor", "middle")
		.text(function(d) {
			if (d.data.party == "none") {
				return ""
			} else return d.data.party;
		});

}