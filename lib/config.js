// Danh mục của bug tracker. Muốn mở rộng (Facebook, TikTok, loại việc mới)
// chỉ cần đổi `enabled: true` hoặc thêm một dòng mới ở đây.
// `label` là tên nhãn trên GitHub Issues: giữ đúng như README.

export const PLATFORMS = [
  { id: "x", name: "X", label: "nền tảng: X", enabled: true },
  { id: "facebook", name: "Facebook", label: "nền tảng: Facebook", enabled: false },
  { id: "tiktok", name: "TikTok", label: "nền tảng: TikTok", enabled: false },
];

export const TYPES = [
  { id: "ui-ux", name: "UI/UX", label: "loại: UI/UX", enabled: true },
  { id: "luong", name: "Luồng tính năng", label: "loại: luồng tính năng", enabled: false },
  { id: "yeu-cau", name: "Yêu cầu thay đổi", label: "loại: yêu cầu thay đổi", enabled: false },
];

export const STATUSES = [
  { id: "moi", name: "Mới", label: "trạng thái: Mới" },
  { id: "dang-sua", name: "Đang sửa", label: "trạng thái: Đang sửa" },
  { id: "cho-kiem-tra", name: "Chờ kiểm tra", label: "trạng thái: Chờ kiểm tra" },
  { id: "xong", name: "Xong", label: "trạng thái: Xong" },
];

export const PRIORITIES = [
  { id: "khan-cap", name: "Khẩn cấp", label: "ưu tiên: khẩn cấp", rank: 0 },
  { id: "cao", name: "Cao", label: "ưu tiên: cao", rank: 1 },
  { id: "trung-binh", name: "Trung bình", label: "ưu tiên: trung bình", rank: 2 },
  { id: "thap", name: "Thấp", label: "ưu tiên: thấp", rank: 3 },
];

export const enabled = (list) => list.filter((i) => i.enabled !== false);
export const byId = (list, id) => list.find((i) => i.id === id);
export const byLabel = (list, labels) => list.find((i) => labels.includes(i.label));

// Đăng nhập bằng mật khẩu: TẠM TẮT. Muốn bật lại, đặt biến môi trường LOGIN_ENABLED=true
// (và APP_PASSWORD). Khi tắt, ai có link đều xem và sửa được ticket.
export const loginEnabled = () => process.env.LOGIN_ENABLED === "true";

// Thành viên team: tên đăng nhập GitHub, cách nhau bằng dấu phẩy.
export function teamMembers() {
  const raw = process.env.TEAM_MEMBERS || "Duy910,ban-cua-Duy";
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}
