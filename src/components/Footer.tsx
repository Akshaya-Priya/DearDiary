import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full py-3 border-t border-rose-200 bg-white/60 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-1 text-sm text-rose-500">
        <div className="flex items-center gap-1">
          Made with <Heart size={14} className="text-rose-400" /> by
          <span className="flex items-center">
            {/* Colored SVG Signature */}
            <img src="/Sign.svg" alt="Signature" className="h-10 w-auto text-rose-500 -mt-3" />
          </span>
        </div>
        <p>© {new Date().getFullYear()} Dear Diary</p>
      </div>
    </footer>
  );
}

