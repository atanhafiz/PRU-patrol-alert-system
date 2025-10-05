import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Escape MarkdownV2 characters for Telegram
function escapeMD(text: string) {
  return text.replace(/[_*\[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    // Data dari React
    const guard_name = (formData.get("guard_name") || "Selfie Upload").toString();
    const guard_real_name = (formData.get("guard_real_name") || "Unknown Guard").toString();
    const plate_no = (formData.get("plate_no") || "-").toString();
    const lat = (formData.get("lat") || "0").toString();
    const lng = (formData.get("lng") || "0").toString();

    // Supabase setup
    const SB_URL = Deno.env.get("SB_URL")!;
    const SB_SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY")!;
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID")!;
    const supabase = createClient(SB_URL, SB_SERVICE_ROLE_KEY);

    // ========== Tentukan jenis upload ==========
    let title = "";
    let guardName = guard_real_name; // default guard sebenar

    if (/^selfie-start$/i.test(guard_name)) {
      title = "Selfie-Start";
    } else if (/^selfie-end$/i.test(guard_name)) {
      title = "Selfie-End";
    } else if (guard_name.includes("Rumah")) {
      // Format: Rumah # • Guard • Plate
      const parts = guard_name.split("•").map((p) => p.trim());
      title = parts[0] || "Rumah";
      if (parts[1]) guardName = parts[1];
    } else {
      title = "Selfie Upload";
    }

    // Pilih bucket
    const bucketName = title.startsWith("Rumah") ? "patrol-photos" : "checkins";

    // Nama fail selamat & unik
    const safeName = guardName.replace(/[^\w\-]/g, "_").replace(/_+/g, "_");
    const fileName = `${safeName}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}.jpg`;

    // Upload
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, { contentType: "image/jpeg", upsert: true });
    if (uploadError) throw uploadError;

    // Signed URL
    const { data: signed, error: signError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60 * 60 * 24);
    if (signError) throw signError;
    const photoUrl = signed.signedUrl;

    // ========== Bina caption ==========
    const caption =
      `📸 *${escapeMD(title)}*\n` +
      `👮 Guard: ${escapeMD(guardName)}\n` +
      `🛵 Plate: ${escapeMD(plate_no)}\n` +
      `📍 [Buka Lokasi di Google Maps](https://www.google.com/maps?q=${lat},${lng})\n` +
      `🕒 ${escapeMD(new Date().toLocaleString("en-MY"))}`;

    // Hantar ke Telegram
    const tg = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          photo: photoUrl,
          caption,
          parse_mode: "MarkdownV2",
        }),
      }
    );

    if (!tg.ok) {
      const err = await tg.text();
      throw new Error("Telegram error: " + err);
    }

    return new Response(JSON.stringify({ success: true, photoUrl }), {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error("❌ upload-selfie error:", err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
});
