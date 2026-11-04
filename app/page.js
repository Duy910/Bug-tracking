import Link from "next/link";
import Header from "./Header";
import { store } from "@/lib/store";
import { PLATFORMS, TYPES, STATUSES, PRIORITIES, byId, enabled } from "@/lib/config";
import Chips from "./Chips";

export const dynamic = "force-dynamic";

function Select({ name, label, value, options }) {
  return (
    <label>
      {label}
      <select id={`f-${name}`} name={name} defaultValue={value || ""}>
        <option value="">Tất cả</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
    </label>
  );
}

export default async function Board({ searchParams }) {
  const q = await searchParams;
  const view = q.view === "list" ? "list" : "board";
  let tickets = [];
  let error = null;
  try {
    tickets = await store().list();
  } catch (e) {
    error = e.message;
  }

  const shown = tickets
    .filter((t) => (!q.platform || t.platform === q.platform) && (!q.type || t.type === q.type))
    .filter((t) => (!q.priority || t.priority === q.priority) && (!q.status || t.status === q.status))
    .sort((a, b) => (byId(PRIORITIES, a.priority)?.rank ?? 9) - (byId(PRIORITIES, b.priority)?.rank ?? 9) || b.updatedAt.localeCompare(a.updatedAt));

  const keep = (extra) => {
    const p = new URLSearchParams(Object.entries({ ...q, ...extra }).filter(([, v]) => v));
    return `/?${p}`;
  };

  return (
    <>
      <Header />
      <main className="wrap">
        <div className="page-head">
          <h1>Bug &amp; yêu cầu</h1>
          <span className="who">{shown.length} / {tickets.length} ticket</span>
        </div>

        <form className="filters" action="/">
          <Select name="platform" label="Nền tảng" value={q.platform} options={enabled(PLATFORMS)} />
          <Select name="type" label="Loại" value={q.type} options={enabled(TYPES)} />
          <Select name="priority" label="Ưu tiên" value={q.priority} options={PRIORITIES} />
          <Select name="status" label="Trạng thái" value={q.status} options={STATUSES} />
          <input type="hidden" name="view" value={view} />
          <button className="btn" type="submit">Lọc</button>
          <Link className="btn ghost" href={`/?view=${view}`}>Bỏ lọc</Link>
          <div className="views">
            <Link className="btn" aria-pressed={view === "board"} href={keep({ view: "board" })}>Bảng</Link>
            <Link className="btn" aria-pressed={view === "list"} href={keep({ view: "list" })}>Danh sách</Link>
          </div>
        </form>

        {error && <p className="error" role="alert">Không tải được ticket từ GitHub: {error}</p>}

        {view === "board" ? (
          <div className="board">
            {STATUSES.filter((s) => !q.status || s.id === q.status).map((s) => {
              const col = shown.filter((t) => t.status === s.id);
              return (
                <section className="col" key={s.id}>
                  <h2>{s.name} <span>{col.length}</span></h2>
                  {col.length === 0 && <div className="empty">Không có ticket</div>}
                  {col.map((t) => (
                    <Link key={t.id} href={`/t/${t.id}`} className={`card prio-${t.priority}`}>
                      <span className="t">{t.title}</span>
                      <Chips t={t} />
                      <div className="meta">
                        {t.assignee ? `👤 ${t.assignee}` : "Chưa giao"}
                        {t.comments > 0 && <span>· 💬 {t.comments}</span>}
                      </div>
                    </Link>
                  ))}
                </section>
              );
            })}
          </div>
        ) : (
          <div className="tablewrap">
            <table>
              <thead>
                <tr><th>#</th><th>Tiêu đề</th><th>Trạng thái</th><th>Ưu tiên</th><th>Nền tảng</th><th>Loại</th><th>Người được giao</th><th>Cập nhật</th></tr>
              </thead>
              <tbody>
                {shown.map((t) => (
                  <tr key={t.id}>
                    <td className="num">{t.number}</td>
                    <td className="title"><Link href={`/t/${t.id}`}>{t.title}</Link></td>
                    <td>{byId(STATUSES, t.status)?.name}</td>
                    <td><span className={`chip prio prio-${t.priority}`}>{byId(PRIORITIES, t.priority)?.name || "–"}</span></td>
                    <td>{byId(PLATFORMS, t.platform)?.name || "–"}</td>
                    <td>{byId(TYPES, t.type)?.name || "–"}</td>
                    <td>{t.assignee || "–"}</td>
                    <td className="num">{new Date(t.updatedAt).toLocaleDateString("vi-VN")}</td>
                  </tr>
                ))}
                {shown.length === 0 && <tr><td colSpan={8}>Không có ticket khớp bộ lọc.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
