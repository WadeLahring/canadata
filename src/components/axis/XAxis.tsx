import React, { useRef, useEffect} from 'react';
import * as d3 from 'd3';

interface XAxisProps {
    xScale: d3.ScaleTime<number, number>;
    translate?: string;
}

const XAxis: React.FC<XAxisProps> = ({ xScale, translate }) => {
    const xAxisRef = useRef<SVGGElement>(null);

    useEffect(() => {
        // Clear anything that exists previously
        d3.select(xAxisRef.current).selectAll("*").remove();

        // Generate the xAxis
        const xAxis = d3.axisBottom(xScale);
        d3.select(xAxisRef.current).call(xAxis as any);

        // Start-align the first tick mark label on bottom axis
        d3.select(xAxisRef.current).select(".tick:first-of-type text")
                .attr("text-anchor", "start");
        
        // End-align the last tick mark label on bottom axis
        d3.select(xAxisRef.current).select(".tick:last-of-type text")
                .attr("text-anchor", "end");

        // Style the labels
        d3.select(xAxisRef.current).selectAll('.tick text')
            .attr("class", "font-poppins text-slate-600 text-xs");

        // Style the axis lines
        d3.select(xAxisRef.current).selectAll('.domain')
            .attr("class", "stroke-slate-600");
    }, [xScale]);

    return <g ref={xAxisRef} transform={translate} />;
};

export default XAxis;