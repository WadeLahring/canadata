import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import ChartHeader from '../headers/ChartHeader';
import ChartFooter from '../footer/ChartFooter';
import XAxis from '../axes/XAxis';
import YAxis from '../axes/YAxis';

interface LineChartProps {
    data: { date: Date; value: number }[];
    width: number;
    height: number;
    title: string;
    subtitle?: string;
    source: string;
    source_link: string;
    margin?: { top: number; right: number; bottom: number; left: number };
}

const LineChart: React.FC<LineChartProps> = ({
    data,
    width,
    height,
    title,
    subtitle,
    source,
    source_link,
    margin = { top: 30, right: 16, bottom: 30, left: 0 } 
}) => {
    // Set the detault state to be 0
    const [leftMargin, setLeftMargin] = useState(0);
    margin.left = leftMargin

    // Update the margin based on the child width (logic goes here())
    const handleLeftMarginChange = (childWidth: number) => {
        const newLeftMargin = childWidth;
        setLeftMargin(newLeftMargin);
    }

    // Set up the chart
    const ref = useRef<SVGSVGElement>(null);
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    useEffect(() => {
        drawChart();
    });

    // Set up scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date) as [Date, Date])
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) as number])
        .range([innerHeight, 0]);

    // Adjust left margin
    //const handleMaxLabelWidth = (maxLabelWidth: number) => {
    //    const newMargin = maxLabelWidth + 200;
    //    if (newMargin !== leftMargin) {
    //        setLeftMargin(newMargin);
    //    }
    //}; 

    // Draw the chart
    const drawChart = () => {
        const svg = d3.select(ref.current)
            .select(".line-chart-area");
            
        // Clear SVG before redrawing
        svg.selectAll("*").remove();

        // Define the line
        const line = d3.line<{ date: Date; value: number }>()
            .x(d => xScale(d.date))
            .y(d => yScale(d.value));

        // Draw and style the line
        const path =svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelBlue")
            .attr("stroke-width", 1.5)
            .attr("d", line)
            .attr("stroke-linejoin", "round");
        
            const totalLength = path.node()!.getTotalLength();
            path
                .attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(800) // Duration of the animation in milliseconds
                .ease(d3.easeLinear) // Apply linear easing
                .attr("stroke-dashoffset", 0);

    };
           
    return (
        <div>
            <ChartHeader title={title} subtitle={subtitle} />
            <svg ref={ref} width={width} height={height} >
                <g transform={`translate(${margin.left},${margin.top})`}>
                    <XAxis xScale={xScale} translate={`translate(0, ${innerHeight})`} />
                    <YAxis yScale={yScale} innerWidth={innerWidth} onWidthChange={handleLeftMarginChange} />
                    <g className="line-chart-area"></g>
                </g>
            </svg>
            <ChartFooter source={source} source_link={source_link} />
        </div>
    );
};

export default LineChart;