'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiaryService } from '@/lib/supabase';
import { Loader2 , X} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    const { error } = await DiaryService.signUp(email, password, username);
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // router.push('/login');
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.push('/login'); // navigate to login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 px-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-rose-500 mb-6">Create Your DearDiary 💖 Account</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-gray-600 text-gray-600"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-gray-600 text-gray-600"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-gray-600 text-gray-600"
          />

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 rounded-lg text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 transition-all duration-200"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign Up
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account? <a href="/login" className="text-pink-500 hover:underline">Log in</a>
        </p>
      </div>

      {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-semibold text-rose-600 mb-2">Confirm Your Email</h3>
              <p className="text-sm text-gray-700">
                A confirmation link has been sent to <strong>{email}</strong>. Please check your inbox and confirm your email before logging in.
              </p>

              <button
                onClick={handleCloseModal}
                className="mt-6 w-full py-2 rounded-md bg-rose-500 text-white hover:bg-rose-600 transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
