import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../Header";
import Chips from "../../Chips";
import { store } from "@/lib/store";
import { STATUSES, byId, teamMembers } from "@/lib/config";
import { setStatus, setAssignee, addComment } from "../../actions";

export const dynamic = "force-dynamic";

// Hiển thị nội dung ticket: tiêu đề nhỏ (###), in đậm (**…**) và ảnh (![…](url)).
function Bold({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <b key={i}>{part.slice(2, -2)}</b> : part
  );
}

function safeImage(url) {
  return url.startsWith("/api/image?") ? url : null;
}

function Body({ text }) {
  const blocks = [];
  let para = [];
  const flush = () => {
    if (para.length) blocks.push(<p key={blocks.length}><Bold text={para.join("\n").replace(/^_|_$/g, "")} /></p>);
    para = [];
  };
  for (const line of text.split("\n")) {
    const img = line.match(/^!\[[^\]]*\]\(([^)]+)\)\s*$/);
    if (line.startsWith("### ")) {
      flush();
      blocks.push(<h4 key={blocks.length}>{line.slice(4)}</h4>);
    } else if (img) {
      flush();
      const src = safeImage(img[1]);
      blocks.push(
        src ? (
          <a key={blocks.length} href={src} target="_blank" rel="noreferrer"><img src={src} alt="Ảnh chụp màn hình" /></a>
        ) : (
          <a key={blocks.length} href={img[1]} target="_blank" rel="noreferrer">Ảnh đính kèm (mở trên GitHub)</a>
        )
      );
    } else if (line.trim() === "") {
      flush();
    } else {
      para.push(line);
    }
  }
  flush();
  return <div className="body">{blocks}</div>;
}

const when = (iso) => new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

export default async function TicketPage({ params }) {
  const { id } = await params;
  let t;
  try {
    t = await store().get(id);
  } catch {
    t = null;
  }
  if (!t) notFound();
  const members = teamMembers();

  return (
    <>
      <Header />
      <main className="wrap">
        <p><Link href="/" className="btn ghost">← Về bảng</Link></p>
        <div className="page-head">
          <h1>{t.title}</h1>
        </div>
        <div className="detail">
          <div className="side">
            <section className="panel">
              <Chips t={t} />
              <Body text={t.body} />
            </section>
            <section className="panel">
            <h2>Tiến độ &amp; bình luận</h2>
            {t.history.length === 0 && <p className="who">Chưa có cập nhật nào.</p>}
            <ol className="history">
              {t.history.map((h) => {
                const sys = /^(🔄|👤)/.test(h.text);
                return (
                  <li key={h.id} className={sys ? "sys" : ""}>
                    <span className="who-line"><b>{h.author}</b> · {when(h.at)}</span>
                    <p>{h.text}</p>
                  </li>
                );
              })}
            </ol>
            <form action={addComment.bind(null, t.id)} style={{ display: "grid", gap: 8 }}>
              <label>
                Cập nhật tiến độ
                <textarea id="comment" name="comment" required placeholder="VD: Đã tìm ra nguyên nhân, đang sửa CSS của thanh công cụ…" />
              </label>
              <div><button className="btn primary" type="submit">Gửi cập nhật</button></div>
            </form>
          </section>
          </div>
          <aside className="side">
            <section className="panel">
              <h2>Trạng thái: {byId(STATUSES, t.status)?.name}</h2>
              <form action={setStatus.bind(null, t.id)} className="status-btns">
                {STATUSES.map((s) => (
                  <button key={s.id} className="btn" name="status" value={s.id} aria-pressed={s.id === t.status} disabled={s.id === t.status}>
                    {s.name}
                  </button>
                ))}
              </form>
            </section>
            <section className="panel">
              <form action={setAssignee.bind(null, t.id)} style={{ display: "grid", gap: 8 }}>
                <label>
                  Người được giao
                  <select id="assignee" name="assignee" defaultValue={t.assignee || ""}>
                    <option value="">Chưa giao</option>
                    {members.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </label>
                <button className="btn" type="submit">Lưu người được giao</button>
              </form>
              <dl>
                <dt>Người báo</dt><dd>{t.author || "–"}</dd>
                <dt>Tạo lúc</dt><dd>{when(t.createdAt)}</dd>
                <dt>Cập nhật</dt><dd>{when(t.updatedAt)}</dd>
              </dl>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
