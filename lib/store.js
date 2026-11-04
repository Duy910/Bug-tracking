import { PLATFORMS, TYPES, STATUSES, PRIORITIES, byId, byLabel } from "./config";

// Hai nơi lưu dữ liệu, cùng một giao diện:
//  - GitHub Issues (khi có GITHUB_TOKEN và GITHUB_REPO): dữ liệu thật, dùng chung cả team.
//  - Demo trong bộ nhớ: chỉ để xem thử, mất khi server khởi động lại.

export const isDemo = () => !(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
export const store = () => (isDemo() ? demoStore : githubStore);

// ---------- Nội dung ticket <-> markdown ----------

export function composeBody(f) {
  const parts = [];
  if (f.screen) parts.push(`**Màn hình / vị trí:** ${f.screen}`);
  if (f.device) parts.push(`**Thiết bị / trình duyệt:** ${f.device}`);
  parts.push(`### Mô tả\n${f.description}`);
  if (f.steps) parts.push(`### Các bước tái hiện\n${f.steps}`);
  if (f.expected) parts.push(`### Kết quả mong đợi\n${f.expected}`);
  if (f.images?.length) parts.push(`### Ảnh chụp\n${f.images.map((u) => `![ảnh chụp](${u})`).join("\n")}`);
  parts.push(`_Người báo: ${f.author}_`);
  return parts.join("\n\n");
}

const authorFromBody = (body) => body?.match(/_Người báo: (.+?)_\s*$/m)?.[1] || null;
// Bình luận được ghi kèm tên người viết vì mọi thao tác đi qua cùng một token GitHub.
export const tagComment = (author, text) => `**[${author}]** ${text}`;
function splitComment(body, fallback) {
  const m = body.match(/^\*\*\[(.+?)\]\*\* ([\s\S]*)$/);
  return m ? { author: m[1], text: m[2] } : { author: fallback, text: body };
}

// ---------- GitHub Issues ----------

const API = "https://api.github.com";

async function gh(path, { method = "GET", body, accept } = {}) {
  const res = await fetch(`${API}/repos/${process.env.GITHUB_REPO}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: accept || "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub trả lỗi ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res;
}

function fromIssue(i) {
  const labels = i.labels.map((l) => (typeof l === "string" ? l : l.name));
  const status = i.state === "closed" ? "xong" : byLabel(STATUSES, labels)?.id || "moi";
  return {
    id: String(i.number),
    number: i.number,
    title: i.title,
    body: i.body || "",
    platform: byLabel(PLATFORMS, labels)?.id || null,
    type: byLabel(TYPES, labels)?.id || null,
    priority: byLabel(PRIORITIES, labels)?.id || null,
    status,
    assignee: i.assignees?.[0]?.login || null,
    author: authorFromBody(i.body) || i.user?.login,
    createdAt: i.created_at,
    updatedAt: i.updated_at,
    comments: i.comments,
  };
}

const githubStore = {
  async list() {
    const res = await gh("/issues?state=all&per_page=100&sort=updated");
    return (await res.json()).filter((i) => !i.pull_request).map(fromIssue);
  },
  async get(id) {
    const issue = await (await gh(`/issues/${Number(id)}`)).json();
    const comments = await (await gh(`/issues/${Number(id)}/comments?per_page=100`)).json();
    return {
      ...fromIssue(issue),
      history: comments.map((c) => ({
        id: String(c.id),
        at: c.created_at,
        ...splitComment(c.body || "", c.user?.login),
      })),
    };
  },
  async create(f) {
    const labels = [
      byId(PLATFORMS, f.platform)?.label,
      byId(TYPES, f.type)?.label,
      byId(PRIORITIES, f.priority)?.label,
      STATUSES[0].label,
    ].filter(Boolean);
    const res = await gh("/issues", {
      method: "POST",
      body: { title: f.title, body: composeBody(f), labels, assignees: f.assignee ? [f.assignee] : [] },
    });
    return String((await res.json()).number);
  },
  async setStatus(id, statusId, author) {
    const t = await this.get(id);
    const issue = await (await gh(`/issues/${Number(id)}`)).json();
    const keep = issue.labels.map((l) => l.name).filter((n) => !STATUSES.some((s) => s.label === n));
    const next = byId(STATUSES, statusId);
    await gh(`/issues/${Number(id)}`, {
      method: "PATCH",
      body: { labels: [...keep, next.label], state: statusId === "xong" ? "closed" : "open" },
    });
    await this.comment(id, author, `🔄 Chuyển trạng thái: ${byId(STATUSES, t.status)?.name} → ${next.name}`);
  },
  async setAssignee(id, login, author) {
    await gh(`/issues/${Number(id)}`, { method: "PATCH", body: { assignees: login ? [login] : [] } });
    await this.comment(id, author, login ? `👤 Giao cho ${login}` : "👤 Bỏ người được giao");
  },
  async comment(id, author, text) {
    await gh(`/issues/${Number(id)}/comments`, { method: "POST", body: { body: tagComment(author, text) } });
  },
  async saveImage(file) {
    const ext = (file.name.split(".").pop() || "png").replace(/[^a-z0-9]/gi, "").slice(0, 5) || "png";
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const content = Buffer.from(await file.arrayBuffer()).toString("base64");
    await gh(`/contents/${path}`, { method: "PUT", body: { message: `Ảnh chụp bug: ${path}`, content } });
    return `/api/image?path=${encodeURIComponent(path)}`;
  },
  async getImage(path) {
    if (!/^uploads\/[\w.-]+$/.test(path)) return null;
    const res = await gh(`/contents/${path}`, { accept: "application/vnd.github.raw+json" });
    return { bytes: await res.arrayBuffer(), type: guessType(path) };
  },
};

function guessType(path) {
  const ext = path.split(".").pop().toLowerCase();
  return { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp" }[ext] || "application/octet-stream";
}

// ---------- Demo trong bộ nhớ ----------

const g = globalThis;
g.__btDemo ||= seedDemo();
const db = g.__btDemo;

function seedDemo() {
  const h = (hoursAgo) => new Date(Date.now() - hoursAgo * 3600e3).toISOString();
  const mk = (n, title, priority, status, assignee, f, history) => ({
    id: String(n), number: n, title, platform: "x", type: "ui-ux", priority, status, assignee,
    author: "Duy910", createdAt: h(n * 20), updatedAt: h(n * 3), body: composeBody({ ...f, author: "Duy910" }),
    history: history.map(([who, text, ago], k) => ({ id: `${n}-${k}`, author: who, text, at: h(ago) })),
  });
  const tickets = [
    mk(1, "[Mẫu] Nút “Lên lịch” bị che một nửa khi cửa sổ hẹp", "cao", "moi", null,
      { screen: "Soạn bài đăng X > thanh công cụ dưới", device: "Windows 10, Chrome 130, 1366×768",
        description: "Khi cửa sổ trình duyệt hẹp hơn khoảng 1280px, nút “Lên lịch” bị đẩy ra ngoài khung và chỉ còn thấy một nửa.",
        steps: "1. Mở trang soạn bài đăng X\n2. Thu nhỏ cửa sổ xuống ~1200px\n3. Nhìn góc phải thanh công cụ",
        expected: "Thanh công cụ xuống dòng hoặc gom vào menu, nút luôn bấm được." }, []),
    mk(2, "[Mẫu] Bộ đếm ký tự sai khi bài có emoji", "trung-binh", "dang-sua", "Duy910",
      { screen: "Soạn bài đăng X > bộ đếm 280 ký tự", device: "macOS, Safari 18",
        description: "Mỗi emoji bị đếm 2 ký tự, trong khi X tính theo quy tắc riêng. Bộ đếm báo vượt 280 dù X vẫn cho đăng.",
        steps: "1. Gõ 270 ký tự chữ\n2. Thêm 6 emoji\n3. Bộ đếm báo 282/280 và khóa nút Đăng" },
      [["Duy910", "Đã tái hiện được. Đang chuyển sang đếm theo thư viện twitter-text.", 30]]),
    mk(3, "[Mẫu] Ảnh xem trước bị cắt lệch khi tỉ lệ 16:9", "cao", "cho-kiem-tra", "ban-cua-Duy",
      { screen: "Soạn bài đăng X > khung xem trước", description: "Ảnh ngang 16:9 bị cắt mất phần đầu người trong khung xem trước, khác với cách X hiển thị thật.",
        expected: "Khung xem trước cắt giống X (căn giữa)." },
      [["ban-cua-Duy", "🔄 Chuyển trạng thái: Đang sửa → Chờ kiểm tra", 5], ["ban-cua-Duy", "Đã sửa object-position. Nhờ Duy kiểm tra lại với ảnh 16:9 và 4:5.", 5]]),
    mk(4, "[Mẫu] Chế độ tối: chữ trong ô soạn thảo màu đen trên nền tối", "khan-cap", "moi", null,
      { screen: "Soạn bài đăng X (chế độ tối)", device: "Windows 11, Edge 130",
        description: "Bật chế độ tối thì chữ đang gõ gần như không đọc được.", steps: "1. Bật chế độ tối\n2. Mở trang soạn bài\n3. Gõ chữ" }, []),
    mk(5, "[Mẫu] Thông báo “Đăng thành công” không tự tắt", "thap", "xong", "Duy910",
      { screen: "Sau khi đăng bài X", description: "Toast thông báo đứng mãi, phải bấm X mới tắt." },
      [["Duy910", "Thêm tự tắt sau 4 giây.", 50], ["ban-cua-Duy", "Đã kiểm tra OK.", 40], ["ban-cua-Duy", "🔄 Chuyển trạng thái: Chờ kiểm tra → Xong", 40]]),
  ];
  return { tickets, next: 6, images: new Map() };
}

const now = () => new Date().toISOString();
const find = (id) => db.tickets.find((t) => t.id === String(id));

const demoStore = {
  async list() {
    return db.tickets.map(({ history, ...t }) => ({ ...t, comments: history.length }));
  },
  async get(id) {
    const t = find(id);
    return t ? structuredClone(t) : null;
  },
  async create(f) {
    const n = db.next++;
    db.tickets.push({
      id: String(n), number: n, title: f.title, body: composeBody(f), platform: f.platform, type: f.type,
      priority: f.priority, status: "moi", assignee: f.assignee || null, author: f.author,
      createdAt: now(), updatedAt: now(), history: [],
    });
    return String(n);
  },
  async setStatus(id, statusId, author) {
    const t = find(id);
    const from = byId(STATUSES, t.status)?.name;
    t.status = statusId;
    await this.comment(id, author, `🔄 Chuyển trạng thái: ${from} → ${byId(STATUSES, statusId).name}`);
  },
  async setAssignee(id, login, author) {
    find(id).assignee = login || null;
    await this.comment(id, author, login ? `👤 Giao cho ${login}` : "👤 Bỏ người được giao");
  },
  async comment(id, author, text) {
    const t = find(id);
    t.history.push({ id: `${id}-${t.history.length}-${Date.now()}`, author, text, at: now() });
    t.updatedAt = now();
  },
  async saveImage(file) {
    const key = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    db.images.set(key, { bytes: await file.arrayBuffer(), type: file.type || "image/png" });
    return `/api/image?path=${key}`;
  },
  async getImage(path) {
    return db.images.get(path) || null;
  },
};
