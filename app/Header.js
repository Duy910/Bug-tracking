import Link from "next/link";
import { logout } from "./actions";
import { currentUser } from "@/lib/session";
import { isDemo } from "@/lib/store";

export default async function Header() {
  const user = await currentUser();
  return (
    <>
      {isDemo() && (
        <div className="demo">
          Chế độ demo: dữ liệu mẫu, lưu tạm trong bộ nhớ. Nối GitHub (GITHUB_TOKEN, GITHUB_REPO) để lưu thật.
        </div>
      )}
      <header className="top">
        <div className="wrap">
          <Link href="/" className="brand">
            Bug tracker <small>Media tool</small>
          </Link>
          <nav>
            <Link href="/new" className="btn primary">+ Báo bug</Link>
            <span className="who">{user}</span>
            <form action={logout}>
              <button className="btn ghost" type="submit">Đăng xuất</button>
            </form>
          </nav>
        </div>
      </header>
    </>
  );
}
