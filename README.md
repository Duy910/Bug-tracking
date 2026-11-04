# Bug tracker – Media tool (X / Facebook / TikTok)

Quản lý bug bằng **GitHub Issues** trong một **repo riêng tư (private)**.
Chỉ người được mời mới xem được. Muốn vào thì phải đăng nhập GitHub, và đó chính là bước "xác nhận mật khẩu".

Giai đoạn 1: chỉ báo **bug UI/UX trên X**. Facebook, TikTok và các loại việc khác sẽ thêm sau (xem mục cuối).

---

## Cài đặt lần đầu (chỉ làm 1 lần, khoảng 10 phút)

### 1. Tạo repo riêng tư
1. Đăng nhập https://github.com và bấm **New repository**.
2. Đặt tên, ví dụ `media-tool-bugs`, rồi chọn **Private**.
3. Bấm **Create repository**.

### 2. Đưa thư mục này lên repo
Cách dễ nhất là dùng giao diện web:
- Trong repo vừa tạo, bấm **uploading an existing file**.
- Kéo cả thư mục `.github` và file `README.md` vào, rồi bấm **Commit changes**.

> Lưu ý: Windows Explorer có thể ẩn thư mục `.github`. Nếu không thấy, vào **View → Show → Hidden items**.

### 3. Tạo nhãn (Labels)
Vào repo, chọn **Issues → Labels → New label** rồi tạo các nhãn sau. Màu tùy ý, nhưng **tên phải gõ đúng y hệt**, vì mẫu báo bug tự gắn nhãn theo tên:

| Nhãn | Dùng cho |
|---|---|
| `nền tảng: X` | Bug trên X |
| `loại: UI/UX` | Lỗi giao diện / trải nghiệm |
| `ưu tiên: khẩn cấp` | Chặn công việc |
| `ưu tiên: cao` | |
| `ưu tiên: trung bình` | |
| `ưu tiên: thấp` | |

### 4. Tạo bảng trạng thái (Project board)
1. Vào repo, chọn tab **Projects → New project → Board**.
2. Sửa các cột thành: **Mới → Đang sửa → Chờ kiểm tra → Xong**.
3. Trong project, mở **⋯ → Workflows → Auto-add to project**. Bật workflow này cho repo để mọi issue mới tự vào cột **Mới**.
4. Bật luôn workflow **Item closed**, để issue đóng xong tự chuyển sang **Xong**.

### 5. Mời bạn của bạn
Vào **Settings → Collaborators → Add people**, nhập username GitHub của bạn ấy.
Bạn ấy cần có tài khoản GitHub và bấm chấp nhận lời mời trong email.

---

## Dùng hằng ngày

| Muốn làm gì | Cách làm |
|---|---|
| **Báo bug** | **Issues → New issue → 🐞 Bug UI/UX – X**, điền form, dán ảnh chụp rồi bấm Submit |
| **Nhận sửa** | Mở issue, ở **Assignees** chọn mình. Trên board, kéo thẻ sang **Đang sửa** |
| **Cập nhật tiến độ** | Viết bình luận trong issue. GitHub tự giữ lịch sử ai làm gì, lúc nào |
| **Sửa xong, nhờ kiểm tra** | Kéo thẻ sang **Chờ kiểm tra**, gắn tên người báo bug vào bình luận (`@tên`) |
| **Đã kiểm tra OK** | Bấm **Close issue**, thẻ tự sang **Xong** |
| **Lọc** | Ở danh sách Issues, bấm **Labels** để lọc theo nền tảng, loại, ưu tiên. Lọc theo trạng thái thì dùng board |

---

## Mở rộng sau này

- **Thêm Facebook / TikTok**: tạo nhãn `nền tảng: Facebook` và `nền tảng: TikTok`. Sau đó copy file `.github/ISSUE_TEMPLATE/bug-ui-ux-x.yml` thành `bug-ui-ux-facebook.yml` và đổi tên, tiêu đề, nhãn bên trong.
- **Thêm loại việc**, ví dụ lỗi luồng tính năng hay yêu cầu thay đổi: tạo nhãn `loại: luồng tính năng` hoặc `loại: yêu cầu thay đổi`, rồi thêm một file mẫu mới vào cùng thư mục.
- Mỗi file `.yml` trong `.github/ISSUE_TEMPLATE/` sẽ hiện thành một lựa chọn khi bấm **New issue**.
