import React from 'react';

interface ChartFooterProps {
    source: string;
    source_link: string;
}

const ChartFooter: React.FC<ChartFooterProps> = ({ source, source_link }) => {
    return (
        <div className="chart-footer pb-4 pt-2 px-4 font-poppins text-slate-600 text-xs">
            <p className="font-medium inline">Source: </p>
            <p className="inline"> {source} </p>
            <a className="underline inline" href={source_link} target="_blank"> Learn more.</a>
        </div>
    );
};

export default ChartFooter;