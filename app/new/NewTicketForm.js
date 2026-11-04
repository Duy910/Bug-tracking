"use client";

import { useActionState } from "react";
import { createTicket } from "../actions";

const Pick = ({ name, label, options, value }) => (
  <label>
    {label}
    <select id={name} name={name} defaultValue={value} required>
      {options.map((o) => (
        <option key={o.id} value={o.id}>{o.name}</option>
      ))}
    </select>
  </label>
);

export default function NewTicketForm({ platforms, types, priorities, members }) {
  const [state, action, pending] = useActionState(createTicket, null);
  return (
    <form className="form panel" action={action}>
      <label>
        Tiêu đề
        <input id="title" name="title" required maxLength={200} placeholder="VD: Nút “Lên lịch” bị che khi cửa sổ hẹp" />
      </label>
      <div className="row">
        <Pick name="platform" label="Nền tảng" options={platforms} value={platforms[0]?.id} />
        <Pick name="type" label="Loại" options={types} value={types[0]?.id} />
        <Pick name="priority" label="Mức ưu tiên" options={priorities} value="trung-binh" />
        <label>
          Giao cho
          <select id="assignee" name="assignee" defaultValue="">
            <option value="">Chưa giao</option>
            {members.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Màn hình / vị trí bị lỗi
        <input id="screen" name="screen" placeholder="VD: Soạn bài đăng X > thanh công cụ dưới" />
      </label>
      <label>
        Mô tả lỗi
        <textarea id="description" name="description" required placeholder="Bạn thấy gì sai?" />
      </label>
      <label>
        Các bước tái hiện
        <textarea id="steps" name="steps" placeholder={"1. Mở …\n2. Bấm …\n3. Thấy …"} />
      </label>
      <div className="row">
        <label>
          Kết quả mong đợi
          <input id="expected" name="expected" placeholder="Đúng ra phải thế nào?" />
        </label>
        <label>
          Thiết bị / trình duyệt
          <input id="device" name="device" placeholder="VD: Windows 10, Chrome 130" />
        </label>
      </div>
      <label>
        Ảnh chụp màn hình <span className="hint">Không bắt buộc. Tối đa 3 MB mỗi ảnh.</span>
        <input id="screenshots" name="screenshots" type="file" accept="image/png,image/jpeg,image/gif,image/webp" multiple />
      </label>
      {state?.error && <div className="error" role="alert">{state.error}</div>}
      <div>
        <button className="btn primary" type="submit" disabled={pending}>
          {pending ? "Đang lưu…" : "Tạo ticket"}
        </button>
      </div>
    </form>
  );
}
