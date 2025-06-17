'use client';

import * as React from "react";
import { useState, useEffect } from "react";
import DiaryList from "@/components/DiaryList";
import DiaryEditor from "@/components/DiaryEditor";
import DiaryCalendar from "@/components/DiaryCalendar";
import SearchBar from "@/components/SearchBar";
import Link from 'next/link';
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
import { Calendar as CalendarIcon, Plus } from "lucide-react"
import { useUserSession } from "@/hooks/useUserSession";
import { DiaryService } from '@/lib/supabase';
import { NotebookPen } from 'lucide-react';

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
  const [showCalendar, setShowCalendar] = useState(false);
  
  async function loadEntries() {
    let data = [];
    if (calendarFilter) data = await findEntriesByDate(calendarFilter);
    else if (search) data = await findEntriesByKeyword(search);
    else data = await getAllEntries();
    setEntries(data);

    const info = await getStreakInfo();
    setStreakInfo(info);
  }

  useEffect(() => {
    if (session?.user) {
      const name = session.user.user_metadata?.display_name || session.user.email;
      setUsername(name);
    }
    loadEntries();
  }, [session, calendarFilter, search]);

  function handleAdd() {
    setEditorMode("add");
    setEntryEdit(null);
    setEditorOpen(true);
  }
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateMedia = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    updateMedia(); // Initial check
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, []);


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
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
      <nav className="bg-white/70 backdrop-blur-md shadow px-6 py-4 flex justify-between items-center">
        <div className=" flex items-center gap-4 text-xl font-bold text-rose-500"> <NotebookPen size={25} />Dear Diary </div>
        <div className="flex gap-4 items-center">
          <span className="text-gray-600 font-medium">Hi, {username}</span>
          <Link href="/diary">
            <button className="text-sm px-4 py-2 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl transition-all shadow">
              Diary
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm bg-rose-300 hover:bg-rose-500 text-white px-3 py-1 rounded-xl shadow"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row gap-8 px-2 md:px-8 py-8 max-w-7xl mx-auto">
        {/* SIDEBAR */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-7">
          <SearchBar value={search} onChange={v => { setSearch(v); setCalendarFilter(null); }} />

          {/* Show calendar only on desktop or if toggled on mobile */}
          {(showCalendar || isDesktop) && (
            <DiaryCalendar
              streakDays={streakInfo?.days || []}
              currentStreak={streakInfo?.currentStreak || 0}
              maxStreak={streakInfo?.maxStreak || 0}
              onSelectDate={handleCalendarSelect}
              selectedDate={calendarFilter}
              disableFutureDates
            />
          )}

          {calendarFilter && (
            <button
              className="text-xs text-rose-400 mt-2 underline"
              onClick={() => setCalendarFilter(null)}
            >
              Show all entries
            </button>
          )}
        </div>


        {/* MAIN */}
        <div className="flex-1">
          <div className="flex justify-between mb-4">
          {/* Show calendar toggle on small screens */}
          <button
            onClick={() => setShowCalendar(prev => !prev)}
            className="md:hidden flex items-center gap-1 bg-rose-100 hover:bg-rose-200 text-rose-500 px-3 py-1 rounded-xl transition shadow"
          >
            <CalendarIcon size={18} />
            {showCalendar ? "Hide Calendar" : "Show Calendar"}
          </button>

          {/* New Entry button */}
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
