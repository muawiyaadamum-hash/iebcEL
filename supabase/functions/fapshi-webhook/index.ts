import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, apiuser, apikey",
};

interface FapshiWebhookPayload {
  transId: string;
  status: "CREATED" | "PENDING" | "SUCCESSFUL" | "FAILED" | "EXPIRED";
  medium: "mobile money" | "orange money";
  serviceName: string;
  amount: number;
  revenue: number;
  payerName: string;
  email: string;
  redirectUrl?: string;
  externalId?: string; // We use this to identify the enrollment
  userId?: string;
  webhook?: string;
  financialTransId?: string;
  dateInitiated?: string;
  dateConfirmed?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the webhook payload
    const payload: FapshiWebhookPayload = await req.json();
    
    console.log("Fapshi webhook received:", JSON.stringify(payload, null, 2));

    // Validate required fields
    if (!payload.transId || !payload.status) {
      console.error("Missing required fields in webhook payload");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle different payment statuses
    if (payload.status === "SUCCESSFUL") {
      console.log(`Payment successful for transaction: ${payload.transId}`);
      
      // If we have an externalId, use it to find the enrollment
      // externalId format expected: enrollment_<enrollment_id> or user_<user_id>_course_<course_id>
      if (payload.externalId) {
        const externalId = payload.externalId;
        
        // Check if it's an enrollment ID format
        if (externalId.startsWith("enrollment_")) {
          const enrollmentId = externalId.replace("enrollment_", "");
          
          const { error: updateError } = await supabase
            .from("enrollments")
            .update({
              payment_status: "completed",
              payment_reference: payload.transId,
            })
            .eq("id", enrollmentId);

          if (updateError) {
            console.error("Error updating enrollment:", updateError);
            return new Response(
              JSON.stringify({ error: "Failed to update enrollment", details: updateError.message }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          console.log(`Enrollment ${enrollmentId} marked as completed`);
        }
        // Check if it's a user_course format
        else if (externalId.includes("_course_")) {
          const [userPart, coursePart] = externalId.split("_course_");
          const userId = userPart.replace("user_", "");
          const courseId = coursePart;

          // Find and update the enrollment
          const { data: enrollment, error: findError } = await supabase
            .from("enrollments")
            .select("id")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .eq("payment_status", "pending")
            .maybeSingle();

          if (findError) {
            console.error("Error finding enrollment:", findError);
          }

          if (enrollment) {
            const { error: updateError } = await supabase
              .from("enrollments")
              .update({
                payment_status: "completed",
                payment_reference: payload.transId,
              })
              .eq("id", enrollment.id);

            if (updateError) {
              console.error("Error updating enrollment:", updateError);
            } else {
              console.log(`Enrollment ${enrollment.id} marked as completed for user ${userId}, course ${courseId}`);
            }
          } else {
            // Create a new enrollment if one doesn't exist
            console.log(`No pending enrollment found, creating new one for user ${userId}, course ${courseId}`);
            
            const { error: insertError } = await supabase
              .from("enrollments")
              .insert({
                user_id: userId,
                course_id: courseId,
                payment_status: "completed",
                payment_reference: payload.transId,
                progress: 0,
              });

            if (insertError) {
              console.error("Error creating enrollment:", insertError);
            }
          }
        }
      } else {
        // Fallback: Try to find enrollment by payment reference if no externalId
        console.log("No externalId provided, attempting to find by email:", payload.email);
        
        // Get user by email
        if (payload.email) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("email", payload.email)
            .maybeSingle();

          if (profile) {
            // Update most recent pending enrollment for this user
            const { error: updateError } = await supabase
              .from("enrollments")
              .update({
                payment_status: "completed",
                payment_reference: payload.transId,
              })
              .eq("user_id", profile.user_id)
              .eq("payment_status", "pending")
              .order("enrolled_at", { ascending: false })
              .limit(1);

            if (updateError) {
              console.error("Error updating enrollment by email:", updateError);
            } else {
              console.log(`Updated most recent pending enrollment for user with email ${payload.email}`);
            }
          }
        }
      }
    } else if (payload.status === "FAILED") {
      console.log(`Payment failed for transaction: ${payload.transId}`);
      
      // Optionally update enrollment status to failed
      if (payload.externalId && payload.externalId.startsWith("enrollment_")) {
        const enrollmentId = payload.externalId.replace("enrollment_", "");
        
        await supabase
          .from("enrollments")
          .update({
            payment_status: "failed",
            payment_reference: payload.transId,
          })
          .eq("id", enrollmentId);
      }
    } else if (payload.status === "EXPIRED") {
      console.log(`Payment expired for transaction: ${payload.transId}`);
      
      // Optionally update enrollment status to expired
      if (payload.externalId && payload.externalId.startsWith("enrollment_")) {
        const enrollmentId = payload.externalId.replace("enrollment_", "");
        
        await supabase
          .from("enrollments")
          .update({
            payment_status: "expired",
            payment_reference: payload.transId,
          })
          .eq("id", enrollmentId);
      }
    }

    // Acknowledge receipt of webhook
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Webhook processed",
        transId: payload.transId,
        status: payload.status 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
