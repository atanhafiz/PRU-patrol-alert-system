import { useState } from "react";
import { Power } from "lucide-react";

export default function GuardHome(){
  const [onDuty, setOnDuty] = useState(false);

  return (
    <div className="card card-hover bg-gradient-to-br from-white to-violet-50 anim-pop">
      <h2 className="text-lg font-bold">Guard – Status</h2>
      <p className="mt-1">
        Status semasa:{" "}
        {onDuty ? (
          <span className="badge badge-green">On Duty</span>
        ) : (
          <span className="badge badge-red">Off Duty</span>
        )}
      </p>
      <div className="flex gap-2 mt-2">
        <button
          className="btn btn-primary"
          onClick={() => setOnDuty(true)}
        >
          <Power className="w-4 h-4 mr-1" /> Start Duty
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => setOnDuty(false)}
        >
          End Duty
        </button>
      </div>
    </div>
  );
}
