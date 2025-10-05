import { NavLink } from "react-router-dom";

export default function BottomNav({ items=[] }){
  return (
    <nav className="bottom-nav">
      {items.map((it)=> (
        <NavLink
          key={it.to}
          to={it.to}
          className={({isActive})=>`btn ${isActive? "btn-primary" : "btn-ghost"} w-full`}
        >
          {it.icon ? <it.icon className="w-4 h-4 mr-1" /> : null}
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}
