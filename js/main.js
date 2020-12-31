// SVG Size
let width = 700,
	height = 500;

let regions = [];


// Load CSV file
d3.csv("data/wealth-health-2014.csv", function(data){

	// Analyze the dataset in the web console
	// console.log(data);
	// console.log("Countries: " + data.length)

	const preparedData = prepareData(data);
	// console.log(preparedData)
	createVisualization(preparedData);
});

var prepareData = function(data) {
	// convert to integer
	// create regions array w/ name of each region
	data.forEach(function(d) {
		d.LifeExpectancy = +d.LifeExpectancy;
		d.Income = +d.Income;
		d.Population = +d.Population;

		if (!regions.includes(d.Region)) {
			regions.push(d.Region);
		}
	});

	// console.log(data);
	// console.log(regions);

	// sort in population order to prevent overlap
	data.sort(function(x, y) {
		return d3.descending(x.Population, y.Population);
	})

	return data;
}

var createVisualization = function(data) {

	// margin convention
	let margin = {top: 30, right: 30, left: 30, bottom: 50};
	width -= margin.left + margin.right;
	height -= margin.bottom + margin.top;

	// check buffers behave appropriately
	// console.log(width);
	// console.log(height);

	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("id", "chart-area")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Design of axis buffer from Mark at https://stackoverflow.com/questions/34888205
	// Expand axes by 5% to prevent overlap
	const axisBuffer = 0.025
	const incomeDomain = d3.extent(data, function(d) { return d.Income; })
	const incomeRange = incomeDomain[1] - incomeDomain[0]
	const lifeDomain = d3.extent(data, function(d) { return d.LifeExpectancy; })
	const lifeRange = lifeDomain[1] - lifeDomain[0]

	// scale for income (y-axis)
	const incomeScale = d3.scaleLinear()
		// example done without buffer
		// .domain(d3.extent(data, function(d) {
		// 	return d.Income;
		// }))
		.domain([
			incomeDomain[0] - (axisBuffer * incomeRange),
			incomeDomain[1] + (axisBuffer * incomeRange)])
		.range([0, width]);

	// scale for life expectancy (x-axis)
	const lifeScale = d3.scaleLinear()
		// .domain(d3.extent(data, function(d) {
		// 	return d.LifeExpectancy;
		// }))
		.domain([
			lifeDomain[0] - (axisBuffer * lifeRange),
			lifeDomain[1] + (axisBuffer * lifeRange)])
		.range([height, 0]);

	// check scale functions perform appropriately
	// console.log([incomeScale(0), incomeScale(15000), incomeScale(100000)]);
	// console.log([lifeScale(0), lifeScale(50), lifeScale(80)]);

	// circle radius proportional to population
	// given that population has wide range, use a sqrt transform
	const popScale = d3.scaleSqrt()
		.domain(d3.extent(data, function(d) {
			return d.Population;
		}))
		.range([4, 30])

	// color regions using ordinal scale
	// using d3 color scheme
	const regionScale = d3.scaleOrdinal()
		.domain(regions)
		.range(d3.schemeCategory10)

	// map countries to svg circles
	let circles = svg.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cy", function(d) { return(lifeScale(d.LifeExpectancy)); })
		.attr("cx", function(d) { return(incomeScale(d.Income)); })
		.attr("r", function(d) { return(popScale(d.Population)); })
		.attr("fill", function(d) { return(regionScale(d.Region)); })
		.attr("stroke", "purple")
		.attr("opacity", "0.75")
	;

	// create axes
	let xAxis = d3.axisBottom(incomeScale);
	let yAxis = d3.axisLeft(lifeScale);

	// append axes
	// use group elements
	// assign to class axis for modification in css later
	// translate x-axis so it is not on the top of the chart
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)

	// y-axis does not require translation
	svg.append("g")
		.attr("class", "axis")
		.call(yAxis)

	// label axes by appending text
	// add axes in empty space in the upper left and bottom right of chart

	// buffer to prevent text from sitting directly on label
	const textBuffer = 5

	// x-axis label
	svg.append("text")
		.attr("x", width) // to the right
		.attr("y", height - textBuffer) // at the bottom
		.attr("text-anchor", "end")
		.text("Life Expectancy");

	// y-axis label
	// keep in mind that rotation flips the axes for translation
	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", 0 - textBuffer)
		.attr("y", 2 * textBuffer)
		.attr("text-anchor", "end")
		.text("Income")
}