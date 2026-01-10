import React from 'react';
import Navbar from './Navbar';


const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 w-full">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
