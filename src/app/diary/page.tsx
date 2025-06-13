'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Heart, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
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

const DiaryPage: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('');
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  
  const router = useRouter();
  const touchStartRef = useRef<number>(0);
  const touchEndRef = useRef<number>(0);

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
        // Sort entries by date (newest first for easier navigation)
        const sortedEntries = userEntries.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setEntries(sortedEntries);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load diary entries');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserAndEntries();
  }, [router]);

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
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const formatDateShort = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const nextPage = () => {
    if (currentPage < entries.length - 1 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  const previousPage = () => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    
    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextPage();
    }
    if (isRightSwipe) {
      previousPage();
    }
  };

  const getUserDisplayName = (): string => {
    if (!user) return 'Friend';
    return user.user_metadata?.name || 
           user.user_metadata?.full_name || 
           user.email?.split('@')[0] || 
           'Friend';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-gray-600">Opening your diary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-amber-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              {getUserDisplayName()}'s Diary
            </h1>
          </div>
          
          <div className="text-sm text-gray-600 bg-white/80 px-4 py-2 rounded-full shadow-lg">
            {entries.length > 0 ? `Page ${currentPage + 1} of ${entries.length}` : 'No entries'}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {entries.length === 0 ? (
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-amber-400" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your diary is empty</h2>
              <p className="text-gray-600 mb-6">Start writing your first entry to see it here!</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-6 py-3 rounded-full font-medium hover:from-amber-500 hover:to-orange-500 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Write First Entry
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Diary Book Container */}
            <div className="relative flex items-center justify-center">
              {/* Navigation Buttons */}
              <button
                onClick={previousPage}
                disabled={currentPage === 0 || isFlipping}
                className={`absolute left-4 z-10 p-3 rounded-full shadow-lg transition-all duration-200 ${
                  currentPage === 0 || isFlipping
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl transform hover:scale-110'
                }`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextPage}
                disabled={currentPage === entries.length - 1 || isFlipping}
                className={`absolute right-4 z-10 p-3 rounded-full shadow-lg transition-all duration-200 ${
                  currentPage === entries.length - 1 || isFlipping
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl transform hover:scale-110'
                }`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Diary Book */}
              <div 
                className="relative perspective-1000"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className={`book-container ${isFlipping ? 'flipping' : ''}`}>
                  {/* Book Spine */}
                  <div className="absolute left-0 top-0 w-6 h-full bg-gradient-to-b from-amber-800 to-amber-900 rounded-l-lg shadow-lg z-20"></div>
                  
                  {/* Current Page */}
                  <div className="page bg-gradient-to-br from-cream-100 to-yellow-50 shadow-2xl border border-amber-200 rounded-r-lg">
                    <div className="page-content">
                      {/* Page Header */}
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-amber-200">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-amber-600" />
                          <h2 className="text-xl font-bold text-gray-800">
                            {formatDate(entries[currentPage].created_at)}
                          </h2>
                        </div>
                        <div className="text-sm text-gray-500 bg-amber-100 px-3 py-1 rounded-full">
                          {formatDateShort(entries[currentPage].created_at)}
                        </div>
                      </div>

                      {/* Entry Image */}
                      {entries[currentPage].image_url && (
                        <div className="mb-6">
                          <img 
                            src={entries[currentPage].image_url} 
                            alt="Entry" 
                            className="w-full h-64 object-cover rounded-lg shadow-md border border-amber-200"
                          />
                        </div>
                      )}

                      {/* Entry Content */}
                      <div className="diary-text">
                        <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap font-serif">
                          {entries[currentPage].content}
                        </p>
                      </div>

                      {/* Page Footer */}
                      <div className="absolute bottom-6 right-6 flex items-center space-x-2 text-amber-600">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm font-medium">Dear Diary</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {entries.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentPage
                      ? 'bg-amber-500 scale-125'
                      : 'bg-amber-200 hover:bg-amber-300'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }

        .book-container {
          position: relative;
          width: 700px;
          height: 500px;
          margin: 0 auto;
          transform-style: preserve-3d;
          transition: transform 0.3s ease-in-out;
        }

        .book-container.flipping {
          transform: rotateY(-5deg);
        }

        .page {
          position: absolute;
          width: 100%;
          height: 100%;
          padding: 40px;
          border-radius: 0 12px 12px 0;
          transform-origin: left center;
          transition: all 0.3s ease-in-out;
          overflow-y: auto;
          background: linear-gradient(135deg, #fffef7 0%, #fefce8 100%);
        }

        .page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.1) 0%,
            transparent 2%,
            transparent 98%,
            rgba(0, 0, 0, 0.05) 100%
          );
          pointer-events: none;
          border-radius: 0 12px 12px 0;
        }

        .page-content {
          position: relative;
          height: 100%;
          background: url("data:image/svg+xml,%3Csvg width='100' height='30' viewBox='0 0 100 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20h100' stroke='%23f4f4f5' stroke-width='1' opacity='0.3'/%3E%3C/svg%3E") repeat-y;
          background-position: 60px 0;
        }

        .diary-text {
          max-height: 240px;
          overflow-y: auto;
          padding-right: 10px;
        }

        .diary-text::-webkit-scrollbar {
          width: 4px;
        }

        .diary-text::-webkit-scrollbar-track {
          background: transparent;
        }

        .diary-text::-webkit-scrollbar-thumb {
          background: #d97706;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .book-container {
            width: 90vw;
            max-width: 500px;
            height: 600px;
          }
          
          .page {
            padding: 24px;
          }
          
          .diary-text {
            max-height: 320px;
          }
        }

        /* Vintage paper texture */
        .page::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.05) 0%, transparent 50%);
          pointer-events: none;
          border-radius: 0 12px 12px 0;
        }
      `}</style>
    </div>
  );
};

export default DiaryPage;