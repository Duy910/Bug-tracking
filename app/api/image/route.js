import { store } from "@/lib/store";

// Trả ảnh chụp màn hình cho người đã đăng nhập (middleware đã kiểm tra cookie).
// Ảnh nằm trong repo private nên trình duyệt không tải trực tiếp từ GitHub được.
export async function GET(request) {
  const path = new URL(request.url).searchParams.get("path") || "";
  try {
    const img = await store().getImage(path);
    if (!img) return new Response("Không tìm thấy ảnh", { status: 404 });
    return new Response(img.bytes, {
      headers: { "Content-Type": img.type, "Cache-Control": "private, max-age=86400", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Không tải được ảnh", { status: 502 });
  }
}
