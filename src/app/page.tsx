'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '@/hooks/useUserSession';
import { Button } from '@/components/ui/button';
import { CalendarHeart, NotebookPen } from 'lucide-react';

export default function HomePage() {
  const { session } = useUserSession(); // ✅ checks if user is logged in
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard'); // ✅ redirect logged-in users
    }
  }, [session, router]);

  return (
    <>
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-rose-50 via-pink-50 to-orange-100 px-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-rose-500 flex items-center justify-center gap-2">
          <NotebookPen size={40} /> Dear Diary
        </h1>

        <p className="text-gray-700 text-lg">
          Your safe space to write, reflect, and track your personal journey one day at a time. ✨
        </p>

        <div className="flex justify-center">
          <CalendarHeart size={80} className="text-rose-400 animate-pulse" />
        </div>

        <ul className="text-gray-600 text-sm text-left list-disc pl-6 space-y-1">
          <li>📅 Log daily thoughts and memories effortlessly.</li>
          <li>🔥 Track your writing streaks to stay motivated.</li>
          <li>🔍 Search past entries by date or keyword.</li>
        </ul>

        <Button
          onClick={() => router.push('/login')}
          className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-xl text-lg shadow"
        >
          Get Started / Login
        </Button>

        <p className="text-xs text-gray-400 mt-2">
          Your thoughts stay private. No distractions, just you and your diary.
        </p>
      </div>
      
    </main>
    </>
  );
}
