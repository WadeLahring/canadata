// Define the dimensions and scales for the chart
const margin = {top: 40, right: 20, bottom: 80, left: 40};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Create the SVG container
const svg = d3.select("#chartContainer")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "bg-white border p-4 mt-4")
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Load and parse the CSV data
d3.csv("../data/data.csv").then(data => {
    const parseYear = d3.timeParse("%Y");
    
    data.forEach(d => {
        d.Year = parseYear(d.Year);
    });
    console.log(data)

    // Create series from the data
    const series = createSeries(data);

    // Create chart with the series
    drawChart(data, series);

    }).catch(function(error) {
        console.error("Error loading the CSV file:", error);
});

// This function transforms the data into series
function createSeries(data) {
    const seriesNames = data.columns.slice(1); // Exclude 'Year'

    const series = seriesNames.map(name => {
        return {
            name: name,
            values: data.map(d => ({
                date: d.Year,
                value: +d[name]
            }))
        };
    });

    return series;
}

function drawChart(data, series) {
    // Compute scale domains
    const xDomain = d3.extent(series[0].values, d => d.date);

    const yDomain = [
        d3.min(series, s => d3.min(s.values, d => d.value)),
        d3.max(series, s => d3.max(s.values, d => d.value))
    ];

    // Define scales
    const xScale = d3.scaleTime()
        .domain(xDomain)
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain(yDomain)
        .range([height, 0]);

    // Create a color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Add the title
    svg.append("text")
        .attr("x", 0)
        .attr("y", -20)
        .attr("text-anchor", "start")
        .attr("class", "chart-title font-poppins text-2x1")
        .text("GDP per Capita (2022 CAD)");

    // Add the axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // Modify the line generator to handle missing points DOESNT WORK YET
    const lineGenerator = d3.line()
        .defined(d => d.value !== 0)
        .x(d => xScale(d.date))
        .y(d => yScale(d.value));

    // Plot each series
    series.forEach((s, index) => {
        svg.append("path")
            .datum(s.values)
            .attr("fill", "none")
            .attr("stroke", colorScale(index))
            .attr("stroke-width", 1.5)
            .attr("d", lineGenerator);
    });
}
