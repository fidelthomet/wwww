var ageband = ["18-24", "25-34", "35-44", "45-54", "55-64", "65-74", "75+"],
	genderNames = ["männlich", "weiblich"],
	width, height,
	svg, bar, sympathyMax, probabilityMax, sympathyAxis, probabilityAxis,
	barHeight = 40,
	barChart,
	sortBy = "sympathy"

var colors = {
	SP: "#FF173E",
	SVP: "#3F7B17",
	FDP: "#1153A9",
	CVP: "#F99929",
	EDU: "#000",
	GPS: "#82BB61",
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
		$("#ages .opt").append('<div class="check checkAge" value="' + age + '">' + ageband[age] + '</div>');
	};
	for (var gender in genderNames) {
		$("#genders .opt").append('<div class="check checkGender" value="' + gender + '">' + genderNames[gender] + '</div>');
	};

	$(".checkAge, .checkGender").click(function() {

		$(this).toggleClass("selected")

		redraw()
	})
})

var data,
	groups;

function getData() {
	d3.csv("data/groups_anteil.csv", function(error, d) {
		if (error) throw error;

		groups = d;

		d3.csv("data/data_groups.csv", function(error, d) {
			if (error) throw error;

			data = d;

			initGraph();
		});
	});
}

function initGraph() {
	width = Math.min(window.innerWidth / 2 - 40, 480)
	height = window.innerHeight

	sympathyMax = d3.scale.linear()
		.range([0, width])
		.domain([0, 10])

	var sympathyScale = d3.scale.linear()
		.range([0, width])
		.domain([10, 0])
	sympathyAxis = d3.svg.axis().scale( sympathyScale).orient( "bottom")

	probabilityMax = d3.scale.linear()
		.range([0, width])
		.domain([0, .4])

	probabilityAxis = d3.svg.axis().scale( probabilityMax).orient( "bottom")

	barChart = d3.select("#chart").append("svg")
		.append("g")
		.attr("class", "sympathy")

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

	var totalWeight = 0

	groups.forEach(function(group) {
		if ((gender.indexOf(group.Geschlecht) != -1) && (age.indexOf(group.Alter) != -1)) {
			totalWeight += parseFloat(group.Anteil)
		}
	})

	var sorted = {}

	data.forEach(function(d) {
		//console.log(d.Geschlecht)
		//console.log(d.Alter)
		if ((gender.indexOf(d.Geschlecht) != -1) && (age.indexOf(d.Alter) != -1)) {
			var weight = 0

			groups.forEach(function(group) {
				if ((d.Geschlecht == group.Geschlecht) && (d.Alter == group.Alter)) {
					weight += parseFloat(group.Anteil)
				}
			})

			if (!sorted[d.Partei]) {
				sorted[d.Partei] = []
			}
			sorted[d.Partei].push({
				sympathy: parseFloat(d.Sympathie),
				probability: parseFloat(d.Wahlwahrscheinlichkeit),
				weight: weight
			})
		}
	});

	//console.log(sorted)

	var values = []

	for (var key in sorted) {

		var val = {
			party: key,
			sympathy: 0,
			probability: 0
		}

		sorted[key].forEach(function(d) {
			val.sympathy += d.sympathy * d.weight / totalWeight
			val.probability += d.probability * d.weight / totalWeight
		})

		values.push(val)
	}

	//console.log(values)
	values.sort(compare)

	return (values)
}

function drawSympathy(selectedData) {
	//sympathy
	barChart.attr("height", barHeight * selectedData.length + 64)

	$(".bar").remove()
	$(".axis").remove()
	$(".text").remove()

	bar = barChart.selectAll("g")
		.data(selectedData)
		.enter().append("g")
		.attr("transform", function(d, i) {
			return "translate(" + (window.innerWidth / 2) + "," + (i * (barHeight+10) + 64) + ")";
		})
		.attr("class", "bar")

	bar.append("rect")
		.attr("width", function(d) {
			return sympathyMax(d.sympathy);
		})
		.attr("transform", function(d) {
			return "translate(-" + (sympathyMax(d.sympathy) + 30) + ",0)"
		})
		.attr("height", barHeight - 1)
		.attr("fill", function(d) {
			return colors[d.party]
		})

	barChart.append("g")
		.attr("transform", function(d) {
			return "translate(" + (window.innerWidth / 2 - 30 - sympathyMax(10)) + ",39)"
		})
		.attr("class", "axis")
		.call( sympathyAxis)

	bar.append("rect")
		.attr("width", function(d) {
			return probabilityMax(d.probability);
		})
		.attr("transform", function(d) {
			return "translate(30,0)"
		})
		.attr("height", barHeight - 1)
		.attr("fill", function(d) {
			return colors[d.party]
		})

	bar.append("rect")
		.attr("width", "58")
		.attr("transform", function(d) {
			return "translate(-29,0)"
		})
		.attr("height", barHeight - 1)
		.attr("fill", function(d) {
			return colors[d.party]
		})
		.attr("fill-opacity", ".5")

	bar.append("text").attr("transform", function(d) {
			return "translate(0,20)";
		})
		.attr("dy", ".35em")
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.text(function(d) {
			if (d.party == "none") {
				return ""
			} else return d.party;
		});

	barChart.append("g")
		.attr("transform", function(d) {
			return "translate(" + (window.innerWidth / 2 + 30) + ",39)"
		})
		.attr("class", "axis")
		.call( probabilityAxis)

	barChart.append("text").attr("transform", function(d) {
			return "translate(" + (window.innerWidth / 2 - 30 - sympathyMax(5)) + ",20)";
		})
		.attr("dy", ".35em")
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.text("Sympathiewerte")
		.attr("class", "text")

	barChart.append("text").attr("transform", function(d) {
			return "translate(" + (window.innerWidth / 2 + 30 + width / 2) + ",20)";
		})
		.attr("dy", ".35em")
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.text("Wähleranteil")
		.attr("class", "text")

}

function redraw(){
	var ages = []
		$(".checkAge.selected").each(function(i, el) {
			ages.push(ageband[$(el).attr("value")])
		})

	var gender = []
		$(".checkGender.selected").each(function(i, el) {
			gender.push(genderNames[$(el).attr("value")])
		})

	drawSympathy(getValues(gender, ages))
}

function compare(a,b) {
  if (a[sortBy] < b[sortBy])
    return 1;
  if (a[sortBy] > b[sortBy])
    return -1;
  return 0;

}