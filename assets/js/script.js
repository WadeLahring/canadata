// Define the dimensions and scales for the chart
const margin = {top: 40, right: 40, bottom: 60, left: 60};
const width = 800 - margin.left - margin.right;
const height = 1600 - margin.top - margin.bottom;

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

// Load and parse the CSV data
d3.csv("../data/data.csv").then(data => {
    const parseYear = d3.timeParse("%Y");
    
    data.forEach(d => {
        d.Year = parseYear(d.Year);
    });

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

// This function draws the chart
function drawChart(data, series) {
    // Compute the max label width so the chart width can be adjusted to make room
    const maxLabelWidth = d3.max(series, s => {
        const tempText = svg.append("text")
            .attr("class", "label text-xs font-poppins")
            .text(s.name);

        const bbox = tempText.node().getBBox();
        tempText.remove();

        return bbox.width;
    });
    
    // Adjust graph width to make sure the labels have room
    const extraPadding = 10; // Accounts for a bit of padding on the inside of the box
    const lineOffset = 20; // Determines the horizontal distance of the leader lines
    const lineOffsetMargin = 4; // Determines the distance between the last data point and the leader line start, and the distance between the leader line end and the label
    const newGraphWidth = width - maxLabelWidth - lineOffset - lineOffsetMargin - extraPadding;
    
    // Compute scale domains
    const xDomain = d3.extent(series[0].values, d => d.date);
    const yDomain = [0, d3.max(series, s => d3.max(s.values, d => d.value))];

    // Define scales
    const xScale = d3.scaleTime()
        .domain(xDomain)
        .range([0, newGraphWidth]);

    const yScale = d3.scaleLinear()
        .domain(yDomain)
        .range([height, 0]);

    // Create a color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    
    

    const labelPositions = series.map(s => yScale(s.values[s.values.length - 1].value));

    // This function groups any overlapping labels
    const groupedLabels = [];
    labelPositions.forEach(y => {
        let foundGroup = false;
        for (const group of groupedLabels) {
            if (isOverlapping(group[group.length - 1], y)) {
                group.push(y);
                foundGroup = true;
                break;
            }
        }
        if (!foundGroup) {
            groupedLabels.push([y]);
        }
    });
    
    groupedLabels.forEach(group => {
        const groupMid = (group[0] + group[group.length - 1]) / 2;
        
        let newY;
        if (groupMid < 0) newY = group[group.length - 1] - groupMid;
        else if (groupMid > height) newY = group[0] + (height - groupMid);
        else newY = groupMid;

        group.forEach((y, index) => {
            const offset = (newY - groupMid) + index * 15;
            group[index] = y + offset;
        });
    });

    const adjustedLabelPositions = groupedLabels.flat();

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

    // Define label constants
    const labelSpacing = 10; // Defines the minimum vertical space between labels
    const placedLabels = []; // Keep track of all perviously placed labels' y positions
    
    // Sort the series based on the last value in ascending order
    series.sort((a, b) => {
        const aValue = a.values[a.values.length - 1].value;
        const bValue = b.values[b.values.length - 1].value;
        return aValue - bValue;
    });

    // Plot each series
    series.forEach((s, index) => {
        svg.append("path")
            .datum(s.values)
            .attr("fill", "none")
            .attr("stroke", colorScale(index))
            .attr("stroke-width", 1.5)
            .attr("d", lineGenerator);
        
        const lastDataPoint = s.values[s.values.length - 1];
        const originalYPosition = yScale(lastDataPoint.value);
        let yPosition = yScale(lastDataPoint.value);

        // Check if the label overlaps with already placed labels
        while(isOverlapping(yPosition, placedLabels, labelSpacing)) {
            yPosition -= labelSpacing; // Adjust position upwards
        }
        
        // Draw the leader lines 
        // Horizontal Segment 1
        svg.append("line")
            .attr("x1", lineOffsetMargin + xScale(lastDataPoint.date))
            .attr("y1", originalYPosition)
            .attr("x2", lineOffsetMargin + xScale(lastDataPoint.date) + lineOffset/2)
            .attr("y2", originalYPosition)
            .attr("class", "stroke-gray-400")
            .attr("stroke-width", 0.5);

        // Vertical segment
        svg.append("line")
            .attr("x1", lineOffsetMargin + xScale(lastDataPoint.date) + lineOffset/2)
            .attr("y1", originalYPosition)
            .attr("x2", lineOffsetMargin + xScale(lastDataPoint.date) + lineOffset/2)
            .attr("y2", yPosition)
            .attr("class", "stroke-gray-400")
            .attr("stroke-width", 0.5);

        // Horizontal Segment 2
        svg.append("line")
            .attr("x1", lineOffsetMargin + xScale(lastDataPoint.date) + lineOffset/2)
            .attr("y1", yPosition)
            .attr("x2", lineOffsetMargin + xScale(lastDataPoint.date) + lineOffset)
            .attr("y2", yPosition)
            .attr("class", "stroke-gray-400")
            .attr("stroke-width", 0.5);

        svg.append("text")
                .attr("x", xScale(lastDataPoint.date) + 2*lineOffsetMargin + lineOffset)
                .attr("y", yPosition)
                .style("fill", colorScale(index))
                .attr("class", "text-xs")
                .attr("alignment-baseline", "middle")
                .text(s.name);
        
    placedLabels.push(yPosition); // Store the position of this label
    });

    // Place label groups
    const labels = svg.selectAll(".series-label")
        .data(series)
        .enter().append("text")
        .attr("class", "series-label font-poppins text-xs")
        .attr("x", width + 10) // Some margin from the right end of the plot
        .attr("y", (d, i) => adjustedLabelPositions[i])
        .text(d => d.name); 

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

// Utility function to check if a y-position is overlapping with already placed labels
 function isOverlapping(yPosition, placedLabels, spacing) {
    for(let i = 0; i < placedLabels.length; i++) {
        if(Math.abs(yPosition - placedLabels[i]) < spacing) {
            return true;
        }
    }
    return false;
}

// Redo isOverlapping to try grouping method
//function isOverlapping(y1, y2) {
 //   const gap = 15; // Some arbitrary constant to define if labels are overlapping
  //  return Math.abs(y1 - y2) < gap;
//}
