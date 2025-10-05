import { supabase } from './supabaseClient'

export function opDateISO(){
  const d=new Date(); const C=6;
  if(d.getHours()<C) d.setDate(d.getDate()-1);
  d.setHours(0,0,0,0); return d.toISOString().slice(0,10);
}

export async function fetchHouses(){
  const { data, error } = await supabase.from('houses')
    .select('id,no_rumah,jalan,blok,catatan')
  if(error) throw error
  return data
}

export function quotaForSession(sesi){
  return (sesi % 2 === 1) ? { Merah:4, Kelabu:3 } : { Merah:3, Kelabu:4 }
}

function getBlok(h){
  const s=(h?.blok || h?.catatan || '').toLowerCase()
  if(s.includes('merah')) return 'Merah'
  if(s.includes('kelabu')) return 'Kelabu'
  return 'Kelabu'
}

function selectSeven(houses, quota){
  const by = { Merah: houses.filter(h=>getBlok(h)==='Merah'),
               Kelabu: houses.filter(h=>getBlok(h)==='Kelabu') }
  const shuf = arr => arr.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1])
  const pickFrom = (arr,n,avoid)=>{
    const got=[]; for(const h of shuf(arr)){
      if(got.length>=n) break;
      if(!avoid.has(h.jalan)){ got.push(h); avoid.add(h.jalan) }
    }
    if(got.length<n){ for(const h of shuf(arr)){ if(got.length>=n) break; if(!got.find(x=>x.id===h.id)) got.push(h) } }
    return got
  }
  const avoid=new Set()
  return [...pickFrom(by.Merah, quota.Merah, avoid), ...pickFrom(by.Kelabu, quota.Kelabu, avoid)].slice(0,7)
}

export async function createOrderForSession(tarikh, sesi, houses){
  const quota = quotaForSession(sesi)
  const chosen = selectSeven(houses, quota)
  const { data: ord, error: eo } = await supabase.from('orders').insert({ tarikh, sesi }).select('id').single()
  if(eo) throw eo
  const items = chosen.map((h,i)=>({ order_id: ord.id, idx:i+1, house_id:h.id }))
  const { error: ei } = await supabase.from('order_items').insert(items)
  if(ei) throw ei
  return { order: ord.id, sesi, quota, houses: chosen }
}

export async function createDailyOrders(tarikh = opDateISO()){
  const houses = await fetchHouses()
  const res=[]; for(let s=1; s<=6; s++) res.push(await createOrderForSession(tarikh, s, houses))
  return res
}

export async function fetchOrderHouses(tarikh, sesi){
  let { data: ord, error: e1 } = await supabase.from('orders')
    .select('id').eq('tarikh', tarikh).eq('sesi', sesi).maybeSingle()
  if(e1) throw e1
  if(!ord) return { order_id:null, houses:[] }
  const { data: items, error: e2 } = await supabase
    .from('order_items')
    .select('idx, house:houses(id,no_rumah,jalan,blok,catatan)')
    .eq('order_id', ord.id).order('idx')
  if(e2) throw e2
  return { order_id: ord.id, houses: items.map(x=>x.house) }
}

// Summary x/7 per sesi untuk tarikh
export async function fetchDailySummary(tarikh = opDateISO()){
  const { data: orders, error } = await supabase.from('orders')
    .select('id,sesi').eq('tarikh', tarikh).order('sesi')
  if(error) throw error
  const out = await Promise.all((orders||[]).map(async o=>{
    const { data, error: e2 } = await supabase.from('checkpoints')
      .select('house_id').eq('order_id', o.id)
    if(e2) throw e2
    const done = new Set((data||[]).map(x=>x.house_id)).size
    return { sesi:o.sesi, done, total:7 }
  }))
  return out
}
