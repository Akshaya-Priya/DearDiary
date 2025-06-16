'use client';

import * as React from "react";
import { useState, useEffect } from "react";
import DiaryList from "@/components/DiaryList";
import DiaryEditor from "@/components/DiaryEditor";
import DiaryCalendar from "@/components/DiaryCalendar";
import SearchBar from "@/components/SearchBar";
import {
  getAllEntries,
  addEntry,
  updateEntry,
  deleteEntry,
  findEntriesByKeyword,
  findEntriesByDate,
  getStreakInfo,
} from "@/lib/diaryService";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useUserSession } from "@/hooks/useUserSession";
import { DiaryService } from '@/lib/supabase';

export default function DashboardPage() {
  const { session } = useUserSession();
  
// Define the shape of your diary entry
type DiaryEntry = {
  id: number;
  title: string;
  content: string;
  date: string;
  image?: string | null;
  user_id: string;
};

// Set your state properly typed
const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [search, setSearch] = useState("");
  const [calendarFilter, setCalendarFilter] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"add" | "edit">("add");
  const [entryEdit, setEntryEdit] = useState<any>(null);
  const [entryView, setEntryView] = useState<any>(null);
  const [username, setUsername] = useState<string>("");
  const [streakInfo, setStreakInfo] = useState<{
    currentStreak: number;
    maxStreak: number;
    days: string[];
  } | null>(null);

  async function loadEntries() {
    let data = [];
    if (calendarFilter) data = await findEntriesByDate(calendarFilter);
    else if (search) data = await findEntriesByKeyword(search);
    else data = await getAllEntries();
    setEntries(data);
  }

  useEffect(() => {
    if (session?.user) {
      const name = session.user.user_metadata?.display_name || session.user.email;
      setUsername(name);
    }
    loadEntries();
  }, [session, calendarFilter, search]);

  
  useEffect(() => {
    async function fetchStreak() {
      try {
        const info = await getStreakInfo(); // call backend function
        setStreakInfo(info); // update local state
      } catch 
      (error) {
        console.error("Failed to fetch streak info", error);
      }
    }

    fetchStreak();
  }, []);
  function handleAdd() {
    setEditorMode("add");
    setEntryEdit(null);
    setEditorOpen(true);
  }

  async function handleSave(entry: any) {
    if (editorMode === "add") {
      await addEntry(entry);
      toast({ title: "Diary entry added!" });
    } else {
      await updateEntry(entry.id, entry);
      toast({ title: "Entry updated!" });
    }
    setEditorOpen(false);
    setEditorMode("add");
    setEntryEdit(null);
    setCalendarFilter(null);
    setSearch("");
    setTimeout(loadEntries, 50);
  }

  function handleEdit(entry: any) {
    setEditorMode("edit");
    setEntryEdit(entry);
    setEditorOpen(true);
  }

  async function handleDelete(id: number) {
    await deleteEntry(id);
    toast({ title: "Deleted entry" });
    setTimeout(loadEntries, 40);
  }

  function handleCalendarSelect(date: string) {
    setCalendarFilter(date);
    setSearch("");
  }

  function handleEntryOpen(entry: any) {
    setEntryView(entry);
  }

  async function handleLogout() {
    await DiaryService.signOut();
    window.location.href = "/auth/login";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
      <nav className="bg-white/70 backdrop-blur-md shadow px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-rose-500">Dear Diary 📔</div>
        <div className="flex gap-4 items-center">
          <span className="text-gray-600 font-medium">Hi, {username}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-rose-300 hover:bg-rose-500 text-white px-3 py-1 rounded-xl shadow"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row gap-8 px-2 md:px-8 py-8 max-w-7xl mx-auto">

        {/* MAIN */}
        <div className="flex-1">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 bg-rose-400 hover:bg-rose-500 text-white px-4 py-2 rounded-xl transition shadow"
            >
              <Plus /> New Entry
            </button>
          </div>
          <DiaryList
            entries={entries}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpen={handleEntryOpen}
          />
        </div>
      </div>

      <DiaryEditor
        open={editorOpen}
        mode={editorMode}
        entry={entryEdit}
        onSave={handleSave}
        onClose={() => setEditorOpen(false)}
      />
    </div>
  );
}
