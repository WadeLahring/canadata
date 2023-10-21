d3.csv("../data/data.csv").then(function(data) {
    data.forEach(d => {
        d.year = new Date(d.year, 0);
        d.seriesA = +d.seriesA;
        d.seriesB = +d.seriesB;
    });
    drawChart(data);
}).catch(function(error) {
        console.error("Error loading the CSV file:", error);
});

function drawChart(data) {

// Define the dimensions and scales for the chart
const width = 600;
const height = 475;
const margin = {top: 20, right: 20, bottom: 60, left: 40};

const xScale = d3.scaleTime()
    .domain([new Date(2018, 0), new Date(2023, 0)])
    .range([margin.left, width - margin.right]);

const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.max(d.seriesA, d.seriesB))])
    .range([height - margin.bottom, margin.top]);

// Create an SVG container
const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Add the title
svg.append("text")
    .attr("x", margin.left)    
    .attr("y", margin.top)
    .attr("text-anchor", "start")
    .attr("class", "chart-title")
    .text("GDP per Capita (CAD)");

// Add the axes
const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
const yAxis = d3.axisLeft(yScale);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

svg.append("g")
    .attr("class", "y axis cackle")
    .attr("transform", `translate(${margin.left})`)
    .call(yAxis);

// Define the lines, one for each series
const lineA = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.seriesA));

const lineB = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.seriesB));

// Add the lines, one for each series
svg.append("path")
    .datum(data)
    .attr("class", "line lineA")
    .attr("d", lineA)
    .style("stroke", "steelblue")
    .style("fill", "none");

svg.append("path")
    .datum(data)
    .attr("class", "line lineB")
    .attr("d", lineB)
    .style("stroke", "darkorange")
    .style("fill", "none");

// Add dots for data points, one for each series
svg.selectAll(".dotA")
    .data(data)
    .enter().append("circle")
    .attr("class", "dotA")
    .attr("cx", d => xScale(d.year))
    .attr("cy", d => yScale(d.seriesA))
    .attr("r", 3)
    .style("fill", "steelblue");

svg.selectAll(".dotB")
    .data(data)
    .enter().append("circle")
    .attr("class", "dotB")
    .attr("cx", d => xScale(d.year))
    .attr("cy", d => yScale(d.seriesB))
    .attr("r", 3)
    .style("fill", "darkorange");

// Define the Legend's properties
const legendSpacing = 20;
const legendHeight = 20;
const legendWidth = 130;
const legendOffset = 20;

const seriesInfo = [
    {name: "Alberta", color: "steelblue", visible: true},
    {name: "British Columbia", color: "darkorange", visible: true}
];

// Create the legend
const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${margin.left},${height - legendOffset})`);

seriesInfo.forEach((series, i) => {
    const legendGroup = legend.append("g")
        .attr("transform", `translate(${i * (legendWidth + legendSpacing)}, 0)`)
        .on("click", function() {
            // Toggle series visibility
            series.visible = !series.visible;

            // Update chart
            toggleSeries(series.name, series.visible);

            // Update legend styling
            d3.select(this).select("rect").style("opacity", series.visible ? 1 : 0.5);
        });

    // Rectangle for color
    legendGroup.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", series.color);
    
    // Series name
    legendGroup.append("text")
        .attr("x", legendWidth / 2) // Centering the text inside the rectangle
        .attr("y", legendHeight / 2) // Centering the text vertically the rectangle
        .attr("dy", ".35em") // Adjust position to vertically center text
        .style("text-anchor", "middle")
        .text(series.name);
});

// Implement the toggleSeries function to show / hide series
function toggleSeries(seriesName, isVisible) {
    if (seriesName === "Alberta") {
        svg.selectAll(".dotA").style("display", isVisible ? "initial" : "none");
        svg.selectAll(".lineA").filter(d => d === data).style("display", isVisible ? "initial" : "none");
    } else if (seriesName === "British Columbia") {
        svg.selectAll(".dotB").style("display", isVisible ? "initial" : "none");
        svg.selectAll(".lineB").filter(d => d === data).style("display", isVisible ? "initial" : "none");
    }
}
}