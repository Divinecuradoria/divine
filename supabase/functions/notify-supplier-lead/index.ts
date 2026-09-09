import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-divine-webhook-secret",
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
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const expectedSecret = Deno.env.get("DIVINE_WEBHOOK_SECRET")
  const receivedSecret = request.headers.get("x-divine-webhook-secret")

  if (!expectedSecret || receivedSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const record = (payload.record ?? payload) as Record<string, unknown>
  const leadId = String(record.id ?? payload.lead_id ?? "").trim()

  if (!leadId) {
    return new Response(JSON.stringify({ error: "lead_id_required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const resendApiKey = Deno.env.get("RESEND_API_KEY")

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    return new Response(JSON.stringify({ error: "function_not_configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: lead, error: leadError } = await admin
    .from("divine_supplier_leads")
    .select("id,brand_name,contact_name,email,category,base_city,portfolio_url,notes,notification_sent_at,created_at")
    .eq("id", leadId)
    .maybeSingle()

  if (leadError) {
    console.error("lead_lookup_failed", leadError)
    return new Response(JSON.stringify({ error: "lead_lookup_failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  if (!lead) {
    return new Response(JSON.stringify({ error: "lead_not_found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  if (lead.notification_sent_at) {
    return new Response(JSON.stringify({ ok: true, skipped: "already_sent" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const recipient = Deno.env.get("DIVINE_NOTIFICATION_EMAIL") ?? "divinecuradorianupcial@gmail.com"
  const subject = `Novo interesse de curadoria: ${lead.brand_name}`
  const html = `
    <h2>Novo interesse de curadoria DIVINE</h2>
    <p><strong>Marca/profissional:</strong> ${escapeHtml(lead.brand_name)}</p>
    <p><strong>Contato:</strong> ${escapeHtml(lead.contact_name)}</p>
    <p><strong>E-mail:</strong> ${escapeHtml(lead.email)}</p>
    <p><strong>Categoria:</strong> ${escapeHtml(lead.category)}</p>
    <p><strong>Cidade-base:</strong> ${escapeHtml(lead.base_city)}</p>
    <p><strong>Portfólio:</strong> <a href="${escapeHtml(lead.portfolio_url)}">${escapeHtml(lead.portfolio_url)}</a></p>
    <p><strong>Observações:</strong><br />${escapeHtml(lead.notes).replaceAll("\\n", "<br />")}</p>
    <p><strong>Recebido em:</strong> ${escapeHtml(lead.created_at)}</p>
    <hr />
    <p>O registro completo está na tabela <code>divine_supplier_leads</code> do Supabase.</p>
  `

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "DIVINE <onboarding@resend.dev>",
      to: [recipient],
      subject,
      html,
      reply_to: lead.email,
    }),
  })

  if (!emailResponse.ok) {
    const details = await emailResponse.text()
    console.error("resend_failed", emailResponse.status, details)
    return new Response(JSON.stringify({ error: "email_send_failed" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const { error: updateError } = await admin
    .from("divine_supplier_leads")
    .update({ notification_sent_at: new Date().toISOString() })
    .eq("id", lead.id)
    .is("notification_sent_at", null)

  if (updateError) {
    console.error("lead_mark_failed", updateError)
    return new Response(JSON.stringify({ error: "lead_mark_failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
})
