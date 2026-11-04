"use client";

import { pickName } from "./actions";

// Chọn "Bạn là ai" để ghi đúng tên người báo bug và người bình luận.
export default function NamePicker({ members, current }) {
  return (
    <form action={pickName} className="who" style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <label htmlFor="who-name" style={{ display: "inline" }}>Bạn là</label>
      <select
        key={current}
        id="who-name"
        name="name"
        defaultValue={current}
        style={{ width: "auto", padding: "5px 8px" }}
        onChange={(e) => e.currentTarget.form.requestSubmit()}
      >
        {members.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </form>
  );
}
