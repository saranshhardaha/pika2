import React from 'react';
import { Search, Upload, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onSearch: (query: string) => void;
  onUpload: () => void;
  onLogout: () => void;
}

export default function Header({ onSearch, onUpload, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-gray-800">
      <div className="max-w-[2000px] mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">PhotoShare</span>
          </Link>

          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search photos..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile search button */}
            <button className="md:hidden p-2 text-gray-400 hover:text-white">
              <Search size={24} />
            </button>

            <button
              onClick={onUpload}
              className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
            >
              <Upload size={20} className="mr-2" />
              Upload
            </button>

            {/* Mobile upload button */}
            <button
              onClick={onUpload}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              <Upload size={24} />
            </button>

            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-white"
            >
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search photos..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
}