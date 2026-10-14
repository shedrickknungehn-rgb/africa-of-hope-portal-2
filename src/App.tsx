import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { AlertTriangle, Clock } from "lucide-react";
import { AppProvider, useApp } from "./context/AppContext";
import { AuthProvider } from "@/auth/AuthProvider";
import type { User } from "./types";
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
import AuthPortal, { PasswordRecoveryDialog, type AuthTab } from "./components/AuthPortal";
import ProfilePage from "./components/ProfilePage";
import { Button } from "@/components/ui/button";

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

function Portal({ onExitToPublic, initialTab }: { onExitToPublic: () => void; initialTab: AuthTab }) {
  const { currentUser, logout } = useApp();
  const [view, setView] = useState("dashboard");

  useEffect(() => {
    setView("dashboard");
  }, [currentUser?.id]);

  if (!currentUser) return <AuthPortal onBackToSite={onExitToPublic} initialTab={initialTab} />;
  if (currentUser.role === "Student" && currentUser.status !== "Active") {
    return <PendingNotice user={currentUser} onSignOut={logout} />;
  }

  const group =
    currentUser.role === "Teacher" ? "teacher" : currentUser.role === "Student" ? "student" : "admin";

  let content: ReactNode;
  if (view === "profile") {
    content = <ProfilePage />;
  } else if (group === "admin") {
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
  const [authTab, setAuthTab] = useState<AuthTab>("signin");
  return (
    <>
      {site === "public" ? (
        <PublicMarketingSite
          onEnterPortal={(tab?: AuthTab) => {
            setAuthTab(tab ?? "signin");
            setSite("portal");
          }}
        />
      ) : (
        <Portal onExitToPublic={() => setSite("public")} initialTab={authTab} />
      )}
      <PasswordRecoveryDialog />
    </>
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