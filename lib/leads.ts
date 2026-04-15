import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

const supabaseAdmin = createClient(env.PROJECT_URL, env.SERVICE_ROLE);

export async function listContactInquiries(limit = 50) {
  const { data, error } = await supabaseAdmin
    .from("contact_inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching contact inquiries:", error);
    return [];
  }
  return data || [];
}

export async function listNewsletterSubscribers(limit = 50) {
  const { data, error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching newsletter subscribers:", error);
    return [];
  }
  return data || [];
}
