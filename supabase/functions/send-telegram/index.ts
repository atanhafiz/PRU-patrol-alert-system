import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { text } = await req.json()

  const BOT_TOKEN = Deno.env.get("BOT_TOKEN")!
  const CHAT_ID = Deno.env.get("CHAT_ID")!

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text }),
  })

  return new Response(JSON.stringify(await res.json()), { status: 200 })
})
