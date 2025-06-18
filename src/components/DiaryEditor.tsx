import { useEffect, useState, useRef, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";
import { DiaryEntry } from '../types/diary';

interface Props {
  open: boolean;
  mode: "add" | "edit";
  entry?: DiaryEntry |null;
  onSave: (entry: DiaryEntry) => Promise<void>;
  onClose: () => void;
}

export default function DiaryEditor({ open, mode, entry, onSave, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState<string | null>(null);
  // const [imgFile, setImgFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form if entry/ mode changes
  // React key on Dialog will help, but ensure clean state
  // Sync form fields when entry or mode changes
  useEffect(() => {
    if (mode === "edit" && entry) {
      setTitle(entry.title || "");
      setContent(entry.content || "");
      setDate(entry.date || new Date().toISOString().slice(0, 10));
      setImage(entry.image || null);
    } else if (mode === "add") {
      // Clear all fields
      setTitle("");
      setContent("");
      setDate(new Date().toISOString().slice(0, 10));
      setImage(null);
    }
  }, [entry, mode, open]);

  useEffect(() => {
  if (entry?.date) {
    setDate(entry.date);
  } else {
    setDate(new Date().toISOString().slice(0, 10));
  }
}, [entry]);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      // setImgFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        if (ev.target?.result) setImage(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newEntry: DiaryEntry = {
      id: entry?.id ?? Date.now(), // or 0 if new entries get an id later
      title,
      content,
      date,
      image: image || null,
    };

    await onSave(newEntry);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full p-6">
        <DialogTitle className="sr-only">Edit Diary Entry</DialogTitle>
        <DialogHeader>
          <span className="text-lg font-bold text-rose-500 mb-2">{mode === "add" ? "Add New Entry" : "Edit Entry"}</span>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              className="w-full rounded-lg border px-3 py-2 text-lg font-semibold focus:outline-none focus:border-rose-400"
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <textarea
              className="w-full min-h-[90px] rounded-lg border px-3 py-2 focus:outline-none focus:border-rose-400"
              placeholder="What's on your mind?"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="rounded-lg border px-3 py-1 focus:border-rose-400"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={e => setDate(e.target.value)}
            />
            <label className="inline-flex items-center gap-2 cursor-pointer ml-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon className="mr-1" size={18} /> {image ? "Change" : "Add"} Image
              </Button>
            </label>
            {image && (
              <div className="flex items-center gap-2 ml-2">
                <img
                  src={image}
                  alt="Preview"
                  className="h-10 w-10 rounded-md object-cover ring-2 ring-rose-200 shadow"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setImage(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="ghost" className="mr-2" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-rose-400 hover:bg-rose-500">
              {mode === "add" ? "Add" : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
