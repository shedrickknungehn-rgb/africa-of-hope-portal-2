import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Toaster, toast } from "sonner";
import {
  GraduationCap, ShieldCheck, LogIn, UserPlus, KeyRound, Mail, Lock,
  CheckCircle2, AlertTriangle, Clock, ArrowRight, ArrowLeft, type LucideIcon,
} from "lucide-react";
import { AppProvider, useApp } from "./context/AppContext";
import { AuthProvider } from "@/auth/AuthProvider";
import type { Role, User } from "./types";
import Navigation from "./components/Navigation";
import {
  AdminDashboard, StudentDirectory, ProgramBuilder, CohortCoordinator,
  TeacherDashboard, AttendanceSheet, Gradebook,
} from "./components/AdminTeacherViews";
import {
  StudentPortal, StudentAssignments, FeeRegister, AnnouncementBoard,
} from "./components/StudentFinancialViews";
import { CertificateStudio, VerificationPortal } from "./components/CertificateVerification";
import AdminSystemSettings from "./components/AdminSystemSettings";
import AdminWebsiteSettings from "./components/AdminWebsiteSettings";
import PublicMarketingSite from "./components/PublicMarketingSite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const PRIMARY = "bg-emerald-700 hover:bg-emerald-800";
const TAB = "data-[state=active]:bg-emerald-800 data-[state=active]:text-white";

function CrestMark({ size = 44 }: { size?: number }) {
  return (
    <span
      className="relative grid place-items-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-950 ring-1 ring-amber-400/60"
      style={{ width: size, height: size }}
    >
      <GraduationCap className="text-amber-400" style={{ width: size * 0.5, height: size * 0.5 }} />
    </span>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={Icon ? "pl-9" : undefined}
        />
      </div>
    </div>
  );
}

function AuthPortal({ onBackToSite }: { onBackToSite?: () => void }) {
  const { state, login, registerStudent } = useApp();
  const [tab, setTab] = useState("signin");
  const [signin, setSignin] = useState({ email: "", password: "" });
  const [reg, setReg] = useState({
    name: "", email: "", phone: "", note: "", documents: "", programIds: [] as string[],
  });
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [stage, setStage] = useState(0);
  const [resetEmail, setResetEmail] = useState("");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState({ a: "", b: "" });

  const demos = useMemo(() => {
    const want: Role[] = ["Super Admin", "School Admin", "Teacher", "Student"];
    return want
      .map((r) => state.users.find((u) => u.role === r && u.status === "Active"))
      .filter((u): u is User => Boolean(u));
  }, [state.users]);

  const submitSignIn = () => {
    const email = signin.email.trim().toLowerCase();
    if (!email || !signin.password) {
      toast.error("Enter your email address and portal password");
      return;
    }
    const user = state.users.find((u) => u.email.toLowerCase() === email);
    if (user?.status === "Pending Approval") {
      toast.error("Your registration is awaiting administrator approval");
      return;
    }
    if (user?.status === "Suspended") {
      toast.error("This account is suspended. Please contact the registrar.");
      return;
    }
    login(email, signin.password);
    setSignin({ email, password: "" });
  };

  const submitRegister = () => {
    if (!state.settings.selfRegistrationOpen) {
      toast.error("Self-registration is currently closed");
      return;
    }
    if (!reg.name.trim() || !reg.email.trim() || !reg.phone.trim()) {
      toast.error("Full name, email and phone number are required");
      return;
    }
    if (reg.programIds.length === 0) {
      toast.error("Select at least one programme of interest");
      return;
    }
    registerStudent({
      name: reg.name.trim(),
      email: reg.email.trim(),
      phone: reg.phone.trim(),
      programIds: reg.programIds,
      note: reg.note.trim(),
      documents: reg.documents.trim(),
    });
    toast.success("Application submitted. The registrar will review it shortly.");
    setSignin({ email: reg.email.trim(), password: "" });
    setReg({ name: "", email: "", phone: "", note: "", documents: "", programIds: [] });
    setTab("signin");
  };

  const toggleProgram = (id: string) =>
    setReg((r) => ({
      ...r,
      programIds: r.programIds.includes(id)
        ? r.programIds.filter((p) => p !== id)
        : [...r.programIds, id],
    }));

  const stats = [
    { label: "Programmes", value: state.programs.length },
    { label: "Active students", value: state.users.filter((u) => u.role === "Student" && u.status === "Active").length },
    { label: "Certificates", value: state.certificates.length },
  ];

  return (
    <div className="grid min-h-[100dvh] bg-[#f6f8f7] lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-900 to-emerald-950 p-10 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <CrestMark />
          <div className="leading-tight">
            <p className="text-sm font-bold uppercase tracking-[0.2em]">Africa of Hope</p>
            <p className="text-[11px] text-emerald-200">Institutional Training Academy</p>
          </div>
        </div>
        <div className="relative mt-auto">
          <h1 className="text-3xl font-semibold leading-tight">
            Certificates that open doors.
            <br />
            <span className="text-amber-400">Skills that build communities.</span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-emerald-100/90">
            One secure portal for enrolment, curriculum delivery, grading, finance tracking and verifiable certification.
          </p>
          <div className="mt-7 grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                <p className="text-2xl font-semibold text-amber-400">{s.value}</p>
                <p className="mt-0.5 text-[11px] text-emerald-100/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {onBackToSite && (
            <button
              type="button"
              onClick={onBackToSite}
              className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-emerald-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to public website
            </button>
          )}
          <div className="mb-5 flex items-center gap-3 lg:hidden">
            <CrestMark size={38} />
            <div className="leading-tight">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-900">Africa of Hope</p>
              <p className="text-[11px] text-slate-500">Institutional Training Academy</p>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-900/10 bg-white p-5 shadow-sm shadow-emerald-900/5 sm:p-6">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2 bg-emerald-50">
                <TabsTrigger value="signin" className={TAB}>Sign in</TabsTrigger>
                <TabsTrigger value="register" className={TAB} disabled={!state.settings.selfRegistrationOpen}>
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-5 space-y-3">
                <Field
                  label="Email address"
                  icon={Mail}
                  value={signin.email}
                  onChange={(v) => setSignin({ ...signin, email: v })}
                  placeholder="you@africaofhope.org"
                />
                <Field
                  label="Password"
                  icon={Lock}
                  type="password"
                  value={signin.password}
                  onChange={(v) => setSignin({ ...signin, password: v })}
                  placeholder="Your portal password"
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => { setResetOpen(true); setStage(0); setResetEmail(signin.email); }}
                    className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyOpen(true)}
                    className="text-xs font-medium text-slate-500 hover:text-emerald-800"
                  >
                    Verify a certificate
                  </button>
                </div>
                <Button onClick={submitSignIn} className={`w-full ${PRIMARY}`}>
                  <LogIn className="mr-1.5 h-4 w-4" /> Sign in to portal
                </Button>

                <div className="rounded-2xl border border-dashed border-emerald-900/15 bg-emerald-50/50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                    Role quick-switch
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {demos.length === 0 && (
                      <p className="col-span-2 text-[11px] text-slate-500">
                        No portal accounts loaded yet. Sign in with the email and password created for you.
                      </p>
                    )}
                    {demos.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => { login(u.id); toast.success(`Signed in as ${u.role}`); }}
                        className="rounded-xl border border-emerald-900/10 bg-white px-2.5 py-2 text-left transition hover:border-emerald-600 hover:bg-emerald-50"
                      >
                        <span className="block text-[11px] font-semibold text-emerald-900">{u.role}</span>
                        <span className="block truncate text-[11px] text-slate-500">{u.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="register" className="mt-5 space-y-3">
                <p className="text-[11px] font-medium text-amber-800">
                  {state.settings.selfRegistrationOpen
                    ? "Applications are reviewed by the registrar before access."
                    : "Self-registration is currently closed. Please contact the admissions office."}
                </p>
                <Field label="Full name" value={reg.name} onChange={(v) => setReg({ ...reg, name: v })} placeholder="Amina Diallo" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Email" value={reg.email} onChange={(v) => setReg({ ...reg, email: v })} placeholder="amina@mail.com" />
                  <Field label="Phone" value={reg.phone} onChange={(v) => setReg({ ...reg, phone: v })} placeholder="+234 800 000 0000" />
                </div>
                <div className="space-y-1.5">
                  <Label>Programmes of interest</Label>
                  <div className="max-h-40 space-y-1.5 overflow-auto rounded-xl border border-slate-200 p-2.5">
                    {state.programs.map((p) => (
                      <label key={p.id} className="flex cursor-pointer items-start gap-2.5 rounded-lg p-1.5 hover:bg-emerald-50">
                        <Checkbox
                          checked={reg.programIds.includes(p.id)}
                          onCheckedChange={() => toggleProgram(p.id)}
                          className="mt-0.5"
                        />
                        <span>
                          <span className="block text-xs font-medium text-slate-800">{p.title}</span>
                          <span className="block text-[11px] text-slate-500">
                            {p.category} / {p.durationWeeks} weeks
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <Field label="Supporting documents" value={reg.documents} onChange={(v) => setReg({ ...reg, documents: v })} placeholder="ID card, transcripts" />
                <div className="space-y-1.5">
                  <Label>Motivation note</Label>
                  <Textarea
                    rows={3}
                    value={reg.note}
                    onChange={(e) => setReg({ ...reg, note: e.target.value })}
                    placeholder="Tell us why you want to join this programme"
                  />
                </div>
                <Button onClick={submitRegister} className={`w-full ${PRIMARY}`}>
                  <UserPlus className="mr-1.5 h-4 w-4" /> Submit application
                </Button>
              </TabsContent>
            </Tabs>
          </div>

        </div>
      </div>

      <Dialog open={resetOpen} onOpenChange={(o) => { setResetOpen(o); if (!o) setStage(0); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
          </DialogHeader>
          {stage === 0 && (
            <Field label="Registered email" icon={Mail} value={resetEmail} onChange={setResetEmail} placeholder="you@africaofhope.org" />
          )}
          {stage === 1 && (
            <Field label="Verification code" value={code} onChange={setCode} placeholder="6-digit code" />
          )}
          {stage === 2 && (
            <>
              <Field label="New password" type="password" value={pw.a} onChange={(v) => setPw({ ...pw, a: v })} placeholder="At least 8 characters" />
              <Field label="Confirm password" type="password" value={pw.b} onChange={(v) => setPw({ ...pw, b: v })} placeholder="Repeat password" />
            </>
          )}
          <p className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600">
            {stage === 0
              ? "We will send a six-digit verification code to your registered address."
              : stage === 1
                ? "Enter the six-digit reset code sent to your email."
                : "Choose a strong password of at least eight characters."}
          </p>
          <DialogFooter>
            {stage > 0 && stage < 2 && (
              <Button variant="outline" onClick={() => setStage(stage - 1)}>Back</Button>
            )}
            {stage === 0 && (
              <Button
                className={PRIMARY}
                onClick={() => {
                  if (!resetEmail.trim()) { toast.error("Enter your registered email"); return; }
                  toast.success("Verification code sent");
                  setStage(1);
                }}
              >
                <KeyRound className="mr-1.5 h-4 w-4" /> Send code
              </Button>
            )}
            {stage === 1 && (
              <Button
                className={PRIMARY}
                onClick={() => {
                  if (code.trim().length < 4) { toast.error("Enter the verification code"); return; }
                  setStage(2);
                }}
              >
                Verify code <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            )}
            {stage === 2 && (
              <Button
                className={PRIMARY}
                onClick={() => {
                  if (pw.a.length < 8) { toast.error("Password must be at least 8 characters"); return; }
                  if (pw.a !== pw.b) { toast.error("Passwords do not match"); return; }
                  toast.success("Password updated. You can now sign in.");
                  setResetOpen(false);
                  setStage(0);
                  setPw({ a: "", b: "" });
                }}
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Update password
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-700" /> Public certificate verification
            </DialogTitle>
            <DialogDescription>No account required to confirm a credential.</DialogDescription>
          </DialogHeader>
          <VerificationPortal />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PendingNotice({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const declined = user.status === "Suspended";
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-[#f6f8f7] p-6">
      <div className="w-full max-w-md rounded-3xl border border-emerald-900/10 bg-white p-8 text-center shadow-sm">
        <span className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${declined ? "bg-rose-100" : "bg-amber-100"}`}>
          {declined
            ? <AlertTriangle className="h-6 w-6 text-rose-600" />
            : <Clock className="h-6 w-6 text-amber-600" />}
        </span>
        <h1 className="mt-4 text-lg font-semibold text-slate-900">
          {declined ? "Application not approved" : "Application under review"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {declined
            ? `Hello ${user.name}, your enrolment request was declined. Please contact the registrar for guidance.`
            : `Hello ${user.name}, your registration sits in the administrator approval queue. Portal access unlocks once the registrar approves your file.`}
        </p>
        <Button variant="outline" className="mt-5" onClick={onSignOut}>Sign out</Button>
      </div>
    </div>
  );
}

function Portal({ onExitToPublic }: { onExitToPublic: () => void }) {
  const { currentUser, logout } = useApp();
  const [view, setView] = useState("dashboard");

  useEffect(() => {
    setView("dashboard");
  }, [currentUser?.id]);

  if (!currentUser) return <AuthPortal onBackToSite={onExitToPublic} />;
  if (currentUser.role === "Student" && currentUser.status !== "Active") {
    return <PendingNotice user={currentUser} onSignOut={logout} />;
  }

  const group =
    currentUser.role === "Teacher" ? "teacher" : currentUser.role === "Student" ? "student" : "admin";

  let content: ReactNode;
  if (group === "admin") {
    content =
      view === "students" ? <StudentDirectory /> :
      view === "programs" ? <ProgramBuilder /> :
      view === "cohorts" ? <CohortCoordinator /> :
      view === "fees" ? <FeeRegister /> :
      view === "certificates" ? <CertificateStudio /> :
      view === "verification" ? <VerificationPortal /> :
      view === "announcements" ? <AnnouncementBoard /> :
      view === "website" ? <AdminWebsiteSettings /> :
      view === "settings" ? <AdminSystemSettings /> :
      <AdminDashboard />;
  } else if (group === "teacher") {
    content =
      view === "attendance" ? <AttendanceSheet /> :
      view === "assignments" ? <Gradebook /> :
      view === "announcements" ? <AnnouncementBoard /> :
      <TeacherDashboard />;
  } else {
    content =
      view === "assignments" ? <StudentAssignments /> :
      view === "fees" ? <FeeRegister /> :
      view === "certificates" ? <CertificateStudio /> :
      view === "verification" ? <VerificationPortal /> :
      view === "announcements" ? <AnnouncementBoard /> :
      <StudentPortal />;
  }

  return (
    <Navigation view={view} onNavigate={setView} onExitToPublic={onExitToPublic}>
      {content}
    </Navigation>
  );
}

function Shell() {
  const [site, setSite] = useState<"public" | "portal">("public");
  return site === "public" ? (
    <PublicMarketingSite onEnterPortal={() => setSite("portal")} />
  ) : (
    <Portal onExitToPublic={() => setSite("public")} />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Toaster position="top-right" richColors closeButton />
        <Shell />
      </AppProvider>
    </AuthProvider>
  );
}