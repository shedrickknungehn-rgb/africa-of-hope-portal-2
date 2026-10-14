import { useState } from "react";
import {
  ArrowRight, Award, BadgeCheck, Briefcase, CalendarCheck, Clock,
  Handshake, Search, ShieldCheck, Star, Target, TrendingUp, Users, XCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import type { SystemSettings } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Reveal, SectionHeader } from "./Navigation";

const WORKBENCH_IMG =
  "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/generated-images/da27f14e-5252-4f4b-a327-6425a57f1e62/instructor-workbench-94a65568-1791250704601.webp";
const GRADUATE_IMG =
  "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/generated-images/da27f14e-5252-4f4b-a327-6425a57f1e62/graduate-portrait-692a8c54-1791250703262.webp";

const MISSION_POINTS: [typeof Target, string, string][] = [
  [Target, "Cohort-based learning", "Small groups led by practising instructors, from week one to certification."],
  [Award, "Accredited certification", "Every graduate earns a serialised certificate that employers can verify online."],
  [Handshake, "Industry placement", "Partner employers review top performers for internships and junior roles."],
];

const TESTIMONIALS: [string, string, string][] = [
  ["Amara N.", "Software Engineering / Full Stack Web Development", "I joined with no coding background. Six months later I was shipping features for a fintech team in Lagos."],
  ["Yusuf K.", "Cloud Computing & DevOps", "The labs were real servers, real tickets. My certificate was verified by my employer in seconds."],
  ["Chiamaka O.", "UI/UX Product Design & Digital Graphics", "The portfolio I built here won my first three freelance contracts before I even graduated."],
];

const PARTNERS = ["Lagos Tech Hub", "Savannah Energy", "Nimbus Cloud", "Kano Health Trust", "Umoja Bank", "Accra Digital Works"];

export function AboutSection({ settings }: { settings: SystemSettings }) {
  const { state } = useApp();
  const academyName = state.websiteSettings.academyName || settings.academyName;
  return (
    <section id="about" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2">
        <Reveal>
          <div className="relative">
            <img
              src={WORKBENCH_IMG}
              alt="Instructor guiding students at a workbench"
              className="h-72 w-full rounded-3xl object-cover shadow-lg shadow-emerald-900/10 sm:h-96"
            />
            <div className="absolute -bottom-5 left-5 rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-md">
              <p className="text-2xl font-semibold text-emerald-800">18</p>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Partner employers</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[11px] font-semibold text-emerald-900">
            <ShieldCheck className="h-3.5 w-3.5" /> Our mission
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            African excellence, delivered as practical skill.
          </h2>
          <p className="mt-4 text-sm text-slate-600 sm:text-base">
            {academyName} exists to close the distance between classroom learning and real work. We teach in
            cohorts, grade transparently, keep fees auditable, and issue certificates that any employer can verify
            online in seconds.
          </p>
          <div className="mt-7 space-y-4">
            {MISSION_POINTS.map(([Icon, title, body]) => (
              <div key={title} className="flex gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-amber-300">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{title}</p>
                  <p className="text-sm text-slate-500">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function ImpactSection() {
  const { state } = useApp();
  const w = state.websiteSettings;
  const graduates = state.users.filter((u) => u.role === "Student").length;
  const testimonials = w.testimonials.length
    ? w.testimonials
    : TESTIMONIALS.map(([name, program, quote]) => ({ name, program, quote }));

  return (
    <section id="impact" className="scroll-mt-24 bg-emerald-950 py-16 text-white sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Student success and impact</h2>
              <p className="mt-1.5 text-sm text-emerald-100/80">
                Learners enrolled in the portal right now: {graduates}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold ring-1 ring-white/15">
              <TrendingUp className="h-3.5 w-3.5 text-amber-400" /> 96% completion rate
            </span>
          </div>
        </Reveal>

        {w.stats.length > 0 && (
          <Reveal delay={0.05}>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {w.stats.map((s) => (
                <div key={s.id} className="rounded-2xl bg-white/5 p-4 text-center ring-1 ring-white/10">
                  <p className="text-2xl font-semibold text-amber-400">{s.value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-emerald-100/70">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {testimonials.map((t, i) => (
              <Reveal key={`${t.name}-${i}`} delay={i * 0.06} className="h-full">
                <figure className="flex h-full flex-col rounded-2xl bg-white/10 p-5 ring-1 ring-white/10 backdrop-blur-sm">
                  <div className="flex gap-0.5 text-amber-400">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <blockquote className="mt-3 flex-1 text-sm text-emerald-50/90">{t.quote}</blockquote>
                  <figcaption className="mt-4 border-t border-white/10 pt-3">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-[11px] text-emerald-200/80">{t.program}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.12}>
            <div className="relative h-full overflow-hidden rounded-3xl ring-1 ring-white/10">
              <img src={GRADUATE_IMG} alt="Graduate holding a certificate" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-950 to-transparent p-5">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-400">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verifiable credential
                </p>
                <p className="mt-1 text-sm text-white">
                  Every certificate carries a unique serial that employers can confirm instantly.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-emerald-200/80">
              <Briefcase className="h-3.5 w-3.5" /> Industry partners
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {PARTNERS.map((p) => (
                <span key={p} className="rounded-xl bg-white/10 px-3.5 py-2 text-xs font-medium text-emerald-50 ring-1 ring-white/10">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function VerificationSection() {
  const { state } = useApp();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<null | { ok: boolean; title: string; meta: string }>(null);

  const verify = () => {
    const q = code.trim().toLowerCase();
    if (!q) {
      toast.error("Enter a certificate serial number");
      return;
    }
    const cert = state.certificates.find((c) => c.serial.toLowerCase() === q);
    if (!cert) {
      setResult({
        ok: false,
        title: "No certificate matches that serial",
        meta: "Check the code and try again, or contact the registrar for assistance.",
      });
      toast.error("Certificate not found");
      return;
    }
    const owner = state.users.find((u) => u.id === cert.studentId);
    const program = state.programs.find((p) => p.id === cert.programId);
    setResult({
      ok: true,
      title: owner?.name ?? "Verified graduate",
      meta: `${program?.title ?? "Certificate programme"} / grade ${cert.grade} / issued ${cert.issueDate} / status ${cert.status}`,
    });
    toast.success("Certificate verified");
  };

  return (
    <section id="verify" className="scroll-mt-24 bg-[#f6f8f7] py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4">
        <Reveal>
          <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm shadow-emerald-900/5 sm:p-8">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[11px] font-semibold text-emerald-900">
              <ShieldCheck className="h-3.5 w-3.5" /> Public verification
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Verify a certificate in seconds
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Enter the serial number printed on an {state.settings.academyName} certificate. No account is required.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") verify(); }}
                  placeholder="e.g. AOH-2025-000123"
                  className="pl-9"
                  aria-label="Certificate serial number"
                />
              </div>
              <Button onClick={verify} className="bg-emerald-700 hover:bg-emerald-800 sm:w-40">
                Verify certificate
              </Button>
            </div>

            {result && (
              <div
                className={
                  result.ok
                    ? "mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
                    : "mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4"
                }
              >
                {result.ok ? (
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                )}
                <div>
                  <p className={result.ok ? "text-sm font-semibold text-emerald-900" : "text-sm font-semibold text-rose-800"}>
                    {result.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">{result.meta}</p>
                </div>
              </div>
            )}

            {state.certificates.length === 0 && !result && (
              <p className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500">
                No certificates have been issued yet in this session. Certificates appear here as soon as staff publish
                them from the portal.
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function AdmissionsFaqSection({
  settings, onApply,
}: {
  settings: SystemSettings;
  onApply: () => void;
}) {
  const { state } = useApp();
  const [inquiry, setInquiry] = useState({ name: "", email: "", message: "" });

  const faqs: [string, string][] = [
    ["When does the next intake begin?", `The current intake status is ${settings.intakeStatus} for the ${settings.academicYear} academic year. Classes begin at the start of the ${settings.semester.toLowerCase()}.`],
    ["Do I need previous experience?", "Each programme lists its own entry requirements. Several certificate tracks welcome complete beginners."],
    ["How is tuition paid?", "Tuition can be paid in full or by instalment. Every payment is receipted in the student portal."],
    ["Are certificates internationally recognised?", `Certificates are issued under accreditation ${settings.accreditationNo} and are verifiable online by any employer.`],
    ["How many students are in a cohort?", "Cohorts are intentionally small, typically between eight and twenty learners, so instructors can mentor each student."],
  ];

  const faqList: [string, string][] = state.websiteSettings.faqs.length
    ? state.websiteSettings.faqs.map((f) => [f.question, f.answer])
    : faqs;

  const submitInquiry = () => {
    if (!inquiry.name.trim() || !inquiry.email.trim() || !inquiry.message.trim()) {
      toast.error("Name, email and message are required");
      return;
    }
    toast.success("Enquiry sent. Our admissions team will reply within two working days.");
    setInquiry({ name: "", email: "", message: "" });
  };

  return (
    <section id="admissions" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <SectionHeader
            title="Admissions and FAQs"
            subtitle="Everything you need before you apply, plus a direct line to the admissions team."
            action={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-[11px] font-semibold text-amber-900">
                <CalendarCheck className="h-3.5 w-3.5" /> Intake {settings.intakeStatus}
              </span>
            }
          />
        </Reveal>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div className="space-y-3">
            {faqList.map(([q, a], i) => (
              <Reveal key={q} delay={i * 0.04}>
                <details className="group rounded-2xl border border-emerald-900/10 bg-[#f6f8f7] p-4 open:bg-white">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-slate-800">
                    {q}
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                      +
                    </span>
                  </summary>
                  <p className="mt-2.5 text-sm text-slate-600">{a}</p>
                </details>
              </Reveal>
            ))}

            <Reveal delay={0.2}>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={() => onApply()}
                  disabled={!settings.selfRegistrationOpen}
                  className="bg-emerald-700 hover:bg-emerald-800"
                >
                  Apply online <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  {settings.selfRegistrationOpen
                    ? "Self-registration is open for new applicants"
                    : "Self-registration is currently closed"}
                </span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-emerald-900/10 bg-[#f6f8f7] p-5 sm:p-6">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-emerald-800">
                <Users className="h-3.5 w-3.5" /> Talk to admissions
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Send us an enquiry</h3>
              <p className="mt-1 text-sm text-slate-500">
                Prefer to ask first? Send a message and the registrar will respond personally.
              </p>
              <div className="mt-5 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="inq-name">Full name</Label>
                  <Input id="inq-name" value={inquiry.name} onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })} placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inq-email">Email</Label>
                  <Input id="inq-email" value={inquiry.email} onChange={(e) => setInquiry({ ...inquiry, email: e.target.value })} placeholder="you@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inq-message">Message</Label>
                  <Textarea
                    id="inq-message"
                    rows={4}
                    value={inquiry.message}
                    onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
                    placeholder="Tell us which programme interests you"
                  />
                </div>
                <Button onClick={submitInquiry} className="w-full bg-emerald-700 hover:bg-emerald-800">
                  Send enquiry
                </Button>
                <p className="text-center text-[11px] text-slate-500">
                  Or call {settings.contactPhone} / email {settings.contactEmail}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}