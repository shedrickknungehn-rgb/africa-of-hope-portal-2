import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Clock, Loader2, Send } from "lucide-react";
import { academicApi, type ClassworkStart } from "@/lib/academics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * G2: timed classwork. Opening the dialog calls `start_classwork` (idempotent
 * — resumes an in-progress attempt instead of restarting the clock), shows a
 * live countdown from `deadline_at`, accepts a text response and/or one
 * attachment, and submits through `submit_classwork`. The server is the
 * source of truth for lateness and the time limit; the countdown here is a
 * courtesy indicator, not an enforcement mechanism.
 */
export default function ClassworkDialog({
  open,
  onOpenChange,
  assignmentId,
  studentId,
  unitTitle,
  onSubmitted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  studentId: string;
  unitTitle: string;
  onSubmitted: () => void;
}) {
  const [starting, setStarting] = useState(false);
  const [start, setStart] = useState<ClassworkStart | null>(null);
  const [error, setError] = useState("");
  const [responseText, setResponseText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const fileInputId = useRef(`classwork-file-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    if (!open) { setStart(null); setError(""); setResponseText(""); setFile(null); return; }
    let active = true;
    setStarting(true);
    setError("");
    (async () => {
      try {
        const result = await academicApi.startClasswork(assignmentId);
        if (active) setStart(result);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (active) setStarting(false);
      }
    })();
    return () => { active = false; };
  }, [open, assignmentId]);

  useEffect(() => {
    if (!open || !start?.deadline_at) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [open, start?.deadline_at]);

  const deadlineMs = start?.deadline_at ? new Date(start.deadline_at).getTime() : null;
  const msLeft = deadlineMs !== null ? deadlineMs - nowMs : null;
  const timeUp = msLeft !== null && msLeft <= 0;

  const submit = async () => {
    if (!responseText.trim() && !file) {
      toast.error("Add a response or attach a file before you submit.");
      return;
    }
    setSubmitting(true);
    try {
      const uploaded = file ? await academicApi.uploadClassworkAttachment(assignmentId, studentId, file) : null;
      const result = await academicApi.submitClasswork(assignmentId, responseText.trim(), uploaded?.path ?? null);
      toast.success(result.is_late ? "Classwork submitted — marked late." : "Classwork submitted.");
      onOpenChange(false);
      onSubmitted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{unitTitle}</DialogTitle>
          <DialogDescription>
            {start?.time_limit_minutes ? `You have ${start.time_limit_minutes} minutes once you start. Submit before the clock runs out to avoid a late mark.` : "Write your response and submit when ready."}
          </DialogDescription>
        </DialogHeader>
        {starting && <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-700" aria-label="Starting classwork" />}
        {!starting && error && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}
        {!starting && !error && start && (
          <div className="space-y-3">
            {msLeft !== null && (
              <p className={`flex items-center gap-1.5 text-sm font-semibold ${timeUp ? "text-rose-600" : "text-amber-700"}`} role="timer" aria-live="polite">
                <Clock className="h-4 w-4" /> {timeUp ? "Time is up — submit now" : `Time remaining: ${formatCountdown(msLeft)}`}
              </p>
            )}
            <div>
              <Label htmlFor="classwork-response">Your response</Label>
              <Textarea
                id="classwork-response"
                className="mt-1"
                rows={6}
                maxLength={20000}
                placeholder="Type your answer here"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={fileInputId}>Attach a file (optional)</Label>
              <Input id={fileInputId} className="mt-1" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!start || submitting} onClick={() => void submit()} className="bg-emerald-700 hover:bg-emerald-800">
            {submitting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />} Submit classwork
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
