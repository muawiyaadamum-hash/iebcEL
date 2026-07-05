import { supabase } from "@/integrations/supabase/client";

export const WHATSAPP_NUMBER = "237693122020";
export const SUPPORT_EMAIL = "support@iebccm.online";
export const REGISTRATION_FEE_XAF = 50000;

export interface Pole {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  published: boolean;
}

export interface Cursus {
  id: string;
  pole_id: string;
  slug: string;
  title: string;
  description: string | null;
  objectives: string | null;
  level: string | null;
  duration_hours: number;
  duration_label: string | null;
  price_xaf: number;
  registration_fee_xaf: number;
  modality: string | null;
  certification: boolean;
  image_url: string | null;
  featured: boolean;
  published: boolean;
  display_order: number;
  pole?: Pole | null;
}

export interface CursusModule {
  id: string;
  cursus_id: string;
  title: string;
  description: string | null;
  duration_hours: number;
  formateur_id: string | null;
  display_order: number;
  required: boolean;
  locked: boolean;
  published: boolean;
}

export type LessonType = "text" | "pdf" | "video" | "link" | "live";

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  lesson_type: LessonType;
  content: string | null;
  file_path: string | null;
  external_url: string | null;
  duration_minutes: number | null;
  display_order: number;
  required: boolean;
  published: boolean;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  cursus_id: string;
  status: "pending" | "validated" | "rejected" | "cancelled";
  payment_reference: string | null;
  validated_by: string | null;
  validated_at: string | null;
  notes: string | null;
  created_at: string;
}

export async function fetchPoles(): Promise<Pole[]> {
  const { data, error } = await supabase
    .from("poles")
    .select("*")
    .eq("published", true)
    .order("display_order");
  if (error) throw error;
  return (data as Pole[]) || [];
}

export async function fetchCursusList(): Promise<Cursus[]> {
  const { data, error } = await supabase
    .from("cursus")
    .select("*, pole:poles(*)")
    .eq("published", true)
    .order("display_order");
  if (error) throw error;
  return (data as any[]) || [];
}

export async function fetchCursusBySlug(slug: string): Promise<Cursus | null> {
  const { data, error } = await supabase
    .from("cursus")
    .select("*, pole:poles(*)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as any) || null;
}

export async function fetchModules(cursusId: string): Promise<CursusModule[]> {
  const { data, error } = await supabase
    .from("cursus_modules")
    .select("*")
    .eq("cursus_id", cursusId)
    .eq("published", true)
    .order("display_order");
  if (error) throw error;
  return (data as CursusModule[]) || [];
}

export async function fetchLessons(moduleId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("module_id", moduleId)
    .eq("published", true)
    .order("display_order");
  if (error) throw error;
  return (data as Lesson[]) || [];
}

export async function fetchEnrollment(userId: string, cursusId: string) {
  const { data } = await supabase
    .from("course_enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("cursus_id", cursusId)
    .maybeSingle();
  return (data as CourseEnrollment | null) || null;
}

export async function fetchMyEnrollments(userId: string) {
  const { data, error } = await supabase
    .from("course_enrollments")
    .select("*, cursus:cursus(*, pole:poles(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as any[]) || [];
}

export function formatXaf(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} XAF`;
}

export function whatsappRegistrationLink(params: {
  cursusTitle: string;
  fullName?: string;
  email?: string;
  phone?: string;
  fee?: number;
}): string {
  const fee = params.fee ?? REGISTRATION_FEE_XAF;
  const lines = [
    `Bonjour Centre de Formation IEBC,`,
    ``,
    `Je souhaite finaliser mon inscription au cursus :`,
    `• Cursus : ${params.cursusTitle}`,
    `• Frais d'inscription : ${formatXaf(fee)}`,
    ``,
    `Mes informations :`,
    `• Nom complet : ${params.fullName ?? "[à compléter]"}`,
    `• Email : ${params.email ?? "[à compléter]"}`,
    `• Téléphone : ${params.phone ?? "[à compléter]"}`,
    ``,
    `Merci de me confirmer la procédure de paiement.`,
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
