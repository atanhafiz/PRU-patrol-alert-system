const EDGE = import.meta.env.VITE_TELEGRAM_EDGE_URL
const BOT = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
const CHAT = import.meta.env.VITE_TELEGRAM_ALERT_CHAT_ID


export async function sendTextToTelegram(text){
if(EDGE){
const r = await fetch(`${EDGE}/text`, {
method:'POST', headers:{'Content-Type':'application/json'},
body: JSON.stringify({ chat_id: CHAT, text })
})
if(!r.ok) throw new Error('Edge sendMessage fail')
return
}
const url = `https://api.telegram.org/bot${BOT}/sendMessage`
const r = await fetch(url, {
method:'POST', headers: { 'Content-Type':'application/json' },
body: JSON.stringify({ chat_id: CHAT, text })
})
if(!r.ok) throw new Error('Fail sendMessage')
}


export async function sendPhotoToTelegram(dataUrl, caption=''){
const blob = await (await fetch(dataUrl)).blob()
if(EDGE){
const form = new FormData()
form.append('chat_id', CHAT)
form.append('caption', caption)
form.append('photo', blob, 'photo.jpg')
const r = await fetch(`${EDGE}/photo`, { method:'POST', body: form })
if(!r.ok) throw new Error('Edge sendPhoto fail')
return
}
const form = new FormData()
form.append('chat_id', CHAT)
form.append('caption', caption)
form.append('photo', blob, 'photo.jpg')
const url = `https://api.telegram.org/bot${BOT}/sendPhoto`
const r = await fetch(url, { method:'POST', body: form })
if(!r.ok) throw new Error('Fail sendPhoto')
}