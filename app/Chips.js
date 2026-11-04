import { PLATFORMS, TYPES, PRIORITIES, byId } from "@/lib/config";

export default function Chips({ t }) {
  const p = byId(PRIORITIES, t.priority);
  return (
    <div className="meta">
      <span className="num">#{t.number}</span>
      {p && <span className={`chip prio prio-${p.id}`}>{p.name}</span>}
      {byId(PLATFORMS, t.platform) && <span className="chip">{byId(PLATFORMS, t.platform).name}</span>}
      {byId(TYPES, t.type) && <span className="chip">{byId(TYPES, t.type).name}</span>}
    </div>
  );
}
