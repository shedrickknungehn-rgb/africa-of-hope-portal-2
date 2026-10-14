import { useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { Image as ImageIcon, Plus, Trash2, ArrowUp, ArrowDown, Upload, X } from "lucide-react";

/* ---------- tiny id helper ---------- */
let seq = 0;
export const genId = (p: string) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

export function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />
    </label>
  );
}

export function Area({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />
    </label>
  );
}

export function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-emerald-300"
    >
      <span>
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-emerald-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export function ImageBox({
  label,
  value,
  onChange,
  round,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  round?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const handleFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 2_000_000) {
      toast.error("Image too large (max 2 MB). Resize it first.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result ?? ""));
    reader.onerror = () => toast.error("Could not read that file.");
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <div
          className={`grid h-16 w-16 shrink-0 place-items-center overflow-hidden border border-slate-200 bg-slate-50 ${
            round ? "rounded-full" : "rounded-xl"
          }`}
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-slate-400" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700"
          >
            <Upload className="h-3.5 w-3.5" /> Upload
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <X className="h-3.5 w-3.5" /> Remove
            </button>
          )}
        </div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      <input
        value={value.startsWith("data:") ? "" : value}
        placeholder="…or paste an image URL"
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-emerald-500"
      />
    </div>
  );
}

export function ListCard({
  index,
  total,
  title,
  onUp,
  onDown,
  onDelete,
  children,
}: {
  index: number;
  total: number;
  title: string;
  onUp: () => void;
  onDown: () => void;
  onDelete: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800">
          {title} <span className="text-slate-400">#{index + 1}</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onUp}
            disabled={index === 0}
            aria-label="Move up"
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition enabled:hover:bg-slate-50 disabled:opacity-40"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDown}
            disabled={index === total - 1}
            aria-label="Move down"
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition enabled:hover:bg-slate-50 disabled:opacity-40"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete"
            className="grid h-8 w-8 place-items-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
    >
      <Plus className="h-4 w-4" /> {label}
    </button>
  );
}
