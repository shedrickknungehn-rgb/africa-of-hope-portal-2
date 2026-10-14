import { supabase } from "@/integrations/supabase/client";

export type ApprovalStatus = "draft" | "pending" | "approved" | "rejected" | "revision_requested";

export interface ScheduleSlot {
  day_of_week: number;
  starts_at: string;
  ends_at: string;
  room?: string | null;
}

export interface EnrollmentPreview {
  allowed: boolean;
  conflicts: string[];
  warnings: string[];
  weekly_hours: number;
}

export interface CourseEnrollment {
  id: string;
  student_id: string;
  cohort_id: string;
  status: ApprovalStatus | "active" | "completed" | "withdrawn";
  requested_at: string;
  approved_at?: string | null;
  progress_percent: number;
  completion_status: string;
  workload_warnings: string[];
  cohort?: { id: string; name: string; start_date: string; end_date: string; room: string; program_id: string };
}

export interface CoursePlan {
  id: string;
  cohort_id: string;
  teacher_id: string;
  title: string;
  overview: string;
  objectives: string[];
  training_plan: string;
  status: ApprovalStatus;
  revision_note?: string | null;
  submitted_at?: string | null;
  approved_at?: string | null;
}

export interface ClassSession {
  id: string;
  cohort_id: string;
  course_plan_id?: string | null;
  title: string;
  session_date: string;
  starts_at: string;
  ends_at: string;
  room?: string | null;
  attendance_required: boolean;
  status: ApprovalStatus | "cancelled" | "completed";
}

export interface LearningUnit {
  id: string;
  program_id: string;
  cohort_id?: string | null;
  course_plan_id?: string | null;
  title: string;
  summary: string;
  unit_type: "chapter" | "module" | "topic";
  position: number;
  available_from?: string | null;
  due_at?: string | null;
  status: ApprovalStatus;
  quiz_id?: string | null;
  classwork_assignment_id?: string | null;
}

export interface TrainingMaterial {
  id: string;
  program_id: string;
  cohort_id?: string | null;
  learning_unit_id?: string | null;
  created_by: string;
  title: string;
  description: string;
  material_type: string;
  file_path?: string | null;
  external_url?: string | null;
  mime_type?: string | null;
  status: ApprovalStatus;
  revision_note?: string | null;
  created_at: string;
}

export interface PortalNotification {
  id: string;
  recipient_id: string;
  kind: string;
  title: string;
  body: string;
  entity_type?: string | null;
  entity_id?: string | null;
  created_at: string;
  read_at?: string | null;
}

export interface ApprovalItem {
  entity_type: "enrollment" | "course_plan" | "class_session" | "learning_unit" | "training_material";
  entity_id: string;
  title: string;
  owner_name: string;
  status: ApprovalStatus;
  submitted_at: string;
  context: Record<string, unknown>;
}

function explain(error: { message: string } | null): string | null {
  if (!error) return null;
  if (/does not exist|schema cache|could not find/i.test(error.message)) {
    return "Academic planning is not active yet. Apply the latest Supabase migration, then refresh this page.";
  }
  return error.message;
}

async function rows<T>(table: string, query?: (request: any) => any): Promise<T[]> {
  let request: any = supabase.from(table).select("*");
  if (query) request = query(request);
  const { data, error } = await request;
  const message = explain(error);
  if (message) throw new Error(message);
  return (data ?? []) as T[];
}

export const academicApi = {
  enrollments(studentId?: string) {
    return rows<CourseEnrollment>("course_enrollments", (q) =>
      studentId ? q.eq("student_id", studentId).order("requested_at", { ascending: false }) : q.order("requested_at", { ascending: false }),
    );
  },
  plans(teacherId?: string) {
    return rows<CoursePlan>("teacher_course_plans", (q) =>
      teacherId ? q.eq("teacher_id", teacherId).order("updated_at", { ascending: false }) : q.order("updated_at", { ascending: false }),
    );
  },
  sessions(cohortIds?: string[]) {
    return rows<ClassSession>("class_sessions", (q) => {
      let next = q.order("session_date").order("starts_at");
      if (cohortIds?.length) next = next.in("cohort_id", cohortIds);
      return next;
    });
  },
  units(programIds?: string[], cohortIds?: string[]) {
    return rows<LearningUnit>("learning_units", (q) => {
      let next = q.order("position");
      if (programIds?.length && cohortIds?.length) next = next.or(`program_id.in.(${programIds.join(",")}),cohort_id.in.(${cohortIds.join(",")})`);
      else if (programIds?.length) next = next.in("program_id", programIds);
      else if (cohortIds?.length) next = next.in("cohort_id", cohortIds);
      return next;
    });
  },
  materials(programIds?: string[], cohortIds?: string[]) {
    return rows<TrainingMaterial>("training_materials", (q) => {
      let next = q.order("created_at", { ascending: false });
      if (programIds?.length && cohortIds?.length) next = next.or(`program_id.in.(${programIds.join(",")}),cohort_id.in.(${cohortIds.join(",")})`);
      else if (programIds?.length) next = next.in("program_id", programIds);
      else if (cohortIds?.length) next = next.in("cohort_id", cohortIds);
      return next;
    });
  },
  notifications(userId: string) {
    return rows<PortalNotification>("notifications", (q) => q.eq("recipient_id", userId).order("created_at", { ascending: false }).limit(50));
  },
  approvalQueue() {
    return rows<ApprovalItem>("academic_approval_queue", (q) => q.order("submitted_at"));
  },
  async previewEnrollment(cohortId: string): Promise<EnrollmentPreview> {
    const { data, error } = await supabase.rpc("preview_course_enrollment", { p_cohort_id: cohortId });
    const message = explain(error);
    if (message) throw new Error(message);
    return (data ?? { allowed: false, conflicts: [], warnings: [], weekly_hours: 0 }) as EnrollmentPreview;
  },
  async submitEnrollment(cohortId: string): Promise<EnrollmentPreview & { enrollment_id?: string }> {
    const { data, error } = await supabase.rpc("submit_course_enrollment", { p_cohort_id: cohortId });
    const message = explain(error);
    if (message) throw new Error(message);
    return data as EnrollmentPreview & { enrollment_id?: string };
  },
  async createPlan(payload: Omit<CoursePlan, "id" | "status" | "revision_note" | "submitted_at" | "approved_at">) {
    const { data, error } = await supabase.from("teacher_course_plans").insert({ ...payload, status: "draft" }).select().single();
    const message = explain(error);
    if (message) throw new Error(message);
    return data as CoursePlan;
  },
  async createSession(payload: Omit<ClassSession, "id" | "status">) {
    const { data, error } = await supabase.from("class_sessions").insert({ ...payload, status: "draft" }).select().single();
    const message = explain(error);
    if (message) throw new Error(message);
    return data as ClassSession;
  },
  async createUnit(payload: Omit<LearningUnit, "id" | "status">) {
    const { data, error } = await supabase.from("learning_units").insert({ ...payload, status: "draft" }).select().single();
    const message = explain(error);
    if (message) throw new Error(message);
    return data as LearningUnit;
  },
  async createUnitWithAssessments(
    payload: Omit<LearningUnit, "id" | "status" | "quiz_id" | "classwork_assignment_id">,
    assessment: { classworkTitle: string; dueDate: string; maxMarks: number; classworkMinutes: number; classworkWeight: number; quizMinutes: number; quizWeight: number },
  ) {
    const unit = await this.createUnit({ ...payload, quiz_id: null, classwork_assignment_id: null });
    const { data: assignment, error: assignmentError } = await supabase.from("assignments").insert({
      cohort_id: payload.cohort_id,
      title: assessment.classworkTitle,
      description: `Classwork for ${payload.title}`,
      due_date: assessment.dueDate,
      max_marks: assessment.maxMarks,
      learning_unit_id: unit.id,
      time_limit_minutes: assessment.classworkMinutes,
      grade_weight: assessment.classworkWeight,
    }).select("id").single();
    const assignmentMessage = explain(assignmentError);
    if (assignmentMessage) throw new Error(assignmentMessage);
    const { data: quiz, error: quizError } = await supabase.from("quizzes").insert({
      program_id: payload.program_id,
      cohort_id: payload.cohort_id,
      title: `${payload.title} quiz`,
      description: `Timed quiz for ${payload.title}. Add questions in the Quiz Builder before publication.`,
      status: "draft",
      time_limit_minutes: assessment.quizMinutes,
      max_attempts: 1,
      pass_mark: 50,
      learning_unit_id: unit.id,
      grade_weight: assessment.quizWeight,
    }).select("id").single();
    const quizMessage = explain(quizError);
    if (quizMessage) throw new Error(quizMessage);
    const { data, error } = await supabase.from("learning_units").update({
      quiz_id: quiz.id,
      classwork_assignment_id: assignment.id,
    }).eq("id", unit.id).select().single();
    const message = explain(error);
    if (message) throw new Error(message);
    return data as LearningUnit;
  },
  async uploadMaterial(file: File, cohortId: string, teacherId: string): Promise<{ path: string; mime: string }> {
    const safe = file.name.replace(/[^A-Za-z0-9._-]+/g, "-").slice(0, 100);
    const path = `${cohortId}/${teacherId}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage.from("training-materials").upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (error) throw new Error(explain(error) ?? error.message);
    return { path, mime: file.type || "application/octet-stream" };
  },
  async createMaterial(payload: Omit<TrainingMaterial, "id" | "status" | "revision_note" | "created_at">) {
    const { data, error } = await supabase.from("training_materials").insert({ ...payload, status: "pending" }).select().single();
    const message = explain(error);
    if (message) throw new Error(message);
    return data as TrainingMaterial;
  },
  async submit(entityType: "course_plan" | "class_session" | "learning_unit", entityId: string) {
    const { data, error } = await supabase.rpc("submit_academic_item", { p_entity_type: entityType, p_entity_id: entityId });
    const message = explain(error);
    if (message) throw new Error(message);
    return data;
  },
  async review(entityType: string, entityId: string, decision: "approved" | "rejected" | "revision_requested", note: string) {
    const { data, error } = await supabase.rpc("review_academic_submission", {
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_decision: decision,
      p_note: note,
    });
    const message = explain(error);
    if (message) throw new Error(message);
    return data;
  },
  async materialUrl(path: string) {
    const { data, error } = await supabase.storage.from("training-materials").createSignedUrl(path, 600);
    if (error || !data) throw new Error(explain(error) ?? "Could not open this material.");
    return data.signedUrl;
  },
  async markNotificationRead(id: string) {
    const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    const message = explain(error);
    if (message) throw new Error(message);
  },
};
