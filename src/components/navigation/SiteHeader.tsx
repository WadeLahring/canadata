import React from 'react';

interface HeaderProps {
    title: string;
}

const SiteHeader: React.FC<HeaderProps> = ({ title }) => {
    return (
        <header className="app-header bg-white shadow-md py-4">
            <div className="container mx-auto text-center">
                <h1 className="text-2xl font-poppins text-slate-600">{title}</h1>
            </div>
        </header>
    );
}

export default SiteHeader;