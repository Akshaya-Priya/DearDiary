// import { useEffect, useMemo, useState } from "react";
// import DiaryBook from "@/components/DiaryBook";
// import SearchBar from "@/components/SearchBar";
// import {
//   getAllEntries,
//   addEntry,
//   updateEntry,
//   deleteEntry,
// } from "@/lib/diaryService";
// import { Plus } from "lucide-react";
// import DiaryEditor from "@/components/DiaryEditor";
// import { toast } from "@/hooks/use-toast";

// interface Entry {
//   id: number;
//   title: string;
//   content: string;
//   date: string;
//   image?: string | null;
// }

// export default function DiaryReaderPage() {
//   const [entries, setEntries] = useState<Entry[]>([]);
//   const [filtered, setFiltered] = useState<Entry[]>([]);
//   const [search, setSearch] = useState("");
//   const [editorOpen, setEditorOpen] = useState(false);
//   const [editorMode, setEditorMode] = useState<"add" | "edit">("add");
//   const [entryEdit, setEntryEdit] = useState<Entry | null>(null);
//   const [selectedYear, setSelectedYear] = useState<string>(
//     new Date().getFullYear().toString()
//   );

//   // ✅ Load entries initially
//   useEffect(() => {
//     const fetchData = async () => {
//       const data = await getAllEntries();
//       setEntries(data);
//     };
//     fetchData();
//   }, []);

//   // ✅ Filter by year and search
//   useEffect(() => {
//     let list = entries;
//     if (selectedYear) {
//       list = list.filter((e) => e.date.startsWith(selectedYear));
//     }
//     if (search.trim().length) {
//       const term = search.toLowerCase();
//       list = list.filter(
//         (e) =>
//           e.title.toLowerCase().includes(term) ||
//           e.content.toLowerCase().includes(term)
//       );
//     }
//     setFiltered(list);
//   }, [entries, search, selectedYear]);

//   // ✅ Available years
//   const allYears = useMemo(() => {
//     const years = Array.from(new Set(entries.map((e) => e.date.slice(0, 4)))).sort();
//     return years;
//   }, [entries]);

//   // ✅ Sync after CRUD
//   const syncEntries = async () => {
//     const data = await getAllEntries();
//     setEntries(data);
//   };

//   function handleAdd() {
//     setEditorMode("add");
//     setEntryEdit(null);
//     setEditorOpen(true);
//   }

//   function handleEdit(entry: Entry) {
//     setEditorMode("edit");
//     setEntryEdit(entry);
//     setEditorOpen(true);
//   }

//   async function handleSave(entry: Entry) {
//     if (editorMode === "add") {
//       await addEntry(entry);
//       toast({ title: "Diary entry added!" });
//     } else {
//       await updateEntry(entry.id, entry);
//       toast({ title: "Entry updated!" });
//     }
//     setEditorOpen(false);
//     setEditorMode("add");
//     setEntryEdit(null);
//     await syncEntries();
//   }

//   async function handleDelete(id: number) {
//     await deleteEntry(id);
//     toast({ title: "Deleted entry" });
//     await syncEntries();
//   }

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
//       <nav className="bg-white/70 backdrop-blur-md shadow px-6 py-4 flex justify-between items-center">
//         <h1 className="text-xl font-bold text-rose-500">My Diary 📘</h1>
//         <button
//           onClick={handleAdd}
//           className="flex items-center gap-1 bg-rose-400 hover:bg-rose-500 text-white px-4 py-2 rounded-xl transition shadow"
//         >
//           <Plus /> New Page
//         </button>
//       </nav>

//       <div className="flex flex-1 overflow-hidden">
//         {/* Sidebar: Years */}
//         <aside className="flex flex-col gap-2 px-4 py-8 bg-white/60 border-r border-rose-100 min-w-[70px]">
//           <span className="font-semibold text-rose-500 text-center mb-2">Years</span>
//           {allYears.map((y) => (
//             <button
//               key={y}
//               className={`px-3 py-1 rounded-lg transition-all mb-1 text-sm ${
//                 selectedYear === y
//                   ? "bg-rose-400 text-white"
//                   : "hover:bg-rose-200 text-rose-500"
//               }`}
//               onClick={() => setSelectedYear(y)}
//             >
//               {y}
//             </button>
//           ))}
//         </aside>

//         <main className="flex-1 flex flex-col">
//           <div className="p-4">
//             <SearchBar value={search} onChange={setSearch} />
//           </div>
//           <div className="flex-1 flex items-center justify-center overflow-y-auto">
//             <DiaryBook
//               entries={filtered}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//             />
//           </div>
//         </main>
//       </div>

//       <DiaryEditor
//         open={editorOpen}
//         mode={editorMode}
//         entry={entryEdit}
//         onSave={handleSave}
//         onClose={() => setEditorOpen(false)}
//       />
//     </div>
//   );
// }
