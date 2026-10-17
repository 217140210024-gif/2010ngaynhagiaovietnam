# Tiny — GitHub Pages

Bản triển khai tĩnh của website Tiny (Ngày 20/10).

## Cấu trúc

- `index.html` — trang chính; các hình ảnh/âm thanh nhúng dạng `data:` vẫn nằm trong HTML.
- `style.css` — giao diện và hoạt ảnh.
- `script.js` — tương tác và logic hoạt ảnh.
- `.nojekyll` — yêu cầu GitHub Pages không xử lý thư mục theo quy tắc Jekyll mặc định.

## Đưa lên GitHub Pages

1. Tạo repository mới hoặc dùng repository dành riêng cho bản này.
2. Tải **các file trong thư mục này** lên thư mục gốc của repository (không tải file ZIP vào repository để thay cho các file nguồn).
3. Vào **Settings → Pages**.
4. Chọn **Deploy from a branch**, chọn nhánh `main` và thư mục `/(root)`, rồi lưu.
5. Chờ GitHub Pages triển khai xong; mở URL Pages do GitHub cung cấp.
6. Kiểm tra trên cửa sổ ẩn danh và tải cứng bằng `Ctrl + F5`.

Giữ nguyên tên và vị trí tương đối của `index.html`, `style.css`, `script.js`. Không trộn các file cùng tên từ phiên bản cũ.

## Lưu ý dịch vụ chia sẻ

Website hiện vẫn dùng URL `https://20-10-vuive.kazvndc-edu.workers.dev/` làm URL chia sẻ. Đây là dịch vụ Cloudflare Workers bên ngoài, không được triển khai bởi GitHub Pages. Nếu địa chỉ này ngừng hoạt động hoặc bạn không có quyền quản lý worker, nút chia sẻ vẫn có thể sao chép một URL không còn truy cập được. Hãy cập nhật `SHARE_FLIGHT_URL` trong `script.js` và liên kết dự phòng `#share-copy-manual` trong `index.html` nếu muốn đổi sang URL GitHub Pages hoặc một endpoint khác.

## Kiểm thử

Đã kiểm tra cú pháp JavaScript bằng `node --check`, các liên kết tương đối tới CSS/JS và các đường dẫn tài nguyên trong HTML/CSS. Hình ảnh/âm thanh nhúng `data:` không cần upload riêng. Kiểm tra truy cập trực tiếp tới Cloudflare Worker không thực hiện được trong môi trường đóng mạng, nên cần xác minh URL đó sau khi triển khai.
