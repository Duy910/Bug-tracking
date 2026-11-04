import { cookies } from "next/headers";
import { COOKIE, verifySession } from "./auth";
import { loginEnabled, teamMembers } from "./config";

// Khi tắt đăng nhập, tên người dùng chỉ là lựa chọn trên thanh đầu (lưu trong cookie, không có mật khẩu).
export const NAME_COOKIE = "bt_name";

export async function currentUser() {
  const jar = await cookies();
  if (loginEnabled()) return verifySession(jar.get(COOKIE)?.value);
  const members = teamMembers();
  const picked = jar.get(NAME_COOKIE)?.value;
  return members.includes(picked) ? picked : members[0];
}
