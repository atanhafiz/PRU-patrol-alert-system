import { supabase } from '../lib/supabaseAutoClient'

const BUCKET = 'patrol-photos'

export function dataURLtoBlob(dataUrl){
  const [head, body] = dataUrl.split(',')
  const mime = (head.match(/data:(.*);base64/) || [,'image/jpeg'])[1]
  const bin = atob(body)
  const u8 = new Uint8Array(bin.length)
  for (let i=0;i<bin.length;i++) u8[i] = bin.charCodeAt(i)
  return new Blob([u8], { type: mime })
}
function stamp(){
  const d = new Date(), z=n=>String(n).padStart(2,'0')
  return `${d.getFullYear()}${z(d.getMonth()+1)}${z(d.getDate())}_${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}`
}
export async function uploadCheckpointPhoto(orderId, sesi, house, dataUrl){
  const blob = dataURLtoBlob(dataUrl)
  const path = `orders/${orderId}/s${sesi}/${stamp()}_${house?.id||'h'}.jpg`
  const { error: upErr } = await supabase.storage.from(BUCKET)
    .upload(path, blob, { upsert:true, contentType:'image/jpeg' })
  if (upErr) throw upErr
  const { data } = await supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
export async function insertCheckpoint({ order_id, sesi, house_id, photo_url /*, gps*/ }){
  const payload = {
    order_id: Number(order_id)||null,
    sesi:      Number(sesi)||null,
    house_id:  Number(house_id)||null,
    photo_url: String(photo_url||'')
  }
  const { data, error } = await supabase
    .from('checkpoints')
    .insert(payload)
    .select('id')
    .single()
  if (error) throw new Error(`${error.message} :: ${error.details||''}`)
  return data?.id
}
