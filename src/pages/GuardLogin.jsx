import { useNavigate } from 'react-router-dom'
import PinPad from '../components/PinPad'


export default function GuardLogin(){
const nav = useNavigate()
const GUARD_PIN = import.meta.env.VITE_GUARD_PIN || '1000'
return (
<div className="wrap">
<PinPad label="Masukkan PIN Guard" onSubmit={(pin)=>{
if(String(pin)===String(GUARD_PIN)) nav('/guard/dashboard')
else alert('PIN salah')
}}/>
</div>
)
}