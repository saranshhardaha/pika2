import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Lock, Users, Calendar, FolderOpen } from "lucide-react";
import { supabase } from "../lib/supabase";
import CreateAlbumModal from "../components/CreateAlbumModal";
import toast from "react-hot-toast";

interface Album {
  id: string;
  name: string;
  description: string;
  cover_url: string;
  is_locked: boolean;
  lock_date: string | null;
  created_at: string;
  user_id: string;
}

export default function Albums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq('user_id', session.user.id)
        // .or(
        //   `user_id.eq.${session.user.id},shared_users.cs.{${session.user.id}}`
        // )
        .order("created_at", { ascending: false });
      console.log(error);
      if (error) throw error;
      console.log(data);

      setAlbums(data || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Albums</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Album
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {albums.map((album) => (
          <Link
            key={album.id}
            to={`/albums/${album.id}`}
            className="group relative bg-neutral-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
          >
            <div className="aspect-square">
              {album.cover_url ? (
                <img
                  src={album.cover_url}
                  alt={album.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-700 flex items-center justify-center">
                  <FolderOpen className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-medium text-white truncate">
                {album.name}
              </h3>
              <p className="mt-1 text-sm text-gray-400 truncate">
                {album.description}
              </p>
              <div className="mt-4 flex items-center space-x-4 text-gray-400">
                {album.is_locked && (
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-1" />
                    <span className="text-xs">Locked</span>
                  </div>
                )}
                {album.lock_date && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-xs">
                      Locks on {new Date(album.lock_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-xs">Shared</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <CreateAlbumModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={fetchAlbums}
      />
    </div>
  );
}
