// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface DiaryEntry {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DiaryEntryInsert {
  content: string;
  image_url?: string;
}

// Diary service functions
export class DiaryService {
    // ---------- AUTH METHODS ADDED HERE ----------
  static async signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  }
  // Fetch all diary entries for the current user
  static async fetchUserDiaryEntries(): Promise<DiaryEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching diary entries:', error);
      throw error;
    }
  }

  // Create a new diary entry
  static async createDiaryEntry(entry: DiaryEntryInsert): Promise<DiaryEntry> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('diary_entries')
        .insert([
          {
            user_id: user.id,
            content: entry.content,
            image_url: entry.image_url,
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating diary entry:', error);
      throw error;
    }
  }

  // Update a diary entry
  static async updateDiaryEntry(id: string, updates: Partial<DiaryEntryInsert>): Promise<DiaryEntry> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('diary_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only update their own entries
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating diary entry:', error);
      throw error;
    }
  }

  // Delete a diary entry
  static async deleteDiaryEntry(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only delete their own entries

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting diary entry:', error);
      throw error;
    }
  }

  // Upload image to Supabase Storage
  static async uploadImage(file: File, userId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('diary-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('diary-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Delete image from Supabase Storage
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract path from URL
      const url = new URL(imageUrl);
      const path = url.pathname.split('/').slice(-2).join('/'); // Get last two parts

      const { error } = await supabase.storage
        .from('diary-images')
        .remove([path]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Sign out user
  static async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
}