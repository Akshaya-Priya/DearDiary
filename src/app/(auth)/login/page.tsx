// // 'use client';

// // import { useState } from 'react';
// // import { useRouter } from 'next/navigation';
// // import supabase from '@/lib/supabaseClient';
// // import { Loader2 } from 'lucide-react';

// // export default function Login() {
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const router = useRouter();

// //   const handleLogin = async (e: React.FormEvent) => {
// //     e.preventDefault();

// //     const { error } = await supabase.auth.signInWithPassword({
// //       email,
// //       password,
// //     });

// //     if (error) {
// //       alert(error.message);
// //     } else {
// //       alert('Login successful!');
// //       router.push('/dashboard');
// //     }
// //   };

// //   return (
// //     <div className="flex flex-col items-center justify-center min-h-screen p-4">
// //       <h1 className="text-2xl font-bold mb-4">Login</h1>
// //       <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
// //         <input
// //           type="email"
// //           placeholder="Email"
// //           className="w-full border rounded px-4 py-2"
// //           onChange={(e) => setEmail(e.target.value)}
// //         />
// //         <input
// //           type="password"
// //           placeholder="Password"
// //           className="w-full border rounded px-4 py-2"
// //           onChange={(e) => setPassword(e.target.value)}
// //         />
// //         <button
// //           type="submit"
// //           className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
// //         >
// //           Log In
// //         </button>
// //       </form>
// //     </div>
// //   );
// // }

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiaryService } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await DiaryService.signIn(email, password);
    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 px-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-rose-500 mb-6">Welcome Back to Dear Dairy 💖</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 rounded-lg text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 transition-all duration-200"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Login
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          New here? <a href="/signup" className="text-pink-500 hover:underline">Create an account</a>
        </p>
      </div>
    </div>
  );
}
