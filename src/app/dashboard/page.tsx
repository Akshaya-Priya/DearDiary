'use client';
import { useUserSession } from '@/hooks/useUserSession';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase, DiaryService } from '@/lib/supabase';

export default function DashboardPage() {
  const { session, loading } = useUserSession();
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.push('/login');
    }

    const fetchUser = async () => {
      //const { data, error} = await DiaryService.getUser();
      await supabase.auth.refreshSession(); // force update
      const { data, error } = await supabase.auth.getUser();
      const name = data?.user?.user_metadata?.display_name ?? 'User';
      console.log('Fetched name:', name);
      setUsername(name);
    };

    if (session) fetchUser();
  }, [session, loading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="text-center py-20 text-pink-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
      <nav className="bg-white/70 backdrop-blur-md shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-rose-500">Dear Diary 📔</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-medium">Hi, {username}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-400 hover:bg-rose-500 text-white rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="p-6 text-center">
        <h2 className="text-2xl font-bold text-rose-600 mb-4">Welcome to your Dashboard 💌</h2>
        <p className="text-gray-600">This is your safe space to write, reflect, and download your thoughts.</p>
      </main>
    </div>
  );
}
