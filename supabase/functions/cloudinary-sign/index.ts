// Lets a logged-in admin upload images to Cloudinary and delete them.
// The Cloudinary API secret stays here and never reaches the browser.
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = (Deno.env.get("ADMIN_ORIGIN") ?? "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

function corsHeaders(req) {
  const origin = req.headers.get("Origin") ?? "";
  return {
    ...(allowedOrigins.includes(origin) ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

async function sign(params, apiSecret) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  const data = new TextEncoder().encode(toSign + apiSecret);
  const hash = await crypto.subtle.digest("SHA-1", data);
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function isAdmin(token) {
  const publishableKeys = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    publishableKeys.default ?? Deno.env.get("SUPABASE_ANON_KEY"),
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) return false;
  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
}

Deno.serve(async (req) => {
  const headers = corsHeaders(req);
  const json = (body, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...headers, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Log in to continue" }, 401);
  if (!(await isAdmin(token))) return json({ error: "Only admins can manage images" }, 403);

  const apiKey = Deno.env.get("CLOUDINARY_API_KEY");
  const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET");
  const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME");
  if (!apiKey || !apiSecret || !cloudName) {
    return json({ error: "Cloudinary keys are not set on the server" }, 500);
  }

  const body = await req.json().catch(() => ({}));
  const timestamp = Math.floor(Date.now() / 1000);

  if (body.action === "destroy") {
    const publicId = body.publicId;
    if (typeof publicId !== "string" || !/^[\w\-./]+$/.test(publicId)) {
      return json({ error: "Invalid image id" }, 400);
    }
    const params = { invalidate: "true", public_id: publicId, timestamp };
    const form = new URLSearchParams({
      ...params,
      timestamp: String(timestamp),
      api_key: apiKey,
      signature: await sign(params, apiSecret),
    });
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      { method: "POST", body: form },
    );
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return json({ error: "Cloudinary could not delete the image" }, 502);
    return json({ result: result.result });
  }

  const params = { folder: "portfolio", timestamp };
  return json({
    ...params,
    signature: await sign(params, apiSecret),
    apiKey,
    cloudName,
  });
});
