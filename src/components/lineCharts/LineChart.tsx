import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import ChartHeader from '../headers/ChartHeader';
import XAxis from '../axis/XAxis';
import YAxis from '../axis/YAxis';

interface LineChartProps {
    data: { date: Date; value: number }[];
    width: number;
    height: number;
    title: string;
    subtitle?: string;
    margin?: { top: number; right: number; bottom: number; left: number };
}

const LineChart: React.FC<LineChartProps> = ({
    data,
    width,
    height,
    title,
    subtitle,
    margin = { top: 30, right: 16, bottom: 30, left: 40 } 
}) => {
    
    // Set the left margin. Draws chart twice, first with default margin, then again with margin based on widest label
    const [leftMargin, setLeftMargin] = useState(margin.left);
    margin = { ...margin, left: leftMargin };
    
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
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelBlue")
            .attr("stroke-width", 1.5)
            .attr("d", line)
            .attr("stroke-linejoin", "round");
    };
           
    return (
        <div>
            <ChartHeader title={title} subtitle={subtitle} />
            <svg ref={ref} width={width} height={height} >
                <g transform={`translate(${margin.left},${margin.top})`}>
                    <XAxis xScale={xScale} translate={`translate(0, ${innerHeight})`} />
                    <YAxis yScale={yScale} innerWidth={innerWidth} setLeftMargin={setLeftMargin} />
                    <g className="line-chart-area"></g>
                </g>
            </svg>
        </div>
    );
};

export default LineChart;