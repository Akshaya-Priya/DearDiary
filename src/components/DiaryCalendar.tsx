import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Props {
  streakDays: string[];
  currentStreak: number;
  maxStreak: number;
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
  disableFutureDates?: boolean; 
}

export default function DiaryCalendar({
  streakDays,
  currentStreak,
  maxStreak,
  onSelectDate,
  selectedDate,
  disableFutureDates = true,
}: Props) {
  const today = new Date();
  function isActiveDay(date: Date) {
    const d = date.toISOString().slice(0,10);
    return streakDays.includes(d);
  }
  return (
    <div className="rounded-2xl bg-white/80 shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-md font-semibold text-rose-500">
          Diary Streak
        </span>
        <span className="flex items-center gap-2 text-gray-500 text-sm">
          <span>
            <span className="text-rose-500 font-bold">{currentStreak}</span> streak
          </span>
          <span className="mx-1">/</span>
          <span>
            <span className="text-rose-400 font-bold">{maxStreak}</span> max
          </span>
        </span>
      </div>
      <div className="flex justify-center items-center h-[300px] w-full">
      <Calendar
        mode="single"
        selected={selectedDate ? new Date(selectedDate) : undefined}
        onSelect={date => {
          if (date) {
            const localDateStr = date.toLocaleDateString('sv-SE'); // 'YYYY-MM-DD'
            onSelectDate(localDateStr);
          }
        }}
        modifiers={{
          marked: (date) => isActiveDay(date),
        }}
        modifiersClassNames={{
          marked: "bg-rose-300 text-white",
        }}
        disabled={disableFutureDates ? (date) => date > today : undefined}
        className={cn("p-3 pointer-events-auto")}
      />
      </div>
      <div className="text-xs text-gray-500 mt-2 text-center">
        Click a marked day to view your diary entries!
      </div>
    </div>
  );
}
