import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';


const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className={`flex-1 w-full ${!isHome ? 'pt-24' : ''}`}>
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
