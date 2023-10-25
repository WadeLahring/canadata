// Define the dimensions and scales for the chart
const margin = {top: 40, right: 80, bottom: 60, left: 60};
const width = 700 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Define the currency format
const currencyFormat = d3.format("$,")

// Create the SVG container for the chart
const svg = d3.select("#chartContainer")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "bg-white border p-4 mt-4")
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create the tooltip
const tooltip = d3.select("#tooltip");

// Load and parse the CSV data
d3.csv("../data/data.csv").then(data => {
    const parseYear = d3.timeParse("%Y");
    
    data.forEach(d => {
        d.Year = parseYear(d.Year);
    });

    // Create series from the data
    const series = createSeries(data);

    console.log(data)

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
    console.log(series)

    return series;
}

function drawChart(data, series) {
    // Compute scale domains
    const xDomain = d3.extent(series[0].values, d => d.date);

    const yDomain = [
        0,
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
        .attr("x", -50)
        .attr("y", -20)
        .attr("text-anchor", "start")
        .attr("class", "chart-title font-poppins text-1xl text-gray-800")
        .text("GDP per Capita (2022 CAD)");

    // Ensure max values on x-axis are always displayed
    const defaultXTicks = xScale.ticks();
    if (!defaultXTicks.includes(xDomain[1])) {
        defaultXTicks.push(xDomain[1])
        defaultXTicks.splice((defaultXTicks.length - 1) - 1, 1);
    }
    
    // Add the axes
    const xAxis = d3.axisBottom(xScale)
        .tickValues(defaultXTicks)
        .tickFormat(d3.timeFormat("%Y"));

    const yAxis = d3.axisLeft(yScale)
        .tickFormat(currencyFormat);

    svg.append("g")
        .attr("class", "x axis font-poppins text-gray-800")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .select(".domain, .tick line")
        .attr("class", "stroke-current text-gray-800");

    svg.append("g")
        .attr("class", "y axis font-poppins text-gray-800")
        .call(yAxis)
        .select(".domain")
        .style("stroke-opacity", 0)
        .select(".domain, .tick line")
        .attr("class", "stroke-current text-gray-800");
        
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

    // Create invisible circles for each tooltip DOESN'T WORK YET
    series.forEach((s, index) => {
        svg.selectAll(`.circle-tooltip-${index}`)
            .data(s.values)
            .join("circle")
            .attr("class", `circle-tooltip-${index}`)
            .attr("cx", d => xScale(d.date))
            .attr("cy", d => yScale(d.value))
            .attr("r", 5) // Adjust radius as needed
            .style("fill", "none")
            .style("pointer-events", "all")
            .append("title")
            .text(s.name)
    });
}