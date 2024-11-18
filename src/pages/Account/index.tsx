import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import SubscriptionPlans from '../../components/SubscriptionPlans';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserProfile {
  username: string;
  avatar_url: string;
  subscription_tier: string;
  storage_used: number;
}

export default function Account() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-neutral-800 rounded-lg overflow-hidden shadow">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-neutral-700 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div className="ml-4">
              <h2 className="text-xl font-bold text-white">
                {profile?.username || 'Anonymous User'}
              </h2>
              <p className="text-sm text-gray-400">
                {profile?.subscription_tier || 'Free'} Plan
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-neutral-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-blue-500 h-full"
                style={{
                  width: `${(profile?.storage_used || 0) / 10737418240 * 100}%`,
                }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-400">
              {((profile?.storage_used || 0) / 1073741824).toFixed(2)} GB of{' '}
              {profile?.subscription_tier === 'free' ? '10' : 
               profile?.subscription_tier === 'pro' ? '25' : '100'} GB used
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-white mb-4">Subscription Plans</h3>
        <SubscriptionPlans currentTier={profile?.subscription_tier} />
      </div>
    </div>
  );
}