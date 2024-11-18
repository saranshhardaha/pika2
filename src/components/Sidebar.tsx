import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, FolderOpen, Image, UserCircle, 
  ChevronLeft, ChevronRight, Share2, Database
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { session } = useAuth();
  const [storageUsed, setStorageUsed] = useState(0);
  const [totalStorage, setTotalStorage] = useState(10); // GB

  React.useEffect(() => {
    if (session) {
      fetchStorageUsage();
    }
  }, [session]);

  const fetchStorageUsage = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('storage_used, subscription_tier')
      .eq('id', session.user.id)
      .single();

    if (data) {
      setStorageUsed(data.storage_used / 1024 / 1024 / 1024); // Convert to GB
      setTotalStorage(
        data.subscription_tier === 'free' ? 10 :
        data.subscription_tier === 'pro' ? 25 : 100
      );
    }
  };

  const navigation = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Albums', to: '/albums', icon: FolderOpen },
    { name: 'Photos', to: '/photos', icon: Image },
    { name: 'Shared', to: '/shared', icon: Share2 },
    { name: 'Account', to: '/account', icon: UserCircle },
  ];

  return (
    <div 
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col flex-grow bg-black border-r border-gray-800">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          {!isCollapsed && (
            <span className="text-xl font-bold text-white">Pika2</span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-gray-400 hover:text-white"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-2 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-neutral-900 text-white"
                    : "text-gray-400 hover:bg-neutral-900 hover:text-white",
                  isCollapsed ? "justify-center" : "justify-start"
                )
              }
            >
              <item.icon className="w-6 h-6" />
              {!isCollapsed && <span className="ml-3">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center mb-2">
            <Database className="w-5 h-5 text-gray-400" />
            {!isCollapsed && (
              <span className="ml-2 text-sm text-gray-400">Storage</span>
            )}
          </div>
          <div className="w-full bg-neutral-900 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${(storageUsed / totalStorage) * 100}%` }}
            />
          </div>
          {!isCollapsed && (
            <p className="mt-2 text-xs text-gray-400">
              {storageUsed.toFixed(1)} GB of {totalStorage} GB used
            </p>
          )}
        </div>
      </div>
    </div>
  );
}