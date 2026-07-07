import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "create" | "update" | "delete" | "publish" | "unpublish"
  | "validate" | "reject" | "upload" | "login"
  | "grant_role" | "revoke_role";

export async function logAudit(params: {
  action: AuditAction;
  entity_type: string;
  entity_id?: string | null;
  entity_label?: string | null;
  metadata?: Record<string, any>;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("audit_log").insert({
      user_id: user.id,
      actor_email: user.email,
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id ?? null,
      entity_label: params.entity_label ?? null,
      metadata: params.metadata ?? {},
    });
  } catch (e) {
    // Non-blocking
    console.warn("audit log failed", e);
  }
}
