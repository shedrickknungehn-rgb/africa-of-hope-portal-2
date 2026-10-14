import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { X, Send, Sparkles, Bot } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useAssistantVisibility } from "../../context/AssistantVisibility";
import { streamAssistant, AssistantError, type AssistantMessage } from "../../lib/assistant";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatBubble {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
}

function suggestionsFor(role: string | null): string[] {
  if (!role) {
    return [
      "What programmes do you offer?",
      "How do I apply?",
      "How can I verify a certificate?",
    ];
  }
  if (role === "Student") {
    return ["How much do I still owe in fees?", "What quizzes do I have coming up?", "What programmes am I enrolled in?"];
  }
  if (role === "Teacher") {
    return ["How many students are in my cohorts?", "How do quiz attempts get graded?"];
  }
  return ["Give me a quick overview of the academy right now", "How many students are active?"];
}

export default function HopeAssistant() {
  const { state, currentUser } = useApp();
  const { hidden } = useAssistantVisibility();
  const [open, setOpen] = useState(false);
  const [bubbles, setBubbles] = useState<ChatBubble[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [bubbles, sending]);

  useEffect(() => () => abortRef.current?.abort(), []);

  if (!state.settings.assistantEnabled || hidden) return null;

  const label = state.websiteSettings.assistantLauncherLabel || "Ask Hope";
  const surface: "public" | "portal" = currentUser ? "portal" : "public";

  async function send(text: string) {
    const content = text.trim();
    if (!content || sending) return;
    const history: AssistantMessage[] = [
      ...bubbles.filter((b) => b.role !== "error").map((b) => ({ role: b.role as "user" | "assistant", content: b.content })),
      { role: "user", content },
    ];
    setBubbles((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content }]);
    setDraft("");
    setSending(true);

    const assistantId = crypto.randomUUID();
    setBubbles((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await streamAssistant({
        messages: history,
        surface,
        signal: controller.signal,
        onDelta: (delta) => {
          setBubbles((prev) => prev.map((b) => (b.id === assistantId ? { ...b, content: b.content + delta } : b)));
        },
      });
    } catch (e) {
      const message = e instanceof AssistantError ? e.message : "Hope Assistant is unavailable right now. Please try again shortly.";
      setBubbles((prev) => {
        const withoutEmptyDraft = prev.filter((b) => !(b.id === assistantId && b.content === ""));
        return [...withoutEmptyDraft, { id: crypto.randomUUID(), role: "error", content: message }];
      });
    } finally {
      setSending(false);
      abortRef.current = null;
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={label}
          className={cn(
            "fixed z-40 flex items-center gap-2.5 rounded-full bg-[#022c22] text-sm font-bold text-white shadow-2xl shadow-emerald-950/30 transition hover:brightness-110",
            surface === "portal"
              ? "bottom-4 left-4 h-11 w-11 justify-center p-0 lg:w-56 lg:justify-start lg:px-4"
              : "bottom-5 right-5 px-5 py-3.5 max-sm:top-24 max-sm:right-3 max-sm:bottom-auto max-sm:h-10 max-sm:w-10 max-sm:justify-center max-sm:p-0",
          )}
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-400 text-[#022c22] max-sm:h-7 max-sm:w-7">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <span className={surface === "portal" ? "sr-only lg:not-sr-only" : "max-sm:sr-only"}>{label}</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-40 flex h-[600px] w-[380px] max-w-[92vw] flex-col overflow-hidden rounded-2xl border border-emerald-900/10 bg-white shadow-2xl">
          <div className="flex items-center gap-3 bg-gradient-to-br from-emerald-900 to-[#022c22] p-4 text-white">
            <span className="relative grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-amber-400 text-[#022c22]">
              <Bot className="h-5 w-5" />
              <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#022c22]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{label}</p>
              <p className="truncate text-xs text-emerald-200">Africa of Hope Academy assistant</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-emerald-100 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {bubbles.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Hi{currentUser ? ` ${currentUser.name.split(" ")[0]}` : ""}! I'm {label}. Ask me about programmes,
                  admissions, {currentUser ? "your fees, quizzes, " : ""}certificate verification, or how to use the portal.
                </p>
                <div className="ml-1 flex flex-wrap gap-1.5">
                  {suggestionsFor(currentUser?.role ?? null).map((s) => (
                    <button
                      key={s} type="button" onClick={() => send(s)}
                      className="rounded-full border border-emerald-600/25 bg-white px-3 py-1.5 text-left text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {bubbles.map((b) => (
              <div key={b.id} className={cn("flex", b.role === "user" ? "justify-end" : "justify-start")}>
                {b.role === "error" ? (
                  <p className="max-w-[85%] rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">{b.content}</p>
                ) : (
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                      b.role === "user" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-800",
                    )}
                  >
                    {b.content ? (
                      <div className="prose-sm [&_p]:my-1 [&_ul]:my-1 [&_ul]:pl-4">
                        <ReactMarkdown>{b.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 py-1">
                        <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 [animation-delay:150ms]" />
                        <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 [animation-delay:300ms]" />
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form
            className="border-t border-slate-100 p-3"
            onSubmit={(e) => { e.preventDefault(); send(draft); }}
          >
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3.5 py-1.5">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask Hope Assistant…"
                maxLength={1500}
                disabled={sending}
                className="flex-1 bg-transparent py-2 text-sm outline-none disabled:opacity-60"
              />
              <Button type="submit" size="icon" disabled={sending || !draft.trim()} className="h-9 w-9 rounded-xl bg-emerald-700 hover:bg-emerald-800">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-[11px] text-slate-400">Hope Assistant can make mistakes. Confirm anything important with the office.</p>
          </form>
        </div>
      )}
    </>
  );
}
