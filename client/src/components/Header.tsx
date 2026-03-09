import React from 'react';
import { Home } from '@mui/icons-material';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-blue-600 text-white">
      <div className="flex items-center space-x-2">
        <Home fontSize="large" />
        <h1 className="text-xl font-semibold">HostelMng</h1>
      </div>
      <nav>
        <a href="#" className="px-2 hover:underline">
          Home
        </a>
        <a href="#" className="px-2 hover:underline">
          About
        </a>
      </nav>
    </header>
  );
};

export default Header;
