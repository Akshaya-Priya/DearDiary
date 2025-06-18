import { BookOpen, Edit, Trash2 } from "lucide-react";
import { DiaryEntry } from '../types/diary';

interface Props {
  entries: DiaryEntry[];
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (id: number) => void;
}

export default function DiaryList({ entries, onEdit, onDelete }: Props) {
  if (!entries.length) {
    return (
      <div className="flex flex-col items-center text-rose-300 py-10">
        <BookOpen size={40} className="mb-2" />
        <span className="text-lg">No diary entries found.</span>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 p-2 pt-2 md:pt-6">
      {entries.map(entry => (
        <div
          key={entry.id}
          className="bg-white/75 shadow-md rounded-xl p-4 flex flex-col hover:ring-2 ring-rose-200 transition group cursor-pointer"
          onClick={() => {}}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {entry.image && (
                <img
                  src={entry.image}
                  alt="thumbnail"
                  className="w-11 h-11 min-w-11 min-h-11 rounded-md object-cover mr-1 ring-1 ring-rose-100 shadow"
                />
              )}
              <div className="flex flex-col">
                <span className="text-xl font-bold text-rose-500">{entry.title}</span>
                <span className="text-xs text-rose-400">{entry.date}</span>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <button
                className="opacity-70 hover:opacity-100 hover:text-rose-500"
                onClick={e => { e.stopPropagation(); onEdit(entry); }}
                title="Edit"
              >
                <Edit size={20} />
              </button>
              <button
                className="opacity-70 hover:opacity-100 hover:text-rose-500"
                onClick={e => { e.stopPropagation(); onDelete(entry.id); }}
                title="Delete"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
          <div
            className="mt-3 text-gray-700 text-base min-h-[40px] group-hover:text-rose-600 transition line-clamp-3"
            title={entry.content}
          >
            {entry.content}
          </div>
        </div>
      ))}
    </div>
  );
}
