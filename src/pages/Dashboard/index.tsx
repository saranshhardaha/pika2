import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderOpen, Star, Image, Users, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, isToday, isYesterday } from 'date-fns';
import ImageStoryViewer from '../../components/ImageStoryViewer';

interface DashboardStat {
  name: string;
  value: number;
  icon: any;
  path: string;
}

interface RecentImage {
  id: string;
  url: string;
  created_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [recentImages, setRecentImages] = useState<RecentImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const [
      { count: albumCount },
      { count: starredCount },
      { count: photoCount },
      { count: sharedCount }
    ] = await Promise.all([
      supabase.from('albums').select('*', { count: 'exact' }).eq('user_id', session.user.id),
      supabase.from('images').select('*', { count: 'exact' }).eq('is_starred', true),
      supabase.from('images').select('*', { count: 'exact' }),
      supabase.from('album_shares').select('*', { count: 'exact' })
    ]);

    setStats([
      { name: 'Albums', value: albumCount || 0, icon: FolderOpen, path: '/albums' },
      { name: 'Starred', value: starredCount || 0, icon: Star, path: '/photos?filter=starred' },
      { name: 'Photos', value: photoCount || 0, icon: Image, path: '/photos' },
      { name: 'Shared With', value: sharedCount || 0, icon: Users, path: '/shared' }
    ]); 
    
    const { data } = await supabase
    .from('images')
    .select('*')
    .order('created_at', { ascending: false })
    .eq('user_id', session.user.id)
    .limit(10);

  setRecentImages(data || []);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM d, yyyy');
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            onClick={() => navigate(stat.path)}
            className="relative bg-neutral-900 p-2 sm:p-6 rounded-lg overflow-hidden cursor-pointer transform transition-all hover:opacity-80"
          >
            <dt>
              <div className="absolute bg-blue-500 rounded-md p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-400 truncate">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
            </dd>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Recent Activity
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recentImages.map((image, index) => (
            <div
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
              className="aspect-square rounded-lg overflow-hidden cursor-pointer relative group"
            >
              <img
                src={image.url}
                alt=""
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-2 left-2 text-white text-sm">
                  {formatDate(image.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedImageIndex !== null && (
        <ImageStoryViewer
          images={recentImages}
          currentIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </div>
  );
}