"use client";

import { useState, useRef, Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const API = process.env.NEXT_PUBLIC_API_URL;

type Item = {
  canonical_name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number | null;
};

type Step = "upload" | "processing" | "done";

const STEPS = [
  { id: "upload",     label: "Upload",  icon: "📎" },
  { id: "processing", label: "Reading", icon: "🔍" },
  { id: "done",       label: "Done",    icon: "✓"  },
] as const;

function LoadingSpinner() {
  return <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />;
}

function ProcessingStep({ done, label, active }: { done: boolean; label: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs
        ${done   ? "bg-(--color-brand) text-white"                          : ""}
        ${active ? "bg-(--color-brand-xlight) border-2 border-(--color-brand)" : ""}
        ${!done && !active ? "bg-stone-100"                                 : ""}
      `}>
        {done   ? "✓" : null}
        {active ? <span className="w-2 h-2 rounded-full bg-(--color-brand) animate-pulse block" /> : null}
      </div>
      <p className={`text-sm ${done ? "text-(--color-text-faint) line-through" : active ? "text-(--color-text-primary) font-medium" : "text-(--color-text-faint)"}`}>
        {label}
      </p>
    </div>
  );
}

export default function ScanPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview]           = useState<string | null>(null);
  const [file, setFile]                 = useState<File | null>(null);
  const [isDoc, setIsDoc]               = useState(false);
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState<Item[] | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [step, setStep]                 = useState<Step>("upload");
  const [isDraggingOver, setIsDragging] = useState(false);

  function handleFile(f: File) {
    if (f.size > 10 * 1024 * 1024) {
      setError("File is too large — please use a file under 10 MB.");
      return;
    }
    const isImage = f.type.startsWith("image/");
    setFile(f);
    setIsDoc(!isImage);
    setPreview(isImage ? URL.createObjectURL(f) : null);
    setResult(null);
    setError(null);
    setStep("upload");
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function reset() {
    setResult(null);
    setFile(null);
    setPreview(null);
    setIsDoc(false);
    setStep("upload");
    setError(null);
  }

  async function upload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setStep("processing");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? "";
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API}/receipts`, {
        method: "POST",
        body: form,
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? "Something went wrong. Please try again.");
      }
      const data = await res.json();
      setResult(data.items);
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep("upload");
    } finally {
      setLoading(false);
    }
  }

  const stepIdx = STEPS.findIndex(s => s.id === step);

  return (
    <main className="min-h-full bg-(--color-surface)">
      {/* Header */}
      <div className="px-4 md:px-8 pt-6 pb-2 flex items-center gap-3">
        <Link href="/" className="text-(--color-text-faint) hover:text-(--color-text-muted) text-sm transition-colors">← Back</Link>
        <h1 className="text-xl font-[family-name:--font-display] text-(--color-text-primary)">Scan Receipt</h1>
      </div>

      {/* Progress steps */}
      <div className="flex items-center px-6 md:px-10 py-5 gap-0">
        {STEPS.map((s, i) => (
          <Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300
                ${i < stepIdx  ? "bg-(--color-brand) text-white"                                         : ""}
                ${i === stepIdx ? "bg-(--color-brand) text-white ring-4 ring-amber-200"                  : ""}
                ${i > stepIdx  ? "bg-stone-100 text-(--color-text-faint)"                                : ""}
              `}>
                {i < stepIdx ? "✓" : s.icon}
              </div>
              <span className={`text-[10px] font-medium ${i <= stepIdx ? "text-(--color-brand)" : "text-(--color-text-faint)"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all duration-500
                ${i < stepIdx ? "bg-(--color-brand)" : "bg-stone-200"}`} />
            )}
          </Fragment>
        ))}
      </div>

      <div className="px-4 md:px-8 space-y-4">
        {/* Drop zone */}
        {!result && (
          <>
            {!preview ? (
              <div
                className={`rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-200 p-10 text-center
                  ${isDraggingOver
                    ? "border-(--color-brand-light) bg-(--color-brand-xlight) scale-[1.01]"
                    : "border-(--color-border) bg-(--color-card) hover:border-(--color-brand-light) hover:bg-(--color-card-warm)"
                  }`}
                onClick={() => inputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
              >
                <div className="w-16 h-16 rounded-2xl bg-(--color-card-warm) border border-(--color-border) flex items-center justify-center text-3xl mx-auto mb-4">
                  📸
                </div>
                <p className="font-semibold text-(--color-text-primary) text-base mb-1">Drop your receipt here</p>
                <p className="text-sm text-(--color-text-muted)">or click to browse · Image, PDF, Excel, Word, CSV or TXT</p>
                <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.xlsx,.xls,.docx,.doc,.csv,.txt" className="hidden" onChange={onFileChange} />
              </div>
            ) : isDoc ? (
              <div
                className="relative rounded-3xl border border-(--color-border) shadow-sm cursor-pointer group bg-stone-50 p-10 text-center"
                onClick={() => inputRef.current?.click()}
              >
                <div className="text-5xl mb-3">
                  {file?.name.endsWith(".pdf") ? "📄" : file?.name.match(/\.xlsx?$/) ? "📊" : file?.name.match(/\.docx?$/) ? "📝" : "📃"}
                </div>
                <p className="font-medium text-(--color-text-primary) text-sm">{file?.name}</p>
                <p className="text-xs text-(--color-text-faint) mt-1">click to change</p>
                <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.xlsx,.xls,.docx,.doc,.csv,.txt" className="hidden" onChange={onFileChange} />
              </div>
            ) : (
              <div
                className="relative rounded-3xl overflow-hidden border border-(--color-border) shadow-sm cursor-pointer group"
                onClick={() => inputRef.current?.click()}
              >
                <img src={preview!} alt="receipt" className="w-full max-h-72 object-contain bg-stone-50" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full">📎 Change file</span>
                </div>
                <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.xlsx,.xls,.docx,.doc,.csv,.txt" className="hidden" onChange={onFileChange} />
              </div>
            )}

            {/* Process button */}
            <button
              onClick={upload}
              disabled={loading || !file}
              className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-200
                ${loading || !file
                  ? "bg-stone-200 text-(--color-text-faint) cursor-not-allowed"
                  : "bg-(--color-brand) text-white hover:bg-(--color-brand-light) shadow-md hover:shadow-lg active:scale-[0.98]"
                }`}
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><LoadingSpinner /> Reading your receipt...</span>
                : "Process Receipt →"
              }
            </button>

            {/* Processing steps panel */}
            {loading && (
              <div className="rounded-2xl border border-(--color-border) bg-(--color-card) p-5 space-y-3">
                <ProcessingStep done={true}  label="Receipt uploaded"     />
                <ProcessingStep done={true}  label="Sending to Claude AI" />
                <ProcessingStep done={false} label="Extracting items..."  active={true} />
                <ProcessingStep done={false} label="Updating your pantry" />
              </div>
            )}
          </>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-(--color-urgent-bg) border border-red-200 px-5 py-4 flex gap-3 items-start">
            <span className="text-lg shrink-0">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-(--color-urgent-text)">Could not read receipt</p>
              <p className="text-xs text-red-400 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="rounded-2xl border border-(--color-border) bg-(--color-card) overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-(--color-safe-bg) border-b border-green-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-base">✓</div>
              <div>
                <p className="font-semibold text-(--color-safe-text) text-sm">{result.length} items added to your pantry</p>
                <p className="text-xs text-green-500 mt-0.5">All items are now being tracked</p>
              </div>
            </div>

            <div className="divide-y divide-(--color-border) max-h-72 overflow-y-auto">
              {result.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="font-medium text-(--color-text-primary) capitalize text-sm">{item.canonical_name}</p>
                    <p className="text-xs text-(--color-text-faint) mt-0.5">
                      {item.quantity} {item.unit}
                      <span className="mx-1.5">·</span>
                      <span className="capitalize">{item.category}</span>
                    </p>
                  </div>
                  {item.price != null && (
                    <p className="text-sm font-semibold text-(--color-text-primary)">${item.price.toFixed(2)}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-(--color-border) flex gap-3">
              <button
                onClick={reset}
                className="flex-1 py-2.5 rounded-xl border border-(--color-border) text-sm font-medium text-(--color-text-muted) hover:bg-stone-50 transition-colors"
              >
                Scan another
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex-1 py-2.5 rounded-xl bg-(--color-brand) text-white text-sm font-semibold hover:bg-(--color-brand-light) transition-colors shadow-sm"
              >
                View Pantry →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
