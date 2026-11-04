"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginForm({ members }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action}>
      <h1>Bug tracker</h1>
      <p>Trang nội bộ của team media tool. Nhập mật khẩu để vào.</p>
      <label>
        Bạn là ai?
        <select id="name" name="name" defaultValue={members[0]} required>
          {members.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </label>
      <label>
        Mật khẩu
        <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
      </label>
      {state?.error && <div className="error" role="alert">{state.error}</div>}
      <button className="btn primary" type="submit" disabled={pending}>
        {pending ? "Đang kiểm tra…" : "Vào trang"}
      </button>
    </form>
  );
}
