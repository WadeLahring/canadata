import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import ChartHeader from '../headers/ChartHeader';
import ChartFooter from '../footer/ChartFooter';
import XAxis from '../axes/XAxis';
import YAxis from '../axes/YAxis';

interface LineChartProps {
    data: { series: string; date: Date; value: number }[];
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
    margin = { top: 30, right: 80, bottom: 30, left: 0 } 
}) => {
    // Set the detault margin to be 0.
    const [leftMargin, setLeftMargin] = useState(0);
    margin.left = leftMargin

    // Update the margin based on width of the widest label
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
        const path = svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelBlue")
            .attr("stroke-width", 1.5)
            .attr("d", line)
            .attr("stroke-linejoin", "round");
        
        // Animate in the appearance of the line
        const totalLength = path.node()!.getTotalLength();
        path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(800)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

        // Set up the labels
        const lastDataPoint = data[data.length - 1];
        svg.append("text")
            .attr("x", xScale(lastDataPoint.date) + 10) // 10 is arbitrary offset
            .attr("y", yScale(lastDataPoint.value))
            .style("fill", "steelBlue")
            .attr("alignment-baseline", "middle")
            .attr("class", "font-poppins text-xs")
            .text(lastDataPoint.series);
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