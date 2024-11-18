import React, { useState } from 'react';
import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface CreateAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateAlbumModal({ isOpen, onClose, onCreated }: CreateAlbumModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lockDate, setLockDate] = useState<Date | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { error } = await supabase
        .from('albums')
        .insert({
          name,
          description,
          user_id: session.user.id,
          lock_date: lockDate?.toISOString(),
          is_locked: false,
          shared_users: []
        });

      if (error) throw error;

      toast.success('Album created successfully');
      onCreated();
      onClose();
      setName('');
      setDescription('');
      setLockDate(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
        
        <div className="relative inline-block w-full max-w-md p-6 my-8 text-left bg-neutral-900 rounded-lg shadow-xl transform transition-all sm:w-full">
          <div className="absolute top-4 right-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
              <X size={24} />
            </button>
          </div>

          <h3 className="text-lg font-medium text-white mb-4">Create New Album</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Album Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md bg-neutral-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md bg-neutral-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Lock Date (Optional)
              </label>
              <DatePicker
                selected={lockDate}
                onChange={(date) => setLockDate(date)}
                minDate={new Date()}
                className="mt-1 block w-full rounded-md bg-neutral-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholderText="Select a date"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
              >
                Create Album
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}