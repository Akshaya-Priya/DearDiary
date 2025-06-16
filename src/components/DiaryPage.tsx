
import { Edit, Trash2, Image as ImageIcon } from "lucide-react";

type DiaryEntry = {
  id: number;
  title: string;
  content: string;
  date: string;
  image?: string | null;
};

interface Props {
  entry: DiaryEntry;
  onEdit: () => void;
  onDelete: () => void;
}

// Lined paper background as SVG or CSS
const LINES_BG = `repeating-linear-gradient(
  to bottom,
  #fff 0px,
  #fff 26px,
  #ffe6e6 27px,
  #fff 28px
)`;

export default function DiaryPage({ entry, onEdit, onDelete }: Props) {
  return (
    <div
      className="p-8 relative min-h-[400px] flex flex-col gap-2"
      style={{
        background: LINES_BG,
        borderRadius: "22px",
        boxShadow: "0 4px 28px #fae2e2c9",
      }}
    >
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm font-bold text-gray-400">{entry.date}</span>
        <div className="flex gap-2">
          <button
            className="opacity-60 hover:opacity-100 hover:text-rose-500"
            onClick={onEdit}
            title="Edit">
            <Edit size={18} />
          </button>
          <button
            className="opacity-60 hover:opacity-100 hover:text-rose-500"
            onClick={onDelete}
            title="Delete">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <h2 className="font-bold text-2xl text-rose-400 mb-2">{entry.title}</h2>
      <div className="px-1 whitespace-pre-wrap text-[1.09rem] flex-1" style={{ fontFamily: "Georgia,serif" }}>
        {entry.content}
      </div>
      {entry.image && (
        <div className="absolute right-7 top-16 z-10 animate-[pulse_2s_ease-in-out_infinite] pointer-events-none">
          <img
            src={entry.image}
            alt="Diary"
            className="w-28 h-28 object-cover rounded-md shadow-xl border-2 border-rose-200"
            style={{
              transform: "rotate(-5deg)",
              boxShadow: "0 8px 32px #f6c4c4b0",
              border: "1.5mm ridge #fadcda",
              position: "relative"
            }}
          />
          <div
            className="absolute left-6 top-3 w-8 h-8 bg-white/80 rounded-full border-2 border-rose-200"
            style={{
              border: "2px solid #fde6e6",
              boxShadow: "0 3px 8px #FEE0CB",
              zIndex: 11,
              transform: "rotate(-7deg)"
            }}
          >
            <ImageIcon className="absolute left-1 top-1 text-rose-300" size={22} />
          </div>
        </div>
      )}
    </div>
  );
}
