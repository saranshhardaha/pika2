import { Search, Upload, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onSearch: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const navigate = useNavigate();  // Move hook inside component
  
  const onLogout = async () => {   // Make this an inner function
    const { error } = await supabase.auth.signOut()
    navigate("/");
    console.log(error);
  }
  return (
    <header className="sticky top-0 z-30 bg-[#0a0a0a] border-b border-gray-800">
      <div className="max-w-[2000px] mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">Pika2</span>
          </Link> */}

          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search photos..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Mobile search bar */}
          <div className="md:hidden px-4 flex flex-1 items-center w-full">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search photos..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-gray-700 rounded-full text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-white"
            >
              <LogOut size={24} />
            </button>
        </div>
      </div>
    </header>
  );
}
