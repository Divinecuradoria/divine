import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405)

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const resendApiKey = Deno.env.get("RESEND_API_KEY")

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    return json({ error: "function_not_configured" }, 500)
  }

  const authorization = request.headers.get("Authorization")
  const token = authorization?.replace(/^Bearer\s+/i, "").trim()
  if (!token) return json({ error: "authentication_required" }, 401)

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: userData, error: userError } = await admin.auth.getUser(token)
  if (userError || !userData.user) return json({ error: "authentication_required" }, 401)

  const { data: reviewer, error: reviewerError } = await admin
    .from("divine_reviewers")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle()

  if (reviewerError || !reviewer) return json({ error: "editorial_access_required" }, 403)

  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch {
    return json({ error: "invalid_json" }, 400)
  }

  const leadId = String(payload.lead_id ?? "").trim()
  if (!leadId) return json({ error: "lead_id_required" }, 400)

  const { data: lead, error: leadError } = await admin
    .from("divine_supplier_leads")
    .select("id,brand_name,contact_name,email,invitation_sent_at")
    .eq("id", leadId)
    .maybeSingle()

  if (leadError) {
    console.error("lead_lookup_failed", leadError)
    return json({ error: "lead_lookup_failed" }, 500)
  }
  if (!lead) return json({ error: "lead_not_found" }, 404)

  if (lead.invitation_sent_at) return json({ ok: true, skipped: "already_sent" })

  const publicUrl = Deno.env.get("DIVINE_PUBLIC_URL") ?? "https://www.divinecuradoria.com.br"
  const from = Deno.env.get("DIVINE_FROM_EMAIL") ?? "DIVINE <onboarding@resend.dev>"
  const accessUrl = publicUrl + "/entrar?next=/aplicar"
  const greeting = lead.contact_name ? "Olá, " + escapeHtml(lead.contact_name) + "." : "Olá."

  const html =
    "<div style=\"font-family:Arial,sans-serif;line-height:1.6;color:#171514;max-width:640px\">" +
    "<p style=\"letter-spacing:.18em;text-transform:uppercase;font-size:12px;color:#9a6b3f\">Convite à Curadoria</p>" +
    "<h1 style=\"font-family:Georgia,serif;font-weight:400\">Seu trabalho foi convidado para a próxima etapa.</h1>" +
    "<p>" + greeting + "</p>" +
    "<p>A equipe DIVINE identificou a marca <strong>" + escapeHtml(lead.brand_name) + "</strong> e gostaria de conhecer seu trabalho com mais profundidade.</p>" +
    "<p>Para continuar:</p><ol>" +
    "<li>acesse o botão abaixo;</li><li>entre ou crie seu acesso com e-mail;</li><li>preencha a ficha completa da Curadoria DIVINE.</li></ol>" +
    "<p style=\"margin:28px 0\"><a href=\"" + accessUrl + "\" style=\"display:inline-block;background:#171514;color:#fff;padding:13px 22px;text-decoration:none;border-radius:5px\">Continuar para a Curadoria</a></p>" +
    "<p>A ficha reúne informações sobre sua atuação, portfólio, assinatura e referências. A análise é privada e a entrada no Acervo depende da decisão editorial.</p>" +
    "<p><strong>Este convite não representa aprovação automática nem contratação comercial.</strong></p>" +
    "<hr style=\"border:0;border-top:1px solid #ddd;margin:28px 0\" />" +
    "<p style=\"font-size:13px;color:#666\">Se você não esperava esta mensagem ou tiver dúvidas, responda a este e-mail.</p></div>"

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + resendApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [lead.email],
      subject: "Convite à Curadoria DIVINE — próximos passos",
      html,
      reply_to: Deno.env.get("DIVINE_REPLY_TO") ?? "divinecuradorianupcial@gmail.com",
    }),
  })

  if (!emailResponse.ok) {
    const details = await emailResponse.text()
    console.error("resend_failed", emailResponse.status, details)
    return json({ error: "email_send_failed" }, 502)
  }

  const { error: markError } = await admin
    .from("divine_supplier_leads")
    .update({ invitation_sent_at: new Date().toISOString() })
    .eq("id", lead.id)
    .is("invitation_sent_at", null)

  if (markError) {
    console.error("invitation_mark_failed", markError)
    return json({ error: "invitation_mark_failed" }, 500)
  }

  return json({ ok: true })
})
