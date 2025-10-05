import { supabase } from "./supabaseClient";

/**
 * Upload selfie → Storage (private) + insert DB → noti Telegram
 * @param {Blob} blob
 * @param {{ guardId:string, guardName?:string, status?:string, lat?:number|null, lng?:number|null, notes?:string }} opt
 */
export async function uploadSelfie(
  blob,
  { guardId, guardName = "Unknown", status = "duty_start", lat = null, lng = null, notes = "" }
) {
  if (!guardId) return { success:false, error:"guardId diperlukan" };

  try {
    // 1) Upload ke Storage (bucket: checkins)
    const fileName = `${guardId}_${Date.now()}.jpg`;
    const { error: upErr } = await supabase.storage
      .from("checkins")
      .upload(fileName, blob, { contentType: "image/jpeg", upsert: false });
    if (upErr) throw upErr;

    // 2) Signed URL (24 jam) — sesuai untuk Telegram fetch
    const { data: signed, error: signErr } = await supabase.storage
      .from("checkins")
      .createSignedUrl(fileName, 60 * 60 * 24);
    if (signErr) throw signErr;
    const photoUrl = signed.signedUrl;

    // 3) Insert rekod DB
    const { data: inserted, error: insErr } = await supabase
      .from("checkins")
      .insert([{ guard_id: guardId, photo_url: photoUrl, lat, lng, status }])
      .select()
      .single();
    if (insErr) throw insErr;

    // 4) Noti Telegram (Edge Function)
    const payload = {
      guard_name: guardName,
      guard_id: guardId,
      status,
      photo_url: photoUrl,
      lat, lng,
      created_at: inserted?.created_at,
      notes
    };

    const { data: fnData, error: fnErr } = await supabase.functions.invoke("notify-telegram", {
      body: payload,
    });
    if (fnErr) console.warn("notify-telegram warning:", fnErr);

    return { success: true, data: { checkin: inserted, notify: fnData } };
  } catch (e) {
    console.error(e);
    return { success:false, error: e.message || "Ralat tidak diketahui" };
  }
}

/** Butang Emergency (tanpa gambar) – hantar lokasi/nota saja */
export async function sendEmergency({ guardId, guardName="Unknown", lat=null, lng=null, notes="" }) {
  try {
    const payload = {
      guard_name: guardName,
      guard_id: guardId,
      status: "emergency",
      photo_url: null,
      lat, lng, notes
    };
    const { data, error } = await supabase.functions.invoke("notify-telegram", { body: payload });
    if (error) throw error;
    return { success:true, data };
  } catch (e) {
    return { success:false, error: e.message };
  }
}
