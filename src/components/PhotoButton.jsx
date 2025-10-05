export default function PhotoButton({ label, onCapture }){
  const take = async ()=>{
    try{
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }   // back camera if exists
      })
      const video = document.createElement('video')
      video.srcObject = media
      await video.play()
      const c = document.createElement('canvas')
      c.width = 720; c.height = 960
      const ctx = c.getContext('2d')
      ctx.drawImage(video, 0, 0, c.width, c.height)
      const dataUrl = c.toDataURL('image/jpeg', 0.75)     // <-- compress
      media.getTracks().forEach(t=>t.stop())
      onCapture && onCapture(dataUrl)
    }catch(e){
      alert('Gagal akses kamera: ' + e.message)
    }
  }
  return <button className="btn" onClick={take}>{label}</button>
}
