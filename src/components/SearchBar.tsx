import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
}
export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative w-full max-w-xs mx-auto">
      <input
        type="text"
        className="pl-10 pr-3 py-2 rounded-xl border bg-white/70 focus:bg-white focus:border-rose-400 transition placeholder:text-rose-400 w-full shadow"
        placeholder="Search diary..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <Search className="absolute left-3 top-2.5 text-rose-400" size={20} />
    </div>
  );
}
