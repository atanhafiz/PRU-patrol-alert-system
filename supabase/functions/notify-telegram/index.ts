import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

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
    const body = await req.json();

    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID")!;

    const guard = body.guard_name || "Unknown";
    const lat = body.lat ?? "0";
    const lng = body.lng ?? "0";
    const note = body.notes || "-";
    const time = new Date().toLocaleString("en-MY");

    // 🚨 Bina mesej dengan link Google Maps
    const text = `🚨 *PRU Patrol Emergency Alert!*\n\n👮 Guard: ${guard}\n🕒 Time: ${time}\n📍 [Lihat di Google Maps](https://www.google.com/maps?q=${lat},${lng})\n📝 Note: ${note}`;

    // Hantar ke Telegram
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "Markdown",
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error("Telegram error: " + errText);
    }

    const msg = await res.json();
    console.log("✅ Telegram success:", msg);

    return new Response(JSON.stringify({ success: true, msg }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("❌ notify-telegram error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
});
