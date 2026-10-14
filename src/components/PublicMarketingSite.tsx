import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  GraduationCap, LogIn, Menu, X, Mail, Phone,
  MapPin, Sparkles, Globe, ChevronRight,
  Award, BookOpen, Clock3,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import type { AuthTab } from "./AuthPortal";
import HeroSlider from "./HeroSlider";
import { HOME_SECTION_REGISTRY } from "./home/registry";
import Marquee from "./animata/container/marquee";
import { programImage } from "@/lib/programImages";

const NAV_LINKS: [string, string][] = [
  ["#programs", "Programs"],
  ["#about", "About"],
  ["#impact", "Impact"],
  ["#verify", "Verify"],
  ["#admissions", "Admissions"],
];

function programDuration(weeks: number) {
  if (!weeks) return "Duration to be confirmed";
  return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
}

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

export default function PublicMarketingSite({ onEnterPortal }: { onEnterPortal: (tab?: AuthTab) => void }) {
  const { state } = useApp();
  const { settings, websiteSettings: w } = state;
  const saved = w.navLinks.length > 0 ? w.navLinks : NAV_LINKS.map(([href, label]) => ({ id: href, href, label }));
  const navLinks = saved.some((link) => /^#programs?$/i.test(link.href.trim()))
    ? saved
    : [{ id: "nav-programs", href: "#programs", label: "Programs" }, ...saved];
  const displayName = w.academyName || settings.academyName;
  const [menu, setMenu] = useState(false);
  const openApply = () => onEnterPortal("register");
  const openLogin = () => onEnterPortal("signin");

  const visibleSections = w.home.order.filter((key) => !w.home.hidden.includes(key));
  const announcements = state.announcements
    .filter((announcement) => {
      const isPublic = announcement.audience === "public";
      const isVisibleStatus = !announcement.status || announcement.status === "published" || (
        announcement.status === "scheduled"
        && !!announcement.scheduledAt
        && new Date(announcement.scheduledAt).getTime() <= Date.now()
      );
      const isCurrent = !announcement.expiresAt || new Date(announcement.expiresAt).getTime() > Date.now();
      return isPublic && isVisibleStatus && isCurrent && (announcement.title.trim() || announcement.body.trim());
    })
    .map((announcement) => `${announcement.title}${announcement.body ? ` — ${announcement.body}` : ""}`);
  const bannerItems = announcements.length > 0
    ? announcements
    : w.announcementText.trim() ? [w.announcementText.trim()] : [];

  // The section is rendered by React, so restore a #programs deep-link once it
  // exists in the document instead of relying on the browser's initial lookup.
  useEffect(() => {
    if (window.location.hash === "#programs") {
      document.getElementById("programs")?.scrollIntoView();
    }
  }, []);

  return (
    <div id="top" className="min-h-[100dvh] scroll-smooth bg-[#f6f8f7] text-slate-900">
      {w.announcementEnabled && bannerItems.length > 0 && (
        <div className="overflow-hidden bg-amber-400 text-emerald-950" role="region" aria-label="Announcements">
          <div className="sr-only" aria-live="polite">
            {bannerItems.join(". ")}
          </div>
          <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2" aria-hidden="true">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <Marquee
              repeat={2}
              pauseOnHover
              applyMask={false}
              className="min-w-0 overflow-hidden p-0 text-xs font-medium [--duration:32s] [--gap:3rem]"
            >
              {bannerItems.map((item, index) => (
                <span key={`${item}-${index}`} className="whitespace-nowrap">
                  {item}
                </span>
              ))}
            </Marquee>
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
            {w.header.showApply && (
              <Button onClick={openApply} variant="ghost" className="hidden h-10 text-emerald-100 hover:bg-white/10 hover:text-white sm:inline-flex">
                {w.header.applyText || "Apply online"}
              </Button>
            )}
            <Button onClick={openLogin} className="h-10 bg-amber-400 text-emerald-950 hover:bg-amber-300">
              <LogIn className="mr-1.5 h-4 w-4" /> {w.header.loginText || "Portal login"}
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
                {w.header.showApply && (
                  <button
                    type="button"
                    onClick={() => { setMenu(false); openApply(); }}
                    className="mt-3 rounded-xl bg-amber-400 px-3 py-3 text-sm font-semibold text-emerald-950"
                  >
                    {w.header.applyText || "Apply online"}
                  </button>
                )}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <HeroSlider onOpenApply={openApply} onEnterPortal={openLogin} />

      <section id="programs" className="scroll-mt-20 border-y border-emerald-900/10 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Explore our programmes</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">Build practical skills for the work ahead.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
              Choose from our current catalogue of certificate programmes and start your application online.
            </p>
          </div>

          {state.programs.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {state.programs.map((program) => (
                <article key={program.id} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-900/10 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <img
                    src={programImage(program)}
                    alt=""
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">{program.category || "Certificate programme"}</p>
                      <BookOpen className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-emerald-950">{program.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{program.description || "Programme details will be available soon."}</p>
                    <dl className="mt-5 space-y-2 border-t border-emerald-900/10 pt-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                        <dt className="sr-only">Duration</dt>
                        <dd>{programDuration(program.durationWeeks)}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                        <dt className="sr-only">Certification</dt>
                        <dd>{program.certification || "Certificate on completion"}</dd>
                      </div>
                    </dl>
                    <Button onClick={openApply} className="mt-5 w-full bg-emerald-800 text-white hover:bg-emerald-700">
                      Apply for this programme <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-emerald-900/20 bg-emerald-50/60 p-8 text-center">
              <BookOpen className="mx-auto h-6 w-6 text-emerald-700" aria-hidden="true" />
              <p className="mt-3 font-medium text-emerald-950">Our current programme catalogue is being updated.</p>
              <p className="mt-1 text-sm text-slate-600">Please check back soon or apply online to speak with admissions.</p>
              <Button onClick={openApply} variant="outline" className="mt-5 border-emerald-800 text-emerald-800 hover:bg-emerald-100">
                Apply online
              </Button>
            </div>
          )}
        </div>
      </section>

      {visibleSections.map((key) => {
        const Section = HOME_SECTION_REGISTRY[key];
        return (
          <Section
            key={key}
            copy={w.home.sections[key] ?? {}}
            w={w}
            settings={settings}
            onApply={openApply}
            onLogin={openLogin}
          />
        );
      })}

      <footer className="border-t border-emerald-900/10 bg-white">
        <div className="border-b border-emerald-900/10 bg-emerald-950 text-white">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
            <p className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" /> {w.address || settings.address}
            </p>
            <p className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 shrink-0 text-amber-400" /> {w.contactPhone || settings.contactPhone}
            </p>
            {(w.contactEmail || settings.contactEmail) && (
              <p className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-amber-400" /> {w.contactEmail || settings.contactEmail}
              </p>
            )}
            {w.officeHours && (
              <p className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 shrink-0 text-amber-400" /> {w.officeHours}
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <Crest logoUrl={w.logoUrl} />
              <div className="leading-tight">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-900">{displayName}</p>
                <p className="text-[11px] text-slate-500">{w.tagline || settings.motto}</p>
              </div>
            </div>
            {w.footerAbout && <p className="mt-5 text-sm text-slate-600">{w.footerAbout}</p>}
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
                <button type="button" onClick={openLogin} className="inline-flex items-center gap-1.5 transition hover:text-emerald-800">
                  <ChevronRight className="h-3.5 w-3.5" /> Portal login
                </button>
              </li>
              <li>
                <a href="#verify" className="inline-flex items-center gap-1.5 transition hover:text-emerald-800">
                  <ChevronRight className="h-3.5 w-3.5" /> Verify a certificate
                </a>
              </li>
              {w.footerLinks.map((l) => (
                <li key={l.id}>
                  <a href={l.href || "#"} className="inline-flex items-center gap-1.5 transition hover:text-emerald-800">
                    <ChevronRight className="h-3.5 w-3.5" /> {l.label}
                  </a>
                </li>
              ))}
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

    </div>
  );
}
