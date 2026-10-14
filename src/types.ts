export type Role = "Super Admin" | "School Admin" | "Teacher" | "Student";
export type AcademicStatus = "Active" | "Suspended" | "Pending Approval";
export type AttendanceStatus = "Present" | "Absent" | "Late";
export type FeeCategory = "Registration" | "Tuition" | "Exam" | "Certificate";
export type SubmissionStatus = "Submitted" | "Graded" | "Missing";
export type CertificateStatus = "Valid" | "Revoked";
export type AnnouncementCategory = "Urgent" | "Academic" | "Financial";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: AcademicStatus;
  joinedDate: string;
  title?: string;
  programIds: string[];
  cohortIds: string[];
  note?: string;
  documents?: string;
  avatarUrl?: string;
  bio?: string;
  address?: string;
  dateOfBirth?: string;
}

export interface Module {
  id: string;
  title: string;
  weeks: number;
  summary: string;
}

export interface Program {
  id: string;
  title: string;
  category: string;
  durationWeeks: number;
  tuition: number;
  certification: string;
  description: string;
  entryRequirements: string;
  modules: Module[];
  imageUrl?: string;
}

export interface Cohort {
  id: string;
  name: string;
  programId: string;
  teacherId: string;
  startDate: string;
  endDate: string;
  room: string;
  studentIds: string[];
}

export interface AttendanceRecord {
  id: string;
  cohortId: string;
  date: string;
  studentId: string;
  status: AttendanceStatus;
}

export interface Assignment {
  id: string;
  cohortId: string;
  title: string;
  dueDate: string;
  maxMarks: number;
  description: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string | null;
  marks: number | null;
  feedback: string;
  status: SubmissionStatus;
}

export interface FeeTransaction {
  id: string;
  studentId: string;
  category: FeeCategory;
  amount: number;
  date: string;
  method: string;
  reference: string;
}

export interface Certificate {
  id: string;
  studentId: string;
  programId: string;
  serial: string;
  issueDate: string;
  honors: string;
  grade: string;
  status: CertificateStatus;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  date: string;
  author: string;
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  image: string;
}

export interface FeatureHighlight {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  program: string;
  quote: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
}

export interface WebsiteSettings {
  logoUrl: string;
  faviconUrl: string;
  academyName: string;
  tagline: string;
  announcementText: string;
  announcementEnabled: boolean;
  heroSlides: HeroSlide[];
  features: FeatureHighlight[];
  stats: StatItem[];
  testimonials: TestimonialItem[];
  faqs: FaqItem[];
  socials: SocialLink[];
  navLinks: NavLink[];
  footerCopyright: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  officeHours: string;
  applyCtaText: string;
  verifyEnabled: boolean;
}

export type WebsiteListKey =
  | "heroSlides"
  | "features"
  | "stats"
  | "testimonials"
  | "faqs"
  | "socials"
  | "navLinks";

export interface AppState {
  users: User[];
  programs: Program[];
  cohorts: Cohort[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  submissions: Submission[];
  fees: FeeTransaction[];
  certificates: Certificate[];
  announcements: Announcement[];
  settings: SystemSettings;
  websiteSettings: WebsiteSettings;
}

export interface SystemSettings {
  academyName: string;
  motto: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  accreditationNo: string;
  currency: string;
  academicYear: string;
  semester: string;
  selfRegistrationOpen: boolean;
  studentIdPrefix: string;
  passMark: number;
  minAttendance: number;
  sitePublished: boolean;
  marketingBanner: string;
  intakeStatus: string;
  featuredProgramIds: string[];
}