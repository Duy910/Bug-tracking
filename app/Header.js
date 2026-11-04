import Link from "next/link";
import { logout } from "./actions";
import NamePicker from "./NamePicker";
import { currentUser } from "@/lib/session";
import { isDemo } from "@/lib/store";
import { loginEnabled, teamMembers } from "@/lib/config";

export default async function Header() {
  const user = await currentUser();
  const login = loginEnabled();
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
            {login ? (
              <>
                <span className="who">{user}</span>
                <form action={logout}>
                  <button className="btn ghost" type="submit">Đăng xuất</button>
                </form>
              </>
            ) : (
              <NamePicker members={teamMembers()} current={user} />
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
