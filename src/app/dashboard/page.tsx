// export default DearDairyDashboard;

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Heart, Moon, Sun, Calendar, Camera, Save, X, LogOut, Loader2 } from 'lucide-react';
import { DiaryService, DiaryEntry } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
  };
}

const DearDairyDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [newEntry, setNewEntry] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingEntries, setIsLoadingEntries] = useState<boolean>(true);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch user and diary entries on component mount
  useEffect(() => {
    const loadUserAndEntries = async () => {
      try {
        const currentUser = await DiaryService.getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        
        setUser(currentUser);
        
        const userEntries = await DiaryService.fetchUserDiaryEntries();
        setEntries(userEntries);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load diary entries');
      } finally {
        setIsLoadingEntries(false);
      }
    };

    loadUserAndEntries();
  }, [router]);

  // Get display name for user
  const getUserDisplayName = (): string => {
    if (!user) return 'Friend';
    return user.user_metadata?.name || 
           user.user_metadata?.full_name || 
           user.email?.split('@')[0] || 
           'Friend';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const removeImage = (): void => {
    setSelectedImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveEntry = async (): Promise<void> => {
    if (!newEntry.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      let imageUrl: string | undefined;
      
      // Upload image if selected
      if (selectedImage && user) {
        imageUrl = await DiaryService.uploadImage(selectedImage, user.id);
      }
      
      // Create diary entry
      const entry = await DiaryService.createDiaryEntry({
        content: newEntry.trim(),
        image_url: imageUrl,
      });
      
      // Add to local state
      setEntries([entry, ...entries]);
      
      // Reset form
      setNewEntry('');
      removeImage();
      
    } catch (error) {
      console.error('Error saving entry:', error);
      setError('Failed to save diary entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await DiaryService.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to logout. Please try again.');
    }
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Show loading screen while fetching initial data
  if (isLoadingEntries) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <p className="text-gray-600">Loading your memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50'
    }`}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Dear Dairy
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-all duration-200 ${
                darkMode 
                  ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={handleLogout}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                darkMode 
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm hover:text-gray-800'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Welcome Message */}
        <div className={`mb-8 p-6 rounded-2xl ${
          darkMode 
            ? 'bg-slate-800/50 border border-slate-700' 
            : 'bg-white/70 backdrop-blur-sm shadow-lg border border-white/20'
        }`}>
          <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {getGreeting()}, {getUserDisplayName()}! 💕
          </h2>
          <p className={`${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
            What's on your mind today? Share your thoughts, memories, and moments.
          </p>
        </div>

        {/* New Entry Form */}
        <div className={`mb-8 p-6 rounded-2xl ${
          darkMode 
            ? 'bg-slate-800/50 border border-slate-700' 
            : 'bg-white/70 backdrop-blur-sm shadow-lg border border-white/20'
        }`}>
          <div className="space-y-4">
            <textarea
              value={newEntry}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewEntry(e.target.value)}
              placeholder="Dear diary, today I..."
              className={`w-full p-4 rounded-xl border-0 resize-none focus:ring-2 focus:ring-pink-400 focus:outline-none transition-all duration-200 min-h-[120px] ${
                darkMode 
                  ? 'bg-slate-700 text-white placeholder-slate-400' 
                  : 'bg-white/50 text-gray-800 placeholder-gray-500'
              }`}
            />
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    darkMode 
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Camera className="w-5 h-5" />
                </button>
                
                <div className={`flex items-center space-x-2 text-sm ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  <Calendar className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
              
              <button
                onClick={handleSaveEntry}
                disabled={!newEntry.trim() || isLoading}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  (!newEntry.trim() || isLoading)
                    ? (darkMode ? 'bg-slate-700 text-slate-500' : 'bg-gray-200 text-gray-400')
                    : 'bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:from-pink-500 hover:to-rose-500 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Saving...' : 'Save Entry'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Memory Wall */}
        <div className="mb-6">
          <h3 className={`text-lg font-semibold mb-6 flex items-center space-x-2 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <span>Your Memory Wall</span>
            <Heart className="w-5 h-5 text-pink-400" />
          </h3>
          
          {entries.length === 0 ? (
            <div className={`text-center py-12 ${
              darkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>
              <Heart className="w-12 h-12 mx-auto mb-4 text-pink-300" />
              <p className="text-lg mb-2">No memories yet</p>
              <p>Start writing your first diary entry above!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              {entries.map((entry: DiaryEntry, index: number) => (
                <div
                  key={entry.id}
                  className={`p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                    darkMode 
                      ? 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800/70' 
                      : 'bg-white/70 backdrop-blur-sm shadow-lg border border-white/20 hover:bg-white/80'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`text-sm font-medium ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>
                      {formatDate(entry.created_at)}
                    </div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  </div>
                  
                  {entry.image_url && (
                    <img 
                      src={entry.image_url} 
                      alt="Entry" 
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  <p className={`leading-relaxed ${
                    darkMode ? 'text-slate-200' : 'text-gray-700'
                  }`}>
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default DearDairyDashboard;