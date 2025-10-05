import { useState } from 'react'


export default function PinPad({ label, onSubmit }){
const [pin, setPin] = useState('')
const push = (d) => setPin(p => (p + d).slice(0,6))
const clear = () => setPin('')
return (
<div className="card">
<h2>{label}</h2>
<input value={pin} readOnly className="pin" />
<div className="pad">
{[1,2,3,4,5,6,7,8,9,0].map(n => (
<button key={n} onClick={()=>push(String(n))}>{n}</button>
))}
<button onClick={clear}>Clear</button>
<button onClick={()=>onSubmit(pin)}>Enter</button>
</div>
</div>
)
}