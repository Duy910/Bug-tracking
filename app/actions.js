"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { COOKIE, checkPassword, signSession } from "@/lib/auth";
import { currentUser } from "@/lib/session";
import { store } from "@/lib/store";
import { PLATFORMS, TYPES, STATUSES, PRIORITIES, byId, enabled, teamMembers } from "@/lib/config";

export async function login(_prev, form) {
  if (!process.env.APP_PASSWORD) return { error: "Server chưa cài mật khẩu (biến APP_PASSWORD)." };
  const name = String(form.get("name") || "");
  if (!teamMembers().includes(name)) return { error: "Hãy chọn tên của bạn." };
  if (!(await checkPassword(String(form.get("password") || "")))) return { error: "Sai mật khẩu. Thử lại." };
  (await cookies()).set(COOKIE, await signSession(name), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/");
}

export async function logout() {
  (await cookies()).delete(COOKIE);
  redirect("/login");
}

async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}

const text = (form, key, max = 5000) => String(form.get(key) || "").trim().slice(0, max);

export async function createTicket(_prev, form) {
  const author = await requireUser();
  const f = {
    title: text(form, "title", 200),
    screen: text(form, "screen", 300),
    description: text(form, "description"),
    steps: text(form, "steps"),
    expected: text(form, "expected"),
    device: text(form, "device", 300),
    platform: text(form, "platform"),
    type: text(form, "type"),
    priority: text(form, "priority"),
    assignee: text(form, "assignee"),
    author,
    images: [],
  };
  if (!f.title || !f.description) return { error: "Cần có tiêu đề và mô tả lỗi." };
  if (!byId(enabled(PLATFORMS), f.platform) || !byId(enabled(TYPES), f.type) || !byId(PRIORITIES, f.priority)) {
    return { error: "Nền tảng, loại hoặc mức ưu tiên không hợp lệ." };
  }
  if (f.assignee && !teamMembers().includes(f.assignee)) f.assignee = "";

  let id;
  try {
    for (const file of form.getAll("screenshots")) {
      if (!file || typeof file === "string" || file.size === 0) continue;
      if (!file.type.startsWith("image/")) return { error: "Ảnh chụp phải là file ảnh (png, jpg, gif, webp)." };
      if (file.size > 3 * 1024 * 1024) return { error: `Ảnh “${file.name}” lớn hơn 3 MB. Hãy chụp nhỏ lại.` };
      f.images.push(await store().saveImage(file));
    }
    id = await store().create(f);
  } catch (e) {
    return { error: `Không lưu được ticket: ${e.message}` };
  }
  revalidatePath("/");
  redirect(`/t/${id}`);
}

export async function setStatus(id, form) {
  const author = await requireUser();
  const status = text(form, "status");
  if (!byId(STATUSES, status)) return;
  await store().setStatus(id, status, author);
  revalidatePath(`/t/${id}`);
  revalidatePath("/");
}

export async function setAssignee(id, form) {
  const author = await requireUser();
  const login = text(form, "assignee");
  if (login && !teamMembers().includes(login)) return;
  await store().setAssignee(id, login, author);
  revalidatePath(`/t/${id}`);
  revalidatePath("/");
}

export async function addComment(id, form) {
  const author = await requireUser();
  const body = text(form, "comment");
  if (!body) return;
  await store().comment(id, author, body);
  revalidatePath(`/t/${id}`);
}
