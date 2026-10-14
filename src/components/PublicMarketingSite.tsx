import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  GraduationCap, LogIn, Menu, X, Mail, Phone,
  MapPin, Sparkles, Globe, CheckCircle2, ChevronRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Program } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Reveal } from "./Navigation";
import HeroSlider from "./HeroSlider";
import {
  AboutSection, AdmissionsFaqSection, ImpactSection, ProgramsSection, VerificationSection,
} from "./MarketingSections";

const NAV_LINKS: [string, string][] = [
  ["#programs", "Programmes"],
  ["#about", "About"],
  ["#impact", "Impact"],
  ["#verify", "Verify"],
  ["#admissions", "Admissions"],
];



function Crest({ logoUrl }: { logoUrl?: string }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="Logo"
        className="h-10 w-10 shrink-0 rounded-2xl object-cover ring-1 ring-amber-400/60"
      />
    );
  }
  return (
    <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-950 ring-1 ring-amber-400/60">
      <GraduationCap className="h-5 w-5 text-amber-400" />
      <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-amber-400 text-[8px] font-bold text-emerald-950">
        H
      </span>
    </span>
  );
}

export default function PublicMarketingSite({ onEnterPortal }: { onEnterPortal: () => void }) {
  const { state, registerStudent } = useApp();
  const { settings, programs, websiteSettings: w } = state;
  const navLinks =
    w.navLinks.length > 0
      ? w.navLinks
      : NAV_LINKS.map(([href, label]) => ({ id: href, href, label }));
  const displayName = w.academyName || settings.academyName;
  const [menu, setMenu] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyProgram, setApplyProgram] = useState<Program | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", note: "" });

  const featured = useMemo(() => {
    const ids = settings.featuredProgramIds ?? [];
    const picked = ids
      .map((id) => programs.find((p) => p.id === id))
      .filter((p): p is Program => Boolean(p));
    return picked.length > 0 ? picked : programs;
  }, [programs, settings.featuredProgramIds]);

  const openApply = (program?: Program) => {
    const chosen = program ?? featured[0] ?? null;
    setApplyProgram(chosen);
    setForm({ name: "", email: "", phone: "", note: "" });
    setApplyOpen(true);
  };

  const submitApply = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Full name, email and phone number are required");
      return;
    }
    if (!applyProgram) {
      toast.error("Select the programme you want to join");
      return;
    }
    registerStudent({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      programIds: [applyProgram.id],
      note: form.note.trim(),
      documents: "",
    });
    toast.success("Application received. The registrar will contact you shortly.");
    setApplyOpen(false);
    onEnterPortal();
  };

  return (
    <div id="top" className="min-h-[100dvh] scroll-smooth bg-[#f6f8f7] text-slate-900">
      {w.announcementEnabled && w.announcementText && (
        <div className="bg-amber-400 text-emerald-950">
          <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{w.announcementText}</span>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-emerald-950/90 text-white backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Crest logoUrl={w.logoUrl} />
          <div className="leading-tight">
            <p className="text-sm font-bold uppercase tracking-[0.18em]">{displayName}</p>
            <p className="hidden text-[11px] text-emerald-200/90 sm:block">{w.tagline || "Institutional Training Academy"}</p>
          </div>
          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <a
                key={l.id}
                href={l.href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-emerald-100/90 transition hover:bg-white/10 hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-2">
            <Button onClick={onEnterPortal} className="h-10 bg-amber-400 text-emerald-950 hover:bg-amber-300">
              <LogIn className="mr-1.5 h-4 w-4" /> Portal login
            </Button>
            <button
              type="button"
              onClick={() => setMenu(true)}
              aria-label="Open menu"
              className="grid h-10 w-10 place-items-center rounded-xl text-emerald-100 hover:bg-white/10 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-slate-950/60" onClick={() => setMenu(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="absolute right-0 top-0 h-full w-72 bg-emerald-950 p-4 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-widest">Menu</span>
                <button
                  type="button"
                  onClick={() => setMenu(false)}
                  aria-label="Close menu"
                  className="rounded-lg p-1.5 hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-6 flex flex-col gap-1">
                {navLinks.map((l) => (
                  <a
                    key={l.id}
                    href={l.href}
                    onClick={() => setMenu(false)}
                    className="rounded-xl px-3 py-3 text-sm font-medium text-emerald-100 transition hover:bg-white/10"
                  >
                    {l.label}
                  </a>
                ))}
                <button
                  type="button"
                  onClick={() => { setMenu(false); openApply(); }}
                  className="mt-3 rounded-xl bg-amber-400 px-3 py-3 text-sm font-semibold text-emerald-950"
                >
                  Apply online
                </button>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <HeroSlider onOpenApply={() => openApply()} onEnterPortal={onEnterPortal} />

      <ProgramsSection programs={programs} featuredIds={settings.featuredProgramIds} onApply={openApply} />
      <AboutSection settings={settings} />
      <ImpactSection />
      <VerificationSection />
      <AdmissionsFaqSection settings={settings} onApply={openApply} />

      <footer className="border-t border-emerald-900/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <Crest logoUrl={w.logoUrl} />
              <div className="leading-tight">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-900">{displayName}</p>
                <p className="text-[11px] text-slate-500">{w.tagline || settings.motto}</p>
              </div>
            </div>
            <div className="mt-5 space-y-2 text-sm text-slate-600">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /> {w.address || settings.address}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-emerald-700" /> {w.contactPhone || settings.contactPhone}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-emerald-700" /> {w.contactEmail || settings.contactEmail}
              </p>
              {w.officeHours && (
                <p className="flex items-center gap-2">
                  <Globe className="h-4 w-4 shrink-0 text-emerald-700" /> {w.officeHours}
                </p>
              )}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Explore</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <a href={l.href} className="transition hover:text-emerald-800">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Get started</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <button type="button" onClick={() => openApply()} className="inline-flex items-center gap-1.5 transition hover:text-emerald-800">
                  <ChevronRight className="h-3.5 w-3.5" /> Apply online
                </button>
              </li>
              <li>
                <button type="button" onClick={onEnterPortal} className="inline-flex items-center gap-1.5 transition hover:text-emerald-800">
                  <ChevronRight className="h-3.5 w-3.5" /> Portal login
                </button>
              </li>
              <li>
                <a href="#verify" className="inline-flex items-center gap-1.5 transition hover:text-emerald-800">
                  <ChevronRight className="h-3.5 w-3.5" /> Verify a certificate
                </a>
              </li>
            </ul>
          </div>
        </div>
        {w.socials.length > 0 && (
          <div className="border-t border-emerald-900/10">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-4">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Follow</span>
              {w.socials.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 transition hover:bg-emerald-100"
                >
                  {s.platform}
                </a>
              ))}
            </div>
          </div>
        )}
        <div className="border-t border-emerald-900/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-[11px] text-slate-500">
            <p>
              {w.footerCopyright || `© ${new Date().getFullYear()} ${displayName}. Accreditation ${settings.accreditationNo}.`}
            </p>
            <p className="inline-flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-emerald-700" /> {settings.academicYear} / {settings.semester}
            </p>
          </div>
        </div>
      </footer>

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply for admission</DialogTitle>
            <DialogDescription>
              Submit your details and the registrar will review your application for the {settings.academicYear} intake.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="apply-program">Programme</Label>
              <select
                id="apply-program"
                value={applyProgram?.id ?? ""}
                onChange={(e) => setApplyProgram(programs.find((p) => p.id === e.target.value) ?? null)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
              >
                <option value="">Select a programme</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apply-name">Full name</Label>
              <Input id="apply-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Blessing Okafor" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="apply-email">Email</Label>
                <Input id="apply-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="apply-phone">Phone</Label>
                <Input id="apply-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234 800 000 0000" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apply-note">Why this programme?</Label>
              <Textarea
                id="apply-note"
                rows={3}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Share your motivation and availability"
              />
            </div>
            <p className="rounded-xl bg-emerald-50 p-3 text-[11px] text-emerald-900">
              Applications are free. Selected candidates are invited to enrol at the registrar desk before the first lesson.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button>
            <Button onClick={submitApply} className="bg-emerald-700 hover:bg-emerald-800">
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Submit application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}