import React from 'react';
import { FaHome } from 'react-icons/fa';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-primary/10 text-primary0 text-white">
      <div className="flex items-center space-x-2">
        <FaHome className="text-2xl" />
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
