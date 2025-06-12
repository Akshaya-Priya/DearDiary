'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

interface Entry {
  id: string;
  content: string;
  image_url: string;
  created_at: string;
}

export default function Dashboard() {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndEntries = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
        return;
      }

      setName(user.user_metadata?.full_name || 'User');

      const { data, error: entryError } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!entryError) {
        setEntries(data);
      }
    };

    fetchUserAndEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let image_url = '';
    if (image) {
      const fileName = `${uuidv4()}.${image.name.split('.').pop()}`;
      const { data, error } = await supabase.storage
        .from('diary-images')
        .upload(`${user.id}/${fileName}`, image);

      if (!error && data) {
        const { data: publicUrl } = supabase.storage
          .from('diary-images')
          .getPublicUrl(`${user.id}/${fileName}`);
        image_url = publicUrl.publicUrl;
      }
    }

    const { error: insertError } = await supabase.from('diary_entries').insert([
      {
        user_id: user.id,
        content,
        image_url,
      },
    ]);

    if (!insertError) {
      setContent('');
      setImage(null);
      // Re-fetch entries
      const { data } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setEntries(data || []);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 to-pink-200 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Hi {name}, write today's memory 💬</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto space-y-4"
      >
        <textarea
          placeholder="Write your thoughts here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-orange-100 file:text-orange-700
              hover:file:bg-orange-200"
        />
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full text-lg font-semibold"
        >
          Save Entry
        </button>
      </form>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            {entry.image_url && (
              <img
                src={entry.image_url}
                alt="Diary"
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <p className="text-gray-800 whitespace-pre-line">{entry.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(entry.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
