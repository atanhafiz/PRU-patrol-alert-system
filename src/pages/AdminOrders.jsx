import { useState } from 'react'
import { createDailyOrders, fetchDailySummary, opDateISO } from '../services/orders'
import { sendTextToTelegram } from '../services/telegram'
import { toast } from '../components/toast'

export default function AdminOrders(){
  const [res,setRes] = useState(null)
  const [sum,setSum] = useState([])
  const [loading,setLoading] = useState(false)

  const generateDB = async ()=>{
    try{
      setLoading(true)
      const out = await createDailyOrders(opDateISO())
      setRes(out)
      await sendTextToTelegram(`Admin: Arahan rondaan (6 sesi) telah dijana utk ${opDateISO()}.`)
      toast('Orders created ✅')
    }catch(e){
      console.error(e); toast('Generate gagal', 'error')
    }finally{ setLoading(false) }
  }

  const refreshSummary = async ()=>{
    try{
      const s = await fetchDailySummary(opDateISO())
      setSum(s)
      toast('Summary dikemas kini ✅')
    }catch(e){ console.error(e); toast('Gagal ambil summary','error') }
  }

  return (
    <div className="wrap">
      <h2>Admin Orders (DB)</h2>
      <div className="btnrow">
        <button disabled={loading} className="btn primary" onClick={generateDB}>Generate Orders (DB, 6 sesi)</button>
        <button className="btn" onClick={refreshSummary}>Refresh Summary</button>
      </div>
      <h3>Ringkasan Hari Ini</h3>
      <div className="list">
        {sum.length===0 && <div className="item">Tiada data. Tekan Refresh Summary.</div>}
        {sum.map(s => (
          <div key={s.sesi} className="item"><b>Sesi {s.sesi}</b> — {s.done}/{s.total} rumah siap</div>
        ))}
      </div>
      <h3>Debug Output</h3>
      <pre>{res ? JSON.stringify(res, null, 2) : 'Belum jana.'}</pre>
    </div>
  )
}
