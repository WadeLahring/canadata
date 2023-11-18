import React from 'react';
import logo from './header-logo.svg';

interface ChartHeaderProps {
    title: string;
    subtitle?: string;
}

const ChartHeader: React.FC<ChartHeaderProps> = ({ title, subtitle }) => {
    return (
        <div className="chart-header flex justify-between pt-4 px-4 font-poppins text-slate-600">
            <div>
                <h2 className="text-2xl">{title}</h2>
                {subtitle && <p className="text-xs">{subtitle}</p>}
            </div>
            <img src={logo} alt="Logo" className="chart-logo h-6 object-top" />
        </div>
    );
};

export default ChartHeader;