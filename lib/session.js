import { cookies } from "next/headers";
import { COOKIE, verifySession } from "./auth";

export async function currentUser() {
  return verifySession((await cookies()).get(COOKIE)?.value);
}
