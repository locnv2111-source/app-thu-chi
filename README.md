# Sổ Thu Chi

App quản lý thu chi bằng React + Vite. Bản đầu có tổng quan số dư, thêm/sửa/xóa giao dịch, danh mục tùy chỉnh, lưu LocalStorage, lọc theo tháng/loại giao dịch và ngân sách tháng.

Giao dịch có thể đồng bộ trực tuyến qua Supabase. Tạo `.env.local` từ `.env.example` rồi điền Project URL và Publishable key. Giao dịch được lưu trên Supabase; danh mục và ngân sách vẫn lưu cục bộ trên từng thiết bị.

## Chạy trên máy

Yêu cầu Node.js và npm. Mở terminal tại thư mục này, chạy:

```bash
npm install
npm run dev
```

Mở địa chỉ được Vite in ra trong terminal (thường là `http://localhost:5173`).

Sau khi tạo `.env.local`, hãy khởi động lại máy chủ Vite để nạp cấu hình Supabase.

## Lưu ý về dữ liệu

Danh mục và ngân sách lưu trong LocalStorage của trình duyệt hiện tại. Giao dịch lưu trong Supabase và được chia sẻ công khai theo các chính sách database đã cấu hình. Với cấu hình thử nghiệm công khai, bất kỳ ai cũng có thể xem, thêm, sửa hoặc xóa giao dịch.

## Đưa lên GitHub Pages

Đẩy thư mục dự án lên GitHub, vào **Settings → Pages**, chọn **GitHub Actions**. Có thể thêm workflow Vite để build và xuất bản; cấu hình xuất bản sẽ cần đặt `base` trong `vite.config.js` theo tên repository.

Để app đã xuất bản kết nối Supabase, thêm hai repository variables trong **Settings → Secrets and variables → Actions → Variables**: `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY`.
