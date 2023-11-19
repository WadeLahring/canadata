import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface YAxisProps {
    yScale: d3.ScaleLinear<number, number>;
    innerWidth: number;
    onWidthChange: (value: number) => void;
}

const YAxis: React.FC<YAxisProps> = ({ yScale, innerWidth, onWidthChange }) => {
    const yAxisRef = useRef<SVGGElement>(null);

    useEffect(() => {
        // Generate the yAxis
        const yAxis = d3.axisLeft(yScale);
        d3.select(yAxisRef.current).call(yAxis as any);

        // Measure the width of the widest label
        let widestLabel = 0;
        d3.select(yAxisRef.current).selectAll('.tick text').each(function () {
            const textElement = this as SVGGraphicsElement;
            if (this) {
                const labelWidth = textElement.getBBox().width;
                if (labelWidth > widestLabel) widestLabel = labelWidth;
            ;}
        })

        // Set the margin based on the width of the widest label
        onWidthChange(widestLabel + 25); // 25 is an arbitraty valeuw that seems to give about the right amount of padding.

        // Remove the domain line
        d3.select(yAxisRef.current).select('.domain').remove();

        // Extend the tick lines and style them
        d3.select(yAxisRef.current).selectAll('.tick line')
            .attr('x2', innerWidth)
            .attr('class', 'stroke-slate-200 stroke-width-2')
            .attr('stroke-dasharray', '4,4');

        // Remove the first tick-line to prevent overlap with X-axis
        d3.select(yAxisRef.current).select('.tick:first-of-type line').remove();

        // Style the labels
        d3.select(yAxisRef.current).selectAll('.tick text')
            .attr("class", "font-poppins text-slate-600 text-xs");

    }, [yScale, innerWidth, onWidthChange]);

    return <g ref={yAxisRef} />;
};

export default YAxis;