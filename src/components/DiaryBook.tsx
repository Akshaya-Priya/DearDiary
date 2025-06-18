import { useState, useRef } from "react";
import DiaryPage from "./DiaryPage";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { DiaryEntry } from '../types/diary'

// Load page-turn sound (small mp3 in public or external)
const PAGE_TURN_URL = "pageflip_01-81244.mp3";

interface Props {
  entries: DiaryEntry[];
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (id: number) => void;
}

export default function DiaryBook({ entries, onEdit, onDelete }: Props) {
  const [page, setPage] = useState(0);
  const [pageTurning, setPageTurning] = useState<"left" | "right" | null>(null);
  const [prevPage, setPrevPage] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  function playSound() {
    if (audioRef.current?.currentTime !== undefined) {
      audioRef.current.currentTime = 0;
    }
    audioRef.current?.play();
  }

  function nextPage() {
    if (page < entries.length - 1) {
      setPrevPage(page);
      setPageTurning("right");
      playSound();
      setTimeout(() => {
        setPage(p => p + 1);
        setPageTurning(null);
        setPrevPage(null);
      }, 650);
    }
  }
  function prevPageFxn() {
    if (page > 0) {
      setPrevPage(page);
      setPageTurning("left");
      playSound();
      setTimeout(() => {
        setPage(p => p - 1);
        setPageTurning(null);
        setPrevPage(null);
      }, 650);
    }
  }
  if (!entries.length) {
    return (
      <div className="flex flex-col items-center text-rose-300 p-8 text-lg">
        No diary entries found.
      </div>
    );
  }

  // Calculate which pages to show during animation.
  const currentEntry = entries[page];
  let underneathEntry: DiaryEntry | null = null;
  if (pageTurning === "right" && page < entries.length - 1 && prevPage !== null) {
    // Next page is coming in underneath
    underneathEntry = entries[page + 1];
  }
  if (pageTurning === "left" && page > 0 && prevPage !== null) {
    // Previous page is coming from underneath
    underneathEntry = entries[page - 1];
  }

  /**
   * Animation details:
   *  - While pageTurning is not null, render two DiaryPage:
   *      1. The flipping page (on top), animating rotateY from 0 to -120deg (for right) or 120deg (for left)
   *      2. The next/prev page (underneath), static, revealed as flipping occurs
   *  - After animation finishes, show only the new page
   */

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-xl min-h-[60vh]">
      <audio ref={audioRef} src={PAGE_TURN_URL} preload="auto" />
      <div className="absolute top-1/2 left-0 z-10 -translate-y-1/2">
        <button
          disabled={page === 0 || !!pageTurning}
          aria-label="Previous Page"
          onClick={prevPageFxn}
          className={`rounded-full bg-white/60 shadow p-2 ${page === 0 || pageTurning ? "opacity-30 pointer-events-none" : "hover:bg-rose-100"} transition-all`}
        >
          <ArrowLeft />
        </button>
      </div>

      <div className="relative flex flex-col w-full max-w-xl mx-auto select-none" style={{ perspective: "1500px", minHeight: 400 }}>
        {/* Underneath page, only visible during flipping */}
        {pageTurning && underneathEntry && (
          <div
            className="absolute w-full h-full z-0"
            style={{
              top: 0,
              left: 0,
              pointerEvents: "none",
              background: "linear-gradient(135deg, #FFF4F4 80%, #FFE7CA 100%)",
              borderRadius: "22px",
              boxShadow: "0px 6px 32px 0 rgba(245, 56, 56, 0.10)",
              minHeight: 400,
              // No transform needed for underneath page
            }}
          >
            <DiaryPage
              entry={underneathEntry}
              onEdit={() => onEdit(underneathEntry!)}
              onDelete={() => onDelete(underneathEntry!.id)}
            />
          </div>
        )}

        {/* Flipping/Current page */}
        <div
          className="w-full h-full z-10 will-change-transform"
          style={{
            position: pageTurning ? "absolute" : "relative",
            top: pageTurning ? 0 : undefined,
            left: pageTurning ? 0 : undefined,
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #FFF4F4 80%, #FFE7CA 100%)",
            borderRadius: "22px",
            boxShadow: "0px 6px 32px 0 rgba(245, 56, 56, 0.10)",
            minHeight: 400,
            transition: pageTurning
              ? "transform 0.65s cubic-bezier(.8,.2,.2,1)"
              : undefined,
            transform:
              pageTurning === "right"
                ? "rotateY(-120deg)"
                : pageTurning === "left"
                ? "rotateY(120deg)"
                : "rotateY(0deg)",
            transformOrigin:
              pageTurning === "right"
                ? "left center"
                : pageTurning === "left"
                ? "right center"
                : "center center",
            transformStyle: "preserve-3d",
            zIndex: 10,
          }}
        >
          <DiaryPage
            entry={currentEntry}
            onEdit={() => onEdit(currentEntry)}
            onDelete={() => onDelete(currentEntry.id)}
          />
        </div>
      </div>
      <div className="absolute top-1/2 right-0 z-10 -translate-y-1/2">
        <button
          disabled={page === entries.length - 1 || !!pageTurning}
          aria-label="Next Page"
          onClick={nextPage}
          className={`rounded-full bg-white/60 shadow p-2 ${page === entries.length - 1 || pageTurning ? "opacity-30 pointer-events-none" : "hover:bg-rose-100"} transition-all`}
        >
          <ArrowRight />
        </button>
      </div>
      <div className="mt-4 text-sm text-rose-400 font-medium">
        Page {page + 1} of {entries.length}
      </div>
    </div>
  );
}
