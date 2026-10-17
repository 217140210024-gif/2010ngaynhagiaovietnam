# Báo cáo kiểm tra trước khi triển khai

## Kết quả

- `index.html`, `style.css`, `script.js` được đặt cùng thư mục gốc.
- HTML tham chiếu tương đối tới `style.css` và `script.js`; cả hai file tồn tại.
- Các hình ảnh trong HTML đang nhúng bằng `data:image/...;base64,...`; không cần file ảnh riêng cho các hình đó.
- Không phát hiện đường dẫn tài nguyên cục bộ bổ sung trong thuộc tính `src`/`href` của HTML ngoài hai file trên; liên kết còn lại là liên kết chia sẻ bên ngoài.
- CSS không có URL ảnh/font HTTP bên ngoài trong các khai báo `url(...)`; các `url(#...)` là tham chiếu gradient/filter nội bộ SVG.
- `node --check script.js` thành công.
- Logic sao chép dùng `navigator.clipboard.writeText()` khi có hỗ trợ và fallback `document.execCommand('copy')`; khi sao chép thành công, code hiện tại không hiện toast thành công. Khi thất bại, trang hiện thông báo cùng liên kết để người dùng sao chép thủ công.

## Điểm cần lưu ý

- `https://20-10-vuive.kazvndc-edu.workers.dev/` xuất hiện trong `script.js` và liên kết dự phòng trong `index.html`. Đây là phụ thuộc bên ngoài; không thể xác nhận trạng thái hoạt động của endpoint trong lần kiểm tra này do môi trường không phân giải được DNS/không có kết nối mạng.
- `script.js` còn một số tham chiếu tới ID thuộc giao diện cửa hàng cũ đã bị loại khỏi HTML (ví dụ `shop-modal-*`, `shop-coming-note`). Một số khối có kiểm tra phần tử trước khi chạy, nhưng không nên xóa hàng loạt các hàm cũ nếu chưa kiểm thử luồng trang thực tế. Bản này giữ nguyên JavaScript mới nhất để giảm nguy cơ làm hỏng hoạt ảnh.
- Có một số font-family dự phòng trong CSS. Font `Courier New` được khai báo ở các phần đã chỉnh; các font khác có thể còn ở những cảnh khác của website. Điều này không cản trở GitHub Pages triển khai.
- Kiểm tra tĩnh không thay thế việc mở thử website sau khi triển khai trên GitHub Pages.
