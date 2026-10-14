import type { AppState, SystemSettings } from "../types";

/**
 * Offline defaults only. Every record now lives in Supabase and is hydrated by
 * AppProvider; no mock people, cohorts, marks or announcements are shipped.
 */

export const defaultSettings: SystemSettings = {
  academyName: "Africa of Hope",
  motto: "Certificates that open doors. Skills that build communities.",
  contactEmail: "admissions@africaofhope.org",
  contactPhone: "+234 801 200 4501",
  address: "12 Unity Crescent, Victoria Island, Lagos, Nigeria",
  accreditationNo: "NBTE/ACC/2024/0491",
  currency: "$",
  academicYear: "2025/2026",
  semester: "First Semester",
  selfRegistrationOpen: true,
  studentIdPrefix: "AOH-STU",
  passMark: 60,
  minAttendance: 75,
  sitePublished: true,
  marketingBanner: "Admissions for the 2025/2026 intake are now open. Apply online in minutes.",
  intakeStatus: "Open",
  featuredProgramIds: [],
};

export const defaultWebsiteSettings = {
  logoUrl: "",
  faviconUrl: "",
  academyName: "Africa of Hope",
  tagline: "Empowering future tech leaders and innovators.",
  announcementText:
    "Admissions for the 2025/2026 intake are now open. Apply online in minutes.",
  announcementEnabled: true,
  heroSlides: [
    {
      id: "hero-1",
      eyebrow: "Cohort Success",
      title: "Empowering Future",
      highlight: "Tech Leaders & Innovators",
      description:
        "Join hands-on, accredited certificate programs crafted to take you from foundational knowledge to job-ready mastery.",
      image:
        "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/attachments/7df501ed-0d87-47d4-9851-c8a5505b89b3/1791902768004_IMG-20250919-WA0127.webp",
    },
    {
      id: "hero-2",
      eyebrow: "Digital Marketing & Financial Literacy",
      title: "Celebrating Our",
      highlight: "Certified Cohort Graduates",
      description:
        "Recognizing ambitious professionals who mastered modern digital growth and financial management skill sets.",
      image:
        "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/attachments/7df501ed-0d87-47d4-9851-c8a5505b89b3/1791902655944_IMG-20251006-WA0070.webp",
    },
    {
      id: "hero-3",
      eyebrow: "Accredited Certification",
      title: "Verifiable Credentials That",
      highlight: "Open Real Career Doors",
      description:
        "Every graduate receives an authenticated, QR-verifiable certificate recognized across top industry partners.",
      image:
        "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/attachments/7df501ed-0d87-47d4-9851-c8a5505b89b3/1791902768234_IMG-20251117-WA0113.webp",
    },
  ],
  features: [
    {
      id: "feat-1",
      icon: "Target",
      title: "Cohort-based learning",
      description:
        "Small groups led by practising instructors, from week one to certification.",
    },
    {
      id: "feat-2",
      icon: "Award",
      title: "Accredited certification",
      description:
        "Every graduate earns a serialised certificate that employers can verify online.",
    },
    {
      id: "feat-3",
      icon: "Handshake",
      title: "Industry placement",
      description:
        "Partner employers review top performers for internships and junior roles.",
    },
  ],
  stats: [
    { id: "stat-1", value: "96%", label: "Completion rate" },
    { id: "stat-2", value: "18", label: "Partner employers" },
    { id: "stat-3", value: "12", label: "Certificate programmes" },
    { id: "stat-4", value: "400+", label: "Graduates placed" },
  ],
  testimonials: [
    {
      id: "t-1",
      name: "Amara N.",
      program: "Full Stack Web Development",
      quote:
        "I joined with no coding background. Six months later I was shipping features for a fintech team in Lagos.",
    },
    {
      id: "t-2",
      name: "Yusuf K.",
      program: "Cloud Computing & DevOps",
      quote:
        "The labs were real servers, real tickets. My certificate was verified by my employer in seconds.",
    },
    {
      id: "t-3",
      name: "Chiamaka O.",
      program: "UI/UX Product Design",
      quote:
        "The portfolio I built here won my first three freelance contracts before I even graduated.",
    },
  ],
  faqs: [
    {
      id: "faq-1",
      question: "When does the next intake begin?",
      answer:
        "Classes begin at the start of each semester. Check the admissions banner for the current intake status.",
    },
    {
      id: "faq-2",
      question: "Do I need previous experience?",
      answer:
        "Each programme lists its own entry requirements. Several certificate tracks welcome complete beginners.",
    },
    {
      id: "faq-3",
      question: "How is tuition paid?",
      answer:
        "Tuition can be paid in full or by instalment. Every payment is receipted in the student portal.",
    },
    {
      id: "faq-4",
      question: "Are certificates internationally recognised?",
      answer:
        "Certificates are issued under our accreditation and are verifiable online by any employer.",
    },
  ],
  socials: [
    { id: "soc-1", platform: "Facebook", url: "https://facebook.com" },
    { id: "soc-2", platform: "Instagram", url: "https://instagram.com" },
    { id: "soc-3", platform: "LinkedIn", url: "https://linkedin.com" },
    { id: "soc-4", platform: "X", url: "https://x.com" },
  ],
  navLinks: [
    { id: "nav-2", label: "About", href: "#about" },
    { id: "nav-3", label: "Impact", href: "#impact" },
    { id: "nav-4", label: "Verify", href: "#verify" },
    { id: "nav-5", label: "Admissions", href: "#admissions" },
  ],
  footerCopyright: "All rights reserved.",
  contactPhone: "+234 801 200 4501",
  contactEmail: "admissions@africaofhope.org",
  address: "12 Unity Crescent, Victoria Island, Lagos, Nigeria",
  officeHours: "Mon - Fri, 9:00 AM - 5:00 PM",
  applyCtaText: "Apply Online",
  verifyEnabled: true,
};

export const initialState: AppState = {
  users: [],
  programs: [],
  cohorts: [],
  attendance: [],
  assignments: [],
  submissions: [],
  fees: [],
  certificates: [],
  announcements: [],
  settings: defaultSettings,
  websiteSettings: defaultWebsiteSettings,
};