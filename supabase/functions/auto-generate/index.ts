import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Serve Edge Function
serve(async (req) => {
  // ✅ Handle preflight CORS
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
    const { sesi = 6, rumahPerSesi = 7 } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Reset rumah lama
    await supabase.from("houses").update({ session_id: null, status: "pending" });

    // Buat sesi baru
    const { data: sessions, error: sErr } = await supabase
      .from("sessions")
      .insert(
        Array.from({ length: sesi }, (_, i) => ({
          name: `Sesi ${i + 1}`,
          status: "pending",
        }))
      )
      .select();

    if (sErr) throw sErr;

    // Ambik rumah ikut blok
    const { data: merah } = await supabase
      .from("houses")
      .select("id,no_rumah,blok")
      .eq("blok", "Merah")
      .order("random()");

    const { data: kelabu } = await supabase
      .from("houses")
      .select("id,no_rumah,blok")
      .eq("blok", "Kelabu")
      .order("random()");

    let updates: any[] = [];
    let messages: string[] = [];

    sessions.forEach((s, idx) => {
      const ambikMerah = merah.slice(idx * 4, idx * 4 + 4);
      const ambikKelabu = kelabu.slice(idx * 3, idx * 3 + 3);
      const semua = [...ambikMerah, ...ambikKelabu];

      updates.push(...semua.map((r) => ({ id: r.id, session_id: s.id })));

      const rumahList = semua.map((r) => `🏠 ${r.no_rumah} (${r.blok})`).join("\n");
      messages.push(`🛡️ PRU Patrol • ${s.name}\n${rumahList}`);
    });

    if (updates.length > 0) {
      await supabase.from("houses").upsert(updates, { onConflict: "id" });
    }

    // Panggil Edge Function notify-telegram
    for (const msg of messages) {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/notify-telegram`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}`,
        },
        body: JSON.stringify({ text: msg }),
      });
    }

    return new Response(JSON.stringify({ message: "Auto generate siap & notify Telegram" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // ✅ fix CORS
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // ✅ fix CORS
      },
    });
  }
});
