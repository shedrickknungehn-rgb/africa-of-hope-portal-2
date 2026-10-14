import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchState, settingsRow, today, uid, type Row } from "@/data/liveData";
import type {
  Announcement,
  AppState,
  Assignment,
  AttendanceStatus,
  Certificate,
  Cohort,
  FeeTransaction,
  Program,
  SystemSettings,
  User,
  WebsiteListKey,
  WebsiteSettings,
} from "../types";
import { defaultSettings, defaultWebsiteSettings, initialState } from "../data/mockData";

const CACHE_KEY = "africa-of-hope-portal-cache-v4";
const SESSION_KEY = "africa-of-hope-session-v4";

const LIVE_TABLES = [
  "profiles",
  "programs",
  "program_modules",
  "cohorts",
  "cohort_students",
  "attendance",
  "assignments",
  "submissions",
  "fee_transactions",
  "certificates",
  "announcements",
  "system_settings",
];

export interface RegistrationPayload {
  name: string;
  email: string;
  phone: string;
  programIds: string[];
  note: string;
  documents: string;
}

export interface SignUpPayload extends RegistrationPayload {
  password: string;
}

export interface SignUpResult {
  error: string | null;
  /**
   * signed_in: account created and session started.
   * confirm_email: account created, applicant must confirm their email first.
   * application_only: sign-ups are disabled, so only a pending profile was filed.
   */
  status?: "signed_in" | "confirm_email" | "application_only";
}

export interface ProfilePatch {
  name?: string;
  phone?: string;
  title?: string;
  bio?: string;
  address?: string;
  dateOfBirth?: string;
  avatarUrl?: string | null;
}

interface AppContextValue {
  state: AppState;
  currentUser: User | null;
  loading: boolean;
  live: boolean;
  refresh: () => Promise<void>;
  /** Resolves to an error message, or null on success. */
  login: (emailOrUserId: string, password?: string) => Promise<string | null>;
  logout: () => void;
  registerStudent: (payload: RegistrationPayload) => void;
  signUpStudent: (payload: SignUpPayload) => Promise<SignUpResult>;
  requestPasswordReset: (email: string) => Promise<string | null>;
  changePassword: (password: string) => Promise<string | null>;
  updateProfile: (id: string, patch: ProfilePatch) => Promise<string | null>;
  setProgramImage: (id: string, imageUrl: string | null) => Promise<string | null>;
  approveApplicant: (id: string) => void;
  rejectApplicant: (id: string) => void;
  toggleStudentStatus: (id: string) => void;
  addProgram: (payload: Omit<Program, "id" | "modules"> & { modulesRaw: string }) => void;
  addCohort: (payload: Omit<Cohort, "id">) => void;
  markAttendance: (cohortId: string, date: string, statuses: Record<string, AttendanceStatus>) => void;
  addAssignment: (payload: Omit<Assignment, "id">) => void;
  gradeSubmission: (assignmentId: string, studentId: string, marks: number, feedback: string) => void;
  addFeeTransaction: (payload: Omit<FeeTransaction, "id">) => void;
  issueCertificate: (studentId: string, programId: string, honors: string) => Certificate;
  addAnnouncement: (payload: Omit<Announcement, "id" | "date">) => void;
  updateSystemSettings: (patch: Partial<SystemSettings>) => void;
  updateWebsiteSettings: (patch: Partial<WebsiteSettings>) => void;
  addToWebsiteList: <K extends WebsiteListKey>(key: K, item: WebsiteSettings[K][number]) => void;
  updateInWebsiteList: <K extends WebsiteListKey>(
    key: K,
    id: string,
    patch: Partial<WebsiteSettings[K][number]>,
  ) => void;
  removeFromWebsiteList: (key: WebsiteListKey, id: string) => void;
  moveInWebsiteList: (key: WebsiteListKey, id: string, dir: -1 | 1) => void;
  resetWebsiteSettings: () => void;
  clearTransactionalData: () => void;
  importSystemData: (data: Partial<AppState>) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function normalize(raw: Partial<AppState> | null): AppState {
  return {
    ...initialState,
    ...(raw ?? {}),
    settings: { ...defaultSettings, ...(raw?.settings ?? {}) },
    websiteSettings: { ...defaultWebsiteSettings, ...(raw?.websiteSettings ?? {}) },
  };
}

function loadCache(): AppState {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return normalize(JSON.parse(raw) as Partial<AppState>);
  } catch {
    /* ignore unreadable cache */
  }
  return initialState;
}

/** Fire-and-forget write-through helper: local state stays optimistic, DB errors surface as toasts. */
function push(label: string, task: PromiseLike<unknown>) {
  void Promise.resolve(task)
    .then((res) => {
      const error = (res as { error?: { message: string } | null } | null)?.error;
      if (error) toast.error(`${label}: ${error.message}`);
    })
    .catch((err: unknown) =>
      toast.error(`${label}: ${err instanceof Error ? err.message : String(err)}`),
    );
}

export const formatCurrency = (amount: number, currency = "$") =>
  `${currency}${(Number.isFinite(amount) ? amount : 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;

export const letterGrade = (marks: number | null) => {
  if (marks === null || Number.isNaN(marks)) return "—";
  if (marks >= 80) return "A";
  if (marks >= 70) return "B";
  if (marks >= 60) return "C";
  if (marks >= 50) return "D";
  return "F";
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadCache);
  const [activeUserId, setActiveUserId] = useState<string | null>(() =>
    localStorage.getItem(SESSION_KEY),
  );
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchState();
      setState(next);
      setLive(true);
    } catch (err) {
      setLive(false);
      toast.error(`Live data unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked */
    }
  }, [state]);

  useEffect(() => {
    if (activeUserId) localStorage.setItem(SESSION_KEY, activeUserId);
    else localStorage.removeItem(SESSION_KEY);
  }, [activeUserId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void refresh().finally(() => {
      if (!cancelled) setLoading(false);
    });

    const channel = supabase.channel("portal-live");
    LIVE_TABLES.forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => void refresh(),
      );
    });
    channel.subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [refresh, reloadKey]);

  useEffect(() => {
    void supabase.auth
      .getSession()
      .then(({ data }) => setSessionUserId(data.session?.user.id ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUserId(session?.user.id ?? null);
      if (!session) setActiveUserId(null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AppContextValue>(() => {
    const currentUser =
      state.users.find((u) => u.id === sessionUserId) ??
      state.users.find((u) => u.id === activeUserId) ??
      null;

    const persistWebsite = (websiteSettings: WebsiteSettings) =>
      push(
        "Website settings",
        supabase
          .from("system_settings")
          .upsert(settingsRow(state.settings, websiteSettings), { onConflict: "id" }),
      );

    const saveWebsite = (websiteSettings: WebsiteSettings) => {
      setState((s) => ({ ...s, websiteSettings }));
      persistWebsite(websiteSettings);
    };

    const patchUser = (id: string, patch: Row, local: (u: User) => User, label: string) => {
      setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? local(u) : u)) }));
      push(label, supabase.from("profiles").update(patch).eq("id", id));
    };

    const value: AppContextValue = {
      state,
      currentUser,
      loading,
      live,
      refresh,
      login: async (emailOrUserId, password) => {
        const existing = state.users.find((u) => u.id === emailOrUserId);
        if (!password) {
          if (existing) {
            setActiveUserId(existing.id);
            toast.success(`Signed in as ${existing.name}`);
            return null;
          }
          toast.error("Enter your portal password to sign in.");
          return "Enter your portal password to sign in.";
        }
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailOrUserId.trim(),
          password,
        });
        if (error) {
          toast.error(error.message);
          return error.message;
        }
        setSessionUserId(data.user?.id ?? null);
        toast.success("Welcome back to the portal.");
        void refresh();
        return null;
      },
      logout: () => {
        setActiveUserId(null);
        setSessionUserId(null);
        void supabase.auth.signOut();
        toast.success("Signed out.");
      },
      registerStudent: (payload) => {
        const id = uid();
        const record: User = {
          id,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          role: "Student",
          status: "Pending Approval",
          joinedDate: today(),
          programIds: payload.programIds,
          cohortIds: [],
          note: payload.note,
          documents: payload.documents,
        };
        setState((s) => ({ ...s, users: [...s.users, record] }));
        push(
          "Application",
          supabase.from("profiles").insert({
            id,
            name: record.name,
            full_name: record.name,
            email: record.email,
            phone: record.phone,
            role: "Student",
            status: "Pending Approval",
            joined_date: record.joinedDate,
            program_ids: record.programIds,
            note: record.note,
            documents: record.documents,
          }),
        );
      },
      signUpStudent: async ({ password, ...payload }) => {
        const email = payload.email.trim().toLowerCase();
        const details = {
          phone: payload.phone,
          program_ids: payload.programIds,
          note: payload.note,
          documents: payload.documents,
        };
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: payload.name, ...details },
          },
        });
        if (error) {
          // Projects with email sign-up disabled still accept a profile-only application.
          if (/sign ?ups? (are )?(not allowed|disabled)/i.test(error.message)) {
            value.registerStudent(payload);
            return { error: null, status: "application_only" };
          }
          return { error: error.message };
        }
        // Supabase hides existing accounts by returning a user with no identities.
        if (data.user && (data.user.identities ?? []).length === 0) {
          return {
            error: "An account with this email already exists. Sign in instead.",
          };
        }
        if (data.session && data.user) {
          // Older signup triggers only copy the name; store the remaining details now.
          await supabase
            .from("profiles")
            .update({ name: payload.name, full_name: payload.name, ...details })
            .eq("id", data.user.id);
          setSessionUserId(data.user.id);
          await refresh();
          return { error: null, status: "signed_in" };
        }
        return { error: null, status: "confirm_email" };
      },
      requestPasswordReset: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        });
        return error?.message ?? null;
      },
      changePassword: async (password) => {
        const { error } = await supabase.auth.updateUser({ password });
        return error?.message ?? null;
      },
      updateProfile: async (id, patch) => {
        const row: Row = {};
        if (patch.name !== undefined) {
          row.name = patch.name;
          row.full_name = patch.name;
        }
        if (patch.phone !== undefined) row.phone = patch.phone;
        if (patch.title !== undefined) row.title = patch.title || null;
        if (patch.bio !== undefined) row.bio = patch.bio || null;
        if (patch.address !== undefined) row.address = patch.address || null;
        if (patch.dateOfBirth !== undefined) row.date_of_birth = patch.dateOfBirth || null;
        if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl;
        const { data, error } = await supabase.from("profiles").update(row).eq("id", id).select("id");
        if (error) {
          return /column .* does not exist|schema cache/i.test(error.message)
            ? "Profile fields are not set up yet. Ask an administrator to apply the latest database migration."
            : error.message;
        }
        if (!data?.length) return "You do not have permission to edit this profile. Sign in again and retry.";
        const local: Partial<User> = {
          ...(patch.name !== undefined && { name: patch.name }),
          ...(patch.phone !== undefined && { phone: patch.phone }),
          ...(patch.title !== undefined && { title: patch.title || undefined }),
          ...(patch.bio !== undefined && { bio: patch.bio || undefined }),
          ...(patch.address !== undefined && { address: patch.address || undefined }),
          ...(patch.dateOfBirth !== undefined && { dateOfBirth: patch.dateOfBirth || undefined }),
          ...(patch.avatarUrl !== undefined && { avatarUrl: patch.avatarUrl || undefined }),
        };
        setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, ...local } : u)) }));
        return null;
      },
      setProgramImage: async (id, imageUrl) => {
        const { data, error } = await supabase
          .from("programs")
          .update({ image_url: imageUrl })
          .eq("id", id)
          .select("id");
        if (error) {
          return /column .* does not exist|schema cache/i.test(error.message)
            ? "Programme images are not set up yet. Ask an administrator to apply the latest database migration."
            : error.message;
        }
        if (!data?.length) return "You do not have permission to edit this programme.";
        setState((s) => ({
          ...s,
          programs: s.programs.map((p) => (p.id === id ? { ...p, imageUrl: imageUrl ?? undefined } : p)),
        }));
        return null;
      },
      approveApplicant: (id) =>
        patchUser(
          id,
          { status: "Active", note: "Approved by registrar" },
          (u) => ({ ...u, status: "Active", note: "Approved by registrar" }),
          "Approval",
        ),
      rejectApplicant: (id) =>
        patchUser(
          id,
          { status: "Suspended", note: "Application declined" },
          (u) => ({ ...u, status: "Suspended", note: "Application declined" }),
          "Application",
        ),
      toggleStudentStatus: (id) => {
        const user = state.users.find((u) => u.id === id);
        const status: User["status"] = user?.status === "Active" ? "Suspended" : "Active";
        patchUser(id, { status }, (u) => ({ ...u, status }), "Student status");
      },
      addProgram: (payload) => {
        const { modulesRaw, ...rest } = payload;
        const id = uid();
        const modules = modulesRaw
          .split(String.fromCharCode(10))
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [title, weeks, ...summary] = line.split("|").map((part) => part.trim());
            return {
              id: uid(),
              title: title || "Module",
              weeks: Number.parseInt(weeks ?? "2", 10) || 2,
              summary: summary.join(" | "),
            };
          });
        const program: Program = { ...rest, id, modules };
        setState((s) => ({ ...s, programs: [...s.programs, program] }));
        push(
          "Programme",
          supabase.from("programs").insert({
            id,
            title: program.title,
            category: program.category,
            duration_weeks: program.durationWeeks,
            tuition: program.tuition,
            certification: program.certification,
            description: program.description,
            entry_requirements: program.entryRequirements,
          }),
        );
        if (modules.length) {
          push(
            "Programme modules",
            supabase.from("program_modules").insert(
              modules.map((m, index) => ({
                id: m.id,
                program_id: id,
                title: m.title,
                weeks: m.weeks,
                summary: m.summary,
                position: index,
              })),
            ),
          );
        }
      },
      addCohort: (payload) => {
        const id = uid();
        const cohort: Cohort = { ...payload, id };
        setState((s) => ({ ...s, cohorts: [...s.cohorts, cohort] }));
        push(
          "Cohort",
          supabase.from("cohorts").insert({
            id,
            name: cohort.name,
            program_id: cohort.programId,
            teacher_id: cohort.teacherId || null,
            start_date: cohort.startDate,
            end_date: cohort.endDate,
            room: cohort.room,
          }),
        );
        if (cohort.studentIds.length) {
          push(
            "Enrolment",
            supabase.from("cohort_students").insert(
              cohort.studentIds.map((studentId) => ({ cohort_id: id, student_id: studentId })),
            ),
          );
        }
      },
      markAttendance: (cohortId, date, statuses) => {
        const rows = Object.entries(statuses).map(([studentId, status]) => ({
          id: uid(),
          cohortId,
          studentId,
          date,
          status,
        }));
        setState((s) => ({
          ...s,
          attendance: [
            ...s.attendance.filter((a) => !(a.cohortId === cohortId && a.date === date)),
            ...rows,
          ],
        }));
        push(
          "Attendance",
          (async () => {
            const cleared = await supabase
              .from("attendance")
              .delete()
              .eq("cohort_id", cohortId)
              .eq("attendance_date", date);
            if (cleared.error) return cleared;
            return await supabase.from("attendance").insert(
              rows.map((r) => ({
                id: r.id,
                cohort_id: cohortId,
                student_id: r.studentId,
                attendance_date: date,
                status: r.status,
              })),
            );
          })(),
        );
      },
      addAssignment: (payload) => {
        const id = uid();
        setState((s) => ({ ...s, assignments: [...s.assignments, { ...payload, id }] }));
        push(
          "Assignment",
          supabase.from("assignments").insert({
            id,
            cohort_id: payload.cohortId,
            title: payload.title,
            due_date: payload.dueDate,
            max_marks: payload.maxMarks,
            description: payload.description,
          }),
        );
      },
      gradeSubmission: (assignmentId, studentId, marks, feedback) => {
        const existing = state.submissions.find(
          (s) => s.assignmentId === assignmentId && s.studentId === studentId,
        );
        const patch = {
          marks,
          feedback,
          status: "Graded" as const,
          submittedAt: existing?.submittedAt ?? new Date().toISOString(),
        };
        setState((s) => ({
          ...s,
          submissions: existing
            ? s.submissions.map((sub) => (sub.id === existing.id ? { ...sub, ...patch } : sub))
            : [...s.submissions, { id: uid(), assignmentId, studentId, ...patch }],
        }));
        if (existing) {
          push(
            "Mark",
            supabase
              .from("submissions")
              .update({ marks, feedback, status: "Graded", submitted_at: patch.submittedAt })
              .eq("id", existing.id),
          );
          return;
        }
        push(
          "Mark",
          supabase.from("submissions").insert({
            id: uid(),
            assignment_id: assignmentId,
            student_id: studentId,
            marks,
            feedback,
            status: "Graded",
            submitted_at: patch.submittedAt,
          }),
        );
      },
      addFeeTransaction: (payload) => {
        const id = uid();
        setState((s) => ({ ...s, fees: [...s.fees, { ...payload, id }] }));
        push(
          "Payment",
          supabase.from("fee_transactions").insert({
            id,
            student_id: payload.studentId,
            category: payload.category,
            amount: payload.amount,
            transaction_date: payload.date,
            method: payload.method,
            reference: payload.reference,
          }),
        );
      },
      issueCertificate: (studentId, programId, honors) => {
        const certificate: Certificate = {
          id: uid(),
          studentId,
          programId,
          serial: `${state.settings.studentIdPrefix || "AOH"}-${new Date().getFullYear()}-${Math.random()
            .toString(36)
            .slice(2, 7)
            .toUpperCase()}`,
          issueDate: today(),
          honors,
          grade: "",
          status: "Valid",
        };
        setState((s) => ({ ...s, certificates: [...s.certificates, certificate] }));
        push(
          "Certificate",
          supabase.from("certificates").insert({
            id: certificate.id,
            student_id: studentId,
            program_id: programId,
            serial: certificate.serial,
            issue_date: certificate.issueDate,
            honors,
            grade: "",
            status: "Valid",
          }),
        );
        return certificate;
      },
      addAnnouncement: (payload) => {
        const id = uid();
        const date = today();
        setState((s) => ({ ...s, announcements: [{ ...payload, id, date }, ...s.announcements] }));
        push(
          "Announcement",
          supabase.from("announcements").insert({
            id,
            title: payload.title,
            body: payload.body,
            category: payload.category,
            published_date: date,
            author_id: currentUser?.id ?? null,
          }),
        );
      },
      updateSystemSettings: (patch) => {
        const settings = { ...state.settings, ...patch };
        setState((s) => ({ ...s, settings }));
        push(
          "Settings",
          supabase
            .from("system_settings")
            .upsert(settingsRow(settings, state.websiteSettings), { onConflict: "id" }),
        );
      },
      updateWebsiteSettings: (patch) => saveWebsite({ ...state.websiteSettings, ...patch }),
      addToWebsiteList: (key, item) => {
        const list = [...(state.websiteSettings[key] as { id: string }[]), item];
        saveWebsite({ ...state.websiteSettings, [key]: list } as unknown as WebsiteSettings);
      },
      updateInWebsiteList: (key, id, patch) => {
        const list = (state.websiteSettings[key] as { id: string }[]).map((entry) =>
          entry.id === id ? { ...entry, ...patch } : entry,
        );
        saveWebsite({ ...state.websiteSettings, [key]: list } as unknown as WebsiteSettings);
      },
      removeFromWebsiteList: (key, id) => {
        const list = (state.websiteSettings[key] as { id: string }[]).filter(
          (entry) => entry.id !== id,
        );
        saveWebsite({ ...state.websiteSettings, [key]: list } as unknown as WebsiteSettings);
      },
      moveInWebsiteList: (key, id, dir) => {
        const list = [...(state.websiteSettings[key] as { id: string }[])];
        const index = list.findIndex((entry) => entry.id === id);
        const target = index + dir;
        if (index < 0 || target < 0 || target >= list.length) return;
        [list[index], list[target]] = [list[target], list[index]];
        saveWebsite({ ...state.websiteSettings, [key]: list } as unknown as WebsiteSettings);
      },
      resetWebsiteSettings: () => {
        saveWebsite(defaultWebsiteSettings);
        toast.success("Website content restored to defaults.");
      },
      clearTransactionalData: () => {
        setState((s) => ({ ...s, attendance: [], submissions: [], fees: [], certificates: [] }));
        ["attendance", "submissions", "fee_transactions", "certificates"].forEach((table) =>
          push(
            `Clear ${table}`,
            supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000"),
          ),
        );
        toast.success("Transactional records cleared.");
      },
      importSystemData: (data) => {
        setState((s) => normalize({ ...s, ...data }));
        toast.success("Data imported locally. Review before publishing.");
      },
      resetDemoData: () => {
        setReloadKey((k) => k + 1);
        toast.success("Portal reloaded from the live database.");
      },
    };
    return value;
  }, [state, sessionUserId, activeUserId, loading, live, refresh]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}