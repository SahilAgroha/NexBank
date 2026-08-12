import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import NotificationDropdown from './NotificationDropdown';

const Header = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center">
        {/* Mobile menu button could go here */}
      </div>
      
      <div className="flex items-center space-x-4">
        <NotificationDropdown />
        <h2 className="text-sm font-semibold text-gray-800 hidden md:block">
          Welcome, {user?.fullName}
        </h2>
        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-200 shadow-sm cursor-pointer hover:bg-blue-200 transition">
          {user?.fullName?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Header;
