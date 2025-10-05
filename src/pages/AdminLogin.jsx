import { useNavigate } from 'react-router-dom'
import PinPad from '../components/PinPad'


export default function AdminLogin(){
const nav = useNavigate()
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '2000'
return (
<div className="wrap">
<PinPad label="Masukkan PIN Admin" onSubmit={(pin)=>{
if(String(pin)===String(ADMIN_PIN)) nav('/admin/orders')
else alert('PIN salah')
}}/>
</div>
)
}